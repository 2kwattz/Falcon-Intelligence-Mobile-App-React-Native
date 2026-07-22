import axios from 'axios';
import { API_TIMEOUT_MS, OPEN_METEO_FORECAST_URL } from '@/constants/config';
import { WeatherData } from '@/types/dashboard';

interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  current: {
    time: string;
    temperature_2m: number;
    weather_code: number;
    visibility: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    pressure_msl: number;
    is_day: number;
  };
  daily: {
    sunrise: string[];
    sunset: string[];
  };
}

const weatherCondition = (code: number): string => {
  if (code === 0) return 'Clear sky';
  if (code === 1) return 'Mainly clear';
  if (code === 2) return 'Partly cloudy';
  if (code === 3) return 'Overcast';
  if (code === 45 || code === 48) return 'Fog';
  if (code >= 51 && code <= 57) return 'Drizzle';
  if (code >= 61 && code <= 67) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Rain showers';
  if (code === 85 || code === 86) return 'Snow showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Current conditions';
};

const compassDirection = (degrees: number): string => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return directions[Math.round(degrees / 45) % directions.length] ?? 'N';
};

const clockTime = (value?: string): string => value?.split('T')[1]?.slice(0, 5) ?? '—';

export const getWeatherForCoordinates = async (latitude: number, longitude: number): Promise<WeatherData> => {
  const response = await axios.get<OpenMeteoResponse>(OPEN_METEO_FORECAST_URL, {
    timeout: API_TIMEOUT_MS,
    params: {
      latitude,
      longitude,
      current: [
        'temperature_2m',
        'weather_code',
        'visibility',
        'wind_speed_10m',
        'wind_direction_10m',
        'pressure_msl',
        'is_day',
      ].join(','),
      daily: 'sunrise,sunset',
      timezone: 'auto',
      forecast_days: 1,
    },
  });

  const weather = response.data;
  return {
    city: 'Current location',
    condition: weatherCondition(weather.current.weather_code),
    temperatureC: Math.round(weather.current.temperature_2m),
    visibilityKm: Math.round((weather.current.visibility / 1000) * 10) / 10,
    windKph: Math.round(weather.current.wind_speed_10m),
    windDirection: compassDirection(weather.current.wind_direction_10m),
    pressureHpa: Math.round(weather.current.pressure_msl),
    sunrise: clockTime(weather.daily.sunrise[0]),
    sunset: clockTime(weather.daily.sunset[0]),
    latitude: weather.latitude,
    longitude: weather.longitude,
    observedAt: weather.current.time,
    weatherCode: weather.current.weather_code,
    isDay: weather.current.is_day === 1,
  };
};
