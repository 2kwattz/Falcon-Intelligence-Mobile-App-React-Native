import axios from 'axios';
import { TRACKED_AIRCRAFT_ARCHIVE_URL } from '@/constants/config';
import { TrackedAircraft, TrackedAircraftArchive } from '@/types/trackedAircraft';

interface ArchiveRecord {
  hex?: string;
  type?: string;
  r?: string;
  t?: string;
  desc?: string;
  registration?: string;
  aircraftType?: string;
  typeCode?: string;
  description?: string;
  alt_baro?: number | 'ground';
  alt_geom?: number;
  gs?: number;
  track?: number;
  true_heading?: number;
  calc_track?: number;
  lat?: number;
  lon?: number;
  baro_rate?: number;
  rssi?: number;
  messages?: number;
  flight?: string;
  callsign?: string;
  trackedAt?: string;
  lastUpdatedAt?: string;
}

interface ArchiveResponse {
  status?: boolean;
  count?: number;
  aircraftTypeCounts?: Record<string, number>;
  aircraftData?: ArchiveRecord[];
}

const finiteNumber = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

const nonEmpty = (...values: Array<string | undefined>): string =>
  values.find((value) => value?.trim())?.trim() ?? '';

const normalizeRecord = (record: ArchiveRecord, index: number): TrackedAircraft => {
  const hex = record.hex?.toUpperCase() ?? `UNIDENTIFIED-${index + 1}`;
  const altitude = record.alt_baro === 'ground'
    ? 0
    : finiteNumber(record.alt_baro) ?? finiteNumber(record.alt_geom);

  return {
    id: `${hex}-${record.trackedAt ?? record.lastUpdatedAt ?? index}`,
    hex,
    registration: nonEmpty(record.registration, record.r),
    callsign: nonEmpty(record.callsign, record.flight),
    aircraftType: nonEmpty(record.aircraftType, record.typeCode, record.t) || 'UNKNOWN',
    description: nonEmpty(record.description, record.desc) || 'Unknown aircraft',
    altitudeFt: altitude,
    groundSpeedKts: finiteNumber(record.gs),
    heading: finiteNumber(record.track) ?? finiteNumber(record.true_heading) ?? finiteNumber(record.calc_track),
    latitude: finiteNumber(record.lat),
    longitude: finiteNumber(record.lon),
    verticalRateFpm: finiteNumber(record.baro_rate),
    signalDb: finiteNumber(record.rssi),
    messages: finiteNumber(record.messages),
    trackedAt: record.trackedAt ?? record.lastUpdatedAt ?? '',
    source: record.type ?? 'unknown',
  };
};

const deriveTypeCounts = (aircraft: TrackedAircraft[]): Record<string, number> => aircraft.reduce<Record<string, number>>((counts, item) => {
  counts[item.aircraftType] = (counts[item.aircraftType] ?? 0) + 1;
  return counts;
}, {});

export const getTrackedAircraftArchive = async (): Promise<TrackedAircraftArchive> => {
  let response;

  try {
    response = await axios.get<ArchiveResponse>(TRACKED_AIRCRAFT_ARCHIVE_URL, { timeout: 15_000 });
  } catch (requestError) {
    const status = axios.isAxiosError(requestError) ? requestError.response?.status : undefined;
    throw new Error(status
      ? `Archive request reached the server, but it returned HTTP ${status}.`
      : 'The tracked-aircraft archive is unavailable. Check the Falcon archive connection and try again.');
  }

  if (response.data.status === false) throw new Error('The Falcon archive returned an unsuccessful response.');

  const aircraft = (response.data.aircraftData ?? [])
    .map(normalizeRecord)
    .sort((first, second) => second.trackedAt.localeCompare(first.trackedAt));

  return {
    aircraft,
    aircraftTypeCounts: response.data.aircraftTypeCounts ?? deriveTypeCounts(aircraft),
    totalCount: response.data.count ?? aircraft.length,
    receivedAt: new Date().toISOString(),
  };
};
