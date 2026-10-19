import type { APIRoute } from 'astro';
import { ExamService } from '../../../services/examService';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { attemptUuid, questionId, selectedOptionKey, isDoubtful, sequence = 1 } = body;

    if (!attemptUuid || !questionId) {
      return new Response(
        JSON.stringify({ success: false, error: 'attemptUuid dan questionId wajib disertakan.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const res = ExamService.saveAnswer(
      attemptUuid,
      Number(questionId),
      selectedOptionKey || null,
      Boolean(isDoubtful),
      Number(sequence)
    );

    return new Response(
      JSON.stringify(res),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'Gagal menyimpan jawaban.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
