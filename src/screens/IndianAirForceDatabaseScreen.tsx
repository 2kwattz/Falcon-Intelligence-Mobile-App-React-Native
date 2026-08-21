import { useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
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
import { useIndianAirForceDatabase } from '@/hooks/useIndianAirForceDatabase';
import { IndianAirForceAircraft } from '@/types/airForce';

const formatTrackedTime = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || 'Unknown';
  return new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const formatTrackedAgo = (value: string): string => {
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return 'Tracking time unavailable';
  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60_000));
  if (minutes < 1) return 'Tracked just now';
  if (minutes < 60) return `Tracked ${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Tracked ${hours}h ago`;
  return `Tracked ${Math.floor(hours / 24)}d ago`;
};

const DataField = ({ label, value, monospace = false }: { label: string; value: string; monospace?: boolean }) => (
  <View style={styles.dataField}>
    <Text style={styles.dataLabel}>{label}</Text>
    <Text style={[styles.dataValue, monospace && styles.monospace]}>{value || '—'}</Text>
  </View>
);

const ListSeparator = () => <View style={styles.separator} />;

type AircraftSection = {
  title: string;
  data: IndianAirForceAircraft[];
  count: number;
};

const AircraftTypeHeader = ({
  section,
  isCollapsed,
  onPress,
}: {
  section: AircraftSection;
  isCollapsed: boolean;
  onPress: () => void;
}) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={`${isCollapsed ? 'Show' : 'Hide'} ${section.count} ${section.title} aircraft`}
    accessibilityState={{ expanded: !isCollapsed }}
    onPress={onPress}
    style={styles.typeHeader}
  >
    <View>
      <Text style={styles.typeLabel}>AIRCRAFT TYPE</Text>
      <Text style={styles.typeName}>{section.title}</Text>
    </View>
    <View style={styles.typeHeaderAction}>
      <View style={styles.typeCount}>
        <Text style={styles.typeCountText}>{section.count}</Text>
      </View>
      <Ionicons name={isCollapsed ? 'chevron-down' : 'chevron-up'} size={18} color={colors.textSecondary} />
    </View>
  </Pressable>
);

const AircraftRecord = ({ aircraft }: { aircraft: IndianAirForceAircraft }) => (
  <View style={styles.record}>
    <View style={styles.recordHeader}>
      <View style={styles.aircraftIcon}>
        <MaterialCommunityIcons name="shield-airplane" size={23} color={colors.warning} />
      </View>
      <View style={styles.identity}>
        <Text style={styles.aircraftName}>{aircraft.aircraftName}</Text>
        <Text style={styles.operator} numberOfLines={2}>{aircraft.operator}</Text>
      </View>
      <View style={styles.hexBadge}>
        <Text style={styles.hexLabel}>MODE S / HEX</Text>
        <Text style={styles.hexValue}>{aircraft.modeSHex.toUpperCase()}</Text>
      </View>
    </View>

    <View style={styles.rule} />
    <View style={styles.dataRow}>
      <DataField label="REGISTRATION" value={aircraft.registration} monospace />
      <DataField label="LAST TRACKED" value={formatTrackedTime(aircraft.lastTracked)} />
    </View>
    <View style={styles.trackedRow}>
      <View style={styles.liveDot} />
      <Text style={styles.trackedText}>{formatTrackedAgo(aircraft.lastTracked)}</Text>
    </View>
  </View>
);

