import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { ChevronLeft, ShieldCheck, SmartphoneNfc, QrCode, KeyRound, ShieldAlert } from 'lucide-react-native';
import Button from '../../components/Button';

export default function TwoFAScreen({ navigation }: any) {
    const [enabled, setEnabled] = useState(false);

    const StepItem = ({ number, title, desc, icon: Icon }: any) => (
        <View style={styles.stepItem}>
            <View style={styles.stepIconBox}>
                <Icon size={24} color={Colors.accent} />
                <View style={styles.stepBadge}>
                    <Text style={styles.stepBadgeText}>{number}</Text>
                </View>
            </View>
            <View style={styles.stepTextContent}>
                <Text style={styles.stepTitle}>{title}</Text>
                <Text style={styles.stepDesc}>{desc}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.title}>Autenticación en 2 Pasos</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.heroBox}>
                    <ShieldCheck size={72} color={enabled ? Colors.success : Colors.textPrimary} />
                    <Text style={styles.heroTitle}>{enabled ? '2FA está Activado' : 'Máxima Seguridad'}</Text>
                    <Text style={styles.heroDesc}>
                        {enabled
                            ? 'Tu cuenta está protegida. Requeriremos un código de tu app autenticadora en dispositivos nuevos.'
                            : 'Evita accesos no autorizados añadiendo una capa extra de seguridad vinculada a tu teléfono celular.'}
                    </Text>
                </View>

                {!enabled ? (
                    <View style={styles.stepsContainer}>
                        <Text style={styles.sectionTitle}>¿Cómo funciona?</Text>
                        <View style={styles.card}>
                            <StepItem number="1" icon={SmartphoneNfc} title="Descarga una App" desc="Usa Google Authenticator o Authy en tu teléfono." />
                            <View style={styles.divider} />
                            <StepItem number="2" icon={QrCode} title="Escanea el código" desc="Vincula tu cuenta escaneando el código QR seguro." />
                            <View style={styles.divider} />
                            <StepItem number="3" icon={KeyRound} title="Ingresa el PIN" desc="Usa el código de 6 dígitos generado por tu app." />
                        </View>
                        <View style={{ marginTop: 24 }}>
                            <Button title="Configurar Autenticador" onPress={() => setEnabled(true)} />
                        </View>
                    </View>
                ) : (
                    <View style={styles.activeContainer}>
                        <View style={styles.successBadge}>
                            <Text style={styles.successText}>Protección en tiempo real activa</Text>
                        </View>

                        {/* NUEVO BOTÓN DE DESACTIVAR */}
                        <TouchableOpacity
                            style={styles.deactivateBtn}
                            onPress={() => setEnabled(false)}
                            activeOpacity={0.8}
                        >
                            <ShieldAlert size={20} color={Colors.danger} />
                            <Text style={styles.deactivateBtnText}>Desactivar Autenticación</Text>
                        </TouchableOpacity>

                        <Text style={styles.warningText}>
                            Al desactivar esta función, tu cuenta será más vulnerable a accesos no autorizados.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bg },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: Colors.border },
    backBtn: { width: 40, height: 40, justifyContent: 'center' },
    title: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
    content: { padding: 20, paddingBottom: 40 },
    heroBox: { alignItems: 'center', paddingVertical: 30 },
    heroTitle: { fontSize: 24, fontWeight: '900', color: Colors.textPrimary, marginTop: 20, marginBottom: 12 },
    heroDesc: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, paddingHorizontal: 10 },
    stepsContainer: { marginTop: 10 },
    sectionTitle: { fontSize: 14, fontWeight: '800', color: Colors.textSecondary, marginBottom: 16, textTransform: 'uppercase' },
    card: { backgroundColor: Colors.bgCard, borderRadius: 24, borderWidth: 1, borderColor: Colors.border, padding: 8 },
    stepItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 16 },
    stepIconBox: { width: 56, height: 56, borderRadius: 16, backgroundColor: Colors.accentLight, alignItems: 'center', justifyContent: 'center' },
    stepBadge: { position: 'absolute', top: -6, right: -6, width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.textPrimary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.bgCard },
    stepBadgeText: { color: Colors.white, fontSize: 12, fontWeight: '800' },
    stepTextContent: { flex: 1 },
    stepTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
    stepDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
    divider: { height: 1, backgroundColor: Colors.border, marginLeft: 88 },
    activeContainer: { alignItems: 'center', marginTop: 20, width: '100%' },
    successBadge: { backgroundColor: Colors.successLight, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 30, marginBottom: 40, borderWidth: 1, borderColor: Colors.success },
    successText: { color: Colors.success, fontWeight: '700', fontSize: 14 },

    // Estilos del nuevo botón
    deactivateBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        width: '100%',
        paddingVertical: 16,
        borderRadius: 16,
        backgroundColor: Colors.bgCard,
        borderWidth: 1.5,
        borderColor: Colors.danger,
    },
    deactivateBtnText: {
        color: Colors.danger,
        fontSize: 16,
        fontWeight: '700',
    },
    warningText: {
        marginTop: 16,
        fontSize: 13,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 20,
    }
});