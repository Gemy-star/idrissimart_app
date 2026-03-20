import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { AppDispatch, RootState } from '@/store';
import { fetchChatRooms, ChatRoom } from '@/store/slices/chatSlice';
import { router } from 'expo-router';
import { MessageCircle, Search } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

function formatTime(dateStr: string, isArabic: boolean): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 1) return isArabic ? 'الآن' : 'now';
  if (diffMin < 60) return isArabic ? `${diffMin} د` : `${diffMin}m`;
  if (diffHours < 24) return isArabic ? `${diffHours} س` : `${diffHours}h`;
  if (diffDays < 7) return isArabic ? `${diffDays} ي` : `${diffDays}d`;
  return date.toLocaleDateString(isArabic ? 'ar' : 'en', { month: 'short', day: 'numeric' });
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';
}

function RoomItem({
  room,
  currentUserId,
  isArabic,
  colors,
}: {
  room: ChatRoom;
  currentUserId: number;
  isArabic: boolean;
  colors: any;
}) {
  const otherUser =
    room.publisher?.id === currentUserId ? room.client : room.publisher;
  const otherName = otherUser
    ? `${otherUser.first_name ?? ''} ${otherUser.last_name ?? ''}`.trim() ||
      otherUser.username
    : '?';

  const lastMsg = room.last_message;
  const timeStr = lastMsg ? formatTime(lastMsg.created_at, isArabic) : '';
  const preview = lastMsg?.message ?? '';

  return (
    <TouchableOpacity
      style={[styles.roomItem, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
      onPress={() => router.push(`/chat/${room.id}` as any)}
      activeOpacity={0.75}
    >
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: colors.primary + 'cc' }]}>
        <Text style={styles.avatarText}>{initials(otherName)}</Text>
      </View>

      {/* Middle */}
      <View style={styles.roomMiddle}>
        <Text style={[styles.roomName, { color: colors.text }]} numberOfLines={1}>
          {otherName}
        </Text>
        {room.ad_title ? (
          <Text style={[styles.adTitle, { color: colors.primary }]} numberOfLines={1}>
            {room.ad_title}
          </Text>
        ) : null}
        {preview ? (
          <Text style={[styles.lastMsg, { color: colors.textSecondary }]} numberOfLines={1}>
            {preview}
          </Text>
        ) : null}
      </View>

      {/* Right */}
      <View style={styles.roomRight}>
        {timeStr ? (
          <Text style={[styles.timeText, { color: colors.textSecondary }]}>{timeStr}</Text>
        ) : null}
        {room.unread_count > 0 ? (
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <Text style={styles.badgeText}>
              {room.unread_count > 99 ? '99+' : room.unread_count}
            </Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

export default function ChatScreen() {
  const { colors } = useTheme();
  const { language, t } = useLanguage();
  const isArabic = language === 'ar';
  const dispatch = useDispatch<AppDispatch>();
  const { rooms, loading } = useSelector((s: RootState) => s.chat);
  const { user, isAuthenticated } = useSelector((s: RootState) => s.auth);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchChatRooms());
    }
  }, [isAuthenticated]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchChatRooms());
    setRefreshing(false);
  }, [dispatch]);

  const filtered = rooms.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const otherUser = r.publisher?.id === user?.id ? r.client : r.publisher;
    const name = `${otherUser?.first_name ?? ''} ${otherUser?.last_name ?? ''}`.toLowerCase();
    const adTitle = (r.ad_title ?? '').toLowerCase();
    return name.includes(q) || adTitle.includes(q);
  });

  const totalUnread = rooms.reduce((acc, r) => acc + (r.unread_count ?? 0), 0);

  if (!isAuthenticated) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <View style={styles.headerCircle1} />
          <View style={styles.headerCircle2} />
          <Text style={styles.headerTitle}>{t('chat.title')}</Text>
        </View>
        <View style={styles.emptyCenter}>
          <MessageCircle size={60} color={colors.primary + '60'} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('chat.loginRequired')}</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            {t('chat.loginRequiredSub')}
          </Text>
          <TouchableOpacity
            style={[styles.loginBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.loginBtnText}>{t('auth.signIn')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.headerCircle1} />
        <View style={styles.headerCircle2} />
        <Text style={styles.headerTitle}>{t('chat.title')}</Text>
        {totalUnread > 0 && (
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{totalUnread > 99 ? '99+' : totalUnread}</Text>
          </View>
        )}
      </View>

      {/* Search */}
      <View style={[styles.searchRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Search size={16} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder={t('chat.search')}
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
          textAlign={isArabic ? 'right' : 'left'}
        />
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <RoomItem
              room={item}
              currentUserId={user!.id}
              isArabic={isArabic}
              colors={colors}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyCenter}>
              <MessageCircle size={56} color={colors.primary + '50'} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('chat.empty')}</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                {t('chat.emptySub')}
              </Text>
            </View>
          }
          contentContainerStyle={filtered.length === 0 ? styles.emptyFlex : undefined}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingTop: Platform.OS === 'ios' ? 56 : (StatusBar.currentHeight ?? 0) + 16,
    paddingBottom: 18,
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  headerCircle1: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -60,
    right: -40,
  },
  headerCircle2: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: -40,
    left: -20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.3,
  },
  headerBadge: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : (StatusBar.currentHeight ?? 0) + 16,
    right: 20,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  headerBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 14, height: 36 },
  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  roomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  roomMiddle: { flex: 1, gap: 2 },
  roomName: { fontSize: 15, fontWeight: '700' },
  adTitle: { fontSize: 12, fontWeight: '600' },
  lastMsg: { fontSize: 13 },
  roomRight: { alignItems: 'flex-end', gap: 6 },
  timeText: { fontSize: 11 },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  emptyCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    padding: 40,
  },
  emptyFlex: { flexGrow: 1 },
  emptyTitle: { fontSize: 17, fontWeight: '700', textAlign: 'center' },
  emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  loginBtn: {
    marginTop: 8,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 14,
  },
  loginBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
