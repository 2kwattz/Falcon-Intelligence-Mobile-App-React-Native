export const formatDistance = (distanceKm: number): string => `${distanceKm.toFixed(1)} km`;
export const formatAltitude = (altitudeFt: number): string =>
  altitudeFt > 0 ? `${Math.round(altitudeFt).toLocaleString()} ft` : 'Ground';
