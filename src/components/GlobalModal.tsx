import React, { useMemo } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { useModalStore } from '../store/useModalStore';
import { useTheme } from '../theme/ThemeContext';
import { AlertTriangle, HelpCircle } from 'lucide-react-native';

export default function GlobalModal() {
  const { isVisible, config, close } = useModalStore();
  const { colors: C, fs } = useTheme();
  const styles = useMemo(() => makeStyles(C, fs), [C, fs]);

  if (!config) return null;

  const handleConfirm = () => { close(); setTimeout(() => config.onConfirm(), 80); };
  const handleCancel = () => { close(); setTimeout(() => config.onCancel?.(), 80); };
  const isDanger = config.variant === 'danger';

  return (
    <Modal visible={isVisible} transparent animationType="fade" statusBarTranslucent onRequestClose={handleCancel}>
      <Pressable style={styles.backdrop} onPress={handleCancel}>
        <Pressable style={styles.card} onPress={() => {}}>
          <View style={[styles.iconCircle, { backgroundColor: isDanger ? C.dangerLight : C.accentLight }]}>
            {isDanger ? <AlertTriangle size={32} color={C.danger} /> : <HelpCircle size={32} color={C.accent} />}
          </View>
          <Text style={styles.title}>{config.title}</Text>
          {!!config.message && <Text style={styles.message}>{config.message}</Text>}
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel} activeOpacity={0.75}>
              <Text style={styles.cancelText}>{config.cancelLabel ?? 'Cancelar'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, isDanger ? styles.confirmDanger : styles.confirmDefault]}
              onPress={handleConfirm}
              activeOpacity={0.75}
            >
              <Text style={styles.confirmText}>{config.confirmLabel ?? 'Confirmar'}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const makeStyles = (C: any, fs: (n: number) => number) => StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 32 },
  card: {
    width: '100%', backgroundColor: C.bgCard, borderRadius: 24, padding: 28,
    alignItems: 'center', gap: 14, borderWidth: 1, borderColor: C.border,
    shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 12,
  },
  iconCircle: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  title: { fontSize: fs(18), fontWeight: '800', color: C.textPrimary, textAlign: 'center', lineHeight: 26 },
  message: { fontSize: fs(14), color: C.textSecondary, textAlign: 'center', lineHeight: 22 },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 8, width: '100%' },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: C.bgInput, borderWidth: 1, borderColor: C.border, alignItems: 'center' },
  cancelText: { fontSize: fs(15), fontWeight: '600', color: C.textSecondary },
  confirmBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  confirmDefault: { backgroundColor: C.accent },
  confirmDanger: { backgroundColor: C.danger },
  confirmText: { fontSize: fs(15), fontWeight: '700', color: C.white },
});
