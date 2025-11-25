import { useEffect, useState } from 'react';
import { auth } from '../config/firebase.config';
import { ChallengeService } from '../services/database/challenge.service';
import { HealthService } from '../services/database/health.service';

type RiskLevel = 'rendah' | 'sedang' | 'tinggi';

interface DashboardData {
  riskLevel: RiskLevel;
  latestHealthCheck: any;
  activeChallenge: any;
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

  useEffect(() => {
    const fetchDashboardData = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        // Fetch health check data
        const { data: healthData } = await HealthService.getLatestHealthCheck(
          currentUser.uid
        );

        // Fetch active challenges
        const { data: challenges } = await ChallengeService.getActiveChallenges(
          currentUser.uid
        );

        // Fetch challenge stats
        const { data: stats } = await ChallengeService.getChallengeStats(
          currentUser.uid
        );

        // Calculate risk level (simplified logic)
        let riskLevel: RiskLevel = 'rendah';
        if (healthData && healthData.blood_pressure) {
          // Parse blood pressure (format: "120/80")
          const parts = healthData.blood_pressure.split('/');
          if (parts.length === 2) {
            const systolic = parseInt(parts[0], 10);
            if (!isNaN(systolic)) {
              if (systolic > 140) riskLevel = 'tinggi';
              else if (systolic > 120) riskLevel = 'sedang';
            }
          }
        }

        setData({
          riskLevel,
          latestHealthCheck: healthData,
          activeChallenge: challenges && challenges.length > 0 ? challenges[0] : null,
          challengeStats: stats || { total: 0, active: 0, completed: 0 },
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const refetch = async () => {
    setLoading(true);
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      const { data: healthData } = await HealthService.getLatestHealthCheck(
        currentUser.uid
      );
      const { data: challenges } = await ChallengeService.getActiveChallenges(
        currentUser.uid
      );
      const { data: stats } = await ChallengeService.getChallengeStats(
        currentUser.uid
      );

      let riskLevel: RiskLevel = 'rendah';
      if (healthData && healthData.blood_pressure) {
        const parts = healthData.blood_pressure.split('/');
        if (parts.length === 2) {
          const systolic = parseInt(parts[0], 10);
          if (!isNaN(systolic)) {
            if (systolic > 140) riskLevel = 'tinggi';
            else if (systolic > 120) riskLevel = 'sedang';
          }
        }
      }

      setData({
        riskLevel,
        latestHealthCheck: healthData,
        activeChallenge: challenges && challenges.length > 0 ? challenges[0] : null,
        challengeStats: stats || { total: 0, active: 0, completed: 0 },
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
};