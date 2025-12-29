// src/services/gemini/geminiService.ts
import { GeminiResponse } from '@/types/chat.types';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ✅ Pastikan API key terbaca dengan benar
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

console.log('🔑 API Key Status:', {
  exists: !!API_KEY,
  length: API_KEY.length,
  prefix: API_KEY.substring(0, 10) + '...',
});

export class GeminiService {
  private static genAI = new GoogleGenerativeAI(API_KEY);
  
  // ✅ GUNAKAN MODEL YANG BENAR
  private static model = this.genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash',
  });

  static async generateResponse(
    userMessage: string,
    systemPrompt: string,
    chatHistory: { role: string; content: string }[] = []
  ): Promise<GeminiResponse> {
    
    // ✅ Validasi API Key dulu
    if (!API_KEY || API_KEY.length < 20) {
      console.error('❌ API Key tidak valid atau kosong');
      return {
        text: '⚠️ **Konfigurasi API Error**\n\nAPI Key Gemini belum dikonfigurasi dengan benar.\n\n**Langkah perbaikan:**\n1. Pastikan file .env ada di root project\n2. Restart Expo dengan: `npx expo start --clear`\n3. Cek console untuk status API key',
        error: 'API_KEY_MISSING',
      };
    }

    try {
      console.log('🤖 Sending request to Gemini AI...');
      console.log('📝 User message:', userMessage.substring(0, 50) + '...');

      // Format history untuk Gemini API
      const formattedHistory = chatHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

      const chat = this.model.startChat({
        history: [
          {
            role: 'user',
            parts: [{ text: systemPrompt }],
          },
          {
            role: 'model',
            parts: [{ text: 'Baik, saya siap membantu sebagai Asisten Kesehatan Habitin yang professional, empatik, dan memberikan informasi kesehatan yang akurat serta personal.' }],
          },
          ...formattedHistory,
        ],
        generationConfig: {
          maxOutputTokens: 2000,
          temperature: 0.7,
          topP: 0.9,
          topK: 40,
        },
      });

      const result = await chat.sendMessage(userMessage);
      const response = await result.response;
      const text = response.text();

      console.log('✅ Gemini response received');
      return { text };

    } catch (error: any) {
      console.error('❌ Gemini API Error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        statusText: error.statusText,
      });
      
      let errorMessage = '⚠️ **Error Gemini API**\n\n';
      
      // ✅ Detect specific errors
      if (error.message?.includes('API key expired') || error.message?.includes('API_KEY_INVALID')) {
        errorMessage += '**API Key Expired atau Invalid**\n\n';
        errorMessage += '📝 API Key Anda sudah tidak valid atau expired.\n\n';
        errorMessage += '**Solusi:**\n';
        errorMessage += '1. Buka: https://aistudio.google.com/apikey\n';
        errorMessage += '2. Generate API key BARU\n';
        errorMessage += '3. Update di file .env\n';
        errorMessage += '4. Restart Expo: `npx expo start --clear`';
      } 
      else if (error.message?.includes('quota') || error.message?.includes('429')) {
        errorMessage += '**Kuota API Habis**\n\n';
        errorMessage += 'Kuota gratis Gemini API sudah habis untuk hari ini.\n\n';
        errorMessage += '**Solusi:**\n';
        errorMessage += '• Tunggu hingga besok (reset 00:00 UTC)\n';
        errorMessage += '• Atau upgrade ke paket berbayar';
      }
      else if (error.message?.includes('not found') || error.message?.includes('404')) {
        errorMessage += '**Model Tidak Ditemukan**\n\n';
        errorMessage += `Model "gemini-1.5-flash" tidak tersedia untuk API key Anda.\n\n`;
        errorMessage += '**Kemungkinan:**\n';
        errorMessage += '• API key dari region yang tidak support\n';
        errorMessage += '• API key belum diaktifkan\n';
        errorMessage += '• Perlu generate API key baru';
      }
      else if (error.message?.includes('permission') || error.message?.includes('403')) {
        errorMessage += '**Permission Denied**\n\n';
        errorMessage += 'API key tidak punya akses ke model ini.\n\n';
        errorMessage += 'Generate API key baru di: https://aistudio.google.com/apikey';
      }
      else {
        errorMessage += `**Unexpected Error**\n\n${error.message}\n\n`;
        errorMessage += 'Coba generate API key baru atau hubungi support.';
      }
      
      return {
        text: errorMessage,
        error: error.message,
      };
    }
  }

  static isConfigured(): boolean {
    const configured = !!API_KEY && API_KEY !== '' && API_KEY.length > 20;
    
    console.log('🔍 API Configuration Check:', {
      configured,
      keyLength: API_KEY.length,
      keyPreview: API_KEY ? `${API_KEY.substring(0, 10)}...` : 'NOT_SET',
    });
    
    if (!configured) {
      console.warn('⚠️ Gemini API Key tidak valid');
      console.warn('Expected length: >20 characters');
      console.warn('Current length:', API_KEY.length);
    }
    
    return configured;
  }

  /**
   * Test koneksi dengan simple message
   */
  static async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🧪 Testing Gemini API connection...');
      console.log('🔑 Using API Key:', `${API_KEY.substring(0, 10)}...`);
      
      const result = await this.model.generateContent('Halo, tes koneksi');
      const response = await result.response;
      const text = response.text();
      
      console.log('✅ Test successful:', text);
      return {
        success: true,
        message: `Koneksi berhasil! Response: ${text.substring(0, 50)}...`
      };
    } catch (error: any) {
      console.error('❌ Test failed:', error.message);
      return {
        success: false,
        message: `Koneksi gagal: ${error.message}`
      };
    }
  }
}