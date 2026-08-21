import { getLiveAircraftFeed, LiveAircraftFeed } from './aircraftApi';
import { getServerStatus } from './serverApi';
import { DashboardData, DashboardSummary, FlightAlert } from '@/types/dashboard';
import { Aircraft } from '@/types/aircraft';

const getDashboardSummary = (aircraft: Aircraft[]): DashboardSummary => ({
  aircraftInRange: aircraft.length,
  airborne: aircraft.filter((item) => item.status === 'airborne').length,
  recentReports: Math.min(aircraft.length, 5),
});

const getRecentTracks = (aircraft: Aircraft[]): FlightAlert[] => aircraft.slice(0, 5).map((item) => ({
  id: `track-${item.icao24}`,
  aircraft: item.callsign,
  message: `${item.model} • ${item.altitudeFt > 0 ? `${Math.round(item.altitudeFt).toLocaleString()} ft` : 'ground'}`,
  severity: 'info',
  timestamp: item.lastSeen,
  isRead: true,
}));

export const getRecentAlerts = async (): Promise<FlightAlert[]> => {
  const feed = await getLiveAircraftFeed();
  return getRecentTracks(feed.aircraft);
};

export const getDashboardData = async (): Promise<DashboardData> => {
  let feed: LiveAircraftFeed = { aircraft: [], messages: 0, receivedAt: new Date().toISOString() };
  let aircraftFeedError: string | undefined;

  try {
    feed = await getLiveAircraftFeed();
  } catch (requestError) {
    aircraftFeedError = requestError instanceof Error ? requestError.message : 'Aircraft feed is unavailable.';
  }

  const server = await getServerStatus();
  const mapAircraft = feed.aircraft;
  const sdr = {
    connected: !aircraftFeedError,
    device: aircraftFeedError ? 'ADS-B feed unavailable' : 'Live ADS-B feed',
    frequencyMhz: 1090,
    trackCount: mapAircraft.length,
    messageCount: feed.messages,
  };
  return {
    summary: getDashboardSummary(mapAircraft),
    alerts: getRecentTracks(mapAircraft),
    sdr,
    server,
    pinnedAircraft: mapAircraft.slice(0, 8),
    mapAircraft,
    updatedAt: feed.receivedAt,
    aircraftFeedError,
  };
};
