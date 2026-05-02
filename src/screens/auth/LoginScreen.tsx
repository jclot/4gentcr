import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert,
  KeyboardAvoidingView, Platform, ScrollView, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function LoginScreen({ navigation }: any) {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAppStore();

  const handleLogin = () => {
    if (!correo || !password) {
      Alert.alert('Error', 'Por favor completá todos los campos.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const user = login(correo.trim(), password);
      setLoading(false);
      if (!user) Alert.alert('Error', 'Correo o contraseña incorrectos.\n\nPrueba: carlos@virtualagent.cr / 123456');
    }, 600);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.logo}>🏡</Text>
            <Text style={styles.title}>Virtual Agent</Text>
            <Text style={styles.subtitle}>El Uber de Bienes Raíces</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.formTitle}>Iniciar Sesión</Text>
            <Input
              label="Correo electrónico"
              value={correo}
              onChangeText={setCorreo}
              placeholder="correo@ejemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
            />

            <View style={styles.hint}>
              <Text style={styles.hintText}>
                Scout: carlos@virtualagent.cr / 123456{'\n'}
                Admin: admin@virtualagent.cr / admin123
              </Text>
            </View>

            <Button title={loading ? 'Ingresando...' : 'Ingresar'} onPress={handleLogin} disabled={loading} />
            <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.linkBtn}>
              <Text style={styles.link}>¿No tenés cuenta? <Text style={{ color: Colors.accent }}>Registrate</Text></Text>
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
  logo: { fontSize: 64 },
  title: { fontSize: 32, fontWeight: '800', color: Colors.textPrimary, letterSpacing: 1 },
  subtitle: { fontSize: 14, color: Colors.accent, marginTop: 4 },
  form: { backgroundColor: Colors.bgCard, borderRadius: 20, padding: 24, gap: 16 },
  formTitle: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8 },
  hint: { backgroundColor: Colors.accentLight, borderRadius: 10, padding: 12 },
  hintText: { fontSize: 12, color: Colors.accent, lineHeight: 20 },
  linkBtn: { alignItems: 'center', marginTop: 8 },
  link: { color: Colors.textSecondary, fontSize: 14 },
});