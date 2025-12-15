// src/services/article/articleRanker.ts

import { ClassifiedArticle, HealthPriority } from '../../types/news.types';

export function rankArticlesByUserHealth(
  articles: ClassifiedArticle[],
  healthPriority: HealthPriority
): ClassifiedArticle[] {
  return articles
    .map((article) => {
      let priorityScore = 0;

      if (healthPriority.focus === 'diabetes') {
        priorityScore =
          article.relevanceScore.diabetes * 0.7 +
          article.relevanceScore.cholesterol * 0.3;
      } else if (healthPriority.focus === 'cholesterol') {
        priorityScore =
          article.relevanceScore.cholesterol * 0.7 +
          article.relevanceScore.diabetes * 0.3;
      } else {
        priorityScore =
          (article.relevanceScore.diabetes + article.relevanceScore.cholesterol) / 2;
      }

      return {
        ...article,
        priorityScore,
      };
    })
    .sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0))
    .slice(0, 10);
}