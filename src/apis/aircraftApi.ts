import axios from 'axios';
import { LIVE_AIRCRAFT_FEED_URL } from '@/constants/config';
import { Aircraft } from '@/types/aircraft';

interface LiveAircraftRecord {
  hex?: string;
  flight?: string;
  r?: string;
  t?: string;
  desc?: string;
  lat?: number;
  lon?: number;
  alt_baro?: number | 'ground';
  alt_geom?: number;
  gs?: number;
  track?: number;
  calc_track?: number;
  true_heading?: number;
  seen?: number;
}

interface LiveAircraftResponse {
  now?: number;
  messages?: number;
  aircraft?: LiveAircraftRecord[];
}

export interface LiveAircraftFeed {
  aircraft: Aircraft[];
  messages: number;
  receivedAt: string;
}

const isCoordinate = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

const normalizeHeading = (...values: Array<number | undefined>): number => {
  const heading = values.find((value): value is number => typeof value === 'number' && Number.isFinite(value));
  if (heading === undefined) return 0;
  return ((heading % 360) + 360) % 360;
};

const toAircraft = (record: LiveAircraftRecord, receivedAt: number): Aircraft | null => {
  if (!record.hex || !isCoordinate(record.lat) || !isCoordinate(record.lon)) return null;

  const callsign = record.flight?.trim() || record.r?.trim() || record.hex.toUpperCase();
  const altitudeFt = typeof record.alt_baro === 'number'
    ? record.alt_baro
    : typeof record.alt_geom === 'number'
      ? record.alt_geom
      : 0;
  const seenSeconds = typeof record.seen === 'number' && record.seen >= 0 ? record.seen : 0;

  return {
    id: `adsb-${record.hex.toLowerCase()}`,
    icao24: record.hex.toUpperCase(),
    callsign,
    name: callsign,
    model: record.desc ?? record.t ?? 'Unknown aircraft',
    latitude: record.lat,
    longitude: record.lon,
    altitudeFt,
    heading: normalizeHeading(record.track, record.true_heading, record.calc_track),
    speedKts: typeof record.gs === 'number' && Number.isFinite(record.gs) ? record.gs : 0,
    // The feed does not publish the receiver position, so a physical distance cannot be calculated reliably.
    distanceKm: 0,
    lastSeen: new Date(receivedAt - seenSeconds * 1_000).toISOString(),
    status: altitudeFt > 0 || (typeof record.gs === 'number' && record.gs > 0) ? 'airborne' : 'grounded',
    source: 'adsb',
    // ADS-B category values describe aircraft size/type, not military status.
    isMilitary: false,
    isFavorite: false,
  };
};

export const getLiveAircraftFeed = async (): Promise<LiveAircraftFeed> => {
  let response;

  try {
    console.info(`[Aircraft feed] Sending GET ${LIVE_AIRCRAFT_FEED_URL}`);
    response = await axios.get<LiveAircraftResponse>(LIVE_AIRCRAFT_FEED_URL, { timeout: 12_000 });
    console.info(`[Aircraft feed] Received HTTP ${response.status} from ${LIVE_AIRCRAFT_FEED_URL}`);
  } catch (requestError) {
    const status = axios.isAxiosError(requestError) ? requestError.response?.status : undefined;
    const message = status
      ? `Aircraft feed request reached ${LIVE_AIRCRAFT_FEED_URL}, but the server returned HTTP ${status}.`
      : `No HTTP response for aircraft feed request to ${LIVE_AIRCRAFT_FEED_URL}.`;
    console.warn(`[Aircraft feed] ${message}`, requestError);
    throw new Error(message);
  }

  const feedTimestamp = typeof response.data.now === 'number' ? response.data.now * 1_000 : NaN;
  const receivedAt = Number.isFinite(feedTimestamp) ? feedTimestamp : Date.now();
  const aircraft = (response.data.aircraft ?? [])
    .map((record) => toAircraft(record, receivedAt))
    .filter((record): record is Aircraft => record !== null)
    .sort((first, second) => second.lastSeen.localeCompare(first.lastSeen));

  return {
    aircraft,
    messages: typeof response.data.messages === 'number' ? response.data.messages : 0,
    receivedAt: new Date(receivedAt).toISOString(),
  };
};

export const getAircraftPositions = async (): Promise<Aircraft[]> => (await getLiveAircraftFeed()).aircraft;

export const getPinnedAircraft = async (): Promise<Aircraft[]> => (await getLiveAircraftFeed()).aircraft.slice(0, 8);

export const mergeAircraftSources = (firstSource: Aircraft[], secondSource: Aircraft[]): Aircraft[] => {
  const merged = new Map<string, Aircraft>();
  firstSource.forEach((aircraft) => merged.set(aircraft.icao24.toUpperCase(), aircraft));
  secondSource.forEach((aircraft) => merged.set(aircraft.icao24.toUpperCase(), aircraft));
  return Array.from(merged.values());
};
