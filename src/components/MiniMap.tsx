import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Camera, Map, Marker } from '@maplibre/maplibre-react-native';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import { AircraftMarker } from './AircraftMarker';
import { SatelliteAttribution } from './SatelliteAttribution';
import { colors } from '@/constants/colors';
import { SATELLITE_CENTER, SATELLITE_INITIAL_ZOOM, satelliteMapStyle } from '@/constants/satelliteMap';
import { radius, spacing } from '@/constants/spacing';
import { Aircraft } from '@/types/aircraft';

interface MiniMapProps {
  aircraft: Aircraft[];
  onOpen: () => void;
}

export const MiniMap = ({ aircraft, onOpen }: MiniMapProps) => (
  <Pressable accessibilityRole="button" accessibilityLabel="Open live aircraft map" onPress={onOpen} style={styles.container}>
    <Map
      style={StyleSheet.absoluteFill}
      mapStyle={satelliteMapStyle}
      attribution={false}
      logo={false}
      compass={false}
      dragPan={false}
      touchZoom={false}
      doubleTapZoom={false}
      doubleTapHoldZoom={false}
      touchRotate={false}
      touchPitch={false}
      pointerEvents="none"
    >
      <Camera initialViewState={{ center: SATELLITE_CENTER, zoom: SATELLITE_INITIAL_ZOOM }} />
      {aircraft.slice(0, 5).map((item) => (
        <Marker key={item.icao24} id={`mini-${item.icao24}`} lngLat={[item.longitude, item.latitude]}>
          <AircraftMarker aircraft={item} />
        </Marker>
      ))}
    </Map>
    <View style={styles.fade} pointerEvents="none" />
    <View style={styles.topBar} pointerEvents="none">
      <View style={styles.liveBadge}><View style={styles.liveDot} /><Text style={styles.liveText}>LIVE</Text></View>
      <Text style={styles.count}>{aircraft.length} tracks</Text>
    </View>
    <SatelliteAttribution compact style={styles.attribution} />
    <View style={styles.open} pointerEvents="none">
      <Text style={styles.openText}>Open tactical map</Text>
      <Ionicons name="arrow-forward" size={16} color={colors.radar} />
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  container: { height: 190, borderRadius: radius.md, overflow: 'hidden', borderWidth: 1, borderColor: colors.borderStrong },
  fade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(4,11,24,0.12)' },
  topBar: { position: 'absolute', top: spacing.sm, left: spacing.sm, right: spacing.sm, flexDirection: 'row', justifyContent: 'space-between' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 5, backgroundColor: colors.overlay },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.radar },
  liveText: { color: colors.radar, fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  count: { color: colors.text, fontSize: 10, fontWeight: '700', backgroundColor: colors.overlay, borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 5 },
  attribution: { position: 'absolute', top: 42, right: spacing.sm },
  open: { position: 'absolute', bottom: spacing.sm, left: spacing.sm, right: spacing.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.overlay, borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 10 },
  openText: { color: colors.text, fontSize: 12, fontWeight: '700' },
});
