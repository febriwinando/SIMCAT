<?php
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Hanya menerima request POST']);
    exit();
}

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Format payload JSON tidak valid']);
    exit();
}

$candidateName = !empty($data['candidateName']) ? trim($data['candidateName']) : 'Peserta CAT';
$packageSlug = !empty($data['packageSlug']) ? trim($data['packageSlug']) : 'cpns-skd';
$totalScore = isset($data['totalScore']) ? (int)$data['totalScore'] : 0;
$isPassed = !empty($data['isPassed']) ? 1 : 0;
$timeUsedSeconds = isset($data['timeUsedSeconds']) ? (int)$data['timeUsedSeconds'] : 0;
$subtestsSummary = isset($data['subtests']) ? json_encode($data['subtests']) : null;

try {
    // Cari id paket
    $stmtPkg = $pdo->prepare("SELECT id FROM exam_packages WHERE slug = ? LIMIT 1");
    $stmtPkg->execute([$packageSlug]);
    $package = $stmtPkg->fetch();

    $packageId = $package ? $package['id'] : 1;

    $stmtInsert = $pdo->prepare("
        INSERT INTO exam_results 
        (candidate_name, package_id, total_score, is_passed, subtests_summary, time_used_seconds)
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    $stmtInsert->execute([
        $candidateName,
        $packageId,
        $totalScore,
        $isPassed,
        $subtestsSummary,
        $timeUsedSeconds
    ]);

    $lastId = $pdo->lastInsertId();

    echo json_encode([
        'status' => 'success',
        'message' => 'Hasil ujian berhasil disimpan ke database MySQL cPanel',
        'resultId' => $lastId
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
