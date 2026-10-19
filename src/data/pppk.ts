import type { ExamPackage } from './types';

export const pppkPackage: ExamPackage = {
  id: 'pppk-seleksi-2026',
  slug: 'pppk',
  title: 'Simulasi CAT Seleksi Kompetensi PPPK 2026',
  category: 'PPPK',
  badgeClass: 'badge-pppk',
  description: 'Simulasi Seleksi Kompetensi PPPK: Kompetensi Manajerial, Sosio-Kultural, dan Wawancara berbasis integritas dan moralitas ASN.',
  yearEdition: 'Edisi PPPK 2026',
  durationMinutes: 90,
  totalQuestions: 90,
  passingGrades: [
    { code: 'MANAJERIAL', name: 'Kompetensi Manajerial', minScore: 65, maxScore: 100, description: 'Passing Grade: 65 (Skala bobot 1-4)' },
    { code: 'SOSIO_KULTURAL', name: 'Kompetensi Sosio-Kultural', minScore: 71, maxScore: 100, description: 'Passing Grade: 71 (Skala bobot 1-4)' },
    { code: 'WAWANCARA', name: 'Wawancara Berbasis Komputer', minScore: 24, maxScore: 40, description: 'Passing Grade: 24 (Skala bobot 1-4)' }
  ],
  rules: [
    'Durasi pengerjaan simulasi adalah 90 menit.',
    'Seluruh soal menggunakan skala bobot jawaban berjenjang (bobot 1 sampai 4).',
    'Tidak ada pengurangan nilai untuk jawaban yang salah.',
    'Pastikan seluruh butir pertanyaan terisi sebelum waktu ujian habis.'
  ],
  questions: [
    {
      id: 101,
      subtest: 'MANAJERIAL',
      subtestLabel: 'Kompetensi Manajerial',
      questionText: 'Ketika tim kerja Anda dihadapkan pada kegagalan memenuhi target program kuartalan yang disebabkan oleh kelalaian salah satu anggota tim, tindakan Anda sebagai ketua tim adalah...',
      options: [
        { key: 'A', text: 'Melaporkan nama anggota tersebut kepada pimpinan agar dia bertanggung jawab secara personal.', score: 1 },
        { key: 'B', text: 'Mengambil alih seluruh tanggung jawab kegagalan tanpa membicarakan masalah kelalaian anggota tersebut.', score: 2 },
        { key: 'C', text: 'Mengajak seluruh anggota tim melakukan evaluasi retrospektif bersama, mengidentifikasi akar kelalaian, memberikan teguran konstruktif, dan menyusun rencana pemulihan target.', score: 4 },
        { key: 'D', text: 'Mengabaikan kesalahan masa lalu dan langsung memulai tugas kuartal berikutnya dengan target yang dikurangi.', score: 1 },
        { key: 'E', text: 'Meminta anggota tim lain memberikan kompensasi kerja lembur untuk menutupi kelalaian rekan tersebut.', score: 3 }
      ],
      correctAnswer: 'C',
      explanation: 'Kompetensi Manajerial (Pengambilan Keputusan & Mengembangkan Orang Lain): Seorang pemimpin bertanggung jawab atas output tim, namun harus adil melakukan evaluasi, memberikan umpan balik korektif yang mendidik, dan merumuskan aksi perbaikan kolektif.',
      tipsTrick: 'Kunci Manajerial: Pemimpin tidak melempar kesalahan, melainkan merangkul tim untuk evaluasi obyektif dan rencana aksi solutif.'
    },
    {
      id: 102,
      subtest: 'MANAJERIAL',
      subtestLabel: 'Kompetensi Manajerial',
      questionText: 'Anda ditunjuk memimpin proyek pengadaan fasilitas umum yang harus selesai dalam 2 bulan. Di tengah perjalanan, anggaran dipotong 15% oleh pemerintah pusat karena penyesuaian prioritas nasional. Langkah manajerial Anda adalah...',
      options: [
        { key: 'A', text: 'Menghentikan proyek sampai anggaran dikembalikan ke jumlah semula.', score: 1 },
        { key: 'B', text: 'Melakukan peninjauan ulang rencana kerja, menyusun prioritas fitur utama yang paling mendesak bagi masyarakat, dan menegosiasikan efisiensi biaya dengan penyedia jasa.', score: 4 },
        { key: 'C', text: 'Mengurangi kualitas bahan bangunan tanpa menginformasikan hal tersebut kepada pihak manapun agar proyek tetap selesai.', score: 1 },
        { key: 'D', text: 'Menyerahkan kembali mandat kepemimpinan proyek kepada atasan karena kondisi anggaran tidak memungkinkan.', score: 2 },
        { key: 'E', text: 'Meminta donasi masyarakat sekitar untuk menutupi kekurangan anggaran 15% tersebut.', score: 2 }
      ],
      correctAnswer: 'B',
      explanation: 'Kompetensi Manajerial (Orientasi pada Hasil & Integritas): Menghadapi keterbatasan sumber daya, aparatur harus tangkas mengoptimalkan prioritas nilai guna masyarakat secara transparan tanpa mengorbankan integritas keselamatan.',
      tipsTrick: 'Kunci Efisiensi Anggaran: Skala prioritas, optimasi fungsi esensial, dan transparansi.'
    },
    {
      id: 103,
      subtest: 'SOSIO_KULTURAL',
      subtestLabel: 'Kompetensi Sosio-Kultural',
      questionText: 'Anda ditempatkan di unit kerja daerah terpencil yang masyarakatnya masih sangat menjunjung tinggi tradisi adat lokal dalam penyelesaian sengketa tanah keluarga. Sikap Anda sebagai aparat pemerintah adalah...',
      options: [
        { key: 'A', text: 'Memaksa masyarakat meninggalkan hukum adat dan langsung membawa semua sengketa ke pengadilan formal.', score: 1 },
        { key: 'B', text: 'Menghormati kearifan lokal yang berlaku, membangun komunikasi persuasif dengan tokoh adat, serta memadukan mediasi adat dengan kepastian hukum positif negara.', score: 4 },
        { key: 'C', text: 'Membatasi diri dari pergaulan warga setempat agar tidak terpengaruh adat istiadat mereka.', score: 1 },
        { key: 'D', text: 'Mengikuti seluruh keputusan adat meskipun ada aturan adat yang bertentangan dengan HAM dan perundang-undangan.', score: 2 },
        { key: 'E', text: 'Menolak penempatan kerja di daerah tersebut karena perbedaannya terlalu kontras dengan daerah asal Anda.', score: 1 }
      ],
      correctAnswer: 'B',
      explanation: 'Kompetensi Sosio-Kultural (Kepekaan Terhadap Keberagaman & Kemampuan Berhubungan Sosial): ASN adalah perekat bangsa yang mampu menjembatani kearifan lokal (local wisdom) dengan koridor hukum nasional secara harmonis dan inklusif.',
      tipsTrick: 'Sosio Kultural: Inklusif, menghormati keberagaman budaya, komunikatif dengan tokoh lokal, dan menjaga harmoni sosial.'
    },
    {
      id: 104,
      subtest: 'WAWANCARA',
      subtestLabel: 'Wawancara Berbasis Komputer',
      questionText: 'Mengapa Anda memilih untuk menjadi Pegawai Pemerintah dengan Perjanjian Kerja (PPPK) di instansi ini, dan apa komitmen terbesar yang dapat Anda berikan?',
      options: [
        { key: 'A', text: 'Karena gaji dan jaminan kerja ASN lebih stabil dibanding bekerja di sektor swasta.', score: 2 },
        { key: 'B', text: 'Karena saya ingin mengabdikan keahlian profesional saya secara optimal, menjunjung tinggi integritas anti-korupsi, serta siap ditempatkan di mana pun negara membutuhkan kontribusi saya.', score: 4 },
        { key: 'C', text: 'Karena dorongan keluarga yang menginginkan saya memiliki seragam pegawai pemerintah.', score: 1 },
        { key: 'D', text: 'Saya ingin mencari pengalaman kerja sementara sebelum melanjutkan pendidikan ke jenjang berikutnya.', score: 1 },
        { key: 'E', text: 'Saya memiliki kompetensi yang cukup dan ingin membuktikan bahwa saya mampu lolos seleksi pemerintah.', score: 3 }
      ],
      correctAnswer: 'B',
      explanation: 'Wawancara Berbasis Komputer menggali Integritas, Komitmen Kebangsaan, Profesionalisme, dan Loyalitas terhadap pelayanan publik. Opsi B mencerminkan motivasi instrinsik yang selaras dengan nilai BerAKHLAK.',
      tipsTrick: 'Pilih jawaban yang mengedepankan dedikasi, integritas, profesionalisme keahlian, dan kesiapan melayani negara.'
    }
  ]
};
