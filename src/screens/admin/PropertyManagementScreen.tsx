import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Share, ScrollView, Linking, Platform, TextInput, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../../theme/ThemeContext';
import { formatCurrency, formatDate } from '../../utils/locationUtils';
import { Property, PropertyStatus } from '../../data/mockData';
import { useModalStore } from '../../store/useModalStore';
import {
  Globe, Trash2, Phone, CircleDollarSign, CheckCircle,
  AlertTriangle, Ban, MapPin, Map, Car, Upload, Circle, Search, X, UserCircle
} from 'lucide-react-native';

export default function PropertyManagementScreen() {
  const { db, updatePropertyStatus, deleteProperty } = useAppStore();
  const { colors: C, fs } = useTheme();
  const [filter, setFilter] = useState<PropertyStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { confirm } = useModalStore();
  const styles = useMemo(() => makeStyles(C, fs), [C, fs]);

  const STATUS_CONFIG = useMemo((): Record<PropertyStatus, { color: string; short: string }> => ({
    nueva: { color: C.success, short: 'Nueva' },
    en_negociacion: { color: C.warning, short: 'Negociando' },
    contrato_cerrado: { color: C.danger, short: 'Cerrado' },
    invalida: { color: C.textSecondary, short: 'Inválida' },
  }), [C]);

  const getCapturedByAlias = (userId: string) => db.users.find(u => u.id === userId)?.alias ?? '?';
  const getCapturedByUser = (userId: string) => db.users.find(u => u.id === userId);

  const filtered = db.properties.filter(p => {
    const matchesStatus = filter === 'all' || p.status === filter;
    if (!searchQuery.trim()) return matchesStatus;
    const query = searchQuery.toLowerCase();
    const scoutName = getCapturedByAlias(p.capturedBy).toLowerCase();
    const location = `${p.provincia} ${p.canton} ${p.distrito}`.toLowerCase();
    const phone = p.telefono.toLowerCase();
    return matchesStatus && (scoutName.includes(query) || location.includes(query) || phone.includes(query));
  });

  const sortedProps = [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleExport = async () => {
    try {
      const date = new Date();
      const dateString = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
      const uniqueId = Math.random().toString(36).substring(2, 6).toUpperCase();
      const fileName = `VA_Propiedades_${dateString}_ID-${uniqueId}.json`;
      // @ts-ignore
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      const jsonContent = JSON.stringify(db.properties, null, 2);
      // @ts-ignore
      await FileSystem.writeAsStringAsync(fileUri, jsonContent);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Exportar Base de Datos Virtual Agent',
          UTI: 'public.json',
        });
      } else {
        await Share.share({ message: jsonContent, title: fileName });
      }
    } catch (error) {
      console.error('Error al exportar:', error);
      confirm({
        title: 'Error de exportación',
        message: 'Ocurrió un problema al intentar generar el archivo. Por favor, intenta de nuevo.',
        confirmLabel: 'OK',
        onConfirm: () => {},
      });
    }
  };

  const handleDelete = (prop: Property) => {
    confirm({
      title: 'Eliminar propiedad',
      message: `¿Eliminar "${prop.tipo} en ${prop.canton}"? Esta acción no se puede deshacer.`,
      confirmLabel: 'Eliminar',
      cancelLabel: 'Cancelar',
      variant: 'danger',
      onConfirm: () => deleteProperty(prop.id),
    });
  };

  const handleOpenMaps = (lat: number, lng: number, app: 'google' | 'waze') => {
    if (app === 'google') {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`);
    } else {
      Linking.openURL(`https://waze.com/ul?ll=${lat},${lng}&navigate=yes`);
    }
  };

  const renderItem = ({ item: prop }: { item: Property }) => (
    <View style={styles.propCard}>
      <View style={styles.propHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.propTitle}>{prop.tipo} · {prop.canton}</Text>
          <View style={styles.scoutRow}>
            <View style={styles.scoutAvatar}>
              {getCapturedByUser(prop.capturedBy)?.avatar ? (
                <Image source={{ uri: getCapturedByUser(prop.capturedBy)!.avatar }} style={styles.scoutAvatarImage} />
              ) : (
                <UserCircle size={16} color={C.accent} />
              )}
            </View>
            <Text style={styles.propSub}>@{getCapturedByAlias(prop.capturedBy)} | {formatDate(prop.createdAt)}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => handleDelete(prop)} style={styles.deleteBtn}>
          <Trash2 size={20} color={C.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.propDetails}>
        <View style={styles.detailPill}>
          <Phone size={12} color={C.textSecondary} />
          <Text style={styles.detailText}>{prop.telefono}</Text>
        </View>
        <View style={styles.detailPill}>
          <CircleDollarSign size={12} color={C.textSecondary} />
          <Text style={styles.detailText}>{formatCurrency(prop.ingreso)}</Text>
        </View>
        {prop.exclusividad && (
          <View style={[styles.detailPill, { backgroundColor: C.accentLight }]}>
            <CheckCircle size={12} color={C.accent} />
            <Text style={[styles.detailText, { color: C.accent }]}>Exclusividad</Text>
          </View>
        )}
        {prop.esDuplicada && (
          <View style={[styles.detailPill, { backgroundColor: C.warningLight }]}>
            <AlertTriangle size={12} color={C.warning} />
            <Text style={[styles.detailText, { color: C.warning }]}>Duplicada</Text>
          </View>
        )}
        {prop.esDeAgencia && (
          <View style={[styles.detailPill, { backgroundColor: C.dangerLight }]}>
            <Ban size={12} color={C.danger} />
            <Text style={[styles.detailText, { color: C.danger }]}>Agencia</Text>
          </View>
        )}
      </View>

      <View style={styles.locationBox}>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <MapPin size={14} color={C.textPrimary} />
            <Text style={styles.locationFull}>{prop.provincia}, {prop.canton}, {prop.distrito}</Text>
          </View>
          <Text style={styles.locationCoords}>{prop.lat.toFixed(6)}, {prop.lng.toFixed(6)}</Text>
        </View>
        <View style={styles.mapActions}>
          <TouchableOpacity style={styles.mapActionBtn} onPress={() => handleOpenMaps(prop.lat, prop.lng, 'google')}>
            <Map size={16} color={C.textPrimary} />
            <Text style={styles.mapActionText}>Google Maps</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.mapActionBtn} onPress={() => handleOpenMaps(prop.lat, prop.lng, 'waze')}>
            <Car size={16} color={C.textPrimary} />
            <Text style={styles.mapActionText}>Waze</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statusBtns}>
        {(Object.keys(STATUS_CONFIG) as PropertyStatus[]).map(s => {
          const config = STATUS_CONFIG[s];
          const isActive = prop.status === s;
          return (
            <TouchableOpacity
              key={s}
              onPress={() => {
                if (!isActive) {
                  confirm({
                    title: 'Cambiar Estado',
                    message: `Cambiar a "${config.short}"`,
                    confirmLabel: 'Confirmar',
                    cancelLabel: 'Cancelar',
                    onConfirm: () => updatePropertyStatus(prop.id, s),
                  });
                }
              }}
              style={[
                styles.statusBtn,
                isActive
                  ? { backgroundColor: config.color, borderColor: config.color }
                  : { backgroundColor: C.bgInput, borderColor: C.border },
              ]}
            >
              <Text style={[styles.statusBtnText, isActive ? { color: C.white } : { color: C.textSecondary }]}>
                {config.short}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={2}>Gestión de Propiedades</Text>
          <Text style={styles.subtitle}>{db.properties.length} propiedades registradas</Text>
        </View>
        <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
          <Upload size={16} color={C.white} />
          <Text style={styles.exportText}>Exportar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filtersContainer}>
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

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
          <TouchableOpacity
            onPress={() => setFilter('all')}
            style={[
              styles.filterChip,
              filter === 'all'
                ? { backgroundColor: C.accent, borderColor: C.accent }
                : { backgroundColor: C.bgInput, borderColor: C.border },
            ]}
          >
            <Globe size={14} color={filter === 'all' ? C.white : C.textSecondary} />
            <Text style={[styles.filterText, filter === 'all' ? { color: C.white } : { color: C.textSecondary }]}>
              Todos ({db.properties.length})
            </Text>
          </TouchableOpacity>

          {(Object.keys(STATUS_CONFIG) as PropertyStatus[]).map(f => {
            const isActive = filter === f;
            const config = STATUS_CONFIG[f];
            const count = db.properties.filter(p => p.status === f && (
              !searchQuery.trim() ||
              getCapturedByAlias(p.capturedBy).toLowerCase().includes(searchQuery.toLowerCase()) ||
              `${p.provincia} ${p.canton} ${p.distrito}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.telefono.toLowerCase().includes(searchQuery.toLowerCase())
            )).length;

            return (
              <TouchableOpacity
                key={f}
                onPress={() => setFilter(f)}
                style={[
                  styles.filterChip,
                  isActive
                    ? { backgroundColor: config.color, borderColor: config.color }
                    : { backgroundColor: C.bgInput, borderColor: C.border },
                ]}
              >
                <Circle size={12} fill={isActive ? C.white : config.color} color={isActive ? C.white : config.color} />
                <Text style={[styles.filterText, isActive ? { color: C.white } : { color: C.textSecondary }]}>
                  {config.short} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={sortedProps}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {searchQuery ? 'No se encontraron resultados para tu búsqueda.' : 'No hay propiedades en este estado.'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const makeStyles = (C: any, fs: (n: number) => number) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16,
  },
  titleContainer: { flex: 1, paddingRight: 20 },
  title: { fontSize: fs(24), fontWeight: '800', color: C.textPrimary, lineHeight: 28 },
  subtitle: { fontSize: fs(13), color: C.textSecondary, marginTop: 4 },
  exportBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: C.accent, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14,
  },
  exportText: { color: C.white, fontWeight: '700', fontSize: fs(13) },
  filtersContainer: { paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: C.border, gap: 12 },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: C.bgInput,
    marginHorizontal: 16, paddingHorizontal: 14, height: 44, borderRadius: 12,
    borderWidth: 1, borderColor: C.border,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: fs(14), color: C.textPrimary },
  clearBtn: { backgroundColor: C.textSecondary, padding: 4, borderRadius: 12 },
  filtersScroll: { paddingHorizontal: 16, gap: 10, alignItems: 'center' },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5,
  },
  filterText: { fontSize: fs(13), fontWeight: '700' },
  propCard: { backgroundColor: C.bgCard, borderRadius: 16, padding: 16, gap: 12 },
  propHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  propTitle: { fontSize: fs(16), fontWeight: '700', color: C.textPrimary },
  scoutRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  scoutAvatar: {
    width: 20, height: 20, borderRadius: 10, overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center', backgroundColor: C.accentLight,
  },
  scoutAvatarImage: { width: '100%', height: '100%' },
  propSub: { fontSize: fs(12), color: C.textSecondary, marginTop: 2 },
  deleteBtn: { padding: 4 },
  propDetails: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  detailPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: C.bgInput, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
  },
  detailText: { fontSize: fs(12), color: C.textSecondary, fontWeight: '600' },
  locationBox: { backgroundColor: C.bgInput, padding: 12, borderRadius: 12, gap: 10 },
  locationFull: { fontSize: fs(13), fontWeight: '600', color: C.textPrimary },
  locationCoords: {
    fontSize: fs(11), color: C.textSecondary, marginTop: 2, marginLeft: 20,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  mapActions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  mapActionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border,
    paddingVertical: 8, borderRadius: 10, gap: 8,
  },
  mapActionText: { fontSize: fs(12), fontWeight: '700', color: C.textPrimary },
  statusBtns: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  statusBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1.5 },
  statusBtnText: { fontSize: fs(11), fontWeight: '700' },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: C.textSecondary, fontSize: fs(15), textAlign: 'center', lineHeight: 22 },
});
