import Config from 'react-native-config';

const requireEnvironmentValue = (key: keyof typeof Config): string => {
  const value = Config[key]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

const environmentFlag = (key: keyof typeof Config, fallback = false): boolean => {
  const value = Config[key]?.trim().toLowerCase();
  if (!value) return fallback;
  return value === 'true' || value === '1' || value === 'yes';
};

export const BASE_URL = requireEnvironmentValue('API_BASE_URL');
export const WEBSOCKET_URL = requireEnvironmentValue('WEBSOCKET_URL');
export const USE_MOCK_API = environmentFlag('USE_MOCK_API');
export const USE_MOCK_WEBSOCKET = environmentFlag('USE_MOCK_WEBSOCKET');
export const REFERRAL_REQUEST_EMAIL = requireEnvironmentValue('REFERRAL_REQUEST_EMAIL');
export const MOCK_LOGIN_EMAIL = USE_MOCK_API ? requireEnvironmentValue('MOCK_LOGIN_EMAIL') : '';
export const MOCK_LOGIN_PASSWORD = USE_MOCK_API ? requireEnvironmentValue('MOCK_LOGIN_PASSWORD') : '';

export const API_TIMEOUT_MS = 12_000;
export const MOCK_DELAY_MS = 650;
export const LIVE_AIRCRAFT_FEED_URL = 'http://150.107.210.11/data/aircraft.json';
export const LIVE_AIRCRAFT_POLL_INTERVAL_MS = 10_000;
export const INDIAN_AIR_FORCE_DATABASE_PATH = '/api/aircraft/indian-air-force';
export const OPEN_METEO_FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
