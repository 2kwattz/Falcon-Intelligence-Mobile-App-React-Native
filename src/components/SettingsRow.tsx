import { ComponentProps, ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons/static';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

interface SettingsRowProps {
  icon: IconName;
  title: string;
  subtitle: string;
  onPress?: () => void;
  danger?: boolean;
  trailing?: ReactNode;
  isLast?: boolean;
}

export const SettingsRow = ({ icon, title, subtitle, onPress, danger = false, trailing, isLast = false }: SettingsRowProps) => (
  <Pressable
    accessibilityRole={onPress ? 'button' : undefined}
    onPress={onPress}
    disabled={!onPress}
    style={({ pressed }) => [styles.row, !isLast && styles.divider, pressed && styles.pressed]}
  >
    <View style={[styles.icon, danger && styles.dangerIcon]}>
      <MaterialCommunityIcons name={icon} size={20} color={danger ? colors.danger : colors.blue} />
    </View>
    <View style={styles.copy}>
      <Text style={[styles.title, danger && styles.dangerTitle]}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
    {trailing ?? (onPress ? <Ionicons name="chevron-forward" size={18} color={colors.textMuted} /> : null)}
  </Pressable>
);

const styles = StyleSheet.create({
  row: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  pressed: { opacity: 0.65 },
  icon: { width: 42, height: 42, borderRadius: radius.sm, backgroundColor: colors.blue12, alignItems: 'center', justifyContent: 'center' },
  dangerIcon: { backgroundColor: 'rgba(255,92,112,0.1)' },
  copy: { flex: 1 },
  title: { color: colors.text, fontSize: 14, fontWeight: '700' },
  dangerTitle: { color: colors.danger },
  subtitle: { color: colors.textSecondary, fontSize: 11, marginTop: 4 },
});
