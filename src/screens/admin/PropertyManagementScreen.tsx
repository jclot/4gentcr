import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { formatCurrency, formatDate } from '../../utils/locationUtils';
import { Property, PropertyStatus } from '../../data/mockData';

const STATUS_LABELS: Record<PropertyStatus, string> = {
  nueva: '🟢 Nueva',
  en_negociacion: '🟡 Negociando',
  contrato_cerrado: '🔴 Cerrado',
  invalida: '⚫ Inválida',
};

export default function PropertyManagementScreen() {
  const { db, updatePropertyStatus, deleteProperty } = useAppStore();
  const [filter, setFilter] = useState<PropertyStatus | 'all'>('all');

  const filtered = filter === 'all' ? db.properties : db.properties.filter(p => p.status === filter);
  const sortedProps = [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleExport = async () => {
    const json = JSON.stringify(db.properties, null, 2);
    await Share.share({ message: json, title: 'Virtual Agent - Propiedades' });
  };

  const handleDelete = (prop: Property) => {
    Alert.alert('Eliminar', `¿Eliminar "${prop.tipo} en ${prop.canton}"? Esta acción no se puede deshacer.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => deleteProperty(prop.id) },
    ]);
  };

  const getCapturedByAlias = (userId: string) => {
    return db.users.find(u => u.id === userId)?.alias ?? '?';
  };

  const renderItem = ({ item: prop }: { item: Property }) => (
    <View style={styles.propCard}>
      <View style={styles.propHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.propTitle}>{prop.tipo} · {prop.canton}</Text>
          <Text style={styles.propSub}>Scout: @{getCapturedByAlias(prop.capturedBy)} · {formatDate(prop.createdAt)}</Text>
        </View>
        <TouchableOpacity onPress={() => handleDelete(prop)} style={styles.deleteBtn}>
          <Text style={{ fontSize: 18 }}>🗑️</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.propDetails}>
        <Text style={styles.detail}>📞 {prop.telefono}</Text>
        <Text style={styles.detail}>💰 {formatCurrency(prop.ingreso)}</Text>
        <Text style={styles.detail}>📍 {prop.distrito}</Text>
        {prop.exclusividad && <Text style={[styles.detail, { color: Colors.accent }]}>✅ Exclusividad</Text>}
        {prop.esDuplicada && <Text style={[styles.detail, { color: Colors.warning }]}>⚠️ Duplicada</Text>}
        {prop.esDeAgencia && <Text style={[styles.detail, { color: Colors.danger }]}>🚫 Agencia</Text>}
      </View>

      {/* Botones de status */}
      <View style={styles.statusBtns}>
        {(['nueva', 'en_negociacion', 'contrato_cerrado', 'invalida'] as PropertyStatus[]).map(s => (
          <TouchableOpacity
            key={s}
            onPress={() => {
              if (s !== prop.status) {
                Alert.alert(
                  'Cambiar Estado',
                  `Cambiar a "${STATUS_LABELS[s]}"?`,
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'OK', onPress: () => updatePropertyStatus(prop.id, s) },
                  ],
                );
              }
            }}
            style={[
              styles.statusBtn,
              prop.status === s && styles.statusBtnActive,
            ]}
          >
            <Text style={[styles.statusBtnText, prop.status === s && { color: Colors.white }]}>
              {STATUS_LABELS[s]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Gestión de Propiedades</Text>
          <Text style={styles.subtitle}>{db.properties.length} propiedades registradas</Text>
        </View>
        <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
          <Text style={styles.exportText}>⬆️ Exportar</Text>
        </TouchableOpacity>
      </View>

      {/* Filtros */}
      <View style={styles.filters}>
        {(['all', 'nueva', 'en_negociacion', 'contrato_cerrado', 'invalida'] as const).map(f => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
          >
            <Text style={[styles.filterText, filter === f && { color: Colors.white }]}>
              {f === 'all' ? `Todos (${db.properties.length})` : `${STATUS_LABELS[f as PropertyStatus]} (${db.properties.filter(p => p.status === f).length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={sortedProps}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No hay propiedades en este estado.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 12 },
  title: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: 13, color: Colors.textSecondary },
  exportBtn: { backgroundColor: Colors.accent, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  exportText: { color: Colors.white, fontWeight: '700', fontSize: 13 },
  filters: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, flexWrap: 'wrap', marginBottom: 8 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border },
  filterChipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  filterText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  propCard: { backgroundColor: Colors.bgCard, borderRadius: 16, padding: 16, gap: 12 },
  propHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  propTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  propSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  deleteBtn: { padding: 4 },
  propDetails: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  detail: { fontSize: 12, color: Colors.textSecondary, backgroundColor: Colors.bgInput, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusBtns: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  statusBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, backgroundColor: Colors.bgInput, borderWidth: 1, borderColor: Colors.border },
  statusBtnActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  statusBtnText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: Colors.textSecondary, fontSize: 15 },
});