// src/services/article/newsApi.ts - UPDATED WITH LOGS

import { ENV_CONFIG } from '@/config/env.config';
import type { NewsArticle } from '../../types/news.types';

export async function fetchHealthArticles(
  focus: 'diabetes' | 'cholesterol' | 'balanced'
): Promise<NewsArticle[]> {
  try {
    console.log('🔍 [NewsAPI] Starting fetch...');
    console.log('🔍 [NewsAPI] Focus:', focus);
    console.log('🔍 [NewsAPI] API Key present:', !!ENV_CONFIG.articleAPIs.NEWS_API_KEY);
    console.log('🔍 [NewsAPI] API Key (first 10):', ENV_CONFIG.articleAPIs.NEWS_API_KEY?.substring(0, 10));

    if (!ENV_CONFIG.articleAPIs.NEWS_API_KEY) {
      console.error('❌ [NewsAPI] API key is missing!');
      throw new Error('NewsAPI key is not configured');
    }

    let query = '';
    if (focus === 'diabetes') {
      query = 'diabetes OR "blood sugar" OR "type 2 diabetes" OR insulin OR glucose';
    } else if (focus === 'cholesterol') {
      query = 'cholesterol OR "high cholesterol" OR LDL OR HDL OR triglycerides';
    } else {
      query = '(diabetes OR "blood sugar") OR (cholesterol OR LDL)';
    }

    console.log('🔍 [NewsAPI] Query:', query);

    const params = new URLSearchParams({
      q: query,
      language: 'en',
      sortBy: 'publishedAt',
      pageSize: '30',
      apiKey: ENV_CONFIG.articleAPIs.NEWS_API_KEY,
    });

    const url = `${ENV_CONFIG.articleAPIs.NEWS_API_BASE_URL}/everything?${params}`;
    console.log('🔍 [NewsAPI] URL:', url.replace(ENV_CONFIG.articleAPIs.NEWS_API_KEY, 'HIDDEN'));

    console.log('🔍 [NewsAPI] Fetching...');
    const response = await fetch(url);

    console.log('🔍 [NewsAPI] Response status:', response.status);
    console.log('🔍 [NewsAPI] Response OK:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [NewsAPI] Response not OK:', errorText);
      throw new Error(`NewsAPI request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('🔍 [NewsAPI] Response data status:', data.status);
    console.log('🔍 [NewsAPI] Response data message:', data.message);
    console.log('🔍 [NewsAPI] Articles count:', data.articles?.length || 0);

    if (data.status !== 'ok') {
      console.error('❌ [NewsAPI] API error:', data.message);
      throw new Error(`NewsAPI error: ${data.message || 'Unknown error'}`);
    }

    if (data.articles && data.articles.length > 0) {
      console.log('✅ [NewsAPI] First article:', data.articles[0].title);
    }

    return data.articles || [];

  } catch (error) {
    console.error('❌ [NewsAPI] Caught error:', error);
    return [];
  }
}

export async function testNewsAPIConnection(): Promise<boolean> {
  try {
    console.log('🔍 [NewsAPI Test] Starting connection test...');
    
    if (!ENV_CONFIG.articleAPIs.NEWS_API_KEY) {
      console.error('❌ [NewsAPI Test] API key is missing');
      return false;
    }

    const url = `${ENV_CONFIG.articleAPIs.NEWS_API_BASE_URL}/top-headlines?country=us&pageSize=1&apiKey=${ENV_CONFIG.articleAPIs.NEWS_API_KEY}`;
    console.log('🔍 [NewsAPI Test] Testing URL...');
    
    const response = await fetch(url);
    console.log('🔍 [NewsAPI Test] Status:', response.status);
    
    const data = await response.json();
    console.log('🔍 [NewsAPI Test] Data:', JSON.stringify(data, null, 2));

    if (data.status === 'ok') {
      console.log('✅ [NewsAPI Test] Connection successful');
      return true;
    } else {
      console.error('❌ [NewsAPI Test] Error:', data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ [NewsAPI Test] Connection failed:', error);
    return false;
  }
}