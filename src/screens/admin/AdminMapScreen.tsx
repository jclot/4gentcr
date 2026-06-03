import React, { useState, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../../theme/ThemeContext';
import { formatCurrency, formatDate } from '../../utils/locationUtils';
import { Property, PropertyStatus } from '../../data/mockData';
import { useModalStore } from '../../store/useModalStore';
import { Globe, Circle, X, FileText, Check, Ban, Search } from 'lucide-react-native';

const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function AdminMapScreen() {
  const { db, updatePropertyStatus } = useAppStore();
  const { colors: C, fs } = useTheme();
  const [filterStatus, setFilterStatus] = useState<PropertyStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { confirm } = useModalStore();
  const [activeProp, setActiveProp] = useState<Property | null>(null);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const styles = useMemo(() => makeStyles(C, fs), [C, fs]);

  const STATUS_CONFIG = useMemo((): Record<PropertyStatus, { color: string; label: string; short: string }> => ({
    nueva: { color: C.success, label: 'Nueva (Solo Fotos)', short: 'Nueva' },
    en_negociacion: { color: C.warning, label: 'En Negociación', short: 'Negociando' },
    contrato_cerrado: { color: C.danger, label: 'Contrato Cerrado', short: 'Cerrado' },
    invalida: { color: C.textSecondary, label: 'Inválida', short: 'Inválida' },
  }), [C]);

  const openModal = (prop: Property) => {
    setActiveProp(prop);
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 24, stiffness: 100 }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: SCREEN_HEIGHT, duration: 250, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => { setActiveProp(null); });
  };

  const getCapturedByName = (userId: string) => {
    const u = db.users.find(u => u.id === userId);
    return u?.nombres.split(' ').slice(0, 2).join(' ') ?? 'Desconocido';
  };

  const filteredProps = db.properties.filter(p => {
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    if (!searchQuery.trim()) return matchesStatus;
    const query = searchQuery.toLowerCase();
    const scoutName = getCapturedByName(p.capturedBy).toLowerCase();
    const location = `${p.provincia} ${p.canton} ${p.distrito}`.toLowerCase();
    const phone = p.telefono.toLowerCase();
    const matchesSearch = scoutName.includes(query) || location.includes(query) || phone.includes(query);
    return matchesStatus && matchesSearch;
  });

  const handleChangeStatus = (prop: Property, newStatus: PropertyStatus) => {
    confirm({
      title: 'Cambiar Estado',
      message: `¿Cambiar "${prop.tipo} en ${prop.canton}" a "${STATUS_CONFIG[newStatus].label}"?`,
      confirmLabel: 'Cambiar',
      cancelLabel: 'Cancelar',
      onConfirm: () => {
        updatePropertyStatus(prop.id, newStatus);
        setActiveProp({ ...prop, status: newStatus });
      },
    });
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={styles.topContainer}>
        <View style={styles.searchContainer}>
          <Search size={18} color={C.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por zona, scout o teléfono..."
            placeholderTextColor={C.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
              <X size={16} color={C.white} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.legendScroll}>
          <TouchableOpacity
            onPress={() => setFilterStatus('all')}
            style={[
              styles.legendBtn,
              filterStatus === 'all'
                ? { backgroundColor: C.accent, borderColor: C.accent }
                : { backgroundColor: C.bgInput, borderColor: C.border },
            ]}
          >
            <Globe size={14} color={filterStatus === 'all' ? C.white : C.textSecondary} />
            <Text style={[styles.legendText, filterStatus === 'all' ? { color: C.white } : { color: C.textSecondary }]}>
              Todos ({db.properties.length})
            </Text>
          </TouchableOpacity>

          {(Object.keys(STATUS_CONFIG) as PropertyStatus[]).map(s => {
            const isActive = filterStatus === s;
            const config = STATUS_CONFIG[s];
            const count = db.properties.filter(p => p.status === s && (
              !searchQuery.trim() ||
              getCapturedByName(p.capturedBy).toLowerCase().includes(searchQuery.toLowerCase()) ||
              `${p.provincia} ${p.canton} ${p.distrito}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.telefono.toLowerCase().includes(searchQuery.toLowerCase())
            )).length;

            return (
              <TouchableOpacity
                key={s}
                onPress={() => setFilterStatus(s)}
                style={[
                  styles.legendBtn,
                  isActive
                    ? { backgroundColor: config.color, borderColor: config.color }
                    : { backgroundColor: C.bgInput, borderColor: C.border },
                ]}
              >
                <Circle size={12} fill={isActive ? C.white : config.color} color={isActive ? C.white : config.color} />
                <Text style={[styles.legendText, isActive ? { color: C.white } : { color: C.textSecondary }]}>
                  {config.short} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <MapView
        style={{ flex: 1 }}
        initialRegion={{ latitude: 9.9281, longitude: -84.0907, latitudeDelta: 0.12, longitudeDelta: 0.12 }}
        mapType="standard"
        onPress={() => { if (activeProp) closeModal(); }}
      >
        {filteredProps.map(prop => (
          <Marker
            key={prop.id}
            coordinate={{ latitude: prop.lat, longitude: prop.lng }}
            pinColor={STATUS_CONFIG[prop.status].color}
            onPress={(e) => { e.stopPropagation(); openModal(prop); }}
          >
            <View style={[styles.markerBubble, { backgroundColor: STATUS_CONFIG[prop.status].color }]}>
              <Text style={styles.markerText}>{prop.tipo[0]}</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {activeProp && (
        <View style={styles.overlayWrapper}>
          <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
            <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={closeModal} />
          </Animated.View>

          <Animated.View style={[styles.animatedModalContainer, { transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.modalCard}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalTitle}>{activeProp.tipo} · {activeProp.canton}</Text>
                    <Text style={styles.modalSub}>{activeProp.provincia} › {activeProp.distrito}</Text>
                  </View>
                  <TouchableOpacity onPress={closeModal} style={{ padding: 4 }}>
                    <X size={24} color={C.textSecondary} />
                  </TouchableOpacity>
                </View>

                <View style={[styles.statusBadge, { backgroundColor: STATUS_CONFIG[activeProp.status].color + '22' }]}>
                  <Circle size={16} fill={STATUS_CONFIG[activeProp.status].color} color={STATUS_CONFIG[activeProp.status].color} />
                  <Text style={[styles.statusBadgeText, { color: STATUS_CONFIG[activeProp.status].color }]}>
                    {STATUS_CONFIG[activeProp.status].label}
                  </Text>
                </View>

                <View style={styles.infoGrid}>
                  <InfoRow label="Scout" value={getCapturedByName(activeProp.capturedBy)} />
                  <InfoRow label="Teléfono cartel" value={activeProp.telefono} />
                  <InfoRow label="Precio aprox." value={formatCurrency(activeProp.precioAproximado)} />
                  <InfoRow label="Ingreso acreditado" value={formatCurrency(activeProp.ingreso)} />
                  <InfoRow label="Exclusividad" value={
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      {activeProp.exclusividad ? <Check size={14} color={C.success} /> : <Ban size={14} color={C.textSecondary} />}
                      <Text style={styles.infoValue}>{activeProp.exclusividad ? 'Sí' : 'No'}</Text>
                    </View>
                  } />
                  <InfoRow label="Registrada" value={formatDate(activeProp.createdAt)} />
                  <InfoRow label="Coordenadas" value={`${activeProp.lat.toFixed(4)}, ${activeProp.lng.toFixed(4)}`} />
                </View>

                {activeProp.descripcion ? (
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 16 }}>
                    <FileText size={16} color={C.textSecondary} style={{ marginTop: 2 }} />
                    <Text style={styles.descText}>{activeProp.descripcion}</Text>
                  </View>
                ) : null}

                <Text style={styles.changeStatusTitle}>Cambiar Estado:</Text>
                <View style={styles.statusBtns}>
                  {(Object.keys(STATUS_CONFIG) as PropertyStatus[])
                    .filter(s => s !== activeProp.status)
                    .map(s => (
                      <TouchableOpacity
                        key={s}
                        style={[styles.statusChangeBtn, { borderColor: STATUS_CONFIG[s].color }]}
                        onPress={() => handleChangeStatus(activeProp, s)}
                      >
                        <Circle size={14} fill={STATUS_CONFIG[s].color} color={STATUS_CONFIG[s].color} />
                        <Text style={{ color: STATUS_CONFIG[s].color, fontWeight: '700', fontSize: fs(13) }}>
                          {STATUS_CONFIG[s].label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                </View>
              </ScrollView>
            </View>
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
}

const InfoRow = ({ label, value }: { label: string; value: string | React.ReactNode }) => {
  const { colors: C, fs } = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border }}>
      <Text style={{ fontSize: fs(13), color: C.textSecondary }}>{label}</Text>
      {typeof value === 'string'
        ? <Text style={{ fontSize: fs(13), fontWeight: '600', color: C.textPrimary, textAlign: 'right' }}>{value}</Text>
        : value}
    </View>
  );
};

const makeStyles = (C: any, fs: (n: number) => number) => StyleSheet.create({
  topContainer: { backgroundColor: C.bgCard, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border, gap: 12 },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: C.bgInput,
    marginHorizontal: 16, paddingHorizontal: 14, height: 44, borderRadius: 12,
    borderWidth: 1, borderColor: C.border,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: fs(14), color: C.textPrimary },
  clearBtn: { backgroundColor: C.textSecondary, padding: 4, borderRadius: 12 },
  legendScroll: { paddingHorizontal: 16, gap: 8, alignItems: 'center' },
  legendBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
  legendText: { fontSize: fs(13), fontWeight: '700' },
  markerBubble: {
    width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: C.white, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4, elevation: 4,
  },
  markerText: { color: C.white, fontWeight: '900', fontSize: fs(12) },
  overlayWrapper: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end', zIndex: 10 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  animatedModalContainer: { width: '100%', maxHeight: '85%' },
  modalCard: {
    backgroundColor: C.bgCard, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, elevation: 20,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  modalTitle: { fontSize: fs(20), fontWeight: '800', color: C.textPrimary },
  modalSub: { fontSize: fs(13), color: C.textSecondary, marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, padding: 12, marginBottom: 16 },
  statusBadgeText: { fontWeight: '700', fontSize: fs(14) },
  infoGrid: { gap: 2, marginBottom: 16 },
  infoValue: { fontSize: fs(13), fontWeight: '600', color: C.textPrimary, textAlign: 'right' },
  descText: { fontSize: fs(13), color: C.textSecondary, flex: 1, lineHeight: 20 },
  changeStatusTitle: { fontSize: fs(14), fontWeight: '700', color: C.textPrimary, marginBottom: 10 },
  statusBtns: { gap: 8 },
  statusChangeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1.5, borderRadius: 12, padding: 12,
  },
});
