import { getDb, queryOne, queryAll } from '../db';
import crypto from 'node:crypto';
import { gradeAttempt, type GradedResult } from './scoringService';

export interface StartAttemptResponse {
  attemptUuid: string;
  packageTitle: string;
  category: string;
  durationMinutes: number;
  totalQuestions: number;
  serverTime: string;
  startedAt: string;
  expiresAt: string;
  remainingSeconds: number;
  questions: Array<{
    id: number;
    sequenceOrder: number;
    subjectId: string;
    subtestCode: string;
    subtestName: string;
    stimulusText?: string | null;
    questionText: string;
    mediaUrl?: string | null;
    options: Array<{
      key: string;
      text: string;
      mediaUrl?: string | null;
    }>;
  }>;
  existingAnswers?: Record<number, { selectedKey: string | null; isDoubtful: boolean }>;
}

export class ExamService {
  /**
   * Memulai atau melanjutkan sesi ujian attempt
   */
  static startAttempt(packageSlug: string, userId: number): StartAttemptResponse {
    // 1. Resolve user ID to valid examinee
    let validUserId = userId;
    const userExists = queryOne('SELECT id FROM users WHERE id = ?', [userId]);
    if (!userExists) {
      const defaultUser = queryOne<{ id: number }>('SELECT id FROM users WHERE role_id = ? LIMIT 1', ['examinee']) 
        || queryOne<{ id: number }>('SELECT id FROM users LIMIT 1');
      if (defaultUser) {
        validUserId = defaultUser.id;
      } else {
        throw new Error('Peserta tidak valid atau belum terdaftar.');
      }
    }

    // 2. Ambil paket ujian
    const pkg = queryOne(`
      SELECT p.*, sr.rules_json as scoring_rule_json, sr.name as scoring_rule_name, c.name as category_name
      FROM exam_packages p
      JOIN scoring_rules sr ON p.scoring_rule_id = sr.id
      JOIN exam_categories c ON p.category_id = c.id
      WHERE p.slug = ? AND p.status = 'published'
    `, [packageSlug]);

    if (!pkg) {
      throw new Error(`Paket ujian '${packageSlug}' tidak ditemukan atau belum dipublikasikan.`);
    }

    const now = new Date();

    // 3. Cek apakah ada attempt yang masih berjalan ('in_progress') untuk user ini
    const activeAttempt = queryOne(`
      SELECT * FROM exam_attempts
      WHERE user_id = ? AND package_id = ? AND status = 'in_progress'
      ORDER BY id DESC LIMIT 1
    `, [validUserId, pkg.id]);

    if (activeAttempt) {
      const expiresAt = new Date(activeAttempt.expires_at);
      if (expiresAt > now) {
        // Attempt masih aktif dan belum kadaluarsa -> Lanjutkan attempt ini
        const remainingSeconds = Math.max(0, Math.round((expiresAt.getTime() - now.getTime()) / 1000));
        const questionsSnapshot = JSON.parse(activeAttempt.questions_snapshot);

        // Ambil jawaban yang sudah pernah disimpan
        const savedAnswers = queryAll(`
          SELECT question_id, selected_option_key, is_doubtful
          FROM attempt_answers
          WHERE attempt_id = ?
        `, [activeAttempt.id]);

        const answersObj: Record<number, { selectedKey: string | null; isDoubtful: boolean }> = {};
        for (const a of savedAnswers) {
          answersObj[a.question_id] = {
            selectedKey: a.selected_option_key,
            isDoubtful: a.is_doubtful === 1
          };
        }

        return {
          attemptUuid: activeAttempt.uuid,
          packageTitle: pkg.title,
          category: pkg.category_name,
          durationMinutes: pkg.duration_minutes,
          totalQuestions: questionsSnapshot.length,
          serverTime: now.toISOString(),
          startedAt: activeAttempt.started_at,
          expiresAt: activeAttempt.expires_at,
          remainingSeconds,
          questions: questionsSnapshot,
          existingAnswers: answersObj
        };
      } else {
        // Waktu sudah lewat -> Auto submit attempt lama
        this.finishAttempt(activeAttempt.uuid, userId, true);
      }
    }

    // 3. Buat attempt baru
    const durationMs = pkg.duration_minutes * 60 * 1000;
    const startedAt = now.toISOString();
    const expiresAt = new Date(now.getTime() + durationMs).toISOString();
    const attemptUuid = `atm-${crypto.randomUUID()}`;

    // Ambil daftar butir soal dari paket (HANYA teks soal dan opsi TANPA kunci jawaban)
    const questionsRows = queryAll(`
      SELECT 
        q.id,
        pq.sequence_order,
        q.subject_id,
        s.code as subtest_code,
        s.name as subtest_name,
        q.stimulus_text,
        q.question_text,
        q.media_url
      FROM package_questions pq
      JOIN questions q ON pq.question_id = q.id
      JOIN subjects s ON q.subject_id = s.id
      WHERE pq.package_id = ?
      ORDER BY pq.sequence_order ASC
    `, [pkg.id]);

    if (questionsRows.length === 0) {
      throw new Error(`Paket ujian '${pkg.title}' belum memiliki butir soal aktif.`);
    }

    const questionIds = questionsRows.map((q) => q.id);
    const placeholders = questionIds.map(() => '?').join(',');

    // Ambil opsi pilihan jawaban (HANYA key dan text, TIDAK mengambil is_correct atau score_weight)
    const optionsRows = queryAll(`
      SELECT question_id, option_key, option_text, media_url
      FROM question_options
      WHERE question_id IN (${placeholders})
      ORDER BY question_id ASC, option_key ASC
    `, questionIds);

    const optionsByQuestion = new Map<number, Array<{ key: string; text: string; mediaUrl?: string | null }>>();
    for (const opt of optionsRows) {
      if (!optionsByQuestion.has(opt.question_id)) {
        optionsByQuestion.set(opt.question_id, []);
      }
      optionsByQuestion.get(opt.question_id)!.push({
        key: opt.option_key,
        text: opt.option_text,
        mediaUrl: opt.media_url
      });
    }

    // Susun snapshot soal aman tanpa kunci
    const sanitizedQuestions = questionsRows.map((q) => ({
      id: q.id,
      sequenceOrder: q.sequence_order,
      subjectId: q.subject_id,
      subtestCode: q.subtest_code,
      subtestName: q.subtest_name,
      stimulusText: q.stimulus_text,
      questionText: q.question_text,
      mediaUrl: q.media_url,
      options: optionsByQuestion.get(q.id) || []
    }));

    const db = getDb();
    db.prepare(`
      INSERT INTO exam_attempts (
        uuid, user_id, package_id, scoring_rule_snapshot, questions_snapshot,
        started_at, expires_at, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'in_progress')
    `).run(
      attemptUuid,
      validUserId,
      pkg.id,
      pkg.scoring_rule_json,
      JSON.stringify(sanitizedQuestions),
      startedAt,
      expiresAt
    );

    return {
      attemptUuid,
      packageTitle: pkg.title,
      category: pkg.category_name,
      durationMinutes: pkg.duration_minutes,
      totalQuestions: sanitizedQuestions.length,
      serverTime: now.toISOString(),
      startedAt,
      expiresAt,
      remainingSeconds: Math.round(durationMs / 1000),
      questions: sanitizedQuestions,
      existingAnswers: {}
    };
  }

