import { ComponentProps, forwardRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';

type IconName = ComponentProps<typeof Ionicons>['name'];

interface AppTextInputProps extends TextInputProps {
  label: string;
  icon: IconName;
  error?: string;
  isPassword?: boolean;
}

export const AppTextInput = forwardRef<TextInput, AppTextInputProps>(
  ({ label, icon, error, isPassword = false, onFocus, onBlur, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    return (
      <View style={styles.wrapper}>
        <Text style={styles.label}>{label.toUpperCase()}</Text>
        <View style={[styles.inputShell, focused && styles.focused, Boolean(error) && styles.errorShell]}>
          <Ionicons name={icon} size={19} color={focused ? colors.radar : colors.textSecondary} />
          <TextInput
            ref={ref}
            placeholderTextColor={colors.textMuted}
            selectionColor={colors.radar}
            secureTextEntry={isPassword && !passwordVisible}
            style={styles.input}
            onFocus={(event) => {
              setFocused(true);
              onFocus?.(event);
            }}
            onBlur={(event) => {
              setFocused(false);
              onBlur?.(event);
            }}
            {...props}
          />
          {isPassword ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={passwordVisible ? 'Hide password' : 'Show password'}
              hitSlop={10}
              onPress={() => setPasswordVisible((visible) => !visible)}
            >
              <Ionicons name={passwordVisible ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textSecondary} />
            </Pressable>
          ) : null}
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    );
  },
);

AppTextInput.displayName = 'AppTextInput';

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs },
  label: { color: colors.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 1.1 },
  inputShell: {
    height: 54,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.elevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  focused: { borderColor: colors.radarDim, backgroundColor: colors.card },
  errorShell: { borderColor: colors.danger },
  input: { flex: 1, color: colors.text, fontSize: 15, height: '100%' },
  error: { color: colors.danger, fontSize: 12 },
});
