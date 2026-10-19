import type { APIRoute } from 'astro';
import { queryAll, queryOne } from '../../../db';

export const GET: APIRoute = async ({ url }) => {
  try {
    const userIdParam = url.searchParams.get('userId');
    const userId = userIdParam ? parseInt(userIdParam, 10) : null;

    // Base query for user attempts
    let attemptsQuery = `
      SELECT 
        a.id, a.uuid, a.package_id, a.started_at, a.finished_at, a.status,
        p.title as package_title, p.slug as package_slug, p.category_id,
        r.total_score, r.max_possible_score, r.is_passed, r.accuracy_percent,
        r.time_spent_seconds, r.category_scores, r.graded_at
      FROM exam_attempts a
      JOIN exam_packages p ON a.package_id = p.id
      LEFT JOIN exam_results r ON a.id = r.attempt_id
      WHERE a.status IN ('submitted', 'auto_submitted', 'graded')
    `;

    const params: any[] = [];
    if (userId) {
      attemptsQuery += ` AND a.user_id = ? `;
      params.push(userId);
    }
    attemptsQuery += ` ORDER BY a.id DESC `;

    const allFinished = queryAll(attemptsQuery, params);

    // Calculate aggregated metrics
    const totalAttempts = allFinished.length;
    let passedCount = 0;
    let highestScore = 0;
    let totalScoreSum = 0;
    let totalSeconds = 0;

    const subtestAggregates: Record<string, { totalScore: number; count: number; name: string }> = {};

    allFinished.forEach((att) => {
      if (att.is_passed === 1) passedCount++;
      if (att.total_score > highestScore) highestScore = att.total_score;
      totalScoreSum += att.total_score || 0;
      totalSeconds += att.time_spent_seconds || 0;

      if (att.category_scores) {
        try {
          const breakdown = JSON.parse(att.category_scores);
          Object.keys(breakdown).forEach((key) => {
            const item = breakdown[key];
            if (!subtestAggregates[key]) {
              subtestAggregates[key] = { totalScore: 0, count: 0, name: item.name || key };
            }
            subtestAggregates[key].totalScore += item.score || 0;
            subtestAggregates[key].count += 1;
          });
        } catch (e) {}
      }
    });

    const averageScore = totalAttempts > 0 ? Math.round((totalScoreSum / totalAttempts) * 10) / 10 : 0;
    const passRate = totalAttempts > 0 ? Math.round((passedCount / totalAttempts) * 100) : 0;
    const totalStudyHours = Math.round((totalSeconds / 3600) * 10) / 10;

    // Calculate average score per subtest
    const subtestAverages = Object.keys(subtestAggregates).map((key) => ({
      code: key,
      name: subtestAggregates[key].name,
      avgScore: Math.round((subtestAggregates[key].totalScore / subtestAggregates[key].count) * 10) / 10
    }));

    // Recent 5 attempts
    const recentAttempts = allFinished.slice(0, 5).map((att) => ({
      uuid: att.uuid,
      packageTitle: att.package_title,
      packageSlug: att.package_slug,
      categoryId: att.category_id,
      totalScore: att.total_score,
      maxPossibleScore: att.max_possible_score,
      isPassed: att.is_passed === 1,
      accuracyPercent: att.accuracy_percent,
      timeSpentSeconds: att.time_spent_seconds,
      date: att.graded_at || att.finished_at || att.started_at
    }));

    return new Response(
      JSON.stringify({
        success: true,
        stats: {
          totalAttempts,
          passedCount,
          passRate,
          highestScore,
          averageScore,
          totalStudyHours,
          subtestAverages
        },
        recentAttempts
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'Gagal memuat ringkasan dashboard.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
