import type { StyleSpecification } from '@maplibre/maplibre-react-native';

export const SATELLITE_CENTER: [number, number] = [77.16, 28.65];
export const SATELLITE_INITIAL_ZOOM = 8.6;
export const SATELLITE_PROVIDER_URL = 'https://cloudless.eox.at';
export const SATELLITE_ATTRIBUTION =
  'EOxCloudless by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2025)';

const satelliteTiles =
  'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2025_3857/default/g/{z}/{y}/{x}.jpg';

export const satelliteMapStyle: StyleSpecification = {
  version: 8,
  sources: {
    satellite: {
      type: 'raster',
      tiles: [satelliteTiles],
      tileSize: 256,
      minzoom: 0,
      maxzoom: 14,
      attribution: SATELLITE_ATTRIBUTION,
    },
  },
  layers: [
    {
      id: 'satellite',
      type: 'raster',
      source: 'satellite',
      paint: {
        'raster-fade-duration': 180,
      },
    },
  ],
};
