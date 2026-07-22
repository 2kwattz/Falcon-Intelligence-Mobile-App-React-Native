import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';

interface AppButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  style?: ViewStyle;
}

export const AppButton = ({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
}: AppButtonProps) => {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'danger' && styles.danger,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? colors.radar : colors.background} />
      ) : (
        <Text style={[styles.label, variant === 'secondary' && styles.secondaryLabel]}>{label}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: colors.radar },
  secondary: { backgroundColor: colors.radar10, borderWidth: 1, borderColor: colors.radarDim },
  danger: { backgroundColor: colors.danger },
  label: { color: colors.background, fontSize: 15, fontWeight: '800', letterSpacing: 0.3 },
  secondaryLabel: { color: colors.radar },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
});
