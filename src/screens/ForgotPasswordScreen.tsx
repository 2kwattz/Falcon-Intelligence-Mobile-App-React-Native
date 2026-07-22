import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons/static';
import { forgotPassword } from '@/apis/authApi';
import { AppButton } from '@/components/AppButton';
import { AppTextInput } from '@/components/AppTextInput';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';
import { isValidEmail } from '@/utils/validation';

export const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!isValidEmail(email)) {
      setError('Enter the email linked to your operator account.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await forgotPassword(email);
      setMessage(response.message);
    } catch {
      setError('Recovery service is unavailable. Try again shortly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={styles.content} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.icon}><MaterialCommunityIcons name="shield-key-outline" size={34} color={colors.radar} /></View>
        <Text style={styles.eyebrow}>ACCOUNT RECOVERY</Text>
        <Text style={styles.title}>Reset access</Text>
        <Text style={styles.subtitle}>We’ll send secure recovery instructions to your registered address.</Text>
        <View style={styles.form}>
          <AppTextInput
            label="Email address"
            icon="mail-outline"
            value={email}
            onChangeText={setEmail}
            placeholder="operator@falcon.io"
            keyboardType="email-address"
            autoCapitalize="none"
            error={error ?? undefined}
          />
          {message ? <Text style={styles.success}>{message}</Text> : null}
          <AppButton label="Send Recovery Link" onPress={() => void submit()} loading={loading} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, justifyContent: 'center', padding: spacing.xl },
  icon: { width: 66, height: 66, borderRadius: 22, backgroundColor: colors.radar10, borderWidth: 1, borderColor: colors.radar20, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl },
  eyebrow: { color: colors.radar, fontSize: 10, fontWeight: '800', letterSpacing: 1.8 },
  title: { color: colors.text, fontSize: 32, fontWeight: '800', marginTop: spacing.xs },
  subtitle: { color: colors.textSecondary, lineHeight: 21, marginTop: spacing.xs, marginBottom: spacing.xxl },
  form: { gap: spacing.lg, padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  success: { color: colors.radar, backgroundColor: colors.radar10, padding: spacing.sm, borderRadius: radius.sm, fontSize: 12, lineHeight: 18 },
});
