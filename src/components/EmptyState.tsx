import { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons/static';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({ icon = 'radar', title, message, actionLabel, onAction }: EmptyStateProps) => (
  <View style={styles.container}>
    <MaterialCommunityIcons name={icon} size={38} color={colors.textMuted} />
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.message}>{message}</Text>
    {actionLabel && onAction ? (
      <Pressable accessibilityRole="button" onPress={onAction} style={styles.action}>
        <Text style={styles.actionLabel}>{actionLabel}</Text>
      </Pressable>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  container: { padding: spacing.xxl, alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  title: { color: colors.text, fontSize: 16, fontWeight: '700', marginTop: spacing.xs },
  message: { color: colors.textSecondary, fontSize: 13, textAlign: 'center', lineHeight: 19 },
  action: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, marginTop: spacing.sm },
  actionLabel: { color: colors.radar, fontWeight: '700' },
});
