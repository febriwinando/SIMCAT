import type { APIRoute } from 'astro';
import { queryAll } from '../../../db';

export const GET: APIRoute = async ({ url }) => {
  try {
    const categoryParam = url.searchParams.get('category');
    
    let sql = `
      SELECT 
        p.id, p.slug, p.title, p.description, p.category_id,
        c.name as category_name, c.id as category_slug,
        p.duration_minutes, p.total_questions, p.is_free, p.price,
        sr.rules_json as scoring_rule_json, sr.name as scoring_rule_name
      FROM exam_packages p
      JOIN exam_categories c ON p.category_id = c.id
      JOIN scoring_rules sr ON p.scoring_rule_id = sr.id
      WHERE p.status = 'published'
    `;

    const params: any[] = [];
    if (categoryParam) {
      sql += ` AND p.category_id = ? `;
      params.push(categoryParam);
    }

    sql += ` ORDER BY p.id ASC `;

    const rows = queryAll(sql, params);

    const packages = rows.map((row) => {
      let subtests: any[] = [];
      if (row.scoring_rule_json) {
        try {
          const rule = JSON.parse(row.scoring_rule_json);
          if (rule.subtests) {
            subtests = Object.keys(rule.subtests).map((code) => ({
              code,
              name: rule.subtests[code].name || code,
              passingGrade: rule.subtests[code].passing_grade || rule.subtests[code].passingGrade || 0,
              questionCount: rule.subtests[code].question_count || 0
            }));
          }
        } catch (e) {}
      }

      return {
        id: row.id,
        title: row.title,
        slug: row.slug,
        description: row.description,
        categoryId: row.category_id,
        categoryName: row.category_name,
        categorySlug: row.category_slug,
        durationMinutes: row.duration_minutes,
        totalQuestions: row.total_questions,
        isFree: row.is_free === 1,
        price: row.price,
        scoringRuleName: row.scoring_rule_name,
        subtests
      };
    });

    return new Response(
      JSON.stringify({ success: true, packages }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        } 
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'Gagal memuat paket ujian.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
