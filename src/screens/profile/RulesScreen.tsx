import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { ChevronLeft, Trophy, Camera, Handshake, Home, Ban, CreditCard, AlertCircle } from 'lucide-react-native';

export default function RulesScreen({ navigation }: any) {
  const { colors: C, fs } = useTheme();
  const styles = useMemo(() => makeStyles(C, fs), [C, fs]);

  const RewardCard = ({ icon: Icon, title, amount, desc, color }: any) => (
    <View style={[styles.rewardCard, { borderColor: color }]}>
      <View style={[styles.rewardIcon, { backgroundColor: color + '20' }]}>
        <Icon size={24} color={color} />
      </View>
      <View style={styles.rewardText}>
        <Text style={styles.rewardTitle}>{title}</Text>
        <Text style={styles.rewardDesc}>{desc}</Text>
      </View>
      <View style={[styles.rewardAmountBox, { backgroundColor: color }]}>
        <Text style={styles.rewardAmount}>{amount}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Reglamento y Pagos</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.heroBox}>
          <Trophy size={48} color={C.warning} />
          <Text style={styles.heroTitle}>Tu esfuerzo tiene recompensa</Text>
          <Text style={styles.heroDesc}>En Virtual Agent, no solo construimos la mejor base de datos inmobiliaria, sino que premiamos cada paso de tu trabajo. ¡Así es como ganas con nosotros!</Text>
        </View>

        <Text style={styles.sectionTitle}>El camino hacia los ₡100,000</Text>
        <View style={styles.rewardsContainer}>
          <RewardCard icon={Camera} title="1. Ingreso Nuevo" amount="₡250" color={C.accent} desc="Por cada propiedad inédita que captures." />
          <View style={styles.connector} />
          <RewardCard icon={Handshake} title="2. Captación Exitosa" amount="₡2,000" color={C.success} desc="Si el dueño acepta que Virtual Agent venda su propiedad gracias a tu registro." />
          <View style={styles.connector} />
          <RewardCard icon={Home} title="3. Venta Cerrada" amount="₡100,000" color={C.warning} desc="¡El gran premio! Te lo llevas cuando nuestra oficina logre vender la propiedad." />
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 32 }]}>¿Cómo y cuándo cobro?</Text>
        <View style={styles.card}>
          <View style={styles.ruleRow}>
            <CreditCard size={20} color={C.accent} />
            <Text style={styles.ruleText}><Text style={styles.bold}>Capturas (₡250):</Text> Se pagan todos los <Text style={styles.bold}>viernes</Text> vía SINPE Móvil al número que registraste, sumando todo lo acumulado en la semana.</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.ruleRow}>
            <Handshake size={20} color={C.success} />
            <Text style={styles.ruleText}><Text style={styles.bold}>Bonos de Captación (₡2,000):</Text> Se depositan la misma semana en que el dueño firme el acuerdo de correduría con nosotros.</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.ruleRow}>
            <Home size={20} color={C.warning} />
            <Text style={styles.ruleText}><Text style={styles.bold}>Premios de Venta (₡100,000):</Text> Se transfieren una semana después de que recibamos la comisión por la transacción exitosa.</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Reglas de Oro</Text>
        <View style={styles.card}>
          <View style={styles.ruleRow}>
            <AlertCircle size={24} color={C.warning} />
            <View style={{ flex: 1 }}>
              <Text style={styles.ruleTitle}>Cero Duplicados</Text>
              <Text style={styles.ruleText}>Para mantener la base de datos limpia, solo se paga a la primera persona que registre la propiedad. Si alguien más ya la había subido, el sistema la marcará como duplicada y no generará bonificación.</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.ruleRow}>
            <Ban size={24} color={C.danger} />
            <View style={{ flex: 1 }}>
              <Text style={styles.ruleTitle}>Cero Agencias Inmobiliarias</Text>
              <Text style={styles.ruleText}>Solo aceptamos carteles de dueños directos. Si subes una foto de un rótulo que pertenece a otra agencia de bienes raíces, el registro será anulado automáticamente.</Text>
            </View>
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
  scroll: { padding: 20, paddingBottom: 50 },
  heroBox: { alignItems: 'center', backgroundColor: C.warningLight, padding: 24, borderRadius: 24, marginBottom: 30, borderWidth: 1, borderColor: C.warning + '30' },
  heroTitle: { fontSize: fs(20), fontWeight: '900', color: C.textPrimary, marginTop: 16, marginBottom: 8, textAlign: 'center' },
  heroDesc: { fontSize: fs(14), color: C.textSecondary, textAlign: 'center', lineHeight: 22 },
  sectionTitle: { fontSize: fs(14), fontWeight: '900', color: C.textSecondary, marginBottom: 16, marginLeft: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  rewardsContainer: { paddingHorizontal: 8 },
  rewardCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bgCard, padding: 12, borderRadius: 20, borderWidth: 1.5, gap: 12 },
  rewardIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  rewardText: { flex: 1 },
  rewardTitle: { fontSize: fs(16), fontWeight: '800', color: C.textPrimary, marginBottom: 2 },
  rewardDesc: { fontSize: fs(12), color: C.textSecondary, lineHeight: 16 },
  rewardAmountBox: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  rewardAmount: { color: C.white, fontWeight: '900', fontSize: fs(15) },
  connector: { width: 2, height: 20, backgroundColor: C.border, marginLeft: 36, marginVertical: 4 },
  card: { backgroundColor: C.bgCard, borderRadius: 20, borderWidth: 1, borderColor: C.border, padding: 20, gap: 16 },
  ruleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  ruleTitle: { fontSize: fs(16), fontWeight: '800', color: C.textPrimary, marginBottom: 4 },
  ruleText: { flex: 1, fontSize: fs(13), color: C.textSecondary, lineHeight: 20 },
  bold: { fontWeight: '800', color: C.textPrimary },
  divider: { height: 1, backgroundColor: C.bgInput },
});
