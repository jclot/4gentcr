import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import {
    ChevronLeft, Moon, Sun, Smartphone, Check,
    Sparkles, Type, Vibrate, Zap
} from 'lucide-react-native';

export default function CustomizationScreen({ navigation }: any) {
    const [theme, setTheme] = useState('system');
    const [accent, setAccent] = useState(Colors.accent);
    const [textSize, setTextSize] = useState('normal');
    const [toggles, setToggles] = useState({ haptics: true, animations: true });

    const toggleState = (key: string) => {
        setToggles(prev => ({ ...prev, [key]: !(prev as any)[key] }));
    };

    const ThemeCard = ({ id, label, icon: Icon, desc }: any) => {
        const isActive = theme === id;
        return (
            <TouchableOpacity
                style={[styles.themeCard, isActive && styles.themeCardActive]}
                onPress={() => setTheme(id)}
                activeOpacity={0.8}
            >
                <View style={[styles.iconBox, isActive ? { backgroundColor: Colors.accent } : { backgroundColor: Colors.bgInput }]}>
                    <Icon size={24} color={isActive ? Colors.white : Colors.textSecondary} />
                </View>
                <View style={styles.themeTextContent}>
                    <Text style={[styles.themeLabel, isActive && { color: Colors.accent }]}>{label}</Text>
                    <Text style={styles.themeDesc}>{desc}</Text>
                </View>
                <View style={[styles.radio, isActive && styles.radioActive]}>
                    {isActive && <View style={styles.radioInner} />}
                </View>
            </TouchableOpacity>
        );
    };

    const ToggleRow = ({ label, desc, icon: Icon, propKey, isLast = false }: any) => {
        const isOn = (toggles as any)[propKey];
        return (
            <TouchableOpacity
                style={[styles.toggleRow, !isLast && styles.borderBottom]}
                onPress={() => toggleState(propKey)}
                activeOpacity={0.7}
            >
                <View style={styles.toggleIconBox}>
                    <Icon size={20} color={isOn ? Colors.accent : Colors.textSecondary} />
                </View>
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
            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.title}>Personalización</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* HERO SECTION */}
                <View style={styles.heroBox}>
                    <Sparkles size={48} color={Colors.accent} />
                    <Text style={styles.heroText}>Adapta la aplicación a tu estilo. Los cambios se aplicarán inmediatamente en toda tu cuenta.</Text>
                </View>

                {/* SECCIÓN 1: APARIENCIA */}
                <Text style={styles.sectionTitle}>Apariencia</Text>
                <View style={styles.cardsContainer}>
                    <ThemeCard id="light" label="Modo Claro" desc="Colores brillantes y limpios" icon={Sun} />
                    <ThemeCard id="dark" label="Modo Oscuro" desc="Ideal para poca luz" icon={Moon} />
                    <ThemeCard id="system" label="Automático" desc="Sigue el sistema de tu teléfono" icon={Smartphone} />
                </View>

                {/* SECCIÓN 2: COLOR DE ACENTO */}
                <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Color Principal</Text>
                <View style={styles.colorCard}>
                    <Text style={styles.colorDesc}>Selecciona el color de los botones y elementos destacados.</Text>
                    <View style={styles.colorRow}>
                        {[Colors.accent, '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'].map(color => (
                            <TouchableOpacity
                                key={color}
                                style={[styles.colorCircle, { backgroundColor: color }, accent === color && styles.colorCircleActive]}
                                onPress={() => setAccent(color)}
                            >
                                {accent === color && <Check size={20} color={Colors.white} />}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* SECCIÓN 3: TAMAÑO DE TEXTO */}
                <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Tipografía</Text>
                <View style={styles.card}>
                    <View style={styles.textSizeHeader}>
                        <Type size={20} color={Colors.textSecondary} />
                        <Text style={styles.textSizeTitle}>Tamaño de la fuente</Text>
                    </View>
                    <View style={styles.textSizeControls}>
                        {['pequeño', 'normal', 'grande'].map((size) => (
                            <TouchableOpacity
                                key={size}
                                style={[styles.textBtn, textSize === size && styles.textBtnActive]}
                                onPress={() => setTextSize(size)}
                            >
                                <Text style={[
                                    styles.textBtnLabel,
                                    textSize === size && { color: Colors.white, fontWeight: '700' },
                                    size === 'pequeño' && { fontSize: 12 },
                                    size === 'normal' && { fontSize: 15 },
                                    size === 'grande' && { fontSize: 18 }
                                ]}>
                                    Aa
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* SECCIÓN 4: EFECTOS Y ACCESIBILIDAD */}
                <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Efectos y Sensaciones</Text>
                <View style={styles.card}>
                    <ToggleRow
                        propKey="haptics"
                        label="Vibración del sistema"
                        desc="Respuestas táctiles al tocar botones."
                        icon={Vibrate}
                    />
                    <ToggleRow
                        propKey="animations"
                        label="Animaciones fluidas"
                        desc="Transiciones suaves al cambiar de pantalla."
                        icon={Zap}
                        isLast
                    />
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
    content: { padding: 20, paddingBottom: 50 },

    heroBox: { alignItems: 'center', marginBottom: 24, paddingHorizontal: 10, marginTop: 10 },
    heroText: { textAlign: 'center', color: Colors.textSecondary, marginTop: 12, lineHeight: 22, fontSize: 14 },

    sectionTitle: { fontSize: 13, fontWeight: '800', color: Colors.textSecondary, marginBottom: 12, marginLeft: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
    cardsContainer: { gap: 12 },

    themeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bgCard, padding: 16, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.border },
    themeCardActive: { borderColor: Colors.accent, backgroundColor: Colors.accentLight + '20' },
    iconBox: { width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    themeTextContent: { flex: 1 },
    themeLabel: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
    themeDesc: { fontSize: 13, color: Colors.textSecondary },
    radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
    radioActive: { borderColor: Colors.accent },
    radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.accent },

    colorCard: { backgroundColor: Colors.bgCard, padding: 20, borderRadius: 20, borderWidth: 1, borderColor: Colors.border },
    colorDesc: { fontSize: 14, color: Colors.textSecondary, marginBottom: 16 },
    colorRow: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' },
    colorCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    colorCircleActive: { borderWidth: 3, borderColor: Colors.bg, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },

    card: { backgroundColor: Colors.bgCard, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },

    textSizeHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.bgInput },
    textSizeTitle: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
    textSizeControls: { flexDirection: 'row', padding: 16, gap: 12 },
    textBtn: { flex: 1, height: 50, borderRadius: 12, backgroundColor: Colors.bgInput, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
    textBtnActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
    textBtnLabel: { color: Colors.textPrimary, fontWeight: '500' },

    toggleRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
    borderBottom: { borderBottomWidth: 1, borderBottomColor: Colors.bgInput },
    toggleIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.bgInput, alignItems: 'center', justifyContent: 'center' },
    toggleText: { flex: 1 },
    toggleLabel: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary, marginBottom: 2 },
    toggleDesc: { fontSize: 12, color: Colors.textSecondary, lineHeight: 16 },
    switch: { width: 44, height: 26, borderRadius: 13, backgroundColor: Colors.border, justifyContent: 'center', paddingHorizontal: 2 },
    switchOn: { backgroundColor: Colors.accent },
    thumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.white, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 2 },
    thumbOn: { alignSelf: 'flex-end' },
});