  /**
   * Menyimpan jawaban peserta dengan validasi timer dan sequence
   */
  static saveAnswer(
    attemptUuid: string,
    questionId: number,
    selectedOptionKey: string | null,
    isDoubtful: boolean,
    clientSequence: number = 1
  ): { success: boolean; isExpired: boolean; savedAt: string } {
    const db = getDb();
    const now = new Date();

    const attempt = queryOne(`
      SELECT id, status, expires_at FROM exam_attempts WHERE uuid = ?
    `, [attemptUuid]);

    if (!attempt) {
      throw new Error('Attempt ujian tidak valid');
    }

    if (attempt.status !== 'in_progress') {
      return { success: false, isExpired: true, savedAt: now.toISOString() };
    }

    // Periksa apakah waktu ujian server sudah habis
    if (new Date(attempt.expires_at) <= now) {
      this.finishAttempt(attemptUuid, 0, true);
      return { success: false, isExpired: true, savedAt: now.toISOString() };
    }

    // Simpan jawaban (Idempotent UPSERT)
    db.prepare(`
      INSERT INTO attempt_answers (attempt_id, question_id, selected_option_key, is_doubtful, client_sequence, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(attempt_id, question_id) DO UPDATE SET
        selected_option_key = excluded.selected_option_key,
        is_doubtful = excluded.is_doubtful,
        client_sequence = excluded.client_sequence,
        updated_at = excluded.updated_at
      WHERE excluded.client_sequence >= attempt_answers.client_sequence
    `).run(
      attempt.id,
      questionId,
      selectedOptionKey,
      isDoubtful ? 1 : 0,
      clientSequence,
      now.toISOString()
    );

    return { success: true, isExpired: false, savedAt: now.toISOString() };
  }

