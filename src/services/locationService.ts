import { PermissionsAndroid, Platform } from 'react-native';
import { LocationManager, type GeolocationPosition } from '@maplibre/maplibre-react-native';

export interface DeviceCoordinates {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
}

const LOCATION_TIMEOUT_MS = 12_000;

const toCoordinates = (position: GeolocationPosition): DeviceCoordinates => ({
  latitude: position.coords.latitude,
  longitude: position.coords.longitude,
  accuracyMeters: position.coords.accuracy,
});

const requestLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return LocationManager.requestPermissions();

  const result = await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  ]);
  return [
    result[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION],
    result[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION],
  ].some((permission) => permission === PermissionsAndroid.RESULTS.GRANTED);
};

export const getCurrentDeviceCoordinates = async (): Promise<DeviceCoordinates> => {
  const granted = await requestLocationPermission();
  if (!granted) {
    throw new Error('Location access is required to show weather for your current area.');
  }

  return new Promise<DeviceCoordinates>((resolve, reject) => {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let settled = false;

    const cleanup = () => {
      if (timeout) clearTimeout(timeout);
      LocationManager.removeListener(handleLocation);
    };

    const finish = (position: GeolocationPosition) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(toCoordinates(position));
    };

    function handleLocation(position: GeolocationPosition) {
      finish(position);
    }

    try {
      LocationManager.setMinDisplacement(0);
      LocationManager.addListener(handleLocation);
    } catch {
      settled = true;
      cleanup();
      reject(new Error('Unable to start the device location service.'));
      return;
    }

    if (settled) return;

    timeout = setTimeout(() => {
      LocationManager.removeListener(handleLocation);
      LocationManager.getCurrentPosition()
        .then((position) => {
          if (position) {
            finish(position);
            return;
          }
          settled = true;
          reject(new Error('Your location could not be determined. Check that location services are enabled.'));
        })
        .catch(() => {
          settled = true;
          reject(new Error('Your location could not be determined. Check that location services are enabled.'));
        });
    }, LOCATION_TIMEOUT_MS);
  });
};
