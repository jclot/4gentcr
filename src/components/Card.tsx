import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function Card({ children }: { children: React.ReactNode }) {
  const { colors: C } = useTheme();
  const styles = useMemo(() => makeStyles(C), [C]);
  return <View style={styles.card}>{children}</View>;
}

const makeStyles = (C: any) => StyleSheet.create({
  card: { backgroundColor: C.bgCard, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: C.border },
});
