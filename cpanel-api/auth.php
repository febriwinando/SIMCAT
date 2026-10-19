<?php
/**
 * Endpoint Autentikasi Peserta CAT untuk cPanel & MySQL
 * Menerima POST login / registrasi peserta ujian
 */

require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method Not Allowed']);
    exit();
}

$raw_input = file_get_contents('php://input');
$data = json_decode($raw_input, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Format JSON tidak valid']);
    exit();
}

$nomor_peserta = trim($data['nomorPeserta'] ?? '');
$nik           = trim($data['nik'] ?? $nomor_peserta);
$nama          = trim($data['name'] ?? '');
$pin           = trim($data['pin'] ?? '');
$instansi      = trim($data['targetInstansi'] ?? 'Kementerian / Lembaga');

if (empty($nomor_peserta) || empty($nama) || empty($pin)) {
    http_response_code(422);
    echo json_encode([
        'status' => 'error',
        'message' => 'Nomor Peserta, Nama Lengkap, dan PIN wajib diisi.'
    ]);
    exit();
}

try {
    // Cek apakah user sudah terdaftar
    $stmt = $pdo->prepare("SELECT * FROM `users` WHERE `nomor_peserta` = :nomor_peserta LIMIT 1");
    $stmt->execute([':nomor_peserta' => $nomor_peserta]);
    $user = $stmt->fetch();

    if ($user) {
        // Verifikasi PIN / sandi
        if ($user['pin'] !== $pin && !password_verify($pin, $user['pin'])) {
            http_response_code(401);
            echo json_encode([
                'status' => 'error',
                'message' => 'PIN Sesi Ujian tidak cocok dengan Nomor Peserta terdaftar.'
            ]);
            exit();
        }
    } else {
        // Registrasi peserta baru secara otomatis
        $insert = $pdo->prepare("
            INSERT INTO `users` (`nomor_peserta`, `nik`, `name`, `pin`, `target_instansi`)
            VALUES (:nomor_peserta, :nik, :name, :pin, :target_instansi)
        ");
        $insert->execute([
            ':nomor_peserta' => $nomor_peserta,
            ':nik'           => $nik,
            ':name'          => $nama,
            ':pin'           => $pin,
            ':target_instansi' => $instansi
        ]);
        $user = [
            'id' => $pdo->lastInsertId(),
            'nomor_peserta' => $nomor_peserta,
            'nik' => $nik,
            'name' => $nama,
            'target_instansi' => $instansi
        ];
    }

    echo json_encode([
        'status' => 'success',
        'message' => 'Autentikasi berhasil',
        'data' => [
            'nomorPeserta' => $user['nomor_peserta'],
            'nik'          => $user['nik'],
            'name'         => $user['name'],
            'targetInstansi' => $user['target_instansi']
        ]
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Gagal memproses login: ' . $e->getMessage()
    ]);
}
