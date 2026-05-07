import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
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
      // El AppNavigator detecta el cambio en currentUserId y muestra
      // el AuthTransitionOverlay automáticamente. No hay que hacer nada aquí.
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
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Home size={48} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>Virtual Agent</Text>
            <Text style={styles.subtitle}>El Uber de Bienes Raíces</Text>
          </View>

          {/* Formulario */}
          <View style={styles.form}>
            <Text style={styles.formTitle}>Iniciar Sesión</Text>

            {generalError && (
              <View style={styles.errorBanner}>
                <AlertCircle size={16} color="#EF4444" />
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

            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              style={styles.linkBtn}
            >
              <Text style={styles.link}>
                ¿No tenés cuenta?{' '}
                <Text style={{ color: Colors.accent }}>Registrate</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 40 },
  iconContainer: {
    backgroundColor: Colors.accent,
    padding: 20, borderRadius: 24, marginBottom: 16,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 10,
  },
  title: { fontSize: 32, fontWeight: '800', color: Colors.textPrimary, letterSpacing: 1 },
  subtitle: { fontSize: 14, color: Colors.accent, marginTop: 4 },
  form: { backgroundColor: Colors.bgCard, borderRadius: 20, padding: 24, gap: 16 },
  formTitle: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8 },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FEE2E2', borderRadius: 10, padding: 12,
    borderLeftWidth: 3, borderLeftColor: '#EF4444',
  },
  errorBannerText: { flex: 1, fontSize: 13, color: '#B91C1C', lineHeight: 18 },
  hint: { backgroundColor: Colors.accentLight, borderRadius: 10, padding: 12 },
  hintText: { fontSize: 12, color: Colors.accent, lineHeight: 20 },
  linkBtn: { alignItems: 'center', marginTop: 8 },
  link: { color: Colors.textSecondary, fontSize: 14 },
});