import type { APIRoute } from 'astro';
import { ExamService } from '../../../services/examService';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { packageSlug, userId = 5 } = body; // Default demo examinee user ID 5

    if (!packageSlug) {
      return new Response(
        JSON.stringify({ success: false, error: 'Parameter packageSlug wajib diisi.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const session = ExamService.startAttempt(packageSlug, Number(userId));

    return new Response(
      JSON.stringify({ success: true, data: session }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'Gagal memulai simulasi.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
