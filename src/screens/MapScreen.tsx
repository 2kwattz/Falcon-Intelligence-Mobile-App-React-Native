import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Camera, CameraRef, Map, Marker } from '@maplibre/maplibre-react-native';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons/static';
import { AircraftMarker } from '@/components/AircraftMarker';
import { EmptyState } from '@/components/EmptyState';
import { SatelliteAttribution } from '@/components/SatelliteAttribution';
import { colors } from '@/constants/colors';
import { SATELLITE_CENTER, SATELLITE_INITIAL_ZOOM, satelliteMapStyle } from '@/constants/satelliteMap';
import { radius, spacing } from '@/constants/spacing';
import { useAircraftData } from '@/hooks/useAircraftData';
import { MainTabParamList, RootStackParamList } from '@/navigation/navigationTypes';
import { Aircraft, AircraftSource } from '@/types/aircraft';
import { formatAltitude } from '@/utils/formatting';

type Props = BottomTabScreenProps<MainTabParamList, 'Map'>;

const filterOptions: Array<{ id: AircraftSource; label: string }> = [
  { id: 'sdr', label: 'SDR Receiver' },
  { id: 'opensky', label: 'OpenSky' },
];

const sourceDetails: Record<AircraftSource, { label: string; color: string }> = {
  adsb: { label: 'LIVE ADS-B FEED', color: colors.radar },
  sdr: { label: 'LOCAL SDR RECEIVER', color: colors.radar },
  opensky: { label: 'OPENSKY NETWORK', color: colors.blue },
};

const LegendItem = ({ color, label }: { color: string; label: string }) => (
  <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: color }]} /><Text style={styles.legendText}>{label}</Text></View>
);

const formatLastSeen = (timestamp: string): string => {
  const elapsedSeconds = Math.max(0, Math.round((Date.now() - new Date(timestamp).getTime()) / 1_000));
  return elapsedSeconds < 60 ? `${elapsedSeconds}s ago` : `${Math.round(elapsedSeconds / 60)}m ago`;
};

const DataOnlyAircraft = ({ aircraft, onPress }: { aircraft: Aircraft; onPress: () => void }) => {
  const source = sourceDetails[aircraft.source];

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`View ${aircraft.callsign} details`} onPress={onPress} style={styles.dataOnlyCard}>
      <View style={[styles.dataOnlyDot, { backgroundColor: source.color }]} />
      <Text numberOfLines={1} style={styles.dataOnlyCallsign}>{aircraft.callsign}</Text>
      <Text numberOfLines={1} style={styles.dataOnlyModel}>{aircraft.model}</Text>
      <Text style={styles.dataOnlySource}>{source.label}</Text>
    </Pressable>
  );
};

const AircraftDetails = ({ aircraft, onClose }: { aircraft: Aircraft; onClose: () => void }) => (
  <View style={styles.details}>
    <View style={styles.detailsAccent} />
    <View style={styles.detailsHeader}>
      <View style={styles.detailsIdentity}>
        <View style={[styles.detailsIcon, { backgroundColor: aircraft.isMilitary ? 'rgba(255,181,71,0.12)' : colors.blue12 }]}>
          <MaterialCommunityIcons name="airplane" size={22} color={aircraft.isMilitary ? colors.warning : colors.blue} />
        </View>
        <View>
          <View style={styles.inline}><Text style={styles.callsign}>{aircraft.callsign}</Text>{aircraft.isMilitary ? <Text style={styles.military}>MILITARY</Text> : null}</View>
          <Text style={styles.model}>{aircraft.model}</Text>
        </View>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="Close aircraft details" hitSlop={10} onPress={onClose}>
        <Ionicons name="close" size={22} color={colors.textSecondary} />
      </Pressable>
    </View>
    <View style={styles.detailsGrid}>
      <View><Text style={styles.dataValue}>{formatAltitude(aircraft.altitudeFt)}</Text><Text style={styles.dataLabel}>ALTITUDE</Text></View>
      <View><Text style={styles.dataValue}>{aircraft.speedKts} kt</Text><Text style={styles.dataLabel}>GROUND SPEED</Text></View>
      <View><Text style={styles.dataValue}>{aircraft.heading}°</Text><Text style={styles.dataLabel}>HEADING</Text></View>
      <View><Text style={styles.dataValue}>{formatLastSeen(aircraft.lastSeen)}</Text><Text style={styles.dataLabel}>LAST SEEN</Text></View>
    </View>
    <View style={styles.sourceRow}>
      <View style={[styles.sourceDot, { backgroundColor: sourceDetails[aircraft.source].color }]} />
      <Text style={styles.sourceText}>
        {sourceDetails[aircraft.source].label} • ICAO {aircraft.icao24}{aircraft.hasPosition === false ? ' • NO MAP POSITION' : ''}
      </Text>
    </View>
  </View>
);

