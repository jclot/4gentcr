import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { ChevronLeft, HelpCircle } from 'lucide-react-native';

export default function HelpCenterScreen({ navigation }: any) {
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
                    <ChevronLeft size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.title}>Centro de Ayuda</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.hero}>
                    <HelpCircle size={40} color={Colors.accent} />
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

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bg },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: Colors.border },
    backBtn: { width: 40, height: 40, justifyContent: 'center' },
    title: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
    scroll: { padding: 20 },
    hero: { alignItems: 'center', gap: 12, marginVertical: 30 },
    heroTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.textSecondary, marginBottom: 12 },
    faqCard: { backgroundColor: Colors.bgCard, padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: Colors.border },
    question: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8 },
    answer: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
});