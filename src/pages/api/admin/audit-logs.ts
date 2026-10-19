import type { APIRoute } from 'astro';
import { queryAll } from '../../../db';

export const GET: APIRoute = async ({ url }) => {
  try {
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);

    const logs = queryAll(`
      SELECT 
        l.id, l.user_id, l.action, l.resource_type, l.resource_id,
        l.details, l.ip_address, l.created_at,
        u.email as user_email, p.full_name as user_name, r.name as role_name
      FROM audit_logs l
      LEFT JOIN users u ON l.user_id = u.id
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN user_profiles p ON u.id = p.user_id
      ORDER BY l.id DESC
      LIMIT ?
    `, [limit]);

    return new Response(
      JSON.stringify({ success: true, logs }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'Gagal memuat log audit.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
