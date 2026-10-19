import type { ExamPackage } from './types';

export const tniPackage: ExamPackage = {
  id: 'tni-akademik-mental-ideologi-2026',
  slug: 'tni',
  title: 'Simulasi Tes Potensi Akademik & Mental Ideologi TNI 2026',
  category: 'TNI',
  badgeClass: 'badge-tni',
  description: 'Simulasi seleksi Taruna Akmil, AAL, AAU, dan Bintara TNI: Meliputi Sejarah Perjuangan Militer, Wawasan Nusantara, Bahasa Inggris, Matematika, dan Mental Ideologi (MI).',
  yearEdition: 'Edisi Penerimaan TNI 2026',
  durationMinutes: 90,
  totalQuestions: 100,
  passingGrades: [
    { code: 'AKADEMIK', name: 'Tes Potensi Akademik TNI', minScore: 60, maxScore: 100, description: 'Passing Grade: 60' },
    { code: 'MENTAL_IDEOLOGI', name: 'Mental Ideologi (Pancasila & Sapta Marga)', minScore: 65, maxScore: 100, description: 'Passing Grade: 65 (Standar MS)' }
  ],
  rules: [
    'Durasi pengerjaan: 90 menit.',
    'Standar kelulusan: Nilai Memenuhi Syarat (MS) pada aspek Akademik dan Mental Ideologi.',
    'Dilarang melakukan kecurangan dan pastikan mengutamakan loyalitas tegak lurus kepada NKRI.'
  ],
  questions: [
    {
      id: 301,
      subtest: 'AKADEMIK',
      subtestLabel: 'Sejarah Perjuangan & Doktrin Militer',
      questionText: 'Serangan Umum 1 Maret 1949 di Yogyakarta yang dipimpin oleh Letkol Soeharto atas prakarsa Sultan Hamengkubuwono IX dan Jenderal Sudirman memiliki dampak politis-diplomatis yang sangat krusial di kancah internasional, yaitu...',
      options: [
        { key: 'A', text: 'Mengusir seluruh tentara Belanda dari seluruh pulau Jawa dalam waktu satu hari.', score: 0 },
        { key: 'B', text: 'Membuktikan kepada PBB dan dunia internasional bahwa TNI dan eksistensi Republik Indonesia masih berdiri tegak, mematahkan propaganda Belanda.', score: 5 },
        { key: 'C', text: 'Menandatangani perjanjian penyerahan kedaulatan langsung dengan Ratu Juliana.', score: 0 },
        { key: 'D', text: 'Membubarkan Pemerintahan Darurat Republik Indonesia (PDRI) di Bukittinggi.', score: 0 },
        { key: 'E', text: 'Mendapatkan bantuan persenjataan tempur canggih dari Amerika Serikat.', score: 0 }
      ],
      correctAnswer: 'B',
      explanation: 'Serangan Umum 1 Maret 1949 berlangsung selama 6 jam (06.00 - 12.00) dan berhasil menguasai Yogyakarta. Meskipun secara taktis singkat, dampak strategisnya sangat besar: menyiarkan ke PBB dan media dunia bahwa TNI masih ada dan kuat, sekaligus mematahkan propaganda Belanda yang mengklaim RI telah musnah setelah Agresi Militer Belanda II.',
      tipsTrick: 'Poin Kunci Serangan Umum 1 Maret 1949: Pembuktian eksistensi TNI & RI di forum PBB (DK PBB) dan membungkam propaganda Belanda.'
    },
    {
      id: 302,
      subtest: 'AKADEMIK',
      subtestLabel: 'Pertahanan Negara & Doktrin Sishankamrata',
      questionText: 'Sistem pertahanan dan keamanan negara Indonesia menganut Sistem Pertahanan dan Keamanan Rakyat Semesta (Sishankamrata). Komponen utama dalam sistem pertahanan negara untuk menghadapi ancaman militer adalah...',
      options: [
        { key: 'A', text: 'Seluruh warga negara Indonesia tanpa kecuali', score: 0 },
        { key: 'B', text: 'Tentara Nasional Indonesia (TNI)', score: 5 },
        { key: 'C', text: 'Organisasi kemasyarakatan dan pemuda bela negara', score: 0 },
        { key: 'D', text: 'Kepolisian Negara Republik Indonesia bersama Satpol PP', score: 0 },
        { key: 'E', text: 'Komponen Cadangan (Komcad)', score: 0 }
      ],
      correctAnswer: 'B',
      explanation: 'Berdasarkan UU No. 3 Tahun 2002 tentang Pertahanan Negara, dalam menghadapi ancaman militer: \n1. Komponen Utama: Tentara Nasional Indonesia (TNI). \n2. Komponen Cadangan: Warga negara, sumber daya alam, sumber daya buatan, serta sarana prasarana nasional yang telah disiapkan untuk dikerahkan melalui mobilisasi. \n3. Komponen Pendukung: Warga negara, sumber daya dan sarana untuk meningkatkan kekuatan komponen utama dan cadangan.',
      tipsTrick: 'Ingat hierarki Sishankamrata: Komponen Utama = TNI. Komponen Cadangan = Komcad (bisa dimobilisasi). Komponen Pendukung = Ormas/Logistik/Sarpras.'
    },
    {
      id: 303,
      subtest: 'MENTAL_IDEOLOGI',
      subtestLabel: 'Mental Ideologi & Sapta Marga',
      questionText: 'Prajurit TNI berpedoman pada "Sapta Marga" dan "Sumpah Prajurit". Butir pertama Sumpah Prajurit berbunyi...',
      options: [
        { key: 'A', text: 'Setia kepada Negara Kesatuan Republik Indonesia yang berdasarkan Pancasila dan Undang-Undang Dasar 1945.', score: 5 },
        { key: 'B', text: 'Tunduk kepada hukum dan memegang teguh disiplin keprajuritan.', score: 0 },
        { key: 'C', text: 'Taat kepada atasan dengan tidak membantah perintah atau putusan.', score: 0 },
        { key: 'D', text: 'Menjalankan segala kewajiban dengan penuh rasa tanggung jawab kepada Tentara dan Negara.', score: 0 },
        { key: 'E', text: 'Memegang segala rahasia tentara sekeras-kerasnya.', score: 0 }
      ],
      correctAnswer: 'A',
      explanation: 'Sumpah Prajurit butir ke-1: "Setia kepada Negara Kesatuan Republik Indonesia yang berdasarkan Pancasila dan Undang-Undang Dasar 1945." Butir ke-2: Tunduk kepada hukum dan memegang teguh disiplin keprajuritan. Butir ke-3: Taat kepada atasan dengan tidak membantah perintah atau putusan. Butir ke-4: Menjalankan segala kewajiban dengan penuh rasa tanggung jawab kepada Tentara dan Negara Republik Indonesia. Butir ke-5: Memegang segala rahasia tentara sekeras-kerasnya.',
      tipsTrick: 'Hafal 5 butir Sumpah Prajurit: 1. Setia NKRI & Pancasila, 2. Disiplin, 3. Taat atasan, 4. Tanggung jawab, 5. Rahasia tentara.'
    },
    {
      id: 304,
      subtest: 'MENTAL_IDEOLOGI',
      subtestLabel: 'Ketahanan Ideologi Terhadap Faham Radikal',
      questionText: 'Jika seorang calon prajurit menemukan kelompok diskusi online tertutup yang mengajak pengikutnya mengganti ideologi Pancasila dengan sistem khilafah atau faham komunisme/marxisme, sikap mental ideologi yang benar adalah...',
      options: [
        { key: 'A', text: 'Ikut bergabung secara pasif hanya untuk mencari tahu strategi mereka.', score: 0 },
        { key: 'B', text: 'Menolak secara tegas segala faham yang bertentangan dengan Pancasila, keluar dari grup, serta melaporkannya kepada aparat berwenang/satuan intelijen.', score: 5 },
        { key: 'C', text: 'Mendiamkan saja karena kebebasan berekspresi dilindungi oleh undang-undang di internet.', score: 0 },
        { key: 'D', text: 'Mengajak anggota keluarga lain untuk menyimak argumen dalam grup tersebut.', score: 0 },
        { key: 'E', text: 'Mendukung gerakan tersebut jika menjanjikan kesejahteraan rakyat yang lebih baik.', score: 0 }
      ],
      correctAnswer: 'B',
      explanation: 'Tes Mental Ideologi (MI) menuntut kemurnian kesetiaan tanpa syarat kepada Pancasila dan NKRI. Setiap faham yang ingin mengganti atau merongrong Pancasila (baik ekstrim kiri maupun ekstrim kanan) adalah ancaman kedaulatan yang wajib ditolak dan dilaporkan secara tegas.',
      tipsTrick: 'Kunci Mental Ideologi: Kesetiaan tegak lurus pada Pancasila & NKRI adalah harga mati. Tidak ada ruang toleransi bagi faham anti-Pancasila.'
    }
  ]
};
