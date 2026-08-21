import axios from 'axios';
import {
  LIVE_AIRCRAFT_FEED_URL,
  LIVE_AIRCRAFT_MAX_AGE_SECONDS,
  OPEN_SKY_MAP_BOUNDS,
  OPEN_SKY_STATES_URL,
} from '@/constants/config';
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
  seen_pos?: number;
}

interface LiveAircraftResponse {
  now?: number;
  messages?: number;
  aircraft?: LiveAircraftRecord[];
}

type OpenSkyStateVector = [
  icao24: string,
  callsign: string | null,
  originCountry: string,
  timePosition: number | null,
  lastContact: number,
  longitude: number | null,
  latitude: number | null,
  baroAltitude: number | null,
  onGround: boolean,
  velocity: number | null,
  trueTrack: number | null,
  verticalRate: number | null,
  sensors: number[] | null,
  geoAltitude: number | null,
  squawk: string | null,
  spi: boolean,
  positionSource: number,
  category?: number,
];

interface OpenSkyStatesResponse {
  time?: number;
  states?: OpenSkyStateVector[] | null;
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

const metersToFeet = (meters: number | null): number => (meters === null ? 0 : Math.round(meters * 3.28084));

const toAircraft = (record: LiveAircraftRecord, receivedAt: number): Aircraft | null => {
  if (!record.hex) return null;

  const seenSeconds = typeof record.seen === 'number' && record.seen >= 0 ? record.seen : Number.POSITIVE_INFINITY;
  const positionSeenSeconds = typeof record.seen_pos === 'number' && record.seen_pos >= 0
    ? record.seen_pos
    : seenSeconds;
  if (seenSeconds > LIVE_AIRCRAFT_MAX_AGE_SECONDS || positionSeenSeconds > LIVE_AIRCRAFT_MAX_AGE_SECONDS) return null;

  const hasPosition = isCoordinate(record.lat) && isCoordinate(record.lon);

  const callsign = record.flight?.trim() || record.r?.trim() || record.hex.toUpperCase();
  const altitudeFt = typeof record.alt_baro === 'number'
    ? record.alt_baro
    : typeof record.alt_geom === 'number'
      ? record.alt_geom
      : 0;
  return {
    id: `sdr-${record.hex.toLowerCase()}`,
    icao24: record.hex.toUpperCase(),
    callsign,
    name: callsign,
    model: record.desc ?? record.t ?? 'Unknown aircraft',
    latitude: hasPosition ? record.lat ?? 0 : 0,
    longitude: hasPosition ? record.lon ?? 0 : 0,
    hasPosition,
    altitudeFt,
    heading: normalizeHeading(record.track, record.true_heading, record.calc_track),
    speedKts: typeof record.gs === 'number' && Number.isFinite(record.gs) ? record.gs : 0,
    // The feed does not publish the receiver position, so a physical distance cannot be calculated reliably.
    distanceKm: 0,
    lastSeen: new Date(receivedAt - positionSeenSeconds * 1_000).toISOString(),
    status: altitudeFt > 0 || (typeof record.gs === 'number' && record.gs > 0) ? 'airborne' : 'grounded',
    source: 'sdr',
    // ADS-B category values describe aircraft size/type, not military status.
    isMilitary: false,
    isFavorite: false,
  };
};

const toOpenSkyAircraft = (state: OpenSkyStateVector, receivedAt: number): Aircraft | null => {
  const [icao24, rawCallsign, originCountry, timePosition, lastContact, longitude, latitude, baroAltitude, onGround, velocity, trueTrack, , , geoAltitude] = state;
  if (!icao24) return null;

  const hasPosition = isCoordinate(latitude) && isCoordinate(longitude);
  const callsign = rawCallsign?.trim() || icao24.toUpperCase();
  const positionTimestamp = timePosition ?? lastContact;

  return {
    id: `opensky-${icao24.toLowerCase()}`,
    icao24: icao24.toUpperCase(),
    callsign,
    name: callsign,
    model: originCountry ? `OpenSky aircraft • ${originCountry}` : 'OpenSky aircraft',
    latitude: hasPosition ? latitude : 0,
    longitude: hasPosition ? longitude : 0,
    hasPosition,
    altitudeFt: metersToFeet(baroAltitude ?? geoAltitude),
    heading: normalizeHeading(trueTrack ?? undefined),
    speedKts: velocity === null ? 0 : Math.round(velocity * 1.94384),
    distanceKm: 0,
    lastSeen: new Date((positionTimestamp || Math.floor(receivedAt / 1_000)) * 1_000).toISOString(),
    status: onGround ? 'grounded' : 'airborne',
    source: 'opensky',
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

export const getOpenSkyAircraftFeed = async (): Promise<LiveAircraftFeed> => {
  let response;

  try {
    response = await axios.get<OpenSkyStatesResponse>(OPEN_SKY_STATES_URL, {
      params: OPEN_SKY_MAP_BOUNDS,
      timeout: 12_000,
    });
  } catch (requestError) {
    const status = axios.isAxiosError(requestError) ? requestError.response?.status : undefined;
    const message = status ? `OpenSky returned HTTP ${status}.` : 'No HTTP response from OpenSky.';
    console.warn(`[OpenSky feed] ${message}`, requestError);
    throw new Error(message);
  }

  const receivedAt = typeof response.data.time === 'number' ? response.data.time * 1_000 : Date.now();
  const states = response.data.states ?? [];
  const aircraft = states
    .map((state) => toOpenSkyAircraft(state, receivedAt))
    .filter((record): record is Aircraft => record !== null)
    .sort((first, second) => second.lastSeen.localeCompare(first.lastSeen));

  return {
    aircraft,
    messages: states.length,
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
