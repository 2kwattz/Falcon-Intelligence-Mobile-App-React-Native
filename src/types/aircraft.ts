export type AircraftSource = 'opensky' | 'sdr' | 'adsb';
export type AircraftStatus = 'airborne' | 'grounded' | 'unknown';

export interface Aircraft {
  id: string;
  icao24: string;
  callsign: string;
  name: string;
  model: string;
  latitude: number;
  longitude: number;
  /** False when the feed has identification data but no usable coordinates. */
  hasPosition?: boolean;
  altitudeFt: number;
  heading: number;
  speedKts: number;
  distanceKm: number;
  lastSeen: string;
  status: AircraftStatus;
  source: AircraftSource;
  isMilitary: boolean;
  isFavorite: boolean;
}

export type MapFilter = 'adsb';
