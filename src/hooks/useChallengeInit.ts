import { supabase } from '@/config/supabase.config';
import { useAuth } from '@/context/AuthContext';
import { useChallengeStore } from '@/stores/useChallengeStore';
import { HealthFocus } from '@/types/challenge.types';
import { useEffect, useState } from 'react';

/**
 * Hook untuk initialize challenge system
 * Digunakan di screen utama untuk load data awal
 */ 
export const useChallengeInit = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initialize = useChallengeStore((state) => state.initialize);
  const isInitialized = useChallengeStore((state) => state.isInitialized);

  useEffect(() => {
    const initChallenges = async () => {
      if (!user?.uid) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // 1. Check if user has uploaded lab results
        const { data: labResults, error: labError } = await supabase
          .from('lab_results')
          .select('id, diabetes_risk_percentage, cholesterol_risk_percentage')
          .eq('user_id', user.uid)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (labError && labError.code !== 'PGRST116') {
          throw labError;
        }

        const hasUploadedLab = !!labResults;

        if (!hasUploadedLab) {
          // User belum upload lab, initialize dengan state kosong
          await initialize(user.uid, 'general', false);
          setIsLoading(false);
          return;
        }

        // 2. Determine health priority
        const diabetesRisk = labResults.diabetes_risk_percentage || 0;
        const cholesterolRisk = labResults.cholesterol_risk_percentage || 0;

        let healthPriority: HealthFocus;
        if (diabetesRisk > cholesterolRisk) {
          healthPriority = 'diabetes';
        } else if (cholesterolRisk > diabetesRisk) {
          healthPriority = 'cholesterol';
        } else {
          // Jika sama atau keduanya 0, gunakan general
          healthPriority = 'general';
        }

        // 3. Initialize challenge store
        await initialize(user.uid, healthPriority, true);

        setIsLoading(false);
      } catch (err) {
        console.error('Error initializing challenges:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize challenges');
        setIsLoading(false);
      }
    };

    initChallenges();
  }, [user?.uid, initialize]);

  return {
    isLoading,
    error,
    isInitialized,
  };
};