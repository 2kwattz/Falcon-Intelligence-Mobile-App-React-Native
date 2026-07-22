import { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons/static';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

interface StatCardProps {
  label: string;
  value: number;
  icon: IconName;
  accent: string;
}

export const StatCard = ({ label, value, icon, accent }: StatCardProps) => (
  <View style={styles.card}>
    <View style={[styles.icon, { backgroundColor: `${accent}18` }]}>
      <MaterialCommunityIcons name={icon} size={18} color={accent} />
    </View>
    <Text style={styles.value}>{value}</Text>
    <Text style={styles.label} numberOfLines={2}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 118,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  icon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs },
  value: { color: colors.text, fontSize: 25, fontWeight: '800', lineHeight: 30 },
  label: { color: colors.textSecondary, fontSize: 11, fontWeight: '600', lineHeight: 15 },
});
