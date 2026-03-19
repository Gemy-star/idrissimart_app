import Header from '@/components/header';
import Sidebar from '@/components/sidebar';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { LoadingProvider } from '@/contexts/LoadingContext';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { store } from '@/store';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Provider } from 'react-redux';

const LayoutContent = () => {
  const { isVisible } = useSidebar();

  return (
    <View style={styles.contentArea}>
      <Header />
      {isVisible ? <Sidebar /> : <Stack screenOptions={{ headerShown: false }} />}
    </View>
  );
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'IBM Plex Sans Arabic': require('../assets/fonts/IBMPlexSansArabic-Regular.ttf'),
    'IBM Plex Sans Arabic Bold': require('../assets/fonts/IBMPlexSansArabic-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <Provider store={store}>
      <ThemeProvider>
        <LanguageProvider>
          <SidebarProvider>
            <LoadingProvider>
              <View style={styles.appContainer}>
                <LayoutContent />
              </View>
            </LoadingProvider>
          </SidebarProvider>
        </LanguageProvider>
      </ThemeProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  contentArea: {
    flex: 1,
  },
});
