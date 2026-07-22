import { View, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons/static';
import { colors } from '@/constants/colors';

interface LogoMarkProps {
  size?: number;
}

export const LogoMark = ({ size = 56 }: LogoMarkProps) => (
  <View
    accessibilityElementsHidden
    style={[
      styles.shell,
      { width: size, height: size, borderRadius: size * 0.3 },
    ]}
  >
    <View style={[styles.orbit, { width: size * 0.72, height: size * 0.72, borderRadius: size }]} />
    <MaterialCommunityIcons name="airplane" size={size * 0.46} color={colors.radar} style={styles.jet} />
  </View>
);

const styles = StyleSheet.create({
  shell: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.radar10,
    borderColor: colors.radar,
    borderWidth: 1,
    transform: [{ rotate: '45deg' }],
  },
  orbit: {
    position: 'absolute',
    borderColor: colors.blueDim,
    borderWidth: 1,
  },
  jet: {
    transform: [{ rotate: '-45deg' }],
  },
});
