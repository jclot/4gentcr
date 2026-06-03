import React, { useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Home, Camera, ShieldCheck } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';

const { width } = Dimensions.get('window');

type WalkthroughScreenProps = {
  onFinish: () => void;
};

const SLIDES = [
  {
    key: 'intro',
    title: 'Bienvenido a Virtual Agent',
    description:
      'Captura propiedades, valida informacion en segundos y gana por cada registro valido.',
    icon: Home,
  },
  {
    key: 'capture',
    title: 'Captura Guiada',
    description:
      'La app te guia paso a paso con GPS, OCR y fotos para reducir errores de carga.',
    icon: Camera,
  },
  {
    key: 'security',
    title: 'Cuenta Segura',
    description:
      'Tu perfil, credenciales y actividad se mantienen protegidos con autenticacion segura.',
    icon: ShieldCheck,
  },
];

export default function WalkthroughScreen({ onFinish }: WalkthroughScreenProps) {
  const { colors: C, fs } = useTheme();
  const styles = useMemo(() => makeStyles(C, fs), [C, fs]);
  const listRef = useRef<FlatList<any>>(null);
  const [index, setIndex] = useState(0);

  const isLast = index === SLIDES.length - 1;

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(e.nativeEvent.contentOffset.x / width);
    setIndex(nextIndex);
  };

  const handleNext = () => {
    if (isLast) {
      onFinish();
      return;
    }
    listRef.current?.scrollToIndex({ index: index + 1, animated: true });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        {!isLast ? (
          <TouchableOpacity onPress={onFinish} hitSlop={8}>
            <Text style={styles.skip}>Omitir</Text>
          </TouchableOpacity>
        ) : (
          <View />
        )}
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.key}
        onMomentumScrollEnd={handleScrollEnd}
        renderItem={({ item }) => {
          const Icon = item.icon;
          return (
            <View style={styles.slide}>
              <View style={styles.iconWrap}>
                <Icon size={52} color={C.accent} />
              </View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          );
        }}
      />

      <View style={styles.bottom}>
        <View style={styles.dots}>
          {SLIDES.map((item, dotIndex) => (
            <View
              key={item.key}
              style={[styles.dot, dotIndex === index && styles.dotActive]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.cta} onPress={handleNext}>
          <Text style={styles.ctaText}>{isLast ? 'Empezar' : 'Siguiente'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (C: any, fs: (n: number) => number) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 60,
    justifyContent: 'center',
    alignItems: 'flex-end',
    minHeight: 44,
  },
  skip: { color: C.textSecondary, fontSize: fs(14), fontWeight: '600' },
  slide: {
    width,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  iconWrap: {
    width: 112, height: 112, borderRadius: 56, backgroundColor: C.accentLight,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: C.border,
  },
  title: { color: C.textPrimary, fontSize: fs(28), fontWeight: '800', textAlign: 'center' },
  description: { color: C.textSecondary, fontSize: fs(15), lineHeight: 22, textAlign: 'center', maxWidth: 340 },
  bottom: { paddingHorizontal: 24, paddingBottom: 28, gap: 18 },
  dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.border },
  dotActive: { width: 22, backgroundColor: C.accent },
  cta: { backgroundColor: C.accent, borderRadius: 14, height: 52, alignItems: 'center', justifyContent: 'center' },
  ctaText: { color: C.white, fontSize: fs(16), fontWeight: '700' },
});
