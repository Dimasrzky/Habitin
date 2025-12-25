import { useCallback, useEffect, useRef, useState } from 'react';
import { auth } from '../config/firebase.config';
import { ChallengeService } from '../services/database/challenge.service';
import { getLatestLabResult } from '../services/health/healthAPI';
import { MasterChallenge } from '../types/challenge.types';
import { LabResult } from '../types/health.types';
import { getCompletionPercentage } from '../utils/challengeHelpers';
import { useRealtimeChallenge } from './useRealtimeChallenge';

type RiskLevel = 'rendah' | 'sedang' | 'tinggi';

interface ChallengeData {
  id: string;
  title: string;
  progress: number;
  currentDay: number;
  target: number;
  status: string;
}

interface DashboardData {
  riskLevel: RiskLevel;
  latestHealthCheck: LabResult | null;
  latestLabResult: LabResult | null;
  activeChallenge: ChallengeData | null;
  challengeStats: {
    total: number;
    active: number;
    completed: number;
  };
}

export const useDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refs to prevent race conditions and stale closures
  const isFetchingRef = useRef(false);
  const lastFetchTimeRef = useRef(0);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch data function with race condition prevention
  const fetchData = useCallback(async (showLoading = true) => {
    // Prevent concurrent fetches
    if (isFetchingRef.current) {
      console.log('⏸️ Fetch already in progress, skipping...');
      return;
    }

    // Debounce: prevent rapid successive calls (minimum 500ms between fetches)
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTimeRef.current;
    if (timeSinceLastFetch < 500) {
      console.log('⏸️ Debouncing fetch, too soon since last fetch');
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      setLoading(false);
      setData({
        riskLevel: 'rendah',
        latestHealthCheck: null,
        latestLabResult: null,
        activeChallenge: null,
        challengeStats: { total: 0, active: 0, completed: 0 },
      });
      return;
    }

    try {
      isFetchingRef.current = true;
      lastFetchTimeRef.current = Date.now();

      if (showLoading) {
        setLoading(true);
      }

      console.log('🔄 Fetching dashboard data...');

      const [challengesResult, statsResult, labResult] = await Promise.all([
        ChallengeService.getActiveChallenges(currentUser.uid),
        ChallengeService.getChallengeStats(currentUser.uid),
        getLatestLabResult(currentUser.uid),
      ]);

      const challenges = challengesResult.data || [];
      const stats = statsResult.data || { total: 0, active: 0, completed: 0 };
      const latestLab = labResult;

      // Transform UserActiveChallenge to ChallengeData format
      let activeChallenge: ChallengeData | null = null;
      if (challenges.length > 0) {
        const challenge = challenges[0];
        const masterChallenge = challenge.challenge as MasterChallenge;
        const progress = getCompletionPercentage(challenge);

        activeChallenge = {
          id: challenge.id,
          title: masterChallenge.title,
          progress: Math.round(progress),
          currentDay: challenge.current_day,
          target: masterChallenge.duration_days,
          status: challenge.status,
        };
      }

      // Use lab result risk level if available, otherwise default to 'rendah'
      const riskLevel = latestLab ? latestLab.risk_level : 'rendah';

      const newData = {
        riskLevel,
        latestHealthCheck: latestLab,
        latestLabResult: latestLab,
        activeChallenge,
        challengeStats: stats,
      };

      setData(newData);
      setError(null);

      console.log('✅ Dashboard data updated:', {
        activeChallenge: activeChallenge?.title || 'none',
        stats,
      });
    } catch (err: any) {
      console.error('❌ Error fetching dashboard data:', err);
      setError(err.message);

      setData({
        riskLevel: 'rendah',
        latestHealthCheck: null,
        latestLabResult: null,
        activeChallenge: null,
        challengeStats: { total: 0, active: 0, completed: 0 },
      });
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Debounced realtime update handler
  const handleRealtimeUpdate = useCallback(() => {
    console.log('🔔 Challenge realtime update received');

    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce realtime updates by 1 second to avoid rapid refreshes
    debounceTimerRef.current = setTimeout(() => {
      console.log('📊 Executing debounced dashboard refresh...');
      fetchData(false); // Don't show loading spinner for background updates
    }, 1000);
  }, [fetchData]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Real-time subscription to challenge updates
  useRealtimeChallenge({
    onChallengeUpdate: handleRealtimeUpdate,
    enabled: true,
  });

  // Manual refetch function for pull-to-refresh
  const refetch = useCallback(async () => {
    console.log('🔄 Manual refetch triggered');
    await fetchData(true); // Show loading spinner for manual refresh
  }, [fetchData]);

  return { data, loading, error, refetch };
};
