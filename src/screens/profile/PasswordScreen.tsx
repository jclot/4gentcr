import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { useAppStore } from '../../store/useAppStore';
import { useModalStore } from '../../store/useModalStore';
import { ChevronLeft, ShieldAlert } from 'lucide-react-native';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function PasswordScreen({ navigation }: any) {
  const { colors: C, fs } = useTheme();
  const { getCurrentUser, changePassword } = useAppStore();
  const { confirm } = useModalStore();
  const user = getCurrentUser();
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const styles = useMemo(() => makeStyles(C, fs), [C, fs]);

  const getStrength = (pass: string) => {
    if (pass.length === 0) return 0;
    if (pass.length < 6) return 1;
    if (pass.length >= 8 && /[A-Z]/.test(pass) && /[0-9]/.test(pass)) return 3;
    return 2;
  };

  const strength = getStrength(passwords.new);
  const strengthColors = [C.border, C.danger, C.warning, C.success];
  const strengthLabels = ['Ingresa tu nueva clave', 'Débil', 'Aceptable', 'Fuerte'];
  const passwordsMatch = passwords.new === passwords.confirm;

  const handleUpdatePassword = async () => {
    if (!user) return;
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      confirm({ title: 'Campos incompletos', message: 'Debes completar todos los campos.', confirmLabel: 'OK', onConfirm: () => {} }); return;
    }
    if (!passwordsMatch) {
      confirm({ title: 'Validación', message: 'Las contraseñas no coinciden.', confirmLabel: 'OK', onConfirm: () => {} }); return;
    }
    setLoading(true);
    try {
      await changePassword(user.id, passwords.current, passwords.new);
      setLoading(false);
      setPasswords({ current: '', new: '', confirm: '' });
      confirm({ title: 'Contraseña actualizada', message: 'Tu contraseña se cambió correctamente.', confirmLabel: 'OK', onConfirm: () => navigation.goBack() });
    } catch (err: any) {
      setLoading(false);
      confirm({ title: 'No se pudo actualizar', message: err?.message ?? 'Intenta de nuevo.', confirmLabel: 'OK', onConfirm: () => {} });
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Contraseña</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" automaticallyAdjustKeyboardInsets>
          <View style={styles.heroBox}>
            <ShieldAlert size={56} color={C.accent} />
            <Text style={styles.heroTitle}>Protege tu cuenta</Text>
            <Text style={styles.heroSub}>Te recomendamos usar al menos 8 caracteres, números y símbolos.</Text>
          </View>

          <View style={styles.formCard}>
            <Input label="Contraseña Actual" secureTextEntry value={passwords.current} onChangeText={(v) => setPasswords({ ...passwords, current: v })} placeholder="********" />
            <View style={styles.divider} />
            <Input label="Nueva Contraseña" secureTextEntry value={passwords.new} onChangeText={(v) => setPasswords({ ...passwords, new: v })} placeholder="Mínimo 8 caracteres" />
            <View style={styles.strengthContainer}>
              <View style={styles.barsRow}>
                {[1, 2, 3].map(i => (
                  <View key={i} style={[styles.strengthBar, { backgroundColor: strength >= i ? strengthColors[strength] : C.bgInput }]} />
                ))}
              </View>
              <Text style={[styles.strengthText, { color: strength > 0 ? strengthColors[strength] : C.textSecondary }]}>
                {strengthLabels[strength]}
              </Text>
            </View>
            <Input
              label="Confirmar Nueva Contraseña"
              secureTextEntry
              value={passwords.confirm}
              onChangeText={(v) => setPasswords({ ...passwords, confirm: v })}
              placeholder="Repite la contraseña"
              error={passwords.confirm.length > 0 && passwords.new !== passwords.confirm ? 'Las contraseñas no coinciden' : undefined}
            />
          </View>

          <View style={{ marginTop: 20 }}>
            <Button title={loading ? 'Actualizando...' : 'Actualizar Contraseña'} onPress={handleUpdatePassword} disabled={loading || strength < 2 || !passwordsMatch} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (C: any, fs: (n: number) => number) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: C.border },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  title: { fontSize: fs(18), fontWeight: '800', color: C.textPrimary },
  scroll: { padding: 20, paddingBottom: 80 },
  heroBox: { alignItems: 'center', backgroundColor: C.accentLight, padding: 30, borderRadius: 24, marginBottom: 24 },
  heroTitle: { fontSize: fs(20), fontWeight: '800', color: C.textPrimary, marginTop: 16, marginBottom: 8 },
  heroSub: { fontSize: fs(13), color: C.textSecondary, textAlign: 'center', lineHeight: 20 },
  formCard: { backgroundColor: C.bgCard, padding: 20, borderRadius: 20, borderWidth: 1, borderColor: C.border, gap: 16 },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 8 },
  strengthContainer: { marginTop: -4 },
  barsRow: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  strengthBar: { flex: 1, height: 4, borderRadius: 2 },
  strengthText: { fontSize: fs(12), fontWeight: '700', textAlign: 'right' },
});
