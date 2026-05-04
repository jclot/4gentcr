import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../store/useAppStore';
import { useModalStore } from '../../store/useModalStore';
import { Colors } from '../../theme/colors';
import { isValidEmail } from '../../utils/locationUtils';
import { UserPlus } from 'lucide-react-native';
import Input from '../../components/Input';
import Button from '../../components/Button';

type FormKey = 'nombres' | 'correo' | 'cedula' | 'telefono' | 'telefonoSinpe' | 'alias' | 'password' | 'passwordConfirm' | 'direccion';

const INITIAL: Record<FormKey, string> = {
  nombres: '', correo: '', cedula: '', telefono: '',
  telefonoSinpe: '', alias: '', password: '', passwordConfirm: '', direccion: '',
};

export default function RegisterScreen({ navigation }: any) {
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<FormKey, string>>>({});
  const [loading, setLoading] = useState(false);

  const { register } = useAppStore();
  const { confirm } = useModalStore();

  const setField = (key: FormKey, value: string) => {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(e => ({ ...e, [key]: undefined }));
  };

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.nombres.trim()) e.nombres = 'El nombre es obligatorio.';
    if (!form.correo.trim()) {
      e.correo = 'El correo es obligatorio.';
    } else if (!isValidEmail(form.correo)) {
      e.correo = 'Ingresá un correo válido (ej: nombre@dominio.com).';
    }
    if (!form.cedula.trim()) e.cedula = 'La cédula es obligatoria.';
    if (!form.telefono.trim()) e.telefono = 'El teléfono es obligatorio.';
    if (!form.alias.trim()) e.alias = 'El alias es obligatorio.';
    if (form.password.length < 6) e.password = 'Mínimo 6 caracteres.';
    if (form.password !== form.passwordConfirm) {
      e.passwordConfirm = 'Las contraseñas no coinciden.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = () => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      register({
        nombres: form.nombres.trim(),
        correo: form.correo.trim().toLowerCase(),
        cedula: form.cedula.trim(),
        telefono: form.telefono.trim(),
        telefonoSinpe: form.telefonoSinpe.trim() || form.telefono.trim(),
        alias: form.alias.trim(),
        password: form.password,
        direccion: form.direccion.trim(),
        role: 'scout',
        avatar: `https://i.pravatar.cc/150?u=${form.alias}`,
      });
      setLoading(false);
    }, 800);
  };

  const F = ({ label, id, ...props }: any) => (
    <Input
      label={label}
      value={form[id as FormKey]}
      onChangeText={(v: string) => setField(id, v)}
      error={errors[id as FormKey]}
      {...props}
    />
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>
      <ScrollView
        contentContainerStyle={{ padding: 24, gap: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <UserPlus size={36} color={Colors.textPrimary} />
          <View>
            <Text style={{ fontSize: 24, fontWeight: '800', color: Colors.textPrimary }}>
              Crear Cuenta
            </Text>
            <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 2 }}>
              Únete a Virtual Agent como Scout
            </Text>
          </View>
        </View>

        <View style={{ backgroundColor: Colors.bgCard, borderRadius: 20, padding: 20, gap: 14 }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.accent, letterSpacing: 1 }}>
            INFORMACIÓN PERSONAL
          </Text>

          <F id="nombres" label="Nombre completo *" placeholder="Juan Pérez Rojas" autoCapitalize="words" />
          <F
            id="correo"
            label="Correo electrónico *"
            placeholder="juan@correo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <F id="cedula" label="Cédula *" placeholder="1-0000-0000" />
          <F id="telefono" label="Teléfono *" placeholder="8888-0000" keyboardType="phone-pad" />
          <F id="telefonoSinpe" label="Teléfono SINPE" placeholder="Mismo u otro" keyboardType="phone-pad" />
          <F id="alias" label="Alias / Nombre público *" placeholder="juanP" autoCapitalize="none" />
          <F id="password" label="Contraseña *" placeholder="Mín. 6 caracteres" secureTextEntry />
          <F id="passwordConfirm" label="Confirmar contraseña *" placeholder="Repetí la contraseña" secureTextEntry />
          <F id="direccion" label="Dirección" placeholder="San José, Costa Rica" />
        </View>

        <Button
          title={loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          onPress={handleRegister}
          disabled={loading}
        />
        <Button title="Ya tengo cuenta" onPress={() => navigation.goBack()} variant="ghost" />
      </ScrollView>
    </SafeAreaView>
  );
}