import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { HomePage } from '@/services/api';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

interface HeroSectionProps {
  data: HomePage;
  onButtonPress?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ data, onButtonPress }) => {
  const { colors } = useTheme();
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  const title = isArabic ? data.hero_title_ar : data.hero_title;
  const subtitle = isArabic ? data.hero_subtitle_ar : data.hero_subtitle;
  const buttonText = isArabic ? data.hero_button_text_ar : data.hero_button_text;

  // Strip HTML tags from subtitle for mobile display
  const cleanSubtitle = subtitle.replace(/<[^>]*>/g, '');

  return (
    <View style={styles.container}>
      {data.hero_image ? (
        <Image 
          source={{ uri: data.hero_image }} 
          style={styles.backgroundImage}
          resizeMode="cover"
        />
      ) : (
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBackground}
        />
      )}
      
      <LinearGradient
        colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.7)']}
        style={styles.overlay}
      />

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{cleanSubtitle}</Text>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: colors.secondary }]}
          onPress={onButtonPress}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>{buttonText}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width,
    height: 320,
    position: 'relative',
    marginBottom: 20,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradientBackground: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.95,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
