import { Aircraft } from '@/types/aircraft';
import { DashboardSummary, FlightAlert, SdrStatus, ServerStatus } from '@/types/dashboard';

const now = Date.now();
const minutesAgo = (minutes: number) => new Date(now - minutes * 60_000).toISOString();

export const mockSummary: DashboardSummary = {
  aircraftInRange: 12,
  military: 1,
  alerts: 2,
};

export const mockAlerts: FlightAlert[] = [
  {
    id: 'alert-1',
    aircraft: 'C-17 Globemaster',
    message: 'Entered monitored radius',
    severity: 'critical',
    timestamp: minutesAgo(3),
    isRead: false,
  },
  {
    id: 'alert-2',
    aircraft: 'P-8I Neptune',
    message: 'Military aircraft detected',
    severity: 'warning',
    timestamp: minutesAgo(11),
    isRead: false,
  },
  {
    id: 'alert-3',
    aircraft: 'A320 • IGO6E2',
    message: 'Departed monitored airspace',
    severity: 'info',
    timestamp: minutesAgo(26),
    isRead: true,
  },
];

export const mockSdrStatus: SdrStatus = {
  connected: true,
  device: 'RTL-SDR Blog V4',
  frequencyMhz: 1090,
  gainDb: 38.6,
  messagesPerSecond: 198,
  signalQuality: 86,
  temperatureC: 42,
};

export const mockServerStatus: ServerStatus = {
  online: true,
  latencyMs: 24,
  apiResponseMs: 81,
  database: 'Operational',
  websocket: 'Connected',
  logs: [
    '16:21:42  ADS-B frame batch processed',
    '16:21:38  OpenSky overlay synchronized',
    '16:21:31  SDR heartbeat acknowledged',
  ],
};

export const mockOpenSkyAircraft: Aircraft[] = [
  {
    id: 'os-1',
    icao24: '800B23',
    callsign: 'IGO6E2',
    name: 'IndiGo 6E2',
    model: 'Airbus A320neo',
    latitude: 28.7041,
    longitude: 77.1025,
    altitudeFt: 18350,
    heading: 128,
    speedKts: 362,
    distanceKm: 18.2,
    lastSeen: minutesAgo(1),
    status: 'airborne',
    source: 'opensky',
    isMilitary: false,
    isFavorite: false,
  },
  {
    id: 'os-2',
    icao24: 'AE1234',
    callsign: 'VPR502',
    name: 'P-8I Neptune',
    model: 'Boeing P-8I',
    latitude: 28.585,
    longitude: 77.285,
    altitudeFt: 22400,
    heading: 284,
    speedKts: 410,
    distanceKm: 31.7,
    lastSeen: minutesAgo(2),
    status: 'airborne',
    source: 'opensky',
    isMilitary: true,
    isFavorite: true,
  },
  {
    id: 'os-3',
    icao24: '801C91',
    callsign: 'AIC814',
    name: 'Air India 814',
    model: 'Boeing 787-8',
    latitude: 28.81,
    longitude: 76.96,
    altitudeFt: 30500,
    heading: 74,
    speedKts: 451,
    distanceKm: 43.1,
    lastSeen: minutesAgo(1),
    status: 'airborne',
    source: 'opensky',
    isMilitary: false,
    isFavorite: false,
  },
  {
    id: 'os-4',
    icao24: '800E11',
    callsign: 'VTI321',
    name: 'Vistara 321',
    model: 'Airbus A321',
    latitude: 28.49,
    longitude: 77.02,
    altitudeFt: 9100,
    heading: 16,
    speedKts: 246,
    distanceKm: 25.8,
    lastSeen: minutesAgo(1),
    status: 'airborne',
    source: 'opensky',
    isMilitary: false,
    isFavorite: false,
  },
];

export const mockSdrAircraft: Aircraft[] = [
  {
    id: 'sdr-1',
    icao24: 'AE1234',
    callsign: 'VPR502',
    name: 'P-8I Neptune',
    model: 'Boeing P-8I',
    latitude: 28.589,
    longitude: 77.279,
    altitudeFt: 22375,
    heading: 281,
    speedKts: 408,
    distanceKm: 31.2,
    lastSeen: minutesAgo(0),
    status: 'airborne',
    source: 'sdr',
    isMilitary: true,
    isFavorite: true,
  },
  {
    id: 'sdr-2',
    icao24: '800C17',
    callsign: 'IND201',
    name: 'C-17 Globemaster',
    model: 'Boeing C-17A',
    latitude: 28.74,
    longitude: 77.22,
    altitudeFt: 12600,
    heading: 212,
    speedKts: 306,
    distanceKm: 16.4,
    lastSeen: minutesAgo(0),
    status: 'airborne',
    source: 'sdr',
    isMilitary: true,
    isFavorite: true,
  },
];

const favoriteBase: Array<Pick<Aircraft, 'name' | 'model' | 'callsign' | 'icao24' | 'status' | 'distanceKm' | 'isMilitary'>> = [
  { name: 'C-17', model: 'Boeing C-17A', callsign: 'IND201', icao24: '800C17', status: 'airborne', distanceKm: 16.4, isMilitary: true },
  { name: 'P-8I', model: 'Boeing P-8I', callsign: 'VPR502', icao24: 'AE1234', status: 'airborne', distanceKm: 31.2, isMilitary: true },
  { name: 'E-3 AWACS', model: 'Boeing E-3', callsign: 'SENTRY7', icao24: '800E03', status: 'grounded', distanceKm: 0, isMilitary: true },
  { name: 'LCA Tejas', model: 'HAL Tejas Mk1', callsign: 'TEJAS4', icao24: '8001CA', status: 'unknown', distanceKm: 0, isMilitary: true },
  { name: 'Jaguar', model: 'SEPECAT Jaguar', callsign: 'SHAM27', icao24: '8000A7', status: 'grounded', distanceKm: 0, isMilitary: true },
  { name: 'C-130J', model: 'Lockheed C-130J', callsign: 'HERC09', icao24: '800130', status: 'airborne', distanceKm: 84.6, isMilitary: true },
];

export const mockPinnedAircraft: Aircraft[] = favoriteBase.map((item, index) => ({
  id: `fav-${index + 1}`,
  ...item,
  latitude: 28.61 + index * 0.02,
  longitude: 77.15 + index * 0.015,
  altitudeFt: item.status === 'airborne' ? 12000 + index * 2400 : 0,
  heading: 35 + index * 42,
  speedKts: item.status === 'airborne' ? 300 + index * 8 : 0,
  lastSeen: minutesAgo(index * 7 + 2),
  source: index < 2 ? 'sdr' : 'opensky',
  isFavorite: true,
}));

export const delay = (ms = 650): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));
