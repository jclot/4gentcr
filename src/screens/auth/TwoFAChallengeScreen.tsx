import React, { useState, useRef, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShieldCheck } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAppStore } from '../../store/useAppStore';
import Button from '../../components/Button';

export default function TwoFAChallengeScreen() {
  const { colors: C, fs } = useTheme();
  const styles = useMemo(() => makeStyles(C, fs), [C, fs]);
  const { completeTwoFALogin, cancelTwoFALogin } = useAppStore();

  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<TextInput>(null);

  const handleChange = (text: string) => {
    setError('');
    setPin(text.replace(/\D/g, '').slice(0, 6));
  };

  const handleVerify = async () => {
    if (pin.length !== 6) {
      setError('Ingresa los 6 dígitos del código.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await completeTwoFALogin(pin);
    } catch (err: any) {
      setError(err?.message ?? 'Código incorrecto. Intenta de nuevo.');
      setPin('');
      inputRef.current?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom', 'left', 'right']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.inner}>
          <View style={styles.iconBox}>
            <ShieldCheck size={48} color={C.accent} />
          </View>

          <Text style={styles.title}>Verificación en 2 Pasos</Text>
          <Text style={styles.subtitle}>
            Abre tu app autenticadora e ingresa el código de 6 dígitos que aparece para Virtual Agent.
          </Text>

          {/* PIN boxes */}
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => inputRef.current?.focus()}
            style={styles.pinRow}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.pinBox,
                  pin[i] !== undefined && styles.pinBoxFilled,
                  pin.length === i && styles.pinBoxActive,
                ]}
              >
                <Text style={styles.pinChar}>{pin[i] ?? ''}</Text>
              </View>
            ))}
          </TouchableOpacity>

          <TextInput
            ref={inputRef}
            value={pin}
            onChangeText={handleChange}
            keyboardType="number-pad"
            maxLength={6}
            caretHidden
            blurOnSubmit={false}
            style={styles.hiddenInput}
            autoFocus
            onBlur={() => {
              if (pin.length < 6) setTimeout(() => inputRef.current?.focus(), 50);
            }}
          />

          {!!error && <Text style={styles.errorText}>{error}</Text>}

          <View style={{ width: '100%', marginTop: 8 }}>
            {isLoading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator color={C.accent} size="large" />
              </View>
            ) : (
              <Button
                title="Verificar Código"
                onPress={handleVerify}
                disabled={pin.length !== 6}
              />
            )}
          </View>

          <TouchableOpacity onPress={cancelTwoFALogin} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Volver al inicio de sesión</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (C: any, fs: (n: number) => number) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  inner: {
    flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28,
  },
  iconBox: {
    width: 96, height: 96, borderRadius: 32,
    backgroundColor: C.accentLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  title: {
    fontSize: fs(24), fontWeight: '900', color: C.textPrimary,
    textAlign: 'center', marginBottom: 12,
  },
  subtitle: {
    fontSize: fs(15), color: C.textSecondary,
    textAlign: 'center', lineHeight: 22, marginBottom: 32,
  },
  pinRow: {
    flexDirection: 'row', gap: 10, marginBottom: 12,
    width: '100%', justifyContent: 'center',
  },
  pinBox: {
    width: 48, height: 60, borderRadius: 14,
    borderWidth: 2, borderColor: C.border,
    backgroundColor: C.bgCard,
    alignItems: 'center', justifyContent: 'center',
  },
  pinBoxFilled: { borderColor: C.accent, backgroundColor: C.accentLight },
  pinBoxActive: { borderColor: C.accent + 'AA' },
  pinChar: { fontSize: fs(24), fontWeight: '800', color: C.textPrimary },
  hiddenInput: { position: 'absolute', top: -500, left: -500, opacity: 0, width: 1, height: 1 },
  errorText: {
    color: C.danger, fontSize: fs(13), marginBottom: 16,
    textAlign: 'center', width: '100%',
  },
  loadingBox: { height: 56, alignItems: 'center', justifyContent: 'center' },
  cancelBtn: { marginTop: 24, padding: 10 },
  cancelText: { color: C.accent, fontSize: fs(14), fontWeight: '600' },
});
