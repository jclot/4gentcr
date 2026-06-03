import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../../theme/ThemeContext';
import { formatCurrency, formatDate } from '../../utils/locationUtils';
import { Hand, Home, Smartphone, CircleDollarSign, TrendingUp, Camera, Circle, Clock } from 'lucide-react-native';
import Card from '../../components/Card';

const MetricCard = ({ label, value, Icon, color }: { label: string; value: string; Icon: any; color: string }) => {
  const { colors: C, fs } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: C.bgCard, borderRadius: 16, padding: 16, alignItems: 'center', gap: 8, minWidth: '44%', borderWidth: 1, borderColor: color }}>
      <Icon size={28} color={color} />
      <Text style={{ fontSize: fs(18), fontWeight: '800', color }}>{value}</Text>
      <Text style={{ fontSize: fs(11), color: C.textSecondary, textAlign: 'center' }}>{label}</Text>
    </View>
  );
};

export default function DashboardScreen() {
  const { getCurrentUser, getPropertiesByUser } = useAppStore();
  const { colors: C, fs } = useTheme();
  const user = getCurrentUser()!;
  const properties = getPropertiesByUser(user.id);
  const styles = useMemo(() => makeStyles(C, fs), [C, fs]);

  const stats = {
    nueva: properties.filter(p => p.status === 'nueva').length,
    negociacion: properties.filter(p => p.status === 'en_negociacion').length,
    cerrado: properties.filter(p => p.status === 'contrato_cerrado').length,
    invalida: properties.filter(p => p.status === 'invalida').length,
  };

  const recentProps = [...properties].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'nueva': return <Circle fill={C.success} color={C.success} size={20} />;
      case 'en_negociacion': return <Circle fill={C.warning} color={C.warning} size={20} />;
      case 'contrato_cerrado': return <Circle fill={C.danger} color={C.danger} size={20} />;
      default: return <Circle fill={C.textSecondary} color={C.textSecondary} size={20} />;
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={styles.greeting}>Hola, {user.nombres.split(' ')[0]}</Text>
              <Hand size={24} color={C.textPrimary} />
            </View>
            <Text style={styles.subgreeting}>Aquí está tu resumen</Text>
          </View>
          <View style={styles.avatarBadge}>
            {user.avatar ? <Image source={{ uri: user.avatar }} style={styles.avatarImage} /> : <Home size={24} color={C.accent} />}
          </View>
        </View>

        <View style={styles.incomeCard}>
          <Text style={styles.incomeLabel}>Ingresos Totales</Text>
          <Text style={styles.incomeValue}>{formatCurrency(user.totalIngresos)}</Text>
          <View style={styles.incomeRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Smartphone size={14} color="rgba(255,255,255,0.75)" />
              <Text style={styles.incomeDetail}>SINPE: {user.telefonoSinpe}</Text>
            </View>
            <Text style={styles.incomeDetail}>alias: {user.alias}</Text>
          </View>
        </View>

        <Card>
          <View style={styles.sectionHeader}>
            <CircleDollarSign size={18} color={C.textPrimary} />
            <Text style={styles.sectionTitle}>Estructura de Pagos</Text>
          </View>
          {[
            { label: 'Propiedad Nueva', value: '₡250', color: C.success },
            { label: 'Gestión / Exclusividad', value: '₡2,000', color: C.warning },
            { label: 'Venta Exitosa', value: '₡100,000', color: C.accent },
            { label: 'Duplicada / Agencia', value: '₡0', color: C.danger },
          ].map(item => (
            <View key={item.label} style={styles.ruleRow}>
              <Text style={styles.ruleLabel}>{item.label}</Text>
              <Text style={[styles.ruleValue, { color: item.color }]}>{item.value}</Text>
            </View>
          ))}
        </Card>

        <View style={styles.sectionHeader}>
          <TrendingUp size={20} color={C.textPrimary} />
          <Text style={styles.sectionTitle}>Mis Propiedades</Text>
        </View>
        <View style={styles.metricsGrid}>
          <MetricCard label="Total capturadas" value={String(properties.length)} Icon={Camera} color={C.accent} />
          <MetricCard label="Nuevas (verde)" value={String(stats.nueva)} Icon={Circle} color={C.success} />
          <MetricCard label="En negociación" value={String(stats.negociacion)} Icon={Circle} color={C.warning} />
          <MetricCard label="Ventas cerradas" value={String(stats.cerrado)} Icon={Circle} color={C.danger} />
        </View>

        <View style={styles.sectionHeader}>
          <Clock size={20} color={C.textPrimary} />
          <Text style={styles.sectionTitle}>Actividad Reciente</Text>
        </View>
        {recentProps.length === 0 ? (
          <Card>
            <View style={{ alignItems: 'center', gap: 8 }}>
              <Camera size={32} color={C.textSecondary} />
              <Text style={{ color: C.textSecondary, textAlign: 'center' }}>Aún no has capturado propiedades. ¡Empieza con la cámara!</Text>
            </View>
          </Card>
        ) : (
          recentProps.map(p => (
            <View key={p.id} style={styles.propRow}>
              <View style={[styles.statusDot, { backgroundColor: C.statusColors[p.status] }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.propTitle}>{p.tipo} · {p.canton}</Text>
                <Text style={styles.propSub}>{formatDate(p.createdAt)} · {formatCurrency(p.ingreso)}</Text>
              </View>
              {getStatusIcon(p.status)}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (C: any, fs: (n: number) => number) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 20, gap: 16, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: fs(26), fontWeight: '800', color: C.textPrimary },
  subgreeting: { fontSize: fs(13), color: C.textSecondary, marginTop: 2 },
  avatarBadge: { width: 50, height: 50, borderRadius: 25, backgroundColor: C.accentLight, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  incomeCard: { backgroundColor: C.accent, borderRadius: 20, padding: 24, alignItems: 'center', gap: 4 },
  incomeLabel: { fontSize: fs(13), color: 'rgba(255,255,255,0.8)' },
  incomeValue: { fontSize: fs(40), fontWeight: '900', color: C.white },
  incomeRow: { flexDirection: 'row', gap: 16, marginTop: 8 },
  incomeDetail: { fontSize: fs(12), color: 'rgba(255,255,255,0.75)' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  sectionTitle: { fontSize: fs(16), fontWeight: '700', color: C.textPrimary },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  ruleRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border },
  ruleLabel: { fontSize: fs(14), color: C.textSecondary },
  ruleValue: { fontSize: fs(14), fontWeight: '700' },
  propRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.bgCard, borderRadius: 12, padding: 14 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  propTitle: { fontSize: fs(14), fontWeight: '600', color: C.textPrimary },
  propSub: { fontSize: fs(12), color: C.textSecondary, marginTop: 2 },
});
