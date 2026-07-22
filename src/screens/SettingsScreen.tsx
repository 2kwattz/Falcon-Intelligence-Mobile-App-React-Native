import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LogoMark } from '@/components/LogoMark';
import { SectionCard } from '@/components/SectionCard';
import { SettingsRow } from '@/components/SettingsRow';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';
import { useAuth } from '@/hooks/useAuth';
import { MainTabParamList, RootStackParamList } from '@/navigation/navigationTypes';

type Props = BottomTabScreenProps<MainTabParamList, 'Settings'>;

export const SettingsScreen = ({ navigation }: Props) => {
  const { user, logout } = useAuth();
  const rootNavigation = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();

  const confirmLogout = () => {
    Alert.alert('End secure session?', 'You will need to authenticate again to access Falcon Intelligence.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => void logout() },
    ]);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View>
          <Text style={styles.eyebrow}>SYSTEM CONFIGURATION</Text>
          <Text style={styles.title}>Settings</Text>
        </View>
        <View style={styles.profileCard}>
          <LogoMark size={58} />
          <View style={styles.profileCopy}>
            <Text style={styles.profileName}>{user?.name ?? 'Falcon Operator'}</Text>
            <Text style={styles.profileEmail}>{user?.email ?? 'operator@falcon.local'}</Text>
            <View style={styles.roleBadge}><Text style={styles.roleText}>{(user?.role ?? 'operator').toUpperCase()}</Text></View>
          </View>
        </View>

        <SectionCard title="Account & Security" eyebrow="Operator controls">
          <SettingsRow icon="account-outline" title="My Profile" subtitle="Identity and operator information" onPress={() => rootNavigation?.navigate('Profile')} />
          <SettingsRow icon="shield-lock-outline" title="Security Settings" subtitle="Password and session protection" onPress={() => rootNavigation?.navigate('SecuritySettings')} isLast />
        </SectionCard>

        <SectionCard title="Preferences" eyebrow="Alerts & delivery">
          <SettingsRow icon="bell-outline" title="Notification Settings" subtitle="Control alerts and sound" onPress={() => rootNavigation?.navigate('NotificationSettings')} />
          <SettingsRow icon="airplane-alert" title="Flight Alerts" subtitle="Radius and aircraft watch rules" onPress={() => rootNavigation?.navigate('FlightAlerts')} isLast />
        </SectionCard>

        <SectionCard>
          <SettingsRow icon="logout" title="Logout" subtitle="End this secure operator session" onPress={confirmLogout} danger isLast />
        </SectionCard>
        <Text style={styles.version}>FALCON INTELLIGENCE • VERSION 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingTop: spacing.lg, paddingBottom: 112, gap: spacing.md },
  eyebrow: { color: colors.radar, fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
  title: { color: colors.text, fontSize: 28, fontWeight: '800', marginTop: 3 },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg },
  profileCopy: { flex: 1 },
  profileName: { color: colors.text, fontSize: 17, fontWeight: '800' },
  profileEmail: { color: colors.textSecondary, fontSize: 11, marginTop: 3 },
  roleBadge: { alignSelf: 'flex-start', marginTop: spacing.xs, backgroundColor: colors.radar10, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 4 },
  roleText: { color: colors.radar, fontSize: 7, fontWeight: '900', letterSpacing: 1 },
  version: { color: colors.textMuted, fontSize: 8, fontWeight: '700', letterSpacing: 1.3, textAlign: 'center', paddingTop: spacing.sm },
});
