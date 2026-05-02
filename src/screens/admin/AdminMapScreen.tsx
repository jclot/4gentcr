import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Callout } from 'react-native-maps';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { formatCurrency, formatDate } from '../../utils/locationUtils';
import { Property, PropertyStatus } from '../../data/mockData';

const STATUS_CONFIG: Record<PropertyStatus, { color: string; emoji: string; label: string }> = {
  nueva: { color: Colors.success, emoji: '🟢', label: 'Nueva (Solo Fotos)' },
  en_negociacion: { color: Colors.warning, emoji: '🟡', label: 'En Negociación' },
  contrato_cerrado: { color: Colors.danger, emoji: '🔴', label: 'Contrato Cerrado' },
  invalida: { color: Colors.textSecondary, emoji: '⚫', label: 'Inválida' },
};

export default function AdminMapScreen() {
  const { db, updatePropertyStatus } = useAppStore();
  const [selected, setSelected] = useState<Property | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState<PropertyStatus | 'all'>('all');

  const filteredProps = filterStatus === 'all'
    ? db.properties
    : db.properties.filter(p => p.status === filterStatus);

  const handleChangeStatus = (prop: Property, newStatus: PropertyStatus) => {
    Alert.alert(
      'Cambiar Estado',
      `¿Cambiar "${prop.tipo} en ${prop.canton}" a "${STATUS_CONFIG[newStatus].label}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => {
            updatePropertyStatus(prop.id, newStatus);
            setModalVisible(false);
          },
        },
      ],
    );
  };

  const getCapturedByName = (userId: string) => {
    const u = db.users.find(u => u.id === userId);
    return u?.nombres.split(' ').slice(0, 2).join(' ') ?? 'Desconocido';
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>
      {/* Leyenda */}
      <View style={styles.legend}>
        <TouchableOpacity
          onPress={() => setFilterStatus('all')}
          style={[styles.legendBtn, filterStatus === 'all' && styles.legendBtnActive]}
        >
          <Text style={styles.legendText}>Todos ({db.properties.length})</Text>
        </TouchableOpacity>
        {(Object.keys(STATUS_CONFIG) as PropertyStatus[]).map(s => (
          <TouchableOpacity
            key={s}
            onPress={() => setFilterStatus(s)}
            style={[styles.legendBtn, filterStatus === s && styles.legendBtnActive]}
          >
            <Text style={styles.legendText}>
              {STATUS_CONFIG[s].emoji} {db.properties.filter(p => p.status === s).length}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Mapa */}
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: 9.9281,
          longitude: -84.0907,
          latitudeDelta: 0.12,
          longitudeDelta: 0.12,
        }}
        mapType="standard"
      >
        {filteredProps.map(prop => (
          <Marker
            key={prop.id}
            coordinate={{ latitude: prop.lat, longitude: prop.lng }}
            pinColor={STATUS_CONFIG[prop.status].color}
            onPress={() => { setSelected(prop); setModalVisible(true); }}
          >
            <View style={[styles.markerBubble, { backgroundColor: STATUS_CONFIG[prop.status].color }]}>
              <Text style={styles.markerText}>{prop.tipo[0]}</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Modal detalle */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {selected && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalTitle}>{selected.tipo} · {selected.canton}</Text>
                    <Text style={styles.modalSub}>{selected.provincia} › {selected.distrito}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Text style={{ fontSize: 24, color: Colors.textSecondary }}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={[styles.statusBadge, { backgroundColor: STATUS_CONFIG[selected.status].color + '22' }]}>
                  <Text style={[styles.statusBadgeText, { color: STATUS_CONFIG[selected.status].color }]}>
                    {STATUS_CONFIG[selected.status].emoji} {STATUS_CONFIG[selected.status].label}
                  </Text>
                </View>

                <View style={styles.infoGrid}>
                  <InfoRow label="Scout" value={getCapturedByName(selected.capturedBy)} />
                  <InfoRow label="Teléfono cartel" value={selected.telefono} />
                  <InfoRow label="Precio aprox." value={formatCurrency(selected.precioAproximado)} />
                  <InfoRow label="Ingreso acreditado" value={formatCurrency(selected.ingreso)} />
                  <InfoRow label="Exclusividad" value={selected.exclusividad ? '✅ Sí' : '❌ No'} />
                  <InfoRow label="Registrada" value={formatDate(selected.createdAt)} />
                  <InfoRow label="Coordenadas" value={`${selected.lat.toFixed(4)}, ${selected.lng.toFixed(4)}`} />
                </View>

                {selected.descripcion ? (
                  <Text style={styles.descText}>📝 {selected.descripcion}</Text>
                ) : null}

                <Text style={styles.changeStatusTitle}>Cambiar Estado:</Text>
                <View style={styles.statusBtns}>
                  {(Object.keys(STATUS_CONFIG) as PropertyStatus[])
                    .filter(s => s !== selected.status)
                    .map(s => (
                      <TouchableOpacity
                        key={s}
                        style={[styles.statusChangeBtn, { borderColor: STATUS_CONFIG[s].color }]}
                        onPress={() => handleChangeStatus(selected, s)}
                      >
                        <Text style={{ color: STATUS_CONFIG[s].color, fontWeight: '700', fontSize: 13 }}>
                          {STATUS_CONFIG[s].emoji} {STATUS_CONFIG[s].label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={infoStyles.row}>
    <Text style={infoStyles.label}>{label}</Text>
    <Text style={infoStyles.value}>{value}</Text>
  </View>
);

const infoStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
  label: { fontSize: 13, color: Colors.textSecondary },
  value: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, flex: 1, textAlign: 'right' },
});

const styles = StyleSheet.create({
  legend: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    backgroundColor: Colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexWrap: 'wrap',
  },
  legendBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: Colors.bgInput },
  legendBtnActive: { backgroundColor: Colors.accent },
  legendText: { fontSize: 12, color: Colors.textPrimary, fontWeight: '600' },
  markerBubble: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.white,
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4, elevation: 4,
  },
  markerText: { color: Colors.white, fontWeight: '900', fontSize: 12 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalCard: {
    backgroundColor: Colors.bgCard,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: '85%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  modalSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  statusBadge: { borderRadius: 10, padding: 10, marginBottom: 16 },
  statusBadgeText: { fontWeight: '700', fontSize: 14 },
  infoGrid: { gap: 2, marginBottom: 16 },
  descText: { fontSize: 13, color: Colors.textSecondary, marginBottom: 16, lineHeight: 20 },
  changeStatusTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginBottom: 10 },
  statusBtns: { gap: 8 },
  statusChangeBtn: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
});