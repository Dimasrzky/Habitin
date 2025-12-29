export interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  sender: 'user' | 'bot';
  context?: HealthContext;
  created_at: Date;
}

export interface HealthContext {
  age?: number;
  gender?: string;
  weight?: number;
  height?: number;
  bmi?: number;
  health_conditions?: string[];
  latest_lab_summary?: string;
  risk_level?: 'low' | 'medium' | 'high';
}

export interface GeminiResponse {
  text: string;
  error?: string;
}