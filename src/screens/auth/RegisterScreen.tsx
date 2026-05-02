import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function RegisterScreen({ navigation }: any) {
  const [form, setForm] = useState({
    nombres: '', correo: '', cedula: '', telefono: '',
    telefonoSinpe: '', alias: '', password: '', direccion: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAppStore();

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const handleRegister = () => {
    const required = ['nombres', 'correo', 'cedula', 'telefono', 'alias', 'password'];
    for (const key of required) {
      if (!form[key as keyof typeof form]) {
        Alert.alert('Error', `El campo "${key}" es obligatorio.`); return;
      }
    }
    if (form.password.length < 6) { Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres.'); return; }
    setLoading(true);
    setTimeout(() => {
      register({
        ...form,
        telefonoSinpe: form.telefonoSinpe || form.telefono,
        role: 'scout',
        avatar: `https://i.pravatar.cc/150?u=${form.alias}`,
      });
      setLoading(false);
    }, 800);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }} keyboardShouldPersistTaps="handled">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Text style={{ fontSize: 28 }}>👤</Text>
          <View>
            <Text style={{ fontSize: 24, fontWeight: '800', color: Colors.textPrimary }}>Crear Cuenta</Text>
            <Text style={{ fontSize: 12, color: Colors.textSecondary }}>Únete a Virtual Agent como Scout</Text>
          </View>
        </View>

        <View style={{ backgroundColor: Colors.bgCard, borderRadius: 20, padding: 20, gap: 14 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.accent }}>INFORMACIÓN PERSONAL</Text>
          <Input label="Nombre completo *" value={form.nombres} onChangeText={v => set('nombres', v)} placeholder="Juan Pérez Rojas" />
          <Input label="Correo electrónico *" value={form.correo} onChangeText={v => set('correo', v)} placeholder="juan@correo.com" keyboardType="email-address" autoCapitalize="none" />
          <Input label="Cédula *" value={form.cedula} onChangeText={v => set('cedula', v)} placeholder="1-0000-0000" />
          <Input label="Teléfono *" value={form.telefono} onChangeText={v => set('telefono', v)} placeholder="8888-0000" keyboardType="phone-pad" />
          <Input label="Teléfono SINPE" value={form.telefonoSinpe} onChangeText={v => set('telefonoSinpe', v)} placeholder="Mismo u otro" keyboardType="phone-pad" />
          <Input label="Alias / Nombre público *" value={form.alias} onChangeText={v => set('alias', v)} placeholder="juanP" autoCapitalize="none" />
          <Input label="Contraseña *" value={form.password} onChangeText={v => set('password', v)} placeholder="Min. 6 caracteres" secureTextEntry />
          <Input label="Dirección" value={form.direccion} onChangeText={v => set('direccion', v)} placeholder="San José, Costa Rica" />
        </View>

        <Button title={loading ? 'Creando cuenta...' : 'Crear Cuenta'} onPress={handleRegister} disabled={loading} />
        <Button title="Ya tengo cuenta" onPress={() => navigation.goBack()} variant="ghost" />
      </ScrollView>
    </SafeAreaView>
  );
}