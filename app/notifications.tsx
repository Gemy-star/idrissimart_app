import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { AppDispatch, RootState } from '@/store';
import {
    fetchNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    Notification,
} from '@/store/slices/notificationsSlice';
import { router } from 'expo-router';
import {
    Bell,
    BellOff,
    CheckCheck,
    ChevronLeft,
    ChevronRight,
    MessageCircle,
    ShoppingBag,
    Star,
    Tag,
} from 'lucide-react-native';
import React, { useCallback, useEffect } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Platform,
    RefreshControl,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

// ── icon by notification_type ───────────────────────────────────────────────
function NotifIcon({ type, color }: { type: string; color: string }) {
  const size = 20;
  switch (type) {
    case 'message':       return <MessageCircle size={size} color={color} />;
    case 'review':        return <Star size={size} color={color} fill={color} />;
    case 'ad':            return <Tag size={size} color={color} />;
    case 'order':         return <ShoppingBag size={size} color={color} />;
    default:              return <Bell size={size} color={color} />;
  }
}

// ── relative time ────────────────────────────────────────────────────────────
function relativeTime(iso: string, isArabic: boolean): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60)   return isArabic ? 'الآن' : 'Just now';
  if (diff < 3600) {
    const m = Math.floor(diff / 60);
    return isArabic ? `منذ ${m} دقيقة` : `${m}m ago`;
  }
  if (diff < 86400) {
    const h = Math.floor(diff / 3600);
    return isArabic ? `منذ ${h} ساعة` : `${h}h ago`;
  }
  const d = Math.floor(diff / 86400);
  return isArabic ? `منذ ${d} يوم` : `${d}d ago`;
}

// ── single row ───────────────────────────────────────────────────────────────
function NotifRow({
  item,
  onPress,
  colors,
  isArabic,
}: {
  item: Notification;
  onPress: (item: Notification) => void;
  colors: any;
  isArabic: boolean;
}) {
  const iconColor = item.is_read ? colors.textSecondary : colors.primary;
  return (
    <TouchableOpacity
      style={[
        styles.row,
        {
          backgroundColor: item.is_read ? colors.surface : colors.primary + '0d',
          borderBottomColor: colors.border,
        },
      ]}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconWrap, { backgroundColor: iconColor + '18' }]}>
        <NotifIcon type={item.notification_type} color={iconColor} />
      </View>

      <View style={[styles.body, isArabic && styles.bodyRTL]}>
        <View style={[styles.titleRow, isArabic && styles.rowReverse]}>
          <Text
            style={[styles.rowTitle, { color: colors.text }, !item.is_read && styles.unreadTitle]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          {!item.is_read && (
            <View style={[styles.dot, { backgroundColor: colors.secondary }]} />
          )}
        </View>
        <Text style={[styles.rowMessage, { color: colors.fontSecondary }]} numberOfLines={2}>
          {item.message}
        </Text>
        <Text style={[styles.rowTime, { color: colors.textSecondary }]}>
          {relativeTime(item.created_at, isArabic)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ── main screen ──────────────────────────────────────────────────────────────
export default function NotificationsScreen() {
  const { colors } = useTheme();
  const { language, t } = useLanguage();
  const isArabic = language === 'ar';
  const dispatch = useDispatch<AppDispatch>();

  const { notifications, loading, unreadCount } = useSelector(
    (s: RootState) => s.notifications
  );
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);

  const load = useCallback(() => {
    if (isAuthenticated) dispatch(fetchNotifications(undefined));
  }, [isAuthenticated]);

  useEffect(() => { load(); }, [load]);

  const handlePress = (item: Notification) => {
    if (!item.is_read) dispatch(markNotificationAsRead(item.id));
    if (item.link) router.push(item.link as any);
  };

  const handleMarkAll = () => {
    if (unreadCount > 0) dispatch(markAllNotificationsAsRead());
  };

  const BackIcon = isArabic ? ChevronRight : ChevronLeft;

  // ── empty ────────────────────────────────────────────────────────────────
  const Empty = () => (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.primary + '15' }]}>
        <BellOff size={48} color={colors.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        {t('notifications.empty')}
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.fontSecondary }]}>
        {t('notifications.emptySubtitle')}
      </Text>
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primary}
        translucent={false}
      />

      {/* ── Header ── */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />

        <View style={[styles.headerRow, isArabic && styles.rowReverse]}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.backBtn}
          >
            <BackIcon size={22} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>{t('notifications.title')}</Text>

          {unreadCount > 0 ? (
            <TouchableOpacity onPress={handleMarkAll} style={styles.markAllBtn}>
              <CheckCheck size={18} color="#fff" />
              <Text style={styles.markAllText}>{t('notifications.markAllRead')}</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.markAllBtn} />
          )}
        </View>

        {unreadCount > 0 && (
          <View style={[styles.unreadBanner, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
            <Text style={styles.unreadBannerText}>
              {unreadCount} {t('notifications.unread')}
            </Text>
          </View>
        )}
      </View>

      {/* ── Content ── */}
      {loading && notifications.length === 0 ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <NotifRow
              item={item}
              onPress={handlePress}
              colors={colors}
              isArabic={isArabic}
            />
          )}
          ListEmptyComponent={<Empty />}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={load}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          contentContainerStyle={notifications.length === 0 && styles.emptyContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  // header
  header: {
    paddingTop: Platform.OS === 'ios' ? 56 : (StatusBar.currentHeight ?? 0) + 12,
    paddingBottom: 16,
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  circle1: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -60,
    right: -50,
  },
  circle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.06)',
    bottom: -30,
    left: -20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowReverse: { flexDirection: 'row-reverse' },
  backBtn: { padding: 4 },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 80,
    justifyContent: 'flex-end',
  },
  markAllText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: '600',
  },
  unreadBanner: {
    marginTop: 10,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  unreadBannerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },

  // row
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  body: { flex: 1 },
  bodyRTL: { alignItems: 'flex-end' },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  unreadTitle: { fontWeight: '800' },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  rowMessage: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  rowTime: {
    fontSize: 11,
    fontWeight: '500',
  },

  // empty
  emptyContainer: { flex: 1 },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 12,
  },
  emptyIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },

  // loader
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
