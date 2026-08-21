export interface TrackedAircraft {
  id: string;
  hex: string;
  registration: string;
  callsign: string;
  aircraftType: string;
  description: string;
  altitudeFt: number | null;
  groundSpeedKts: number | null;
  heading: number | null;
  latitude: number | null;
  longitude: number | null;
  verticalRateFpm: number | null;
  signalDb: number | null;
  messages: number | null;
  trackedAt: string;
  source: string;
}

export interface TrackedAircraftArchive {
  aircraft: TrackedAircraft[];
  aircraftTypeCounts: Record<string, number>;
  totalCount: number;
  receivedAt: string;
}