  /**
   * Mengakhiri ujian dan menghitung nilai secara otoritatif di server
   */
  static finishAttempt(attemptUuid: string, userId: number, isAutoSubmit: boolean = false): GradedResult {
    const db = getDb();
    const now = new Date().toISOString();

    const attempt = queryOne(`
      SELECT id, status FROM exam_attempts WHERE uuid = ?
    `, [attemptUuid]);

    if (!attempt) {
      throw new Error('Attempt tidak ditemukan');
    }

    // Jika sudah di-grade, return result yang sudah ada (Idempotent)
    if (attempt.status === 'graded') {
      const existingResult = queryOne(`
        SELECT * FROM exam_results WHERE attempt_id = ?
      `, [attempt.id]);
      if (existingResult) {
        return {
          totalScore: existingResult.total_score,
          maxPossibleScore: existingResult.max_possible_score,
          isPassed: existingResult.is_passed === 1,
          subtestScores: JSON.parse(existingResult.category_scores),
          correctCount: existingResult.correct_count,
          wrongCount: existingResult.wrong_count,
          unansweredCount: existingResult.unanswered_count,
          accuracyPercent: existingResult.accuracy_percent,
          recommendations: JSON.parse(existingResult.recommendations_json || '[]')
        };
      }
    }

    // Update status attempt
    const finalStatus = isAutoSubmit ? 'auto_submitted' : 'submitted';
    db.prepare(`
      UPDATE exam_attempts
      SET status = ?, finished_at = ?
      WHERE id = ?
    `).run(finalStatus, now, attempt.id);

    // Hitung skor secara otoritatif di server
    const graded = gradeAttempt(attempt.id);

    // Set status ke graded
    db.prepare(`
      UPDATE exam_attempts SET status = 'graded' WHERE id = ?
    `).run(attempt.id);

    return graded;
  }

  /**
   * Mengambil hasil skor lengkap sebuah attempt
   */
  static getAttemptResult(attemptUuid: string) {
    const result = queryOne(`
      SELECT 
        r.*,
        a.uuid as attempt_uuid,
        a.started_at,
        a.finished_at,
        p.title as package_title,
        p.slug as package_slug,
        c.name as category_name,
        u.email as user_email,
        prof.full_name as user_name
      FROM exam_results r
      JOIN exam_attempts a ON r.attempt_id = a.id
      JOIN exam_packages p ON r.package_id = p.id
      JOIN exam_categories c ON p.category_id = c.id
      JOIN users u ON r.user_id = u.id
      LEFT JOIN user_profiles prof ON u.id = prof.user_id
      WHERE a.uuid = ?
    `, [attemptUuid]);

    if (!result) return null;

    return {
      ...result,
      is_passed: result.is_passed === 1,
      category_scores: JSON.parse(result.category_scores),
      recommendations: JSON.parse(result.recommendations_json || '[]')
    };
  }

  /**
   * Mengambil kunci jawaban dan pembahasan butir soal setelah ujian selesai
   */
  static getAttemptExplanation(attemptUuid: string) {
    const attempt = queryOne(`
      SELECT id, status, questions_snapshot FROM exam_attempts WHERE uuid = ?
    `, [attemptUuid]);

    if (!attempt || attempt.status !== 'graded') {
      throw new Error('Pembahasan hanya dapat diakses setelah attempt ujian selesai di-grade.');
    }

    const questionsSnapshot = JSON.parse(attempt.questions_snapshot);
    const questionIds = questionsSnapshot.map((q: any) => q.id);
    const placeholders = questionIds.map(() => '?').join(',');

    // Jawaban peserta
    const userAnswers = queryAll(`
      SELECT question_id, selected_option_key, is_doubtful
      FROM attempt_answers
      WHERE attempt_id = ?
    `, [attempt.id]);
    const userAnsMap = new Map<number, string>();
    for (const a of userAnswers) {
      userAnsMap.set(a.question_id, a.selected_option_key);
    }

    // Detail opsi dengan is_correct dan score_weight
    const allOptions = queryAll(`
      SELECT question_id, option_key, option_text, is_correct, score_weight
      FROM question_options
      WHERE question_id IN (${placeholders})
      ORDER BY option_key ASC
    `, questionIds);

    const optionsMap = new Map<number, any[]>();
    for (const opt of allOptions) {
      if (!optionsMap.has(opt.question_id)) optionsMap.set(opt.question_id, []);
      optionsMap.get(opt.question_id)!.push({
        key: opt.option_key,
        text: opt.option_text,
        isCorrect: opt.is_correct === 1,
        weight: opt.score_weight
      });
    }

    // Pembahasan resmi
    const explanations = queryAll(`
      SELECT question_id, explanation_text, quick_trick, reference_source
      FROM question_explanations
      WHERE question_id IN (${placeholders})
    `, questionIds);

    const expMap = new Map<number, any>();
    for (const exp of explanations) {
      expMap.set(exp.question_id, exp);
    }

    return questionsSnapshot.map((q: any) => {
      const exp = expMap.get(q.id) || {};
      const opts = optionsMap.get(q.id) || [];
      const userKey = userAnsMap.get(q.id) || null;
      const correctOpt = opts.find((o) => o.isCorrect) || opts.reduce((max, o) => o.weight > (max?.weight || 0) ? o : max, opts[0]);

      return {
        id: q.id,
        sequenceOrder: q.sequenceOrder,
        subtestCode: q.subtestCode,
        subtestName: q.subtestName,
        questionText: q.questionText,
        options: opts,
        userAnswer: userKey,
        correctAnswer: correctOpt ? correctOpt.key : null,
        isUserCorrect: userKey ? (opts.find((o) => o.key === userKey)?.isCorrect ?? false) : false,
        explanationText: exp.explanation_text || 'Pembahasan resmi butir soal.',
        quickTrick: exp.quick_trick || null,
        referenceSource: exp.reference_source || null
      };
    });
  }
}
