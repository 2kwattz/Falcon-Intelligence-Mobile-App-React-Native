import { ComponentProps } from 'react';
import {
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons/static';
import { AlertItem } from '@/components/AlertItem';
import { AppHeader } from '@/components/AppHeader';
import { EmptyState } from '@/components/EmptyState';
import { LoadingState } from '@/components/LoadingState';
import { MiniMap } from '@/components/MiniMap';
import { SectionCard } from '@/components/SectionCard';
import { StatCard } from '@/components/StatCard';
import { colors } from '@/constants/colors';
import { BASE_URL } from '@/constants/config';
import { radius, spacing } from '@/constants/spacing';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useGreeting } from '@/hooks/useGreeting';
import { useLocationWeather } from '@/hooks/useLocationWeather';
import { MainTabParamList, RootStackParamList } from '@/navigation/navigationTypes';
import { Aircraft } from '@/types/aircraft';
import { SdrStatus, ServerStatus, WeatherData } from '@/types/dashboard';
import { formatAltitude } from '@/utils/formatting';

type Props = BottomTabScreenProps<MainTabParamList, 'Dashboard'>;
type MaterialIconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

const DashboardAction = ({ label, onPress }: { label: string; onPress: () => void }) => (
  <Pressable hitSlop={8} onPress={onPress} style={styles.action}>
    <Text style={styles.actionText}>{label}</Text>
    <Ionicons name="chevron-forward" size={13} color={colors.radar} />
  </Pressable>
);

const Metric = ({ label, value, accent }: { label: string; value: string; accent?: string }) => (
  <View style={styles.metric}>
    <Text style={styles.metricValue}>{value}</Text>
    <Text style={[styles.metricLabel, accent ? { color: accent } : undefined]}>{label}</Text>
  </View>
);

const SdrPanel = ({ data }: { data: SdrStatus }) => (
  <SectionCard title="ADS-B Feed" eyebrow="Receiver status">
    <View style={styles.sdrHero}>
      <View style={styles.sdrIdentity}>
        <View style={styles.sdrIcon}><MaterialCommunityIcons name="radio-tower" size={25} color={colors.radar} /></View>
        <View>
          <View style={styles.inline}><View style={styles.onlineDot} /><Text style={styles.connected}>{data.connected ? 'CONNECTED' : 'OFFLINE'}</Text></View>
          <Text style={styles.device}>{data.device}</Text>
        </View>
      </View>
      <View style={styles.frequency}>
        <Text style={styles.frequencyValue}>{data.frequencyMhz}</Text>
        <Text style={styles.frequencyUnit}>MHz</Text>
      </View>
    </View>
    <View style={styles.metricsRow}>
      <Metric label="ACTIVE TRACKS" value={`${data.trackCount ?? 0}`} accent={colors.radar} />
      <Metric label="FEED MESSAGES" value={(data.messageCount ?? 0).toLocaleString()} />
    </View>
  </SectionCard>
);

const WeatherMetric = ({ icon, label, value }: { icon: MaterialIconName; label: string; value: string }) => (
  <View style={styles.weatherMetric}>
    <MaterialCommunityIcons name={icon} size={17} color={colors.blue} />
    <View><Text style={styles.weatherMetricValue}>{value}</Text><Text style={styles.weatherMetricLabel}>{label}</Text></View>
  </View>
);

const getWeatherIcon = (data: WeatherData): MaterialIconName => {
  if (data.weatherCode === 0) return data.isDay ? 'weather-sunny' : 'weather-night';
  if (data.weatherCode <= 2) return data.isDay ? 'weather-partly-cloudy' : 'weather-night-partly-cloudy';
  if (data.weatherCode === 3) return 'weather-cloudy';
  if (data.weatherCode === 45 || data.weatherCode === 48) return 'weather-fog';
  if (data.weatherCode >= 51 && data.weatherCode <= 67) return 'weather-rainy';
  if (data.weatherCode >= 71 && data.weatherCode <= 77) return 'weather-snowy';
  if (data.weatherCode >= 80 && data.weatherCode <= 82) return 'weather-pouring';
  if (data.weatherCode === 85 || data.weatherCode === 86) return 'weather-snowy-heavy';
  if (data.weatherCode >= 95) return 'weather-lightning-rainy';
  return 'weather-cloudy';
};

const openWeatherProvider = () => {
  Linking.openURL('https://open-meteo.com').catch(() => undefined);
};

