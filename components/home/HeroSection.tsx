import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { HomePage } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

interface HeroSectionProps {
  data: HomePage;
  onButtonPress?: () => void;
  onBadgePress?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ data, onButtonPress, onBadgePress }) => {
  const { colors } = useTheme();
  const { language, t } = useLanguage();
  const isArabic = language === 'ar';

  const title = isArabic ? data.hero_title_ar : data.hero_title;
  const subtitle = isArabic ? data.hero_subtitle_ar : data.hero_subtitle;
  const buttonText = isArabic ? data.hero_button_text_ar : data.hero_button_text;

  const cleanSubtitle = subtitle?.replace(/<[^>]*>/g, '') ?? '';

  // Entrance animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.94)).current;
  const badgeSlide = useRef(new Animated.Value(-20)).current;

  const statsItems: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string }[] = [
    { icon: 'pricetag-outline', label: t('home.listings') },
    { icon: 'people-outline', label: t('home.users') },
    { icon: 'star-outline', label: t('home.rating') },
  ];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 55, friction: 7, useNativeDriver: true }),
      Animated.timing(badgeSlide, { toValue: 0, duration: 600, delay: 200, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Background */}
      {data.hero_image ? (
        <Image source={{ uri: data.hero_image }} style={styles.backgroundImage} resizeMode="cover" />
      ) : (
        <LinearGradient
          colors={[colors.primary, '#2a1035', colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}

      {/* Dark gradient overlay */}
      <LinearGradient
        colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.60)', 'rgba(0,0,0,0.80)']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative circles */}
      <View style={[styles.circle, styles.circleTopRight, { borderColor: `${colors.secondary}40` }]} />
      <View style={[styles.circle, styles.circleTopRight2, { borderColor: `${colors.secondary}20` }]} />
      <View style={[styles.circleDot, { backgroundColor: colors.secondary, top: 48, left: 32 }]} />
      <View style={[styles.circleDot, { backgroundColor: colors.accent, top: 100, right: 50, opacity: 0.6 }]} />

      {/* Main content */}
      <View style={[styles.content, isArabic && styles.contentRtl]}>

        {/* Badge */}
        <Animated.View style={[{ opacity: fadeAnim, transform: [{ translateY: badgeSlide }] }]}>
          <TouchableOpacity
            onPress={onBadgePress}
            activeOpacity={0.75}
            style={[
              styles.badge,
              { backgroundColor: `${colors.secondary}22`, borderColor: `${colors.secondary}55` },
            ]}
          >
            <Ionicons name="flash" size={12} color={colors.secondary} />
            <Text style={[styles.badgeText, { color: colors.secondary }]}>
              {t('home.discover_ads')}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Title */}
        <Animated.Text
          style={[
            styles.title,
            isArabic && styles.titleRtl,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] },
          ]}
        >
          {title}
        </Animated.Text>

        {/* Accent underline */}
        <Animated.View
          style={[
            styles.titleUnderline,
            { backgroundColor: colors.secondary },
            isArabic && { alignSelf: 'flex-end' },
            { opacity: fadeAnim },
          ]}
        />

        {/* Subtitle */}
        {cleanSubtitle ? (
          <Animated.Text
            style={[
              styles.subtitle,
              isArabic && styles.subtitleRtl,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            {cleanSubtitle}
          </Animated.Text>
        ) : null}

        {/* CTA Button */}
        <Animated.View
          style={[
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            isArabic && { alignSelf: 'flex-end' },
          ]}
        >
          <TouchableOpacity
            onPress={onButtonPress}
            activeOpacity={0.85}
            style={styles.buttonOuter}
          >
            <LinearGradient
              colors={[colors.secondary, colors.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>{buttonText}</Text>
              <Ionicons
                name={isArabic ? 'arrow-back' : 'arrow-forward'}
                size={18}
                color="#fff"
                style={styles.buttonIcon}
              />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Bottom stats strip */}
      <Animated.View style={[styles.statsStrip, { opacity: fadeAnim }]}>
        <LinearGradient
          colors={['rgba(0,0,0,0.0)', 'rgba(0,0,0,0.55)']}
          style={StyleSheet.absoluteFill}
        />
        {statsItems.map((item, i) => (
          <View key={i} style={[styles.statItem, i < 2 && styles.statDivider]}>
            <Ionicons name={item.icon} size={16} color={colors.secondary} />
            <Text style={styles.statLabel}>{item.label}</Text>
          </View>
        ))}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width,
    height: 400,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
    marginBottom: 24,
    // Card shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
  },
  // Decorative circles
  circle: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1.5,
  },
  circleTopRight: {
    width: 180,
    height: 180,
    top: -50,
    right: -50,
  },
  circleTopRight2: {
    width: 260,
    height: 260,
    top: -90,
    right: -90,
  },
  circleDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  // Content
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 72, // space for stats strip
  },
  contentRtl: {
    alignItems: 'flex-end',
  },
  // Badge
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 14,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  // Title
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: 44,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  titleRtl: {
    textAlign: 'right',
    fontFamily: 'IBM Plex Sans Arabic Bold',
  },
  titleUnderline: {
    width: 48,
    height: 4,
    borderRadius: 2,
    marginTop: 10,
    marginBottom: 14,
  },
  // Subtitle
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 23,
    marginBottom: 22,
    maxWidth: '85%',
  },
  subtitleRtl: {
    textAlign: 'right',
    fontFamily: 'IBM Plex Sans Arabic',
    alignSelf: 'flex-end',
  },
  // Button
  buttonOuter: {
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#ff6001',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
    alignSelf: 'flex-start',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 14,
    gap: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  buttonIcon: {
    marginTop: 1,
  },
  // Stats strip
  statsStrip: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  statDivider: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: 'rgba(255,255,255,0.25)',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '500',
  },
});
