import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';
import {
  AlertCircle,
  Bell,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Globe,
  Info,
  Moon,
  Sun,
  SunMoon,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// ─── Section wrapper ────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

// ─── Row wrappers ───────────────────────────────────────────────────────────
interface RowProps {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  colors: any;
  isLast?: boolean;
  isArabic: boolean;
}

function Row({ icon, label, sublabel, right, onPress, colors, isLast, isArabic }: RowProps) {
  const ChevronIcon = isArabic ? ChevronLeft : ChevronRight;
  const content = (
    <View
      style={[
        styles.row,
        { borderBottomColor: colors.border },
        isLast && { borderBottomWidth: 0 },
      ]}
    >
      <View style={[styles.rowIcon, { backgroundColor: colors.primary + '12' }]}>
        {icon}
      </View>
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
        {sublabel ? (
          <Text style={[styles.rowSublabel, { color: colors.fontSecondary }]}>{sublabel}</Text>
        ) : null}
      </View>
      {right ?? (onPress ? <ChevronIcon size={16} color={colors.fontSecondary} /> : null)}
    </View>
  );

  return onPress ? (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      {content}
    </TouchableOpacity>
  ) : (
    content
  );
}

// ─── main screen ────────────────────────────────────────────────────────────
export default function SettingsScreen() {
  const { colors, theme, toggleTheme, setTheme } = useTheme();
  const { language, changeLanguage, t } = useLanguage();
  const isArabic = language === 'ar';

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [pushAds, setPushAds] = useState(true);
  const [pushMessages, setPushMessages] = useState(true);

  // ── Language change handler ───────────────────────────────────────────────
  const handleChangeLanguage = async (lang: 'en' | 'ar') => {
    if (lang === language) return;
    await changeLanguage(lang);
    // Inform user that full RTL effect requires restart
    if (lang === 'ar' || language === 'ar') {
      Alert.alert(
        lang === 'ar' ? 'تغيير اللغة' : 'Language Changed',
        lang === 'ar'
          ? 'تم تغيير اللغة إلى العربية. قد تحتاج إلى إعادة تشغيل التطبيق لتطبيق اتجاه النص بالكامل.'
          : 'Language changed to English. You may need to restart the app for full RTL effect.',
        [{ text: lang === 'ar' ? 'حسناً' : 'OK' }]
      );
    }
  };

  // ── Theme selector ────────────────────────────────────────────────────────
  const ThemeOption = ({
    value,
    icon,
    label,
  }: {
    value: 'light' | 'dark';
    icon: React.ReactNode;
    label: string;
  }) => {
    const active = theme === value;
    return (
      <TouchableOpacity
        style={[
          styles.themeOption,
          {
            backgroundColor: active ? colors.primary : colors.background,
            borderColor: active ? colors.primary : colors.border,
          },
        ]}
        onPress={() => setTheme(value)}
        activeOpacity={0.8}
      >
        {icon}
        <Text
          style={[
            styles.themeOptionText,
            { color: active ? '#fff' : colors.fontSecondary },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  // ── Language option ───────────────────────────────────────────────────────
  const LangOption = ({
    lang,
    flag,
    label,
  }: {
    lang: 'en' | 'ar';
    flag: string;
    label: string;
  }) => {
    const active = language === lang;
    return (
      <TouchableOpacity
        style={[
          styles.langOption,
          {
            backgroundColor: active ? colors.primary : colors.background,
            borderColor: active ? colors.primary : colors.border,
          },
        ]}
        onPress={() => handleChangeLanguage(lang)}
        activeOpacity={0.8}
      >
        <Text style={styles.langFlag}>{flag}</Text>
        <Text
          style={[
            styles.langLabel,
            { color: active ? '#fff' : colors.text },
          ]}
        >
          {label}
        </Text>
        {active && (
          <View style={styles.langCheck}>
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          {isArabic
            ? <ChevronRight size={22} color="#fff" />
            : <ChevronLeft size={22} color="#fff" />}
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
        <Text style={styles.headerSubtitle}>{t('settings.subtitle')}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Language ───────────────────────────────────────────────── */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.cardHeader}>
            <Globe size={18} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>{t('settings.language')}</Text>
          </View>
          <Text style={[styles.cardDesc, { color: colors.fontSecondary }]}>
            {t('settings.languageDesc')}
          </Text>
          <View style={styles.langRow}>
            <LangOption lang="ar" flag="🇸🇦" label="العربية" />
            <LangOption lang="en" flag="🇺🇸" label="English" />
          </View>

          {/* RTL info banner */}
          <View style={[styles.infoBanner, { backgroundColor: colors.primary + '12' }]}>
            <AlertCircle size={14} color={colors.primary} />
            <Text style={[styles.infoBannerText, { color: colors.primary }]}>
              {t('settings.rtlWarning')}
            </Text>
          </View>
        </View>

        {/* ── Appearance ─────────────────────────────────────────────── */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.cardHeader}>
            <SunMoon size={18} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>{t('settings.appearance')}</Text>
          </View>
          <Text style={[styles.cardDesc, { color: colors.fontSecondary }]}>
            {t('settings.appearanceDesc')}
          </Text>
          <View style={styles.themeRow}>
            <ThemeOption
              value="light"
              icon={<Sun size={18} color={theme === 'light' ? '#fff' : colors.fontSecondary} />}
              label={t('settings.light')}
            />
            <ThemeOption
              value="dark"
              icon={<Moon size={18} color={theme === 'dark' ? '#fff' : colors.fontSecondary} />}
              label={t('settings.dark')}
            />
          </View>
        </View>

        {/* ── Notifications ──────────────────────────────────────────── */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.cardHeader}>
            <Bell size={18} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>{t('settings.notifications')}</Text>
          </View>
          <Row
            icon={<Bell size={17} color={colors.primary} />}
            label={t('settings.enableNotifications')}
            sublabel={t('settings.enableNotificationsDesc')}
            right={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: colors.border, true: colors.primary + '80' }}
                thumbColor={notificationsEnabled ? colors.primary : colors.fontSecondary}
              />
            }
            colors={colors}
            isArabic={isArabic}
          />
          <Row
            icon={<Bell size={17} color={colors.primary} />}
            label={t('settings.adNotifications')}
            sublabel={t('settings.adNotificationsDesc')}
            right={
              <Switch
                value={pushAds && notificationsEnabled}
                onValueChange={setPushAds}
                disabled={!notificationsEnabled}
                trackColor={{ false: colors.border, true: colors.primary + '80' }}
                thumbColor={pushAds && notificationsEnabled ? colors.primary : colors.fontSecondary}
              />
            }
            colors={colors}
            isArabic={isArabic}
          />
          <Row
            icon={<Bell size={17} color={colors.primary} />}
            label={t('settings.messageNotifications')}
            sublabel={t('settings.messageNotificationsDesc')}
            right={
              <Switch
                value={pushMessages && notificationsEnabled}
                onValueChange={setPushMessages}
                disabled={!notificationsEnabled}
                trackColor={{ false: colors.border, true: colors.primary + '80' }}
                thumbColor={pushMessages && notificationsEnabled ? colors.primary : colors.fontSecondary}
              />
            }
            colors={colors}
            isArabic={isArabic}
            isLast
          />
        </View>

        {/* ── About ──────────────────────────────────────────────────── */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.cardHeader}>
            <Info size={18} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>{t('settings.about')}</Text>
          </View>
          <Row
            icon={<Info size={17} color={colors.primary} />}
            label={t('settings.version')}
            sublabel="1.0.0"
            colors={colors}
            isArabic={isArabic}
          />
          <Row
            icon={<ExternalLink size={17} color={colors.primary} />}
            label={t('settings.privacyPolicy')}
            onPress={() => {}}
            colors={colors}
            isArabic={isArabic}
          />
          <Row
            icon={<ExternalLink size={17} color={colors.primary} />}
            label={t('settings.termsOfService')}
            onPress={() => {}}
            colors={colors}
            isArabic={isArabic}
          />
          <Row
            icon={<ExternalLink size={17} color={colors.primary} />}
            label={t('settings.contactUs')}
            onPress={() => {}}
            colors={colors}
            isArabic={isArabic}
            isLast
          />
        </View>

        <Text style={[styles.footer, { color: colors.fontSecondary }]}>
          © 2025 Idrissimart · {t('settings.footer')}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  // ── Header ──
  header: {
    paddingTop: Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight ?? 0) + 16,
    paddingBottom: 28,
    alignItems: 'center',
    overflow: 'hidden',
  },
  circle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -60,
    right: -50,
  },
  circle2: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.06)',
    bottom: -30,
    left: -30,
  },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight ?? 0) + 16,
    left: 16,
    padding: 6,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },

  // ── Section (unused now, kept for future) ──
  section: {
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
    paddingHorizontal: 4,
    color: '#888',
  },

  // ── Card ──
  card: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: -4,
  },

  // ── Language ──
  langRow: {
    flexDirection: 'row',
    gap: 10,
  },
  langOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    position: 'relative',
  },
  langFlag: {
    fontSize: 20,
  },
  langLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  langCheck: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderRadius: 10,
    padding: 10,
    marginTop: -4,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
  },

  // ── Theme ──
  themeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  themeOptionText: {
    fontSize: 14,
    fontWeight: '700',
  },

  // ── Row ──
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 14, fontWeight: '600' },
  rowSublabel: { fontSize: 12, marginTop: 1 },

  footer: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 8,
  },
});
