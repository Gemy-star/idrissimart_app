import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { HomePage } from '@/services/api';
import { faToIonicon } from '@/utils/iconMap';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';

const { width } = Dimensions.get('window');

interface StatsSectionProps {
  data: HomePage;
}

interface StatItemProps {
  value: number;
  title: string;
  subtitle: string;
  icon: string;
}

const StatItem: React.FC<StatItemProps> = ({ value, title, subtitle, icon }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.statItem, { backgroundColor: colors.surface }]}>
      <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
        <Ionicons name={faToIonicon(icon)} size={24} color={colors.primary} />
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}+</Text>
      <Text style={[styles.statTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.statSubtitle, { color: colors.fontSecondary }]}>{subtitle}</Text>
    </View>
  );
};

export const StatsSection: React.FC<StatsSectionProps> = ({ data }) => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  if (!data.show_statistics) return null;

  const stats = [
    {
      value: data.stat1_value,
      title: isArabic ? data.stat1_title_ar : data.stat1_title,
      subtitle: isArabic ? data.stat1_subtitle_ar : data.stat1_subtitle,
      icon: data.stat1_icon,
    },
    {
      value: data.stat2_value,
      title: isArabic ? data.stat2_title_ar : data.stat2_title,
      subtitle: isArabic ? data.stat2_subtitle_ar : data.stat2_subtitle,
      icon: data.stat2_icon,
    },
    {
      value: data.stat3_value,
      title: isArabic ? data.stat3_title_ar : data.stat3_title,
      subtitle: isArabic ? data.stat3_subtitle_ar : data.stat3_subtitle,
      icon: data.stat3_icon,
    },
    {
      value: data.stat4_value,
      title: isArabic ? data.stat4_title_ar : data.stat4_title,
      subtitle: isArabic ? data.stat4_subtitle_ar : data.stat4_subtitle,
      icon: data.stat4_icon,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {stats.map((stat, index) => (
          <StatItem key={index} {...stat} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
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
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
});
