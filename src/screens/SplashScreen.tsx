import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RadarDisplay } from '@/components/RadarDisplay';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

interface SplashScreenProps {
  isReady: boolean;
  onFinish: () => void;
}

export const SplashScreen = ({ isReady, onFinish }: SplashScreenProps) => {
  const [minimumElapsed, setMinimumElapsed] = useState(false);
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslate = useRef(new Animated.Value(12)).current;
  const finished = useRef(false);

  useEffect(() => {
    let mounted = true;
    const timer = setTimeout(() => mounted && setMinimumElapsed(true), 3000);
    void AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (reduced) {
        titleOpacity.setValue(1);
        titleTranslate.setValue(0);
        return;
      }
      Animated.parallel([
        Animated.timing(titleOpacity, { toValue: 1, duration: 900, delay: 900, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(titleTranslate, { toValue: 0, duration: 900, delay: 900, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    });
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [titleOpacity, titleTranslate]);

  useEffect(() => {
    if (isReady && minimumElapsed && !finished.current) {
      finished.current = true;
      onFinish();
    }
  }, [isReady, minimumElapsed, onFinish]);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.grid} pointerEvents="none">
        {Array.from({ length: 11 }).map((_, index) => <View key={`h-${index}`} style={[styles.gridHorizontal, { top: `${index * 10}%` }]} />)}
        {Array.from({ length: 7 }).map((_, index) => <View key={`v-${index}`} style={[styles.gridVertical, { left: `${index * 16.66}%` }]} />)}
      </View>
      <View style={styles.content}>
        <Text style={styles.system}>TACTICAL AIRSPACE SYSTEM</Text>
        <RadarDisplay size={310} />
        <Animated.View style={[styles.titleGroup, { opacity: titleOpacity, transform: [{ translateY: titleTranslate }] }]}>
          <Text style={styles.title}>FALCON</Text>
          <Text style={styles.intelligence}>INTELLIGENCE</Text>
          <View style={styles.rule} />
          <Text style={styles.subtitle}>AIRSPACE AWARENESS • ACTIVE</Text>
        </Animated.View>
      </View>
      <View style={styles.footer}>
        <View style={styles.statusDot} />
        <Text style={styles.footerText}>INITIALIZING SECURE CHANNEL</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, overflow: 'hidden' },
  grid: { ...StyleSheet.absoluteFillObject, opacity: 0.36 },
  gridHorizontal: { position: 'absolute', left: 0, right: 0, height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  gridVertical: { position: 'absolute', top: 0, bottom: 0, width: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg },
  system: { color: colors.textMuted, fontSize: 9, fontWeight: '800', letterSpacing: 2.6, marginBottom: spacing.lg },
  titleGroup: { alignItems: 'center', marginTop: spacing.xl },
  title: { color: colors.text, fontSize: 38, lineHeight: 40, fontWeight: '900', letterSpacing: 7 },
  intelligence: { color: colors.radar, fontSize: 13, fontWeight: '800', letterSpacing: 6.1, marginTop: 5 },
  rule: { width: 64, height: 1, backgroundColor: colors.radarDim, marginVertical: spacing.md },
  subtitle: { color: colors.textSecondary, fontSize: 8, fontWeight: '700', letterSpacing: 1.8 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, paddingBottom: spacing.xl },
  statusDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.radar },
  footerText: { color: colors.textMuted, fontSize: 8, fontWeight: '700', letterSpacing: 1.7 },
});
