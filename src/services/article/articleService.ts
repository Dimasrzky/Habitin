// services/articleService.ts

import { supabase } from '../../config/supabase.config';

// ✅ Get recommendations untuk user tertentu
export async function getUserRecommendations(firebaseUid: string) {
  try {
    const { data, error } = await supabase
      .from('article_recommendations')
      .select(`
        *,
        articles (*)
      `)
      .eq('firebase_uid', firebaseUid)
      .order('priority_score', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      recommendations: data || [],
    };
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return {
      success: false,
      recommendations: [],
    };
  }
}

// ✅ Get artikel berdasarkan kategori
export async function getArticlesByCategory(
  category: 'diabetes' | 'cholesterol' | 'general',
  limit: number = 10
) {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .contains('category', [category]) // PostgreSQL array contains
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return {
      success: true,
      articles: data || [],
    };
  } catch (error) {
    console.error('Error fetching articles by category:', error);
    return {
      success: false,
      articles: [],
    };
  }
}

// ✅ Mark artikel sebagai dibaca
export async function markArticleAsRead(
  firebaseUid: string,
  articleId: string,
  readDuration?: number
) {
  try {
    const { error } = await supabase
      .from('user_article_reads')
      .insert({
        firebase_uid: firebaseUid,
        article_id: articleId,
        read_duration: readDuration || null,
        // read_at otomatis now()
      });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error marking article as read:', error);
    return { success: false };
  }
}

// ✅ Update feedback helpful/not helpful
export async function updateArticleFeedback(
  firebaseUid: string,
  articleId: string,
  isHelpful: boolean
) {
  try {
    // Update existing read record
    const { error } = await supabase
      .from('user_article_reads')
      .update({ is_helpful: isHelpful })
      .eq('firebase_uid', firebaseUid)
      .eq('article_id', articleId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error updating feedback:', error);
    return { success: false };
  }
}

// ✅ Get reading history user
export async function getUserReadingHistory(
  firebaseUid: string,
  limit: number = 20
) {
  try {
    const { data, error } = await supabase
      .from('user_article_reads')
      .select(`
        *,
        articles (*)
      `)
      .eq('firebase_uid', firebaseUid)
      .order('read_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return {
      success: true,
      history: data || [],
    };
  } catch (error) {
    console.error('Error fetching reading history:', error);
    return {
      success: false,
      history: [],
    };
  }
}

// ✅ Get artikel detail by ID
export async function getArticleById(articleId: string) {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', articleId)
      .single();

    if (error) throw error;

    return {
      success: true,
      article: data,
    };
  } catch (error) {
    console.error('Error fetching article:', error);
    return {
      success: false,
      article: null,
    };
  }
}

// ✅ Search artikel berdasarkan keyword
export async function searchArticles(keyword: string, limit: number = 10) {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .or(`title_id.ilike.%${keyword}%,description_id.ilike.%${keyword}%`)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return {
      success: true,
      articles: data || [],
    };
  } catch (error) {
    console.error('Error searching articles:', error);
    return {
      success: false,
      articles: [],
    };
  }
}

// ✅ Get artikel terbaru (tanpa filter user)
export async function getLatestArticles(limit: number = 10) {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return {
      success: true,
      articles: data || [],
    };
  } catch (error) {
    console.error('Error fetching latest articles:', error);
    return {
      success: false,
      articles: [],
    };
  }
}

// ✅ Check apakah user sudah baca artikel
export async function hasUserReadArticle(
  firebaseUid: string,
  articleId: string
): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('user_article_reads')
      .select('id')
      .eq('firebase_uid', firebaseUid)
      .eq('article_id', articleId)
      .single();

    return !!data;
  } catch {
    return false;
  }
}

// ✅ Get statistics untuk admin/debug
export async function getArticleStats() {
  try {
    // Total articles
    const { count: totalArticles } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true });

    // Total reads
    const { count: totalReads } = await supabase
      .from('user_article_reads')
      .select('*', { count: 'exact', head: true });

    // Most read articles
    const { data: mostRead } = await supabase
      .from('user_article_reads')
      .select('article_id, articles(title_id)')
      .limit(10);

    return {
      success: true,
      stats: {
        totalArticles: totalArticles || 0,
        totalReads: totalReads || 0,
        mostRead: mostRead || [],
      },
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {
      success: false,
      stats: null,
    };
  }
}