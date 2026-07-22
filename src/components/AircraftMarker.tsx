import { StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons/static';
import { colors } from '@/constants/colors';
import { Aircraft } from '@/types/aircraft';

interface AircraftMarkerProps {
  aircraft: Aircraft;
  selected?: boolean;
}

export const AircraftMarker = ({ aircraft, selected = false }: AircraftMarkerProps) => {
  const accent = aircraft.isMilitary ? colors.warning : aircraft.source === 'sdr' ? colors.radar : colors.blue;
  return (
    <View style={styles.container}>
      {aircraft.isFavorite ? <MaterialCommunityIcons name="star" size={10} color={colors.warning} style={styles.star} /> : null}
      <View style={[styles.marker, { borderColor: accent, backgroundColor: selected ? accent : colors.overlay }]}> 
        <MaterialCommunityIcons
          name="airplane"
          size={selected ? 20 : 17}
          color={selected ? colors.background : accent}
          style={{ transform: [{ rotate: `${aircraft.heading - 45}deg` }] }}
        />
      </View>
      {selected ? <Text style={styles.callsign}>{aircraft.callsign}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', overflow: 'visible' },
  marker: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  star: { position: 'absolute', right: -1, top: -3, zIndex: 2 },
  callsign: { color: colors.text, backgroundColor: colors.overlay, fontSize: 9, fontWeight: '800', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 4, marginTop: 2 },
});
