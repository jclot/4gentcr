import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { ChevronLeft, ShieldAlert, CheckCircle2 } from 'lucide-react-native';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function PasswordScreen({ navigation }: any) {
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

    // Lógica simple de fortaleza visual
    const getStrength = (pass: string) => {
        if (pass.length === 0) return 0;
        if (pass.length < 6) return 1;
        if (pass.length >= 8 && /[A-Z]/.test(pass) && /[0-9]/.test(pass)) return 3;
        return 2;
    };

    const strength = getStrength(passwords.new);
    const strengthColors = [Colors.border, Colors.danger, Colors.warning, Colors.success];
    const strengthLabels = ['Ingresa tu nueva clave', 'Débil', 'Aceptable', 'Fuerte'];

    return (
        <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.title}>Contraseña</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
                <View style={styles.heroBox}>
                    <ShieldAlert size={56} color={Colors.accent} />
                    <Text style={styles.heroTitle}>Protege tu cuenta</Text>
                    <Text style={styles.heroSub}>Te recomendamos usar al menos 8 caracteres, números y símbolos.</Text>
                </View>

                <View style={styles.formCard}>
                    <Input
                        label="Contraseña Actual"
                        secureTextEntry
                        value={passwords.current}
                        onChangeText={(v) => setPasswords({ ...passwords, current: v })}
                        placeholder="••••••••"
                    />
                    <View style={styles.divider} />

                    <Input
                        label="Nueva Contraseña"
                        secureTextEntry
                        value={passwords.new}
                        onChangeText={(v) => setPasswords({ ...passwords, new: v })}
                        placeholder="Mínimo 8 caracteres"
                    />

                    {/* Indicador de Fortaleza */}
                    <View style={styles.strengthContainer}>
                        <View style={styles.barsRow}>
                            {[1, 2, 3].map(i => (
                                <View key={i} style={[styles.strengthBar, { backgroundColor: strength >= i ? strengthColors[strength] : Colors.bgInput }]} />
                            ))}
                        </View>
                        <Text style={[styles.strengthText, { color: strength > 0 ? strengthColors[strength] : Colors.textSecondary }]}>
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
                    <Button title="Actualizar Contraseña" onPress={() => navigation.goBack()} disabled={strength < 2 || passwords.new !== passwords.confirm} />
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
    scroll: { padding: 20, paddingBottom: 40 },
    heroBox: { alignItems: 'center', backgroundColor: Colors.accentLight, padding: 30, borderRadius: 24, marginBottom: 24 },
    heroTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, marginTop: 16, marginBottom: 8 },
    heroSub: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
    formCard: { backgroundColor: Colors.bgCard, padding: 20, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, gap: 16 },
    divider: { height: 1, backgroundColor: Colors.border, marginVertical: 8 },
    strengthContainer: { marginTop: -4 },
    barsRow: { flexDirection: 'row', gap: 6, marginBottom: 8 },
    strengthBar: { flex: 1, height: 4, borderRadius: 2 },
    strengthText: { fontSize: 12, fontWeight: '700', textAlign: 'right' },
});