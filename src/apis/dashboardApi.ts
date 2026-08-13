import { getLiveAircraftFeed } from './aircraftApi';
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
  const [feed, server] = await Promise.all([
    getLiveAircraftFeed(),
    getServerStatus(),
  ]);
  const mapAircraft = feed.aircraft;
  const sdr = {
    connected: true,
    device: 'Live ADS-B feed',
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
  };
};
