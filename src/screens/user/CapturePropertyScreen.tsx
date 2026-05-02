import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Alert, ActivityIndicator, TextInput, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { coordsToLocation, formatCurrency } from '../../utils/locationUtils';
import { PropertyType } from '../../data/mockData';
import Button from '../../components/Button';
import Input from '../../components/Input';

// ── OCR: importación dinámica con fallback para Expo Go ──
let TextRecognition: any = null;
try {
  TextRecognition = require('@react-native-ml-kit/text-recognition').default;
} catch {
  console.log('[OCR] ML Kit no disponible — modo simulación activado.');
}

const PROPERTY_TYPES: PropertyType[] = ['Casa', 'Terreno', 'Comercial', 'Apartamento', 'Finca'];

type CaptureStep = 'camera' | 'ocr' | 'form' | 'preview';

export default function CapturePropertyScreen() {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [step, setStep] = useState<CaptureStep>('camera');
  const [photoCount, setPhotoCount] = useState(0);
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [lastPhotoUri, setLastPhotoUri] = useState<string | null>(null);

  const [ocrPhone, setOcrPhone] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [ocrConfidence, setOcrConfidence] = useState<'alta' | 'baja' | null>(null);

  const [location, setLocation] = useState<{
    lat: number; lng: number; provincia: string; canton: string; distrito: string;
  } | null>(null);

  const [form, setForm] = useState({
    tipo: 'Casa' as PropertyType,
    descripcion: '',
    precioAproximado: '',
    exclusividad: false,
    esDeAgencia: false,
  });

  const cameraRef = useRef<any>(null);
  const { addProperty, getCurrentUser } = useAppStore();

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        const { lat, lng } = { lat: loc.coords.latitude, lng: loc.coords.longitude };
        const region = coordsToLocation(lat, lng);
        setLocation({ lat, lng, ...region });
      }
    })();
  }, []);

  const takePhoto = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8, base64: false });
      setLastPhotoUri(photo.uri);
      setPhotoCount(c => c + 1);

      if (photoCount >= 2) {
        // Pasamos al paso OCR después de la 3ra foto
        runOcr(photo.uri);
      } else {
        Alert.alert('✅ Foto tomada', `${photoCount + 1}/3 fotografías. ${photoCount < 2 ? 'Toma más fotos del cartel.' : ''}`);
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo tomar la foto. Intentá de nuevo.');
    }
  };

  const runOcr = async (uri: string) => {
    setStep('ocr');
    setIsProcessingOcr(true);

    try {
      if (TextRecognition) {
        // ── MODO REAL: ML Kit ──────────────────────────────────────────
        const result = await TextRecognition.recognize(uri);
        const text: string = result.text || '';

        // Extraer número de teléfono costarricense (formato: 8xxx-xxxx, 6xxx-xxxx, 7xxx-xxxx)
        const phoneRegex = /\b([2678]\d{3}[-\s]?\d{4})\b/g;
        const matches = text.match(phoneRegex);

        if (matches && matches.length > 0) {
          setOcrPhone(matches[0].replace(/\s/g, '-'));
          setOcrConfidence('alta');
        } else {
          setOcrPhone('');
          setOcrConfidence('baja');
        }
      } else {
        // ── MODO SIMULACIÓN (Expo Go) ─────────────────────────────────
        await new Promise(r => setTimeout(r, 1800));
        const simulatedPhones = ['8844-2211', '7733-9900', '6622-1100', '8811-3344'];
        const simPhone = simulatedPhones[Math.floor(Math.random() * simulatedPhones.length)];
        setOcrPhone(simPhone);
        setOcrConfidence(Math.random() > 0.3 ? 'alta' : 'baja');
      }
    } catch (err) {
      setOcrPhone('');
      setOcrConfidence('baja');
    } finally {
      setIsProcessingOcr(false);
    }
  };

  const confirmOcrAndProceed = () => {
    const phone = ocrPhone || manualPhone;
    if (!phone) { Alert.alert('Error', 'Ingresá el número de teléfono del cartel.'); return; }
    setForm(f => ({ ...f }));
    setStep('form');
  };

  const handleSaveProperty = () => {
    const phone = ocrPhone || manualPhone;
    if (!form.descripcion) { Alert.alert('Error', 'Agregá una descripción breve.'); return; }
    if (!location) { Alert.alert('Error', 'Esperando ubicación GPS...'); return; }

    const user = getCurrentUser()!;
    const precio = parseInt(form.precioAproximado.replace(/\D/g, '')) || 0;

    const newProp = addProperty({
      capturedBy: user.id,
      tipo: form.tipo,
      status: 'nueva',
      telefono: phone,
      fotos: lastPhotoUri ? [lastPhotoUri] : [],
      lat: location.lat,
      lng: location.lng,
      provincia: location.provincia,
      canton: location.canton,
      distrito: location.distrito,
      descripcion: form.descripcion,
      precioAproximado: precio,
      esDuplicada: false,
      esDeAgencia: form.esDeAgencia,
      exclusividad: form.exclusividad,
      notas: '',
    });

    setStep('preview');
  };

  // ── PERMISOS ──────────────────────────────────────────────────────────
  if (!cameraPermission) return <View style={styles.center}><ActivityIndicator color={Colors.accent} /></View>;
  if (!cameraPermission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.permText}>📷 Necesitamos acceso a la cámara</Text>
          <Button title="Otorgar Permiso" onPress={requestCameraPermission} />
        </View>
      </SafeAreaView>
    );
  }

  // ── PASO: CÁMARA ──────────────────────────────────────────────────────
  if (step === 'camera') {
    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <CameraView style={{ flex: 1 }} facing="back" ref={cameraRef}>
          {/* Overlay */}
          <View style={styles.cameraOverlay}>
            <SafeAreaView>
              <Text style={styles.cameraTitle}>📷 Captura el Cartel</Text>
              <Text style={styles.cameraSubtitle}>
                Foto {Math.min(photoCount + 1, 3)} de 3 — asegurate de incluir el teléfono
              </Text>
            </SafeAreaView>

            <View style={styles.cameraFrame} />

            <View style={styles.cameraBottom}>
              {location && (
                <View style={styles.gpsBadge}>
                  <Text style={styles.gpsText}>
                    📍 {location.canton}, {location.provincia}
                  </Text>
                </View>
              )}
              <View style={styles.dotRow}>
                {[0, 1, 2].map(i => (
                  <View
                    key={i}
                    style={[styles.dot, i < photoCount && styles.dotActive]}
                  />
                ))}
              </View>
              <TouchableOpacity style={styles.shutterBtn} onPress={takePhoto} activeOpacity={0.8}>
                <View style={styles.shutterInner} />
              </TouchableOpacity>
              <Text style={styles.cameraHint}>Toca el botón para fotografiar</Text>
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  // ── PASO: OCR ─────────────────────────────────────────────────────────
  if (step === 'ocr') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.stepTitle}>🔍 Reconocimiento de Texto (OCR)</Text>

          {isProcessingOcr ? (
            <View style={styles.ocrProcessing}>
              <ActivityIndicator size="large" color={Colors.accent} />
              <Text style={styles.ocrProcessText}>Analizando imagen con ML Kit...</Text>
              <Text style={styles.ocrProcessSub}>Buscando número de teléfono</Text>
            </View>
          ) : (
            <View style={{ gap: 16 }}>
              <View style={[styles.ocrResult, { borderColor: ocrConfidence === 'alta' ? Colors.success : Colors.warning }]}>
                <Text style={styles.ocrResultLabel}>
                  {ocrConfidence === 'alta' ? '✅ Teléfono detectado con alta confianza' : '⚠️ Detección con baja confianza'}
                </Text>
                <Text style={styles.ocrResultPhone}>{ocrPhone || 'No detectado'}</Text>
                {!TextRecognition && (
                  <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 4 }}>
                    [Modo simulación — instalar Custom Dev Client para OCR real]
                  </Text>
                )}
              </View>

              <Text style={{ color: Colors.textSecondary, fontSize: 13 }}>
                ¿El número es correcto? Si no, ingresalo manualmente:
              </Text>

              <Input
                label="Número de teléfono (manual / corrección)"
                value={manualPhone}
                onChangeText={setManualPhone}
                placeholder={ocrPhone || '8888-0000'}
                keyboardType="phone-pad"
              />

              <Button title="Confirmar y Continuar →" onPress={confirmOcrAndProceed} />
              <Button title="Retomar fotos" onPress={() => { setStep('camera'); setPhotoCount(0); }} variant="ghost" />
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── PASO: FORMULARIO ─────────────────────────────────────────────────
  if (step === 'form') {
    const phone = ocrPhone || manualPhone;
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.stepTitle}>📋 Datos de la Propiedad</Text>

          {/* Metadatos GPS */}
          {location && (
            <View style={styles.metaBadge}>
              <Text style={styles.metaTitle}>📍 Metadatos GPS</Text>
              <Text style={styles.metaText}>{location.provincia} › {location.canton} › {location.distrito}</Text>
              <Text style={styles.metaCoords}>{location.lat.toFixed(5)}, {location.lng.toFixed(5)}</Text>
            </View>
          )}

          {/* Tipo de Propiedad */}
          <Text style={styles.fieldLabel}>Tipo de Propiedad</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 4 }}>
              {PROPERTY_TYPES.map(tipo => (
                <TouchableOpacity
                  key={tipo}
                  onPress={() => setForm(f => ({ ...f, tipo }))}
                  style={[styles.typeChip, form.tipo === tipo && styles.typeChipActive]}
                >
                  <Text style={[styles.typeChipText, form.tipo === tipo && { color: Colors.white }]}>{tipo}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <Input
            label="Teléfono del cartel (OCR)"
            value={phone}
            onChangeText={() => {}}
            placeholder="Del OCR"
            editable={false}
          />

          <Input
            label="Descripción breve *"
            value={form.descripcion}
            onChangeText={v => setForm(f => ({ ...f, descripcion: v }))}
            placeholder="Ej: Casa 2 plantas, cartel en fachada, sin logo de agencia"
            multiline
            numberOfLines={3}
          />

          <Input
            label="Precio aproximado (₡)"
            value={form.precioAproximado}
            onChangeText={v => setForm(f => ({ ...f, precioAproximado: v }))}
            placeholder="80000000"
            keyboardType="numeric"
          />

          {/* Toggles */}
          {[
            { key: 'exclusividad', label: '🤝 Propietario aceptó exclusividad (+₡2,000)', emoji: '🤝' },
            { key: 'esDeAgencia', label: '🚫 Cartel tiene logo de otra agencia (anular)', emoji: '🚫' },
          ].map(toggle => (
            <TouchableOpacity
              key={toggle.key}
              onPress={() => setForm(f => ({ ...f, [toggle.key]: !f[toggle.key as keyof typeof form] }))}
              style={[styles.toggleRow, (form as any)[toggle.key] && styles.toggleRowActive]}
            >
              <Text style={styles.toggleLabel}>{toggle.label}</Text>
              <View style={[styles.toggleSwitch, (form as any)[toggle.key] && styles.toggleSwitchOn]}>
                <View style={[styles.toggleThumb, (form as any)[toggle.key] && styles.toggleThumbOn]} />
              </View>
            </TouchableOpacity>
          ))}

          <View style={styles.incomePrev}>
            <Text style={styles.incomePreviewLabel}>Ingreso estimado:</Text>
            <Text style={styles.incomePreviewVal}>
              {formatCurrency(
                form.esDeAgencia ? 0 : 250 + (form.exclusividad ? 2000 : 0)
              )}
            </Text>
          </View>

          <Button title="💾 Guardar Propiedad" onPress={handleSaveProperty} />
          <Button title="← Volver" onPress={() => setStep('ocr')} variant="ghost" />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── PASO: PREVIEW / ÉXITO ────────────────────────────────────────────
  const user = getCurrentUser()!;
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.successContainer}>
        <Text style={{ fontSize: 80 }}>🎉</Text>
        <Text style={styles.successTitle}>¡Propiedad Registrada!</Text>
        <Text style={styles.successSub}>
          {form.tipo} en {location?.canton ?? '—'} guardada exitosamente.
        </Text>
        <View style={styles.successIncome}>
          <Text style={styles.successIncomeLabel}>Ingreso acreditado</Text>
          <Text style={styles.successIncomeVal}>
            {formatCurrency(form.esDeAgencia ? 0 : 250 + (form.exclusividad ? 2000 : 0))}
          </Text>
        </View>
        <Button
          title="Capturar otra propiedad"
          onPress={() => {
            setStep('camera');
            setPhotoCount(0);
            setOcrPhone('');
            setManualPhone('');
            setOcrConfidence(null);
            setForm({ tipo: 'Casa', descripcion: '', precioAproximado: '', exclusividad: false, esDeAgencia: false });
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: 20, gap: 16, paddingBottom: 50 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20, padding: 30 },
  permText: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },

  // Camera
  cameraOverlay: { flex: 1, justifyContent: 'space-between' },
  cameraTitle: { fontSize: 22, fontWeight: '800', color: Colors.white, textAlign: 'center', marginTop: 16 },
  cameraSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginTop: 4 },
  cameraFrame: {
    width: '80%',
    height: 180,
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: Colors.accent,
    borderRadius: 12,
    borderStyle: 'dashed',
  },
  cameraBottom: { padding: 24, alignItems: 'center', gap: 16, backgroundColor: 'rgba(0,0,0,0.5)' },
  gpsBadge: { backgroundColor: 'rgba(108,99,255,0.9)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  gpsText: { color: Colors.white, fontSize: 13, fontWeight: '600' },
  dotRow: { flexDirection: 'row', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { backgroundColor: Colors.success },
  shutterBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.white },
  cameraHint: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },

  // OCR
  stepTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  ocrProcessing: { alignItems: 'center', gap: 16, padding: 40 },
  ocrProcessText: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  ocrProcessSub: { fontSize: 13, color: Colors.textSecondary },
  ocrResult: { borderWidth: 2, borderRadius: 16, padding: 20, alignItems: 'center', gap: 8 },
  ocrResultLabel: { fontSize: 13, color: Colors.textSecondary },
  ocrResultPhone: { fontSize: 32, fontWeight: '900', color: Colors.textPrimary },

  // Form
  metaBadge: {
    backgroundColor: Colors.accentLight,
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
    gap: 4,
  },
  metaTitle: { fontSize: 12, color: Colors.accent, fontWeight: '700' },
  metaText: { fontSize: 15, color: Colors.textPrimary, fontWeight: '600' },
  metaCoords: { fontSize: 11, color: Colors.textSecondary },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: -8 },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeChipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  typeChipText: { color: Colors.textSecondary, fontWeight: '600', fontSize: 14 },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  toggleRowActive: { borderColor: Colors.accent, backgroundColor: Colors.accentLight },
  toggleLabel: { flex: 1, fontSize: 13, color: Colors.textPrimary, marginRight: 8 },
  toggleSwitch: { width: 44, height: 24, borderRadius: 12, backgroundColor: Colors.border, justifyContent: 'center', paddingHorizontal: 2 },
  toggleSwitchOn: { backgroundColor: Colors.accent },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.white },
  toggleThumbOn: { alignSelf: 'flex-end' },
  incomePrev: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.successLight,
    padding: 14,
    borderRadius: 12,
  },
  incomePreviewLabel: { fontSize: 14, color: Colors.textSecondary },
  incomePreviewVal: { fontSize: 20, fontWeight: '800', color: Colors.success },

  // Success
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 16 },
  successTitle: { fontSize: 30, fontWeight: '900', color: Colors.textPrimary },
  successSub: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center' },
  successIncome: { backgroundColor: Colors.successLight, borderRadius: 16, padding: 20, alignItems: 'center', gap: 6, width: '100%' },
  successIncomeLabel: { fontSize: 13, color: Colors.textSecondary },
  successIncomeVal: { fontSize: 36, fontWeight: '900', color: Colors.success },
});