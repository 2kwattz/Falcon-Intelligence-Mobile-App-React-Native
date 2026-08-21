import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons/static';
import { EmptyState } from '@/components/EmptyState';
import { LoadingState } from '@/components/LoadingState';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';
import { useTrackedAircraftArchive } from '@/hooks/useTrackedAircraftArchive';
import { TrackedAircraft } from '@/types/trackedAircraft';
import { formatAltitude } from '@/utils/formatting';

type TimeWindow = '24h' | '72h' | '5d' | 'all';
type AltitudeFilter = 'all' | 'airborne' | 'high' | 'ground';
type PositionFilter = 'all' | 'positioned' | 'unpositioned';
type SortOrder = 'recent' | 'oldest' | 'altitude' | 'speed';

interface ArchiveDateSection {
  key: string;
  day: string;
  monthYear: string;
  weekday: string;
  data: TrackedAircraft[];
}

const timeOptions: Array<{ id: TimeWindow; label: string }> = [
  { id: '24h', label: 'Last 24h' },
  { id: '72h', label: 'Last 3d' },
  { id: '5d', label: 'Last 5d' },
  { id: 'all', label: 'All archive' },
];

const altitudeOptions: Array<{ id: AltitudeFilter; label: string }> = [
  { id: 'all', label: 'Any altitude' },
  { id: 'airborne', label: 'Airborne' },
  { id: 'high', label: '25,000 ft +' },
  { id: 'ground', label: 'Ground / unknown' },
];

const positionOptions: Array<{ id: PositionFilter; label: string }> = [
  { id: 'all', label: 'Any position' },
  { id: 'positioned', label: 'Position reports' },
  { id: 'unpositioned', label: 'No position' },
];

const sortOptions: Array<{ id: SortOrder; label: string }> = [
  { id: 'recent', label: 'Newest first' },
  { id: 'oldest', label: 'Oldest first' },
  { id: 'altitude', label: 'Highest altitude' },
  { id: 'speed', label: 'Fastest' },
];

const timeCutoff = (window: TimeWindow): number | null => {
  if (window === 'all') return null;
  const hours = window === '24h' ? 24 : window === '72h' ? 72 : 120;
  return Date.now() - hours * 60 * 60 * 1_000;
};

const formatArchiveTime = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Time unavailable';
  const elapsedMinutes = Math.max(0, Math.round((Date.now() - date.getTime()) / 60_000));
  if (elapsedMinutes < 1) return 'just now';
  if (elapsedMinutes < 60) return `${elapsedMinutes}m ago`;
  if (elapsedMinutes < 1_440) return `${Math.round(elapsedMinutes / 60)}h ago`;
  return `${Math.floor(elapsedMinutes / 1_440)}d ago`;
};

const formatArchiveDateTime = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date and time unavailable';
  return new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
};

const dateTimestamp = (value: string): number => {
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const archiveDateParts = (value: string): Omit<ArchiveDateSection, 'data'> => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return { key: 'unknown-date', day: '—', monthYear: 'DATE UNAVAILABLE', weekday: 'UNCLASSIFIED' };
  }

  const key = [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((part) => `${part}`.padStart(2, '0'))
    .join('-');
  return {
    key,
    day: new Intl.DateTimeFormat(undefined, { day: '2-digit' }).format(date),
    monthYear: new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(date).toUpperCase(),
    weekday: new Intl.DateTimeFormat(undefined, { weekday: 'long' }).format(date).toUpperCase(),
  };
};

const formatArchiveClockTime = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Time unavailable';
  return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(date);
};

const FilterChip = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => (
  <Pressable accessibilityRole="button" onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
    <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
  </Pressable>
);

const DataPoint = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.dataPoint}>
    <Text style={styles.dataValue}>{value}</Text>
    <Text style={styles.dataLabel}>{label}</Text>
  </View>
);

const ArchiveListSeparator = () => <View style={styles.separator} />;

const DetailField = ({ label, value, fullWidth = false }: { label: string; value: string; fullWidth?: boolean }) => (
  <View style={[styles.detailField, fullWidth && styles.detailFieldFull]}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text selectable style={styles.detailValue}>{value}</Text>
  </View>
);

