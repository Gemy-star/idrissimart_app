import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, View } from 'react-native';

interface SplashScreenProps {
  onFinish: () => void;
  appReady?: boolean;
}

export default function SplashScreen({ onFinish, appReady = false }: SplashScreenProps) {
  const onFinishRef = useRef(onFinish);
  useEffect(() => { onFinishRef.current = onFinish; }, [onFinish]);

  const appReadyRef = useRef(appReady);
  useEffect(() => { appReadyRef.current = appReady; }, [appReady]);

  const timerElapsedRef = useRef(false);

  const fadeOut = useRef(new Animated.Value(1)).current;

  const triggerFadeOut = () => {
    Animated.timing(fadeOut, {
      toValue: 0,
      duration: 350,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => onFinishRef.current());
  };

  // When appReady flips to true after timer elapsed, trigger finish
  useEffect(() => {
    if (appReady && timerElapsedRef.current) {
      triggerFadeOut();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appReady]);

  useEffect(() => {
    const timer = setTimeout(() => {
      timerElapsedRef.current = true;
      if (appReadyRef.current) {
        triggerFadeOut();
      }
    }, 1500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View style={[s.container, { opacity: fadeOut }]}>
      <View style={s.card}>
        {/* Top divider at ~33% */}
        <View style={s.divider} />

        {/* Centered logo */}
        <View style={s.logoWrap}>
          <Image
            source={require('../assets/logos/mini-logo-dark-theme.png')}
            style={s.logo}
            resizeMode="contain"
          />
        </View>
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: 390,
    height: 844,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#000000',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  divider: {
    position: 'absolute',
    top: '33%',
    left: 24,
    right: 24,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#D0D0D0',
  },
  logoWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 320,
    height: 75,
  },
});
