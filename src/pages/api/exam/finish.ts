import type { APIRoute } from 'astro';
import { ExamService } from '../../../services/examService';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { attemptUuid, userId = 5, isAutoSubmit = false } = body;

    if (!attemptUuid) {
      return new Response(
        JSON.stringify({ success: false, error: 'attemptUuid wajib disertakan.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const gradedResult = ExamService.finishAttempt(attemptUuid, Number(userId), Boolean(isAutoSubmit));

    return new Response(
      JSON.stringify({ success: true, data: gradedResult }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'Gagal mengakhiri ujian.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
