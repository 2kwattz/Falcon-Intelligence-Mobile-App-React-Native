import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

interface LoadingStateProps {
  label?: string;
  fullScreen?: boolean;
}

export const LoadingState = ({ label = 'Synchronizing Falcon data…', fullScreen = false }: LoadingStateProps) => (
  <View style={[styles.container, fullScreen && styles.fullScreen]}>
    <ActivityIndicator size="large" color={colors.radar} />
    <Text style={styles.label}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { padding: spacing.xxl, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  fullScreen: { flex: 1, backgroundColor: colors.background },
  label: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
});
