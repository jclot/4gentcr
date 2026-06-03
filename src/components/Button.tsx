import React, { useMemo } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'danger';
  disabled?: boolean;
}

export default function Button({ title, onPress, variant = 'primary', disabled }: ButtonProps) {
  const { colors: C, fs } = useTheme();
  const styles = useMemo(() => makeStyles(C, fs), [C, fs]);
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  return (
    <TouchableOpacity
      style={[styles.btn, isPrimary && styles.primary, variant === 'ghost' && styles.ghost, isDanger && styles.danger, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, !isPrimary && styles.textGhost, isDanger && styles.textDanger]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const makeStyles = (C: any, fs: (n: number) => number) => StyleSheet.create({
  btn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  primary: { backgroundColor: C.accent },
  ghost: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: C.border },
  danger: { backgroundColor: C.dangerLight, borderWidth: 1, borderColor: C.danger },
  disabled: { opacity: 0.5 },
  text: { fontSize: fs(16), fontWeight: '700', color: C.white },
  textGhost: { color: C.textSecondary },
  textDanger: { color: C.danger },
});
