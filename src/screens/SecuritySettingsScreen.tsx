import { useState } from 'react';
import { Switch } from 'react-native';
import { DetailScaffold } from '@/components/DetailScaffold';
import { SectionCard } from '@/components/SectionCard';
import { SettingsRow } from '@/components/SettingsRow';
import { colors } from '@/constants/colors';

export const SecuritySettingsScreen = () => {
  const [biometrics, setBiometrics] = useState(false);
  const [twoFactor, setTwoFactor] = useState(true);
  return (
    <DetailScaffold eyebrow="Account protection" title="Security Settings" description="Manage local access and authentication safeguards.">
      <SectionCard title="Authentication">
        <SettingsRow icon="form-textbox-password" title="Change Password" subtitle="Last changed 42 days ago" onPress={() => undefined} />
        <SettingsRow icon="fingerprint" title="Biometric Unlock" subtitle="Use device biometrics for local access" trailing={<Switch value={biometrics} onValueChange={setBiometrics} trackColor={{ false: colors.primary, true: colors.radarDim }} thumbColor={colors.text} />} />
        <SettingsRow icon="two-factor-authentication" title="Two-factor Authentication" subtitle="Require a verification challenge" trailing={<Switch value={twoFactor} onValueChange={setTwoFactor} trackColor={{ false: colors.primary, true: colors.radarDim }} thumbColor={colors.text} />} isLast />
      </SectionCard>
      <SectionCard title="Active session">
        <SettingsRow icon="cellphone-check" title="This device" subtitle="Current secure session • Active now" isLast />
      </SectionCard>
    </DetailScaffold>
  );
};