const WeatherPanel = ({ data }: { data: WeatherData }) => (
  <SectionCard title="Weather" eyebrow={data.city}>
    <View style={styles.weatherLocation}>
      <MaterialCommunityIcons name="crosshairs-gps" size={13} color={colors.radar} />
      <Text style={styles.weatherLocationText}>
        {data.latitude.toFixed(2)}°, {data.longitude.toFixed(2)}°
      </Text>
      <Text style={styles.weatherUpdated}>UPDATED {data.observedAt.split('T')[1]?.slice(0, 5) ?? 'NOW'}</Text>
    </View>
    <View style={styles.weatherHero}>
      <View>
        <Text style={styles.temperature}>{data.temperatureC}°</Text>
        <Text style={styles.condition}>{data.condition}</Text>
      </View>
      <View style={styles.weatherIcon}><MaterialCommunityIcons name={getWeatherIcon(data)} size={42} color={colors.warning} /></View>
    </View>
    <View style={styles.weatherGrid}>
      <WeatherMetric icon="eye-outline" label="Visibility" value={`${data.visibilityKm} km`} />
      <WeatherMetric icon="weather-windy" label="Wind" value={`${data.windKph} km/h ${data.windDirection}`} />
      <WeatherMetric icon="gauge" label="Pressure" value={`${data.pressureHpa} hPa`} />
      <WeatherMetric icon="weather-sunset-up" label="Sunrise / Sunset" value={`${data.sunrise} / ${data.sunset}`} />
    </View>
    <Pressable accessibilityRole="link" onPress={openWeatherProvider} style={styles.weatherAttribution}>
      <Text style={styles.weatherAttributionText}>Weather data by Open-Meteo.com</Text>
      <Ionicons name="open-outline" size={11} color={colors.blue} />
    </Pressable>
  </SectionCard>
);

const WeatherUnavailablePanel = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <SectionCard title="Local Weather" eyebrow="Location required">
    <View style={styles.weatherUnavailable}>
      <View style={styles.weatherUnavailableIcon}>
        <MaterialCommunityIcons name="map-marker-alert-outline" size={28} color={colors.warning} />
      </View>
      <Text style={styles.weatherUnavailableTitle}>Enable location weather</Text>
      <Text style={styles.weatherUnavailableMessage}>{message}</Text>
      <View style={styles.weatherActions}>
        <Pressable accessibilityRole="button" onPress={onRetry} style={styles.weatherPrimaryAction}>
          <Text style={styles.weatherPrimaryActionText}>Try again</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => Linking.openSettings().catch(() => undefined)}
          style={styles.weatherSecondaryAction}
        >
          <Text style={styles.weatherSecondaryActionText}>Open settings</Text>
        </Pressable>
      </View>
    </View>
  </SectionCard>
);

const LiveAircraftCard = ({ aircraft }: { aircraft: Aircraft }) => (
  <View style={styles.aircraftCard}>
    <View style={styles.aircraftTop}>
      <View style={styles.aircraftIcon}><MaterialCommunityIcons name="airplane" size={18} color={colors.radar} /></View>
      <Text style={styles.aircraftHex}>{aircraft.icao24}</Text>
    </View>
    <Text style={styles.aircraftName}>{aircraft.name}</Text>
    <Text style={styles.aircraftModel} numberOfLines={1}>{aircraft.model}</Text>
    <View style={styles.aircraftRule} />
    <View style={styles.aircraftMetaRow}>
      <View><Text style={styles.metaValue}>{formatAltitude(aircraft.altitudeFt)}</Text><Text style={styles.metaLabel}>ALTITUDE</Text></View>
      <View style={styles.alignRight}><Text style={[styles.metaValue, { color: aircraft.status === 'airborne' ? colors.radar : colors.textSecondary }]}>{Math.round(aircraft.speedKts)} kt</Text><Text style={styles.metaLabel}>GROUND SPEED</Text></View>
    </View>
    <Text style={styles.lastSeen}>Last seen {Math.max(1, Math.round((Date.now() - new Date(aircraft.lastSeen).getTime()) / 60_000))}m ago</Text>
  </View>
);

const StatusLine = ({ label, value, online = true }: { label: string; value: string; online?: boolean }) => (
  <View style={styles.statusLine}>
    <Text style={styles.statusLabel}>{label}</Text>
    <View style={styles.inline}>
      <View style={[styles.microDot, { backgroundColor: online ? colors.radar : colors.warning }]} />
      <Text style={styles.statusValue}>{value}</Text>
    </View>
  </View>
);

