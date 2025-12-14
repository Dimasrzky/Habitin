import { useEffect, useState } from 'react';
import { auth } from '../config/firebase.config';
import { ChallengeService } from '../services/database/challenge.service';
import { HealthService } from '../services/database/health.service';
import { getLatestLabResult } from '../services/health/healthAPI';
import { LabResult } from '../types/health.types';

type RiskLevel = 'rendah' | 'sedang' | 'tinggi';

interface HealthCheckData {
  id: string;
  user_id: string;
  weight: number | null;
  height: number | null;
  blood_pressure: string | null;
  heart_rate: number | null;
  check_date: string;
  notes: string | null;
  created_at: string;
}

interface ChallengeData {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  target: number;
  progress: number;
  status: 'active' | 'completed' | 'failed';
  start_date: string;
  end_date: string;
  created_at: string;
}

interface DashboardData {
  riskLevel: RiskLevel;
  latestHealthCheck: HealthCheckData | null;
  latestLabResult: LabResult | null;
  activeChallenge: ChallengeData | null;
  challengeStats: {
    total: number;
    active: number;
    completed: number;
  };
}

const calculateRiskLevel = (healthCheck: HealthCheckData | null): RiskLevel => {
  if (!healthCheck) {
    return 'rendah';
  }

  const bloodPressure = healthCheck.blood_pressure;
  if (!bloodPressure || typeof bloodPressure !== 'string') {
    return 'rendah';
  }

  const parts = bloodPressure.split('/');
  if (parts.length !== 2) {
    return 'rendah';
  }

  const systolic = parseInt(parts[0], 10);
  if (isNaN(systolic)) {
    return 'rendah';
  }

  if (systolic > 140) return 'tinggi';
  if (systolic > 120) return 'sedang';
  return 'rendah';
};

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
      const [healthResult, challengesResult, statsResult, labResult] = await Promise.all([
        HealthService.getLatestHealthCheck(currentUser.uid),
        ChallengeService.getActiveChallenges(currentUser.uid),
        ChallengeService.getChallengeStats(currentUser.uid),
        getLatestLabResult(currentUser.uid),
      ]);

      const healthData = healthResult.data;
      const challenges = challengesResult.data || [];
      const stats = statsResult.data || { total: 0, active: 0, completed: 0 };
      const latestLab = labResult;

      const activeChallenge = challenges.length > 0 ? challenges[0] : null;

      // Use lab result risk level if available, otherwise calculate from health check
      const riskLevel = latestLab ? latestLab.risk_level : calculateRiskLevel(healthData);

      setData({
        riskLevel,
        latestHealthCheck: healthData,
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