<?php
require_once __DIR__ . '/config.php';

$slug = isset($_GET['slug']) ? trim($_GET['slug']) : 'cpns-skd';

try {
    // 1. Ambil detail paket
    $stmtPkg = $pdo->prepare("SELECT * FROM exam_packages WHERE slug = ? LIMIT 1");
    $stmtPkg->execute([$slug]);
    $package = $stmtPkg->fetch();

    if (!$package) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Paket ujian tidak ditemukan']);
        exit();
    }

    // 2. Ambil passing grades
    $stmtPg = $pdo->prepare("SELECT subtest_code as code, subtest_name as name, min_score as minScore, max_score as maxScore, description FROM passing_grades WHERE package_id = ?");
    $stmtPg->execute([$package['id']]);
    $passingGrades = $stmtPg->fetchAll();

    // 3. Ambil soal-soal
    $stmtQ = $pdo->prepare("SELECT id, subtest_code as subtest, subtest_label as subtestLabel, question_text as questionText, correct_answer as correctAnswer, explanation, tips_trick as tipsTrick FROM questions WHERE package_id = ? ORDER BY id ASC");
    $stmtQ->execute([$package['id']]);
    $questions = $stmtQ->fetchAll();

    // 4. Ambil opsi untuk tiap soal
    foreach ($questions as &$q) {
        $stmtOpt = $pdo->prepare("SELECT option_key as `key`, option_text as `text`, score FROM options WHERE question_id = ? ORDER BY option_key ASC");
        $stmtOpt->execute([$q['id']]);
        $q['options'] = $stmtOpt->fetchAll();
    }

    echo json_encode([
        'status' => 'success',
        'data' => [
            'id' => $package['id'],
            'slug' => $package['slug'],
            'title' => $package['title'],
            'category' => $package['category_code'],
            'durationMinutes' => (int)$package['duration_minutes'],
            'totalQuestions' => count($questions),
            'passingGrades' => $passingGrades,
            'questions' => $questions
        ]
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
