import { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FalconReveal } from '@/components/FalconReveal';
import { RadarDisplay } from '@/components/RadarDisplay';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

interface SplashScreenProps {
  isReady: boolean;
  onFinish: () => void;
}

const SPLASH_DURATION_MS = 5000;
const REDUCED_MOTION_DURATION_MS = 900;

export const SplashScreen = ({ isReady, onFinish }: SplashScreenProps) => {
  const { width, height } = useWindowDimensions();
  const progress = useRef(new Animated.Value(0)).current;
  const finished = useRef(false);
  const [reduceMotion, setReduceMotion] = useState<boolean | null>(null);
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    let mounted = true;

    AccessibilityInfo.isReduceMotionEnabled()
      .then(reduced => {
        if (mounted) setReduceMotion(reduced);
      })
      .catch(() => {
        if (mounted) setReduceMotion(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (reduceMotion === null) return;

    let mounted = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let timeline: Animated.CompositeAnimation | undefined;

    if (reduceMotion) {
      progress.setValue(SPLASH_DURATION_MS);
      timer = setTimeout(() => {
        if (mounted) setAnimationComplete(true);
      }, REDUCED_MOTION_DURATION_MS);
    } else {
      progress.setValue(0);
      timeline = Animated.timing(progress, {
        toValue: SPLASH_DURATION_MS,
        duration: SPLASH_DURATION_MS,
        easing: Easing.linear,
        useNativeDriver: true,
      });
      timeline.start(({ finished: didFinish }) => {
        if (mounted && didFinish) setAnimationComplete(true);
      });
    }

    return () => {
      mounted = false;
      if (timer) clearTimeout(timer);
      timeline?.stop();
    };
  }, [progress, reduceMotion]);

  useEffect(() => {
    if (isReady && animationComplete && !finished.current) {
      finished.current = true;
      onFinish();
    }
  }, [animationComplete, isReady, onFinish]);

  const radarSize = Math.min(390, Math.max(310, width * 1.04), height * 0.57);
  const radarOpacity = progress.interpolate({
    inputRange: [0, 120, 520, 2200, 2640, 2980],
    outputRange: [0, 0, 1, 1, 0.52, 0],
    extrapolate: 'clamp',
  });
  const radarScale = progress.interpolate({
    inputRange: [0, 350, 2100, 2580, 2980],
    outputRange: [0.94, 0.96, 1, 1.08, 1.42],
    extrapolate: 'clamp',
  });
  const hudOpacity = progress.interpolate({
    inputRange: [0, 180, 520, 2450, 2860],
    outputRange: [0, 0, 0.76, 0.58, 0],
    extrapolate: 'clamp',
  });
  const bootOpacity = progress.interpolate({
    inputRange: [0, 180, 420, 1540, 1900],
    outputRange: [0, 0, 1, 1, 0],
    extrapolate: 'clamp',
  });
  const interceptOpacity = progress.interpolate({
    inputRange: [0, 1740, 1900, 2540, 2900],
    outputRange: [0, 0, 1, 1, 0],
    extrapolate: 'clamp',
  });
  const interceptTranslateY = progress.interpolate({
    inputRange: [1740, 2030],
    outputRange: [8, 0],
    extrapolate: 'clamp',
  });
  const identifiedOpacity = progress.interpolate({
    inputRange: [0, 2620, 2860, 3350, 3680],
    outputRange: [0, 0, 1, 1, 0],
    extrapolate: 'clamp',
  });
  const interceptFlashOpacity = progress.interpolate({
    inputRange: [0, 2450, 2640, 2820, 3020],
    outputRange: [0, 0, 0.28, 0.08, 0],
    extrapolate: 'clamp',
  });
  const laserFlashOpacity = progress.interpolate({
    inputRange: [0, 3480, 3660, 3810, 4100],
    outputRange: [0, 0, 0.34, 0.12, 0],
    extrapolate: 'clamp',
  });
  const ambientGlowOpacity = progress.interpolate({
    inputRange: [0, 380, 2100, 2940, 3600, 5000],
    outputRange: [0, 0.18, 0.28, 0.06, 0.18, 0.1],
    extrapolate: 'clamp',
  });
  const finalFrameOpacity = progress.interpolate({
    inputRange: [0, 3960, 4380, 5000],
    outputRange: [0, 0, 0.38, 0.38],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView
      accessibilityLabel="Falcon Intelligence is initializing"
      accessibilityLiveRegion="polite"
      style={styles.screen}
    >
      <Animated.View style={[styles.ambientGlow, { opacity: ambientGlowOpacity }]} />
      <Animated.View style={[styles.interceptFlash, { opacity: interceptFlashOpacity }]} />
      <Animated.View style={[styles.laserFlash, { opacity: laserFlashOpacity }]} />

      <Animated.View pointerEvents="none" style={[styles.hudFrame, { opacity: hudOpacity }]}>
        <View style={[styles.frameCorner, styles.frameTopLeft]} />
        <View style={[styles.frameCorner, styles.frameTopRight]} />
        <View style={[styles.frameCorner, styles.frameBottomLeft]} />
        <View style={[styles.frameCorner, styles.frameBottomRight]} />

        <View style={styles.hudTop}>
          <Text style={styles.hudLabel}>FI // AWACS TACTICAL DISPLAY</Text>
          <View style={styles.hudStatus}>
            <View style={styles.statusDot} />
            <Text style={styles.hudStatusText}>SECURE LINK</Text>
          </View>
        </View>
        <View style={styles.hudLeftReadout}>
          <Text style={styles.readoutText}>RNG 160 NM</Text>
          <Text style={styles.readoutText}>AZM 360.0°</Text>
          <Text style={styles.readoutText}>IFF ACTIVE</Text>
        </View>
        <View style={styles.hudRightReadout}>
          <Text style={styles.readoutText}>SCAN 01</Text>
          <Text style={styles.readoutText}>BAND L/S</Text>
          <Text style={styles.readoutText}>TRACK 07</Text>
        </View>
      </Animated.View>

      <View style={styles.stage}>
        <Animated.View
          style={[
            styles.radarStage,
            {
              width: radarSize,
              height: radarSize,
              opacity: radarOpacity,
              transform: [{ scale: radarScale }],
            },
          ]}
        >
          <RadarDisplay
            progress={progress}
            size={radarSize}
            active={!animationComplete}
            reduceMotion={reduceMotion === true}
          />
        </Animated.View>

        <FalconReveal progress={progress} />

        <View pointerEvents="none" style={styles.sceneStatus}>
          <Animated.View style={[styles.sceneStatusItem, { opacity: bootOpacity }]}>
            <Text style={styles.sceneEyebrow}>RADAR BOOT SEQUENCE</Text>
            <Text style={styles.sceneMessage}>TACTICAL AIRSPACE SCAN ACTIVE</Text>
          </Animated.View>
          <Animated.View
            style={[
              styles.sceneStatusItem,
              { opacity: interceptOpacity, transform: [{ translateY: interceptTranslateY }] },
            ]}
          >
            <Text style={styles.alertEyebrow}>PRIORITY INTERCEPT</Text>
            <Text style={styles.alertMessage}>UNKNOWN TARGET // ACQUIRING</Text>
          </Animated.View>
          <Animated.View style={[styles.sceneStatusItem, { opacity: identifiedOpacity }]}>
            <Text style={styles.sceneEyebrow}>IDENTIFICATION CONFIRMED</Text>
            <Text style={styles.sceneMessage}>CALLSIGN // FALCON</Text>
          </Animated.View>
        </View>
      </View>

      <Animated.View pointerEvents="none" style={[styles.finalFrame, { opacity: finalFrameOpacity }]}>
        <View style={styles.finalRule} />
        <Text style={styles.finalClassification}>MISSION SYSTEM READY</Text>
        <View style={styles.finalRule} />
      </Animated.View>

      <View style={styles.footer}>
        <Animated.View style={[styles.footerMessage, { opacity: bootOpacity }]}>
          <View style={styles.statusDot} />
          <Text style={styles.footerText}>INITIALIZING SECURE COMMAND CHANNEL</Text>
        </Animated.View>
        <Animated.View style={[styles.footerMessage, { opacity: identifiedOpacity }]}>
          <View style={styles.statusDot} />
          <Text style={styles.footerText}>BIOMETRIC TARGET PROFILE CONFIRMED</Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: 'black', overflow: 'hidden' },
  ambientGlow: { position: 'absolute', left: '8%', right: '8%', top: '24%', aspectRatio: 1, borderRadius: 999, backgroundColor: colors.radar20 },
  interceptFlash: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.radar },
  laserFlash: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.text },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  radarStage: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  hudFrame: { ...StyleSheet.absoluteFillObject, zIndex: 5, margin: spacing.md },
  frameCorner: { position: 'absolute', width: 32, height: 32, borderColor: colors.radar },
  frameTopLeft: { top: 0, left: 0, borderTopWidth: 1, borderLeftWidth: 1 },
  frameTopRight: { top: 0, right: 0, borderTopWidth: 1, borderRightWidth: 1 },
  frameBottomLeft: { bottom: 0, left: 0, borderBottomWidth: 1, borderLeftWidth: 1 },
  frameBottomRight: { right: 0, bottom: 0, borderRightWidth: 1, borderBottomWidth: 1 },
  hudTop: { position: 'absolute', top: spacing.sm, left: spacing.md, right: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hudLabel: { color: colors.radar, fontFamily: 'monospace', fontSize: 7, fontWeight: '700', letterSpacing: 1.1 },
  hudStatus: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  hudStatusText: { color: colors.radar, fontFamily: 'monospace', fontSize: 7, letterSpacing: 0.8 },
  statusDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.radar },
  hudLeftReadout: { position: 'absolute', top: '27%', left: spacing.sm, gap: 5 },
  hudRightReadout: { position: 'absolute', top: '27%', right: spacing.sm, gap: 5, alignItems: 'flex-end' },
  readoutText: { color: colors.radar, fontFamily: 'monospace', fontSize: 6, letterSpacing: 0.6 },
  sceneStatus: { position: 'absolute', top: '16%', left: 0, right: 0, height: 44, alignItems: 'center' },
  sceneStatusItem: { position: 'absolute', alignItems: 'center' },
  sceneEyebrow: { color: colors.radar, fontFamily: 'monospace', fontSize: 7, fontWeight: '700', letterSpacing: 1.5 },
  sceneMessage: { color: colors.textSecondary, fontFamily: 'monospace', fontSize: 8, fontWeight: '700', letterSpacing: 1.1, marginTop: 5 },
  alertEyebrow: { color: colors.warning, fontFamily: 'monospace', fontSize: 7, fontWeight: '800', letterSpacing: 1.5 },
  alertMessage: { color: colors.text, fontFamily: 'monospace', fontSize: 8, fontWeight: '800', letterSpacing: 1.1, marginTop: 5 },
  finalFrame: { position: 'absolute', left: spacing.xxl, right: spacing.xxl, bottom: '13%', flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  finalRule: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.radar },
  finalClassification: { color: colors.radar, fontFamily: 'monospace', fontSize: 7, fontWeight: '800', letterSpacing: 1.4 },
  footer: { height: 48, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  footerMessage: { position: 'absolute', flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  footerText: { color: colors.textMuted, fontFamily: 'monospace', fontSize: 7, fontWeight: '700', letterSpacing: 1.1 },
});
