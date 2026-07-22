import { Animated, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, G, LinearGradient, Path, Stop } from 'react-native-svg';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

interface FalconRevealProps {
  progress: Animated.Value;
}

const FalconVector = () => (
  <Svg width={300} height={220} viewBox="0 0 300 220">
    <Defs>
      <LinearGradient id="falconMetal" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor={colors.textMuted} />
        <Stop offset="0.28" stopColor={colors.text} />
        <Stop offset="0.55" stopColor={colors.textSecondary} />
        <Stop offset="0.78" stopColor={colors.text} />
        <Stop offset="1" stopColor={colors.elevated} />
      </LinearGradient>
      <LinearGradient id="falconEdge" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor={colors.radar} stopOpacity="0.72" />
        <Stop offset="1" stopColor={colors.radar} stopOpacity="0.08" />
      </LinearGradient>
    </Defs>

    <Path
      d="M150 96C126 65 93 41 34 21c14 22 21 41 13 67L11 68c16 41 47 64 94 75-16 12-27 29-32 54 30-18 54-19 77-2 23-17 47-16 77 2-5-25-16-42-32-54 47-11 78-34 94-75l-36 20c-8-26-1-45 13-67-59 20-92 44-116 75Z"
      fill="url(#falconMetal)"
      stroke="url(#falconEdge)"
      strokeWidth="1.6"
    />
    <Path
      d="M150 62c-24-8-43 9-40 33 2 17 15 30 35 35l5 30 5-30c20-5 33-18 35-35 3-24-16-41-40-33Z"
      fill={colors.cardStrong}
      stroke={colors.textSecondary}
      strokeOpacity="0.78"
      strokeWidth="1.3"
    />
    <Path
      d="M150 68c-17-5-31 6-32 23 11-8 20-9 32-2 12-7 21-6 32 2-1-17-15-28-32-23Z"
      fill={colors.textSecondary}
      fillOpacity="0.62"
    />
    <Path d="m150 105-11 16 11 27 12-27Z" fill={colors.text} stroke={colors.radar} strokeOpacity="0.44" />
    <Path d="M120 94c9-8 19-8 28 1-12-3-19 1-27 8Z" fill={colors.background} />
    <Path d="M180 94c-9-8-19-8-28 1 12-3 19 1 27 8Z" fill={colors.background} />

    <G fill="none" stroke={colors.background} strokeOpacity="0.5" strokeWidth="1.2">
      <Path d="M44 48c30 32 54 52 86 68M29 78c33 25 60 39 96 48M55 112c24 15 43 22 67 28" />
      <Path d="M256 48c-30 32-54 52-86 68M271 78c-33 25-60 39-96 48M245 112c-24 15-43 22-67 28" />
    </G>
    <G fill="none" stroke={colors.text} strokeOpacity="0.28" strokeWidth="0.8">
      <Path d="M69 49c17 24 35 43 59 58M93 54c12 20 25 35 42 48M231 49c-17 24-35 43-59 58M207 54c-12 20-25 35-42 48" />
    </G>
    <Path d="M131 153 111 185l30-17 9 28 9-28 30 17-20-32" fill={colors.cardStrong} stroke={colors.radar} strokeOpacity="0.3" />
  </Svg>
);

const LaserEye = ({ left, opacity, scale }: { left: number; opacity: Animated.AnimatedInterpolation<number>; scale: Animated.AnimatedInterpolation<number> }) => (
  <Animated.View style={[styles.eyeGlow, { left, opacity, transform: [{ scale }] }]}>
    <View style={styles.eyeCore} />
  </Animated.View>
);

