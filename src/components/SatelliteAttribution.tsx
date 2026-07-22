import { Linking, Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import { SATELLITE_PROVIDER_URL } from '@/constants/satelliteMap';

interface SatelliteAttributionProps {
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const SatelliteAttribution = ({ compact = false, style }: SatelliteAttributionProps) => (
  <Pressable
    accessibilityRole="link"
    accessibilityLabel="EOxCloudless by EOX IT Services GmbH, containing modified Copernicus Sentinel data 2025"
    onPress={(event) => {
      event.stopPropagation();
      Linking.openURL(SATELLITE_PROVIDER_URL).catch(() => undefined);
    }}
    style={[styles.container, style]}
  >
    <Text numberOfLines={compact ? 1 : 2} style={[styles.text, compact && styles.compactText]}>
      {compact
        ? 'EOxCloudless · EOX · Copernicus 2025'
        : 'EOxCloudless by EOX IT Services GmbH\nModified Copernicus Sentinel data 2025'}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(4,11,24,0.78)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  text: { color: 'rgba(255,255,255,0.76)', fontSize: 7, fontWeight: '600', lineHeight: 10, textAlign: 'right' },
  compactText: { fontSize: 6.5, lineHeight: 8 },
});
