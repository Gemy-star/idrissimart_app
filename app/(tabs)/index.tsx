import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import WelcomeCard from '@/components/welcomeCard';
import { ThemedText } from '@/components/ThemedText';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useTypography } from '@/hooks/useTypography';

// Lucide Icons - You'll need to import these if not already in your project
import {
  CalendarDays,
  Users,
  GalleryHorizontal,
  Map,
  MapPin,
  Sparkles,
  Link,
  MessageSquare,
  Circle,
  Square,
  Bell,
  ChevronRight,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

// --- Helper Components ---

interface GridItemProps {
  icon: React.ComponentType<{ size: number; color: string }>;
  label: string;
}

const GridItem: React.FC<GridItemProps> = ({ icon: Icon, label }) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity style={[styles.gridItem, { backgroundColor: colors.card }]}>
      <Icon size={24} color={colors.accent} />
      <ThemedText style={[styles.gridItemText, { color: colors.text }]}>{label}</ThemedText>
    </TouchableOpacity>
  );
};

interface LinkedItemProps {
  icon: React.ComponentType<{ size: number; color: string }>;
  label: string;
}

const LinkedItem: React.FC<LinkedItemProps> = ({ icon: Icon, label }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.linkedItem, { backgroundColor: colors.card }]}>
      <Icon size={16} color={colors.accent} />
      <ThemedText style={[styles.linkedItemText, { color: colors.text }]}>{label}</ThemedText>
    </View>
  );
};

interface NewsItemProps {
  image: string;
  title: string;
  description: string;
  time: string;
}

const NewsItem: React.FC<NewsItemProps> = ({ image, title, description, time }) => {
  const { colors } = useTheme();
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const secondaryColor = colors.fontSecondary || '#B0B0B0';

  return (
    <TouchableOpacity style={[styles.newsItem, { backgroundColor: colors.card }]}>
      <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
        <Image source={{ uri: image }} style={styles.newsImage} />
        <View style={styles.newsContent}>
          <ThemedText style={[styles.newsTime, { color: secondaryColor }]}>{time}</ThemedText>
          <ThemedText style={[styles.newsTitle, { color: colors.text }]}>{title}</ThemedText>
          <ThemedText style={[styles.newsDescription, { color: secondaryColor }]}>{description}</ThemedText>
        </View>
        <ChevronRight size={20} color={secondaryColor} style={{ marginTop: 10 }} />
      </View>
    </TouchableOpacity>
  );
};

// --- Main Screen Component ---

