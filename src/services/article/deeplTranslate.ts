// src/services/article/deeplTranslate.ts - FIXED VERSION

import { ENV_CONFIG } from '@/config/env.config';
import type { ClassifiedArticle } from '../../types/news.types';

export async function translateText(
  text: string,
  sourceLang: string = 'EN',
  targetLang: string = 'ID'
): Promise<string> {
  try {
    if (!ENV_CONFIG.articleAPIs.DEEPL_API_KEY) {
      console.error('❌ [DeepL] API key is missing!');
      throw new Error('DeepL API key is not configured');
    }

    if (!text || text.trim().length === 0) {
      return '';
    }

    console.log(`🌐 [DeepL] Translating ${text.length} chars...`);
    console.log(`🌐 [DeepL] API Key present:`, !!ENV_CONFIG.articleAPIs.DEEPL_API_KEY);
    console.log(`🌐 [DeepL] API Key (first 10):`, ENV_CONFIG.articleAPIs.DEEPL_API_KEY.substring(0, 10));
    console.log(`🌐 [DeepL] Base URL:`, ENV_CONFIG.articleAPIs.DEEPL_API_BASE_URL);

    // ✅ FIX: DeepL requires specific parameter format
    const formData = new URLSearchParams();
    formData.append('auth_key', ENV_CONFIG.articleAPIs.DEEPL_API_KEY);
    formData.append('text', text);
    formData.append('source_lang', sourceLang);
    formData.append('target_lang', targetLang);

    const url = `${ENV_CONFIG.articleAPIs.DEEPL_API_BASE_URL}/translate`;
    console.log(`🌐 [DeepL] URL:`, url);
    console.log(`🌐 [DeepL] Request body:`, formData.toString().substring(0, 100));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    console.log(`🌐 [DeepL] Response status:`, response.status);
    console.log(`🌐 [DeepL] Response OK:`, response.ok);

    // ✅ FIX: Check response before parsing
    const responseText = await response.text();
    console.log(`🌐 [DeepL] Response text (first 200):`, responseText.substring(0, 200));

    if (!response.ok) {
      console.error(`❌ [DeepL] HTTP Error ${response.status}:`, responseText);
      throw new Error(`DeepL API error: ${response.status} - ${responseText}`);
    }

    // ✅ FIX: Parse only if we have content
    if (!responseText || responseText.trim().length === 0) {
      console.error('❌ [DeepL] Empty response');
      throw new Error('DeepL returned empty response');
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ [DeepL] JSON parse error:', parseError);
      console.error('❌ [DeepL] Response text:', responseText);
      throw new Error(`DeepL JSON parse failed: ${parseError}`);
    }

    console.log(`🌐 [DeepL] Parsed data:`, JSON.stringify(data, null, 2));

    if (data.translations && data.translations.length > 0) {
      console.log('✅ [DeepL] Translation successful');
      return data.translations[0].text;
    }

    console.error('❌ [DeepL] No translations in response');
    throw new Error('DeepL: No translations returned');

  } catch (error) {
    console.error('❌ [DeepL] Translation error:', error);
    // ✅ FIX: Return original text instead of throwing
    return text;
  }
}

export async function translateArticle(
  article: ClassifiedArticle
): Promise<{
  titleId: string;
  descriptionId: string;
  contentId: string;
}> {
  console.log(`📄 [DeepL] Translating article: ${article.title}`);

  const titleId = await translateText(article.title);

  const descriptionId = article.description
    ? await translateText(article.description)
    : '';

  // Clean NewsAPI content truncation marker (e.g., "...[+4445 chars]")
  let contentToTranslate = article.content || '';
  contentToTranslate = contentToTranslate.replace(/\.\.\.\s*\[\+\d+\s*(?:chars?|karakter)\]/gi, '...');

  const contentId = await translateText(contentToTranslate);

  return { titleId, descriptionId, contentId };
}

// ✅ IMPROVED: Better test function
export async function testDeepLConnection(): Promise<boolean> {
  try {
    console.log('🔍 [DeepL Test] Starting connection test...');
    
    if (!ENV_CONFIG.articleAPIs.DEEPL_API_KEY) {
      console.error('❌ [DeepL Test] API key is missing');
      return false;
    }

    console.log('🔍 [DeepL Test] API Key present:', !!ENV_CONFIG.articleAPIs.DEEPL_API_KEY);
    console.log('🔍 [DeepL Test] API Key format:', ENV_CONFIG.articleAPIs.DEEPL_API_KEY.substring(0, 10) + '...');
    console.log('🔍 [DeepL Test] Base URL:', ENV_CONFIG.articleAPIs.DEEPL_API_BASE_URL);

    const testText = 'Hello world';
    const formData = new URLSearchParams();
    formData.append('auth_key', ENV_CONFIG.articleAPIs.DEEPL_API_KEY);
    formData.append('text', testText);
    formData.append('source_lang', 'EN');
    formData.append('target_lang', 'ID');

    const url = `${ENV_CONFIG.articleAPIs.DEEPL_API_BASE_URL}/translate`;
    console.log('🔍 [DeepL Test] Testing URL:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    console.log('🔍 [DeepL Test] Status:', response.status);
    
    const responseText = await response.text();
    console.log('🔍 [DeepL Test] Response:', responseText);

    if (!response.ok) {
      console.error('❌ [DeepL Test] HTTP Error:', responseText);
      return false;
    }

    const data = JSON.parse(responseText);
    console.log('🔍 [DeepL Test] Parsed data:', JSON.stringify(data, null, 2));

    if (data.translations && data.translations.length > 0) {
      console.log('✅ [DeepL Test] Connection successful');
      console.log(`   Translation: "${testText}" → "${data.translations[0].text}"`);
      return true;
    } else {
      console.error('❌ [DeepL Test] No translations in response');
      return false;
    }
  } catch (error) {
    console.error('❌ [DeepL Test] Connection failed:', error);
    return false;
  }
}