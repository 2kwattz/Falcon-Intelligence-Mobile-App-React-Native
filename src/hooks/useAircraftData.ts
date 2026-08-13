import { useCallback, useEffect, useMemo, useState } from 'react';
import { getLiveAircraftFeed } from '@/apis/aircraftApi';
import { LIVE_AIRCRAFT_POLL_INTERVAL_MS } from '@/constants/config';
import { Aircraft, MapFilter } from '@/types/aircraft';

export const useAircraftData = () => {
  const [liveAircraft, setLiveAircraft] = useState<Aircraft[]>([]);
  const [filter, setFilter] = useState<MapFilter>('adsb');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setLiveAircraft((await getLiveAircraftFeed()).aircraft);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Aircraft feed is unavailable.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const poller = setInterval(() => {
      void load();
    }, LIVE_AIRCRAFT_POLL_INTERVAL_MS);

    return () => clearInterval(poller);
  }, [load]);

  const aircraft = useMemo(() => {
    return liveAircraft;
  }, [liveAircraft]);

  return { aircraft, filter, setFilter, isLoading, error, retry: load };
};
