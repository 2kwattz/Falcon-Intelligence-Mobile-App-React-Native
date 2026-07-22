import { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

interface DetailScaffoldProps extends PropsWithChildren {
  eyebrow: string;
  title: string;
  description: string;
}

export const DetailScaffold = ({ eyebrow, title, description, children }: DetailScaffoldProps) => (
  <SafeAreaView style={styles.screen}>
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>{eyebrow.toUpperCase()}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      {children}
    </ScrollView>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.huge, gap: spacing.md },
  header: { paddingVertical: spacing.md },
  eyebrow: { color: colors.radar, fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
  title: { color: colors.text, fontSize: 28, fontWeight: '800', letterSpacing: -0.5, marginTop: 4 },
  description: { color: colors.textSecondary, fontSize: 13, lineHeight: 19, marginTop: spacing.xs },
});
