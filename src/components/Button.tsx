import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors } from '../theme/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'danger';
  disabled?: boolean;
}

export default function Button({ title, onPress, variant = 'primary', disabled }: ButtonProps) {
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  return (
    <TouchableOpacity
      style={[
        styles.btn,
        isPrimary && styles.primary,
        variant === 'ghost' && styles.ghost,
        isDanger && styles.danger,
        disabled && styles.disabled,
      ]}
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

const styles = StyleSheet.create({
  btn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  primary: { backgroundColor: Colors.accent },
  ghost: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Colors.border },
  danger: { backgroundColor: Colors.dangerLight, borderWidth: 1, borderColor: Colors.danger },
  disabled: { opacity: 0.5 },
  text: { fontSize: 16, fontWeight: '700', color: Colors.white },
  textGhost: { color: Colors.textSecondary },
  textDanger: { color: Colors.danger },
});