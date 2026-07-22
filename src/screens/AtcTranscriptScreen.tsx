import { StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons/static';
import { DetailScaffold } from '@/components/DetailScaffold';
import { SectionCard } from '@/components/SectionCard';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';

export const AtcTranscriptScreen = () => (
  <DetailScaffold
    eyebrow="Air traffic communications"
    title="ATC Transcript"
    description="Review transcribed communications between air traffic control and aircraft."
  >
    <SectionCard>
      <View style={styles.status}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="progress-wrench" size={34} color={colors.radar} />
        </View>
        <Text style={styles.title}>Module under development</Text>
        <Text style={styles.description}>ATC transcript tools will be available in a future update.</Text>
      </View>
    </SectionCard>
  </DetailScaffold>
);

const styles = StyleSheet.create({
  status: { alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.xxl },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: radius.lg,
    backgroundColor: colors.radar10,
    borderWidth: 1,
    borderColor: colors.radar20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: colors.text, fontSize: 18, fontWeight: '800', marginTop: spacing.lg, textAlign: 'center' },
  description: { color: colors.textSecondary, fontSize: 12, lineHeight: 18, marginTop: spacing.xs, textAlign: 'center' },
});
