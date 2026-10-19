import type { APIRoute } from 'astro';
import { getDb, queryOne } from '../../../db';
import crypto from 'node:crypto';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(`simcat_salt_${password}`).digest('hex');
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, email, password, targetInstansi = 'CPNS 2026' } = body;

    if (!name || !email || !password) {
      return new Response(
        JSON.stringify({ success: false, error: 'Nama lengkap, email, dan kata sandi wajib diisi.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const db = getDb();

    // Check existing email
    const existing = queryOne('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email sudah terdaftar. Silakan gunakan email lain atau masuk.' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const uuid = `usr-${crypto.randomUUID()}`;
    const passwordHash = hashPassword(password);
    const maskedNik = `3201************${Math.floor(1000 + Math.random() * 9000)}`;

    const res = db.prepare(`
      INSERT INTO users (uuid, email, password_hash, role_id, status)
      VALUES (?, ?, ?, 'examinee', 'active')
    `).run(uuid, email, passwordHash);

    const userId = Number(res.lastInsertRowid);

    db.prepare(`
      INSERT INTO user_profiles (user_id, full_name, nik_masked, target_instansi)
      VALUES (?, ?, ?, ?)
    `).run(userId, name, maskedNik, targetInstansi);

    const sessionUser = {
      id: userId,
      uuid,
      email,
      name,
      role: 'examinee',
      roleName: 'Peserta Ujian',
      permissions: ['exam:take', 'exam:history', 'bookmarks:manage'],
      targetInstansi,
      nikMasked: maskedNik,
      isLoggedIn: true,
      loginTime: Date.now()
    };

    return new Response(
      JSON.stringify({ success: true, user: sessionUser }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'Gagal mendaftarkan akun.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
