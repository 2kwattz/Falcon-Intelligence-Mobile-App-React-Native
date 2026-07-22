import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';

interface ServerStatusBadgeProps {
  online: boolean;
  compact?: boolean;
}

export const ServerStatusBadge = ({ online, compact = false }: ServerStatusBadgeProps) => (
  <View style={[styles.container, compact && styles.compact]}>
    <View style={[styles.dotHalo, !online && styles.dotHaloOffline]}>
      <View style={[styles.dot, !online && styles.dotOffline]} />
    </View>
    <Text style={[styles.label, !online && styles.offlineLabel]}>
      {online ? 'Falcon Server Online' : 'Server Offline'}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.radar10,
    borderColor: colors.radar20,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  compact: { paddingVertical: 6, paddingHorizontal: 9 },
  dotHalo: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.radar20, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.radar },
  dotHaloOffline: { backgroundColor: 'rgba(255,92,112,0.18)' },
  dotOffline: { backgroundColor: colors.danger },
  label: { color: colors.radar, fontSize: 11, fontWeight: '700' },
  offlineLabel: { color: colors.danger },
});
