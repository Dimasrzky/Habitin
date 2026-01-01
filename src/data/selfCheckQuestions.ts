// src/data/selfCheckQuestions.ts

export type SelfCheckType = 'diabetes' | 'cholesterol' | 'both';

export interface QuestionOption {
  text: string;
  score: number; // Skor risiko: 0 (rendah) - 3 (tinggi)
}

export interface Question {
  id: number;
  question: string;
  category: 'diabetes' | 'cholesterol' | 'both';
  options: QuestionOption[];
}

// ==================== DIABETES QUESTIONS ====================
export const DIABETES_QUESTIONS: Question[] = [
  {
    id: 1,
    question: 'Berapa usia Anda saat ini?',
    category: 'diabetes',
    options: [
      { text: 'Di bawah 35 tahun', score: 0 },
      { text: '35-44 tahun', score: 1 },
      { text: '45-54 tahun', score: 2 },
      { text: '55 tahun atau lebih', score: 3 },
    ],
  },
  {
    id: 2,
    question: 'Apakah ada anggota keluarga yang memiliki diabetes?',
    category: 'diabetes',
    options: [
      { text: 'Tidak ada', score: 0 },
      { text: 'Ya, saudara jauh (kakek/nenek)', score: 1 },
      { text: 'Ya, orang tua atau saudara kandung', score: 3 },
      { text: 'Ya, lebih dari satu anggota keluarga', score: 3 },
    ],
  },
  {
    id: 3,
    question: 'Berapa indeks massa tubuh (BMI) Anda? (Perkiraan: BB ÷ (TB×TB))',
    category: 'diabetes',
    options: [
      { text: 'Normal (18.5-24.9)', score: 0 },
      { text: 'Sedikit berlebih (25-29.9)', score: 2 },
      { text: 'Obesitas (30-34.9)', score: 3 },
      { text: 'Obesitas berat (≥35)', score: 3 },
    ],
  },
  {
    id: 4,
    question: 'Seberapa sering Anda berolahraga minimal 30 menit?',
    category: 'diabetes',
    options: [
      { text: 'Hampir setiap hari (5-7 hari/minggu)', score: 0 },
      { text: '3-4 hari per minggu', score: 1 },
      { text: '1-2 hari per minggu', score: 2 },
      { text: 'Jarang atau tidak pernah', score: 3 },
    ],
  },
  {
    id: 5,
    question: 'Seberapa sering Anda mengonsumsi makanan manis (kue, permen, minuman manis)?',
    category: 'diabetes',
    options: [
      { text: 'Jarang (kurang dari 1x seminggu)', score: 0 },
      { text: '1-2 kali per minggu', score: 1 },
      { text: '3-5 kali per minggu', score: 2 },
      { text: 'Hampir setiap hari', score: 3 },
    ],
  },
  {
    id: 6,
    question: 'Berapa porsi nasi atau karbohidrat yang Anda makan per hari?',
    category: 'diabetes',
    options: [
      { text: '1-2 porsi sedang', score: 0 },
      { text: '3 porsi sedang', score: 1 },
      { text: '4 porsi atau lebih', score: 2 },
      { text: 'Sangat banyak (5+ porsi besar)', score: 3 },
    ],
  },
  {
    id: 7,
    question: 'Apakah Anda sering merasa sangat haus meski sudah minum banyak?',
    category: 'diabetes',
    options: [
      { text: 'Tidak pernah', score: 0 },
      { text: 'Jarang', score: 1 },
      { text: 'Kadang-kadang', score: 2 },
      { text: 'Sering sekali', score: 3 },
    ],
  },
  {
    id: 8,
    question: 'Apakah Anda sering buang air kecil, terutama di malam hari?',
    category: 'diabetes',
    options: [
      { text: 'Tidak, normal saja', score: 0 },
      { text: 'Kadang-kadang', score: 1 },
      { text: 'Sering (3-4 kali malam)', score: 2 },
      { text: 'Sangat sering (>4 kali malam)', score: 3 },
    ],
  },
  {
    id: 9,
    question: 'Apakah Anda sering merasa lelah tanpa alasan yang jelas?',
    category: 'diabetes',
    options: [
      { text: 'Tidak pernah', score: 0 },
      { text: 'Jarang', score: 1 },
      { text: 'Sering', score: 2 },
      { text: 'Hampir setiap hari', score: 3 },
    ],
  },
  {
    id: 10,
    question: 'Apakah Anda pernah mengalami luka yang lama sembuh?',
    category: 'diabetes',
    options: [
      { text: 'Tidak pernah', score: 0 },
      { text: 'Pernah, tapi jarang', score: 1 },
      { text: 'Ya, beberapa kali', score: 2 },
      { text: 'Ya, sering sekali', score: 3 },
    ],
  },
  {
    id: 11,
    question: 'Apakah Anda mengalami penglihatan kabur?',
    category: 'diabetes',
    options: [
      { text: 'Tidak', score: 0 },
      { text: 'Jarang', score: 1 },
      { text: 'Kadang-kadang', score: 2 },
      { text: 'Sering', score: 3 },
    ],
  },
  {
    id: 12,
    question: 'Berapa lama Anda tidur per hari?',
    category: 'diabetes',
    options: [
      { text: '7-8 jam (tidur berkualitas)', score: 0 },
      { text: '6-7 jam', score: 1 },
      { text: '5-6 jam', score: 2 },
      { text: 'Kurang dari 5 jam', score: 3 },
    ],
  },
  {
    id: 13,
    question: 'Seberapa sering Anda mengonsumsi buah dan sayur?',
    category: 'diabetes',
    options: [
      { text: 'Setiap hari (5+ porsi)', score: 0 },
      { text: '3-4 porsi per hari', score: 1 },
      { text: '1-2 porsi per hari', score: 2 },
      { text: 'Jarang atau tidak pernah', score: 3 },
    ],
  },
  {
    id: 14,
    question: 'Apakah Anda sering merasa lapar meski baru saja makan?',
    category: 'diabetes',
    options: [
      { text: 'Tidak pernah', score: 0 },
      { text: 'Jarang', score: 1 },
      { text: 'Kadang-kadang', score: 2 },
      { text: 'Sering sekali', score: 3 },
    ],
  },
  {
    id: 15,
    question: 'Apakah Anda memiliki tekanan darah tinggi?',
    category: 'diabetes',
    options: [
      { text: 'Tidak', score: 0 },
      { text: 'Tidak tahu', score: 1 },
      { text: 'Ya, terkontrol dengan obat', score: 2 },
      { text: 'Ya, tidak terkontrol', score: 3 },
    ],
  },
];

