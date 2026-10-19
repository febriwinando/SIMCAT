-- ========================================================
-- DATABASE SCHEMA SIMULASI CAT UJIAN NASIONAL (CPNS/PPPK/POLRI/TNI)
-- Kompatibel dengan MySQL 5.7+ / MySQL 8.0+ / MariaDB di cPanel
-- ========================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Tabel Kategori Ujian
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(20) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabel Paket Soal
CREATE TABLE IF NOT EXISTS `exam_packages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `slug` VARCHAR(60) NOT NULL UNIQUE,
  `title` VARCHAR(150) NOT NULL,
  `category_code` VARCHAR(20) NOT NULL,
  `year_edition` VARCHAR(30) DEFAULT '2026',
  `duration_minutes` INT NOT NULL DEFAULT 100,
  `total_questions` INT NOT NULL DEFAULT 110,
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_code`) REFERENCES `categories`(`code`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabel Ambang Batas (Passing Grade) per Subtes
CREATE TABLE IF NOT EXISTS `passing_grades` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `package_id` INT NOT NULL,
  `subtest_code` VARCHAR(30) NOT NULL,
  `subtest_name` VARCHAR(100) NOT NULL,
  `min_score` INT NOT NULL,
  `max_score` INT NOT NULL,
  `description` VARCHAR(255),
  FOREIGN KEY (`package_id`) REFERENCES `exam_packages`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tabel Soal (Questions)
CREATE TABLE IF NOT EXISTS `questions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `package_id` INT NOT NULL,
  `subtest_code` VARCHAR(30) NOT NULL,
  `subtest_label` VARCHAR(100) NOT NULL,
  `question_text` TEXT NOT NULL,
  `correct_answer` CHAR(1) NOT NULL,
  `explanation` TEXT,
  `tips_trick` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`package_id`) REFERENCES `exam_packages`(`id`) ON DELETE CASCADE,
  INDEX `idx_pkg_subtest` (`package_id`, `subtest_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Tabel Opsi Jawaban (Options)
CREATE TABLE IF NOT EXISTS `options` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `question_id` INT NOT NULL,
  `option_key` CHAR(1) NOT NULL, -- A, B, C, D, E
  `option_text` TEXT NOT NULL,
  `score` INT NOT NULL DEFAULT 0, -- 0 atau 5 untuk TWK/TIU, 1-5 untuk TKP
  FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE CASCADE,
  INDEX `idx_question_opt` (`question_id`, `option_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Tabel Akun Peserta Ujian (Users)
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nomor_peserta` VARCHAR(60) NOT NULL UNIQUE,
  `nik` VARCHAR(30) NOT NULL,
  `name` VARCHAR(120) NOT NULL,
  `pin` VARCHAR(100) NOT NULL,
  `target_instansi` VARCHAR(150),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Tabel Riwayat Hasil Tryout Peserta
CREATE TABLE IF NOT EXISTS `exam_results` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `candidate_name` VARCHAR(100) DEFAULT 'Peserta CAT',
  `candidate_no` VARCHAR(60) DEFAULT '2026-CAT',
  `package_id` INT NOT NULL,
  `total_score` INT NOT NULL,
  `is_passed` TINYINT(1) NOT NULL DEFAULT 0,
  `subtests_summary` JSON,
  `time_used_seconds` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`package_id`) REFERENCES `exam_packages`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ========================================================
-- DATA SEEDER AWAL (CONTOH DATA SIAP PAKAI)
-- ========================================================

-- Insert Kategori
INSERT INTO `categories` (`code`, `name`, `description`) VALUES
('CPNS', 'Calon Pegawai Negeri Sipil', 'Seleksi Kompetensi Dasar (SKD) & Seleksi Kompetensi Bidang (SKB) BKN'),
('PPPK', 'Pegawai Pemerintah dengan Perjanjian Kerja', 'Kompetensi Teknis, Manajerial, Sosio-Kultural, dan Wawancara'),
('POLRI', 'Penerimaan Anggota Polri', 'Seleksi Bintara, Akpol, dan SIPSS'),
('TNI', 'Penerimaan Prajurit TNI', 'Seleksi Taruna Akmil, AAL, AAU, dan Bintara TNI')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- Insert Paket Soal
INSERT INTO `exam_packages` (`id`, `slug`, `title`, `category_code`, `year_edition`, `duration_minutes`, `total_questions`, `description`) VALUES
(1, 'cpns-skd', 'Simulasi CAT SKD CPNS 2026 (TWK, TIU, TKP)', 'CPNS', 'Edisi 2026', 100, 110, 'Simulasi resmi Seleksi Kompetensi Dasar sesuai PermenPAN-RB terbaru.'),
(2, 'pppk', 'Simulasi Seleksi Kompetensi PPPK 2026', 'PPPK', 'Edisi 2026', 90, 90, 'Manajerial, Sosio-Kultural, dan Wawancara berbasis komputer.'),
(3, 'polri', 'Simulasi Tes Akademik & Psikotes POLRI 2026', 'POLRI', 'Edisi 2026', 90, 100, 'Pengetahuan umum, wawasan kepolisian, dan psikotes kecermatan.'),
(4, 'tni', 'Simulasi Tes Potensi Akademik & Mental Ideologi TNI 2026', 'TNI', 'Edisi 2026', 90, 100, 'Sejarah perjuangan militer dan ketahanan ideologi Pancasila.')
ON DUPLICATE KEY UPDATE `title`=VALUES(`title`);

-- Insert Passing Grades untuk CPNS
INSERT INTO `passing_grades` (`package_id`, `subtest_code`, `subtest_name`, `min_score`, `max_score`, `description`) VALUES
(1, 'TWK', 'Tes Wawasan Kebangsaan', 65, 150, 'Passing Grade: 65'),
(1, 'TIU', 'Tes Inteligensia Umum', 80, 175, 'Passing Grade: 80'),
(1, 'TKP', 'Tes Karakteristik Pribadi', 166, 225, 'Passing Grade: 166'),
(2, 'MANAJERIAL', 'Kompetensi Manajerial', 65, 100, 'Passing Grade: 65'),
(2, 'SOSIO_KULTURAL', 'Kompetensi Sosio-Kultural', 71, 100, 'Passing Grade: 71'),
(2, 'WAWANCARA', 'Wawancara Berbasis Komputer', 24, 40, 'Passing Grade: 24')
ON DUPLICATE KEY UPDATE `min_score`=VALUES(`min_score`);

-- Insert Contoh Soal TWK
INSERT INTO `questions` (`id`, `package_id`, `subtest_code`, `subtest_label`, `question_text`, `correct_answer`, `explanation`, `tips_trick`) VALUES
(1, 1, 'TWK', 'Tes Wawasan Kebangsaan', 'Pancasila sebagai dasar negara memiliki dimensi fleksibilitas. Maksud dimensi fleksibilitas adalah...', 'B', 'Fleksibilitas mencerminkan keterbukaan ideologi tanpa mengubah nilai esensi dasarnya.', 'Ingat 3 dimensi: Idealitas, Realitas, Fleksibilitas.')
ON DUPLICATE KEY UPDATE `question_text`=VALUES(`question_text`);

INSERT INTO `options` (`question_id`, `option_key`, `option_text`, `score`) VALUES
(1, 'A', 'Nilai Pancasila dapat diubah sesuai kehendak penguasa.', 0),
(1, 'B', 'Pancasila memiliki keluwesan pengembangan pemikiran baru tanpa mengubah nilai dasar.', 5),
(1, 'C', 'Bebas ditafsirkan tanpa rujukan konstitusi.', 0),
(1, 'D', 'Dapat digantikan sewaktu-waktu.', 0),
(1, 'E', 'Terbuka pada komunisme dan liberalisme murni.', 0)
ON DUPLICATE KEY UPDATE `option_text`=VALUES(`option_text`);
