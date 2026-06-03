import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { useThemeStore, ThemeMode, TextSize } from '../../store/useThemeStore';
import {
  ChevronLeft, Moon, Sun, Smartphone, Check,
  Sparkles, Type,
} from 'lucide-react-native';

const ACCENT_OPTIONS = ['#6C63FF', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function CustomizationScreen({ navigation }: any) {
  const { colors: C, fs } = useTheme();
  const {
    themeMode, setThemeMode,
    accent, setAccent,
    textSize, setTextSize,
  } = useThemeStore();

  const styles = useMemo(() => makeStyles(C, fs), [C, fs]);

  const ThemeCard = ({ id, label, icon: Icon, desc }: any) => {
    const isActive = themeMode === id;
    return (
      <TouchableOpacity
        style={[styles.themeCard, isActive && styles.themeCardActive]}
        onPress={() => setThemeMode(id as ThemeMode)}
        activeOpacity={0.8}
      >
        <View style={[styles.iconBox, { backgroundColor: isActive ? C.accent : C.bgInput }]}>
          <Icon size={24} color={isActive ? C.white : C.textSecondary} />
        </View>
        <View style={styles.themeTextContent}>
          <Text style={[styles.themeLabel, isActive && { color: C.accent }]}>{label}</Text>
          <Text style={styles.themeDesc}>{desc}</Text>
        </View>
        <View style={[styles.radio, isActive && styles.radioActive]}>
          {isActive && <View style={styles.radioInner} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Personalización</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <View style={styles.heroBox}>
          <Sparkles size={48} color={C.accent} />
          <Text style={styles.heroText}>Adapta la aplicación a tu estilo. Los cambios se aplican inmediatamente.</Text>
        </View>

        <Text style={styles.sectionTitle}>Apariencia</Text>
        <View style={styles.cardsContainer}>
          <ThemeCard id="light" label="Modo Claro" desc="Colores brillantes y limpios" icon={Sun} />
          <ThemeCard id="dark" label="Modo Oscuro" desc="Ideal para poca luz" icon={Moon} />
          <ThemeCard id="system" label="Automático" desc="Sigue el sistema de tu teléfono" icon={Smartphone} />
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Color Principal</Text>
        <View style={styles.colorCard}>
          <Text style={styles.colorDesc}>Selecciona el color de los botones y elementos destacados.</Text>
          <View style={styles.colorRow}>
            {ACCENT_OPTIONS.map(color => (
              <TouchableOpacity
                key={color}
                style={[styles.colorCircle, { backgroundColor: color }, accent === color && styles.colorCircleActive]}
                onPress={() => setAccent(color)}
              >
                {accent === color && <Check size={20} color={C.white} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Tipografía</Text>
        <View style={styles.card}>
          <View style={styles.textSizeHeader}>
            <Type size={20} color={C.textSecondary} />
            <Text style={styles.textSizeTitle}>Tamaño de la fuente</Text>
          </View>
          <View style={styles.textSizeControls}>
            {(['pequeño', 'normal', 'grande'] as TextSize[]).map((size) => (
              <TouchableOpacity
                key={size}
                style={[styles.textBtn, textSize === size && styles.textBtnActive]}
                onPress={() => setTextSize(size)}
              >
                <Text style={[
                  styles.textBtnLabel,
                  textSize === size && { color: C.white, fontWeight: '700' as const },
                  size === 'pequeño' && { fontSize: 12 },
                  size === 'normal' && { fontSize: 15 },
                  size === 'grande' && { fontSize: 18 },
                ]}>
                  Aa
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (C: any, fs: (n: number) => number) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: C.border },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  title: { fontSize: fs(18), fontWeight: '800', color: C.textPrimary },
  content: { padding: 20, paddingBottom: 50 },

  heroBox: { alignItems: 'center', marginBottom: 24, paddingHorizontal: 10, marginTop: 10 },
  heroText: { textAlign: 'center', color: C.textSecondary, marginTop: 12, lineHeight: 22, fontSize: fs(14) },

  sectionTitle: { fontSize: fs(13), fontWeight: '800', color: C.textSecondary, marginBottom: 12, marginLeft: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  cardsContainer: { gap: 12 },

  themeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bgCard, padding: 16, borderRadius: 20, borderWidth: 1.5, borderColor: C.border },
  themeCardActive: { borderColor: C.accent, backgroundColor: C.accentLight },
  iconBox: { width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  themeTextContent: { flex: 1 },
  themeLabel: { fontSize: fs(16), fontWeight: '700', color: C.textPrimary, marginBottom: 4 },
  themeDesc: { fontSize: fs(13), color: C.textSecondary },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: C.accent },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: C.accent },

  colorCard: { backgroundColor: C.bgCard, padding: 20, borderRadius: 20, borderWidth: 1, borderColor: C.border },
  colorDesc: { fontSize: fs(14), color: C.textSecondary, marginBottom: 16 },
  colorRow: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' },
  colorCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  colorCircleActive: { borderWidth: 3, borderColor: C.bg, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },

  card: { backgroundColor: C.bgCard, borderRadius: 20, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },

  textSizeHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16, borderBottomWidth: 1, borderBottomColor: C.bgInput },
  textSizeTitle: { fontSize: fs(15), fontWeight: '600', color: C.textPrimary },
  textSizeControls: { flexDirection: 'row', padding: 16, gap: 12 },
  textBtn: { flex: 1, height: 50, borderRadius: 12, backgroundColor: C.bgInput, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  textBtnActive: { backgroundColor: C.accent, borderColor: C.accent },
  textBtnLabel: { color: C.textPrimary, fontWeight: '500' },

});
