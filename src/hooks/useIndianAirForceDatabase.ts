import { useCallback, useEffect, useState } from 'react';
import { getIndianAirForceAircraft } from '@/apis/airForceApi';
import { IndianAirForceAircraft } from '@/types/airForce';

const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  return 'The Indian Air Force database is unavailable.';
};

export const useIndianAirForceDatabase = () => {
  const [aircraft, setAircraft] = useState<IndianAirForceAircraft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (refresh = false) => {
    refresh ? setIsRefreshing(true) : setIsLoading(true);
    setError(null);
    try {
      setAircraft(await getIndianAirForceAircraft());
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load().catch(() => undefined);
  }, [load]);

  return {
    aircraft,
    isLoading,
    isRefreshing,
    error,
    refresh: () => load(true),
    retry: () => load(),
  };
};
