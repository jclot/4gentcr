import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import { Home } from 'lucide-react-native';
import { Colors } from '../theme/colors';

interface Props {
    loading: boolean;
    onHidden: () => void;
    /** true → omite la animación de entrada (para transiciones de login/registro) */
    skipEntrance?: boolean;
}

function Dots() {
    const d0 = useRef(new Animated.Value(0.3)).current;
    const d1 = useRef(new Animated.Value(0.3)).current;
    const d2 = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const pulse = (anim: Animated.Value, delay: number) =>
            Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(anim, { toValue: 1, duration: 450, useNativeDriver: true }),
                    Animated.timing(anim, { toValue: 0.3, duration: 450, useNativeDriver: true }),
                ]),
            ).start();

        pulse(d0, 0);
        pulse(d1, 200);
        pulse(d2, 400);
    }, []);

    return (
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
            {[d0, d1, d2].map((anim, i) => (
                <Animated.View
                    key={i}
                    style={{
                        width: 9, height: 9, borderRadius: 5,
                        backgroundColor: Colors.accent,
                        opacity: anim,
                    }}
                />
            ))}
        </View>
    );
}

export default function SplashScreen({ loading, onHidden, skipEntrance = false }: Props) {
    // Si skipEntrance, el contenido arranca ya visible
    const contentOpacity = useRef(new Animated.Value(skipEntrance ? 1 : 0)).current;
    const contentScale = useRef(new Animated.Value(skipEntrance ? 1 : 0.82)).current;
    const screenOpacity = useRef(new Animated.Value(1)).current;

    // Animación de entrada (solo cuando NO es skipEntrance)
    useEffect(() => {
        if (skipEntrance) return;

        Animated.parallel([
            Animated.timing(contentOpacity, {
                toValue: 1, duration: 600, useNativeDriver: true,
            }),
            Animated.spring(contentScale, {
                toValue: 1, tension: 55, friction: 9, useNativeDriver: true,
            }),
        ]).start();
    }, []);

    // Salida: cuando loading pasa a false
    useEffect(() => {
        if (loading) return;

        Animated.sequence([
            Animated.delay(skipEntrance ? 300 : 500),
            Animated.timing(screenOpacity, {
                toValue: 0, duration: 550, useNativeDriver: true,
            }),
        ]).start(() => onHidden());
    }, [loading]);

    return (
        <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
            <Animated.View
                style={{
                    alignItems: 'center',
                    gap: 16,
                    opacity: contentOpacity,
                    transform: [{ scale: contentScale }],
                }}
            >
                <View style={styles.iconWrap}>
                    <Home size={54} color="#FFFFFF" />
                </View>

                <View style={{ alignItems: 'center', gap: 6 }}>
                    <Text style={styles.title}>Virtual Agent</Text>
                    <Text style={styles.subtitle}>El Uber de Bienes Raíces</Text>
                </View>

                <Dots />
            </Animated.View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: Colors.bg,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
    },
    iconWrap: {
        backgroundColor: Colors.accent,
        padding: 24,
        borderRadius: 32,
        shadowColor: Colors.accent,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.5,
        shadowRadius: 24,
        elevation: 14,
    },
    title: { fontSize: 34, fontWeight: '800', color: Colors.textPrimary, letterSpacing: 0.5 },
    subtitle: { fontSize: 14, color: Colors.accent, fontWeight: '500' },
});