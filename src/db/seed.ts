import { getDb } from './index';
import crypto from 'node:crypto';
import { cpnsSkdPackage } from '../data/cpns-skd';
import { pppkPackage } from '../data/pppk';

function hashPassword(password: string): string {
  // Safe SHA-256 with salt for demo environment
  return crypto.createHash('sha256').update(`simcat_salt_${password}`).digest('hex');
}

export function runSeed(): void {
  const db = getDb();
  console.log('🌱 Starting SIMCAT Database Seeding...');

  // 1. Roles
  const roles = [
    {
      id: 'superadmin',
      name: 'Super Administrator',
      description: 'Akses penuh seluruh konfigurasi, audit log, dan peran sistem.',
      permissions: JSON.stringify(['*'])
    },
    {
      id: 'admin_ops',
      name: 'Admin Operasional',
      description: 'Pengelolaan peserta, paket simulasi, penjadwalan tryout, dan publikasi hasil.',
      permissions: JSON.stringify(['users:manage', 'packages:manage', 'attempts:manage', 'reports:read'])
    },
    {
      id: 'admin_finance',
      name: 'Admin Keuangan',
      description: 'Verifikasi status transaksi pembayaran, order, dan rekap pendapatan.',
      permissions: JSON.stringify(['finance:read', 'finance:verify', 'orders:manage'])
    },
    {
      id: 'reviewer',
      name: 'Reviewer / Verifikator Soal',
      description: 'Pemeriksaan akurasi soal, kunci jawaban, dan persetujuan publikasi butir soal.',
      permissions: JSON.stringify(['questions:read', 'questions:review', 'questions:approve'])
    },
    {
      id: 'editor',
      name: 'Editor Bank Soal',
      description: 'Pembuatan dan pembaruan butir soal, stimulus, dan pembahasan materi.',
      permissions: JSON.stringify(['questions:write', 'questions:read'])
    },
    {
      id: 'examinee',
      name: 'Peserta Ujian',
      description: 'Mengikuti simulasi, menyimpan jawaban, melihat hasil dan pembahasan resmi.',
      permissions: JSON.stringify(['exam:take', 'exam:history', 'bookmarks:manage'])
    },
    {
      id: 'visitor',
      name: 'Pengunjung Publik',
      description: 'Melihat katalog simulasi, panduan, dan mencoba paket latihan gratis.',
      permissions: JSON.stringify(['public:read'])
    }
  ];

  const insertRole = db.prepare(`
    INSERT OR REPLACE INTO roles (id, name, description, permissions)
    VALUES (?, ?, ?, ?)
  `);
  for (const r of roles) {
    insertRole.run(r.id, r.name, r.description, r.permissions);
  }

  // 2. Demo Users
  const users = [
    {
      uuid: 'usr-superadmin-01',
      email: 'superadmin@simcat.id',
      pass: hashPassword('simcat2026'),
      role: 'superadmin',
      name: 'Hendra Wijaya, S.Kom, M.T.',
      nik: '3201************0001',
      instansi: 'Panitia Pusat SIMCAT'
    },
    {
      uuid: 'usr-admin-ops-01',
      email: 'admin@simcat.id',
      pass: hashPassword('simcat2026'),
      role: 'admin_ops',
      name: 'Siti Rahmawati, S.AP.',
      nik: '3201************0002',
      instansi: 'Divisi Operasional & Ujian'
    },
    {
      uuid: 'usr-reviewer-01',
      email: 'reviewer@simcat.id',
      pass: hashPassword('simcat2026'),
      role: 'reviewer',
      name: 'Dr. Bambang Subagyo, M.Pd.',
      nik: '3201************0003',
      instansi: 'Tim Ahli Validasi Materi'
    },
    {
      uuid: 'usr-editor-01',
      email: 'editor@simcat.id',
      pass: hashPassword('simcat2026'),
      role: 'editor',
      name: 'Anisa Kusuma, S.Pd.',
      nik: '3201************0004',
      instansi: 'Tim Penyusun Konten'
    },
    {
      uuid: 'usr-peserta-01',
      email: 'peserta@simcat.id',
      pass: hashPassword('simcat2026'),
      role: 'examinee',
      name: 'Rizky Pratama',
      nik: '3273************0015',
      instansi: 'Kementerian Keuangan'
    },
    {
      uuid: 'usr-peserta-02',
      email: 'budi.santoso@simcat.id',
      pass: hashPassword('simcat2026'),
      role: 'examinee',
      name: 'Budi Santoso',
      nik: '3171************0088',
      instansi: 'PT Pertamina (Persero)'
    }
  ];

  const insertUser = db.prepare(`
    INSERT OR REPLACE INTO users (uuid, email, password_hash, role_id, status)
    VALUES (?, ?, ?, ?, 'active')
  `);
  const insertProfile = db.prepare(`
    INSERT OR REPLACE INTO user_profiles (user_id, full_name, nik_masked, target_instansi)
    VALUES (?, ?, ?, ?)
  `);

  for (const u of users) {
    insertUser.run(u.uuid, u.email, u.pass, u.role);
    const createdUser = db.prepare('SELECT id FROM users WHERE email = ?').get(u.email) as { id: number };
    if (createdUser) {
      insertProfile.run(createdUser.id, u.name, u.nik, u.instansi);
    }
  }

  // 3. Exam Categories (4 Rumpun Seleksi Utama)
  const categories = [
    {
      id: 'cpns',
      name: 'CPNS (Calon Pegawai Negeri Sipil)',
      desc: 'Simulasi Seleksi Kompetensi Dasar (SKD) resmi berstandar BKN: TWK, TIU, dan TKP sesuai KepmenPAN-RB.',
      icon: '🏛️',
      order: 1
    },
    {
      id: 'pppk',
      name: 'PPPK (Pegawai Pemerintah dg Perjanjian Kerja)',
      desc: 'Simulasi Seleksi Kompetensi Teknis, Manajerial, Sosial Kultural, dan Wawancara berstandar nasional.',
      icon: '📑',
      order: 2
    },
    {
      id: 'bumn',
      name: 'BUMN (Rekrutmen Bersama BUMN)',
      desc: 'Simulasi Tes Kemampuan Dasar (TKD) & Core Values AKHLAK sesuai kurikulum Forum Human Capital Indonesia (FHCI).',
      icon: '🏢',
      order: 3
    },
    {
      id: 'sekolah-kedinasan',
      name: 'Sekolah Kedinasan',
      desc: 'Simulasi Seleksi Kompetensi Dasar (SKD) & Tes Potensi Akademik untuk IPDN, STAN, STIS, Poltekip, dan Poltekim.',
      icon: '🎓',
      order: 4
    }
  ];

  const insertCat = db.prepare(`
    INSERT OR REPLACE INTO exam_categories (id, name, description, icon, sort_order)
    VALUES (?, ?, ?, ?, ?)
  `);
  for (const c of categories) {
    insertCat.run(c.id, c.name, c.desc, c.icon, c.order);
  }

  // 4. Subjects
  const subjects = [
    // CPNS
    { id: 'cpns-twk', cat: 'cpns', name: 'Tes Wawasan Kebangsaan (TWK)', code: 'TWK', desc: 'Nasionalisme, Integritas, Bela Negara, Pilar Negara, Bahasa Indonesia' },
    { id: 'cpns-tiu', cat: 'cpns', name: 'Tes Inteligensia Umum (TIU)', code: 'TIU', desc: 'Verbal, Numerik, Logika, dan Figural' },
    { id: 'cpns-tkp', cat: 'cpns', name: 'Tes Karakteristik Pribadi (TKP)', code: 'TKP', desc: 'Pelayanan Publik, Jejaring Kerja, Sosial Budaya, TIK, Profesionalisme, Anti-Radikalisme' },
    // PPPK
    { id: 'pppk-teknis', cat: 'pppk', name: 'Kompetensi Teknis', code: 'TEKNIS', desc: 'Penguasaan keahlian spesifik jabatan formasi' },
    { id: 'pppk-manajerial', cat: 'pppk', name: 'Kompetensi Manajerial', code: 'MANAJERIAL', desc: 'Integritas, kerja sama, komunikasi, dan orientasi hasil' },
    { id: 'pppk-sosiokultural', cat: 'pppk', name: 'Kompetensi Sosial Kultural', code: 'SOSKUL', desc: 'Kepekaan terhadap keberagaman dan relasi sosial' },
    { id: 'pppk-wawancara', cat: 'pppk', name: 'Wawancara Terstandar', code: 'WAWANCARA', desc: 'Komitmen etika, moralitas, dan integritas kerja' },
    // BUMN
    { id: 'bumn-tkd', cat: 'bumn', name: 'Tes Kemampuan Dasar (TKD)', code: 'TKD', desc: 'Kemampuan verbal, logika analitis, dan numerik BUMN' },
    { id: 'bumn-akhlak', cat: 'bumn', name: 'Core Values AKHLAK BUMN', code: 'AKHLAK', desc: 'Amanah, Kompeten, Harmonis, Loyal, Adaptif, Kolaboratif' },
    // Sekolah Kedinasan
    { id: 'kedinasan-skd', cat: 'sekolah-kedinasan', name: 'SKD Kedinasan BKN', code: 'SKD-KEDINASAN', desc: 'TWK, TIU, dan TKP standar ambang batas sekolah kedinasan' },
    { id: 'kedinasan-tpa', cat: 'sekolah-kedinasan', name: 'Tes Potensi Akademik Kedinasan', code: 'TPA', desc: 'Penalaran analitis tingkat lanjut dan penguasaan kuantitatif' }
  ];

  const insertSubj = db.prepare(`
    INSERT OR REPLACE INTO subjects (id, category_id, name, code, description)
    VALUES (?, ?, ?, ?, ?)
  `);
  for (const s of subjects) {
    insertSubj.run(s.id, s.cat, s.name, s.code, s.desc);
  }

  // 5. Scoring Rules (Config-driven, decoupled from frontend)
  const scoringRules = [
    {
      id: 'rule-cpns-skd-2026',
      name: 'Standar Penilaian SKD CPNS 2026 (KepmenPAN-RB)',
      cat: 'cpns',
      source: 'KepmenPAN-RB No. 321 Tahun 2024 / Simulasi Resmi 2026',
      version: '2026.1',
      rules: JSON.stringify({
        subtests: {
          'cpns-twk': { name: 'TWK', passingGrade: 65, totalQuestions: 30, correctScore: 5, wrongScore: 0, blankScore: 0 },
          'cpns-tiu': { name: 'TIU', passingGrade: 80, totalQuestions: 35, correctScore: 5, wrongScore: 0, blankScore: 0 },
          'cpns-tkp': { name: 'TKP', passingGrade: 166, totalQuestions: 45, isScaleOption: true, scaleMin: 1, scaleMax: 5, blankScore: 0 }
        },
        maxScore: 550,
        passingCondition: 'ALL_SUBTESTS_MUST_PASS'
      }),
      notes: 'Ambang batas umum: TWK 65, TIU 80, TKP 166. Total 110 butir, durasi 100 menit.'
    },
    {
      id: 'rule-pppk-2026',
      name: 'Standar Penilaian Seleksi Kompetensi PPPK 2026',
      cat: 'pppk',
      source: 'Pedoman Penilaian PPPK BKN',
      version: '2026.1',
      rules: JSON.stringify({
        subtests: {
          'pppk-teknis': { name: 'Teknis', passingGrade: 180, correctScore: 5, wrongScore: 0, blankScore: 0 },
          'pppk-manajerial': { name: 'Manajerial & Sosbud', passingGrade: 117, isScaleOption: true, scaleMin: 1, scaleMax: 4, blankScore: 0 },
          'pppk-wawancara': { name: 'Wawancara', passingGrade: 24, isScaleOption: true, scaleMin: 1, scaleMax: 4, blankScore: 0 }
        },
        maxScore: 670,
        passingCondition: 'ALL_SUBTESTS_MUST_PASS'
      }),
      notes: 'Kompetensi Teknis berbobot 5 per jawaban benar, Manajerial skala 1-4.'
    },
    {
      id: 'rule-bumn-2026',
      name: 'Standar Kelulusan RBB BUMN 2026 (FHCI)',
      cat: 'bumn',
      source: 'Petunjuk Teknis Rekrutmen Bersama BUMN FHCI',
      version: '2026.1',
      rules: JSON.stringify({
        subtests: {
          'bumn-tkd': { name: 'TKD BUMN', passingGrade: 58, correctScore: 1, wrongScore: 0, blankScore: 0 },
          'bumn-akhlak': { name: 'AKHLAK Core Values', passingGrade: 65, correctScore: 1, wrongScore: 0, blankScore: 0 }
        },
        maxScore: 100,
        passingCondition: 'ALL_SUBTESTS_MUST_PASS'
      }),
      notes: 'Skor ambang batas minimal TKD 58 dan AKHLAK minimal 65.'
    },
    {
      id: 'rule-kedinasan-2026',
      name: 'Standar Ambang Batas Sekolah Kedinasan 2026',
      cat: 'sekolah-kedinasan',
      source: 'KepmenPAN-RB Seleksi Penerimaan Mahasiswa/Praja/Taruna Kedinasan',
      version: '2026.1',
      rules: JSON.stringify({
        subtests: {
          'kedinasan-skd': { name: 'SKD Kedinasan', passingGrade: 311, correctScore: 5, wrongScore: 0, blankScore: 0 },
          'kedinasan-tpa': { name: 'TPA Instansi', passingGrade: 60, correctScore: 4, wrongScore: -1, blankScore: 0 }
        },
        maxScore: 650,
        passingCondition: 'ALL_SUBTESTS_MUST_PASS'
      }),
      notes: 'TPA menerapkan penalti -1 jika salah sesuai standar ujian akademik kedinasan.'
    }
  ];

  const insertRule = db.prepare(`
    INSERT OR REPLACE INTO scoring_rules (id, name, category_id, reference_source, version, rules_json, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  for (const sr of scoringRules) {
    insertRule.run(sr.id, sr.name, sr.cat, sr.source, sr.version, sr.rules, sr.notes);
  }

  // 6. Exam Packages
  const packages = [
    {
      slug: 'cpns-skd',
      title: 'Simulasi CAT SKD CPNS 2026 (TWK, TIU, TKP)',
      cat: 'cpns',
      ruleId: 'rule-cpns-skd-2026',
      duration: 100,
      totalQ: 15, // Demo set: 15 comprehensive questions
      desc: 'Paket simulasi komprehensif CAT SKD CPNS mencakup 30 soal TWK, 35 soal TIU, dan 45 soal TKP dengan sistem penilaian berstandar KepmenPAN-RB 2024/2026.',
      isFree: 1,
      price: 0
    },
    {
      slug: 'pppk',
      title: 'Simulasi Seleksi Kompetensi PPPK 2026',
      cat: 'pppk',
      ruleId: 'rule-pppk-2026',
      duration: 120,
      totalQ: 10,
      desc: 'Simulasi tryout kompetensi teknis jabatan, manajerial, sosio-kultural, dan wawancara terstandarisasi untuk persiapan tes PPPK 2026.',
      isFree: 1,
      price: 0
    },
    {
      slug: 'bumn',
      title: 'Simulasi Rekrutmen Bersama BUMN 2026 (TKD & AKHLAK)',
      cat: 'bumn',
      ruleId: 'rule-bumn-2026',
      duration: 90,
      totalQ: 10,
      desc: 'Latihan soal Tes Kemampuan Dasar (TKD) dan pemahaman implementasi Core Values AKHLAK BUMN sesuai kisi-kisi resmi FHCI.',
      isFree: 1,
      price: 0
    },
    {
      slug: 'sekolah-kedinasan',
      title: 'Simulasi CAT Sekolah Kedinasan 2026 (IPDN, STAN, STIS)',
      cat: 'sekolah-kedinasan',
      ruleId: 'rule-kedinasan-2026',
      duration: 100,
      totalQ: 10,
      desc: 'Paket latihan soal SKD dan Tes Potensi Akademik (TPA) persiapan masuk sekolah kedinasan favorit tahun ajaran 2026/2027.',
      isFree: 1,
      price: 0
    }
  ];

  const insertPkg = db.prepare(`
    INSERT OR REPLACE INTO exam_packages (slug, title, category_id, scoring_rule_id, duration_minutes, total_questions, description, is_free, price, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'published')
  `);
  for (const p of packages) {
    insertPkg.run(p.slug, p.title, p.cat, p.ruleId, p.duration, p.totalQ, p.desc, p.isFree, p.price);
  }

  // 7. Questions Seeding from Existing Data Sources
  const insertQuestion = db.prepare(`
    INSERT INTO questions (uuid, category_id, subject_id, question_text, stimulus_text, difficulty, editorial_status)
    VALUES (?, ?, ?, ?, ?, ?, 'published')
  `);
  const insertOption = db.prepare(`
    INSERT INTO question_options (question_id, option_key, option_text, is_correct, score_weight)
    VALUES (?, ?, ?, ?, ?)
  `);
  const insertExplanation = db.prepare(`
    INSERT INTO question_explanations (question_id, explanation_text, quick_trick, reference_source)
    VALUES (?, ?, ?, ?)
  `);
  const insertPackageQuestion = db.prepare(`
    INSERT OR REPLACE INTO package_questions (package_id, question_id, sequence_order)
    VALUES (?, ?, ?)
  `);

  // Clear existing questions for clean seed
  db.exec('DELETE FROM question_options;');
  db.exec('DELETE FROM question_explanations;');
  db.exec('DELETE FROM package_questions;');
  db.exec('DELETE FROM questions;');

  // Seed CPNS Questions
  const cpnsPkg = db.prepare('SELECT id FROM exam_packages WHERE slug = ?').get('cpns-skd') as { id: number };
  let seq = 1;

  for (const q of cpnsSkdPackage.questions) {
    let subjId = 'cpns-twk';
    if (q.subtest.toUpperCase() === 'TIU') subjId = 'cpns-tiu';
    if (q.subtest.toUpperCase() === 'TKP') subjId = 'cpns-tkp';

    const qUuid = `q-cpns-${seq}`;
    const qText = q.questionText || '';
    const qRes = insertQuestion.run(qUuid, 'cpns', subjId, qText, null, 3);
    const qId = Number(qRes.lastInsertRowid);

    // Options
    for (const opt of q.options) {
      const optKey = opt.key;
      const isCorrect = (q.correctAnswer && optKey.toUpperCase() === q.correctAnswer.toUpperCase()) ? 1 : 0;
      const weight = opt.score ?? (isCorrect ? 5 : 0);
      insertOption.run(qId, optKey, opt.text, isCorrect, weight);
    }

    // Explanation
    insertExplanation.run(
      qId,
      q.explanation || 'Pembahasan materi terstandar SIMCAT.',
      q.tipsTrick || null,
      'KepmenPAN-RB 2024/2026'
    );

    // Map to Package
    if (cpnsPkg) {
      insertPackageQuestion.run(cpnsPkg.id, qId, seq);
    }
    seq++;
  }

  // Seed PPPK Questions
  const pppkPkg = db.prepare('SELECT id FROM exam_packages WHERE slug = ?').get('pppk') as { id: number };
  let pppkSeq = 1;

  for (const q of pppkPackage.questions) {
    const qUuid = `q-pppk-${pppkSeq}`;
    const qText = q.questionText || '';
    const qRes = insertQuestion.run(qUuid, 'pppk', 'pppk-teknis', qText, null, 3);
    const qId = Number(qRes.lastInsertRowid);

    for (const opt of q.options) {
      const optKey = opt.key;
      const isCorrect = (q.correctAnswer && optKey.toUpperCase() === q.correctAnswer.toUpperCase()) ? 1 : 0;
      const weight = opt.score ?? (isCorrect ? 5 : 0);
      insertOption.run(qId, optKey, opt.text, isCorrect, weight);
    }

    insertExplanation.run(qId, q.explanation, q.tipsTrick || null, 'Panduan Teknis PPPK 2026');

    if (pppkPkg) {
      insertPackageQuestion.run(pppkPkg.id, qId, pppkSeq);
    }
    pppkSeq++;
  }

  // Seed BUMN Sample Questions
  const bumnPkg = db.prepare('SELECT id FROM exam_packages WHERE slug = ?').get('bumn') as { id: number };
  const bumnSample = [
    {
      q: 'Dalam nilai inti AKHLAK BUMN, nilai "Harmonis" diwujudkan melalui perilaku utama berikut:',
      options: [
        { key: 'A', text: 'Menghargai setiap orang apapun latar belakangnya serta suka menolong orang lain', isCorrect: 1, weight: 1 },
        { key: 'B', text: 'Memegang teguh kepercayaan yang diberikan oleh pimpinan', isCorrect: 0, weight: 0 },
        { key: 'C', text: 'Terus belajar dan mengembangkan kapabilitas diri', isCorrect: 0, weight: 0 },
        { key: 'D', text: 'Mengutamakan kepentingan bangsa dan negara di atas kepentingan pribadi', isCorrect: 0, weight: 0 },
        { key: 'E', text: 'Membangun kerja sama yang sinergis antar unit kerja', isCorrect: 0, weight: 0 }
      ],
      exp: 'Nilai Harmonis dalam AKHLAK BUMN memiliki panduan perilaku: 1. Menghargai setiap orang apapun latar belakangnya, 2. Suka menolong orang lain, 3. Membangun lingkungan kerja yang kondusif.',
      subj: 'bumn-akhlak'
    },
    {
      q: 'Jika x = 24% dari 125, dan y = 125% dari 24, maka hubungan yang benar antara x dan y adalah...',
      options: [
        { key: 'A', text: 'x > y', isCorrect: 0, weight: 0 },
        { key: 'B', text: 'x < y', isCorrect: 0, weight: 0 },
        { key: 'C', text: 'x = y', isCorrect: 1, weight: 1 },
        { key: 'D', text: 'x = 2y', isCorrect: 0, weight: 0 },
        { key: 'E', text: 'Hubungan x dan y tidak dapat ditentukan', isCorrect: 0, weight: 0 }
      ],
      exp: 'Sifat perkalian persen: a% dari b = (a × b) / 100 = b% dari a. Maka 24% dari 125 = 125% dari 24 = 30. Sehingga x = y.',
      subj: 'bumn-tkd'
    }
  ];

  let bumnSeq = 1;
  for (const b of bumnSample) {
    const qRes = insertQuestion.run(`q-bumn-${bumnSeq}`, 'bumn', b.subj, b.q, null, 3);
    const qId = Number(qRes.lastInsertRowid);
    for (const opt of b.options) {
      insertOption.run(qId, opt.key, opt.text, opt.isCorrect, opt.weight);
    }
    insertExplanation.run(qId, b.exp, 'Gunakan sifat komutatif perkalian persentase: a% dari b = b% dari a.', 'Modul FHCI BUMN 2026');
    if (bumnPkg) {
      insertPackageQuestion.run(bumnPkg.id, qId, bumnSeq);
    }
    bumnSeq++;
  }

  // 8. Subscription Plans
  const plans = [
    {
      id: 'free',
      name: 'Akses Latihan Dasar',
      price: 0,
      duration: 365,
      features: JSON.stringify(['Simulasi Ujian Gratis', 'Timer Ujian Standar CAT', 'Scorecard Nilai Sederhana'])
    },
    {
      id: 'premium_monthly',
      name: 'SIMCAT Pro Bulanan',
      price: 99000,
      duration: 30,
      features: JSON.stringify(['Akses Semua Rumpun (CPNS, PPPK, BUMN, Kedinasan)', 'Pembahasan Trik Cepat', 'Analisis Radar Kelemahan Subtes', 'Bank Soal Ribuan Butir'])
    },
    {
      id: 'tryout_single',
      name: 'Tiket Tryout Nasional Serentak',
      price: 29000,
      duration: 7,
      features: JSON.stringify(['1x Sesi Tryout Nasional Terjadwal', 'Pemeringkatan Leaderboard Nasional', 'Sertifikat Prediksi Kelulusan'])
    }
  ];

  const insertPlan = db.prepare(`
    INSERT OR REPLACE INTO subscription_plans (id, name, price, duration_days, features_json)
    VALUES (?, ?, ?, ?, ?)
  `);
  for (const p of plans) {
    insertPlan.run(p.id, p.name, p.price, p.duration, p.features);
  }

  console.log('✅ SIMCAT Database Seeding Completed Successfully!');
}
