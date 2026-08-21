import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: { referralCode?: string } | undefined;
  ForgotPassword: undefined;
  ReferralAccess: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Map: undefined;
  Chatroom: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  Satellite: undefined;
  AirForceDatabase: undefined;
  TrackedAircraftArchive: undefined;
  Profile: undefined;
  SecuritySettings: undefined;
  NotificationSettings: undefined;
  FlightAlerts: undefined;
  AtcTranscript: undefined;
};
