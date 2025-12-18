import { useEffect, useState } from 'react';
import { auth } from '../config/firebase.config';
import { ChallengeService } from '../services/database/challenge.service';
import { getLatestLabResult } from '../services/health/healthAPI';
import { MasterChallenge } from '../types/challenge.types';
import { LabResult } from '../types/health.types';
import { getCompletionPercentage } from '../utils/challengeHelpers';

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

  const fetchData = async () => {
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

      setData({
        riskLevel,
        latestHealthCheck: latestLab,
        latestLabResult: latestLab,
        activeChallenge,
        challengeStats: stats,
      });

      setError(null);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
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
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refetch = async () => {
    setLoading(true);
    await fetchData();
  };

  return { data, loading, error, refetch };
};