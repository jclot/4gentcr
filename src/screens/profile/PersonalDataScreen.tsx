import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { useAppStore } from '../../store/useAppStore';
import { useModalStore } from '../../store/useModalStore';
import { ChevronLeft, Camera, Lock, Info } from 'lucide-react-native';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function PersonalDataScreen({ navigation }: any) {
    const { getCurrentUser, updateUser } = useAppStore();
    const { confirm } = useModalStore();
    const user = getCurrentUser();

    const [form, setForm] = useState({
        nombres: user?.nombres || '',
        alias: user?.alias || '',
        telefono: user?.telefono || '',
        telefonoSinpe: user?.telefonoSinpe || user?.telefono || '',
        direccion: user?.direccion || '',
    });

    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!user) return;

        if (form.nombres.trim().length < 2 || form.alias.trim().length < 2) {
            confirm({
                title: 'Datos inválidos',
                message: 'Nombre y alias deben tener al menos 2 caracteres.',
                confirmLabel: 'OK',
                onConfirm: () => { },
            });
            return;
        }

        setLoading(true);
        try {
            await updateUser(user.id, {
                nombres: form.nombres.trim(),
                alias: form.alias.trim(),
                telefono: form.telefono.trim(),
                telefonoSinpe: form.telefonoSinpe.trim(),
                direccion: form.direccion.trim(),
            });

            setLoading(false);
            confirm({
                title: 'Datos actualizados',
                message: 'Tus cambios se guardaron correctamente.',
                confirmLabel: 'OK',
                onConfirm: () => navigation.goBack(),
            });
        } catch (err: any) {
            setLoading(false);
            confirm({
                title: 'No se pudo guardar',
                message: err?.message ?? 'Intenta de nuevo en unos minutos.',
                confirmLabel: 'OK',
                onConfirm: () => { },
            });
        }
    };

    if (!user) return null;

    return (
        <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.title}>Datos Personales</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                {/* AVATAR HERO */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatarWrapper}>
                        <Image source={{ uri: user.avatar }} style={styles.avatarImg} />
                        <TouchableOpacity style={styles.editAvatarBtn} activeOpacity={0.8}>
                            <Camera size={16} color={Colors.white} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.avatarHint}>Toca para cambiar tu foto</Text>
                </View>

                {/* TARJETA 1: PERFIL PUBLICO */}
                <Text style={styles.sectionTitle}>Perfil Público</Text>
                <View style={styles.card}>
                    <Input
                        label="Alias / Nombre público"
                        value={form.alias}
                        onChangeText={(v) => setForm({ ...form, alias: v })}
                        placeholder="Ej: carlosP"
                    />
                    <Input
                        label="Nombre completo"
                        value={form.nombres}
                        onChangeText={(v) => setForm({ ...form, nombres: v })}
                        autoCapitalize="words"
                    />
                </View>

                {/* TARJETA 2: CONTACTO Y PAGOS */}
                <Text style={[styles.sectionTitle, { marginTop: 10 }]}>Contacto y Pagos</Text>
                <View style={styles.card}>
                    <Input
                        label="Teléfono principal"
                        value={form.telefono}
                        onChangeText={(v) => setForm({ ...form, telefono: v })}
                        keyboardType="phone-pad"
                    />
                    <Input
                        label="Teléfono asociado a SINPE"
                        value={form.telefonoSinpe}
                        onChangeText={(v) => setForm({ ...form, telefonoSinpe: v })}
                        keyboardType="phone-pad"
                        placeholder="Para recibir tus pagos"
                    />
                    <Input
                        label="Dirección de residencia"
                        value={form.direccion}
                        onChangeText={(v) => setForm({ ...form, direccion: v })}
                    />
                </View>

                {/* TARJETA 3: DATOS PROTEGIDOS (Solo lectura) */}
                <View style={styles.protectedHeader}>
                    <Text style={styles.sectionTitle}>Datos Protegidos</Text>
                    <Lock size={14} color={Colors.textSecondary} style={{ marginBottom: 8 }} />
                </View>
                <View style={styles.card}>
                    <Input
                        label="Correo electrónico"
                        value={user.correo}
                        editable={false}
                    />
                    <Input
                        label="Cédula de identidad"
                        value={user.cedula}
                        editable={false}
                    />
                    <View style={styles.infoBox}>
                        <Info size={16} color={Colors.accent} style={{ marginTop: 2 }} />
                        <Text style={styles.infoText}>
                            Por motivos de seguridad y facturación, para cambiar tu correo o número de cédula debes contactar a soporte.
                        </Text>
                    </View>
                </View>

                {/* BOTON DE GUARDAR */}
                <View style={styles.footer}>
                    <Button
                        title={loading ? "Guardando..." : "Guardar Cambios"}
                        onPress={handleSave}
                        disabled={loading}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bg },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border
    },
    backBtn: { width: 40, height: 40, justifyContent: 'center' },
    title: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
    scroll: { padding: 20, paddingBottom: 40 },

    avatarSection: { alignItems: 'center', marginVertical: 20 },
    avatarWrapper: { position: 'relative' },
    avatarImg: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: Colors.bgInput,
        borderWidth: 3,
        borderColor: Colors.accentLight
    },
    editAvatarBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: Colors.accent,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: Colors.bg,
    },
    avatarHint: { fontSize: 13, color: Colors.textSecondary, marginTop: 12 },

    sectionTitle: {
        fontSize: 13,
        fontWeight: '800',
        color: Colors.textSecondary,
        marginBottom: 10,
        marginLeft: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5
    },
    card: {
        backgroundColor: Colors.bgCard,
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: Colors.border,
        gap: 16,
        marginBottom: 24
    },

    protectedHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: Colors.accentLight + '30',
        padding: 12,
        borderRadius: 12,
        gap: 10,
        marginTop: 4
    },
    infoText: { flex: 1, fontSize: 12, color: Colors.accent, lineHeight: 18 },

    footer: { marginTop: 10 },
});
