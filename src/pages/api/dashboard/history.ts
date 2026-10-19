import type { APIRoute } from 'astro';
import { queryAll } from '../../../db';

export const GET: APIRoute = async ({ url }) => {
  try {
    const userIdParam = url.searchParams.get('userId');
    const categoryParam = url.searchParams.get('category');
    const userId = userIdParam ? parseInt(userIdParam, 10) : null;

    let sql = `
      SELECT 
        a.id, a.uuid, a.user_id, a.started_at, a.finished_at, a.status,
        p.id as package_id, p.title as package_title, p.slug as package_slug,
        p.category_id, c.name as category_name,
        r.total_score, r.max_possible_score, r.is_passed,
        r.correct_count, r.wrong_count, r.unanswered_count,
        r.accuracy_percent, r.time_spent_seconds, r.category_scores,
        r.graded_at
      FROM exam_attempts a
      JOIN exam_packages p ON a.package_id = p.id
      JOIN exam_categories c ON p.category_id = c.id
      LEFT JOIN exam_results r ON a.id = r.attempt_id
      WHERE a.status IN ('submitted', 'auto_submitted', 'graded')
    `;

    const params: any[] = [];
    if (userId) {
      sql += ` AND a.user_id = ? `;
      params.push(userId);
    }
    if (categoryParam) {
      sql += ` AND p.category_id = ? `;
      params.push(categoryParam);
    }

    sql += ` ORDER BY a.id DESC `;

    const rows = queryAll(sql, params);

    const history = rows.map((row) => {
      let subtests: any[] = [];
      if (row.category_scores) {
        try {
          const breakdown = JSON.parse(row.category_scores);
          subtests = Object.keys(breakdown).map((k) => ({
            code: k,
            name: breakdown[k].name,
            score: breakdown[k].score,
            passingGrade: breakdown[k].passingGrade,
            isPassed: breakdown[k].isPassed
          }));
        } catch (e) {}
      }

      return {
        id: row.id,
        uuid: row.uuid,
        packageTitle: row.package_title,
        packageSlug: row.package_slug,
        categoryId: row.category_id,
        categoryName: row.category_name,
        totalScore: row.total_score,
        maxPossibleScore: row.max_possible_score,
        isPassed: row.is_passed === 1,
        correctCount: row.correct_count,
        wrongCount: row.wrong_count,
        unansweredCount: row.unanswered_count,
        accuracyPercent: row.accuracy_percent,
        timeSpentSeconds: row.time_spent_seconds,
        subtests,
        date: row.graded_at || row.finished_at || row.started_at
      };
    });

    return new Response(
      JSON.stringify({ success: true, history }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'Gagal mengambil riwayat attempt.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
