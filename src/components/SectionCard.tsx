import { PropsWithChildren, ReactNode } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';

interface SectionCardProps extends PropsWithChildren {
  title?: string;
  eyebrow?: string;
  action?: ReactNode;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}

export const SectionCard = ({ title, eyebrow, action, children, style, contentStyle }: SectionCardProps) => (
  <View style={[styles.card, style]}>
    {title || action ? (
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow.toUpperCase()}</Text> : null}
          {title ? <Text style={styles.title}>{title}</Text> : null}
        </View>
        {action}
      </View>
    ) : null}
    <View style={contentStyle}>{children}</View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    overflow: 'hidden',
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  titleGroup: { flexShrink: 1 },
  eyebrow: { color: colors.radar, fontSize: 10, fontWeight: '800', letterSpacing: 1.4, marginBottom: 3 },
  title: { color: colors.text, fontSize: 17, fontWeight: '700' },
});
