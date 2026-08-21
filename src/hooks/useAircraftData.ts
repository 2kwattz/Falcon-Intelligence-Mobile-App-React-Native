import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getLiveAircraftFeed, getOpenSkyAircraftFeed } from '@/apis/aircraftApi';
import { LIVE_AIRCRAFT_POLL_INTERVAL_MS, OPEN_SKY_POLL_INTERVAL_MS } from '@/constants/config';
import { Aircraft, AircraftSource } from '@/types/aircraft';

const initialSources: AircraftSource[] = ['sdr', 'opensky'];

export const useAircraftData = () => {
  const [sdrAircraft, setSdrAircraft] = useState<Aircraft[]>([]);
  const [openSkyAircraft, setOpenSkyAircraft] = useState<Aircraft[]>([]);
  const [enabledSources, setEnabledSources] = useState<Set<AircraftSource>>(() => new Set(initialSources));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastOpenSkyFetchAt = useRef(0);
  const hasOpenSkySnapshot = useRef(false);

  const load = useCallback(async (forceOpenSky = false) => {
    setIsLoading(true);
    const shouldFetchOpenSky = forceOpenSky || Date.now() - lastOpenSkyFetchAt.current >= OPEN_SKY_POLL_INTERVAL_MS;
    const [sdrResult, openSkyResult] = await Promise.allSettled([
      getLiveAircraftFeed(),
      shouldFetchOpenSky ? getOpenSkyAircraftFeed() : Promise.resolve(null),
    ]);

    let hasAvailableFeed = false;
    const failures: string[] = [];

    if (sdrResult.status === 'fulfilled') {
      setSdrAircraft(sdrResult.value.aircraft);
      hasAvailableFeed = true;
    } else {
      failures.push(sdrResult.reason instanceof Error ? sdrResult.reason.message : 'SDR feed is unavailable.');
    }

    if (shouldFetchOpenSky) {
      if (openSkyResult.status === 'fulfilled') {
        setOpenSkyAircraft(openSkyResult.value?.aircraft ?? []);
        lastOpenSkyFetchAt.current = Date.now();
        hasOpenSkySnapshot.current = true;
        hasAvailableFeed = true;
      } else {
        failures.push(openSkyResult.reason instanceof Error ? openSkyResult.reason.message : 'OpenSky feed is unavailable.');
      }
    } else if (hasOpenSkySnapshot.current) {
      hasAvailableFeed = true;
    }

    setError(hasAvailableFeed ? null : failures.join(' '));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    load().catch(() => undefined);
    const poller = setInterval(() => {
      load().catch(() => undefined);
    }, LIVE_AIRCRAFT_POLL_INTERVAL_MS);

    return () => clearInterval(poller);
  }, [load]);

  const toggleSource = useCallback((source: AircraftSource) => {
    setEnabledSources((current) => {
      const next = new Set(current);
      if (next.has(source)) {
        next.delete(source);
      } else {
        next.add(source);
      }
      return next;
    });
  }, []);

  const visibleAircraft = useMemo(
    () => [...sdrAircraft, ...openSkyAircraft]
      .filter((item) => enabledSources.has(item.source))
      .sort((first, second) => second.lastSeen.localeCompare(first.lastSeen)),
    [enabledSources, openSkyAircraft, sdrAircraft],
  );
  const aircraft = useMemo(() => visibleAircraft.filter((item) => item.hasPosition !== false), [visibleAircraft]);
  const dataOnlyAircraft = useMemo(() => visibleAircraft.filter((item) => item.hasPosition === false), [visibleAircraft]);

  return {
    aircraft,
    dataOnlyAircraft,
    visibleAircraft,
    enabledSources,
    toggleSource,
    isLoading,
    error,
    retry: () => load(true),
  };
};
