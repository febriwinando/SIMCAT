<?php
/**
 * Konfigurasi Database MySQL untuk cPanel Hosting
 * Sesuaikan kredensial di bawah ini dengan database cPanel Anda
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$db_host = 'localhost';          // Biasanya tetap localhost di cPanel
$db_user = 'root';               // Ganti dengan username MySQL cPanel Anda
$db_pass = '';                   // Ganti dengan password user MySQL cPanel
$db_name = 'cat_ujian_simulasi'; // Ganti dengan nama database cPanel

try {
    $pdo = new PDO("mysql:host={$db_host};dbname={$db_name};charset=utf8mb4", $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Gagal terkoneksi ke database MySQL cPanel: ' . $e->getMessage()
    ]);
    exit();
}
