import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { HomePage } from '@/services/api';
import { FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';

const { width } = Dimensions.get('window');

interface WhyChooseSectionProps {
  data: HomePage;
}

export const WhyChooseSection: React.FC<WhyChooseSectionProps> = ({ data }) => {
  const { colors } = useTheme();
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  if (!data.show_why_choose_us || !data.why_choose_us_features?.length) return null;

  const title = isArabic ? data.why_choose_us_title_ar : data.why_choose_us_title;
  const subtitle = isArabic ? data.why_choose_us_subtitle_ar : data.why_choose_us_subtitle;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.subtitle, { color: colors.fontSecondary }]}>{subtitle}</Text>
      )}

      <View style={styles.featuresGrid}>
        {data.why_choose_us_features
          .filter(f => f.is_active)
          .sort((a, b) => a.order - b.order)
          .map((feature) => {
            const featureTitle = isArabic ? feature.title_ar : feature.title;
            const featureDescription = isArabic ? feature.description_ar : feature.description;
            const iconName = feature.icon.split(' ').pop() || 'check-circle';

            return (
              <View 
                key={feature.id} 
                style={[styles.featureCard, { backgroundColor: colors.surface }]}
              >
                <View style={[styles.featureIconContainer, { backgroundColor: colors.secondary + '15' }]}>
                  <FontAwesome5 name={iconName as any} size={28} color={colors.secondary} />
                </View>
                <Text style={[styles.featureTitle, { color: colors.text }]}>
                  {featureTitle}
                </Text>
                <Text style={[styles.featureDescription, { color: colors.fontSecondary }]}>
                  {featureDescription}
                </Text>
              </View>
            );
          })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: (width - 48) / 2,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
