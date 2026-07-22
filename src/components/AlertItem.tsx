import { StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons/static';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';
import { FlightAlert } from '@/types/dashboard';
import { formatTime } from '@/utils/date';

interface AlertItemProps {
  alert: FlightAlert;
  isLast?: boolean;
}

export const AlertItem = ({ alert, isLast = false }: AlertItemProps) => {
  const accent = alert.severity === 'critical' ? colors.danger : alert.severity === 'warning' ? colors.warning : colors.blue;
  return (
    <View style={[styles.container, !isLast && styles.divider]}>
      <View style={[styles.icon, { backgroundColor: `${accent}18` }]}>
        <MaterialCommunityIcons name={alert.severity === 'info' ? 'airplane-takeoff' : 'radar'} size={18} color={accent} />
      </View>
      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <Text style={styles.aircraft} numberOfLines={1}>{alert.aircraft}</Text>
          {!alert.isRead ? <View style={styles.unread} /> : null}
        </View>
        <Text style={styles.message}>{alert.message}</Text>
      </View>
      <Text style={styles.time}>{formatTime(alert.timestamp)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  icon: { width: 38, height: 38, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, gap: 3 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  aircraft: { color: colors.text, fontSize: 13, fontWeight: '700', flexShrink: 1 },
  message: { color: colors.textSecondary, fontSize: 12 },
  unread: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.radar },
  time: { color: colors.textMuted, fontSize: 10 },
});
