// src/services/article/articlePostProcessor.ts

export function normalizeIndonesianText(text: string): string {
  // Rule-based normalization untuk istilah medis
  const replacements: Record<string, string> = {
    // Istilah medis umum
    'cholesterol': 'kolesterol',
    'diabetes': 'diabetes',
    'blood sugar': 'gula darah',
    'blood pressure': 'tekanan darah',
    'insulin': 'insulin',
    'glucose': 'glukosa',
    'triglyceride': 'trigliserida',
    
    // Frasa yang sering ambigu
    'may help reduce': 'dapat membantu mengurangi',
    'could potentially': 'berpotensi dapat',
    'studies suggest': 'penelitian menunjukkan',
    'according to research': 'menurut riset',
    
    // Perbaikan grammar umum
    'dr.': 'Dr.',
    'mg/dl': 'mg/dL',
  };

  let normalized = text;
  
  // Apply replacements (case-insensitive untuk beberapa)
  Object.entries(replacements).forEach(([from, to]) => {
    const regex = new RegExp(from, 'gi');
    normalized = normalized.replace(regex, to);
  });

  return normalized;
}

export function addDisclaimerToContent(content: string): string {
  const disclaimer = `
⚠️ DISCLAIMER: Artikel ini diterjemahkan secara otomatis dari sumber berbahasa Inggris dan hanya untuk tujuan edukasi. Informasi dalam artikel ini bukan pengganti konsultasi medis profesional. Selalu konsultasikan kondisi kesehatan Anda dengan dokter.
  `.trim();

  return `${disclaimer}\n\n${content}`;
}

// ✅ EXPORT THIS FUNCTION!
export function formatArticleForMobile(article: {
  titleId: string;
  descriptionId: string;
  contentId: string;
}): {
  titleId: string;
  descriptionId: string;
  contentId: string;
} {
  return {
    titleId: normalizeIndonesianText(article.titleId),
    descriptionId: normalizeIndonesianText(article.descriptionId),
    contentId: addDisclaimerToContent(normalizeIndonesianText(article.contentId)),
  };
}