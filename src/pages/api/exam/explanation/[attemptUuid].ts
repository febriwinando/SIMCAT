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

    const explanationData = ExamService.getAttemptExplanation(attemptUuid);

    return new Response(
      JSON.stringify({ success: true, data: explanationData }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'Gagal memuat pembahasan.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
