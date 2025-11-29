// src/services/health/healthAPI.ts

import { supabase } from '../../config/supabase.config';
import { LabResult } from '../../types/health.types';

/**
 * Save lab result to Supabase
 */
export const saveLabResult = async (
  labData: Omit<LabResult, 'id'>
): Promise<LabResult> => {
  try {
    const { data, error } = await supabase
      .from('lab_results')
      .insert(labData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error('No data returned from insert');
    }

    return data as LabResult;
  } catch (error) {
    console.error('❌ Save lab result error:', error);
    throw error;
  }
};

/**
 * Get all lab results for a user
 */
export const getLabResults = async (
  userId: string
): Promise<LabResult[]> => {
  try {
    const { data, error } = await supabase
      .from('lab_results')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('❌ Get lab results error:', error);
    throw error;
  }
};

/**
 * Get single lab result by ID
 */
export const getLabResultById = async (
  resultId: string
): Promise<LabResult | null> => {
  try {
    const { data, error } = await supabase
      .from('lab_results')
      .select('*')
      .eq('id', resultId)
      .single();

    if (error) {
      throw error;
    }

    return data as LabResult;
  } catch (error) {
    console.error('❌ Get lab result by ID error:', error);
    throw error;
  }
};