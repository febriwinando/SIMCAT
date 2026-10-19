import type { APIRoute } from 'astro';
import { execute, queryOne } from '../../../db';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { questionId, reviewerId = 3, status, notes = '' } = body;

    if (!questionId || !status) {
      return new Response(
        JSON.stringify({ success: false, error: 'ID Soal dan status review wajib diisi.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Valid statuses: approved, revision_required, rejected, published
    const validStatuses = ['approved', 'revision_required', 'rejected', 'published'];
    if (!validStatuses.includes(status)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Status review tidak valid.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update question status
    execute(`
      UPDATE questions
      SET editorial_status = ?, reviewer_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [status, reviewerId, questionId]);

    // Record review entry
    execute(`
      INSERT INTO question_reviews (question_id, reviewer_id, status, notes)
      VALUES (?, ?, ?, ?)
    `, [questionId, reviewerId, status, notes || null]);

    // Record audit log
    execute(`
      INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details)
      VALUES (?, ?, ?, ?, ?)
    `, [
      reviewerId,
      'review_question',
      'question',
      questionId.toString(),
      `Status soal diubah menjadi ${status}. Catatan: ${notes || '-'}`
    ]);

    return new Response(
      JSON.stringify({ success: true, message: `Status soal berhasil diubah menjadi ${status}.` }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'Gagal memproses review soal.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