export const MapScreen = ({ navigation }: Props) => {
  const cameraRef = useRef<CameraRef>(null);
  const hasCenteredLiveFeed = useRef(false);
  const { aircraft, dataOnlyAircraft, visibleAircraft, enabledSources, toggleSource, isLoading, error, retry } = useAircraftData();
  const [selected, setSelected] = useState<Aircraft | null>(null);

  useEffect(() => {
    if (selected && !visibleAircraft.some((item) => item.id === selected.id)) setSelected(null);
  }, [selected, visibleAircraft]);

  useEffect(() => {
    const firstAircraft = aircraft[0];
    if (!firstAircraft || hasCenteredLiveFeed.current) return;

    cameraRef.current?.easeTo({ center: [firstAircraft.longitude, firstAircraft.latitude], zoom: 6, duration: 450 });
    hasCenteredLiveFeed.current = true;
  }, [aircraft]);

  const openSatellite = () => {
    navigation.getParent<NativeStackNavigationProp<RootStackParamList>>()?.navigate('Satellite');
  };

  const openAirForceDatabase = () => {
    navigation.getParent<NativeStackNavigationProp<RootStackParamList>>()?.navigate('AirForceDatabase');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <Map
        style={StyleSheet.absoluteFill}
        mapStyle={satelliteMapStyle}
        attribution={false}
        logo={false}
        compass={false}
        onPress={() => setSelected(null)}
      >
        <Camera
          ref={cameraRef}
          initialViewState={{ center: SATELLITE_CENTER, zoom: SATELLITE_INITIAL_ZOOM }}
          minZoom={2}
          maxZoom={18}
        />
        {aircraft.map((item) => {
          const isSelected = selected?.id === item.id;
          return (
            <Marker
              key={`${item.source}-${item.icao24}`}
              id={`${item.source}-${item.icao24}`}
              lngLat={[item.longitude, item.latitude]}
              onPress={(event) => {
                event.stopPropagation();
                setSelected(item);
              }}
            >
              <AircraftMarker aircraft={item} selected={isSelected} />
            </Marker>
          );
        })}
      </Map>
      <View style={styles.mapTint} pointerEvents="none" />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.eyebrow}>TACTICAL AIRSPACE</Text>
            <Text style={styles.title}>Live Map</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable accessibilityRole="button" accessibilityLabel="Open Indian Air Force database" onPress={openAirForceDatabase} style={styles.roundButton}>
              <MaterialCommunityIcons name="database-search-outline" size={19} color={colors.warning} />
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Open satellite intelligence" onPress={openSatellite} style={styles.roundButton}>
              <MaterialCommunityIcons name="satellite-variant" size={19} color={colors.text} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Recenter map"
              onPress={() => cameraRef.current?.easeTo({ center: SATELLITE_CENTER, zoom: SATELLITE_INITIAL_ZOOM, duration: 450 })}
              style={styles.roundButton}
            >
              <MaterialCommunityIcons name="crosshairs-gps" size={20} color={colors.radar} />
            </Pressable>
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {filterOptions.map((option) => (
            <Pressable
              key={option.id}
              accessibilityRole="button"
              accessibilityState={{ selected: enabledSources.has(option.id) }}
              onPress={() => toggleSource(option.id)}
              style={[styles.filter, enabledSources.has(option.id) && styles.filterActive]}
            >
              <Text style={[styles.filterText, enabledSources.has(option.id) && styles.filterTextActive]}>{option.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.trackBadge}>
        <View style={styles.scanDot} />
        <Text style={styles.trackCount}>
          {isLoading ? 'SCANNING' : `${aircraft.length} MAP TRACKS${dataOnlyAircraft.length ? ` • ${dataOnlyAircraft.length} DATA ONLY` : ''}`}
        </Text>
      </View>
      <SatelliteAttribution style={styles.attribution} />

      {!selected && dataOnlyAircraft.length > 0 ? (
        <View style={styles.dataOnlyPanel}>
          <View style={styles.dataOnlyHeader}>
            <MaterialCommunityIcons name="crosshairs-question" size={15} color={colors.warning} />
            <Text style={styles.dataOnlyTitle}>DATA ONLY • NO MAP POSITION</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dataOnlyList}>
            {dataOnlyAircraft.map((item) => <DataOnlyAircraft key={item.id} aircraft={item} onPress={() => setSelected(item)} />)}
          </ScrollView>
        </View>
      ) : null}

      {error ? (
        <View style={styles.errorPanel}>
          <EmptyState icon="radar" title="Feed interrupted" message={error} actionLabel="Reconnect" onAction={retry} />
        </View>
      ) : null}

      {!selected && !error ? (
        <View style={styles.legend}>
          {filterOptions.filter((option) => enabledSources.has(option.id)).map((option) => (
            <LegendItem key={option.id} color={sourceDetails[option.id].color} label={option.label} />
          ))}
        </View>
      ) : null}
      {selected ? <AircraftDetails aircraft={selected} onClose={() => setSelected(null)} /> : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  mapTint: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(2,8,17,0.08)' },
  header: { position: 'absolute', top: 0, left: 0, right: 0, paddingTop: spacing.md, paddingHorizontal: spacing.md, paddingBottom: spacing.sm, backgroundColor: 'rgba(4,11,24,0.88)' },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { color: colors.radar, fontSize: 9, fontWeight: '800', letterSpacing: 1.6 },
  title: { color: colors.text, fontSize: 24, fontWeight: '800', marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: spacing.xs },
  roundButton: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  filters: { gap: spacing.xs, paddingTop: spacing.md, paddingRight: spacing.lg },
  filter: { paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  filterActive: { backgroundColor: colors.radar, borderColor: colors.radar },
  filterText: { color: colors.textSecondary, fontSize: 11, fontWeight: '700' },
  filterTextActive: { color: colors.background },
  trackBadge: { position: 'absolute', top: 139, left: spacing.md, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: colors.overlay, borderWidth: 1, borderColor: colors.border },
  attribution: { position: 'absolute', top: 139, right: spacing.md },
  scanDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.radar },
  trackCount: { color: colors.text, fontSize: 9, fontWeight: '800', letterSpacing: 0.7 },
  dataOnlyPanel: { position: 'absolute', top: 178, left: spacing.md, right: spacing.md, backgroundColor: colors.overlay, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingVertical: spacing.sm },
  dataOnlyHeader: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: spacing.sm },
  dataOnlyTitle: { color: colors.warning, fontSize: 8, fontWeight: '900', letterSpacing: 0.7 },
  dataOnlyList: { gap: spacing.xs, paddingHorizontal: spacing.sm, paddingTop: spacing.sm },
  dataOnlyCard: { width: 155, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, padding: spacing.sm },
  dataOnlyDot: { width: 5, height: 5, borderRadius: 3, position: 'absolute', top: spacing.sm, right: spacing.sm },
  dataOnlyCallsign: { color: colors.text, fontSize: 11, fontWeight: '800', paddingRight: spacing.sm },
  dataOnlyModel: { color: colors.textSecondary, fontSize: 8, marginTop: 3 },
  dataOnlySource: { color: colors.textMuted, fontSize: 7, fontWeight: '800', letterSpacing: 0.5, marginTop: spacing.xs },
  legend: { position: 'absolute', left: spacing.md, right: spacing.md, bottom: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.overlay, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingVertical: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 6, height: 6, borderRadius: 3 },
  legendText: { color: colors.textSecondary, fontSize: 9, fontWeight: '600' },
  errorPanel: { position: 'absolute', left: spacing.md, right: spacing.md, top: '34%', backgroundColor: colors.overlay, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  details: { position: 'absolute', left: spacing.md, right: spacing.md, bottom: spacing.md, backgroundColor: colors.overlay, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.lg, padding: spacing.md, overflow: 'hidden' },
  detailsAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 2, backgroundColor: colors.radar },
  detailsHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  detailsIdentity: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  detailsIcon: { width: 44, height: 44, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  inline: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  callsign: { color: colors.text, fontSize: 17, fontWeight: '800' },
  military: { color: colors.warning, fontSize: 7, fontWeight: '900', letterSpacing: 0.8, paddingHorizontal: 5, paddingVertical: 3, borderRadius: 4, backgroundColor: 'rgba(255,181,71,0.12)' },
  model: { color: colors.textSecondary, fontSize: 11, marginTop: 3 },
  detailsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md, paddingVertical: spacing.md, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border },
  dataValue: { color: colors.text, fontSize: 12, fontWeight: '800' },
  dataLabel: { color: colors.textMuted, fontSize: 7, fontWeight: '700', letterSpacing: 0.7, marginTop: 3 },
  sourceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.sm },
  sourceDot: { width: 6, height: 6, borderRadius: 3 },
  sourceText: { color: colors.textMuted, fontSize: 8, fontWeight: '700', letterSpacing: 0.5, flex: 1 },
});
