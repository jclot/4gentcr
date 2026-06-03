import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, KeyboardAvoidingView, Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { useAppStore } from '../../store/useAppStore';
import { useModalStore } from '../../store/useModalStore';
import { ChevronLeft, Camera, Lock, Info } from 'lucide-react-native';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function PersonalDataScreen({ navigation }: any) {
  const { colors: C, fs } = useTheme();
  const { getCurrentUser, updateUser } = useAppStore();
  const { confirm } = useModalStore();
  const user = getCurrentUser();
  const styles = useMemo(() => makeStyles(C, fs), [C, fs]);

  const [form, setForm] = useState({
    nombres: user?.nombres || '',
    alias: user?.alias || '',
    telefono: user?.telefono || '',
    telefonoSinpe: user?.telefonoSinpe || user?.telefono || '',
    direccion: user?.direccion || '',
  });
  const [avatarUri, setAvatarUri] = useState(user?.avatar || '');
  const [loading, setLoading] = useState(false);
  const [avatarSaving, setAvatarSaving] = useState(false);

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.trim().slice(0, 2).toUpperCase() || 'U';
  };

  const normalizeAvatarUri = async (uri: string) => {
    if (!user) return uri;
    if (!uri.startsWith('file://')) return uri;
    const ext = uri.split('.').pop()?.toLowerCase() || 'jpg';
    const target = `${FileSystem.documentDirectory}avatar_${user.id}.${ext}`;
    try { await FileSystem.copyAsync({ from: uri, to: target }); return target; } catch { return uri; }
  };

  const persistAvatar = async (nextAvatar: string) => {
    if (!user) return;
    const previous = avatarUri;
    setAvatarUri(nextAvatar);
    setAvatarSaving(true);
    try {
      await updateUser(user.id, { avatar: nextAvatar });
    } catch (err: any) {
      setAvatarUri(previous);
      confirm({ title: 'No se pudo actualizar foto', message: err?.message ?? 'Intenta de nuevo.', confirmLabel: 'OK', onConfirm: () => {} });
    } finally {
      setAvatarSaving(false);
    }
  };

  const pickFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) { confirm({ title: 'Permiso requerido', message: 'Necesitamos permiso de galeria.', confirmLabel: 'OK', onConfirm: () => {} }); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', allowsEditing: true, aspect: [1, 1], quality: 0.75 });
    if (!result.canceled && result.assets.length > 0) { const normalized = await normalizeAvatarUri(result.assets[0].uri); await persistAvatar(normalized); }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) { confirm({ title: 'Permiso requerido', message: 'Necesitamos permiso de camara.', confirmLabel: 'OK', onConfirm: () => {} }); return; }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: 'images', allowsEditing: true, aspect: [1, 1], quality: 0.75 });
    if (!result.canceled && result.assets.length > 0) { const normalized = await normalizeAvatarUri(result.assets[0].uri); await persistAvatar(normalized); }
  };

  const handleSave = async () => {
    if (!user) return;
    if (form.nombres.trim().length < 2 || form.alias.trim().length < 2) {
      confirm({ title: 'Datos invalidos', message: 'Nombre y alias deben tener al menos 2 caracteres.', confirmLabel: 'OK', onConfirm: () => {} });
      return;
    }
    setLoading(true);
    try {
      await updateUser(user.id, { nombres: form.nombres.trim(), alias: form.alias.trim(), telefono: form.telefono.trim(), telefonoSinpe: form.telefonoSinpe.trim(), direccion: form.direccion.trim(), avatar: avatarUri });
      setLoading(false);
      confirm({ title: 'Datos actualizados', message: 'Tus cambios se guardaron correctamente.', confirmLabel: 'OK', onConfirm: () => navigation.goBack() });
    } catch (err: any) {
      setLoading(false);
      confirm({ title: 'No se pudo guardar', message: err?.message ?? 'Intenta de nuevo.', confirmLabel: 'OK', onConfirm: () => {} });
    }
  };

  if (!user) return null;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Datos Personales</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" automaticallyAdjustKeyboardInsets>

          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
              ) : (
                <View style={[styles.avatarImg, styles.avatarFallback]}>
                  <Text style={styles.avatarInitials}>{getInitials(form.nombres || user.nombres)}</Text>
                </View>
              )}
              <TouchableOpacity style={styles.editAvatarBtn} activeOpacity={0.8} onPress={pickFromGallery}>
                <Camera size={16} color={C.white} />
              </TouchableOpacity>
            </View>
            <Text style={styles.avatarHint}>{avatarSaving ? 'Guardando foto...' : 'Tu foto se vera en perfil, comunidad y gestion.'}</Text>
            <View style={styles.avatarActions}>
              <TouchableOpacity style={styles.avatarActionBtn} onPress={pickFromGallery}><Text style={styles.avatarActionText}>Elegir foto</Text></TouchableOpacity>
              <TouchableOpacity style={styles.avatarActionBtn} onPress={takePhoto}><Text style={styles.avatarActionText}>Tomar foto</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.avatarActionBtn, styles.avatarDeleteBtn]} onPress={() => persistAvatar('')}><Text style={[styles.avatarActionText, { color: C.danger }]}>Eliminar</Text></TouchableOpacity>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Perfil Publico</Text>
          <View style={styles.card}>
            <Input label="Alias / Nombre publico" value={form.alias} onChangeText={(v) => setForm({ ...form, alias: v })} placeholder="Ej: carlosP" />
            <Input label="Nombre completo" value={form.nombres} onChangeText={(v) => setForm({ ...form, nombres: v })} autoCapitalize="words" />
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 10 }]}>Contacto y Pagos</Text>
          <View style={styles.card}>
            <Input label="Telefono principal" value={form.telefono} onChangeText={(v) => setForm({ ...form, telefono: v })} keyboardType="phone-pad" />
            <Input label="Telefono asociado a SINPE" value={form.telefonoSinpe} onChangeText={(v) => setForm({ ...form, telefonoSinpe: v })} keyboardType="phone-pad" placeholder="Para recibir tus pagos" />
            <Input label="Direccion de residencia" value={form.direccion} onChangeText={(v) => setForm({ ...form, direccion: v })} />
          </View>

          <View style={styles.protectedHeader}>
            <Text style={styles.sectionTitle}>Datos Protegidos</Text>
            <Lock size={14} color={C.textSecondary} style={{ marginBottom: 8 }} />
          </View>
          <View style={styles.card}>
            <Input label="Correo electronico" value={user.correo} editable={false} />
            <Input label="Cedula de identidad" value={user.cedula} editable={false} />
            <View style={styles.infoBox}>
              <Info size={16} color={C.accent} style={{ marginTop: 2 }} />
              <Text style={styles.infoText}>Para cambiar correo o cedula debes contactar a soporte.</Text>
            </View>
          </View>

          <View style={styles.footer}>
            <Button title={loading ? 'Guardando...' : 'Guardar Cambios'} onPress={handleSave} disabled={loading} />
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
  avatarSection: { alignItems: 'center', marginVertical: 20, gap: 10 },
  avatarWrapper: { position: 'relative' },
  avatarImg: { width: 96, height: 96, borderRadius: 48, backgroundColor: C.bgInput, borderWidth: 3, borderColor: C.accentLight },
  avatarFallback: { alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { color: C.accent, fontSize: fs(28), fontWeight: '800', letterSpacing: 0.8 },
  editAvatarBtn: { position: 'absolute', bottom: 0, right: 0, backgroundColor: C.accent, width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: C.bg },
  avatarHint: { fontSize: fs(13), color: C.textSecondary, textAlign: 'center' },
  avatarActions: { flexDirection: 'row', gap: 8, marginTop: 2 },
  avatarActionBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: C.bgInput, borderWidth: 1, borderColor: C.border },
  avatarDeleteBtn: { borderColor: C.dangerLight },
  avatarActionText: { fontSize: fs(12), fontWeight: '700', color: C.textPrimary },
  sectionTitle: { fontSize: fs(13), fontWeight: '800', color: C.textSecondary, marginBottom: 10, marginLeft: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  card: { backgroundColor: C.bgCard, padding: 20, borderRadius: 24, borderWidth: 1, borderColor: C.border, gap: 16, marginBottom: 24 },
  protectedHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoBox: { flexDirection: 'row', backgroundColor: C.accentLight, padding: 12, borderRadius: 12, gap: 10, marginTop: 4 },
  infoText: { flex: 1, fontSize: fs(12), color: C.accent, lineHeight: 18 },
  footer: { marginTop: 10 },
});
