// src/services/article/articleClassifier.ts

import { ClassifiedArticle, NewsArticle } from '../../types/news.types';

export function classifyArticles(
  articles: NewsArticle[]
): ClassifiedArticle[] {
  return articles.map((article) => {
    const text = `${article.title} ${article.description} ${article.content}`.toLowerCase();

    const diabetesKeywords = [
      'diabetes', 'diabetic', 'blood sugar', 'glucose', 'insulin',
      'a1c', 'hba1c', 'hyperglycemia', 'hypoglycemia', 'type 1', 'type 2',
      'prediabetes', 'pancreas', 'glycemic'
    ];

    const cholesterolKeywords = [
      'cholesterol', 'ldl', 'hdl', 'triglyceride', 'lipid',
      'statin', 'plaque', 'arterial', 'cardiovascular',
      'heart disease', 'atherosclerosis'
    ];

    let diabetesCount = 0;
    let cholesterolCount = 0;

    diabetesKeywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi');
      const matches = text.match(regex);
      if (matches) diabetesCount += matches.length;
    });

    cholesterolKeywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi');
      const matches = text.match(regex);
      if (matches) cholesterolCount += matches.length;
    });

    const diabetesScore = Math.min(diabetesCount / 10, 1);
    const cholesterolScore = Math.min(cholesterolCount / 10, 1);

    const categories: ('diabetes' | 'cholesterol' | 'general')[] = [];

    if (diabetesScore > 0.2) categories.push('diabetes');
    if (cholesterolScore > 0.2) categories.push('cholesterol');
    if (categories.length === 0) categories.push('general');

    return {
      ...article,
      categories,
      relevanceScore: {
        diabetes: diabetesScore,
        cholesterol: cholesterolScore,
      },
    };
  });
}