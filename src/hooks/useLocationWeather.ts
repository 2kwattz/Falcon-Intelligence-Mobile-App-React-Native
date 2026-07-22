import { useCallback, useEffect, useState } from 'react';
import { getWeatherForCoordinates } from '@/apis/weatherApi';
import { getCurrentDeviceCoordinates } from '@/services/locationService';
import { WeatherData } from '@/types/dashboard';

const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  return 'Weather for your current location is unavailable.';
};

export const useLocationWeather = () => {
  const [data, setData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (refresh = false) => {
    refresh ? setIsRefreshing(true) : setIsLoading(true);
    setError(null);
    try {
      const coordinates = await getCurrentDeviceCoordinates();
      setData(await getWeatherForCoordinates(coordinates.latitude, coordinates.longitude));
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
    data,
    isLoading,
    isRefreshing,
    error,
    refresh: () => load(true),
    retry: () => load(),
  };
};
