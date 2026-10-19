import type { APIRoute } from 'astro';
import { queryAll, queryOne, execute, getDb } from '../../../db';
import crypto from 'node:crypto';

export const GET: APIRoute = async ({ url }) => {
  try {
    const categoryId = url.searchParams.get('categoryId');
    const subjectId = url.searchParams.get('subjectId');
    const status = url.searchParams.get('status');
    const qid = url.searchParams.get('id');

    if (qid) {
      const q = queryOne(`
        SELECT 
          q.id, q.uuid, q.category_id, q.subject_id, q.topic_id,
          q.stimulus_text, q.question_text, q.media_url, q.difficulty,
          q.editorial_status, q.version, q.created_at,
          c.name as category_name, s.name as subject_name, s.code as subject_code
        FROM questions q
        JOIN exam_categories c ON q.category_id = c.id
        JOIN subjects s ON q.subject_id = s.id
        WHERE q.id = ?
      `, [qid]);

      if (!q) {
        return new Response(JSON.stringify({ success: false, error: 'Soal tidak ditemukan.' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const options = queryAll(`
        SELECT option_key, option_text, is_correct, score_weight
        FROM question_options
        WHERE question_id = ?
        ORDER BY option_key ASC
      `, [qid]);

      const explanation = queryOne(`
        SELECT explanation_text, quick_trick, reference_source
        FROM question_explanations
        WHERE question_id = ?
      `, [qid]);

      return new Response(
        JSON.stringify({ success: true, question: { ...q, options, explanation } }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let sql = `
      SELECT 
        q.id, q.uuid, q.category_id, q.subject_id,
        q.question_text, q.stimulus_text, q.difficulty,
        q.editorial_status, q.created_at,
        c.name as category_name, s.name as subject_name, s.code as subject_code,
        (SELECT COUNT(*) FROM question_options WHERE question_id = q.id) as option_count
      FROM questions q
      JOIN exam_categories c ON q.category_id = c.id
      JOIN subjects s ON q.subject_id = s.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (categoryId) {
      sql += ` AND q.category_id = ? `;
      params.push(categoryId);
    }
    if (subjectId) {
      sql += ` AND q.subject_id = ? `;
      params.push(subjectId);
    }
    if (status) {
      sql += ` AND q.editorial_status = ? `;
      params.push(status);
    }

    sql += ` ORDER BY q.id DESC `;

    const questions = queryAll(sql, params);

    return new Response(
      JSON.stringify({ success: true, questions }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'Gagal memuat bank soal.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const {
      categoryId,
      subjectId,
      stimulusText,
      questionText,
      difficulty = 3,
      editorialStatus = 'published',
      options = [],
      explanationText = '',
      quickTrick = '',
      referenceSource = ''
    } = body;

    if (!categoryId || !subjectId || !questionText || options.length < 2) {
      return new Response(
        JSON.stringify({ success: false, error: 'Kategori, subtes, teks soal, dan minimal 2 opsi jawaban wajib diisi.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const uuid = `q-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

    const res = execute(`
      INSERT INTO questions (
        uuid, category_id, subject_id, stimulus_text, question_text,
        difficulty, editorial_status, version, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [
      uuid,
      categoryId,
      subjectId,
      stimulusText || null,
      questionText,
      difficulty,
      editorialStatus
    ]);

    const newQuestionId = Number(res.lastInsertRowid);

    // Insert options
    for (const opt of options) {
      execute(`
        INSERT INTO question_options (
          question_id, option_key, option_text, is_correct, score_weight
        ) VALUES (?, ?, ?, ?, ?)
      `, [
        newQuestionId,
        opt.key || opt.optionKey,
        opt.text || opt.optionText,
        opt.isCorrect ? 1 : 0,
        parseFloat(opt.scoreWeight || (opt.isCorrect ? 5 : 0))
      ]);
    }

    // Insert explanation
    if (explanationText) {
      execute(`
        INSERT INTO question_explanations (
          question_id, explanation_text, quick_trick, reference_source
        ) VALUES (?, ?, ?, ?)
      `, [
        newQuestionId,
        explanationText,
        quickTrick || null,
        referenceSource || null
      ]);
    }

    // Audit log
    execute(`
      INSERT INTO audit_logs (action, resource_type, resource_id, details)
      VALUES (?, ?, ?, ?)
    `, [
      'create_question',
      'question',
      newQuestionId.toString(),
      `Menambahkan butir soal baru kategori ${categoryId} subtes ${subjectId}`
    ]);

    return new Response(
      JSON.stringify({ success: true, questionId: newQuestionId, uuid }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'Gagal menyimpan butir soal.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
