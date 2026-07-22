import { apiClient } from './apiClient';
import { delay } from './mockData';
import { INDIAN_AIR_FORCE_DATABASE_PATH, USE_MOCK_API } from '@/constants/config';
import { IndianAirForceAircraft } from '@/types/airForce';

const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();

const mockIndianAirForceAircraft: IndianAirForceAircraft[] = [
  {
    id: 'iaf-1',
    aircraftName: 'HAL Tejas Mk1',
    modeSHex: '8001CA',
    operator: 'Indian Air Force',
    lastTracked: minutesAgo(4),
    registration: 'LA-5031',
  },
  {
    id: 'iaf-2',
    aircraftName: 'Dassault Rafale EH',
    modeSHex: '80029A',
    operator: 'Indian Air Force',
    lastTracked: minutesAgo(12),
    registration: 'BS001',
  },
  {
    id: 'iaf-3',
    aircraftName: 'Boeing C-17 Globemaster III',
    modeSHex: '800C17',
    operator: 'Indian Air Force',
    lastTracked: minutesAgo(18),
    registration: 'CB-8001',
  },
  {
    id: 'iaf-4',
    aircraftName: 'Lockheed Martin C-130J-30',
    modeSHex: '800130',
    operator: 'Indian Air Force',
    lastTracked: minutesAgo(31),
    registration: 'KC-3801',
  },
  {
    id: 'iaf-5',
    aircraftName: 'Embraer Netra AEW&C',
    modeSHex: '800AE1',
    operator: 'Indian Air Force',
    lastTracked: minutesAgo(47),
    registration: 'KW-3553',
  },
  {
    id: 'iaf-6',
    aircraftName: 'Boeing 737-700 BBJ',
    modeSHex: '800737',
    operator: 'Indian Air Force Communication Squadron',
    lastTracked: minutesAgo(96),
    registration: 'K-5014',
  },
];

export const getIndianAirForceAircraft = async (): Promise<IndianAirForceAircraft[]> => {
  if (USE_MOCK_API) {
    await delay(520);
    return mockIndianAirForceAircraft;
  }

  const response = await apiClient.get<IndianAirForceAircraft[]>(INDIAN_AIR_FORCE_DATABASE_PATH);
  return response.data;
};
