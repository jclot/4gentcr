import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { ChevronLeft, HelpCircle } from 'lucide-react-native';

export default function HelpCenterScreen({ navigation }: any) {
  const { colors: C, fs } = useTheme();
  const styles = useMemo(() => makeStyles(C, fs), [C, fs]);

  const FAQItem = ({ question, answer }: any) => (
    <View style={styles.faqCard}>
      <Text style={styles.question}>{question}</Text>
      <Text style={styles.answer}>{answer}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Centro de Ayuda</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          <HelpCircle size={40} color={C.accent} />
          <Text style={styles.heroTitle}>¿Cómo podemos ayudarte?</Text>
        </View>

        <Text style={styles.sectionTitle}>Preguntas Frecuentes</Text>
        <FAQItem
          question="¿Cómo se pagan las propiedades?"
          answer="Los pagos se acreditan automáticamente a tu cuenta bancaria registrada 24 horas después de que validemos la exclusividad."
        />
        <FAQItem
          question="¿Qué pasa si subo una foto borrosa?"
          answer="Si el OCR no detecta el número, el sistema la marcará como inválida. Asegúrate de tomar fotos claras."
        />
        <FAQItem
          question="¿Por qué mi propiedad dice Agencia?"
          answer="Las propiedades que tienen logos de otras agencias inmobiliarias no aplican para pago en Virtual Agent."
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (C: any, fs: (n: number) => number) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: C.border },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  title: { fontSize: fs(18), fontWeight: '700', color: C.textPrimary },
  scroll: { padding: 20 },
  hero: { alignItems: 'center', gap: 12, marginVertical: 30 },
  heroTitle: { fontSize: fs(20), fontWeight: '800', color: C.textPrimary },
  sectionTitle: { fontSize: fs(16), fontWeight: '700', color: C.textSecondary, marginBottom: 12 },
  faqCard: { backgroundColor: C.bgCard, padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: C.border },
  question: { fontSize: fs(15), fontWeight: '700', color: C.textPrimary, marginBottom: 8 },
  answer: { fontSize: fs(13), color: C.textSecondary, lineHeight: 20 },
});
