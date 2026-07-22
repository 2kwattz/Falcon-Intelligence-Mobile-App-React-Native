import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons/static';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

export const SatelliteViewScreen = () => (
  <SafeAreaView style={styles.screen}>
    <View style={styles.stars}>
      {Array.from({ length: 18 }).map((_, index) => (
        <View key={index} style={[styles.star, { left: `${(index * 37) % 96}%`, top: `${(index * 53) % 88}%`, opacity: 0.2 + (index % 5) * 0.15 }]} />
      ))}
    </View>
    <View style={styles.orbitLarge} />
    <View style={styles.orbitSmall} />
    <View style={styles.content}>
      <View style={styles.iconShell}>
        <MaterialCommunityIcons name="satellite-variant" size={54} color={colors.radar} />
        <View style={styles.signalOne} />
        <View style={styles.signalTwo} />
      </View>
      <Text style={styles.eyebrow}>ORBITAL RECONNAISSANCE</Text>
      <Text style={styles.title}>Satellite Intelligence</Text>
      <View style={styles.badge}><Text style={styles.badgeText}>COMING SOON</Text></View>
      <Text style={styles.message}>High-resolution orbital tracking and imagery will be available in a future Falcon release.</Text>
      <View style={styles.statusRow}><View style={styles.statusDot} /><Text style={styles.statusText}>MODULE IN DEVELOPMENT</Text></View>
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, overflow: 'hidden' },
  stars: { ...StyleSheet.absoluteFillObject },
  star: { position: 'absolute', width: 2, height: 2, borderRadius: 1, backgroundColor: colors.text },
  orbitLarge: { position: 'absolute', width: 520, height: 260, borderRadius: 260, borderWidth: 1, borderColor: colors.border, transform: [{ rotate: '-28deg' }], left: -70, top: '34%' },
  orbitSmall: { position: 'absolute', width: 380, height: 190, borderRadius: 190, borderWidth: 1, borderColor: colors.radar20, transform: [{ rotate: '32deg' }], left: -15, top: '37%' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xxl },
  iconShell: { width: 126, height: 126, borderRadius: 63, borderWidth: 1, borderColor: colors.radar20, backgroundColor: colors.radar10, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xxl },
  signalOne: { position: 'absolute', width: 88, height: 88, borderRadius: 44, borderTopWidth: 1, borderColor: colors.radarDim, transform: [{ rotate: '30deg' }] },
  signalTwo: { position: 'absolute', width: 108, height: 108, borderRadius: 54, borderBottomWidth: 1, borderColor: colors.blueDim, transform: [{ rotate: '-35deg' }] },
  eyebrow: { color: colors.radar, fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  title: { color: colors.text, fontSize: 29, fontWeight: '800', textAlign: 'center', marginTop: spacing.xs },
  badge: { backgroundColor: colors.blue12, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 999, paddingHorizontal: spacing.md, paddingVertical: 7, marginTop: spacing.lg },
  badgeText: { color: colors.blue, fontSize: 9, fontWeight: '900', letterSpacing: 1.6 },
  message: { color: colors.textSecondary, fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: spacing.lg, maxWidth: 330 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xxl },
  statusDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.warning },
  statusText: { color: colors.textMuted, fontSize: 8, fontWeight: '800', letterSpacing: 1.4 },
});
