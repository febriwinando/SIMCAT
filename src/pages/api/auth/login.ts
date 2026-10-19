import type { APIRoute } from 'astro';
import { queryOne } from '../../../db';
import crypto from 'node:crypto';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(`simcat_salt_${password}`).digest('hex');
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { identifier, password } = body; // identifier can be email, NIK, or demo role

    if (!identifier) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email / Nomor Peserta wajib diisi.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Lookup user by email or NIK or role
    const user = queryOne(`
      SELECT 
        u.id, u.uuid, u.email, u.password_hash, u.role_id, u.status,
        r.name as role_name, r.permissions,
        p.full_name, p.nik_masked, p.target_instansi, p.avatar_url
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE u.email = ? OR u.role_id = ? OR p.nik_masked LIKE ?
      LIMIT 1
    `, [identifier, identifier, `%${identifier}%`]);

    if (!user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Akun peserta tidak ditemukan. Periksa kembali data login Anda.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (user.status !== 'active') {
      return new Response(
        JSON.stringify({ success: false, error: 'Akun Anda sedang dinonaktifkan. Hubungi admin operasional.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // In demo environment, verify password or accept demo pass 'simcat2026'
    if (password && hashPassword(password) !== user.password_hash && password !== 'simcat2026') {
      return new Response(
        JSON.stringify({ success: false, error: 'PIN / Kata sandi yang Anda masukkan salah.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const sessionUser = {
      id: user.id,
      uuid: user.uuid,
      email: user.email,
      name: user.full_name || 'Peserta SIMCAT',
      role: user.role_id,
      roleName: user.role_name,
      permissions: JSON.parse(user.permissions || '[]'),
      targetInstansi: user.target_instansi || 'Nasional',
      nikMasked: user.nik_masked || '3201************0001',
      isLoggedIn: true,
      loginTime: Date.now()
    };

    return new Response(
      JSON.stringify({ success: true, user: sessionUser }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'Gagal memproses autentikasi.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
