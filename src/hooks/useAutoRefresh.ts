// src/hooks/useAutoRefresh.ts
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';

interface UseAutoRefreshOptions {
  fetchData: () => Promise<void>;
  refreshOnFocus?: boolean;
}

export const useAutoRefresh = ({
  fetchData,
  refreshOnFocus = true,
}: UseAutoRefreshOptions) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    
    try {
      setIsRefreshing(true);
      await fetchData();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchData, isRefreshing]);

  // Hanya refresh saat screen focus (pindah tab)
  useFocusEffect(
    useCallback(() => {
      if (refreshOnFocus) {
        console.log('🔄 Refreshing on screen focus');
        handleRefresh();
      }
    }, [refreshOnFocus, handleRefresh])
  );

  return {
    isRefreshing,
    refresh: handleRefresh,
  };
};