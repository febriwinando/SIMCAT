import type { APIRoute } from 'astro';
import { ExamService } from '../../../../services/examService';

export const GET: APIRoute = async ({ params }) => {
  try {
    const { attemptUuid } = params;

    if (!attemptUuid) {
      return new Response(
        JSON.stringify({ success: false, error: 'attemptUuid wajib diisi.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = ExamService.getAttemptResult(attemptUuid);

    if (!result) {
      return new Response(
        JSON.stringify({ success: false, error: 'Hasil ujian tidak ditemukan.' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'Gagal memuat hasil ujian.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