export const IndianAirForceDatabaseScreen = () => {
  const { aircraft, isLoading, isRefreshing, error, refresh, retry } = useIndianAirForceDatabase();
  const [query, setQuery] = useState('');
  const [collapsedTypes, setCollapsedTypes] = useState<Set<string>>(() => new Set());

  const filteredAircraft = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return aircraft;
    return aircraft.filter((item) =>
      [item.aircraftName, item.modeSHex, item.operator, item.registration]
        .some((value) => value.toLowerCase().includes(normalizedQuery)),
    );
  }, [aircraft, query]);

  const aircraftSections = useMemo(() => {
    const groups = new Map<string, IndianAirForceAircraft[]>();

    filteredAircraft.forEach((item) => {
      const type = item.aircraftName || 'Unclassified aircraft';
      const records = groups.get(type);
      if (records) {
        records.push(item);
      } else {
        groups.set(type, [item]);
      }
    });

    return Array.from(groups, ([title, data]) => ({
      title,
      count: data.length,
      data: collapsedTypes.has(title) ? [] : data,
    }));
  }, [collapsedTypes, filteredAircraft]);

  const toggleAircraftType = (type: string) => {
    setCollapsedTypes((previous) => {
      const next = new Set(previous);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  if (isLoading && aircraft.length === 0) {
    return <LoadingState fullScreen label="Loading Indian Air Force database…" />;
  }

  return (
    <SafeAreaView edges={['bottom']} style={styles.screen}>
      <SectionList
        sections={aircraftSections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <AircraftRecord aircraft={item} />}
        renderSectionHeader={({ section }) => (
          <AircraftTypeHeader
            section={section}
            isCollapsed={collapsedTypes.has(section.title)}
            onPress={() => toggleAircraftType(section.title)}
          />
        )}
        ItemSeparatorComponent={ListSeparator}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={colors.radar}
            colors={[colors.radar]}
          />
        }
        contentContainerStyle={styles.content}
        stickySectionHeadersEnabled
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.titleIcon}>
                <MaterialCommunityIcons name="database-eye-outline" size={27} color={colors.radar} />
              </View>
              <View style={styles.titleCopy}>
                <Text style={styles.eyebrow}>DEFENCE AVIATION REGISTRY</Text>
                <Text style={styles.title}>Indian Air Force Database</Text>
              </View>
            </View>
            <Text style={styles.description}>
              Aircraft identity and tracking records synchronized from the Falcon API.
            </Text>

            <View style={styles.summaryRow}>
              <View>
                <Text style={styles.summaryValue}>{aircraft.length}</Text>
                <Text style={styles.summaryLabel}>TOTAL RECORDS</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View>
                <Text style={styles.summaryValue}>{filteredAircraft.length}</Text>
                <Text style={styles.summaryLabel}>VISIBLE RESULTS</Text>
              </View>
              <View style={styles.syncBadge}>
                <View style={styles.syncDot} />
                <Text style={styles.syncText}>API SYNC</Text>
              </View>
            </View>

            <View style={styles.search}>
              <Ionicons name="search" size={18} color={colors.textMuted} />
              <TextInput
                accessibilityLabel="Search Indian Air Force database"
                autoCapitalize="characters"
                autoCorrect={false}
                value={query}
                onChangeText={setQuery}
                placeholder="Search aircraft, hex, operator, registration"
                placeholderTextColor={colors.textMuted}
                selectionColor={colors.radar}
                style={styles.searchInput}
              />
              {query ? (
                <Pressable accessibilityRole="button" accessibilityLabel="Clear search" hitSlop={10} onPress={() => setQuery('')}>
                  <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                </Pressable>
              ) : null}
            </View>

            {error ? (
              <View style={styles.errorBanner}>
                <MaterialCommunityIcons name="database-alert-outline" size={19} color={colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
                <Pressable accessibilityRole="button" onPress={retry} style={styles.retryButton}>
                  <Text style={styles.retryText}>Retry</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon={query ? 'database-search-outline' : 'database-off-outline'}
            title={query ? 'No matching aircraft' : 'No aircraft records'}
            message={
              query
                ? 'Try an aircraft name, Mode S/Hex code, operator, or registration.'
                : 'Aircraft received from the Indian Air Force API will appear here.'
            }
            actionLabel={query ? 'Clear search' : error ? 'Retry' : undefined}
            onAction={query ? () => setQuery('') : error ? retry : undefined}
          />
        }
        ListFooterComponent={<Text style={styles.footer}>FALCON INTELLIGENCE • AIR FORCE DATA FEED</Text>}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.huge, flexGrow: 1 },
  header: { paddingBottom: spacing.lg },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  titleIcon: { width: 52, height: 52, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.radar10, borderWidth: 1, borderColor: colors.radar20 },
  titleCopy: { flex: 1 },
  eyebrow: { color: colors.radar, fontSize: 8, fontWeight: '900', letterSpacing: 1.35 },
  title: { color: colors.text, fontSize: 24, fontWeight: '800', letterSpacing: -0.4, marginTop: 3 },
  description: { color: colors.textSecondary, fontSize: 12, lineHeight: 18, marginTop: spacing.md },
  summaryRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, gap: spacing.md },
  summaryValue: { color: colors.text, fontSize: 20, fontWeight: '800' },
  summaryLabel: { color: colors.textMuted, fontSize: 7, fontWeight: '800', letterSpacing: 0.8, marginTop: 2 },
  summaryDivider: { width: 1, height: 32, backgroundColor: colors.border },
  syncBadge: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: colors.radar10 },
  syncDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.radar },
  syncText: { color: colors.radar, fontSize: 7, fontWeight: '900', letterSpacing: 0.8 },
  search: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.md, minHeight: 48, paddingHorizontal: spacing.sm, backgroundColor: colors.elevated, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.md },
  searchInput: { flex: 1, color: colors.text, fontSize: 12, paddingVertical: 0 },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm, backgroundColor: 'rgba(255,92,112,0.08)', borderWidth: 1, borderColor: 'rgba(255,92,112,0.25)', borderRadius: radius.sm, padding: spacing.sm },
  errorText: { flex: 1, color: colors.textSecondary, fontSize: 11, lineHeight: 16 },
  retryButton: { paddingHorizontal: spacing.xs, paddingVertical: 5 },
  retryText: { color: colors.danger, fontSize: 10, fontWeight: '800' },
  typeHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.lg, marginBottom: spacing.sm, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.border },
  typeLabel: { color: colors.textMuted, fontSize: 7, fontWeight: '800', letterSpacing: 0.9 },
  typeName: { color: colors.text, fontSize: 14, fontWeight: '800', marginTop: 3 },
  typeCount: { minWidth: 26, height: 26, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, backgroundColor: colors.radar10, borderWidth: 1, borderColor: colors.radar20 },
  typeCountText: { color: colors.radar, fontSize: 11, fontWeight: '900' },
  typeHeaderAction: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  separator: { height: spacing.sm },
  record: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md },
  recordHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  aircraftIcon: { width: 44, height: 44, borderRadius: radius.sm, backgroundColor: 'rgba(255,181,71,0.1)', alignItems: 'center', justifyContent: 'center' },
  identity: { flex: 1, minWidth: 0 },
  aircraftName: { color: colors.text, fontSize: 14, fontWeight: '800' },
  operator: { color: colors.textSecondary, fontSize: 9, marginTop: 3 },
  hexBadge: { alignItems: 'flex-end', backgroundColor: colors.background, borderRadius: radius.sm, paddingHorizontal: 9, paddingVertical: 7 },
  hexLabel: { color: colors.textMuted, fontSize: 6, fontWeight: '800', letterSpacing: 0.7 },
  hexValue: { color: colors.radar, fontSize: 11, fontFamily: 'monospace', fontWeight: '800', letterSpacing: 0.8, marginTop: 2 },
  rule: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  dataRow: { flexDirection: 'row', gap: spacing.md },
  dataField: { flex: 1 },
  dataLabel: { color: colors.textMuted, fontSize: 7, fontWeight: '800', letterSpacing: 0.8 },
  dataValue: { color: colors.text, fontSize: 10, fontWeight: '700', marginTop: 4 },
  monospace: { fontFamily: 'monospace', letterSpacing: 0.5 },
  trackedRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: spacing.sm },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.blue },
  trackedText: { color: colors.textMuted, fontSize: 8, fontWeight: '700' },
  footer: { color: colors.textMuted, fontSize: 7, fontWeight: '700', letterSpacing: 1, textAlign: 'center', marginTop: spacing.xl },
});
