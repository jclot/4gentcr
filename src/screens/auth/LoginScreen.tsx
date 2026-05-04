import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../store/useAppStore';
import { useModalStore } from '../../store/useModalStore';
import { Colors } from '../../theme/colors';
import { isValidEmail } from '../../utils/locationUtils';
import { Home } from 'lucide-react-native';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function LoginScreen({ navigation }: any) {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ correo?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const { login } = useAppStore();
  const { confirm } = useModalStore();

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!correo.trim()) {
      newErrors.correo = 'El correo es obligatorio.';
    } else if (!isValidEmail(correo)) {
      newErrors.correo = 'Ingresá un correo válido (ej: nombre@dominio.com).';
    }
    if (!password) {
      newErrors.password = 'La contraseña es obligatoria.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = () => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      const user = login(correo.trim(), password);
      setLoading(false);
      if (!user) {
        confirm({
          title: 'Credenciales incorrectas',
          message:
            'No encontramos una cuenta con ese correo y contraseña.\n\n' +
            'Prueba:\ncarlos@virtualagent.cr / 123456\nadmin@virtualagent.cr / admin123',
          confirmLabel: 'Entendido',
          cancelLabel: 'Registrarme',
          onConfirm: () => { },
          onCancel: () => navigation.navigate('Register'),
        });
      }
    }, 600);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Home size={48} color={Colors.white} />
            </View>
            <Text style={styles.title}>Virtual Agent</Text>
            <Text style={styles.subtitle}>El Uber de Bienes Raíces</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.formTitle}>Iniciar Sesión</Text>

            <Input
              label="Correo electrónico"
              value={correo}
              onChangeText={v => { setCorreo(v); setErrors(e => ({ ...e, correo: undefined })); }}
              placeholder="correo@ejemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.correo}
            />
            <Input
              label="Contraseña"
              value={password}
              onChangeText={v => { setPassword(v); setErrors(e => ({ ...e, password: undefined })); }}
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
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  title: { fontSize: 32, fontWeight: '800', color: Colors.textPrimary, letterSpacing: 1 },
  subtitle: { fontSize: 14, color: Colors.accent, marginTop: 4 },
  form: { backgroundColor: Colors.bgCard, borderRadius: 20, padding: 24, gap: 16 },
  formTitle: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8 },
  hint: { backgroundColor: Colors.accentLight, borderRadius: 10, padding: 12 },
  hintText: { fontSize: 12, color: Colors.accent, lineHeight: 20 },
  linkBtn: { alignItems: 'center', marginTop: 8 },
  link: { color: Colors.textSecondary, fontSize: 14 },
});