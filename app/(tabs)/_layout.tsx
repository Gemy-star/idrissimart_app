import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { RootState } from '@/store';

import { Tabs, router } from 'expo-router';
import { BookOpen, Grid2x2, Home, MessageCircle, Plus, Scale, Tag, User } from 'lucide-react-native';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';

export default function TabLayout() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const compareItems = useSelector((s: RootState) => s.compare.items);
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);
  const totalUnread = useSelector((s: RootState) =>
    s.chat.rooms.reduce((acc, r) => acc + (r.unread_count ?? 0), 0)
  );

  const sharedScreenOptions = {
    headerShown: false,
    tabBarStyle: {
      backgroundColor: colors.tabBarBackground,
      borderTopColor: colors.tabBarBorder,
      borderTopWidth: 1,
      elevation: 0,
      shadowOpacity: 0,
      height: 60,
      paddingBottom: 8,
      paddingTop: 6,
    },
    tabBarActiveTintColor: colors.tabBarActive,
    tabBarInactiveTintColor: colors.tabBarInactive,
    tabBarLabelStyle: {
      fontSize: 11,
      fontWeight: '600' as const,
      fontFamily: 'IBM Plex Sans Arabic',
    },
  };

  return (
    <View style={{ flex: 1 }}>
      <Tabs screenOptions={sharedScreenOptions}>
        <Tabs.Screen
          name="index"
          options={{
            title: t('navigation.index'),
            tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="ads"
          options={{
            title: t('navigation.ads'),
            tabBarIcon: ({ color, size }) => <Tag color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="blogs"
          options={{
            title: t('navigation.blogs'),
            tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="categories"
          options={{
            title: t('navigation.categories'),
            tabBarIcon: ({ color, size }) => <Grid2x2 color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: t('navigation.messages'),
            tabBarIcon: ({ color, size }) => (
              <View>
                <MessageCircle color={color} size={size} />
                {totalUnread > 0 && (
                  <View style={styles.tabBadge}>
                    <Text style={styles.tabBadgeText}>
                      {totalUnread > 9 ? '9+' : totalUnread}
                    </Text>
                  </View>
                )}
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: t('navigation.profile'),
            tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
          }}
        />
      </Tabs>

      {/* Floating add-ad button — always visible on all tabs */}
      <TouchableOpacity
        style={[styles.addFab, { backgroundColor: colors.secondary }]}
        onPress={() => {
          if (!isAuthenticated) {
            Alert.alert(
              t('createAd.loginRequired'),
              t('createAd.loginRequiredMessage'),
              [
                { text: t('common.cancel'), style: 'cancel' },
                { text: t('createAd.loginBtn'), onPress: () => router.push('/login') },
              ]
            );
            return;
          }
          router.push('/create-ad');
        }}
        activeOpacity={0.85}
      >
        <Plus size={26} color="#fff" />
      </TouchableOpacity>

      {/* Floating compare button — visible on all tabs when items are selected */}
      {compareItems.length > 0 && (
        <TouchableOpacity
          style={[styles.compareFab, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/compare')}
          activeOpacity={0.85}
        >
          <Scale size={20} color="#fff" />
          <Text style={styles.compareFabLabel}>{t('compare.title')}</Text>
          <View style={styles.compareBadge}>
            <Text style={styles.compareBadgeText}>{compareItems.length}</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  addFab: {
    position: 'absolute',
    bottom: 76,
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  compareFab: {
    position: 'absolute',
    bottom: 138,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  compareFabLabel: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  compareBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  compareBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  tabBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
});
