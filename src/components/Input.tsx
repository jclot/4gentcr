import React, { useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { AlertCircle } from 'lucide-react-native';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
}

export default function Input({ label, error, style, ...props }: InputProps) {
  const { colors: C, fs } = useTheme();
  const styles = useMemo(() => makeStyles(C, fs), [C, fs]);
  const hasError = !!error;
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, hasError && styles.inputError, !props.editable && props.editable !== undefined && styles.disabled, style]}
        placeholderTextColor={C.textSecondary}
        selectionColor={C.accent}
        {...props}
      />
      {hasError && (
        <View style={styles.errorContainer}>
          <AlertCircle size={14} color={C.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const makeStyles = (C: any, fs: (n: number) => number) => StyleSheet.create({
  container: { gap: 6 },
  label: { fontSize: fs(13), fontWeight: '600', color: C.textSecondary },
  input: {
    backgroundColor: C.bgInput, borderRadius: 12, padding: 14,
    color: C.textPrimary, fontSize: fs(15), borderWidth: 1, borderColor: C.border,
  },
  inputError: { borderColor: C.danger },
  disabled: { opacity: 0.6 },
  errorContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  errorText: { fontSize: fs(12), color: C.danger },
});
