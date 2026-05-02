import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { formatCurrency } from '../../utils/locationUtils';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Card from '../../components/Card';

export default function ProfileScreen() {
  const { getCurrentUser, updateUser, logout } = useAppStore();
  const user = getCurrentUser()!;

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    nombres: user.nombres,
    correo: user.correo,
    telefono: user.telefono,
    telefonoSinpe: user.telefonoSinpe,
    alias: user.alias,
    direccion: user.direccion,
  });
  const [saving, setSaving] = useState(false);

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const handleSave = () => {
    const changed = form.correo !== user.correo || form.telefono !== user.telefono;
    setSaving(true);
    setTimeout(() => {
      updateUser(user.id, form);
      setSaving(false);
      setEditing(false);
      if (changed) {
        Alert.alert(
          '📨 Verificación Requerida',
          'Detectamos cambios en tu correo/teléfono. En un sistema real, recibirías un código de verificación.',
        );
      } else {
        Alert.alert('✅ Perfil actualizado');
      }
    }, 600);
  };

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={{ fontSize: 48 }}>
              {user.role === 'admin' ? '🛡️' : '🧑‍💼'}
            </Text>
          </View>
          <Text style={styles.userName}>{user.nombres}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user.role === 'admin' ? '⚙️ Administrador' : '🏡 Scout'}</Text>
          </View>
        </View>

        {/* Stats */}
        {user.role === 'scout' && (
          <Card>
            <Text style={styles.sectionLabel}>Mis Estadísticas</Text>
            <View style={styles.statsGrid}>
              {[
                { label: 'Ingresos', value: formatCurrency(user.totalIngresos), emoji: '💰' },
                { label: 'Capturadas', value: String(user.propiedadesCapturadas), emoji: '📷' },
                { label: 'Gestionadas', value: String(user.propiedadesGestionadas), emoji: '🤝' },
                { label: 'Ventas', value: String(user.propiedadesVendidas), emoji: '🏆' },
              ].map(s => (
                <View key={s.label} style={styles.statItem}>
                  <Text style={styles.statEmoji}>{s.emoji}</Text>
                  <Text style={styles.statValue}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Datos editables */}
        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <Text style={styles.sectionLabel}>Información Personal</Text>
            <TouchableOpacity onPress={() => setEditing(e => !e)}>
              <Text style={{ color: Colors.accent, fontWeight: '700' }}>{editing ? 'Cancelar' : '✏️ Editar'}</Text>
            </TouchableOpacity>
          </View>

          <Input label="Nombre completo" value={form.nombres} onChangeText={v => set('nombres', v)} editable={editing} />
          <Input label="Correo electrónico" value={form.correo} onChangeText={v => set('correo', v)} editable={editing} keyboardType="email-address" autoCapitalize="none" />
          <Input label="Cédula" value={user.cedula} onChangeText={() => {}} editable={false} />
          <Input label="Teléfono" value={form.telefono} onChangeText={v => set('telefono', v)} editable={editing} keyboardType="phone-pad" />
          <Input label="Teléfono SINPE" value={form.telefonoSinpe} onChangeText={v => set('telefonoSinpe', v)} editable={editing} keyboardType="phone-pad" />
          <Input label="Alias" value={form.alias} onChangeText={v => set('alias', v)} editable={editing} autoCapitalize="none" />
          <Input label="Dirección" value={form.direccion} onChangeText={v => set('direccion', v)} editable={editing} />

          {editing && (
            <Button
              title={saving ? 'Guardando...' : '💾 Guardar Cambios'}
              onPress={handleSave}
              disabled={saving}
            />
          )}
        </View>

        {/* Seguridad */}
        <Card>
          <Text style={styles.sectionLabel}>Seguridad y Cuenta</Text>
          <TouchableOpacity style={styles.menuRow}>
            <Text style={styles.menuLabel}>🔒 Cambiar contraseña</Text>
            <Text style={{ color: Colors.textSecondary }}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuRow} onPress={handleLogout}>
            <Text style={[styles.menuLabel, { color: Colors.danger }]}>🚪 Cerrar Sesión</Text>
            <Text style={{ color: Colors.textSecondary }}>›</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: 20, gap: 16, paddingBottom: 50 },
  avatarSection: { alignItems: 'center', gap: 8, paddingVertical: 20 },
  avatarCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: Colors.accentLight,
    alignItems: 'center', justifyContent: 'center',
  },
  userName: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  roleBadge: { backgroundColor: Colors.accentLight, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  roleText: { color: Colors.accent, fontWeight: '700', fontSize: 13 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 1, marginBottom: 12 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statItem: { width: '47%', alignItems: 'center', backgroundColor: Colors.bgInput, borderRadius: 12, padding: 14, gap: 4 },
  statEmoji: { fontSize: 24 },
  statValue: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  statLabel: { fontSize: 11, color: Colors.textSecondary },
  formCard: { backgroundColor: Colors.bgCard, borderRadius: 20, padding: 20, gap: 14 },
  formHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  menuRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  menuLabel: { fontSize: 15, color: Colors.textPrimary },
});