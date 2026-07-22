import { useCallback, useEffect, useMemo, useState } from 'react';
import { getLocalSdrAircraft, getOpenSkyAircraft, mergeAircraftSources } from '@/apis/aircraftApi';
import { Aircraft, MapFilter } from '@/types/aircraft';

export const useAircraftData = () => {
  const [openSky, setOpenSky] = useState<Aircraft[]>([]);
  const [sdr, setSdr] = useState<Aircraft[]>([]);
  const [filter, setFilter] = useState<MapFilter>('combined');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [openSkyData, sdrData] = await Promise.all([getOpenSkyAircraft(), getLocalSdrAircraft()]);
      setOpenSky(openSkyData);
      setSdr(sdrData);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Aircraft feed is unavailable.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const aircraft = useMemo(() => {
    const combined = mergeAircraftSources(openSky, sdr);
    if (filter === 'opensky') return openSky;
    if (filter === 'sdr') return sdr;
    if (filter === 'military') return combined.filter((item) => item.isMilitary);
    if (filter === 'favorites') return combined.filter((item) => item.isFavorite);
    return combined;
  }, [filter, openSky, sdr]);

  return { aircraft, filter, setFilter, isLoading, error, retry: load };
};
