import OnboardingWrapper from '@/components/onboarding/OnboardingWrapper';
import SplashScreen from '@/components/SplashScreen';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { LoadingProvider } from '@/contexts/LoadingContext';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { store } from '@/store';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Provider } from 'react-redux';

export default function RootLayout() {
  const [splashDone, setSplashDone] = useState(false);
  const [fontsLoaded] = useFonts({
    'IBM Plex Sans Arabic': require('../assets/fonts/IBMPlexSansArabic-Regular.ttf'),
    'IBM Plex Sans Arabic Bold': require('../assets/fonts/IBMPlexSansArabic-Bold.ttf'),
  });

  return (
    <Provider store={store}>
      <ThemeProvider>
        <LanguageProvider>
          <OnboardingProvider>
            <SidebarProvider>
              <LoadingProvider>
                <OnboardingWrapper>
                  <View style={styles.appContainer}>
                    {splashDone && <Stack screenOptions={{ headerShown: false }} />}
                  </View>
                </OnboardingWrapper>
              </LoadingProvider>
            </SidebarProvider>
          </OnboardingProvider>
        </LanguageProvider>
      </ThemeProvider>

      {!splashDone && (
        <SplashScreen
          appReady={fontsLoaded}
          onFinish={() => setSplashDone(true)}
        />
      )}
    </Provider>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    flexDirection: 'column',
  },
});