const AircraftRecord = ({ aircraft, onViewMore }: { aircraft: TrackedAircraft; onViewMore: () => void }) => {
  const hasPosition = aircraft.latitude !== null && aircraft.longitude !== null;
  const isAirborne = (aircraft.altitudeFt ?? 0) > 0;
  const identity = aircraft.callsign || aircraft.registration || aircraft.hex;

  return (
    <View style={styles.record}>
      <View style={styles.recordHeader}>
        <View style={[styles.aircraftIcon, isAirborne ? styles.aircraftIconAirborne : styles.aircraftIconGround]}>
          <MaterialCommunityIcons name="airplane" size={21} color={isAirborne ? colors.radar : colors.textSecondary} />
        </View>
        <View style={styles.identity}>
          <Text numberOfLines={1} style={styles.callsign}>{identity}</Text>
          <Text numberOfLines={1} style={styles.aircraftDescription}>{aircraft.description}</Text>
        </View>
        <View style={styles.typeBadge}><Text style={styles.typeBadgeText}>{aircraft.aircraftType}</Text></View>
      </View>

      <View style={styles.recordMeta}>
        <Text style={styles.hex}>ICAO {aircraft.hex}</Text>
        {aircraft.registration ? <Text style={styles.registration}>{aircraft.registration}</Text> : null}
        <View style={styles.trackedAt}><View style={styles.trackedDot} /><Text style={styles.trackedAtText}>{formatArchiveTime(aircraft.trackedAt)}</Text></View>
      </View>
      <Text style={styles.trackedDate}>DETECTED {formatArchiveClockTime(aircraft.trackedAt)}</Text>

      <View style={styles.rule} />
      <View style={styles.dataRow}>
        <DataPoint label="ALTITUDE" value={aircraft.altitudeFt === null ? '—' : formatAltitude(aircraft.altitudeFt)} />
        <DataPoint label="SPEED" value={aircraft.groundSpeedKts === null ? '—' : `${Math.round(aircraft.groundSpeedKts)} kt`} />
        <DataPoint label="HEADING" value={aircraft.heading === null ? '—' : `${Math.round(aircraft.heading)}°`} />
      </View>
      <View style={styles.footerRow}>
        <Text style={styles.positionText}>{hasPosition ? `${aircraft.latitude?.toFixed(3)}, ${aircraft.longitude?.toFixed(3)}` : 'Position not received'}</Text>
        <Text style={styles.messageText}>{aircraft.messages?.toLocaleString() ?? '—'} MSG</Text>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={`View details for ${identity}`} onPress={onViewMore} style={styles.viewMoreButton}>
        <Text style={styles.viewMoreText}>View more</Text>
        <Ionicons name="arrow-forward" size={13} color={colors.radar} />
      </Pressable>
    </View>
  );
};

