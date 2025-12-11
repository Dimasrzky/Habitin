// src/types/health.types.ts

export type RiskLevel = 'rendah' | 'sedang' | 'tinggi';

export interface LabResult {
  id?: string;
  user_id: string;
  
  // Data Kesehatan
  glucose_level: number | null; // mg/dL
  glucose_2h: number | null;   
  cholesterol_total: number | null; // mg/dL
  cholesterol_ldl: number | null; // mg/dL
  cholesterol_hdl: number | null; // mg/dL
  triglycerides: number | null; // mg/dL
  hba1c: number | null; // %
  
  // Metadata
  risk_level: RiskLevel;
  risk_score: number; // 0-100
  image_url: string;
  raw_ocr_text: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface OCRResult {
  success: boolean;
  fullText: string;
  confidence: number;
  error?: string; 
}

export interface ExtractedHealthData {
  glucose_level: number | null;
  cholesterol_total: number | null;
  cholesterol_ldl: number | null;
  cholesterol_hdl: number | null;
  triglycerides: number | null;
  hba1c: number | null;
  glucose_2h: number | null;   
}

export interface RiskAnalysis {
  level: RiskLevel;
  score: number;
  recommendations: string[];
  detectedConditions: string[];
}