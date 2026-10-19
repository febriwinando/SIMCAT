import type { APIRoute } from 'astro';
import { queryAll, queryOne, execute } from '../../../db';

export const GET: APIRoute = async () => {
  try {
    const packages = queryAll(`
      SELECT 
        p.id, p.slug, p.title, p.category_id, p.scoring_rule_id,
        p.duration_minutes, p.total_questions, p.is_free, p.price,
        p.status, p.created_at,
        c.name as category_name,
        r.name as scoring_rule_name, r.reference_source,
        (SELECT COUNT(*) FROM package_questions WHERE package_id = p.id) as question_count,
        (SELECT COUNT(*) FROM exam_attempts WHERE package_id = p.id) as attempt_count
      FROM exam_packages p
      JOIN exam_categories c ON p.category_id = c.id
      JOIN scoring_rules r ON p.scoring_rule_id = r.id
      ORDER BY p.id ASC
    `);

    const scoringRules = queryAll(`
      SELECT id, name, category_id, reference_source, version
      FROM scoring_rules
      ORDER BY id ASC
    `);

    return new Response(
      JSON.stringify({ success: true, packages, scoringRules }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'Gagal memuat paket ujian.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
