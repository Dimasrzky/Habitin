// src/services/article/types.ts

export interface NewsArticle {
  source: { id: string | null; name: string };
  author: string | null;
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string;
}

export interface ClassifiedArticle extends NewsArticle {
  categories: ('diabetes' | 'cholesterol' | 'general')[];
  relevanceScore: {
    diabetes: number;
    cholesterol: number;
  };
  priorityScore?: number; // Added for ranking
}

export interface HealthPriority {
  focus: 'diabetes' | 'cholesterol' | 'balanced';
  diabetesScore: number; // 0-1
  cholesterolScore: number; // 0-1
  reason: string;
}

export interface Article {
  id: string;
  news_api_id: string;
  title_en: string;
  title_id: string;
  description_en: string | null;
  description_id: string | null;
  content_en: string | null;
  content_id: string | null;
  url: string;
  image_url: string | null;
  source_name: string;
  published_at: string;
  category: string[];
  relevance_score: {
    diabetes: number;
    cholesterol: number;
  };
  created_at: string;
  updated_at: string;
}

export interface ArticleRecommendation {
  id: string;
  firebase_uid: string;
  article_id: string;
  priority_score: number;
  reason: string;
  created_at: string;
  articles: Article;
}

export interface UserArticleRead {
  id: string;
  firebase_uid: string;
  article_id: string;
  read_at: string;
  read_duration: number | null;
  is_helpful: boolean | null;
  articles: Article;
}