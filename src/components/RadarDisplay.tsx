import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import { colors } from '@/constants/colors';

interface RadarDisplayProps {
  progress: Animated.Value;
  size?: number;
  active?: boolean;
  reduceMotion?: boolean;
}

interface BlipDefinition {
  x: number;
  y: number;
  rotation: number;
  detectionTime: number;
  label: string;
}

const CENTER = 180;
const OUTER_RADIUS = 166;

const aircraftBlips: BlipDefinition[] = [
  { x: 67, y: 25, rotation: 28, detectionTime: 450, label: 'A17' },
  { x: 25, y: 43, rotation: -54, detectionTime: 820, label: 'K09' },
  { x: 73, y: 69, rotation: 112, detectionTime: 1180, label: 'V31' },
  { x: 39, y: 76, rotation: -12, detectionTime: 1510, label: 'R06' },
];

const identificationDots = [
  { x: 82, y: 118, id: '07' },
  { x: 116, y: 62, id: '12' },
  { x: 248, y: 96, id: '21' },
  { x: 281, y: 173, id: '34' },
  { x: 224, y: 262, id: '41' },
  { x: 104, y: 276, id: '52' },
  { x: 62, y: 218, id: '63' },
];

const noiseMarks = Array.from({ length: 28 }, (_, index) => ({
  left: (index * 37 + 11) % 94,
  top: (index * 61 + 7) % 96,
  width: 1 + ((index * 13) % 3),
  opacity: 0.08 + ((index * 7) % 11) / 100,
}));

const polarPoint = (radius: number, angle: number) => {
  const radians = (angle * Math.PI) / 180;
  return {
    x: CENTER + radius * Math.cos(radians),
    y: CENTER + radius * Math.sin(radians),
  };
};

