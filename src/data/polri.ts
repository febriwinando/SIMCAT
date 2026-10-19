import type { ExamPackage } from './types';

export const polriPackage: ExamPackage = {
  id: 'polri-akademik-psikotes-2026',
  slug: 'polri',
  title: 'Simulasi Tes Potensi Akademik & Psikotes POLRI 2026',
  category: 'POLRI',
  badgeClass: 'badge-polri',
  description: 'Simulasi seleksi Bintara dan Akpol: Pengetahuan Umum, Wawasan Kebangsaan, Bahasa Inggris, Matematika Terapan, dan Psikotes Kecermatan.',
  yearEdition: 'Edisi Penerimaan POLRI 2026',
  durationMinutes: 90,
  totalQuestions: 100,
  passingGrades: [
    { code: 'AKADEMIK', name: 'Pengetahuan Umum & Kebangsaan', minScore: 60, maxScore: 100, description: 'Passing Grade: 60' },
    { code: 'PSIKOTES', name: 'Psikotes & Kecermatan', minScore: 61, maxScore: 100, description: 'Passing Grade: 61 (Standar MS/TMS)' }
  ],
  rules: [
    'Durasi pengerjaan: 90 menit.',
    'Standar kelulusan: Memenuhi Syarat (MS) dengan nilai minimal 61 pada masing-masing subtes.',
    'Soal menguji ketelitian, logika praktis, ketahanan stres, dan wawasan hukum perundang-undangan kepolisian.'
  ],
  questions: [
    {
      id: 201,
      subtest: 'AKADEMIK',
      subtestLabel: 'Pengetahuan Umum & Hukum',
      questionText: 'Tugas pokok Kepolisian Negara Republik Indonesia sebagaimana termaktub dalam Pasal 13 Undang-Undang Nomor 2 Tahun 2002 adalah...',
      options: [
        { key: 'A', text: 'Mempertahankan kedaulatan negara dari ancaman militer asing.', score: 0 },
        { key: 'B', text: 'Memelihara keamanan dan ketertiban masyarakat; menegakkan hukum; serta memberikan perlindungan, pengayoman, dan pelayanan kepada masyarakat.', score: 5 },
        { key: 'C', text: 'Menjalankan fungsi intelijen strategis luar negeri dan pengamanan perbatasan negara.', score: 0 },
        { key: 'D', text: 'Mengawasi jalannya peradilan umum dan mengadili perkara pidana khusus.', score: 0 },
        { key: 'E', text: 'Menegakkan disiplin internal aparatur sipil negara di lingkungan kementerian.', score: 0 }
      ],
      correctAnswer: 'B',
      explanation: 'Pasal 13 UU No. 2 Tahun 2002 tentang Polri menyebutkan bahwa tugas pokok Polri adalah: a. memelihara keamanan dan ketertiban masyarakat (kamtibmas); b. menegakkan hukum; dan c. memberikan perlindungan, pengayoman, dan pelayanan kepada masyarakat (harkamtibmas).',
      tipsTrick: 'Ingat trias fungsi Polri: 1. Harkamtibmas (Keamanan & Ketertiban), 2. Gakkum (Penegakan Hukum), 3. Lindung, Ayom, Layan (Pelayanan Masyarakat).'
    },
    {
      id: 202,
      subtest: 'AKADEMIK',
      subtestLabel: 'Pengetahuan Umum & Geopolitik',
      questionText: 'Deklarasi Djuanda yang dicetuskan pada tanggal 13 Desember 1957 memiliki arti strategis yang sangat fundamental bagi Negara Kesatuan Republik Indonesia, yaitu...',
      options: [
        { key: 'A', text: 'Menetapkan garis batas darat antara Indonesia dengan Malaysia di Pulau Kalimantan.', score: 0 },
        { key: 'B', text: 'Menyatakan bahwa laut di antara dan di dalam kepulauan Indonesia adalah satu kesatuan utuh wilayah kedaulatan NKRI (Konsep Negara Kepulauan/Archipelagic State).', score: 5 },
        { key: 'C', text: 'Pengakuan internasional atas kemerdekaan Indonesia oleh Perserikatan Bangsa-Bangsa.', score: 0 },
        { key: 'D', text: 'Kesepakatan pembagian zona ekonomi eksklusif di Laut Cina Selatan.', score: 0 },
        { key: 'E', text: 'Penyerahan kembali Irian Barat dari Belanda ke pangkuan Republik Indonesia.', score: 0 }
      ],
      correctAnswer: 'B',
      explanation: 'Sebelum Deklarasi Djuanda, wilayah laut Indonesia hanya 3 mil dari garis pantai berdasarkan Territoriale Zee en Maritieme Kringen Ordonnantie 1939, sehingga laut antarpulau dianggap laut internasional bebas. Deklarasi Djuanda menegaskan batas laut teritorial 12 mil dari garis pantai luar kepulauan, menyatukan darat dan laut menjadi satu kesatuan NKRI utuh (kemudian diakui di UNCLOS 1982).',
      tipsTrick: 'Deklarasi Djuanda (13 Des 1957) = Tonggak Konsep Nusantara & Hari Nusantara.'
    },
    {
      id: 203,
      subtest: 'PSIKOTES',
      subtestLabel: 'Psikotes Kecermatan & Angka Hilang',
      questionText: 'Perhatikan kolom kunci berikut:\n\n[ A : 7 ]  [ B : 4 ]  [ C : 9 ]  [ D : 2 ]  [ E : 6 ]\n\nJika pada soal muncul kombinasi angka:  4  7  6  9 \nMaka huruf/angka yang HILANG adalah...',
      options: [
        { key: 'A', text: 'Huruf A (angka 7)', score: 0 },
        { key: 'B', text: 'Huruf B (angka 4)', score: 0 },
        { key: 'C', text: 'Huruf C (angka 9)', score: 0 },
        { key: 'D', text: 'Huruf D (angka 2)', score: 5 },
        { key: 'E', text: 'Huruf E (angka 6)', score: 0 }
      ],
      correctAnswer: 'D',
      explanation: 'Kolom kunci memiliki 5 angka: 7 (A), 4 (B), 9 (C), 2 (D), 6 (E). Pada baris soal terdapat angka 4, 7, 6, 9. Angka yang tidak tercantum dalam baris tersebut adalah angka 2, yang merupakan milik huruf D.',
      tipsTrick: 'Trik Tes Kecermatan: Cari angka dari kunci yang TIDAK ada di deret soal. Kunci = {2, 4, 6, 7, 9}. Soal = {4, 6, 7, 9}. Angka 2 (D) hilang.'
    },
    {
      id: 204,
      subtest: 'PSIKOTES',
      subtestLabel: 'Logika Penalaran & Ketahanan',
      questionText: 'Dalam situasi patroli malam, Anda dan rekan mendapati seorang pemuda yang merupakan keponakan dari seorang perwira tinggi kepolisian kedapatan membawa senjata tajam tanpa izin di kawasan rawan tawuran. Tindakan Anda adalah...',
      options: [
        { key: 'A', text: 'Membiarkannya pergi dan hanya memberikan nasihat lisan karena menghormati atasannya.', score: 0 },
        { key: 'B', text: 'Mengamankan pemuda dan barang bukti tersebut ke polsek terdekat sesuai prosedur SOP tanpa diskriminasi, serta membuat berita acara pemeriksaan.', score: 5 },
        { key: 'C', text: 'Meminta uang damai di tempat agar persoalan tidak sampai ke ranah hukum.', score: 0 },
        { key: 'D', text: 'Langsung menghubungi perwira tinggi tersebut secara pribadi untuk meminta arahan penyelesaian kekeluargaan.', score: 1 },
        { key: 'E', text: 'Menyita senjatanya lalu menyuruh pemuda tersebut lari menjauh dari lokasi.', score: 1 }
      ],
      correctAnswer: 'B',
      explanation: 'Asas Equality Before the Law (Persamaan di Hadapan Hukum) dan Kode Etik Profesi Polri: Anggota Polri tidak boleh diskriminatif atau menyalahgunakan wewenang atas dasar hubungan kekerabatan atau hierarki kekuasaan saat menangani tindak pidana/pelanggaran hukum.',
      tipsTrick: 'Kunci Etika Kepolisian: Taat SOP, profesional, tegakkan hukum tanpa pandang bulu, amankan barang bukti resmi.'
    }
  ]
};