const AircraftDetailSheet = ({ aircraft, onClose }: { aircraft: TrackedAircraft | null; onClose: () => void }) => {
  if (!aircraft) return null;
  const identity = aircraft.callsign || aircraft.registration || aircraft.hex;
  const hasPosition = aircraft.latitude !== null && aircraft.longitude !== null;

  return (
    <Modal transparent animationType="slide" visible={Boolean(aircraft)} onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close aircraft details" onPress={onClose} style={styles.modalBackdrop} />
        <SafeAreaView edges={['bottom']} style={styles.sheetSafeArea}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <View style={styles.sheetIdentity}>
                <View style={styles.sheetIcon}><MaterialCommunityIcons name="airplane" size={23} color={colors.radar} /></View>
                <View style={styles.identity}>
                  <Text numberOfLines={1} style={styles.sheetTitle}>{identity}</Text>
                  <Text numberOfLines={1} style={styles.sheetSubtitle}>{aircraft.description}</Text>
                </View>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel="Close aircraft details" hitSlop={10} onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={21} color={colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
              <View style={styles.detectionPanel}>
                <View style={styles.detectedRow}><View style={styles.trackedDot} /><Text style={styles.detectedLabel}>DETECTED AT</Text></View>
                <Text style={styles.detectedTime}>{formatArchiveDateTime(aircraft.trackedAt)}</Text>
                <Text style={styles.detectedAgo}>{formatArchiveTime(aircraft.trackedAt)}</Text>
              </View>

              <Text style={styles.detailSectionTitle}>IDENTITY</Text>
              <View style={styles.detailGrid}>
                <DetailField label="ICAO / HEX" value={aircraft.hex} />
                <DetailField label="AIRCRAFT TYPE" value={aircraft.aircraftType} />
                <DetailField label="CALLSIGN" value={aircraft.callsign || 'Not broadcast'} />
                <DetailField label="REGISTRATION" value={aircraft.registration || 'Not broadcast'} />
                <DetailField label="DATA SOURCE" value={aircraft.source.toUpperCase()} fullWidth />
              </View>

              <Text style={styles.detailSectionTitle}>FLIGHT DATA</Text>
              <View style={styles.detailGrid}>
                <DetailField label="ALTITUDE" value={aircraft.altitudeFt === null ? 'Not received' : formatAltitude(aircraft.altitudeFt)} />
                <DetailField label="GROUND SPEED" value={aircraft.groundSpeedKts === null ? 'Not received' : `${Math.round(aircraft.groundSpeedKts)} kt`} />
                <DetailField label="HEADING" value={aircraft.heading === null ? 'Not received' : `${Math.round(aircraft.heading)}°`} />
                <DetailField label="VERTICAL RATE" value={aircraft.verticalRateFpm === null ? 'Not received' : `${Math.round(aircraft.verticalRateFpm)} ft/min`} />
              </View>

              <Text style={styles.detailSectionTitle}>RECEIVER DATA</Text>
              <View style={styles.detailGrid}>
                <DetailField label="POSITION" value={hasPosition ? `${aircraft.latitude?.toFixed(5)}, ${aircraft.longitude?.toFixed(5)}` : 'Not received'} fullWidth />
                <DetailField label="SIGNAL" value={aircraft.signalDb === null ? 'Not received' : `${aircraft.signalDb.toFixed(1)} dB`} />
                <DetailField label="MESSAGES" value={aircraft.messages?.toLocaleString() ?? 'Not received'} />
              </View>
            </ScrollView>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

export const TrackedAircraftArchiveScreen = () => {
  const { data, isLoading, isRefreshing, error, refresh, retry } = useTrackedAircraftArchive();
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('5d');
  const [altitude, setAltitude] = useState<AltitudeFilter>('all');
  const [position, setPosition] = useState<PositionFilter>('all');
  const [sort, setSort] = useState<SortOrder>('recent');
  const [selectedAircraft, setSelectedAircraft] = useState<TrackedAircraft | null>(null);

  const topTypes = useMemo(() => Object.entries(data?.aircraftTypeCounts ?? {})
    .sort(([, first], [, second]) => second - first)
    .slice(0, 7), [data?.aircraftTypeCounts]);

  const visibleAircraft = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const cutoff = timeCutoff(timeWindow);
    const filtered = (data?.aircraft ?? []).filter((item) => {
      const timestamp = new Date(item.trackedAt).getTime();
      const matchesTime = cutoff === null || (!Number.isNaN(timestamp) && timestamp >= cutoff);
      const matchesQuery = !normalizedQuery || [item.hex, item.registration, item.callsign, item.aircraftType, item.description]
        .some((value) => value.toLowerCase().includes(normalizedQuery));
      const matchesType = selectedType === 'all' || item.aircraftType === selectedType;
      const altitudeValue = item.altitudeFt ?? 0;
      const matchesAltitude = altitude === 'all'
        || (altitude === 'airborne' && altitudeValue > 0)
        || (altitude === 'high' && altitudeValue >= 25_000)
        || (altitude === 'ground' && altitudeValue <= 0);
      const hasPosition = item.latitude !== null && item.longitude !== null;
      const matchesPosition = position === 'all'
        || (position === 'positioned' && hasPosition)
        || (position === 'unpositioned' && !hasPosition);
      return matchesTime && matchesQuery && matchesType && matchesAltitude && matchesPosition;
    });

    return filtered.sort((first, second) => {
      if (sort === 'altitude') return (second.altitudeFt ?? -1) - (first.altitudeFt ?? -1);
      if (sort === 'speed') return (second.groundSpeedKts ?? -1) - (first.groundSpeedKts ?? -1);
      if (sort === 'oldest') return dateTimestamp(first.trackedAt) - dateTimestamp(second.trackedAt);
      return dateTimestamp(second.trackedAt) - dateTimestamp(first.trackedAt);
    });
  }, [altitude, data?.aircraft, position, query, selectedType, sort, timeWindow]);

  const archiveSections = useMemo(() => {
    const sectionsByDate = new Map<string, ArchiveDateSection>();
    visibleAircraft.forEach((aircraft) => {
      const date = archiveDateParts(aircraft.trackedAt);
      const existing = sectionsByDate.get(date.key);
      if (existing) {
        existing.data.push(aircraft);
      } else {
        sectionsByDate.set(date.key, { ...date, data: [aircraft] });
      }
    });
    return Array.from(sectionsByDate.values())
      .sort((first, second) => second.key.localeCompare(first.key));
  }, [visibleAircraft]);

  const positionedCount = useMemo(() => (data?.aircraft ?? []).filter((item) => item.latitude !== null && item.longitude !== null).length, [data?.aircraft]);
  const filtersApplied = query || selectedType !== 'all' || timeWindow !== '5d' || altitude !== 'all' || position !== 'all' || sort !== 'recent';
  const resetFilters = () => {
    setQuery('');
    setSelectedType('all');
    setTimeWindow('5d');
    setAltitude('all');
    setPosition('all');
    setSort('recent');
  };

  if (isLoading && !data) return <LoadingState fullScreen label="Loading Falcon aircraft archive…" />;

  return (
    <SafeAreaView edges={['bottom']} style={styles.screen}>
      <SectionList
        sections={archiveSections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <AircraftRecord aircraft={item} onViewMore={() => setSelectedAircraft(item)} />}
        renderSectionHeader={({ section }) => (
          <View style={styles.dateSectionHeader}>
            <Text style={styles.dateDay}>{section.day}</Text>
            <View style={styles.dateSectionCopy}>
              <Text style={styles.dateMonthYear}>{section.monthYear}</Text>
              <Text style={styles.dateSectionMeta}>{section.weekday} · {section.data.length} TRACK{section.data.length === 1 ? '' : 'S'}</Text>
            </View>
          </View>
        )}
        ItemSeparatorComponent={ArchiveListSeparator}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor={colors.radar} colors={[colors.radar]} />}
        contentContainerStyle={styles.content}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={(
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.titleIcon}><MaterialCommunityIcons name="radar" size={28} color={colors.radar} /></View>
              <View style={styles.titleCopy}>
                <Text style={styles.eyebrow}>FALCON INTELLIGENCE ARCHIVE</Text>
                <Text style={styles.title}>Tracked Aircraft</Text>
              </View>
            </View>
            <Text style={styles.description}>Historical detections captured by the Falcon receiver over the past five days.</Text>

            <View style={styles.summaryRow}>
              <DataPoint label="ARCHIVED TRACKS" value={`${data?.totalCount ?? 0}`} />
              <View style={styles.summaryDivider} />
              <DataPoint label="AIRCRAFT TYPES" value={`${Object.keys(data?.aircraftTypeCounts ?? {}).length}`} />
              <View style={styles.summaryDivider} />
              <DataPoint label="POSITION REPORTS" value={`${positionedCount}`} />
            </View>

            <View style={styles.search}>
              <Ionicons name="search" size={18} color={colors.textMuted} />
              <TextInput
                accessibilityLabel="Search tracked aircraft archive"
                autoCapitalize="characters"
                autoCorrect={false}
                value={query}
                onChangeText={setQuery}
                placeholder="Callsign, registration, ICAO, type…"
                placeholderTextColor={colors.textMuted}
                selectionColor={colors.radar}
                style={styles.searchInput}
              />
              {query ? <Pressable accessibilityRole="button" accessibilityLabel="Clear search" hitSlop={10} onPress={() => setQuery('')}><Ionicons name="close-circle" size={18} color={colors.textSecondary} /></Pressable> : null}
            </View>

            <View style={styles.filterTitleRow}>
              <Text style={styles.filterTitle}>FILTER ARCHIVE</Text>
              {filtersApplied ? <Pressable accessibilityRole="button" onPress={resetFilters}><Text style={styles.reset}>Reset filters</Text></Pressable> : null}
            </View>
            <Text style={styles.filterLabel}>AIRCRAFT TYPE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              <FilterChip label="All types" active={selectedType === 'all'} onPress={() => setSelectedType('all')} />
              {topTypes.map(([type, count]) => <FilterChip key={type} label={`${type} · ${count}`} active={selectedType === type} onPress={() => setSelectedType(type)} />)}
            </ScrollView>
            <Text style={styles.filterLabel}>TRACKED WITHIN</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {timeOptions.map((option) => <FilterChip key={option.id} {...option} active={timeWindow === option.id} onPress={() => setTimeWindow(option.id)} />)}
            </ScrollView>
            <Text style={styles.filterLabel}>FLIGHT STATE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {altitudeOptions.map((option) => <FilterChip key={option.id} {...option} active={altitude === option.id} onPress={() => setAltitude(option.id)} />)}
            </ScrollView>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {positionOptions.map((option) => <FilterChip key={option.id} {...option} active={position === option.id} onPress={() => setPosition(option.id)} />)}
            </ScrollView>
            <Text style={styles.filterLabel}>SORT RESULTS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {sortOptions.map((option) => <FilterChip key={option.id} {...option} active={sort === option.id} onPress={() => setSort(option.id)} />)}
            </ScrollView>

            <View style={styles.resultsRow}>
              <View style={styles.syncState}><View style={styles.syncDot} /><Text style={styles.syncText}>ARCHIVE SYNCED</Text></View>
              <Text style={styles.resultsCount}>{visibleAircraft.length} RESULTS</Text>
            </View>
            {error ? (
              <View style={styles.errorBanner}>
                <MaterialCommunityIcons name="database-alert-outline" size={18} color={colors.warning} />
                <Text style={styles.errorText}>{error}</Text>
                <Pressable accessibilityRole="button" onPress={retry}><Text style={styles.retryText}>Retry</Text></Pressable>
              </View>
            ) : null}
          </View>
        )}
        ListEmptyComponent={(
          <EmptyState
            icon={filtersApplied ? 'filter-remove-outline' : 'database-off-outline'}
            title={filtersApplied ? 'No archived tracks match' : 'Archive is empty'}
            message={filtersApplied ? 'Adjust or reset the filters to widen the search.' : 'Tracked aircraft will appear after the next archive synchronization.'}
            actionLabel={filtersApplied ? 'Reset filters' : error ? 'Retry' : undefined}
            onAction={filtersApplied ? resetFilters : error ? retry : undefined}
          />
        )}
        ListFooterComponent={<Text style={styles.footer}>FALCON INTELLIGENCE • TRACKED AIRCRAFT ARCHIVE</Text>}
      />
      <AircraftDetailSheet aircraft={selectedAircraft} onClose={() => setSelectedAircraft(null)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.huge, flexGrow: 1 },
  header: { paddingTop: spacing.sm, paddingBottom: spacing.lg },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  titleIcon: { width: 54, height: 54, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.radar10, borderWidth: 1, borderColor: colors.radar20 },
  titleCopy: { flex: 1 },
  eyebrow: { color: colors.radar, fontSize: 8, fontWeight: '900', letterSpacing: 1.2 },
  title: { color: colors.text, fontSize: 24, fontWeight: '800', letterSpacing: -0.4, marginTop: 3 },
  description: { color: colors.textSecondary, fontSize: 12, lineHeight: 18, marginTop: spacing.md },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.lg, padding: spacing.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md },
  summaryDivider: { width: 1, height: 31, backgroundColor: colors.border },
  dataPoint: { flex: 1 },
  dataValue: { color: colors.text, fontSize: 14, fontWeight: '800' },
  dataLabel: { color: colors.textMuted, fontSize: 7, fontWeight: '800', letterSpacing: 0.7, marginTop: 3 },
  search: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, minHeight: 48, paddingHorizontal: spacing.sm, marginTop: spacing.md, backgroundColor: colors.elevated, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.md },
  searchInput: { flex: 1, color: colors.text, fontSize: 12, paddingVertical: 0 },
  filterTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.lg, marginBottom: spacing.sm },
  filterTitle: { color: colors.text, fontSize: 11, fontWeight: '800', letterSpacing: 0.9 },
  reset: { color: colors.radar, fontSize: 10, fontWeight: '800' },
  filterLabel: { color: colors.textMuted, fontSize: 7, fontWeight: '800', letterSpacing: 0.9, marginTop: spacing.sm, marginBottom: 6 },
  chipRow: { gap: spacing.xs, paddingRight: spacing.md },
  chip: { paddingHorizontal: 11, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.radar, borderColor: colors.radar },
  chipText: { color: colors.textSecondary, fontSize: 10, fontWeight: '700' },
  chipTextActive: { color: colors.background },
  resultsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.lg, paddingTop: spacing.md, borderTopWidth: 1, borderColor: colors.border },
  syncState: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  syncDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.radar },
  syncText: { color: colors.radar, fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  resultsCount: { color: colors.textMuted, fontSize: 9, fontWeight: '800', letterSpacing: 0.7 },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm, padding: spacing.sm, borderRadius: radius.sm, backgroundColor: 'rgba(255,181,71,0.08)', borderWidth: 1, borderColor: 'rgba(255,181,71,0.25)' },
  errorText: { flex: 1, color: colors.textSecondary, fontSize: 10, lineHeight: 15 },
  retryText: { color: colors.warning, fontSize: 10, fontWeight: '800' },
  dateSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingTop: spacing.lg, paddingBottom: spacing.sm },
  dateDay: { color: colors.radar, fontSize: 42, fontWeight: '800', letterSpacing: -1.5, lineHeight: 46 },
  dateSectionCopy: { flex: 1, borderLeftWidth: 1, borderColor: colors.borderStrong, paddingLeft: spacing.sm },
  dateMonthYear: { color: colors.text, fontSize: 13, fontWeight: '800', letterSpacing: 0.7 },
  dateSectionMeta: { color: colors.textMuted, fontSize: 8, fontWeight: '800', letterSpacing: 0.8, marginTop: 3 },
  separator: { height: spacing.sm },
  record: { padding: spacing.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg },
  recordHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  aircraftIcon: { width: 44, height: 44, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  aircraftIconAirborne: { backgroundColor: colors.radar10 },
  aircraftIconGround: { backgroundColor: colors.white08 },
  identity: { flex: 1, minWidth: 0 },
  callsign: { color: colors.text, fontSize: 14, fontWeight: '800' },
  aircraftDescription: { color: colors.textSecondary, fontSize: 10, marginTop: 3 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: radius.sm, backgroundColor: colors.blue12 },
  typeBadgeText: { color: colors.blue, fontSize: 9, fontFamily: 'monospace', fontWeight: '800' },
  recordMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm },
  hex: { color: colors.textMuted, fontSize: 8, fontFamily: 'monospace', fontWeight: '700' },
  registration: { color: colors.textSecondary, fontSize: 9, fontFamily: 'monospace', fontWeight: '700' },
  trackedAt: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 4 },
  trackedDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.radar },
  trackedAtText: { color: colors.textMuted, fontSize: 8, fontWeight: '700' },
  trackedDate: { color: colors.textSecondary, fontSize: 9, marginTop: 5 },
  rule: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  dataRow: { flexDirection: 'row', gap: spacing.sm },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  positionText: { color: colors.textMuted, fontSize: 8, fontFamily: 'monospace' },
  messageText: { color: colors.textMuted, fontSize: 8, fontWeight: '800' },
  viewMoreButton: { alignSelf: 'flex-end', flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: spacing.md, paddingVertical: 4 },
  viewMoreText: { color: colors.radar, fontSize: 10, fontWeight: '800' },
  modalRoot: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.black50 },
  modalBackdrop: { ...StyleSheet.absoluteFillObject },
  sheetSafeArea: { maxHeight: '88%' },
  sheet: { maxHeight: '100%', paddingHorizontal: spacing.md, paddingTop: spacing.xs, backgroundColor: colors.elevated, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, borderWidth: 1, borderBottomWidth: 0, borderColor: colors.borderStrong },
  sheetHandle: { alignSelf: 'center', width: 38, height: 4, borderRadius: radius.pill, backgroundColor: colors.textMuted, marginBottom: spacing.sm },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: spacing.md },
  sheetIdentity: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minWidth: 0 },
  sheetIcon: { width: 46, height: 46, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.radar10 },
  sheetTitle: { color: colors.text, fontSize: 17, fontWeight: '800' },
  sheetSubtitle: { color: colors.textSecondary, fontSize: 10, marginTop: 3 },
  closeButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card },
  sheetContent: { paddingBottom: spacing.xl },
  detectionPanel: { padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.radar10, borderWidth: 1, borderColor: colors.radar20 },
  detectedRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  detectedLabel: { color: colors.radar, fontSize: 8, fontWeight: '900', letterSpacing: 0.9 },
  detectedTime: { color: colors.text, fontSize: 15, fontWeight: '800', marginTop: 7 },
  detectedAgo: { color: colors.textSecondary, fontSize: 10, marginTop: 3 },
  detailSectionTitle: { color: colors.textMuted, fontSize: 8, fontWeight: '900', letterSpacing: 1, marginTop: spacing.lg, marginBottom: spacing.sm },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  detailField: { width: '47%', minHeight: 50, padding: spacing.sm, borderRadius: radius.sm, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  detailFieldFull: { width: '100%' },
  detailLabel: { color: colors.textMuted, fontSize: 7, fontWeight: '800', letterSpacing: 0.8 },
  detailValue: { color: colors.text, fontSize: 11, fontWeight: '700', marginTop: 5 },
  footer: { color: colors.textMuted, fontSize: 7, fontWeight: '700', letterSpacing: 0.9, textAlign: 'center', marginTop: spacing.xl },
});