const FighterBlip = ({
  blip,
  progress,
  pulse,
  size,
}: {
  blip: BlipDefinition;
  progress: Animated.Value;
  pulse: Animated.Value;
  size: number;
}) => {
  const opacity = progress.interpolate({
    inputRange: [0, blip.detectionTime, blip.detectionTime + 100, blip.detectionTime + 330, 2200],
    outputRange: [0, 0.36, 1, 0.48, 0.32],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={[
        styles.blip,
        {
          left: (size * blip.x) / 100 - 15,
          top: (size * blip.y) / 100 - 15,
          opacity,
          transform: [{ rotate: `${blip.rotation}deg` }],
        },
      ]}
    >
      <Animated.View style={[styles.blipPulse, { opacity: pulse, transform: [{ scale: pulse }] }]} />
      <Svg width={20} height={20} viewBox="0 0 20 20">
        <Path
          d="M10 1.2 12 7.4 18.2 10 12 11.7 11.2 18.8 8.8 18.8 8 11.7 1.8 10 8 7.4Z"
          fill={colors.radar}
          stroke={colors.background}
          strokeWidth="0.7"
        />
      </Svg>
      <Text style={[styles.blipLabel, { transform: [{ rotate: `${-blip.rotation}deg` }] }]}>{blip.label}</Text>
    </Animated.View>
  );
};

export const RadarDisplay = ({
  progress,
  size = 360,
  active = true,
  reduceMotion = false,
}: RadarDisplayProps) => {
  const sweepRotation = useRef(new Animated.Value(0)).current;
  const noiseOpacity = useRef(new Animated.Value(0.14)).current;
  const blipPulse = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    if (!active || reduceMotion) {
      sweepRotation.setValue(0.15);
      noiseOpacity.setValue(0.12);
      blipPulse.setValue(0.65);
      return;
    }

    const sweep = Animated.loop(
      Animated.timing(sweepRotation, {
        toValue: 1,
        duration: 1180,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    const noise = Animated.loop(
      Animated.sequence([
        Animated.timing(noiseOpacity, { toValue: 0.3, duration: 90, useNativeDriver: true }),
        Animated.timing(noiseOpacity, { toValue: 0.09, duration: 150, useNativeDriver: true }),
        Animated.timing(noiseOpacity, { toValue: 0.2, duration: 110, useNativeDriver: true }),
      ]),
    );
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(blipPulse, { toValue: 1, duration: 360, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(blipPulse, { toValue: 0.35, duration: 520, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      ]),
    );

    sweep.start();
    noise.start();
    pulse.start();

    return () => {
      sweep.stop();
      noise.stop();
      pulse.stop();
    };
  }, [active, blipPulse, noiseOpacity, reduceMotion, sweepRotation]);

  const sweepRotate = sweepRotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const targetOpacity = progress.interpolate({
    inputRange: [0, 1750, 1880, 2540, 2840],
    outputRange: [0, 0, 1, 1, 0],
    extrapolate: 'clamp',
  });
  const targetTranslateX = progress.interpolate({
    inputRange: [1800, 2480, 2780],
    outputRange: [size * 0.2, size * 0.2, 0],
    extrapolate: 'clamp',
  });
  const targetTranslateY = progress.interpolate({
    inputRange: [1800, 2480, 2780],
    outputRange: [-size * 0.16, -size * 0.16, 0],
    extrapolate: 'clamp',
  });
  const bracketScale = progress.interpolate({
    inputRange: [1780, 2050, 2400, 2780],
    outputRange: [1.8, 1.35, 0.74, 0.45],
    extrapolate: 'clamp',
  });
  const targetCoreScale = progress.interpolate({
    inputRange: [1880, 2380, 2780],
    outputRange: [0.4, 1.2, 18],
    extrapolate: 'clamp',
  });
  const lockRingScale = progress.interpolate({
    inputRange: [1840, 2100, 2410, 2750],
    outputRange: [0.25, 1.35, 0.5, 2.5],
    extrapolate: 'clamp',
  });
  const lockRingOpacity = progress.interpolate({
    inputRange: [1800, 1950, 2300, 2740],
    outputRange: [0, 1, 0.35, 0],
    extrapolate: 'clamp',
  });

  return (
    <View accessibilityElementsHidden pointerEvents="none" style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 360 360">
        <Defs>
          <RadialGradient id="radarField" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0" stopColor={colors.radar} stopOpacity="0.08" />
            <Stop offset="0.72" stopColor={colors.radar} stopOpacity="0.025" />
            <Stop offset="1" stopColor={colors.background} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx={CENTER} cy={CENTER} r="174" fill="url(#radarField)" />
        <Circle cx={CENTER} cy={CENTER} r="168" fill="none" stroke={colors.radar} strokeOpacity="0.56" strokeWidth="1" />
        {[42, 84, 126].map(radius => (
          <Circle key={radius} cx={CENTER} cy={CENTER} r={radius} fill="none" stroke={colors.radar} strokeOpacity="0.2" strokeWidth="0.8" />
        ))}
        <Circle cx={CENTER} cy={CENTER} r="158" fill="none" stroke={colors.radar} strokeOpacity="0.13" strokeDasharray="2 7" />

        <G opacity="0.24">
          {Array.from({ length: 24 }, (_, index) => {
            const point = polarPoint(OUTER_RADIUS, index * 15);
            return <Line key={index} x1={CENTER} y1={CENTER} x2={point.x} y2={point.y} stroke={colors.radar} strokeWidth={index % 3 === 0 ? 0.8 : 0.35} />;
          })}
        </G>

        <G opacity="0.72">
          {Array.from({ length: 72 }, (_, index) => {
            const outer = polarPoint(168, index * 5);
            const inner = polarPoint(index % 6 === 0 ? 158 : 163, index * 5);
            return <Line key={index} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke={colors.radar} strokeWidth={index % 6 === 0 ? 1.1 : 0.45} />;
          })}
        </G>

        <G opacity="0.62">
          <Path d="M22 72V30H64 M296 30H338V72 M22 288V330H64 M296 330H338V288" fill="none" stroke={colors.radar} strokeWidth="1.4" />
          <Path d="M172 180H188 M180 172V188" fill="none" stroke={colors.radar} strokeWidth="1" />
        </G>

        {identificationDots.map(dot => (
          <G key={dot.id}>
            <Circle cx={dot.x} cy={dot.y} r="2.2" fill={colors.radar} fillOpacity="0.74" />
            <SvgText x={dot.x + 5} y={dot.y - 4} fill={colors.radar} fillOpacity="0.5" fontSize="6" fontFamily="monospace">
              {dot.id}
            </SvgText>
          </G>
        ))}

        <SvgText x="19" y="181" fill={colors.radar} fillOpacity="0.62" fontSize="7" fontFamily="monospace">270</SvgText>
        <SvgText x="329" y="181" fill={colors.radar} fillOpacity="0.62" fontSize="7" fontFamily="monospace">090</SvgText>
        <SvgText x="174" y="17" fill={colors.radar} fillOpacity="0.62" fontSize="7" fontFamily="monospace">000</SvgText>
        <SvgText x="174" y="350" fill={colors.radar} fillOpacity="0.62" fontSize="7" fontFamily="monospace">180</SvgText>
      </Svg>

      <Animated.View style={[styles.sweep, { width: size, height: size, transform: [{ rotate: sweepRotate }] }]}>
        <Svg width={size} height={size} viewBox="0 0 360 360">
          <Defs>
            <LinearGradient id="sweepGradient" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={colors.radar} stopOpacity="0.02" />
              <Stop offset="1" stopColor={colors.radar} stopOpacity="0.3" />
            </LinearGradient>
          </Defs>
          <Path d="M180 180 180 14 A166 166 0 0 1 258 34Z" fill="url(#sweepGradient)" />
          <Line x1="180" y1="180" x2="180" y2="14" stroke={colors.radar} strokeOpacity="0.88" strokeWidth="1.5" />
          <Circle cx="180" cy="180" r="3" fill={colors.radar} fillOpacity="0.95" />
        </Svg>
      </Animated.View>

      {aircraftBlips.map(blip => (
        <FighterBlip key={blip.label} blip={blip} progress={progress} pulse={blipPulse} size={size} />
      ))}

      <Animated.View
        style={[
          styles.targetTrack,
          {
            left: size / 2 - 38,
            top: size / 2 - 38,
            opacity: targetOpacity,
            transform: [
              { translateX: targetTranslateX },
              { translateY: targetTranslateY },
              { scale: bracketScale },
            ],
          },
        ]}
      >
        <View style={[styles.targetBracket, styles.targetBracketTopLeft]} />
        <View style={[styles.targetBracket, styles.targetBracketTopRight]} />
        <View style={[styles.targetBracket, styles.targetBracketBottomLeft]} />
        <View style={[styles.targetBracket, styles.targetBracketBottomRight]} />
        <Animated.View style={[styles.lockRing, { opacity: lockRingOpacity, transform: [{ scale: lockRingScale }] }]} />
        <Animated.View style={[styles.targetCore, { transform: [{ scale: targetCoreScale }] }]} />
        <Text style={styles.targetLabel}>UNKNOWN // 001</Text>
      </Animated.View>

      <Animated.View style={[styles.noise, { opacity: noiseOpacity }]}>
        {noiseMarks.map((mark, index) => (
          <View
            key={index}
            style={[
              styles.noiseMark,
              {
                left: (size * mark.left) / 100,
                top: (size * mark.top) / 100,
                width: mark.width,
                opacity: mark.opacity,
              },
            ]}
          />
        ))}
        {Array.from({ length: 13 }, (_, index) => (
          <View key={index} style={[styles.scanLine, { top: (size * (index + 1)) / 14 }]} />
        ))}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  sweep: { position: 'absolute' },
  blip: { position: 'absolute', width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  blipPulse: { position: 'absolute', width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: colors.radar },
  blipLabel: { position: 'absolute', top: -7, left: 21, color: colors.radar, fontFamily: 'monospace', fontSize: 6, letterSpacing: 0.5 },
  targetTrack: { position: 'absolute', width: 76, height: 76, alignItems: 'center', justifyContent: 'center' },
  targetBracket: { position: 'absolute', width: 18, height: 18, borderColor: colors.radar },
  targetBracketTopLeft: { top: 0, left: 0, borderTopWidth: 2, borderLeftWidth: 2 },
  targetBracketTopRight: { top: 0, right: 0, borderTopWidth: 2, borderRightWidth: 2 },
  targetBracketBottomLeft: { bottom: 0, left: 0, borderBottomWidth: 2, borderLeftWidth: 2 },
  targetBracketBottomRight: { right: 0, bottom: 0, borderRightWidth: 2, borderBottomWidth: 2 },
  lockRing: { position: 'absolute', width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: colors.radar },
  targetCore: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.radar },
  targetLabel: { position: 'absolute', left: 5, bottom: -18, width: 100, color: colors.radar, fontFamily: 'monospace', fontSize: 6, letterSpacing: 0.7 },
  noise: { ...StyleSheet.absoluteFillObject },
  noiseMark: { position: 'absolute', height: 1, backgroundColor: colors.radar },
  scanLine: { position: 'absolute', left: '5%', right: '5%', height: StyleSheet.hairlineWidth, backgroundColor: colors.radar },
});
