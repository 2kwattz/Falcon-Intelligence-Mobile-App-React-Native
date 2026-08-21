import { apiClient } from './apiClient';
import { iafData } from './indianAirForceData';
import { delay } from './mockData';
import { INDIAN_AIR_FORCE_DATABASE_PATH, USE_MOCK_API } from '@/constants/config';
import { IndianAirForceAircraft } from '@/types/airForce';

const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();

const mockIndianAirForceAircraft: IndianAirForceAircraft[] = Object.values(iafData.allAircraft)
  .flat()
  .map((aircraft, index) => ({
    id: `iaf-${index + 1}`,
    aircraftName: aircraft.AircraftType,
    modeSHex: aircraft.HexCode ?? '',
    operator: aircraft.AircraftOperator,
    registration: aircraft.Registration,
    // The source dataset does not include tracking timestamps, so provide a
    // stable-looking mock value for the database screen.
    lastTracked: minutesAgo(index * 5 + 1),
  }));

export const getIndianAirForceAircraft = async (): Promise<IndianAirForceAircraft[]> => {
  if (USE_MOCK_API) {
    await delay(520);
    return mockIndianAirForceAircraft;
  }

  const response = await apiClient.get<IndianAirForceAircraft[]>(INDIAN_AIR_FORCE_DATABASE_PATH);
  return response.data;
};
