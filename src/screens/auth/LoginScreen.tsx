import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../../theme/ThemeContext';
import { isValidEmail } from '../../utils/locationUtils';
import { Home, AlertCircle } from 'lucide-react-native';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function LoginScreen({ navigation }: any) {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ correo?: string; password?: string }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAppStore();
  const { colors: C, fs } = useTheme();
  const styles = useMemo(() => makeStyles(C, fs), [C, fs]);

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!correo.trim()) {
      e.correo = 'El correo es obligatorio.';
    } else if (!isValidEmail(correo)) {
      e.correo = 'Ingresá un correo válido (ej: nombre@dominio.com).';
    }
    if (!password) {
      e.password = 'La contraseña es obligatoria.';
    } else if (password.length < 6) {
      e.password = 'La contraseña debe tener al menos 6 caracteres.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setGeneralError(null);
    setLoading(true);
    try {
      await login(correo.trim().toLowerCase(), password);
    } catch (err: any) {
      const msg: string = err?.message ?? '';
      if (msg === 'UNAUTHORIZED' || msg.toLowerCase().includes('credenciales')) {
        setGeneralError('Correo o contraseña incorrectos. Verificá tus datos.');
      } else if (msg.includes('Sin conexión') || msg.includes('Network')) {
        setGeneralError('No se pudo conectar al servidor. Verificá tu red.');
      } else {
        setGeneralError(msg || 'Ocurrió un error inesperado. Intentá de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets
        >
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Home size={48} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>Virtual Agent</Text>
            <Text style={styles.subtitle}>El Uber de Bienes Raíces</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.formTitle}>Iniciar Sesión</Text>

            {generalError && (
              <View style={styles.errorBanner}>
                <AlertCircle size={16} color={C.danger} />
                <Text style={styles.errorBannerText}>{generalError}</Text>
              </View>
            )}

            <Input
              label="Correo electrónico"
              value={correo}
              onChangeText={(v: string) => {
                setCorreo(v);
                setErrors(e => ({ ...e, correo: undefined }));
                setGeneralError(null);
              }}
              placeholder="correo@ejemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.correo}
            />

            <Input
              label="Contraseña"
              value={password}
              onChangeText={(v: string) => {
                setPassword(v);
                setErrors(e => ({ ...e, password: undefined }));
                setGeneralError(null);
              }}
              placeholder="••••••••"
              secureTextEntry
              error={errors.password}
            />

            <View style={styles.hint}>
              <Text style={styles.hintText}>
                Scout: carlos@virtualagent.cr / 123456{'\n'}
                Admin: admin@virtualagent.cr / admin123
              </Text>
            </View>

            <Button
              title={loading ? 'Ingresando...' : 'Ingresar'}
              onPress={handleLogin}
              disabled={loading}
            />

            <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.linkBtn}>
              <Text style={styles.link}>
                ¿No tenés cuenta?{' '}
                <Text style={{ color: C.accent }}>Registrate</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (C: any, fs: (n: number) => number) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24, paddingBottom: 56 },
  header: { alignItems: 'center', marginBottom: 40 },
  iconContainer: {
    backgroundColor: C.accent, padding: 20, borderRadius: 24, marginBottom: 16,
    shadowColor: C.accent, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 10,
  },
  title: { fontSize: fs(32), fontWeight: '800', color: C.textPrimary, letterSpacing: 1 },
  subtitle: { fontSize: fs(14), color: C.accent, marginTop: 4 },
  form: { backgroundColor: C.bgCard, borderRadius: 20, padding: 24, gap: 16 },
  formTitle: { fontSize: fs(22), fontWeight: '700', color: C.textPrimary, marginBottom: 8 },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: C.dangerLight, borderRadius: 10, padding: 12,
    borderLeftWidth: 3, borderLeftColor: C.danger,
  },
  errorBannerText: { flex: 1, fontSize: fs(13), color: C.danger, lineHeight: 18 },
  hint: { backgroundColor: C.accentLight, borderRadius: 10, padding: 12 },
  hintText: { fontSize: fs(12), color: C.accent, lineHeight: 20 },
  linkBtn: { alignItems: 'center', marginTop: 8 },
  link: { color: C.textSecondary, fontSize: fs(14) },
});
