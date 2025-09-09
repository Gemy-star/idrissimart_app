import React from 'react';
import { View, StyleSheet, FlatList, TextInput, Image, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Menu, Search } from 'lucide-react-native';

interface ChatMessage {
  id: string;
  sender: string;
  lastMessage: string;
  time: string;
  unreadCount?: number;
  avatar: string;
}

const DUMMY_CHAT_DATA: ChatMessage[] = [
  {
    id: '1',
    sender: 'ابراهيم علي',
    lastMessage: 'هذا النص هو مثال لنص يمكن أن يص...',
    time: '02:30 م',
    unreadCount: 1,
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
  },
  {
    id: '2',
    sender: 'علي أحمد',
    lastMessage: 'هذا النص هو مثال لنص يمكن أن يص...',
    time: '02:30 م',
    avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
  },
  {
    id: '3',
    sender: 'محمد صابر',
    lastMessage: 'هذا النص هو مثال لنص يمكن أن يص...',
    time: '02:30 م',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
  },
  {
    id: '4',
    sender: 'عادل احمد',
    lastMessage: 'هذا النص هو مثال لنص يمكن أن يص...',
    time: '02:30 م',
    avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
  },
  {
    id: '5',
    sender: 'علي أحمد',
    lastMessage: 'هذا النص هو مثال لنص يمكن أن يص...',
    time: '02:30 م',
    avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
  },
  {
    id: '6',
    sender: 'عادل احمد',
    lastMessage: 'هذا النص هو مثال لنص يمكن أن يص...',
    time: '02:30 م',
    avatar: 'https://randomuser.me/api/portraits/men/6.jpg',
  },
  {
    id: '7',
    sender: 'محمد صابر',
    lastMessage: 'هذا النص هو مثال لنص يمكن أن يص...',
    time: '02:30 م',
    avatar: 'https://randomuser.me/api/portraits/men/7.jpg',
  },
  {
    id: '8',
    sender: 'علي أحمد',
    lastMessage: 'هذا النص هو مثال لنص يمكن أن يص...',
    time: '02:30 م',
    avatar: 'https://randomuser.me/api/portraits/men/8.jpg',
  },
];

export default function MessagesScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();

  const renderChatItem = ({ item }: { item: ChatMessage }) => (
    <View style={styles.chatItemContainer}>
      {/* Avatar */}
      <Image source={{ uri: item.avatar }} style={styles.avatar} />

      {/* Chat details */}
      <View style={styles.chatDetails}>
        <ThemedText style={[styles.senderName, { color: colors.text }]}>
          {item.sender}
        </ThemedText>
        <ThemedText style={[styles.lastMessage, { color: colors.fontSecondary }]}>
          {item.lastMessage}
        </ThemedText>
      </View>

      {/* Time and Unread Count */}
      <View style={styles.timeAndCount}>
        <ThemedText style={[styles.chatTime, { color: colors.fontSecondary }]}>
          {item.time}
        </ThemedText>
        {item.unreadCount && (
          <View style={[styles.unreadBadge, { backgroundColor: colors.accent }]}>
            <ThemedText style={styles.unreadCount}>
              {item.unreadCount}
            </ThemedText>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>

      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder={t('messages.searchPlaceholder') || 'أبحث هنا'}
          placeholderTextColor={colors.fontSecondary}
        />
        <Search size={20} color={colors.fontSecondary} />
      </View>

      {/* Chat List */}
      <FlatList
        data={DUMMY_CHAT_DATA}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatListContent}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'IBMPlexSansArabic-Bold',
  },
  searchContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderRadius: 12,
    marginHorizontal: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    textAlign: 'right',
    fontSize: 16,
    fontFamily: 'IBMPlexSansArabic-Regular',
    marginHorizontal: 8,
  },
  chatListContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  chatItemContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginLeft: 12,
  },
  chatDetails: {
    flex: 1,
    marginRight: 12,
  },
  senderName: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
    marginBottom: 2,
    fontFamily: 'IBMPlexSansArabic-Bold',
  },
  lastMessage: {
    fontSize: 13,
    textAlign: 'right',
    fontFamily: 'IBMPlexSansArabic-Regular',
  },
  timeAndCount: {
    alignItems: 'flex-end',
  },
  chatTime: {
    fontSize: 12,
    fontFamily: 'IBMPlexSansArabic-Regular',
    marginBottom: 4,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  unreadCount: {
    fontSize: 12,
    color: '#000',
    fontWeight: 'bold',
  },
  itemSeparator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 4,
  },
});