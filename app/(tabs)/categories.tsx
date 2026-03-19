import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Category, api } from '@/services/api';
import { FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Search } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
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

const { width } = Dimensions.get('window');
const CARD_MARGIN = 12;
const NUM_COLUMNS = 2;
const CARD_WIDTH = (width - 32 - CARD_MARGIN * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

const FILTER_TABS = [
  { key: 'all',     label: 'All',       label_ar: 'الكل'         },
  { key: 'popular', label: 'Popular',   label_ar: 'الأكثر طلباً' },
];

export default function CategoriesScreen() {
  const { colors } = useTheme();
  const { language, t } = useLanguage();
  const isArabic = language === 'ar';

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.getRootCategories();
      if (response.success && response.data) {
        const list = Array.isArray(response.data) ? response.data : [];
        setCategories(list);
        setError(null);
      } else {
        setError(response.error ?? 'Failed to load categories');
      }
    } catch {
      setError('Failed to load categories');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSearch = (text: string) => {
    setSearch(text);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {}, 400);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCategories();
  };

  const filtered = (() => {
    let list = categories;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) =>
        (isArabic ? c.name_ar : c.name).toLowerCase().includes(q)
      );
    }
    if (activeFilter === 'popular') {
      list = [...list].sort((a, b) => (b.ads_count ?? 0) - (a.ads_count ?? 0));
    }
    return list;
  })();

  const renderCategory = ({ item }: { item: Category }) => {
    const name = isArabic ? item.name_ar : item.name;
    const iconName = (item.icon?.split(' ').pop() || 'folder').replace(/^fa-/, '');
    const cardColor = (item as any).color || colors.primary;

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.surface }]}
        activeOpacity={0.75}
        onPress={() => router.push({ pathname: '/(tabs)/ads', params: { category: item.id } } as any)}
      >
        {/* Icon circle */}
        <View style={[styles.iconCircle, { backgroundColor: cardColor + '18' }]}>
          <View style={[styles.iconInner, { backgroundColor: cardColor + '30' }]}>
            <FontAwesome5 name={iconName as any} size={26} color={cardColor} solid />
          </View>
        </View>

        {/* Name */}
        <Text
          style={[styles.cardName, { color: colors.text }]}
          numberOfLines={2}
        >
          {name}
        </Text>

        {/* Count badge */}
        {item.ads_count !== undefined && (
          <View style={[styles.badge, { backgroundColor: cardColor + '18' }]}>
            <Text style={[styles.badgeText, { color: cardColor }]}>
              {item.ads_count.toLocaleString()} {t('home.ads')}
            </Text>
          </View>
        )}

        {/* Bottom accent line */}
        <View style={[styles.accentLine, { backgroundColor: cardColor }]} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={colors.background === '#1a1522' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.primary}
      />

      {/* ── Header ── */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>
          {t('navigation.categories')}
        </Text>
        <Text style={styles.headerSubtitle}>
          {isArabic
            ? `${filtered.length} فئة متاحة`
            : `${filtered.length} categories available`}
        </Text>
      </View>

      {/* ── Search bar ── */}
      <View style={[styles.searchRow, { backgroundColor: colors.primary }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.surface }]}>
          <Search size={18} color={colors.fontSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={isArabic ? 'ابحث عن فئة...' : 'Search categories...'}
            placeholderTextColor={colors.fontSecondary}
            value={search}
            onChangeText={handleSearch}
            textAlign={isArabic ? 'right' : 'left'}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={{ color: colors.fontSecondary, marginRight: 4 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Filter tabs ── */}
      <View style={[styles.filterRow, { borderBottomColor: colors.border }]}>
        {FILTER_TABS.map((tab) => {
          const active = activeFilter === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.filterTab,
                active && { borderBottomColor: colors.secondary, borderBottomWidth: 2.5 },
              ]}
              onPress={() => setActiveFilter(tab.key)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  { color: active ? colors.secondary : colors.fontSecondary },
                  active && { fontWeight: '700' },
                ]}
              >
                {isArabic ? tab.label_ar : tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Grid ── */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <FontAwesome5 name="exclamation-circle" size={40} color={colors.fontSecondary} />
          <Text style={[styles.emptyText, { color: colors.fontSecondary, marginTop: 12 }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: colors.primary }]}
            onPress={() => { setLoading(true); fetchCategories(); }}
          >
            <Text style={styles.retryBtnText}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          numColumns={NUM_COLUMNS}
          renderItem={renderCategory}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <FontAwesome5 name="search" size={40} color={colors.fontSecondary} />
              <Text style={[styles.emptyText, { color: colors.fontSecondary }]}>
                {isArabic ? 'لا توجد نتائج' : 'No results found'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  retryBtn: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight ?? 0) + 16,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
  },
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10,
    alignItems: 'center',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: 44,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  filterTab: {
    marginRight: 20,
    paddingBottom: 10,
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  grid: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  row: {
    gap: CARD_MARGIN,
    marginBottom: CARD_MARGIN,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardName: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 20,
  },
  badge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  accentLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    borderRadius: 2,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
