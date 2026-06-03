import React, { useState, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../../theme/ThemeContext';
import { useAppStore } from '../../store/useAppStore';
import {
  generate2FASecret,
  verify2FASetup,
  disable2FA as authDisable2FA,
} from '../../services/authService';
import {
  ChevronLeft, ShieldCheck, ShieldAlert, SmartphoneNfc,
  QrCode, KeyRound, Copy, CheckCircle2, ArrowRight,
} from 'lucide-react-native';
import Button from '../../components/Button';

type TwoFAView = 'intro' | 'qr' | 'verify_setup' | 'enabled' | 'verify_disable';

export default function TwoFAScreen({ navigation }: any) {
  const { colors: C, fs } = useTheme();
  const styles = useMemo(() => makeStyles(C, fs), [C, fs]);
  const { getCurrentUser, setTwoFAEnabled } = useAppStore();
  const user = getCurrentUser();

  const twoFAEnabled = user?.twoFAEnabled ?? false;
  const [view, setView] = useState<TwoFAView>(twoFAEnabled ? 'enabled' : 'intro');
  const [secret, setSecret] = useState('');
  const [otpAuthUrl, setOtpAuthUrl] = useState('');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<TextInput>(null);

  if (!user) return null;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleStartSetup = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await generate2FASecret(user.id);
      setSecret(result.secret);
      setOtpAuthUrl(result.otpAuthUrl);
      setView('qr');
    } catch (err: any) {
      setError(err?.message ?? 'No se pudo iniciar la configuración.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySecret = async () => {
    await Clipboard.setStringAsync(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerifySetup = async () => {
    if (pin.length !== 6) {
      setError('Ingresa los 6 dígitos del código.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await verify2FASetup(pin);
      setTwoFAEnabled(user.id, true);
      setPin('');
      setView('enabled');
    } catch (err: any) {
      setError(err?.message ?? 'Código incorrecto. Intenta de nuevo.');
      setPin('');
      inputRef.current?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyDisable = async () => {
    if (pin.length !== 6) {
      setError('Ingresa los 6 dígitos del código.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await authDisable2FA(pin);
      setTwoFAEnabled(user.id, false);
      setPin('');
      setView('intro');
    } catch (err: any) {
      setError(err?.message ?? 'Código incorrecto. Intenta de nuevo.');
      setPin('');
      inputRef.current?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinChange = (text: string) => {
    setError('');
    setPin(text.replace(/\D/g, '').slice(0, 6));
  };

  // ── Step indicator sub-component ──────────────────────────────────────────

  const StepItem = ({ number, title, desc, icon: Icon }: any) => (
    <View style={styles.stepItem}>
      <View style={styles.stepIconBox}>
        <Icon size={24} color={C.accent} />
        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>{number}</Text>
        </View>
      </View>
      <View style={styles.stepTextContent}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepDesc}>{desc}</Text>
      </View>
    </View>
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (view === 'qr') { setView('intro'); return; }
            if (view === 'verify_setup') { setView('qr'); return; }
            if (view === 'verify_disable') { setView('enabled'); return; }
            navigation.goBack();
          }}
          style={styles.backBtn}
        >
          <ChevronLeft size={24} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Autenticación en 2 Pasos</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
        >

          {/* ── INTRO ──────────────────────────────────────────────────────── */}
          {view === 'intro' && (
            <>
              <View style={styles.heroBox}>
                <ShieldCheck size={72} color={C.textSecondary} />
                <Text style={styles.heroTitle}>Máxima Seguridad</Text>
                <Text style={styles.heroDesc}>
                  Evita accesos no autorizados añadiendo una capa extra de seguridad vinculada a tu app autenticadora.
                </Text>
              </View>
              <Text style={styles.sectionTitle}>¿Cómo funciona?</Text>
              <View style={styles.card}>
                <StepItem number="1" icon={SmartphoneNfc} title="Descarga una App" desc="Instala Google Authenticator, Authy o Duo Mobile en tu teléfono." />
                <View style={styles.divider} />
                <StepItem number="2" icon={QrCode} title="Escanea el código QR" desc="Vincula tu cuenta escaneando el código seguro que generamos." />
                <View style={styles.divider} />
                <StepItem number="3" icon={KeyRound} title="Ingresa el PIN" desc="Usa el código de 6 dígitos que la app genera cada 30 segundos." />
              </View>
              <View style={{ marginTop: 24 }}>
                {isLoading ? (
                  <View style={styles.loadingBox}><ActivityIndicator color={C.accent} size="large" /></View>
                ) : (
                  <Button title="Configurar Autenticador" onPress={handleStartSetup} />
                )}
                {!!error && <Text style={[styles.errorText, { marginTop: 12 }]}>{error}</Text>}
              </View>
            </>
          )}

          {/* ── QR ─────────────────────────────────────────────────────────── */}
          {view === 'qr' && (
            <>
              <View style={styles.heroBox}>
                <QrCode size={56} color={C.accent} />
                <Text style={styles.heroTitle}>Escanea el Código QR</Text>
                <Text style={styles.heroDesc}>
                  Abre tu app autenticadora, toca "Agregar cuenta" y escanea este código.
                </Text>
              </View>
              <View style={styles.qrBox}>
                <QRCode
                  value={otpAuthUrl}
                  size={200}
                  color={C.textPrimary}
                  backgroundColor={C.bgCard}
                />
              </View>
              <Text style={styles.sectionTitle}>O ingresa la clave manualmente</Text>
              <View style={styles.secretRow}>
                <Text style={styles.secretText} selectable>{secret}</Text>
                <TouchableOpacity style={styles.copyBtn} onPress={handleCopySecret}>
                  {copied ? (
                    <CheckCircle2 size={18} color={C.success} />
                  ) : (
                    <Copy size={18} color={C.accent} />
                  )}
                  <Text style={[styles.copyBtnText, copied && { color: C.success }]}>
                    {copied ? 'Copiado' : 'Copiar'}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={{ marginTop: 24 }}>
                <Button
                  title="Ya lo escaneé →"
                  onPress={() => { setPin(''); setError(''); setView('verify_setup'); }}
                />
              </View>
            </>
          )}

          {/* ── VERIFY SETUP ───────────────────────────────────────────────── */}
          {view === 'verify_setup' && (
            <>
              <View style={styles.heroBox}>
                <KeyRound size={56} color={C.accent} />
                <Text style={styles.heroTitle}>Ingresa el Código</Text>
                <Text style={styles.heroDesc}>
                  Abre tu app autenticadora e ingresa el código de 6 dígitos que aparece para Virtual Agent.
                </Text>
              </View>
              <TouchableOpacity activeOpacity={1} onPress={() => inputRef.current?.focus()} style={styles.pinRow}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <View key={i} style={[styles.pinBox, pin[i] !== undefined && styles.pinBoxFilled, pin.length === i && styles.pinBoxActive]}>
                    <Text style={styles.pinChar}>{pin[i] ?? ''}</Text>
                  </View>
                ))}
              </TouchableOpacity>
              <TextInput
                ref={inputRef}
                value={pin}
                onChangeText={handlePinChange}
                keyboardType="number-pad"
                maxLength={6}
                caretHidden
                blurOnSubmit={false}
                style={styles.hiddenInput}
                autoFocus
                onBlur={() => { if (pin.length < 6) setTimeout(() => inputRef.current?.focus(), 50); }}
              />
              {!!error && <Text style={styles.errorText}>{error}</Text>}
              <View style={{ marginTop: 16 }}>
                {isLoading ? (
                  <View style={styles.loadingBox}><ActivityIndicator color={C.accent} size="large" /></View>
                ) : (
                  <Button
                    title="Activar Autenticación en 2 Pasos"
                    onPress={handleVerifySetup}
                    disabled={pin.length !== 6}
                  />
                )}
              </View>
            </>
          )}

          {/* ── ENABLED ────────────────────────────────────────────────────── */}
          {view === 'enabled' && (
            <>
              <View style={styles.heroBox}>
                <ShieldCheck size={72} color={C.success} />
                <Text style={styles.heroTitle}>2FA Activado</Text>
                <Text style={styles.heroDesc}>
                  Tu cuenta está protegida. Se requerirá un código de tu app autenticadora al iniciar sesión.
                </Text>
              </View>
              <View style={styles.successBadge}>
                <CheckCircle2 size={18} color={C.success} />
                <Text style={styles.successText}>Protección en tiempo real activa</Text>
              </View>
              <TouchableOpacity
                style={styles.deactivateBtn}
                onPress={() => { setPin(''); setError(''); setView('verify_disable'); }}
                activeOpacity={0.8}
              >
                <ShieldAlert size={20} color={C.danger} />
                <Text style={styles.deactivateBtnText}>Desactivar Autenticación</Text>
                <ArrowRight size={18} color={C.danger} style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>
              <Text style={styles.warningText}>
                Al desactivar esta función, tu cuenta será más vulnerable a accesos no autorizados.
              </Text>
            </>
          )}

          {/* ── VERIFY DISABLE ─────────────────────────────────────────────── */}
          {view === 'verify_disable' && (
            <>
              <View style={styles.heroBox}>
                <ShieldAlert size={56} color={C.danger} />
                <Text style={[styles.heroTitle, { color: C.danger }]}>Confirmar Desactivación</Text>
                <Text style={styles.heroDesc}>
                  Ingresa el código de tu app autenticadora para confirmar que eres tú.
                </Text>
              </View>
              <TouchableOpacity activeOpacity={1} onPress={() => inputRef.current?.focus()} style={styles.pinRow}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <View key={i} style={[styles.pinBox, pin[i] !== undefined && styles.pinBoxFilled, pin.length === i && styles.pinBoxActive]}>
                    <Text style={styles.pinChar}>{pin[i] ?? ''}</Text>
                  </View>
                ))}
              </TouchableOpacity>
              <TextInput
                ref={inputRef}
                value={pin}
                onChangeText={handlePinChange}
                keyboardType="number-pad"
                maxLength={6}
                caretHidden
                blurOnSubmit={false}
                style={styles.hiddenInput}
                autoFocus
                onBlur={() => { if (pin.length < 6) setTimeout(() => inputRef.current?.focus(), 50); }}
              />
              {!!error && <Text style={styles.errorText}>{error}</Text>}
              <View style={{ marginTop: 16 }}>
                {isLoading ? (
                  <View style={styles.loadingBox}><ActivityIndicator color={C.danger} size="large" /></View>
                ) : (
                  <Button
                    title="Desactivar 2FA"
                    variant="danger"
                    onPress={handleVerifyDisable}
                    disabled={pin.length !== 6}
                  />
                )}
              </View>
            </>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (C: any, fs: (n: number) => number) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 15,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  title: { fontSize: fs(18), fontWeight: '800', color: C.textPrimary },
  content: { padding: 20, paddingBottom: 48 },

  heroBox: { alignItems: 'center', paddingVertical: 30 },
  heroTitle: { fontSize: fs(24), fontWeight: '900', color: C.textPrimary, marginTop: 20, marginBottom: 12 },
  heroDesc: {
    fontSize: fs(14), color: C.textSecondary,
    textAlign: 'center', lineHeight: 22, paddingHorizontal: 10,
  },

  sectionTitle: {
    fontSize: fs(13), fontWeight: '800', color: C.textSecondary,
    marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.5,
  },

  card: { backgroundColor: C.bgCard, borderRadius: 24, borderWidth: 1, borderColor: C.border, padding: 8 },
  stepItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 16 },
  stepIconBox: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: C.accentLight, alignItems: 'center', justifyContent: 'center',
  },
  stepBadge: {
    position: 'absolute', top: -6, right: -6,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: C.textPrimary, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: C.bgCard,
  },
  stepBadgeText: { color: C.white, fontSize: fs(12), fontWeight: '800' },
  stepTextContent: { flex: 1 },
  stepTitle: { fontSize: fs(16), fontWeight: '700', color: C.textPrimary, marginBottom: 4 },
  stepDesc: { fontSize: fs(13), color: C.textSecondary, lineHeight: 18 },
  divider: { height: 1, backgroundColor: C.border, marginLeft: 88 },

  // QR
  qrBox: {
    alignSelf: 'center',
    backgroundColor: C.bgCard,
    padding: 20, borderRadius: 24,
    borderWidth: 1, borderColor: C.border,
    marginBottom: 24,
  },

  secretRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.bgCard, borderRadius: 16,
    borderWidth: 1, borderColor: C.border,
    padding: 16, gap: 12,
  },
  secretText: {
    flex: 1, fontSize: fs(15), fontWeight: '700',
    color: C.textPrimary, letterSpacing: 2, fontVariant: ['tabular-nums'],
  },
  copyBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  copyBtnText: { fontSize: fs(13), fontWeight: '700', color: C.accent },

  // PIN
  pinRow: {
    flexDirection: 'row', gap: 10, marginBottom: 12,
    width: '100%', justifyContent: 'center',
  },
  pinBox: {
    width: 48, height: 60, borderRadius: 14,
    borderWidth: 2, borderColor: C.border,
    backgroundColor: C.bgCard,
    alignItems: 'center', justifyContent: 'center',
  },
  pinBoxFilled: { borderColor: C.accent, backgroundColor: C.accentLight },
  pinBoxActive: { borderColor: C.accent + 'AA' },
  pinChar: { fontSize: fs(24), fontWeight: '800', color: C.textPrimary },
  hiddenInput: { position: 'absolute', top: -500, left: -500, opacity: 0, width: 1, height: 1 },
  errorText: { color: C.danger, fontSize: fs(13), textAlign: 'center', marginBottom: 12 },
  loadingBox: { height: 56, alignItems: 'center', justifyContent: 'center' },

  // Enabled state
  successBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: C.successLight, paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 30, marginBottom: 24,
    borderWidth: 1, borderColor: C.success,
    alignSelf: 'center',
  },
  successText: { color: C.success, fontWeight: '700', fontSize: fs(14) },
  deactivateBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    width: '100%', paddingVertical: 16, paddingHorizontal: 20,
    borderRadius: 16, backgroundColor: C.bgCard,
    borderWidth: 1.5, borderColor: C.danger,
  },
  deactivateBtnText: { color: C.danger, fontSize: fs(16), fontWeight: '700' },
  warningText: {
    marginTop: 16, fontSize: fs(13), color: C.textSecondary,
    textAlign: 'center', lineHeight: 20, paddingHorizontal: 20,
  },
});
