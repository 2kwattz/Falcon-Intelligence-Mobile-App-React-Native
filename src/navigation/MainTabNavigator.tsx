import { ComponentProps } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import { colors } from '@/constants/colors';
import { ChatroomScreen } from '@/screens/ChatroomScreen';
import { DashboardScreen } from '@/screens/DashboardScreen';
import { MapScreen } from '@/screens/MapScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { MainTabParamList } from './navigationTypes';

const Tab = createBottomTabNavigator<MainTabParamList>();
type IoniconName = ComponentProps<typeof Ionicons>['name'];

const tabIcons: Record<keyof MainTabParamList, { active: IoniconName; inactive: IoniconName }> = {
  Dashboard: { active: 'grid', inactive: 'grid-outline' },
  Map: { active: 'map', inactive: 'map-outline' },
  Chatroom: { active: 'chatbubbles', inactive: 'chatbubbles-outline' },
  Settings: { active: 'settings', inactive: 'settings-outline' },
};

export const MainTabNavigator = () => (
  <Tab.Navigator
    initialRouteName="Dashboard"
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarHideOnKeyboard: true,
      tabBarActiveTintColor: colors.radar,
      tabBarInactiveTintColor: colors.textMuted,
      tabBarStyle: {
        backgroundColor: 'rgba(8,20,38,0.98)',
        borderTopColor: colors.border,
        borderTopWidth: 1,
        height: 70,
        paddingTop: 7,
        paddingBottom: 8,
      },
      tabBarLabelStyle: { fontSize: 9, fontWeight: '700', letterSpacing: 0.2 },
      tabBarIcon: ({ color, size, focused }) => (
        <Ionicons name={focused ? tabIcons[route.name].active : tabIcons[route.name].inactive} size={size - 1} color={color} />
      ),
    })}
  >
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Map" component={MapScreen} />
    <Tab.Screen name="Chatroom" component={ChatroomScreen} />
    <Tab.Screen name="Settings" component={SettingsScreen} />
  </Tab.Navigator>
);
