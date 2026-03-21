import PhoneVerificationModal from '@/components/PhoneVerificationModal';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { AppDispatch, RootState } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { fetchUnreadCount } from '@/store/slices/notificationsSlice';
import { router } from 'expo-router';
import {
    Bell,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    Heart,
    HelpCircle,
    LogIn,
    LogOut,
    MessageCircle,
    Settings,
    ShieldCheck,
    Star,
    UserCircle,
    UserPlus,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

// ─── helper ────────────────────────────────────────────────────────────────
function initials(first: string, last: string) {
  return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase() || '?';
}

// ─── reusable menu row ──────────────────────────────────────────────────────
interface MenuRowProps {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  onPress: () => void;
  isArabic: boolean;
  colors: any;
  danger?: boolean;
  badge?: string;
}

function MenuRow({ icon, label, sublabel, onPress, isArabic, colors, danger, badge }: MenuRowProps) {
  const ChevronIcon = isArabic ? ChevronLeft : ChevronRight;
  return (
    <TouchableOpacity
      style={[styles.menuRow, { borderBottomColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.menuIcon, { backgroundColor: danger ? colors.error + '15' : colors.primary + '12' }]}>
        {icon}
      </View>
      <View style={styles.menuTextWrap}>
        <Text style={[styles.menuLabel, { color: danger ? colors.error : colors.text }]}>
          {label}
        </Text>
        {sublabel ? (
          <Text style={[styles.menuSublabel, { color: colors.fontSecondary }]}>{sublabel}</Text>
        ) : null}
      </View>
      {badge ? (
        <View style={[styles.badge, { backgroundColor: colors.secondary }]}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
      <ChevronIcon size={16} color={colors.fontSecondary} />
    </TouchableOpacity>
  );
}

// ─── stat card ──────────────────────────────────────────────────────────────
function StatCard({ value, label, color, colors }: { value: string | number; label: string; color: string; colors: any }) {
  return (
    <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.fontSecondary }]}>{label}</Text>
    </View>
  );
}

// ─── main screen ────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const { colors, theme } = useTheme();
  const { language, t } = useLanguage();
  const isArabic = language === 'ar';
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector((s: RootState) => s.auth);
  const unreadCount = useSelector((s: RootState) => s.notifications.unreadCount);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchUnreadCount());
  }, [isAuthenticated]);

  const handleLogout = () => {
    Alert.alert(
      t('profile.signOut'),
      t('profile.signOutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('profile.signOut'),
          style: 'destructive',
          onPress: () => dispatch(logout()),
        },
      ]
    );
  };

  // ── Not authenticated view ────────────────────────────────────────────────
  if (!isAuthenticated || !user) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={colors.primary}
        />
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <View style={styles.circle1} />
          <View style={styles.circle2} />
          <Text style={styles.headerTitle}>{t('profile.title')}</Text>
        </View>

        <View style={styles.guestContainer}>
          <View style={[styles.guestIcon, { backgroundColor: colors.primary + '18' }]}>
            <UserCircle size={64} color={colors.primary} />
          </View>
          <Text style={[styles.guestTitle, { color: colors.text }]}>
            {t('profile.guestTitle')}
          </Text>
          <Text style={[styles.guestSubtitle, { color: colors.fontSecondary }]}>
            {t('profile.guestSubtitle')}
          </Text>

          <TouchableOpacity
            style={[styles.guestBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/login')}
          >
            <LogIn size={18} color="#fff" />
            <Text style={styles.guestBtnText}>{t('auth.signIn')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.guestBtnOutline, { borderColor: colors.primary }]}
            onPress={() => router.push('/register')}
          >
            <UserPlus size={18} color={colors.primary} />
            <Text style={[styles.guestBtnOutlineText, { color: colors.primary }]}>
              {t('auth.register')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Authenticated view ────────────────────────────────────────────────────
  const isPremium = user.is_premium;
  const typeLabel = user.profile_type === 'commercial'
    ? t('profile.commercial')
    : t('profile.individual');

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <ScrollView showsVerticalScrollIndicator={false} bounces>
        {/* ── Header / avatar ─────────────────────────────────────────── */}
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <View style={styles.circle1} />
          <View style={styles.circle2} />

          {/* Settings button */}
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => router.push('/settings')}
          >
            <Settings size={22} color="#fff" />
          </TouchableOpacity>

          {/* Avatar */}
          <View style={styles.avatarWrap}>
            <View style={[styles.avatar, { backgroundColor: colors.secondary }]}>
              <Text style={styles.avatarText}>
                {initials(user.first_name, user.last_name)}
              </Text>
            </View>
            {isPremium && (
              <View style={[styles.premiumBadge, { backgroundColor: '#F59E0B' }]}>
                <Star size={10} color="#fff" fill="#fff" />
              </View>
            )}
          </View>

          <Text style={styles.userName}>{user.first_name} {user.last_name}</Text>
          <Text style={styles.userHandle}>@{user.username}</Text>

          <View style={styles.tagRow}>
            <View style={[styles.tag, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Text style={styles.tagText}>{typeLabel}</Text>
            </View>
            {isPremium && (
              <View style={[styles.tag, { backgroundColor: '#F59E0B' }]}>
                <Text style={styles.tagText}>{t('profile.premium')}</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Stats row ───────────────────────────────────────────────── */}
        <View style={styles.statsRow}>
          <StatCard
            value={user.total_ads ?? 0}
            label={t('profile.myAds')}
            color={colors.primary}
            colors={colors}
          />
          <StatCard
            value={user.active_ads ?? 0}
            label={t('profile.active')}
            color={colors.success}
            colors={colors}
          />
          <StatCard
            value={user.average_rating ? parseFloat(String(user.average_rating)).toFixed(1) : '—'}
            label={t('profile.rating')}
            color={colors.warning}
            colors={colors}
          />
        </View>

        {/* ── Info card ───────────────────────────────────────────────── */}
        <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
          {user.email ? (
            <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.infoLabel, { color: colors.fontSecondary }]}>
                {t('profile.email')}
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{user.email}</Text>
            </View>
          ) : null}
          {user.phone || user.mobile ? (
            <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.infoLabel, { color: colors.fontSecondary }]}>
                {t('profile.phone')}
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {user.phone ?? user.mobile}
              </Text>
            </View>
          ) : null}
          {user.rank ? (
            <View style={[styles.infoRow, { borderBottomColor: 'transparent' }]}>
              <Text style={[styles.infoLabel, { color: colors.fontSecondary }]}>
                {t('profile.rank')}
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{user.rank}</Text>
            </View>
          ) : null}
        </View>

        {/* ── Menu sections ───────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.fontSecondary }]}>
            {t('profile.myAccount')}
          </Text>
        </View>
        <View style={[styles.menuCard, { backgroundColor: colors.surface }]}>
          <MenuRow
            icon={<ClipboardList size={18} color={colors.primary} />}
            label={t('profile.myAds')}
            sublabel={t('profile.manageListings')}
            onPress={() => {}}
            isArabic={isArabic}
            colors={colors}
          />
          <MenuRow
            icon={<Heart size={18} color={colors.primary} />}
            label={t('profile.wishlist')}
            sublabel={t('profile.savedItems')}
            onPress={() => {}}
            isArabic={isArabic}
            colors={colors}
          />
          <MenuRow
            icon={<MessageCircle size={18} color={colors.primary} />}
            label={t('profile.messages')}
            sublabel={t('profile.messagesSublabel')}
            onPress={() => router.push('/(tabs)/chat')}
            isArabic={isArabic}
            colors={colors}
          />
          <MenuRow
            icon={<UserCircle size={18} color={colors.primary} />}
            label={t('profile.editProfile')}
            onPress={() => {}}
            isArabic={isArabic}
            colors={colors}
          />
          {!user.is_mobile_verified && (
            <MenuRow
              icon={<ShieldCheck size={18} color={colors.warning ?? '#F59E0B'} />}
              label={t('phoneVerification.verifyPhone')}
              sublabel={t('phoneVerification.verifyPhoneSublabel')}
              onPress={() => setShowVerifyModal(true)}
              isArabic={isArabic}
              colors={colors}
            />
          )}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.fontSecondary }]}>
            {t('profile.app')}
          </Text>
        </View>
        <View style={[styles.menuCard, { backgroundColor: colors.surface }]}>
          <MenuRow
            icon={<Settings size={18} color={colors.primary} />}
            label={t('profile.settings')}
            sublabel={t('profile.settingsSublabel')}
            onPress={() => router.push('/settings')}
            isArabic={isArabic}
            colors={colors}
          />
          <MenuRow
            icon={<Bell size={18} color={colors.primary} />}
            label={t('profile.notifications')}
            onPress={() => router.push('/notifications')}
            isArabic={isArabic}
            colors={colors}
            badge={unreadCount > 0 ? String(unreadCount > 99 ? '99+' : unreadCount) : undefined}
          />
          <MenuRow
            icon={<ShieldCheck size={18} color={colors.primary} />}
            label={t('profile.privacySecurity')}
            onPress={() => {}}
            isArabic={isArabic}
            colors={colors}
          />
          <MenuRow
            icon={<HelpCircle size={18} color={colors.primary} />}
            label={t('profile.help')}
            onPress={() => {}}
            isArabic={isArabic}
            colors={colors}
          />
        </View>

        <View style={styles.sectionHeader} />
        <View style={[styles.menuCard, { backgroundColor: colors.surface }]}>
          <MenuRow
            icon={<LogOut size={18} color={colors.error} />}
            label={t('profile.signOut')}
            onPress={handleLogout}
            isArabic={isArabic}
            colors={colors}
            danger
          />
        </View>

        {/* version */}
        <Text style={[styles.version, { color: colors.fontSecondary }]}>
          Idrissimart v1.0.0
        </Text>
      </ScrollView>

      <PhoneVerificationModal
        visible={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        initialPhone={user?.phone ?? user?.mobile ?? ''}
        onSuccess={() => setShowVerifyModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  // ── Header ──
  header: {
    paddingTop: Platform.OS === 'ios' ? 56 : (StatusBar.currentHeight ?? 0) + 16,
    paddingBottom: 32,
    alignItems: 'center',
    overflow: 'hidden',
  },
  circle1: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -70,
    right: -60,
  },
  circle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.06)',
    bottom: -40,
    left: -40,
  },
  settingsBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : (StatusBar.currentHeight ?? 0) + 16,
    right: 16,
    padding: 6,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  avatarWrap: {
    marginTop: 8,
    marginBottom: 12,
    position: 'relative',
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarText: {
    fontSize: 30,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
  premiumBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 2,
  },
  userHandle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 10,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },

  // ── Stats ──
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    marginTop: -1,
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
  },

  // ── Info card ──
  infoCard: {
    marginHorizontal: 16,
    borderRadius: 14,
    marginBottom: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
  },
  infoLabel: { fontSize: 13, fontWeight: '500' },
  infoValue: { fontSize: 13, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },

  // ── Sections ──
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 6,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  menuCard: {
    marginHorizontal: 16,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    gap: 12,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTextWrap: { flex: 1 },
  menuLabel: { fontSize: 14, fontWeight: '600' },
  menuSublabel: { fontSize: 12, marginTop: 1 },
  badge: {
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#fff' },

  // ── Guest ──
  guestContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  guestIcon: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  guestTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  guestSubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 28 },
  guestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    marginBottom: 12,
  },
  guestBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  guestBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  guestBtnOutlineText: { fontSize: 15, fontWeight: '700' },

  version: { textAlign: 'center', fontSize: 12, marginTop: 16, marginBottom: 32 },
});
