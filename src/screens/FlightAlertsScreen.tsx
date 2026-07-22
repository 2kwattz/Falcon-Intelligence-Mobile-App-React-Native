import { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { DetailScaffold } from '@/components/DetailScaffold';
import { SectionCard } from '@/components/SectionCard';
import { SettingsRow } from '@/components/SettingsRow';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';

export const FlightAlertsScreen = () => {
  const [radiusAlerts, setRadiusAlerts] = useState(true);
  const [favorites, setFavorites] = useState(true);
  return (
    <DetailScaffold eyebrow="Detection rules" title="Flight Alerts" description="Configure which tracks and airspace events need your attention.">
      <SectionCard title="Monitored radius">
        <View style={styles.radiusHero}><View><Text style={styles.radiusValue}>50</Text><Text style={styles.radiusUnit}>KILOMETERS</Text></View><View style={styles.radarRing}><View style={styles.radarCenter} /></View></View>
        <View style={styles.radiusOptions}>{[25, 50, 100, 200].map((value) => <View key={value} style={[styles.radiusOption, value === 50 && styles.radiusOptionActive]}><Text style={[styles.radiusOptionText, value === 50 && styles.radiusOptionTextActive]}>{value}</Text></View>)}</View>
      </SectionCard>
      <SectionCard title="Rules">
        <SettingsRow icon="map-marker-radius-outline" title="Radius Entry Alerts" subtitle="Notify when aircraft enter the perimeter" trailing={<Switch value={radiusAlerts} onValueChange={setRadiusAlerts} trackColor={{ false: colors.primary, true: colors.radarDim }} thumbColor={colors.text} />} />
        <SettingsRow icon="star-outline" title="Favorite Movement" subtitle="Alert on pinned aircraft status changes" trailing={<Switch value={favorites} onValueChange={setFavorites} trackColor={{ false: colors.primary, true: colors.radarDim }} thumbColor={colors.text} />} isLast />
      </SectionCard>
    </DetailScaffold>
  );
};

const styles = StyleSheet.create({
  radiusHero: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.sm },
  radiusValue: { color: colors.text, fontSize: 40, fontWeight: '300' },
  radiusUnit: { color: colors.radar, fontSize: 8, fontWeight: '900', letterSpacing: 1.3 },
  radarRing: { width: 76, height: 76, borderRadius: 38, borderWidth: 1, borderColor: colors.radar20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.radar10 },
  radarCenter: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.radar },
  radiusOptions: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.sm },
  radiusOption: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: radius.sm, backgroundColor: colors.elevated, borderWidth: 1, borderColor: colors.border },
  radiusOptionActive: { backgroundColor: colors.radar, borderColor: colors.radar },
  radiusOptionText: { color: colors.textSecondary, fontSize: 11, fontWeight: '700' },
  radiusOptionTextActive: { color: colors.background },
});
