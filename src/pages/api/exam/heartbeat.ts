import type { APIRoute } from 'astro';
import { queryOne } from '../../../db';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { attemptUuid } = body;
    const now = new Date();

    if (!attemptUuid) {
      return new Response(
        JSON.stringify({ success: true, serverTime: now.toISOString() }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const attempt = queryOne(`
      SELECT id, status, expires_at FROM exam_attempts WHERE uuid = ?
    `, [attemptUuid]);

    if (!attempt) {
      return new Response(
        JSON.stringify({ success: false, error: 'Attempt tidak valid' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const expiresAt = new Date(attempt.expires_at);
    const isExpired = expiresAt <= now || attempt.status !== 'in_progress';
    const remainingSeconds = Math.max(0, Math.round((expiresAt.getTime() - now.getTime()) / 1000));

    return new Response(
      JSON.stringify({
        success: true,
        serverTime: now.toISOString(),
        isExpired,
        remainingSeconds,
        status: attempt.status
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
