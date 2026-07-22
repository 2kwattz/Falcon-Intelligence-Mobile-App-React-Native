import { useEffect, useState } from 'react';
import { Switch } from 'react-native';
import { DetailScaffold } from '@/components/DetailScaffold';
import { SectionCard } from '@/components/SectionCard';
import { SettingsRow } from '@/components/SettingsRow';
import { colors } from '@/constants/colors';
import {
  defaultFlightAlertPreferences,
  FlightAlertPreferences,
  notificationPreferencesService,
} from '@/services/notificationPreferencesService';

export const NotificationSettingsScreen = () => {
  const [critical, setCritical] = useState(true);
  const [military, setMilitary] = useState(true);
  const [sound, setSound] = useState(true);
  const [server, setServer] = useState(false);
  const [flightAlertPreferences, setFlightAlertPreferences] = useState(defaultFlightAlertPreferences);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    notificationPreferencesService
      .getFlightAlertPreferences()
      .then(preferences => {
        if (isMounted) setFlightAlertPreferences(preferences);
      })
      .finally(() => {
        if (isMounted) setPreferencesLoaded(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!preferencesLoaded) return;
    notificationPreferencesService.saveFlightAlertPreferences(flightAlertPreferences).catch(() => undefined);
  }, [flightAlertPreferences, preferencesLoaded]);

  const setFlightAlertPreference = (preference: keyof FlightAlertPreferences, value: boolean) => {
    setFlightAlertPreferences(current => ({ ...current, [preference]: value }));
  };

  const toggle = (label: string, value: boolean, setter: (value: boolean) => void, disabled = false) => (
    <Switch
      accessibilityLabel={label}
      disabled={disabled}
      value={value}
      onValueChange={setter}
      trackColor={{ false: colors.primary, true: colors.radarDim }}
      thumbColor={colors.text}
    />
  );
  return (
    <DetailScaffold eyebrow="Alert delivery" title="Notification Settings" description="Choose which operational events can interrupt you.">
      <SectionCard title="Flight Alert Section">
        <SettingsRow
          icon="message-alert-outline"
          title="Phone Number"
          subtitle="Get flight alerts by SMS on your registered phone number"
          trailing={toggle(
            'Get flight alerts on phone number',
            flightAlertPreferences.phoneNumber,
            value => setFlightAlertPreference('phoneNumber', value),
            !preferencesLoaded,
          )}
        />
        <SettingsRow
          icon="email-alert-outline"
          title="Email"
          subtitle="Get flight alerts at your registered email address"
          trailing={toggle(
            'Get flight alerts by email',
            flightAlertPreferences.email,
            value => setFlightAlertPreference('email', value),
            !preferencesLoaded,
          )}
          isLast
        />
      </SectionCard>
      <SectionCard title="Airspace alerts">
        <SettingsRow icon="alert-decagram-outline" title="Critical Alerts" subtitle="Radius breaches and emergency squawks" trailing={toggle('Critical alerts', critical, setCritical)} />
        <SettingsRow icon="shield-airplane-outline" title="Military Aircraft" subtitle="Notify when a military track appears" trailing={toggle('Military aircraft alerts', military, setMilitary)} />
        <SettingsRow icon="volume-high" title="Alert Sounds" subtitle="Play audio with high-priority alerts" trailing={toggle('Alert sounds', sound, setSound)} isLast />
      </SectionCard>
      <SectionCard title="System alerts">
        <SettingsRow icon="server-network-off" title="Server Health" subtitle="Connectivity and service incidents" trailing={toggle('Server health alerts', server, setServer)} isLast />
      </SectionCard>
    </DetailScaffold>
  );
};
