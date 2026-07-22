import { TextStyle } from 'react-native';

export const typography: Record<string, TextStyle> = {
  display: { fontSize: 30, fontWeight: '800', letterSpacing: -0.8 },
  title: { fontSize: 22, fontWeight: '700', letterSpacing: -0.3 },
  section: { fontSize: 17, fontWeight: '700' },
  body: { fontSize: 15, fontWeight: '400' },
  bodyMedium: { fontSize: 15, fontWeight: '600' },
  caption: { fontSize: 12, fontWeight: '500' },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 1.1 },
};
