// src/services/gemini/chatService.ts

import { supabaseAdmin } from '@/config/supabase.config'; // ← UBAH INI
import { getPersonalizedPrompt } from '@/constants/chatPrompts';
import { ChatMessage, HealthContext } from '@/types/chat.types';
import { GeminiService } from './geminiService';
import { HealthContextService } from './healthContextService';

export class ChatService {
  static async sendMessage(
    userId: string,
    message: string
  ): Promise<{ userMessage: ChatMessage; botMessage: ChatMessage }> {
    try {
      console.log('📤 Sending message for user:', userId);

      const healthContext = await HealthContextService.getUserHealthContext(userId);
      const contextText = HealthContextService.formatContextForAI(healthContext);

      const chatHistory = await this.getChatHistory(userId, 5);
      
      const formattedHistory = chatHistory.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        content: msg.message,
      }));

      const systemPrompt = getPersonalizedPrompt(contextText);

      const geminiResponse = await GeminiService.generateResponse(
        message,
        systemPrompt,
        formattedHistory
      );

      console.log('💾 Saving messages to database...');

      const userMessage = await this.saveMessage(
        userId,
        message,
        'user',
        healthContext
      );

      const botMessage = await this.saveMessage(
        userId,
        geminiResponse.text,
        'bot',
        healthContext
      );

      console.log('✅ Messages saved successfully');

      return { userMessage, botMessage };

    } catch (error: any) {
      console.error('❌ Error in sendMessage:', error);
      
      if (error.code) {
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
      }
      
      throw error;
    }
  }

  private static async saveMessage(
    userId: string,
    message: string,
    sender: 'user' | 'bot',
    context?: HealthContext
  ): Promise<ChatMessage> {
    try {
      console.log('💾 Saving message:', {
        userId,
        sender,
        messageLength: message.length,
      });

      // ✅ GUNAKAN supabaseAdmin untuk bypass RLS
      const { data, error } = await supabaseAdmin
        .from('chat_messages')
        .insert({
          user_id: userId,
          message,
          sender,
          context: context || null,
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error saving message:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
        throw error;
      }

      console.log('✅ Message saved:', data.id);

      return {
        id: data.id,
        user_id: data.user_id,
        message: data.message,
        sender: data.sender,
        context: data.context,
        created_at: new Date(data.created_at),
      };
    } catch (error) {
      console.error('❌ Failed to save message:', error);
      throw error;
    }
  }

  static async getChatHistory(
    userId: string,
    limit: number = 50
  ): Promise<ChatMessage[]> {
    try {
      console.log('📖 Loading chat history for user:', userId);

      // ✅ GUNAKAN supabaseAdmin untuk bypass RLS
      const { data, error } = await supabaseAdmin
        .from('chat_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Error fetching chat history:', error);
        return [];
      }

      console.log(`✅ Loaded ${data?.length || 0} messages from history`);

      return (data || []).reverse().map(msg => ({
        id: msg.id,
        user_id: msg.user_id,
        message: msg.message,
        sender: msg.sender,
        context: msg.context,
        created_at: new Date(msg.created_at),
      }));
    } catch (error) {
      console.error('❌ Error in getChatHistory:', error);
      return [];
    }
  }

  static async clearChatHistory(userId: string): Promise<void> {
    try {
      console.log('🗑️ Clearing chat history for user:', userId);

      // ✅ GUNAKAN supabaseAdmin untuk bypass RLS
      const { error } = await supabaseAdmin
        .from('chat_messages')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      console.log('✅ Chat history cleared');
    } catch (error) {
      console.error('❌ Error clearing chat history:', error);
      throw error;
    }
  }
}