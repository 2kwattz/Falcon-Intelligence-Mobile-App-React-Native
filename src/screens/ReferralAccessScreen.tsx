import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons/static';
import { AppButton } from '@/components/AppButton';
import { AppTextInput } from '@/components/AppTextInput';
import { colors } from '@/constants/colors';
import { REFERRAL_REQUEST_EMAIL } from '@/constants/config';
import { radius, spacing } from '@/constants/spacing';
import { AuthStackParamList } from '@/navigation/navigationTypes';

type Props = NativeStackScreenProps<AuthStackParamList, 'ReferralAccess'>;

const REFERRAL_EMAIL_SUBJECT = 'Falcon Intelligence referral code request';
const REFERRAL_EMAIL_BODY = `Hello Prakash,

I would like to request a referral code for Falcon Intelligence access.

Name:
Email address:
Reason for access:

Thank you.`;

export const ReferralAccessScreen = ({ navigation }: Props) => {
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const openReferralEmail = () => {
    const url = `mailto:${REFERRAL_REQUEST_EMAIL}?subject=${encodeURIComponent(REFERRAL_EMAIL_SUBJECT)}&body=${encodeURIComponent(REFERRAL_EMAIL_BODY)}`;

    Linking.openURL(url).catch(() => {
      Alert.alert('Email app unavailable', `Please email ${REFERRAL_REQUEST_EMAIL} to request a referral code.`);
    });
  };

  const useReferralCode = () => {
    const normalizedCode = referralCode.trim().toUpperCase();

    if (normalizedCode.length < 4) {
      setError('Enter the complete referral code from your approval email.');
      return;
    }

    setError(null);
    navigation.navigate('Login', { referralCode: normalizedCode });
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.icon}>
            <MaterialCommunityIcons name="account-key-outline" size={35} color={colors.radar} />
          </View>
          <Text style={styles.eyebrow}>INVITATION-ONLY ACCESS</Text>
          <Text style={styles.title}>Referral access</Text>
          <Text style={styles.subtitle}>
            Request a referral code by email, then enter the code below to include it with your secure sign-in.
          </Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Request a referral code</Text>
            <Text style={styles.cardDescription}>
              Open a pre-drafted email addressed to {REFERRAL_REQUEST_EMAIL}.
            </Text>
            <AppButton label="Email Referral Request" onPress={openReferralEmail} variant="secondary" />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Enter referral code</Text>
            <AppTextInput
              label="Referral code"
              icon="key-outline"
              placeholder="Enter your code"
              value={referralCode}
              onChangeText={value => {
                setReferralCode(value.toUpperCase());
                if (error) setError(null);
              }}
              error={error ?? undefined}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={32}
              returnKeyType="done"
              onSubmitEditing={useReferralCode}
            />
            <AppButton label="Continue with Referral Code" onPress={useReferralCode} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl, paddingBottom: spacing.huge },
  icon: { width: 66, height: 66, borderRadius: 22, backgroundColor: colors.radar10, borderWidth: 1, borderColor: colors.radar20, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl },
  eyebrow: { color: colors.radar, fontSize: 10, fontWeight: '800', letterSpacing: 1.8 },
  title: { color: colors.text, fontSize: 32, fontWeight: '800', marginTop: spacing.xs },
  subtitle: { color: colors.textSecondary, fontSize: 13, lineHeight: 20, marginTop: spacing.xs, marginBottom: spacing.xl },
  card: { gap: spacing.md, padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, marginBottom: spacing.md },
  cardTitle: { color: colors.text, fontSize: 15, fontWeight: '800' },
  cardDescription: { color: colors.textSecondary, fontSize: 11, lineHeight: 17 },
});
