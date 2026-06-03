import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Image, Platform, KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import * as FileSystem from 'expo-file-system/legacy';
import { useAppStore } from '../../store/useAppStore';
import { useModalStore } from '../../store/useModalStore';
import { useTheme } from '../../theme/ThemeContext';
import { reverseGeocodeLocation, formatCurrency } from '../../utils/locationUtils';
import { PropertyType } from '../../data/mockData';
import Button from '../../components/Button';
import Input from '../../components/Input';
import {
  Camera, MapPin, AlertTriangle, RefreshCw, CheckCircle,
  Search, Check, Home, Handshake, Ban, PartyPopper, ClipboardList,
} from 'lucide-react-native';

let TextRecognition: any = null;
try {
  TextRecognition = require('@react-native-ml-kit/text-recognition').default;
} catch {
  console.log('[OCR] ML Kit no disponible — modo simulación activado.');
}

const PROPERTY_TYPES: PropertyType[] = ['Casa', 'Terreno', 'Comercial', 'Apartamento', 'Finca'];
const BLUR_THRESHOLD_KB = 60;

type Step = 'camera_sign' | 'sign_preview' | 'ocr' | 'camera_property' | 'property_preview' | 'form' | 'success';
interface PhotoState { uri: string; sizeKB: number; mightBeBlurry: boolean; }

