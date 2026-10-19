import { getDb, queryOne, queryAll } from '../db';

export interface SubtestScoreDetail {
  code: string;
  name: string;
  score: number;
  passingGrade: number;
  maxScore: number;
  isPassed: boolean;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
}

export interface GradedResult {
  totalScore: number;
  maxPossibleScore: number;
  isPassed: boolean;
  subtestScores: Record<string, SubtestScoreDetail>;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  accuracyPercent: number;
  recommendations: string[];
}

/**
 * Server-Side Scoring Engine
 * Decoupled, config-driven, supports equal weight, category weight, TKP 1-5 scale, and penalties.
 */
export function gradeAttempt(attemptId: number): GradedResult {
  const db = getDb();

  // 1. Fetch attempt and scoring rule snapshot
  const attempt = queryOne(`
    SELECT a.*, p.slug as package_slug, p.title as package_title
    FROM exam_attempts a
    JOIN exam_packages p ON a.package_id = p.id
    WHERE a.id = ?
  `, [attemptId]);

  if (!attempt) {
    throw new Error(`Attempt with ID ${attemptId} not found`);
  }

  const scoringRule = JSON.parse(attempt.scoring_rule_snapshot);
  const questionsSnapshot: Array<{ id: number; subject_id: string; subtest?: string }> = JSON.parse(attempt.questions_snapshot);

  // 2. Fetch saved answers for this attempt
  const savedAnswers = queryAll(`
    SELECT question_id, selected_option_key, is_doubtful
    FROM attempt_answers
    WHERE attempt_id = ?
  `, [attemptId]);

  const answerMap = new Map<number, string>();
  for (const ans of savedAnswers) {
    if (ans.selected_option_key) {
      answerMap.set(ans.question_id, ans.selected_option_key);
    }
  }

  // 3. Fetch all correct answers and weights securely from database
  const questionIds = questionsSnapshot.map((q) => q.id);
  const placeholders = questionIds.map(() => '?').join(',');

  const optionsData = queryAll(`
    SELECT question_id, option_key, is_correct, score_weight
    FROM question_options
    WHERE question_id IN (${placeholders})
  `, questionIds);

  const optionsMap = new Map<string, { is_correct: number; score_weight: number }>();
  for (const opt of optionsData) {
    optionsMap.set(`${opt.question_id}_${opt.option_key}`, {
      is_correct: opt.is_correct,
      score_weight: opt.score_weight
    });
  }

  // 4. Calculate Scores per Subtest
  const subtestConfigs = scoringRule.subtests || {};
  const subtestScores: Record<string, SubtestScoreDetail> = {};

  // Initialize subtest score details
  for (const [subjKey, cfg] of Object.entries<any>(subtestConfigs)) {
    subtestScores[subjKey] = {
      code: cfg.name || subjKey,
      name: cfg.name || subjKey,
      score: 0,
      passingGrade: cfg.passingGrade || 0,
      maxScore: 0,
      isPassed: false,
      correctCount: 0,
      wrongCount: 0,
      unansweredCount: 0
    };
  }

  let totalScore = 0;
  let overallCorrect = 0;
  let overallWrong = 0;
  let overallUnanswered = 0;

  for (const q of questionsSnapshot) {
    const subjId = q.subjectId || q.subject_id;
    const cfg = subtestConfigs[subjId] || {
      name: 'Umum',
      passingGrade: 0,
      correctScore: 5,
      wrongScore: 0,
      blankScore: 0
    };

    if (!subtestScores[subjId]) {
      subtestScores[subjId] = {
        code: cfg.name || subjId,
        name: cfg.name || subjId,
        score: 0,
        passingGrade: cfg.passingGrade || 0,
        maxScore: 0,
        isPassed: false,
        correctCount: 0,
        wrongCount: 0,
        unansweredCount: 0
      };
    }

    const subtest = subtestScores[subjId];
    const userSelected = answerMap.get(q.id);

    if (cfg.isScaleOption) {
      // Scaled subtest (e.g. TKP skala 1-5 atau Wawancara 1-4)
      subtest.maxScore += cfg.scaleMax || 5;
      if (userSelected) {
        const optInfo = optionsMap.get(`${q.id}_${userSelected}`);
        const earned = optInfo ? optInfo.score_weight : 0;
        subtest.score += earned;
        totalScore += earned;
        if (earned >= (cfg.scaleMax || 5)) {
          subtest.correctCount++;
          overallCorrect++;
        } else {
          subtest.wrongCount++;
          overallWrong++;
        }
      } else {
        subtest.unansweredCount++;
        overallUnanswered++;
        subtest.score += cfg.blankScore || 0;
      }
    } else {
      // Standard subtest (TWK, TIU, Teknis, TKD)
      const correctScore = cfg.correctScore ?? 5;
      const wrongScore = cfg.wrongScore ?? 0;
      const blankScore = cfg.blankScore ?? 0;
      subtest.maxScore += correctScore;

      if (userSelected) {
        const optInfo = optionsMap.get(`${q.id}_${userSelected}`);
        if (optInfo && optInfo.is_correct === 1) {
          subtest.score += correctScore;
          totalScore += correctScore;
          subtest.correctCount++;
          overallCorrect++;
        } else {
          subtest.score += wrongScore;
          totalScore += wrongScore;
          subtest.wrongCount++;
          overallWrong++;
        }
      } else {
        subtest.score += blankScore;
        totalScore += blankScore;
        subtest.unansweredCount++;
        overallUnanswered++;
      }
    }
  }

  // 5. Evaluate Passing Conditions
  let isAllPassed = true;
  const recommendations: string[] = [];

  for (const [subjKey, sub] of Object.entries(subtestScores)) {
    sub.isPassed = sub.score >= sub.passingGrade;
    if (!sub.isPassed) {
      isAllPassed = false;
      recommendations.push(
        `Skor ${sub.name} Anda (${sub.score}) belum melampaui Passing Grade (${sub.passingGrade}). Perbanyak latihan butir soal pada materi ${sub.name}.`
      );
    }
  }

  if (isAllPassed) {
    recommendations.unshift('Selamat! Anda memenuhi ambang batas (Passing Grade) di seluruh subtes. Pertahankan konsistensi latihan dan efisiensi waktu Anda.');
  } else {
    recommendations.unshift('Fokuskan persiapan Anda pada subtes yang belum melampaui passing grade sebelum mencoba simulasi tryout berjadwal berikutnya.');
  }

  const answeredTotal = overallCorrect + overallWrong;
  const accuracyPercent = answeredTotal > 0 ? Math.round((overallCorrect / answeredTotal) * 100) : 0;
  const maxPossibleScore = scoringRule.maxScore || Object.values(subtestScores).reduce((acc, s) => acc + s.maxScore, 0);

  // 6. Calculate Time Spent
  const startTime = new Date(attempt.started_at).getTime();
  const finishTime = attempt.finished_at ? new Date(attempt.finished_at).getTime() : Date.now();
  const timeSpentSeconds = Math.max(0, Math.round((finishTime - startTime) / 1000));

  // 7. Persist to exam_results (Idempotent: Replace if exists)
  db.prepare(`
    INSERT OR REPLACE INTO exam_results (
      attempt_id, user_id, package_id, total_score, max_possible_score,
      is_passed, category_scores, correct_count, wrong_count,
      unanswered_count, accuracy_percent, time_spent_seconds, recommendations_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    attempt.id,
    attempt.user_id,
    attempt.package_id,
    totalScore,
    maxPossibleScore,
    isAllPassed ? 1 : 0,
    JSON.stringify(subtestScores),
    overallCorrect,
    overallWrong,
    overallUnanswered,
    accuracyPercent,
    timeSpentSeconds,
    JSON.stringify(recommendations)
  );

  return {
    totalScore,
    maxPossibleScore,
    isPassed: isAllPassed,
    subtestScores,
    correctCount: overallCorrect,
    wrongCount: overallWrong,
    unansweredCount: overallUnanswered,
    accuracyPercent,
    recommendations
  };
}