const ServerPanel = ({ data, isRefreshing, onRefresh }: { data: ServerStatus; isRefreshing: boolean; onRefresh: () => void }) => (
  <SectionCard
    title="Falcon Server"
    eyebrow="Live endpoint status"
    action={(
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Refresh server status"
        disabled={isRefreshing}
        onPress={onRefresh}
        style={[styles.serverRefresh, isRefreshing && styles.serverRefreshDisabled]}
      >
        <Ionicons name="refresh" size={14} color={colors.radar} />
        <Text style={styles.serverRefreshText}>{isRefreshing ? 'Checking' : 'Refresh'}</Text>
      </Pressable>
    )}
  >
    <View style={styles.serverHero}>
      <View style={[styles.serverPulse, { backgroundColor: data.online ? colors.radar10 : 'rgba(255,92,112,0.1)' }]}>
        <MaterialCommunityIcons name="server-security" size={30} color={data.online ? colors.radar : colors.danger} />
      </View>
      <View style={styles.serverCopy}>
        <Text style={styles.serverTitle}>{data.online ? 'Server reached' : 'Server unreachable'}</Text>
        <Text style={styles.serverSubtitle}>
          {data.online
            ? data.routeAvailable
              ? `HTTP ${data.statusCode} received`
              : `HTTP ${data.statusCode} received — route not found`
            : data.error ?? 'No response received'}
        </Text>
      </View>
      <Text style={styles.latency}>{data.latencyMs} ms</Text>
    </View>
    <View style={styles.serverGrid}>
      <StatusLine label="REQUEST" value={(data.requestUrl ?? BASE_URL).replace(/^https?:\/\//, '')} online={data.online} />
      <StatusLine label="LAST CHECK" value={new Date(data.checkedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} online={data.online} />
    </View>
  </SectionCard>
);

export const DashboardScreen = ({ navigation }: Props) => {
  const { user } = useAuth();
  const greeting = useGreeting();
  const { data, isLoading, isRefreshing, isServerRefreshing, error, refresh, refreshServerStatus, retry } = useDashboardData();
  const {
    data: weatherData,
    isLoading: isWeatherLoading,
    isRefreshing: isWeatherRefreshing,
    error: weatherError,
    refresh: refreshWeather,
    retry: retryWeather,
  } = useLocationWeather();
  const rootNavigation = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();

  const refreshAll = () => {
    refresh().catch(() => undefined);
    refreshWeather().catch(() => undefined);
  };

  if (isLoading && !data) return <LoadingState fullScreen />;
  if (error && !data) {
    return (
      <SafeAreaView style={styles.screen}>
        <EmptyState icon="server-off" title="Unable to synchronize" message={error} actionLabel="Retry connection" onAction={retry} />
      </SafeAreaView>
    );
  }
  if (!data) return null;

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing || isWeatherRefreshing} onRefresh={refreshAll} tintColor={colors.radar} colors={[colors.radar]} />}
        contentContainerStyle={styles.content}
      >
        <AppHeader
          greeting={greeting}
          name={user?.name.split(' ')[0] ?? 'Operator'}
          initials={user?.initials ?? 'FI'}
          online={data.server.online}
        />
        <View style={styles.stats}>
          <StatCard label="Aircraft in Feed" value={data.summary.aircraftInRange} icon="airplane-marker" accent={colors.blue} />
          <StatCard label="Airborne" value={data.summary.airborne} icon="airplane-takeoff" accent={colors.radar} />
          <StatCard label="Latest Reports" value={data.summary.recentReports} icon="radar" accent={colors.warning} />
        </View>

        {data.aircraftFeedError ? (
          <View style={styles.feedErrorBanner}>
            <MaterialCommunityIcons name="radar" size={18} color={colors.warning} />
            <View style={styles.feedErrorCopy}>
              <Text style={styles.feedErrorTitle}>Live aircraft feed unavailable</Text>
              <Text style={styles.feedErrorMessage} numberOfLines={2}>{data.aircraftFeedError}</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Retry aircraft feed" onPress={retry} style={styles.feedRetryButton}>
              <Text style={styles.feedRetryText}>Retry</Text>
            </Pressable>
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open Falcon tracked aircraft archive"
          onPress={() => rootNavigation?.navigate('TrackedAircraftArchive')}
          style={styles.archiveCta}
        >
          <View style={styles.archiveIcon}>
            <MaterialCommunityIcons name="radar" size={25} color={colors.radar} />
          </View>
          <View style={styles.databaseCopy}>
            <Text style={styles.archiveEyebrow}>HISTORICAL AIRSPACE INTELLIGENCE</Text>
            <Text style={styles.databaseTitle}>Falcon Intelligence Archive</Text>
            <Text style={styles.databaseSubtitle}>Search and filter aircraft detected in the last 5 days</Text>
          </View>
          <Ionicons name="chevron-forward" size={19} color={colors.radar} />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open Indian Air Force database"
          onPress={() => rootNavigation?.navigate('AirForceDatabase')}
          style={styles.databaseCta}
        >
          <View style={styles.databaseIcon}>
            <MaterialCommunityIcons name="database-eye-outline" size={25} color={colors.warning} />
          </View>
          <View style={styles.databaseCopy}>
            <Text style={styles.databaseEyebrow}>DEFENCE AVIATION REGISTRY</Text>
            <Text style={styles.databaseTitle}>Indian Air Force Database</Text>
            <Text style={styles.databaseSubtitle}>Aircraft identity and latest tracking records</Text>
          </View>
          <Ionicons name="chevron-forward" size={19} color={colors.radar} />
        </Pressable>

        <SectionCard title="ATC Transcript" eyebrow="Communications">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open ATC Transcript"
            onPress={() => rootNavigation?.navigate('AtcTranscript')}
            style={({ pressed }) => [styles.atcTranscriptCta, pressed && styles.atcTranscriptCtaPressed]}
          >
            <View style={styles.atcTranscriptIcon}>
              <MaterialCommunityIcons name="transcribe" size={25} color={colors.radar} />
            </View>
            <View style={styles.atcTranscriptCopy}>
              <Text style={styles.atcTranscriptTitle}>Controller-pilot communications</Text>
              <Text style={styles.atcTranscriptSubtitle}>Open the ATC transcript workspace</Text>
            </View>
            <Ionicons name="chevron-forward" size={19} color={colors.radar} />
          </Pressable>
        </SectionCard>

        <SectionCard title="Live Map" eyebrow="Airspace picture" action={<DashboardAction label="View all" onPress={() => navigation.navigate('Map')} />}>
          <MiniMap aircraft={data.mapAircraft} onOpen={() => navigation.navigate('Map')} />
        </SectionCard>

        <SdrPanel data={data.sdr} />

        <SectionCard title="Latest Tracks" eyebrow={`${data.summary.recentReports} currently reported`} action={<Text style={styles.timestamp}>UPDATED NOW</Text>}>
          {data.alerts.length ? (
            data.alerts.map((alert, index) => <AlertItem key={alert.id} alert={alert} isLast={index === data.alerts.length - 1} />)
          ) : (
            <Text style={styles.feedUnavailableText}>No aircraft reports are available right now.</Text>
          )}
        </SectionCard>

        {weatherData ? (
          <WeatherPanel data={weatherData} />
        ) : isWeatherLoading ? (
          <SectionCard title="Local Weather" eyebrow="Locating device">
            <LoadingState label="Getting your location and live weather…" />
          </SectionCard>
        ) : (
          <WeatherUnavailablePanel
            message={weatherError ?? 'Weather for your current location is unavailable.'}
            onRetry={retryWeather}
          />
        )}

        <View style={styles.sectionHeading}>
          <View><Text style={styles.sectionEyebrow}>LIVE FEED</Text><Text style={styles.sectionTitle}>Current Aircraft</Text></View>
          <Text style={styles.sectionCount}>{data.pinnedAircraft.length} SHOWN</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.aircraftList}>
          {data.pinnedAircraft.map((aircraft) => <LiveAircraftCard key={aircraft.id} aircraft={aircraft} />)}
          {!data.pinnedAircraft.length ? <Text style={styles.feedUnavailableText}>Live aircraft will appear here when the feed reconnects.</Text> : null}
        </ScrollView>

        <ServerPanel data={data.server} isRefreshing={isServerRefreshing} onRefresh={() => { refreshServerStatus().catch(() => undefined); }} />
        <Text style={styles.updated}>Last synchronized {new Date(data.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.md, paddingTop: spacing.lg, paddingBottom: 112, gap: spacing.md },
  stats: { flexDirection: 'row', gap: spacing.xs },
  feedErrorBanner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderWidth: 1, borderColor: 'rgba(255,181,71,0.28)', borderRadius: radius.md, backgroundColor: 'rgba(255,181,71,0.08)' },
  feedErrorCopy: { flex: 1 },
  feedErrorTitle: { color: colors.warning, fontSize: 11, fontWeight: '800' },
  feedErrorMessage: { color: colors.textSecondary, fontSize: 9, lineHeight: 13, marginTop: 2 },
  feedRetryButton: { paddingHorizontal: spacing.xs, paddingVertical: 6 },
  feedRetryText: { color: colors.warning, fontSize: 10, fontWeight: '800' },
  feedUnavailableText: { color: colors.textMuted, fontSize: 11, paddingVertical: spacing.sm },
  archiveCta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.radar20, borderRadius: radius.lg },
  archiveIcon: { width: 48, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.radar10, borderWidth: 1, borderColor: colors.radar20 },
  archiveEyebrow: { color: colors.radar, fontSize: 7, fontWeight: '900', letterSpacing: 0.9 },
  databaseCta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.lg },
  databaseIcon: { width: 48, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,181,71,0.1)', borderWidth: 1, borderColor: 'rgba(255,181,71,0.18)' },
  databaseCopy: { flex: 1 },
  databaseEyebrow: { color: colors.warning, fontSize: 7, fontWeight: '900', letterSpacing: 1 },
  databaseTitle: { color: colors.text, fontSize: 14, fontWeight: '800', marginTop: 3 },
  databaseSubtitle: { color: colors.textSecondary, fontSize: 9, marginTop: 3 },
  atcTranscriptCta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderRadius: radius.md },
  atcTranscriptCtaPressed: { opacity: 0.65 },
  atcTranscriptIcon: { width: 48, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.radar10, borderWidth: 1, borderColor: colors.radar20 },
  atcTranscriptCopy: { flex: 1 },
  atcTranscriptTitle: { color: colors.text, fontSize: 13, fontWeight: '800' },
  atcTranscriptSubtitle: { color: colors.textSecondary, fontSize: 9, marginTop: 4 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 2, padding: spacing.xs },
  actionText: { color: colors.radar, fontSize: 11, fontWeight: '700' },
  timestamp: { color: colors.textMuted, fontSize: 9, fontWeight: '700', letterSpacing: 0.8 },
  sdrHero: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sdrIdentity: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  sdrIcon: { width: 48, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.radar10, borderWidth: 1, borderColor: colors.radar20 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.radar },
  connected: { color: colors.radar, fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  device: { color: colors.text, fontSize: 13, fontWeight: '700', marginTop: 3 },
  frequency: { alignItems: 'flex-end' },
  frequencyValue: { color: colors.text, fontSize: 24, fontWeight: '800' },
  frequencyUnit: { color: colors.textSecondary, fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  metricsRow: { flexDirection: 'row', marginTop: spacing.lg, paddingVertical: spacing.md, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border },
  metric: { flex: 1, alignItems: 'center', borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: colors.border },
  metricValue: { color: colors.text, fontSize: 13, fontWeight: '800' },
  metricLabel: { color: colors.textMuted, fontSize: 8, fontWeight: '700', letterSpacing: 0.8, marginTop: 4 },
  signalRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: spacing.md, gap: spacing.sm },
  signalLabel: { color: colors.textMuted, fontSize: 8, fontWeight: '700', letterSpacing: 0.8 },
  signalBars: { flex: 1, height: 20, flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  signalBar: { flex: 1, borderRadius: 1, backgroundColor: colors.white08 },
  signalBarActive: { backgroundColor: colors.radar },
  signalValue: { color: colors.radar, fontSize: 11, fontWeight: '800' },
  weatherHero: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: spacing.md },
  weatherLocation: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: spacing.sm },
  weatherLocationText: { color: colors.textSecondary, fontSize: 9, fontWeight: '700' },
  weatherUpdated: { color: colors.textMuted, fontSize: 7, fontWeight: '800', letterSpacing: 0.7, marginLeft: 'auto' },
  temperature: { color: colors.text, fontSize: 44, fontWeight: '300', letterSpacing: -2 },
  condition: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  weatherIcon: { width: 64, height: 64, borderRadius: 24, backgroundColor: 'rgba(255,181,71,0.1)', alignItems: 'center', justifyContent: 'center' },
  weatherGrid: { flexDirection: 'row', flexWrap: 'wrap', borderTopWidth: 1, borderColor: colors.border, paddingTop: spacing.sm },
  weatherMetric: { width: '50%', minHeight: 62, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  weatherMetricValue: { color: colors.text, fontSize: 12, fontWeight: '700' },
  weatherMetricLabel: { color: colors.textMuted, fontSize: 9, marginTop: 2 },
  weatherAttribution: { alignSelf: 'flex-end', flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.sm, paddingVertical: 4 },
  weatherAttributionText: { color: colors.blue, fontSize: 8, fontWeight: '700' },
  weatherUnavailable: { alignItems: 'center', paddingVertical: spacing.md },
  weatherUnavailableIcon: { width: 54, height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,181,71,0.1)' },
  weatherUnavailableTitle: { color: colors.text, fontSize: 14, fontWeight: '800', marginTop: spacing.sm },
  weatherUnavailableMessage: { color: colors.textSecondary, fontSize: 11, lineHeight: 17, textAlign: 'center', marginTop: spacing.xs, maxWidth: 290 },
  weatherActions: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.md },
  weatherPrimaryAction: { backgroundColor: colors.radar, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: 9 },
  weatherPrimaryActionText: { color: colors.background, fontSize: 10, fontWeight: '800' },
  weatherSecondaryAction: { borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: 9 },
  weatherSecondaryActionText: { color: colors.textSecondary, fontSize: 10, fontWeight: '800' },
  sectionHeading: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingTop: spacing.xs },
  sectionEyebrow: { color: colors.radar, fontSize: 10, fontWeight: '800', letterSpacing: 1.4 },
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: '800', marginTop: 3 },
  sectionCount: { color: colors.textMuted, fontSize: 9, fontWeight: '700', letterSpacing: 0.8 },
  aircraftList: { gap: spacing.sm, paddingRight: spacing.md },
  aircraftCard: { width: 176, padding: spacing.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md },
  aircraftTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  aircraftIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(255,181,71,0.1)', alignItems: 'center', justifyContent: 'center' },
  aircraftHex: { color: colors.textMuted, fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  aircraftName: { color: colors.text, fontSize: 15, fontWeight: '800' },
  aircraftModel: { color: colors.textSecondary, fontSize: 10, marginTop: 3 },
  aircraftRule: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  aircraftMetaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  alignRight: { alignItems: 'flex-end' },
  metaValue: { color: colors.text, fontSize: 11, fontWeight: '800' },
  metaLabel: { color: colors.textMuted, fontSize: 7, letterSpacing: 0.7, marginTop: 3 },
  lastSeen: { color: colors.textMuted, fontSize: 9, marginTop: spacing.sm },
  serverHero: { flexDirection: 'row', alignItems: 'center' },
  serverPulse: { width: 54, height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  serverCopy: { flex: 1, marginLeft: spacing.sm },
  serverTitle: { color: colors.text, fontSize: 13, fontWeight: '700' },
  serverSubtitle: { color: colors.textMuted, fontSize: 10, marginTop: 3 },
  latency: { color: colors.radar, fontSize: 14, fontWeight: '800' },
  serverRefresh: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: spacing.xs },
  serverRefreshDisabled: { opacity: 0.55 },
  serverRefreshText: { color: colors.radar, fontSize: 10, fontWeight: '800' },
  serverGrid: { gap: spacing.sm, marginTop: spacing.lg, paddingTop: spacing.md, borderTopWidth: 1, borderColor: colors.border },
  statusLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusLabel: { color: colors.textSecondary, fontSize: 11 },
  statusValue: { color: colors.text, fontSize: 11, fontWeight: '700' },
  microDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.radar },
  logs: { backgroundColor: colors.background, borderRadius: radius.sm, padding: spacing.sm, marginTop: spacing.md },
  logsHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  logsTitle: { color: colors.textMuted, fontSize: 8, fontWeight: '800', letterSpacing: 1 },
  liveLog: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  liveLogText: { color: colors.radar, fontSize: 8, fontWeight: '800' },
  logLine: { color: colors.textSecondary, fontFamily: 'monospace', fontSize: 9, lineHeight: 18 },
  updated: { color: colors.textMuted, fontSize: 9, textAlign: 'center', marginTop: spacing.xs },
});
