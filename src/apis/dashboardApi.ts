import { getAircraftPositions, getPinnedAircraft } from './aircraftApi';
import { apiClient } from './apiClient';
import { delay, mockAlerts, mockSummary } from './mockData';
import { getSdrStatus, getServerStatus } from './serverApi';
import { USE_MOCK_API } from '@/constants/config';
import { DashboardData, DashboardSummary, FlightAlert } from '@/types/dashboard';

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  if (USE_MOCK_API) {
    await delay(260);
    return mockSummary;
  }
  const response = await apiClient.get<DashboardSummary>('/api/dashboard/summary');
  return response.data;
};

export const getRecentAlerts = async (): Promise<FlightAlert[]> => {
  if (USE_MOCK_API) {
    await delay(280);
    return mockAlerts;
  }
  const response = await apiClient.get<FlightAlert[]>('/api/alerts/recent');
  return response.data;
};

export const getDashboardData = async (): Promise<DashboardData> => {
  const [summary, alerts, sdr, server, pinnedAircraft, mapAircraft] = await Promise.all([
    getDashboardSummary(),
    getRecentAlerts(),
    getSdrStatus(),
    getServerStatus(),
    getPinnedAircraft(),
    getAircraftPositions(),
  ]);
  return { summary, alerts, sdr, server, pinnedAircraft, mapAircraft, updatedAt: new Date().toISOString() };
};
