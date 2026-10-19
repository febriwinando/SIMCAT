import type { APIRoute } from 'astro';
import { queryOne, queryAll } from '../../../db';

export const GET: APIRoute = async () => {
  try {
    const userCount = queryOne<{ count: number }>(`SELECT COUNT(*) as count FROM users`);
    const questionCount = queryOne<{ count: number }>(`SELECT COUNT(*) as count FROM questions`);
    const pendingReviewCount = queryOne<{ count: number }>(`
      SELECT COUNT(*) as count FROM questions WHERE editorial_status IN ('draft', 'review_pending', 'revision_required')
    `);
    const publishedCount = queryOne<{ count: number }>(`
      SELECT COUNT(*) as count FROM questions WHERE editorial_status = 'published'
    `);
    const packageCount = queryOne<{ count: number }>(`SELECT COUNT(*) as count FROM exam_packages`);
    const attemptCount = queryOne<{ count: number }>(`SELECT COUNT(*) as count FROM exam_attempts`);
    const passedCount = queryOne<{ count: number }>(`SELECT COUNT(*) as count FROM exam_results WHERE is_passed = 1`);
    const avgScore = queryOne<{ avg: number }>(`SELECT AVG(total_score) as avg FROM exam_results`);

    const questionsByCategory = queryAll(`
      SELECT c.id, c.name, COUNT(q.id) as total_questions
      FROM exam_categories c
      LEFT JOIN questions q ON c.id = q.category_id
      GROUP BY c.id
    `);

    const recentAudit = queryAll(`
      SELECT action, resource_type, resource_id, details, created_at
      FROM audit_logs
      ORDER BY id DESC
      LIMIT 8
    `);

    return new Response(
      JSON.stringify({
        success: true,
        stats: {
          totalUsers: userCount?.count || 0,
          totalQuestions: questionCount?.count || 0,
          pendingReview: pendingReviewCount?.count || 0,
          publishedQuestions: publishedCount?.count || 0,
          totalPackages: packageCount?.count || 0,
          totalAttempts: attemptCount?.count || 0,
          passRate: attemptCount?.count && attemptCount.count > 0 
            ? Math.round(((passedCount?.count || 0) / attemptCount.count) * 100) 
            : 0,
          averageScore: Math.round((avgScore?.avg || 0) * 10) / 10,
          questionsByCategory,
          recentAudit
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'Gagal memuat statistik backoffice.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
