import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

interface Props {
  visible: boolean;
  onComplete?: () => void;
  duration?: number;
}

/**
 * Overlay que hace fade-in sobre el screen actual para enmascarar
 * el cambio de pantalla. Se activa cuando visible pasa a true.
 */
export default function AuthOverlay({ visible, onComplete, duration = 380 }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;

    Animated.timing(opacity, {
      toValue: 1,
      duration,
      useNativeDriver: true,
    }).start(() => onComplete?.());
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { backgroundColor: Colors.bg, opacity }]}
    />
  );
}