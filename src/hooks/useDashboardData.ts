import { useCallback, useEffect, useState } from 'react';
import { getDashboardData } from '@/apis/dashboardApi';
import { DashboardData } from '@/types/dashboard';

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (refresh = false) => {
    refresh ? setIsRefreshing(true) : setIsLoading(true);
    setError(null);
    try {
      setData(await getDashboardData());
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Dashboard data is unavailable.';
      setError(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, isLoading, isRefreshing, error, refresh: () => load(true), retry: () => load() };
};