export default function CapturePropertyScreen() {
  const { colors: C, fs } = useTheme();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [step, setStep] = useState<Step>('camera_sign');
  const [signPhoto, setSignPhoto] = useState<PhotoState | null>(null);
  const [propertyPhotos, setPropertyPhotos] = useState<PhotoState[]>([]);
  const [currentPropertyPreview, setCurrentPropertyPreview] = useState<PhotoState | null>(null);
  const [isOcrRunning, setIsOcrRunning] = useState(false);
  const [ocrPhone, setOcrPhone] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [ocrConfidence, setOcrConfidence] = useState<'alta' | 'baja' | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [gpsData, setGpsData] = useState<{ lat: number; lng: number; provincia: string; canton: string; distrito: string } | null>(null);
  const [form, setForm] = useState({ tipo: 'Casa' as PropertyType, descripcion: '', precioAproximado: '', exclusividad: false, esDeAgencia: false });
  const [formErrors, setFormErrors] = useState<{ descripcion?: string }>({});
  const cameraRef = useRef<any>(null);
  const { addProperty, getCurrentUser } = useAppStore();
  const { confirm } = useModalStore();
  const styles = useMemo(() => makeStyles(C, fs), [C, fs]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { setLocationLoading(false); return; }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.BestForNavigation });
      const { latitude: lat, longitude: lng } = loc.coords;
      const region = await reverseGeocodeLocation(lat, lng);
      setGpsData({ lat, lng, ...region });
      setLocationLoading(false);
    })();
  }, []);

  const capturePhoto = async (): Promise<PhotoState | null> => {
    if (!cameraRef.current) return null;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.85, skipProcessing: false });
      const info = await FileSystem.getInfoAsync(photo.uri);
      const sizeKB = (info.exists ? info.size : 0) / 1024;
      return { uri: photo.uri, sizeKB, mightBeBlurry: sizeKB < BLUR_THRESHOLD_KB };
    } catch { return null; }
  };

  const runOcr = async (uri: string) => {
    setStep('ocr');
    setIsOcrRunning(true);
    try {
      if (TextRecognition) {
        const result = await TextRecognition.recognize(uri);
        const text: string = result.text ?? '';
        const matches = text.match(/\b([2678]\d{3}[-\s]?\d{4})\b/g);
        if (matches?.length) { setOcrPhone(matches[0].replace(/\s/g, '-')); setOcrConfidence('alta'); }
        else { setOcrPhone(''); setOcrConfidence('baja'); }
      } else {
        await new Promise(r => setTimeout(r, 2000));
        const demos = ['8844-2211', '7733-9900', '6622-1100', '8811-3344'];
        setOcrPhone(demos[Math.floor(Math.random() * demos.length)]);
        setOcrConfidence(Math.random() > 0.25 ? 'alta' : 'baja');
      }
    } catch { setOcrPhone(''); setOcrConfidence('baja'); }
    finally { setIsOcrRunning(false); }
  };

  const handleTakeSignPhoto = async () => { const p = await capturePhoto(); if (!p) return; setSignPhoto(p); setStep('sign_preview'); };
  const handleConfirmSignPhoto = () => { if (signPhoto) runOcr(signPhoto.uri); };
  const handleRetakeSignPhoto = () => { setSignPhoto(null); setStep('camera_sign'); };
  const handleTakePropertyPhoto = async () => { const p = await capturePhoto(); if (!p) return; setCurrentPropertyPreview(p); setStep('property_preview'); };
  const handleConfirmPropertyPhoto = () => {
    if (!currentPropertyPreview) return;
    const updated = [...propertyPhotos, currentPropertyPreview];
    setPropertyPhotos(updated);
    setCurrentPropertyPreview(null);
    setStep(updated.length < 3 ? 'camera_property' : 'form');
  };
  const handleRetakePropertyPhoto = () => { setCurrentPropertyPreview(null); setStep('camera_property'); };

  const handleSave = () => {
    const errs: typeof formErrors = {};
    if (!form.descripcion.trim()) errs.descripcion = 'Agregá una descripción breve.';
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;
    const phone = ocrPhone || manualPhone;
    if (!phone) { confirm({ title: 'Teléfono requerido', message: 'Necesitamos el teléfono del cartel para continuar. Ingresalo manualmente.', confirmLabel: 'Entendido', onConfirm: () => {} }); return; }
    if (!gpsData) { confirm({ title: 'Ubicación no disponible', message: 'Aún no tenemos tu GPS. Esperá un momento o verificá los permisos.', confirmLabel: 'Entendido', onConfirm: () => {} }); return; }
    const user = getCurrentUser()!;
    const precio = parseInt(form.precioAproximado.replace(/\D/g, '')) || 0;
    const allUris = [signPhoto?.uri, ...propertyPhotos.map(p => p.uri)].filter(Boolean) as string[];
    addProperty({ capturedBy: user.id, tipo: form.tipo, status: 'nueva', telefono: phone, fotos: allUris, lat: gpsData.lat, lng: gpsData.lng, provincia: gpsData.provincia, canton: gpsData.canton, distrito: gpsData.distrito, descripcion: form.descripcion.trim(), precioAproximado: precio, esDeAgencia: form.esDeAgencia, exclusividad: form.exclusividad, notas: '' });
    setStep('success');
  };

  const resetFlow = () => {
    setStep('camera_sign'); setSignPhoto(null); setPropertyPhotos([]); setCurrentPropertyPreview(null);
    setOcrPhone(''); setManualPhone(''); setOcrConfidence(null);
    setForm({ tipo: 'Casa', descripcion: '', precioAproximado: '', exclusividad: false, esDeAgencia: false });
    setFormErrors({});
  };

  if (!cameraPermission) return <View style={styles.center}><ActivityIndicator color={C.accent} /></View>;

  if (!cameraPermission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Camera size={48} color={C.textPrimary} />
          <Text style={styles.permText}>Necesitamos acceso a la cámara</Text>
          <TouchableOpacity style={styles.button} onPress={requestCameraPermission}>
            <Text style={styles.buttonText}>Otorgar Permiso</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (step === 'camera_sign') {
    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <CameraView style={{ flex: 1 }} facing="back" ref={cameraRef} autofocus="on" />
        <View style={styles.camOverlay}>
          <SafeAreaView>
            <View style={styles.camTopBadge}>
              <Text style={styles.camStep}>PASO 1 DE 4</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <ClipboardList size={22} color="#FFFFFF" />
                <Text style={styles.camTitle}>Foto del Cartel</Text>
              </View>
              <Text style={styles.camHint}>Encuadrá el cartel completo con el número de teléfono visible.{'\n'}Esta foto se usará para el reconocimiento OCR.</Text>
            </View>
          </SafeAreaView>
          <View style={styles.signFrame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
            <Text style={styles.frameLabel}>Encuadrá el número de teléfono</Text>
          </View>
          <View style={styles.camBottom}>
            {locationLoading ? (
              <View style={styles.gpsBadge}><ActivityIndicator size="small" color="#FFFFFF" /><Text style={styles.gpsText}> Obteniendo ubicación exacta...</Text></View>
            ) : gpsData ? (
              <View style={styles.gpsBadge}><MapPin size={14} color="#FFFFFF" /><Text style={styles.gpsText}>{gpsData.distrito}, {gpsData.canton}, {gpsData.provincia}</Text></View>
            ) : null}
            <TouchableOpacity style={styles.shutterBtn} onPress={handleTakeSignPhoto} activeOpacity={0.8}>
              <View style={styles.shutterInner} />
            </TouchableOpacity>
            <Text style={styles.shutterLabel}>Fotografiar el cartel</Text>
          </View>
        </View>
      </View>
    );
  }

  if (step === 'sign_preview' && signPhoto) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <Image source={{ uri: signPhoto.uri }} style={{ flex: 1 }} resizeMode="contain" />
        <View style={styles.previewOverlay}>
          {signPhoto.mightBeBlurry && (
            <View style={styles.blurWarning}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <AlertTriangle size={18} color={C.warning} />
                <Text style={styles.blurWarningTitle}>Posible imagen borrosa</Text>
              </View>
              <Text style={styles.blurWarningText}>La imagen ({signPhoto.sizeKB.toFixed(0)} KB) podría ser de baja calidad.</Text>
            </View>
          )}
          <Text style={styles.previewTitle}>¿La foto del cartel es clara?</Text>
          <Text style={styles.previewSub}>El número de teléfono debe ser legible para el OCR.</Text>
          <View style={styles.previewBtns}>
            <TouchableOpacity style={styles.retakeBtn} onPress={handleRetakeSignPhoto}>
              <RefreshCw size={18} color={C.textSecondary} />
              <Text style={styles.retakeBtnText}>Retomar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.useBtn} onPress={handleConfirmSignPhoto}>
              <CheckCircle size={18} color="#FFFFFF" />
              <Text style={styles.useBtnText}>Usar esta foto</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (step === 'ocr') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Search size={28} color={C.textPrimary} />
            <Text style={styles.stepTitle}>Reconocimiento OCR</Text>
          </View>
          <Text style={styles.stepSub}>Extrayendo número de teléfono del cartel...</Text>
          {isOcrRunning ? (
            <View style={styles.ocrLoader}>
              <ActivityIndicator size="large" color={C.accent} />
              <Text style={styles.ocrLoaderText}>Analizando imagen con ML Kit...</Text>
              {!TextRecognition && <Text style={styles.ocrLoaderSub}>[Modo simulación — Custom Dev Client para OCR real]</Text>}
            </View>
          ) : (
            <View style={{ gap: 16 }}>
              <View style={[styles.ocrResult, { borderColor: ocrConfidence === 'alta' ? C.success : C.warning }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  {ocrConfidence === 'alta' ? <Check size={16} color={C.success} /> : <AlertTriangle size={16} color={C.warning} />}
                  <Text style={styles.ocrResultLabel}>{ocrConfidence === 'alta' ? 'Número detectado — alta confianza' : 'Detección con baja confianza'}</Text>
                </View>
                <Text style={styles.ocrResultPhone}>{ocrPhone || 'No se detectó el número'}</Text>
              </View>
              <Input label="Corrección manual (dejá vacío si es correcto)" value={manualPhone} onChangeText={setManualPhone} placeholder={ocrPhone || '8888-0000'} keyboardType="phone-pad" />
              <Button title="Continuar → Fotos de la Propiedad" onPress={() => {
                const phone = manualPhone || ocrPhone;
                if (!phone) { confirm({ title: 'Teléfono requerido', message: 'Ingresá el número del cartel manualmente.', confirmLabel: 'OK', onConfirm: () => {} }); return; }
                if (manualPhone) setOcrPhone(manualPhone);
                setPropertyPhotos([]);
                setStep('camera_property');
              }} />
              <Button title="Volver a fotografiar cartel" onPress={handleRetakeSignPhoto} variant="ghost" />
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (step === 'camera_property') {
    const count = propertyPhotos.length;
    const labels = ['Frente / Fachada principal', 'Vista lateral o jardín', 'Área interior o acceso'];
    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <CameraView style={{ flex: 1 }} facing="back" ref={cameraRef} autofocus="on" />
        <View style={styles.camOverlay}>
          <SafeAreaView>
            <View style={styles.camTopBadge}>
              <Text style={styles.camStep}>PASO 3 DE 4 — FOTO {count + 1} / 3</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Home size={22} color="#FFFFFF" />
                <Text style={styles.camTitle}>Foto de la Propiedad</Text>
              </View>
              <Text style={styles.camHint}>{labels[count]}</Text>
            </View>
          </SafeAreaView>
          <View style={styles.propDots}>
            {[0, 1, 2].map(i => <View key={i} style={[styles.propDot, i < count && styles.propDotDone, i === count && styles.propDotCurrent]} />)}
          </View>
          <View style={styles.camBottom}>
            <TouchableOpacity style={styles.shutterBtn} onPress={handleTakePropertyPhoto} activeOpacity={0.8}>
              <View style={styles.shutterInner} />
            </TouchableOpacity>
            <Text style={styles.shutterLabel}>Foto {count + 1} de 3</Text>
          </View>
        </View>
      </View>
    );
  }

  if (step === 'property_preview' && currentPropertyPreview) {
    const count = propertyPhotos.length;
    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <Image source={{ uri: currentPropertyPreview.uri }} style={{ flex: 1 }} resizeMode="contain" />
        <View style={styles.previewOverlay}>
          {currentPropertyPreview.mightBeBlurry && (
            <View style={styles.blurWarning}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <AlertTriangle size={18} color={C.warning} />
                <Text style={styles.blurWarningTitle}>Posible imagen borrosa</Text>
              </View>
              <Text style={styles.blurWarningText}>Esta foto ({currentPropertyPreview.sizeKB.toFixed(0)} KB) podría no ser nítida.</Text>
            </View>
          )}
          <Text style={styles.previewTitle}>¿La foto {count + 1} de la propiedad es clara?</Text>
          <View style={styles.previewBtns}>
            <TouchableOpacity style={styles.retakeBtn} onPress={handleRetakePropertyPhoto}>
              <RefreshCw size={18} color={C.textSecondary} />
              <Text style={styles.retakeBtnText}>Retomar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.useBtn} onPress={handleConfirmPropertyPhoto}>
              <CheckCircle size={18} color="#FFFFFF" />
              <Text style={styles.useBtnText}>{count < 2 ? `Siguiente foto (${count + 2}/3)` : 'Ir al formulario'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (step === 'form') {
    const phone = ocrPhone || manualPhone;
    const ingresoEstimado = form.esDeAgencia ? 0 : 250 + (form.exclusividad ? 2000 : 0);
    return (
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" automaticallyAdjustKeyboardInsets>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <ClipboardList size={28} color={C.textPrimary} />
              <Text style={styles.stepTitle}>Datos de la Propiedad</Text>
            </View>
            <Text style={styles.stepSub}>{propertyPhotos.length} foto(s) de propiedad + 1 foto del cartel guardadas.</Text>
            {gpsData && (
              <View style={styles.gpsMeta}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <MapPin size={14} color={C.accent} />
                  <Text style={styles.gpsMetaTitle}>Ubicación exacta (Nominatim)</Text>
                </View>
                <Text style={styles.gpsMetaText}>{gpsData.distrito} · {gpsData.canton} · {gpsData.provincia}</Text>
                <Text style={styles.gpsMetaCoords}>{gpsData.lat.toFixed(6)}, {gpsData.lng.toFixed(6)}</Text>
              </View>
            )}
            <Text style={styles.fieldLabel}>Tipo de Propiedad</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 4 }}>
                {PROPERTY_TYPES.map(tipo => (
                  <TouchableOpacity key={tipo} onPress={() => setForm(f => ({ ...f, tipo }))} style={[styles.typeChip, form.tipo === tipo && styles.typeChipActive]}>
                    <Text style={[styles.typeChipText, form.tipo === tipo && { color: C.white }]}>{tipo}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <Input label="Teléfono del cartel (OCR)" value={phone} onChangeText={() => {}} editable={false} />
            <Input label="Descripción breve *" value={form.descripcion} onChangeText={v => { setForm(f => ({ ...f, descripcion: v })); setFormErrors(e => ({ ...e, descripcion: undefined })); }} placeholder="Ej: Casa 2 plantas, cartel en fachada, sin logo de agencia" multiline numberOfLines={3} error={formErrors.descripcion} />
            <Input label="Precio aproximado (₡)" value={form.precioAproximado} onChangeText={v => setForm(f => ({ ...f, precioAproximado: v }))} placeholder="80000000" keyboardType="numeric" />
            {[
              { key: 'exclusividad', label: 'Propietario aceptó exclusividad (+₡2,000)', icon: <Handshake size={20} color={C.textPrimary} /> },
              { key: 'esDeAgencia', label: 'Cartel con logo de otra agencia (se anula)', icon: <Ban size={20} color={C.textPrimary} /> },
            ].map(t => (
              <TouchableOpacity key={t.key} onPress={() => setForm(f => ({ ...f, [t.key]: !(f as any)[t.key] }))} style={[styles.toggleRow, (form as any)[t.key] && styles.toggleRowActive]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                  {t.icon}
                  <Text style={styles.toggleLabel}>{t.label}</Text>
                </View>
                <View style={[styles.toggleSwitch, (form as any)[t.key] && styles.toggleOn]}>
                  <View style={[styles.toggleThumb, (form as any)[t.key] && styles.toggleThumbOn]} />
                </View>
              </TouchableOpacity>
            ))}
            <View style={styles.incomePreview}>
              <Text style={styles.incomePreviewLabel}>Ingreso estimado</Text>
              <Text style={styles.incomePreviewVal}>{formatCurrency(ingresoEstimado)}</Text>
            </View>
            <Button title="Guardar Propiedad" onPress={handleSave} />
            <Button title="Volver al OCR" onPress={() => setStep('ocr')} variant="ghost" />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  const ingresoFinal = form.esDeAgencia ? 0 : 250 + (form.exclusividad ? 2000 : 0);
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.successContainer}>
        <PartyPopper size={80} color={C.accent} />
        <Text style={styles.successTitle}>¡Registrada!</Text>
        <Text style={styles.successSub}>{form.tipo} en {gpsData?.canton ?? '—'} guardada con {1 + propertyPhotos.length} fotos.</Text>
        <View style={styles.successIncome}>
          <Text style={styles.successIncomeLabel}>Ingreso acreditado</Text>
          <Text style={styles.successIncomeVal}>{formatCurrency(ingresoFinal)}</Text>
        </View>
        <View style={styles.successButton}>
          <Button title="Capturar otra propiedad" onPress={resetFlow} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (C: any, fs: (n: number) => number) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 20, gap: 16, paddingBottom: 90 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20, padding: 30 },
  permText: { fontSize: fs(18), fontWeight: '700', color: C.textPrimary, textAlign: 'center' },
  camOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'space-between', backgroundColor: 'rgba(0,0,0,0.25)', zIndex: 10 },
  camTopBadge: { margin: 16, backgroundColor: 'rgba(0,0,0,0.65)', borderRadius: 16, padding: 16, gap: 4 },
  camStep: { fontSize: fs(11), color: C.accent, fontWeight: '700', letterSpacing: 1 },
  camTitle: { fontSize: fs(20), fontWeight: '800', color: '#FFFFFF' },
  camHint: { fontSize: fs(13), color: 'rgba(255,255,255,0.8)', lineHeight: 20, marginTop: 4 },
  signFrame: { width: '82%', height: 160, alignSelf: 'center', alignItems: 'center', justifyContent: 'center' },
  corner: { position: 'absolute', width: 24, height: 24, borderColor: C.accent, borderWidth: 3 },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  frameLabel: { color: 'rgba(255,255,255,0.7)', fontSize: fs(12), textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  camBottom: { padding: 24, alignItems: 'center', gap: 16, backgroundColor: 'rgba(0,0,0,0.6)', paddingBottom: Platform.OS === 'ios' ? 40 : 24 },
  gpsBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(108,99,255,0.9)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, gap: 6 },
  gpsText: { color: '#FFFFFF', fontSize: fs(12), fontWeight: '600' },
  shutterBtn: { width: 76, height: 76, borderRadius: 38, borderWidth: 4, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  shutterInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFFFFF' },
  shutterLabel: { color: 'rgba(255,255,255,0.7)', fontSize: fs(12) },
  propDots: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginVertical: 16 },
  propDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: 'rgba(255,255,255,0.25)' },
  propDotDone: { backgroundColor: C.success },
  propDotCurrent: { backgroundColor: '#FFFFFF', transform: [{ scale: 1.2 }] },
  previewOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.85)', padding: 20, gap: 12, paddingBottom: Platform.OS === 'ios' ? 36 : 20, zIndex: 10 },
  blurWarning: { backgroundColor: C.warningLight, borderRadius: 10, padding: 12, borderLeftWidth: 3, borderLeftColor: C.warning },
  blurWarningTitle: { fontSize: fs(14), fontWeight: '700', color: C.warning },
  blurWarningText: { fontSize: fs(13), color: C.warning, lineHeight: 20 },
  previewTitle: { fontSize: fs(17), fontWeight: '700', color: '#FFFFFF', textAlign: 'center' },
  previewSub: { fontSize: fs(13), color: 'rgba(255,255,255,0.7)', textAlign: 'center' },
  previewBtns: { flexDirection: 'row', gap: 12 },
  retakeBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: C.border, alignItems: 'center', backgroundColor: C.bgInput },
  retakeBtnText: { color: C.textSecondary, fontWeight: '600', fontSize: fs(14) },
  useBtn: { flex: 2, flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14, backgroundColor: C.accent, alignItems: 'center' },
  useBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: fs(14) },
  stepTitle: { fontSize: fs(22), fontWeight: '800', color: C.textPrimary },
  stepSub: { fontSize: fs(13), color: C.textSecondary, marginTop: -8 },
  ocrLoader: { alignItems: 'center', gap: 16, paddingVertical: 50 },
  ocrLoaderText: { fontSize: fs(17), fontWeight: '600', color: C.textPrimary },
  ocrLoaderSub: { fontSize: fs(12), color: C.textSecondary, textAlign: 'center' },
  ocrResult: { borderWidth: 2, borderRadius: 16, padding: 20, alignItems: 'center', gap: 8, backgroundColor: C.bgCard },
  ocrResultLabel: { fontSize: fs(13), color: C.textSecondary },
  ocrResultPhone: { fontSize: fs(34), fontWeight: '900', color: C.textPrimary, textAlign: 'center' },
  gpsMeta: { backgroundColor: C.accentLight, borderRadius: 12, padding: 14, borderLeftWidth: 3, borderLeftColor: C.accent, gap: 4 },
  gpsMetaTitle: { fontSize: fs(11), color: C.accent, fontWeight: '700', letterSpacing: 0.5 },
  gpsMetaText: { fontSize: fs(15), color: C.textPrimary, fontWeight: '600' },
  gpsMetaCoords: { fontSize: fs(11), color: C.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  fieldLabel: { fontSize: fs(13), fontWeight: '600', color: C.textSecondary },
  typeChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border },
  typeChipActive: { backgroundColor: C.accent, borderColor: C.accent },
  typeChipText: { color: C.textSecondary, fontWeight: '600', fontSize: fs(14) },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, backgroundColor: C.bgCard, borderRadius: 12, borderWidth: 1, borderColor: C.border, gap: 12 },
  toggleRowActive: { borderColor: C.accent, backgroundColor: C.accentLight },
  toggleLabel: { flex: 1, fontSize: fs(13), color: C.textPrimary },
  toggleSwitch: { width: 44, height: 24, borderRadius: 12, backgroundColor: C.border, justifyContent: 'center', paddingHorizontal: 2 },
  toggleOn: { backgroundColor: C.accent },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: C.white },
  toggleThumbOn: { alignSelf: 'flex-end' },
  incomePreview: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: C.successLight, padding: 14, borderRadius: 12 },
  incomePreviewLabel: { fontSize: fs(14), color: C.textSecondary },
  incomePreviewVal: { fontSize: fs(22), fontWeight: '900', color: C.success },
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 37, gap: 16 },
  successTitle: { fontSize: fs(34), fontWeight: '900', color: C.textPrimary },
  successSub: { fontSize: fs(15), color: C.textSecondary, textAlign: 'center' },
  successIncome: { backgroundColor: C.successLight, borderRadius: 16, padding: 20, alignItems: 'center', gap: 6, width: '100%' },
  successIncomeLabel: { fontSize: fs(13), color: C.textSecondary },
  successIncomeVal: { fontSize: fs(38), fontWeight: '900', color: C.success },
  successButton: { width: 320 },
  button: { backgroundColor: C.accent, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10 },
  buttonText: { color: C.white, fontSize: fs(16), fontWeight: '600' },
});
