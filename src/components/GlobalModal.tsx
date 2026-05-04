import React from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet, Pressable,
} from 'react-native';
import { useModalStore } from '../store/useModalStore';
import { Colors } from '../theme/colors';
import { AlertTriangle, HelpCircle } from 'lucide-react-native';

export default function GlobalModal() {
  const { isVisible, config, close } = useModalStore();

  if (!config) return null;

  const handleConfirm = () => {
    close();
    setTimeout(() => config.onConfirm(), 80);
  };

  const handleCancel = () => {
    close();
    setTimeout(() => config.onCancel?.(), 80);
  };

  const isDanger = config.variant === 'danger';

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleCancel}
    >
      <Pressable style={styles.backdrop} onPress={handleCancel}>
        <Pressable style={styles.card} onPress={() => { }}>
          <View style={[styles.iconCircle, { backgroundColor: isDanger ? Colors.dangerLight : Colors.accentLight }]}>
            {isDanger ? <AlertTriangle size={32} color={Colors.danger} /> : <HelpCircle size={32} color={Colors.accent} />}
          </View>

          <Text style={styles.title}>{config.title}</Text>

          {!!config.message && (
            <Text style={styles.message}>{config.message}</Text>
          )}

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

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  card: {
    width: '100%',
    backgroundColor: Colors.bgCard,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 26,
  },
  message: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.bgInput,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  confirmDefault: { backgroundColor: Colors.accent },
  confirmDanger: { backgroundColor: Colors.danger },
  confirmText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
});