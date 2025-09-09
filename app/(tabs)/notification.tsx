import React from 'react';
import { SectionList, StyleSheet, View } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { NotificationCard } from '../../components/NotificationCard';

type Notification = {
  id: string;
  title: string;
  message: string;
};

type Section = {
  title: string;
  data: Notification[];
};

const sections: Section[] = [
  {
    title: 'اليوم',
    data: [{ id: '1', title: 'عنوان الاشعار', message: 'هذا النص هو مثال لنص يمكن أن يستبدل في نفس المساحة.' }],
  },
  {
    title: 'أمس',
    data: [
      { id: '2', title: 'عنوان الاشعار', message: 'هذا النص هو مثال لنص يمكن أن يستبدل في نفس المساحة.' },
      { id: '3', title: 'عنوان الاشعار', message: 'هذا النص هو مثال لنص يمكن أن يستبدل في نفس المساحة.' },
    ],
  },
  {
    title: 'السبت 11/1/2024',
    data: [
      { id: '4', title: 'عنوان الاشعار', message: 'هذا النص هو مثال لنص يمكن أن يستبدل في نفس المساحة.' },
      { id: '5', title: 'عنوان الاشعار', message: 'هذا النص هو مثال لنص يمكن أن يستبدل في نفس المساحة.' },
      { id: '6', title: 'عنوان الاشعار', message: 'هذا النص هو مثال لنص يمكن أن يستبدل في نفس المساحة.' },
    ],
  },
];

export default function NotificationsScreen() {
  const { colors } = useTheme() || {};
  const { t = (key: string) => key } = useLanguage() || {};

  const renderItem = ({ item }: { item: Notification }) => (
    <NotificationCard
      title={item.title}
      message={item.message}
    />
  );

  const renderSectionHeader = ({ section }: { section: Section }) => (
    <ThemedText style={[styles.sectionHeader, { color: colors.text }]}>
      {section.title}
    </ThemedText>
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Notifications list */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        SectionSeparatorComponent={() => <View style={{ height: 20 }} />}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
  },
  listContent: {
    paddingTop: 0,
    paddingRight: 16,
    paddingBottom: 8,
    paddingLeft: 16,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'IBMPlexSansArabic-Bold',
    marginBottom: 20,
    textAlign: 'right',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'IBMPlexSansArabic-Regular',
    marginBottom: 10,
    textAlign: 'right',
  },
});