export default function HomeScreen() {
  const { colors } = useTheme();
  const { t, language } = useLanguage();
  const { getTextStyle } = useTypography();
  const isRTL = language === 'ar';

  // Dummy data for sections
  const navigationItems = [
    { icon: CalendarDays, label: t('sidebar.eventSchedule') || 'جدول الفعالية' },
    { icon: Users, label: t('sidebar.speakers') || 'المتحدثين' },
    { icon: Users, label: t('sidebar.attendees') || 'الحضور' },
    { icon: GalleryHorizontal, label: t('sidebar.exhibitions') || 'المعارض' },
    { icon: Map, label: t('sidebar.floorPlan') || 'مخطط الطابق' },
    { icon: MapPin, label: t('sidebar.location') || 'الموقع' },
  ];

  const linkedItemsData = [
    { icon: Square, label: 'Layers' },
    { icon: Circle, label: 'Circles' },
    { icon: MessageSquare, label: 'Quotient' },
    { icon: Square, label: 'Quotient' },
    { icon: Circle, label: 'Layers' },
    { icon: MessageSquare, label: 'Circles' },
    { icon: Square, label: 'Quotient' },
    { icon: Circle, label: 'Layers' },
    { icon: MessageSquare, label: 'Circles' },
  ];

  const newsItemsData = [
    {
      image: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=News1',
      title: 'الرياض تستضيف القمة العالمية السعودية',
      description: 'هذا النص هو مثال لنص يمكن أن يستبدل في نفس المساحة. لقد تم توليد هذا النص من مولد النص العربى، حيث يمكنك أن تولد مثل هذا النص.',
      time: 'من السبت 25 فبراير 09:00 صباحا الى الأحد 26 فبراير 04:00 مساءً',
    },
    {
      image: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=News2',
      title: 'أخبار المؤتمر العربي في السعودية',
      description: 'هذا النص هو مثال لنص يمكن أن يستبدل في نفس المساحة. لقد تم توليد هذا النص من مولد النص العربى، حيث يمكنك أن تولد مثل هذا النص.',
      time: 'من السبت 25 فبراير 09:00 صباحا الى الأحد 26 فبراير 04:00 مساءً',
    },
  ];

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Welcome Card */}
        <WelcomeCard />

        {/* Section: تصفح المؤتمر (Browse Conference) */}
        <ThemedText style={[styles.sectionTitle, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
          {t('home.browseConference') || 'تصفح المؤتمر'}
        </ThemedText>
        <View style={styles.gridContainer}>
          {navigationItems.map((item, index) => (
            <GridItem key={index} icon={item.icon} label={item.label} />
          ))}
        </View>

        {/* Section: الربط والتمكين تمكين (Linking and Enabling) */}
        <ThemedText style={[styles.sectionTitle, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
          {t('home.linkingAndEnabling') || 'الربط والتمكين تمكين'}
        </ThemedText>
        <View style={styles.linkedItemsGrid}>
          {linkedItemsData.map((item, index) => (
            <LinkedItem key={index} icon={item.icon} label={item.label} />
          ))}
        </View>

        {/* Section: الربط والتمكين تمكين (Another one) */}
        <ThemedText style={[styles.sectionTitle, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
          {t('home.linkingAndEnabling') || 'الربط والتمكين تمكين'}
        </ThemedText>
        <View style={styles.linkedItemsGrid}>
          {linkedItemsData.map((item, index) => (
            <LinkedItem key={index} icon={item.icon} label={item.label} />
          ))}
        </View>

        {/* Section: الربط والتمكين تمكين (Another one) */}
        <ThemedText style={[styles.sectionTitle, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
          {t('home.linkingAndEnabling') || 'الربط والتمكين تمكين'}
        </ThemedText>
        <View style={styles.linkedItemsGrid}>
          {linkedItemsData.map((item, index) => (
            <LinkedItem key={index} icon={item.icon} label={item.label} />
          ))}
        </View>

         {/* Section: الربط والتمكين تمكين (Last one) */}
         <ThemedText style={[styles.sectionTitle, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
          {t('home.linkingAndEnabling') || 'الربط والتمكين تمكين'}
        </ThemedText>
        <View style={styles.linkedItemsGrid}>
          {linkedItemsData.map((item, index) => (
            <LinkedItem key={index} icon={item.icon} label={item.label} />
          ))}
        </View>

        {/* Section: معلومات (Information) */}
        <ThemedText style={[styles.sectionTitle, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
          {t('home.information') || 'معلومات'}
        </ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.newsScrollContainer}>
          {newsItemsData.map((item, index) => (
            <NewsItem key={index} {...item} />
          ))}
        </ScrollView>

      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  topHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    fontFamily: 'IBMPlexSansArabic-Bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
    fontFamily: 'IBMPlexSansArabic-Bold',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: (width - 32 - 12 * 2) / 3,
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    padding: 10,
  },
  gridItemText: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'IBMPlexSansArabic-Regular',
  },
  linkedItemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  linkedItem: {
    width: (width - 32 - 8 * 2) / 3,
    height: 40,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  linkedItemText: {
    fontSize: 12,
    marginLeft: 8,
    fontFamily: 'IBMPlexSansArabic-Regular',
  },
  newsScrollContainer: {
    paddingRight: 16,
    paddingBottom: 20,
  },
  newsItem: {
    width: width * 0.8,
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
  },
  newsImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  newsContent: {
    flex: 1,
    marginRight: 12,
  },
  newsTime: {
    fontSize: 10,
    marginBottom: 4,
    textAlign: 'right',
    fontFamily: 'IBMPlexSansArabic-Regular',
  },
  newsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'right',
    fontFamily: 'IBMPlexSansArabic-Bold',
  },
  newsDescription: {
    fontSize: 12,
    textAlign: 'right',
    fontFamily: 'IBMPlexSansArabic-Regular',
  },
});