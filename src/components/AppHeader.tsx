import { StyleSheet, Text, View } from 'react-native';
import { ServerStatusBadge } from './ServerStatusBadge';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

interface AppHeaderProps {
  greeting: string;
  name: string;
  initials: string;
  online: boolean;
}

export const AppHeader = ({ greeting, name, initials, online }: AppHeaderProps) => (
  <View style={styles.container}>
    <View style={styles.topRow}>
      <View style={styles.copy}>
        <Text style={styles.greeting}>{greeting},</Text>
        <Text style={styles.name}>{name}</Text>
      </View>
      <View style={styles.avatar}>
        <Text style={styles.initials}>{initials}</Text>
        <View style={styles.presence} />
      </View>
    </View>
    <ServerStatusBadge online={online} />
  </View>
);

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  copy: { flex: 1 },
  greeting: { color: colors.textSecondary, fontSize: 14, fontWeight: '500' },
  name: { color: colors.text, fontSize: 27, fontWeight: '800', letterSpacing: -0.6, marginTop: 2 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.blue12,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { color: colors.blue, fontSize: 15, fontWeight: '800' },
  presence: { position: 'absolute', right: -2, bottom: -2, width: 12, height: 12, borderRadius: 6, backgroundColor: colors.radar, borderWidth: 2, borderColor: colors.background },
});
