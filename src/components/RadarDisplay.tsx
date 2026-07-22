import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from 'react-native';
import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons/static';
import Svg, { Circle, Line } from 'react-native-svg';
import { colors } from '@/constants/colors';

interface RadarDisplayProps {
  size?: number;
  active?: boolean;
}

const blips = [
  { left: '62%', top: '24%', rotate: '18deg', delay: 0 },
  { left: '23%', top: '56%', rotate: '-42deg', delay: 650 },
  { left: '69%', top: '67%', rotate: '104deg', delay: 1250 },
] as const;

export const RadarDisplay = ({ size = 300, active = true }: RadarDisplayProps) => {
  const rotation = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0.35)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  useEffect(() => {
    if (!active || reduceMotion) return;
    const rotationLoop = Animated.loop(
      Animated.timing(rotation, { toValue: 1, duration: 2600, easing: Easing.linear, useNativeDriver: true }),
    );
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.3, duration: 700, useNativeDriver: true }),
      ]),
    );
    rotationLoop.start();
    pulseLoop.start();
    return () => {
      rotationLoop.stop();
      pulseLoop.stop();
    };
  }, [active, pulse, reduceMotion, rotation]);

  const rotate = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 300 300">
        <Circle cx="150" cy="150" r="145" fill="rgba(54,241,161,0.025)" stroke="rgba(54,241,161,0.38)" strokeWidth="1" />
        <Circle cx="150" cy="150" r="108" fill="none" stroke="rgba(54,241,161,0.20)" strokeWidth="1" />
        <Circle cx="150" cy="150" r="72" fill="none" stroke="rgba(54,241,161,0.20)" strokeWidth="1" />
        <Circle cx="150" cy="150" r="36" fill="none" stroke="rgba(54,241,161,0.20)" strokeWidth="1" />
        <Line x1="5" y1="150" x2="295" y2="150" stroke="rgba(54,241,161,0.16)" strokeWidth="1" />
        <Line x1="150" y1="5" x2="150" y2="295" stroke="rgba(54,241,161,0.16)" strokeWidth="1" />
        <Line x1="47" y1="47" x2="253" y2="253" stroke="rgba(54,241,161,0.08)" strokeWidth="1" />
        <Line x1="253" y1="47" x2="47" y2="253" stroke="rgba(54,241,161,0.08)" strokeWidth="1" />
      </Svg>
      <Animated.View style={[styles.sweepArm, { height: size / 2, left: size / 2 - 1, top: 0, transform: [{ rotate }], transformOrigin: `1px ${size / 2}px` }]}>
        <View style={styles.sweepLine} />
        <View style={styles.sweepGlow} />
      </Animated.View>
      <View style={[styles.center, { left: size / 2 - 5, top: size / 2 - 5 }]} />
      {blips.map((blip, index) => (
        <Animated.View
          key={index}
          style={[styles.blip, { left: blip.left, top: blip.top, opacity: pulse, transform: [{ scale: pulse }] }]}
        >
          <MaterialCommunityIcons name="airplane" size={15} color={colors.radar} style={{ transform: [{ rotate: blip.rotate }] }} />
          <View style={styles.blipRing} />
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  sweepArm: { position: 'absolute', width: 2 },
  sweepLine: { width: 2, height: '100%', backgroundColor: colors.radar, opacity: 0.78 },
  sweepGlow: { position: 'absolute', left: -12, width: 26, height: '100%', backgroundColor: colors.radar10 },
  center: { position: 'absolute', width: 10, height: 10, borderRadius: 5, backgroundColor: colors.radar, borderWidth: 3, borderColor: colors.radar20 },
  blip: { position: 'absolute', width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  blipRing: { position: 'absolute', width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: colors.radar },
});
