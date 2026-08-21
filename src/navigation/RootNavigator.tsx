import { useCallback, useState } from 'react';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import { AtcTranscriptScreen } from '@/screens/AtcTranscriptScreen';
import { FlightAlertsScreen } from '@/screens/FlightAlertsScreen';
import { IndianAirForceDatabaseScreen } from '@/screens/IndianAirForceDatabaseScreen';
import { NotificationSettingsScreen } from '@/screens/NotificationSettingsScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { SatelliteViewScreen } from '@/screens/SatelliteViewScreen';
import { SecuritySettingsScreen } from '@/screens/SecuritySettingsScreen';
import { SplashScreen } from '@/screens/SplashScreen';
import { TrackedAircraftArchiveScreen } from '@/screens/TrackedAircraftArchiveScreen';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { RootStackParamList } from './navigationTypes';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.radar,
    background: colors.background,
    card: colors.elevated,
    text: colors.text,
    border: colors.border,
    notification: colors.danger,
  },
};

const AppNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.background },
      headerTintColor: colors.text,
      headerShadowVisible: false,
      headerTitleStyle: { fontSize: 15, fontWeight: '700' },
      contentStyle: { backgroundColor: colors.background },
    }}
  >
    <Stack.Screen name="Main" component={MainTabNavigator} options={{ headerShown: false }} />
    <Stack.Screen name="Satellite" component={SatelliteViewScreen} options={{ title: 'Satellite Intelligence' }} />
    <Stack.Screen name="AirForceDatabase" component={IndianAirForceDatabaseScreen} options={{ title: 'IAF Database' }} />
    <Stack.Screen name="TrackedAircraftArchive" component={TrackedAircraftArchiveScreen} options={{ title: 'Aircraft Archive' }} />
    <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }} />
    <Stack.Screen name="SecuritySettings" component={SecuritySettingsScreen} options={{ title: 'Security' }} />
    <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} options={{ title: 'Notification Settings' }} />
    <Stack.Screen name="FlightAlerts" component={FlightAlertsScreen} options={{ title: 'Flight Alerts' }} />
    <Stack.Screen name="AtcTranscript" component={AtcTranscriptScreen} options={{ title: 'ATC Transcript' }} />
  </Stack.Navigator>
);

export const RootNavigator = () => {
  const { isAuthenticated, isHydrating } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const finishSplash = useCallback(() => setShowSplash(false), []);

  if (showSplash) return <SplashScreen isReady={!isHydrating} onFinish={finishSplash} />;

  return (
    <NavigationContainer theme={navigationTheme}>
      {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};
