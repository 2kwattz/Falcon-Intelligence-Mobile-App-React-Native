import { useCallback, useEffect, useState } from 'react';
import { getTrackedAircraftArchive } from '@/apis/trackedAircraftApi';
import { TrackedAircraftArchive } from '@/types/trackedAircraft';

const getErrorMessage = (error: unknown): string => error instanceof Error
  ? error.message
  : 'The tracked-aircraft archive is unavailable.';

export const useTrackedAircraftArchive = () => {
  const [data, setData] = useState<TrackedAircraftArchive | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (refresh = false) => {
    refresh ? setIsRefreshing(true) : setIsLoading(true);
    setError(null);
    try {
      setData(await getTrackedAircraftArchive());
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

  return { data, isLoading, isRefreshing, error, refresh: () => load(true), retry: () => load() };
};
