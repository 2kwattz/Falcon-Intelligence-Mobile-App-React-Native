import { useCallback, useEffect, useRef, useState } from 'react';
import { getDashboardData } from '@/apis/dashboardApi';
import { getServerStatus } from '@/apis/serverApi';
import { LIVE_AIRCRAFT_POLL_INTERVAL_MS } from '@/constants/config';
import { DashboardData } from '@/types/dashboard';

const SERVER_STATUS_POLL_INTERVAL_MS = 3_000;

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isServerRefreshing, setIsServerRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isServerRequestInFlight = useRef(false);

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

  useEffect(() => {
    const interval = setInterval(() => {
      getDashboardData().then(setData).catch(() => undefined);
    }, LIVE_AIRCRAFT_POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  const refreshServerStatus = useCallback(async () => {
    if (isServerRequestInFlight.current) return;

    isServerRequestInFlight.current = true;
    setIsServerRefreshing(true);
    try {
      const server = await getServerStatus();
      setData((currentData) => (currentData ? { ...currentData, server } : currentData));
    } finally {
      isServerRequestInFlight.current = false;
      setIsServerRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      refreshServerStatus().catch(() => undefined);
    }, SERVER_STATUS_POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [refreshServerStatus]);

  return {
    data,
    isLoading,
    isRefreshing,
    isServerRefreshing,
    error,
    refresh: () => load(true),
    refreshServerStatus,
    retry: () => load(),
  };
};
