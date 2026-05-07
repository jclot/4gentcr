import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../../store/useAppStore';
import { useModalStore } from '../../store/useModalStore';
import { Colors } from '../../theme/colors';
import { formatCurrency } from '../../utils/locationUtils';
import {
  User, Bell, Shield, LifeBuoy, MessageSquare,
  FileText, LogOut, ChevronRight, Palette, Lock, MapPin, Trophy, Trash2
} from 'lucide-react-native';

export default function ProfileScreen() {
  const { getCurrentUser, logout, deleteUser, db } = useAppStore();
  const { confirm } = useModalStore();
  const navigation = useNavigation<any>();
  const user = getCurrentUser();

  if (!user) return null;

  // Lógica para estadísticas (solo para scouts)
  const misPropiedades = db.properties.filter(p => p.capturedBy === user.id);
  const totalGenerado = misPropiedades.reduce((acc, curr) => acc + curr.ingreso, 0);

  // Función para obtener las iniciales del usuario (Ej: "Juan Perez" -> "JP")
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    confirm({
      title: 'Cerrar Sesión',
      message: '¿Estás seguro de que deseas salir de tu cuenta?',
      confirmLabel: 'Salir',
      cancelLabel: 'Cancelar',
      variant: 'danger',
      onConfirm: () => logout(),
    });
  };

  const handleDeleteAccount = () => {
    confirm({
      title: 'Eliminar cuenta',
      message: 'Se eliminará tu cuenta y todo tu historial asociado. Esta acción no se puede deshacer.',
      confirmLabel: 'Eliminar',
      cancelLabel: 'Cancelar',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await deleteUser(user.id);
        } catch (err: any) {
          confirm({
            title: 'No se pudo eliminar',
            message: err?.message ?? 'Intenta de nuevo en unos minutos.',
            confirmLabel: 'OK',
            onConfirm: () => { },
          });
        }
      },
    });
  };

  const openURL = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      confirm({
        title: 'Error',
        message: 'No pudimos abrir el enlace en este momento.',
        confirmLabel: 'OK',
        onConfirm: () => { },
      });
    }
  };

  const SettingItem = ({
    icon: Icon, title, subtitle, onPress, isDestructive = false, hideChevron = false
  }: any) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconBox, isDestructive && { backgroundColor: Colors.dangerLight }]}>
        <Icon size={20} color={isDestructive ? Colors.danger : Colors.textPrimary} />
      </View>
      <View style={styles.settingTextContent}>
        <Text style={[styles.settingTitle, isDestructive && { color: Colors.danger }]}>
          {title}
        </Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {!hideChevron && <ChevronRight size={20} color={Colors.textSecondary} />}
    </TouchableOpacity>
  );

  const Section = ({ title, children }: any) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* HEADER CON AVATAR DE INICIALES */}
        <View style={styles.header}>
          <View style={styles.initialsAvatar}>
            <Text style={styles.initialsText}>{getInitials(user.nombres)}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{user.nombres}</Text>
            <Text style={styles.email}>{user.correo}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>@{user.alias} • {user.role === 'admin' ? 'Administrador' : 'Scout'}</Text>
            </View>
          </View>
        </View>

        {user.role === 'scout' && (
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{misPropiedades.length}</Text>
              <Text style={styles.statLabel}>Capturas</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatCurrency(totalGenerado)}</Text>
              <Text style={styles.statLabel}>Generado</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <MapPin size={24} color={Colors.accent} style={{ marginBottom: 4 }} />
              <Text style={styles.statLabel}>{user.direccion.split(',')[0] || 'Costa Rica'}</Text>
            </View>
          </View>
        )}

        <Section title="Configuración de Cuenta">
          <SettingItem
            icon={User}
            title="Datos Personales"
            subtitle="Actualiza tu alias, teléfono y dirección"
            onPress={() => navigation.navigate('PersonalData')}
          />
          <View style={styles.divider} />
          <SettingItem
            icon={Palette}
            title="Personalización"
            subtitle="Tema de la app y preferencias visuales"
            onPress={() => navigation.navigate('Customization')}
          />
          <View style={styles.divider} />
          <SettingItem
            icon={Bell}
            title="Notificaciones"
            subtitle="Alertas de pagos y nuevas zonas"
            onPress={() => navigation.navigate('Notifications')}
          />
        </Section>

        <Section title="Seguridad">
          <SettingItem
            icon={Lock}
            title="Contraseña"
            subtitle="Cambia tu clave de acceso"
            onPress={() => navigation.navigate('Password')}
          />
          <View style={styles.divider} />
          <SettingItem
            icon={Shield}
            title="Autenticación en 2 pasos"
            subtitle="Añade una capa extra de seguridad"
            onPress={() => navigation.navigate('TwoFA')}
          />
        </Section>

        <Section title="Soporte y Comunidad">
          <SettingItem
            icon={Trophy} // Importa Trophy arriba
            title="Reglamento y Pagos"
            subtitle="Conoce cómo funciona el sistema de premios"
            onPress={() => navigation.navigate('Rules')}
          />
          <View style={styles.divider} />
          <SettingItem
            icon={LifeBuoy}
            title="Centro de Ayuda"
            subtitle="Preguntas frecuentes y tutoriales"
            onPress={() => navigation.navigate('HelpCenter')}
          />
          <View style={styles.divider} />
          <SettingItem
            icon={MessageSquare}
            title="Contactar Soporte"
            subtitle="Escríbenos si tienes un problema"
            onPress={() => openURL('mailto:soporte@virtualagent.cr')}
          />
        </Section>

        <Section title="Legal">
          <SettingItem
            icon={FileText}
            title="Términos y Condiciones"
            onPress={() => openURL('https://tusitio.com/terminos')}
          />
          <View style={styles.divider} />
          <SettingItem
            icon={Shield}
            title="Política de Privacidad"
            onPress={() => openURL('https://tusitio.com/privacidad')}
          />
        </Section>

	        <View style={[styles.section, { marginTop: 10, marginBottom: 10 }]}>
	          <View style={styles.card}>
	            <SettingItem
	              icon={Trash2}
	              title="Eliminar cuenta"
	              subtitle="Borra tu usuario y datos asociados"
	              onPress={handleDeleteAccount}
	              isDestructive
	            />
	            <View style={styles.divider} />
	            <SettingItem
	              icon={LogOut}
	              title="Cerrar Sesión"
	              onPress={handleLogout}
	              isDestructive
              hideChevron
            />
          </View>
          <Text style={styles.versionText}>Virtual Agent v1.0.0 (Build 42)</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 16 },

  // Nuevos estilos para el Avatar de Iniciales
  initialsAvatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.accent
  },
  initialsText: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.accent,
    letterSpacing: 1
  },

  headerInfo: { flex: 1 },
  name: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary },
  email: { fontSize: 14, color: Colors.textSecondary, marginBottom: 6 },
  badge: { alignSelf: 'flex-start', backgroundColor: Colors.accentLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '700', color: Colors.accent },
  statsCard: { flexDirection: 'row', backgroundColor: Colors.bgCard, borderRadius: 20, paddingVertical: 20, marginBottom: 24, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  statItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  statDivider: { width: 1, backgroundColor: Colors.border, marginVertical: 8 },
  statValue: { fontSize: 22, fontWeight: '900', color: Colors.textPrimary },
  statLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 4, fontWeight: '600' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary, marginBottom: 10, marginLeft: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  card: { backgroundColor: Colors.bgCard, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  settingItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.bgInput, alignItems: 'center', justifyContent: 'center' },
  settingTextContent: { flex: 1 },
  settingTitle: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  settingSubtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.border, marginLeft: 70 },
  versionText: { textAlign: 'center', fontSize: 12, color: Colors.textSecondary, marginTop: 20, fontWeight: '500' }
});
