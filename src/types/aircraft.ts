export type AircraftSource = 'opensky' | 'sdr';
export type AircraftStatus = 'airborne' | 'grounded' | 'unknown';

export interface Aircraft {
  id: string;
  icao24: string;
  callsign: string;
  name: string;
  model: string;
  latitude: number;
  longitude: number;
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

export type MapFilter = 'combined' | 'opensky' | 'sdr' | 'military' | 'favorites';