export const FalconReveal = ({ progress }: FalconRevealProps) => {
  const falconOpacity = progress.interpolate({
    inputRange: [0, 2180, 2420, 5000],
    outputRange: [0, 0, 1, 1],
    extrapolate: 'clamp',
  });
  const falconScale = progress.interpolate({
    inputRange: [2100, 2440, 2780, 3100],
    outputRange: [0.16, 0.45, 1.08, 1],
    extrapolate: 'clamp',
  });
  const falconTranslateY = progress.interpolate({
    inputRange: [2150, 2760, 3100],
    outputRange: [34, -8, 0],
    extrapolate: 'clamp',
  });
  const eyeOpacity = progress.interpolate({
    inputRange: [0, 3020, 3260, 3540, 5000],
    outputRange: [0, 0, 0.4, 1, 0.92],
    extrapolate: 'clamp',
  });
  const eyeScale = progress.interpolate({
    inputRange: [3000, 3310, 3560, 3920],
    outputRange: [0.35, 0.8, 1.75, 1.15],
    extrapolate: 'clamp',
  });
  const beamOpacity = progress.interpolate({
    inputRange: [0, 3420, 3560, 3890, 4110],
    outputRange: [0, 0, 1, 0.82, 0],
    extrapolate: 'clamp',
  });
  const beamScale = progress.interpolate({
    inputRange: [3400, 3640, 3970],
    outputRange: [0.02, 1, 1.12],
    extrapolate: 'clamp',
  });
  const flareOpacity = progress.interpolate({
    inputRange: [0, 3470, 3660, 3950, 4180],
    outputRange: [0, 0, 0.92, 0.44, 0],
    extrapolate: 'clamp',
  });
  const flareScale = progress.interpolate({
    inputRange: [3440, 3740, 4100],
    outputRange: [0.15, 1.25, 1.8],
    extrapolate: 'clamp',
  });
  const logoOpacity = progress.interpolate({
    inputRange: [0, 3660, 3910, 4250, 5000],
    outputRange: [0, 0, 0.65, 1, 1],
    extrapolate: 'clamp',
  });
  const logoTranslateY = progress.interpolate({
    inputRange: [3650, 4260],
    outputRange: [18, 0],
    extrapolate: 'clamp',
  });
  const logoScale = progress.interpolate({
    inputRange: [3660, 4120, 4350],
    outputRange: [0.96, 1.015, 1],
    extrapolate: 'clamp',
  });

  return (
    <View pointerEvents="none" style={styles.stage}>
      <Animated.View
        style={[
          styles.falcon,
          {
            opacity: falconOpacity,
            transform: [{ translateY: falconTranslateY }, { scale: falconScale }],
          },
        ]}
      >
        <View style={styles.falconBloomOuter} />
        <View style={styles.falconBloomInner} />
        <FalconVector />

        <Animated.View style={[styles.laserGlow, { opacity: beamOpacity, transform: [{ scaleX: beamScale }] }]} />
        <Animated.View style={[styles.laserCore, { opacity: beamOpacity, transform: [{ scaleX: beamScale }] }]} />
        <Animated.View style={[styles.flare, { opacity: flareOpacity, transform: [{ scale: flareScale }] }]}>
          <View style={styles.flareHorizontal} />
          <View style={styles.flareVertical} />
        </Animated.View>
        <LaserEye left={119} opacity={eyeOpacity} scale={eyeScale} />
        <LaserEye left={169} opacity={eyeOpacity} scale={eyeScale} />
      </Animated.View>

      <Animated.View
        style={[
          styles.logo,
          {
            opacity: logoOpacity,
            transform: [{ translateY: logoTranslateY }, { scale: logoScale }],
          },
        ]}
      >
        <View style={styles.logoRule} />
        <Text style={styles.logoTitle}>Falcon Intelligence</Text>
        <Text style={styles.logoSubtitle}>TACTICAL AIRSPACE COMMAND</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  stage: { width: 380, height: 360, alignItems: 'center' },
  falcon: { position: 'absolute', top: 0, width: 300, height: 220, alignItems: 'center' },
  falconBloomOuter: { position: 'absolute', left: 35, top: 10, width: 230, height: 200, borderRadius: 115, backgroundColor: colors.radar10, opacity: 0.38 },
  falconBloomInner: { position: 'absolute', left: 75, top: 42, width: 150, height: 130, borderRadius: 75, backgroundColor: colors.radar20, opacity: 0.22 },
  eyeGlow: { position: 'absolute', top: 94, width: 12, height: 7, borderRadius: 6, backgroundColor: colors.radar20, alignItems: 'center', justifyContent: 'center' },
  eyeCore: { width: 7, height: 3, borderRadius: 2, backgroundColor: colors.radar, shadowColor: colors.radar, shadowOpacity: 1, shadowRadius: 8, elevation: 7 },
  laserGlow: { position: 'absolute', left: -100, top: 96, width: 500, height: 10, backgroundColor: colors.radar20 },
  laserCore: { position: 'absolute', left: -100, top: 100, width: 500, height: 2, backgroundColor: colors.radar, shadowColor: colors.radar, shadowOpacity: 1, shadowRadius: 8, elevation: 8 },
  flare: { position: 'absolute', left: 110, top: 61, width: 80, height: 80, borderRadius: 40, backgroundColor: colors.radar20, alignItems: 'center', justifyContent: 'center' },
  flareHorizontal: { width: 150, height: 1, backgroundColor: colors.text },
  flareVertical: { position: 'absolute', width: 1, height: 90, backgroundColor: colors.radar },
  logo: { position: 'absolute', top: 230, alignItems: 'center' },
  logoRule: { width: 112, height: 1, backgroundColor: colors.radar, marginBottom: spacing.md, opacity: 0.72 },
  logoTitle: { color: colors.text, fontSize: 29, lineHeight: 36, fontWeight: '800', letterSpacing: 2.2, textAlign: 'center', textShadowColor: colors.radar20, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 9 },
  logoSubtitle: { color: colors.radar, fontSize: 8, fontWeight: '800', letterSpacing: 2.6, marginTop: spacing.xs },
});
