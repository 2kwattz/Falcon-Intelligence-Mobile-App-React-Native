import { StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons/static';
import { DetailScaffold } from '@/components/DetailScaffold';
import { LogoMark } from '@/components/LogoMark';
import { SectionCard } from '@/components/SectionCard';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { useAuth } from '@/hooks/useAuth';

const ProfileField = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.field}><Text style={styles.label}>{label.toUpperCase()}</Text><Text style={styles.value}>{value}</Text></View>
);

export const ProfileScreen = () => {
  const { user } = useAuth();
  return (
    <DetailScaffold eyebrow="Operator identity" title="My Profile" description="Your authenticated Falcon operator information.">
      <SectionCard>
        <View style={styles.identity}>
          <LogoMark size={72} />
          <View><Text style={styles.name}>{user?.name ?? 'Roshan Bhatia'}</Text><View style={styles.verified}><MaterialCommunityIcons name="check-decagram" size={14} color={colors.radar} /><Text style={styles.verifiedText}>VERIFIED OPERATOR</Text></View></View>
        </View>
      </SectionCard>
      <SectionCard title="Account information">
        <ProfileField label="Full name" value={user?.name ?? 'Roshan Bhatia'} />
        <ProfileField label="Email address" value={user?.email ?? 'roshan@falcon.local'} />
        <ProfileField label="Access role" value={user?.role === 'admin' ? 'Administrator' : 'Airspace Operator'} />
        <ProfileField label="Operator ID" value={(user?.id ?? 'usr-roshan-01').toUpperCase()} />
      </SectionCard>
    </DetailScaffold>
  );
};

const styles = StyleSheet.create({
  identity: { flexDirection: 'row', alignItems: 'center', gap: spacing.xl, padding: spacing.sm },
  name: { color: colors.text, fontSize: 20, fontWeight: '800' },
  verified: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: spacing.xs },
  verifiedText: { color: colors.radar, fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  field: { minHeight: 62, justifyContent: 'center', paddingVertical: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  label: { color: colors.textMuted, fontSize: 8, fontWeight: '800', letterSpacing: 1 },
  value: { color: colors.text, fontSize: 14, fontWeight: '600', marginTop: 5 },
});
