import AsyncStorage from '@react-native-async-storage/async-storage';

const FLIGHT_ALERT_PREFERENCES_KEY = '@falcon_intelligence/flight_alert_preferences';

export interface FlightAlertPreferences {
  phoneNumber: boolean;
  email: boolean;
}

export const defaultFlightAlertPreferences: FlightAlertPreferences = {
  phoneNumber: false,
  email: true,
};

export const notificationPreferencesService = {
  async getFlightAlertPreferences(): Promise<FlightAlertPreferences> {
    const storedPreferences = await AsyncStorage.getItem(FLIGHT_ALERT_PREFERENCES_KEY);

    if (!storedPreferences) return defaultFlightAlertPreferences;

    try {
      const preferences = JSON.parse(storedPreferences) as Partial<FlightAlertPreferences>;

      return {
        phoneNumber:
          typeof preferences.phoneNumber === 'boolean'
            ? preferences.phoneNumber
            : defaultFlightAlertPreferences.phoneNumber,
        email: typeof preferences.email === 'boolean' ? preferences.email : defaultFlightAlertPreferences.email,
      };
    } catch {
      return defaultFlightAlertPreferences;
    }
  },

  async saveFlightAlertPreferences(preferences: FlightAlertPreferences) {
    await AsyncStorage.setItem(FLIGHT_ALERT_PREFERENCES_KEY, JSON.stringify(preferences));
  },
};
