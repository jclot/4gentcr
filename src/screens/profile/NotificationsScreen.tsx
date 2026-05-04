import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { ChevronLeft, BellRing } from 'lucide-react-native';

export default function NotificationsScreen({ navigation }: any) {
    const [toggles, setToggles] = useState({
        newProps: true, statusChange: true, payments: true, marketing: false
    });

    const toggleState = (key: string) => {
        setToggles(prev => ({ ...prev, [key]: !(prev as any)[key] }));
    };

    const ToggleRow = ({ label, desc, propKey, isLast = false }: any) => {
        const isOn = (toggles as any)[propKey];
        return (
            <TouchableOpacity
                style={[styles.toggleRow, !isLast && styles.borderBottom]}
                onPress={() => toggleState(propKey)}
                activeOpacity={0.7}
            >
                <View style={styles.toggleText}>
                    <Text style={styles.toggleLabel}>{label}</Text>
                    <Text style={styles.toggleDesc}>{desc}</Text>
                </View>
                <View style={[styles.switch, isOn && styles.switchOn]}>
                    <View style={[styles.thumb, isOn && styles.thumbOn]} />
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.title}>Notificaciones</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.hero}>
                    <BellRing size={48} color={Colors.accent} />
                    <Text style={styles.heroText}>Tú decides qué quieres recibir. Configura tus alertas para no perderte nada importante.</Text>
                </View>

                <Text style={styles.sectionTitle}>Propiedades</Text>
                <View style={styles.card}>
                    <ToggleRow propKey="newProps" label="Recordatorios de captura" desc="Alertas para capturar propiedades cercanas a ti." />
                    <ToggleRow propKey="statusChange" label="Cambios de estado" desc="Cuando una propiedad pasa a Negociación o Cierre." isLast />
                </View>

                <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Cuenta y Pagos</Text>
                <View style={styles.card}>
                    <ToggleRow propKey="payments" label="Acreditación de pagos" desc="Te avisamos en cuanto el dinero esté en tu cuenta." />
                    <ToggleRow propKey="marketing" label="Novedades y Promos" desc="Actualizaciones de la app y bonos especiales." isLast />
                </View>
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
    hero: { alignItems: 'center', marginBottom: 30, paddingHorizontal: 10 },
    heroText: { textAlign: 'center', color: Colors.textSecondary, marginTop: 16, lineHeight: 22, fontSize: 14 },
    sectionTitle: { fontSize: 14, fontWeight: '800', color: Colors.textSecondary, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
    card: { backgroundColor: Colors.bgCard, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
    toggleRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 16 },
    borderBottom: { borderBottomWidth: 1, borderBottomColor: Colors.bgInput },
    toggleText: { flex: 1 },
    toggleLabel: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary, marginBottom: 4 },
    toggleDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
    switch: { width: 48, height: 28, borderRadius: 14, backgroundColor: Colors.border, justifyContent: 'center', paddingHorizontal: 3 },
    switchOn: { backgroundColor: Colors.accent },
    thumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.white, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 2 },
    thumbOn: { alignSelf: 'flex-end' },
});