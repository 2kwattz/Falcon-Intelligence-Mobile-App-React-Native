import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppButton } from '@/components/AppButton';
import { AppTextInput } from '@/components/AppTextInput';
import { LogoMark } from '@/components/LogoMark';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';
import { useAuth } from '@/hooks/useAuth';
import { AuthStackParamList } from '@/navigation/navigationTypes';
import { getLoginValidationError, isValidEmail } from '@/utils/validation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen = ({ navigation, route }: Props) => {
  const passwordRef = useRef<TextInput>(null);
  const { login } = useAuth();
  const referralCode = route.params?.referralCode;
  const [email, setEmail] = useState('roshan@falcon.local');
  const [password, setPassword] = useState('falcon123');
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setEmailTouched(true);
    setPasswordTouched(true);
    const validationError = getLoginValidationError(email, password);
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await login(email, password, referralCode);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const emailError = emailTouched && !isValidEmail(email) ? 'Enter a valid email address.' : undefined;
  const passwordError = passwordTouched && password.length < 6 ? 'Use at least 6 characters.' : undefined;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.glow} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brand}>
            <LogoMark size={60} />
            <View>
              <Text style={styles.brandTitle}>FALCON</Text>
              <Text style={styles.brandSub}>INTELLIGENCE</Text>
            </View>
          </View>

          <View style={styles.hero}>
            <Text style={styles.eyebrow}>SECURE OPERATOR ACCESS</Text>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Authenticate to access real-time airspace intelligence.</Text>
          </View>

          <View style={styles.form}>
            {referralCode ? (
              <View style={styles.referralReady}>
                <Text style={styles.referralReadyText}>Referral code added to this secure sign-in.</Text>
              </View>
            ) : null}
            <AppTextInput
              label="Email address"
              icon="mail-outline"
              placeholder="operator@falcon.io"
              value={email}
              onChangeText={setEmail}
              onBlur={() => setEmailTouched(true)}
              error={emailError}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />
            <AppTextInput
              ref={passwordRef}
              label="Password"
              icon="lock-closed-outline"
              placeholder="Enter secure password"
              value={password}
              onChangeText={setPassword}
              onBlur={() => setPasswordTouched(true)}
              error={passwordError}
              isPassword
              returnKeyType="done"
              onSubmitEditing={() => void submit()}
            />
            <Pressable hitSlop={10} onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgot}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </Pressable>
            {error ? <Text accessibilityRole="alert" style={styles.submitError}>{error}</Text> : null}
            <AppButton label="Enter Command Center" onPress={() => void submit()} loading={loading} />
            <View style={styles.referralDivider} />
            <Text style={styles.referralPrompt}>Need invitation-only operator access?</Text>
            <AppButton
              label="Request or Enter Referral Code"
              onPress={() => navigation.navigate('ReferralAccess')}
              variant="secondary"
            />
          </View>

          <View style={styles.security}>
            <View style={styles.securityDot} />
            <Text style={styles.securityText}>256-BIT ENCRYPTED SESSION</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: colors.background },
  glow: { position: 'absolute', width: 280, height: 280, borderRadius: 140, backgroundColor: colors.blue12, top: -150, right: -100 },
  content: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.xxl },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  brandTitle: { color: colors.text, fontSize: 19, fontWeight: '900', letterSpacing: 4 },
  brandSub: { color: colors.radar, fontSize: 8, fontWeight: '800', letterSpacing: 3.2, marginTop: 3 },
  hero: { marginTop: 72, marginBottom: spacing.xxl },
  eyebrow: { color: colors.radar, fontSize: 10, fontWeight: '800', letterSpacing: 1.8, marginBottom: spacing.sm },
  title: { color: colors.text, fontSize: 34, fontWeight: '800', letterSpacing: -1 },
  subtitle: { color: colors.textSecondary, fontSize: 14, lineHeight: 21, marginTop: spacing.xs, maxWidth: 330 },
  form: { gap: spacing.lg, padding: spacing.lg, backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  forgot: { alignSelf: 'flex-end', marginTop: -spacing.xs },
  forgotText: { color: colors.blue, fontSize: 12, fontWeight: '700' },
  submitError: { color: colors.danger, backgroundColor: 'rgba(255,92,112,0.08)', padding: spacing.sm, borderRadius: radius.sm, fontSize: 12 },
  referralReady: { backgroundColor: colors.radar10, borderRadius: radius.sm, padding: spacing.sm, borderWidth: 1, borderColor: colors.radar20 },
  referralReadyText: { color: colors.radar, fontSize: 11, fontWeight: '700', textAlign: 'center' },
  referralDivider: { height: 1, backgroundColor: colors.border },
  referralPrompt: { color: colors.textSecondary, fontSize: 11, textAlign: 'center' },
  security: { marginTop: 'auto', paddingTop: spacing.xxl, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  securityDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.radar },
  securityText: { color: colors.textMuted, fontSize: 9, fontWeight: '700', letterSpacing: 1.4 },
});