// ==================== CHOLESTEROL QUESTIONS ====================
export const CHOLESTEROL_QUESTIONS: Question[] = [
  {
    id: 1,
    question: 'Berapa usia Anda saat ini?',
    category: 'cholesterol',
    options: [
      { text: 'Di bawah 35 tahun', score: 0 },
      { text: '35-44 tahun', score: 1 },
      { text: '45-54 tahun', score: 2 },
      { text: '55 tahun atau lebih', score: 3 },
    ],
  },
  {
    id: 2,
    question: 'Apakah ada riwayat kolesterol tinggi atau penyakit jantung di keluarga?',
    category: 'cholesterol',
    options: [
      { text: 'Tidak ada', score: 0 },
      { text: 'Ya, saudara jauh', score: 1 },
      { text: 'Ya, orang tua atau saudara kandung', score: 3 },
      { text: 'Ya, lebih dari satu anggota keluarga', score: 3 },
    ],
  },
  {
    id: 3,
    question: 'Seberapa sering Anda mengonsumsi makanan berlemak tinggi (gorengan, daging berlemak, jeroan)?',
    category: 'cholesterol',
    options: [
      { text: 'Jarang (kurang dari 1x/minggu)', score: 0 },
      { text: '1-2 kali per minggu', score: 1 },
      { text: '3-5 kali per minggu', score: 2 },
      { text: 'Hampir setiap hari', score: 3 },
    ],
  },
  {
    id: 4,
    question: 'Seberapa sering Anda mengonsumsi makanan cepat saji (fast food)?',
    category: 'cholesterol',
    options: [
      { text: 'Tidak pernah atau sangat jarang', score: 0 },
      { text: '1-2 kali per bulan', score: 1 },
      { text: '1-2 kali per minggu', score: 2 },
      { text: '3 kali atau lebih per minggu', score: 3 },
    ],
  },
  {
    id: 5,
    question: 'Berapa porsi sayur dan buah yang Anda konsumsi per hari?',
    category: 'cholesterol',
    options: [
      { text: '5 porsi atau lebih', score: 0 },
      { text: '3-4 porsi', score: 1 },
      { text: '1-2 porsi', score: 2 },
      { text: 'Jarang atau tidak pernah', score: 3 },
    ],
  },
  {
    id: 6,
    question: 'Apakah Anda merokok?',
    category: 'cholesterol',
    options: [
      { text: 'Tidak pernah', score: 0 },
      { text: 'Dulu, tapi sudah berhenti', score: 1 },
      { text: 'Ya, kadang-kadang', score: 2 },
      { text: 'Ya, rutin setiap hari', score: 3 },
    ],
  },
  {
    id: 7,
    question: 'Seberapa sering Anda berolahraga minimal 30 menit?',
    category: 'cholesterol',
    options: [
      { text: 'Hampir setiap hari (5-7 hari/minggu)', score: 0 },
      { text: '3-4 hari per minggu', score: 1 },
      { text: '1-2 hari per minggu', score: 2 },
      { text: 'Jarang atau tidak pernah', score: 3 },
    ],
  },
  {
    id: 8,
    question: 'Berapa indeks massa tubuh (BMI) Anda?',
    category: 'cholesterol',
    options: [
      { text: 'Normal (18.5-24.9)', score: 0 },
      { text: 'Sedikit berlebih (25-29.9)', score: 2 },
      { text: 'Obesitas (30-34.9)', score: 3 },
      { text: 'Obesitas berat (≥35)', score: 3 },
    ],
  },
  {
    id: 9,
    question: 'Seberapa sering Anda mengonsumsi kacang-kacangan, ikan, atau makanan tinggi omega-3?',
    category: 'cholesterol',
    options: [
      { text: 'Sering (hampir setiap hari)', score: 0 },
      { text: '3-4 kali per minggu', score: 1 },
      { text: '1-2 kali per minggu', score: 2 },
      { text: 'Jarang atau tidak pernah', score: 3 },
    ],
  },
  {
    id: 10,
    question: 'Apakah Anda memiliki diabetes atau gula darah tinggi?',
    category: 'cholesterol',
    options: [
      { text: 'Tidak', score: 0 },
      { text: 'Tidak tahu', score: 1 },
      { text: 'Prediabetes', score: 2 },
      { text: 'Ya, sudah didiagnosis', score: 3 },
    ],
  },
  {
    id: 11,
    question: 'Apakah Anda memiliki tekanan darah tinggi?',
    category: 'cholesterol',
    options: [
      { text: 'Tidak', score: 0 },
      { text: 'Tidak tahu', score: 1 },
      { text: 'Ya, terkontrol dengan obat', score: 2 },
      { text: 'Ya, tidak terkontrol', score: 3 },
    ],
  },
  {
    id: 12,
    question: 'Seberapa sering Anda merasa stress atau cemas?',
    category: 'cholesterol',
    options: [
      { text: 'Jarang atau tidak pernah', score: 0 },
      { text: 'Kadang-kadang', score: 1 },
      { text: 'Sering', score: 2 },
      { text: 'Hampir setiap hari', score: 3 },
    ],
  },
  {
    id: 13,
    question: 'Berapa lama Anda duduk/tidak aktif dalam sehari (termasuk bekerja)?',
    category: 'cholesterol',
    options: [
      { text: 'Kurang dari 4 jam', score: 0 },
      { text: '4-6 jam', score: 1 },
      { text: '6-8 jam', score: 2 },
      { text: 'Lebih dari 8 jam', score: 3 },
    ],
  },
  {
    id: 14,
    question: 'Seberapa sering Anda mengonsumsi alkohol?',
    category: 'cholesterol',
    options: [
      { text: 'Tidak pernah', score: 0 },
      { text: 'Jarang (acara khusus)', score: 1 },
      { text: '1-2 kali per minggu', score: 2 },
      { text: 'Sering (3+ kali per minggu)', score: 3 },
    ],
  },
  {
    id: 15,
    question: 'Apakah Anda pernah cek kolesterol dalam 1 tahun terakhir?',
    category: 'cholesterol',
    options: [
      { text: 'Ya, hasilnya normal', score: 0 },
      { text: 'Tidak pernah cek', score: 1 },
      { text: 'Ya, hasilnya borderline tinggi', score: 2 },
      { text: 'Ya, hasilnya tinggi', score: 3 },
    ],
  },
];

