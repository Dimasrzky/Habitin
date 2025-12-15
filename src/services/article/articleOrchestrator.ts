// src/services/article/articleOrchestrator.ts

import { supabase } from '@/config/supabase.config';
import { analyzeUserHealthPriority } from '../health/healthAnalysis';
import { classifyArticles } from './articleClassifier';
import { formatArticleForMobile } from './articlePostProcessor';
import { rankArticlesByUserHealth } from './articleRanker';
import { translateArticle } from './deeplTranslate';
import { fetchHealthArticles } from './newsAPI';

export async function generatePersonalizedArticles(firebaseUid: string) {
  try {
    console.log('🔍 Step 1: Analyzing user health...');
    const healthPriority = await analyzeUserHealthPriority(firebaseUid);
    console.log(`✅ Priority: ${healthPriority.focus} (${healthPriority.reason})`);

    console.log('🔍 Step 2: Fetching articles from NewsAPI...');
    const rawArticles = await fetchHealthArticles(healthPriority.focus);
    console.log(`✅ Found ${rawArticles.length} articles`);

    if (rawArticles.length === 0) {
      return { success: false, message: 'No articles found' };
    }

    console.log('🔍 Step 3: Classifying articles...');
    const classifiedArticles = classifyArticles(rawArticles);
    console.log(`✅ Classified ${classifiedArticles.length} articles`);

    console.log('🔍 Step 4: Ranking by user health priority...');
    const rankedArticles = rankArticlesByUserHealth(classifiedArticles, healthPriority);
    console.log(`✅ Top ${rankedArticles.length} articles selected`);

    console.log('🔍 Step 5: Translating & processing...');
    const processedArticles = [];

    for (const article of rankedArticles) {
      const { data: existing } = await supabase
        .from('articles')
        .select('*')
        .eq('news_api_id', article.url)
        .single();

      if (existing) {
        console.log(`♻️ Using cached article: ${article.title}`);
        processedArticles.push(existing);
        continue;
      }

      console.log(`🌐 Translating: ${article.title}`);
      const translated = await translateArticle(article);
      const formatted = formatArticleForMobile(translated);

      const { data: savedArticle, error } = await supabase
        .from('articles')
        .insert({
          news_api_id: article.url,
          title_en: article.title,
          title_id: formatted.titleId,
          description_en: article.description || '',
          description_id: formatted.descriptionId,
          content_en: article.content || '',
          content_id: formatted.contentId,
          url: article.url,
          image_url: article.urlToImage || '',
          source_name: article.source.name,
          published_at: article.publishedAt,
          category: article.categories,
          relevance_score: article.relevanceScore,
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error saving article:', error);
        continue;
      }

      processedArticles.push(savedArticle);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`✅ Processed ${processedArticles.length} articles`);

    console.log('🔍 Step 6: Saving user recommendations...');

    await supabase
      .from('article_recommendations')
      .delete()
      .eq('firebase_uid', firebaseUid);

    const recommendations = processedArticles.map((article, index) => ({
      firebase_uid: firebaseUid,
      article_id: article.id,
      priority_score: article.priorityScore || (1 - index * 0.1),
      reason: healthPriority.reason,
    }));

    const { error: recError } = await supabase
      .from('article_recommendations')
      .insert(recommendations);

    if (recError) {
      console.error('❌ Error saving recommendations:', recError);
    }

    console.log('✅ All done!');

    return {
      success: true,
      articles: processedArticles,
      healthPriority,
    };

  } catch (error) {
    console.error('❌ Error in article orchestrator:', error);
    // ✅ FIX: Proper error type handling
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      message: errorMessage,
    };
  }
}