import { Aircraft } from './aircraft';

export interface DashboardSummary {
  aircraftInRange: number;
  airborne: number;
  recentReports: number;
}

export interface FlightAlert {
  id: string;
  aircraft: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
  isRead: boolean;
}

export interface SdrStatus {
  connected: boolean;
  device: string;
  frequencyMhz: number;
  trackCount?: number;
  messageCount?: number;
}

export interface WeatherData {
  city: string;
  condition: string;
  temperatureC: number;
  visibilityKm: number;
  windKph: number;
  windDirection: string;
  pressureHpa: number;
  sunrise: string;
  sunset: string;
  latitude: number;
  longitude: number;
  observedAt: string;
  weatherCode: number;
  isDay: boolean;
}

export interface ServerStatus {
  online: boolean;
  latencyMs: number;
  checkedAt: string;
  statusCode?: number;
  requestUrl?: string;
  routeAvailable?: boolean;
  error?: string;
}

export interface DashboardData {
  summary: DashboardSummary;
  alerts: FlightAlert[];
  sdr: SdrStatus;
  server: ServerStatus;
  pinnedAircraft: Aircraft[];
  mapAircraft: Aircraft[];
  updatedAt: string;
  aircraftFeedError?: string;
}