// ==================== BOTH (COMBINED) QUESTIONS ====================
export const BOTH_QUESTIONS: Question[] = [
  {
    id: 1,
    question: 'Berapa usia Anda saat ini?',
    category: 'both',
    options: [
      { text: 'Di bawah 35 tahun', score: 0 },
      { text: '35-44 tahun', score: 1 },
      { text: '45-54 tahun', score: 2 },
      { text: '55 tahun atau lebih', score: 3 },
    ],
  },
  {
    id: 2,
    question: 'Apakah ada riwayat diabetes atau kolesterol tinggi di keluarga?',
    category: 'both',
    options: [
      { text: 'Tidak ada', score: 0 },
      { text: 'Ya, saudara jauh', score: 1 },
      { text: 'Ya, orang tua atau saudara kandung', score: 3 },
      { text: 'Ya, keduanya (diabetes & kolesterol)', score: 3 },
    ],
  },
  {
    id: 3,
    question: 'Berapa indeks massa tubuh (BMI) Anda?',
    category: 'both',
    options: [
      { text: 'Normal (18.5-24.9)', score: 0 },
      { text: 'Sedikit berlebih (25-29.9)', score: 2 },
      { text: 'Obesitas (30-34.9)', score: 3 },
      { text: 'Obesitas berat (≥35)', score: 3 },
    ],
  },
  {
    id: 4,
    question: 'Seberapa sering Anda berolahraga minimal 30 menit?',
    category: 'both',
    options: [
      { text: 'Hampir setiap hari (5-7 hari/minggu)', score: 0 },
      { text: '3-4 hari per minggu', score: 1 },
      { text: '1-2 hari per minggu', score: 2 },
      { text: 'Jarang atau tidak pernah', score: 3 },
    ],
  },
  {
    id: 5,
    question: 'Seberapa sering Anda mengonsumsi makanan manis atau minuman bergula?',
    category: 'both',
    options: [
      { text: 'Jarang (kurang dari 1x/minggu)', score: 0 },
      { text: '1-2 kali per minggu', score: 1 },
      { text: '3-5 kali per minggu', score: 2 },
      { text: 'Hampir setiap hari', score: 3 },
    ],
  },
  {
    id: 6,
    question: 'Seberapa sering Anda mengonsumsi makanan berlemak tinggi (gorengan, fast food)?',
    category: 'both',
    options: [
      { text: 'Jarang (kurang dari 1x/minggu)', score: 0 },
      { text: '1-2 kali per minggu', score: 1 },
      { text: '3-5 kali per minggu', score: 2 },
      { text: 'Hampir setiap hari', score: 3 },
    ],
  },
  {
    id: 7,
    question: 'Berapa porsi sayur dan buah yang Anda konsumsi per hari?',
    category: 'both',
    options: [
      { text: '5 porsi atau lebih', score: 0 },
      { text: '3-4 porsi', score: 1 },
      { text: '1-2 porsi', score: 2 },
      { text: 'Jarang atau tidak pernah', score: 3 },
    ],
  },
  {
    id: 8,
    question: 'Apakah Anda sering merasa sangat haus atau buang air kecil berlebihan?',
    category: 'both',
    options: [
      { text: 'Tidak pernah', score: 0 },
      { text: 'Jarang', score: 1 },
      { text: 'Kadang-kadang', score: 2 },
      { text: 'Sering sekali', score: 3 },
    ],
  },
  {
    id: 9,
    question: 'Apakah Anda sering merasa lelah tanpa alasan yang jelas?',
    category: 'both',
    options: [
      { text: 'Tidak pernah', score: 0 },
      { text: 'Jarang', score: 1 },
      { text: 'Kadang-kadang', score: 2 },
      { text: 'Hampir setiap hari', score: 3 },
    ],
  },
  {
    id: 10,
    question: 'Apakah Anda merokok?',
    category: 'both',
    options: [
      { text: 'Tidak pernah', score: 0 },
      { text: 'Dulu, tapi sudah berhenti', score: 1 },
      { text: 'Ya, kadang-kadang', score: 2 },
      { text: 'Ya, rutin setiap hari', score: 3 },
    ],
  },
  {
    id: 11,
    question: 'Berapa lama Anda tidur per hari?',
    category: 'both',
    options: [
      { text: '7-8 jam (tidur berkualitas)', score: 0 },
      { text: '6-7 jam', score: 1 },
      { text: '5-6 jam', score: 2 },
      { text: 'Kurang dari 5 jam', score: 3 },
    ],
  },
  {
    id: 12,
    question: 'Seberapa sering Anda merasa stress atau cemas?',
    category: 'both',
    options: [
      { text: 'Jarang atau tidak pernah', score: 0 },
      { text: 'Kadang-kadang', score: 1 },
      { text: 'Sering', score: 2 },
      { text: 'Hampir setiap hari', score: 3 },
    ],
  },
  {
    id: 13,
    question: 'Apakah Anda memiliki tekanan darah tinggi?',
    category: 'both',
    options: [
      { text: 'Tidak', score: 0 },
      { text: 'Tidak tahu', score: 1 },
      { text: 'Ya, terkontrol dengan obat', score: 2 },
      { text: 'Ya, tidak terkontrol', score: 3 },
    ],
  },
  {
    id: 14,
    question: 'Berapa lama Anda duduk/tidak aktif dalam sehari?',
    category: 'both',
    options: [
      { text: 'Kurang dari 4 jam', score: 0 },
      { text: '4-6 jam', score: 1 },
      { text: '6-8 jam', score: 2 },
      { text: 'Lebih dari 8 jam', score: 3 },
    ],
  },
  {
    id: 15,
    question: 'Apakah Anda pernah cek gula darah atau kolesterol dalam 1 tahun terakhir?',
    category: 'both',
    options: [
      { text: 'Ya, semuanya normal', score: 0 },
      { text: 'Tidak pernah cek', score: 1 },
      { text: 'Ya, salah satunya borderline', score: 2 },
      { text: 'Ya, salah satunya atau keduanya tinggi', score: 3 },
    ],
  },
];

// Helper function to get questions based on type
export const getQuestionsByType = (type: SelfCheckType): Question[] => {
  switch (type) {
    case 'diabetes':
      return DIABETES_QUESTIONS;
    case 'cholesterol':
      return CHOLESTEROL_QUESTIONS;
    case 'both':
      return BOTH_QUESTIONS;
    default:
      return BOTH_QUESTIONS;
  }
};
