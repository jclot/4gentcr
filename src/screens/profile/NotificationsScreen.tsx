import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { useNotificationStore, NotificationPrefs } from '../../store/useNotificationStore';
import { useNotifications, NotificationTestType } from '../../hooks/useNotifications';
import {
  ChevronLeft, BellRing, BellOff, CheckCircle2, AlertTriangle,
  MapPin, RefreshCw, DollarSign, Sparkles,
} from 'lucide-react-native';
import { useState } from 'react';

// ─── Test section config ──────────────────────────────────────────────────────
// Each entry maps to a NotificationTestType so this block is easy to delete
// when moving to production.

const TEST_BUTTONS: {
  type: NotificationTestType;
  label: string;
  Icon: any;
}[] = [
  { type: 'capture_reminder', label: 'Captura', Icon: MapPin },
  { type: 'status_update',    label: 'Estado',  Icon: RefreshCw },
  { type: 'payment',          label: 'Pago',    Icon: DollarSign },
  { type: 'promo',            label: 'Novedad', Icon: Sparkles },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function NotificationsScreen({ navigation }: any) {
  const { colors: C, fs } = useTheme();
  const styles = useMemo(() => makeStyles(C, fs), [C, fs]);

  const { newProps, statusChange, payments, marketing, permissionStatus, setPreference } =
    useNotificationStore();

  const { requestPermissions, openSettings, scheduleTest } = useNotifications();

  const [firing, setFiring] = useState<NotificationTestType | null>(null);

  const handleTest = async (type: NotificationTestType) => {
    setFiring(type);
    try {
      await scheduleTest(type);
    } finally {
      setFiring(null);
    }
  };

  // ── Sub-components ───────────────────────────────────────────────────────

  const ToggleRow = ({
    label,
    desc,
    prefKey,
    value,
    isLast = false,
  }: {
    label: string;
    desc: string;
    prefKey: keyof NotificationPrefs;
    value: boolean;
    isLast?: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.toggleRow, !isLast && styles.borderBottom]}
      onPress={() => setPreference(prefKey, !value)}
      activeOpacity={0.7}
    >
      <View style={styles.toggleText}>
        <Text style={styles.toggleLabel}>{label}</Text>
        <Text style={styles.toggleDesc}>{desc}</Text>
      </View>
      <View style={[styles.switch, value && styles.switchOn]}>
        <View style={[styles.thumb, value && styles.thumbOn]} />
      </View>
    </TouchableOpacity>
  );

  // ── Permission banner ────────────────────────────────────────────────────

  const PermissionBanner = () => {
    if (permissionStatus === 'granted') {
      return (
        <View style={[styles.banner, styles.bannerSuccess]}>
          <CheckCircle2 size={18} color={C.success} />
          <Text style={[styles.bannerText, { color: C.success }]}>
            Notificaciones del sistema activas
          </Text>
        </View>
      );
    }
    if (permissionStatus === 'denied') {
      return (
        <View style={[styles.banner, styles.bannerDanger]}>
          <BellOff size={18} color={C.danger} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.bannerText, { color: C.danger }]}>
              Notificaciones bloqueadas
            </Text>
            <Text style={[styles.bannerSub, { color: C.danger }]}>
              Activálas desde Configuración del dispositivo.
            </Text>
          </View>
          <TouchableOpacity style={[styles.bannerBtn, { borderColor: C.danger }]} onPress={openSettings}>
            <Text style={[styles.bannerBtnText, { color: C.danger }]}>Abrir</Text>
          </TouchableOpacity>
        </View>
      );
    }
    // undetermined
    return (
      <View style={[styles.banner, styles.bannerWarning]}>
        <AlertTriangle size={18} color={C.warning} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.bannerText, { color: C.warning }]}>
            Permiso de notificaciones requerido
          </Text>
          <Text style={[styles.bannerSub, { color: C.warning }]}>
            Necesitamos tu autorización para enviarte alertas.
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.bannerBtn, { borderColor: C.warning }]}
          onPress={requestPermissions}
        >
          <Text style={[styles.bannerBtnText, { color: C.warning }]}>Activar</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Notificaciones</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <PermissionBanner />

        <View style={styles.hero}>
          <BellRing size={48} color={C.accent} />
          <Text style={styles.heroText}>
            Tú decides qué quieres recibir. Configura tus alertas para no perderte nada importante.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Propiedades</Text>
        <View style={styles.card}>
          <ToggleRow
            prefKey="newProps"
            value={newProps}
            label="Recordatorios de captura"
            desc="Alertas para capturar propiedades cercanas a ti."
          />
          <ToggleRow
            prefKey="statusChange"
            value={statusChange}
            label="Cambios de estado"
            desc="Cuando una propiedad pasa a Negociación o Cierre."
            isLast
          />
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Cuenta y Pagos</Text>
        <View style={styles.card}>
          <ToggleRow
            prefKey="payments"
            value={payments}
            label="Acreditación de pagos"
            desc="Te avisamos en cuanto el dinero esté en tu cuenta."
          />
          <ToggleRow
            prefKey="marketing"
            value={marketing}
            label="Novedades y Promos"
            desc="Actualizaciones de la app y bonos especiales."
            isLast
          />
        </View>

        {/* ── Test zone — remove before production ─────────────────────── */}
        <View style={styles.testZone}>
          <View style={styles.testHeader}>
            <View style={styles.testDivider} />
            <Text style={styles.testLabel}>ZONA DE PRUEBAS</Text>
            <View style={styles.testDivider} />
          </View>
          <Text style={styles.testDesc}>
            Dispara notificaciones de prueba para verificar que el sistema funciona correctamente.
          </Text>
          <View style={styles.testGrid}>
            {TEST_BUTTONS.map(({ type, label, Icon }) => {
              const isLoading = firing === type;
              return (
                <TouchableOpacity
                  key={type}
                  style={styles.testBtn}
                  onPress={() => handleTest(type)}
                  disabled={firing !== null}
                  activeOpacity={0.7}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color={C.accent} />
                  ) : (
                    <Icon size={16} color={C.accent} />
                  )}
                  <Text style={styles.testBtnText}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        {/* ── End test zone ──────────────────────────────────────────────── */}

      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (C: any, fs: (n: number) => number) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 15,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  title: { fontSize: fs(18), fontWeight: '800', color: C.textPrimary },
  content: { padding: 20, paddingBottom: 48 },

  // Permission banner
  banner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: 16, padding: 14, marginBottom: 24,
    borderWidth: 1,
  },
  bannerSuccess: { backgroundColor: C.successLight ?? 'rgba(16,185,129,0.1)', borderColor: C.success + '40' },
  bannerWarning: { backgroundColor: C.warningLight, borderColor: C.warning + '40' },
  bannerDanger:  { backgroundColor: C.dangerLight,  borderColor: C.danger  + '40' },
  bannerText:  { fontSize: fs(13), fontWeight: '700' },
  bannerSub:   { fontSize: fs(12), marginTop: 2, opacity: 0.85 },
  bannerBtn: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1.5,
  },
  bannerBtnText: { fontSize: fs(12), fontWeight: '800' },

  // Hero
  hero: { alignItems: 'center', marginBottom: 28, paddingHorizontal: 10 },
  heroText: { textAlign: 'center', color: C.textSecondary, marginTop: 16, lineHeight: 22, fontSize: fs(14) },

  // Section titles
  sectionTitle: {
    fontSize: fs(13), fontWeight: '800', color: C.textSecondary,
    marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5,
  },

  // Preference card
  card: { backgroundColor: C.bgCard, borderRadius: 20, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 16 },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: C.bgInput },
  toggleText: { flex: 1 },
  toggleLabel: { fontSize: fs(16), fontWeight: '600', color: C.textPrimary, marginBottom: 4 },
  toggleDesc:  { fontSize: fs(13), color: C.textSecondary, lineHeight: 18 },
  switch: {
    width: 48, height: 28, borderRadius: 14, backgroundColor: C.border,
    justifyContent: 'center', paddingHorizontal: 3,
  },
  switchOn: { backgroundColor: C.accent },
  thumb: {
    width: 22, height: 22, borderRadius: 11, backgroundColor: C.white,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 2, elevation: 2,
  },
  thumbOn: { alignSelf: 'flex-end' },

  // Test zone
  testZone: { marginTop: 32 },
  testHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  testDivider: { flex: 1, height: 1, backgroundColor: C.border },
  testLabel: { fontSize: fs(11), fontWeight: '800', color: C.textSecondary, letterSpacing: 1 },
  testDesc: { fontSize: fs(12), color: C.textSecondary, textAlign: 'center', lineHeight: 18, marginBottom: 14 },
  testGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  testBtn: {
    width: '48%', marginBottom: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: C.bgCard,
    borderWidth: 1.5, borderColor: C.accent + '60',
    borderRadius: 14, paddingVertical: 16, paddingHorizontal: 12,
  },
  testBtnText: { fontSize: fs(13), fontWeight: '700', color: C.accent },
});
