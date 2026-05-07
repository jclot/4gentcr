import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { isValidEmail } from '../../utils/locationUtils';
import { UserPlus, AlertCircle } from 'lucide-react-native';
import Input from '../../components/Input';
import Button from '../../components/Button';

type FormKey =
  | 'nombres' | 'correo' | 'cedula' | 'telefono'
  | 'telefonoSinpe' | 'alias' | 'password' | 'passwordConfirm' | 'direccion';

const INITIAL: Record<FormKey, string> = {
  nombres: '', correo: '', cedula: '', telefono: '',
  telefonoSinpe: '', alias: '', password: '', passwordConfirm: '', direccion: '',
};

export default function RegisterScreen({ navigation }: any) {
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<FormKey, string>>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register } = useAppStore();

  const setField = (key: FormKey, value: string) => {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(e => ({ ...e, [key]: undefined }));
    setGeneralError(null);
  };

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.nombres.trim()) {
      e.nombres = 'El nombre es obligatorio.';
    } else if (form.nombres.trim().length < 2) {
      e.nombres = 'El nombre debe tener al menos 2 caracteres.';
    }
    if (!form.correo.trim()) {
      e.correo = 'El correo es obligatorio.';
    } else if (!isValidEmail(form.correo)) {
      e.correo = 'Ingresá un correo válido (ej: nombre@dominio.com).';
    }
    if (!form.cedula.trim()) {
      e.cedula = 'La cédula es obligatoria.';
    } else if (form.cedula.replace(/\D/g, '').length < 9) {
      e.cedula = 'La cédula debe tener al menos 9 dígitos.';
    }
    if (!form.telefono.trim()) {
      e.telefono = 'El teléfono es obligatorio.';
    } else if (form.telefono.replace(/\D/g, '').length < 8) {
      e.telefono = 'El teléfono debe tener al menos 8 dígitos.';
    }
    if (!form.alias.trim()) {
      e.alias = 'El alias es obligatorio.';
    } else if (form.alias.trim().length < 2) {
      e.alias = 'El alias debe tener al menos 2 caracteres.';
    }
    if (form.password.length < 6) {
      e.password = 'La contraseña debe tener al menos 6 caracteres.';
    }
    if (!form.passwordConfirm) {
      e.passwordConfirm = 'Confirmá tu contraseña.';
    } else if (form.password !== form.passwordConfirm) {
      e.passwordConfirm = 'Las contraseñas no coinciden.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setGeneralError(null);
    setLoading(true);
    try {
      await register({
        nombres: form.nombres.trim(),
        correo: form.correo.trim().toLowerCase(),
        cedula: form.cedula.trim(),
        telefono: form.telefono.trim(),
        telefonoSinpe: form.telefonoSinpe.trim() || form.telefono.trim(),
        alias: form.alias.trim(),
        password: form.password,
        direccion: form.direccion.trim(),
        role: 'scout',
        avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(form.alias.trim())}`,
      });
      // AppNavigator muestra el overlay automáticamente al detectar currentUserId
    } catch (err: any) {
      const msg: string = err?.message ?? '';

      if (Array.isArray(err?.detalles) && err.detalles.length > 0) {
        const fieldErrs: Partial<Record<FormKey, string>> = {};
        const loose: string[] = [];
        for (const { campo, mensaje } of err.detalles as { campo: string; mensaje: string }[]) {
          if (campo in INITIAL) fieldErrs[campo as FormKey] = mensaje;
          else loose.push(mensaje);
        }
        if (Object.keys(fieldErrs).length) setErrors(prev => ({ ...prev, ...fieldErrs }));
        setGeneralError(loose.length ? loose.join(' ') : 'Corregí los campos marcados arriba.');
        return;
      }

      if (msg.toLowerCase().includes('correo') || msg.toLowerCase().includes('registrado')) {
        setGeneralError('Ya existe una cuenta con ese correo. Intentá iniciar sesión.');
      } else if (msg.includes('Sin conexión') || msg.includes('Network')) {
        setGeneralError('No se pudo conectar al servidor. Verificá tu red.');
      } else {
        setGeneralError(msg || 'No se pudo crear la cuenta. Intentá de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (id: FormKey, label: string, props: any = {}) => (
    <Input
      key={id}
      label={label}
      value={form[id]}
      onChangeText={(v: string) => setField(id, v)}
      error={errors[id]}
      {...props}
    />
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView
          contentContainerStyle={{ padding: 24, gap: 16, paddingBottom: 80 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets
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

        {generalError && (
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 8,
            backgroundColor: '#FEE2E2', borderRadius: 12, padding: 14,
            borderLeftWidth: 3, borderLeftColor: '#EF4444',
          }}>
            <AlertCircle size={16} color="#EF4444" />
            <Text style={{ flex: 1, fontSize: 13, color: '#B91C1C', lineHeight: 18 }}>
              {generalError}
            </Text>
          </View>
        )}

        <View style={{ backgroundColor: Colors.bgCard, borderRadius: 20, padding: 20, gap: 14 }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.accent, letterSpacing: 1 }}>
            INFORMACIÓN PERSONAL
          </Text>
          {renderInput('nombres', 'Nombre completo *', { placeholder: 'Juan Pérez Rojas', autoCapitalize: 'words' })}
          {renderInput('correo', 'Correo electrónico *', { placeholder: 'juan@correo.com', keyboardType: 'email-address', autoCapitalize: 'none', autoCorrect: false })}
          {renderInput('cedula', 'Cédula *', { placeholder: '1-0000-0000' })}
          {renderInput('telefono', 'Teléfono *', { placeholder: '8888-0000', keyboardType: 'phone-pad' })}
          {renderInput('telefonoSinpe', 'Teléfono SINPE', { placeholder: 'Mismo u otro', keyboardType: 'phone-pad' })}
          {renderInput('alias', 'Alias / Nombre público *', { placeholder: 'juanP', autoCapitalize: 'none' })}
          {renderInput('password', 'Contraseña *', { placeholder: 'Mín. 6 caracteres', secureTextEntry: true })}
          {renderInput('passwordConfirm', 'Confirmar contraseña *', { placeholder: 'Repetí la contraseña', secureTextEntry: true })}
          {renderInput('direccion', 'Dirección', { placeholder: 'San José, Costa Rica' })}
        </View>

        <Button
          title={loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          onPress={handleRegister}
          disabled={loading}
        />
        <Button
          title="Ya tengo cuenta"
          onPress={() => navigation.goBack()}
          variant="ghost"
        />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
