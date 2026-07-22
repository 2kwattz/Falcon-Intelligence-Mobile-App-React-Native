import { apiClient } from './apiClient';
import { delay, mockOpenSkyAircraft, mockPinnedAircraft, mockSdrAircraft } from './mockData';
import { USE_MOCK_API } from '@/constants/config';
import { Aircraft } from '@/types/aircraft';

export const getOpenSkyAircraft = async (): Promise<Aircraft[]> => {
  if (USE_MOCK_API) {
    await delay(420);
    return mockOpenSkyAircraft;
  }
  // Route the OpenSky integration through the Falcon backend to keep credentials off-device.
  const response = await apiClient.get<Aircraft[]>('/api/aircraft/opensky');
  return response.data;
};

export const getLocalSdrAircraft = async (): Promise<Aircraft[]> => {
  if (USE_MOCK_API) {
    await delay(520);
    return mockSdrAircraft;
  }
  const response = await apiClient.get<Aircraft[]>('/api/aircraft/sdr');
  return response.data;
};

export const getPinnedAircraft = async (): Promise<Aircraft[]> => {
  if (USE_MOCK_API) {
    await delay(300);
    return mockPinnedAircraft;
  }
  const response = await apiClient.get<Aircraft[]>('/api/aircraft/pinned');
  return response.data;
};

export const mergeAircraftSources = (openSky: Aircraft[], sdr: Aircraft[]): Aircraft[] => {
  const merged = new Map<string, Aircraft>();
  openSky.forEach((aircraft) => merged.set(aircraft.icao24.toUpperCase(), aircraft));
  sdr.forEach((aircraft) => merged.set(aircraft.icao24.toUpperCase(), aircraft));
  return Array.from(merged.values());
};

export const getAircraftPositions = async (): Promise<Aircraft[]> => {
  const [openSky, sdr] = await Promise.all([getOpenSkyAircraft(), getLocalSdrAircraft()]);
  return mergeAircraftSources(openSky, sdr);
};
