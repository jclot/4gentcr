import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { formatCurrency, formatDate } from '../../utils/locationUtils';
import Card from '../../components/Card';

const MetricCard = ({
  label, value, emoji, color,
}: {
  label: string; value: string; emoji: string; color: string;
}) => (
  <View style={[metricStyles.card, { borderColor: color, borderWidth: 1 }]}>
    <Text style={metricStyles.emoji}>{emoji}</Text>
    <Text style={[metricStyles.value, { color }]}>{value}</Text>
    <Text style={metricStyles.label}>{label}</Text>
  </View>
);

const metricStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 4,
    minWidth: '44%',
  },
  emoji: { fontSize: 28 },
  value: { fontSize: 18, fontWeight: '800' },
  label: { fontSize: 11, color: Colors.textSecondary, textAlign: 'center' },
});

export default function DashboardScreen() {
  const { getCurrentUser, getPropertiesByUser, db } = useAppStore();
  const user = getCurrentUser()!;
  const properties = getPropertiesByUser(user.id);

  const stats = {
    nueva: properties.filter(p => p.status === 'nueva').length,
    negociacion: properties.filter(p => p.status === 'en_negociacion').length,
    cerrado: properties.filter(p => p.status === 'contrato_cerrado').length,
    invalida: properties.filter(p => p.status === 'invalida').length,
  };

  const recentProps = [...properties].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  ).slice(0, 5);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hola, {user.nombres.split(' ')[0]} 👋</Text>
            <Text style={styles.subgreeting}>Aquí está tu resumen</Text>
          </View>
          <View style={styles.avatarBadge}>
            <Text style={{ fontSize: 28 }}>🏡</Text>
          </View>
        </View>

        {/* Ingresos banner */}
        <View style={styles.incomeCard}>
          <Text style={styles.incomeLabel}>Ingresos Totales</Text>
          <Text style={styles.incomeValue}>{formatCurrency(user.totalIngresos)}</Text>
          <View style={styles.incomeRow}>
            <Text style={styles.incomeDetail}>📱 SINPE: {user.telefonoSinpe}</Text>
            <Text style={styles.incomeDetail}>alias: {user.alias}</Text>
          </View>
        </View>

        {/* Reglas de pago */}
        <Card>
          <Text style={styles.sectionTitle}>💰 Estructura de Pagos</Text>
          {[
            { label: 'Propiedad Nueva', value: '₡250', color: Colors.success },
            { label: 'Gestión / Exclusividad', value: '₡2,000', color: Colors.warning },
            { label: 'Venta Exitosa', value: '₡100,000', color: Colors.accent },
            { label: 'Duplicada / Agencia', value: '₡0', color: Colors.danger },
          ].map(item => (
            <View key={item.label} style={styles.ruleRow}>
              <Text style={styles.ruleLabel}>{item.label}</Text>
              <Text style={[styles.ruleValue, { color: item.color }]}>{item.value}</Text>
            </View>
          ))}
        </Card>

        {/* Métricas */}
        <Text style={styles.sectionTitle}>📈 Mis Propiedades</Text>
        <View style={styles.metricsGrid}>
          <MetricCard label="Total capturadas" value={String(properties.length)} emoji="📷" color={Colors.accent} />
          <MetricCard label="Nuevas (verde)" value={String(stats.nueva)} emoji="🟢" color={Colors.success} />
          <MetricCard label="En negociación" value={String(stats.negociacion)} emoji="🟡" color={Colors.warning} />
          <MetricCard label="Ventas cerradas" value={String(stats.cerrado)} emoji="🔴" color={Colors.danger} />
        </View>

        {/* Recientes */}
        <Text style={styles.sectionTitle}>🕐 Actividad Reciente</Text>
        {recentProps.length === 0 ? (
          <Card>
            <Text style={{ color: Colors.textSecondary, textAlign: 'center' }}>
              Aún no has capturado propiedades. ¡Empieza con la cámara! 📷
            </Text>
          </Card>
        ) : (
          recentProps.map(p => (
            <View key={p.id} style={styles.propRow}>
              <View style={[styles.statusDot, { backgroundColor: Colors.statusColors[p.status] }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.propTitle}>{p.tipo} · {p.canton}</Text>
                <Text style={styles.propSub}>{formatDate(p.createdAt)} · {formatCurrency(p.ingreso)}</Text>
              </View>
              <Text style={{ fontSize: 20 }}>
                {p.status === 'nueva' ? '🟢' : p.status === 'en_negociacion' ? '🟡' : p.status === 'contrato_cerrado' ? '🔴' : '⚫'}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: 20, gap: 16, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary },
  subgreeting: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  avatarBadge: { width: 50, height: 50, borderRadius: 25, backgroundColor: Colors.accentLight, alignItems: 'center', justifyContent: 'center' },
  incomeCard: {
    backgroundColor: Colors.accent,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 4,
  },
  incomeLabel: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  incomeValue: { fontSize: 40, fontWeight: '900', color: Colors.white },
  incomeRow: { flexDirection: 'row', gap: 16, marginTop: 8 },
  incomeDetail: { fontSize: 12, color: 'rgba(255,255,255,0.75)' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  ruleRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
  ruleLabel: { fontSize: 14, color: Colors.textSecondary },
  ruleValue: { fontSize: 14, fontWeight: '700' },
  propRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    padding: 14,
  },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  propTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  propSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
});