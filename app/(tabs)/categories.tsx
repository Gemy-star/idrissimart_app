import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Search, SlidersHorizontal } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Platform,
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

// Mock categories data – replace with real API data from Redux store
const MOCK_CATEGORIES = [
  { id: 1, name: 'Real Estate', name_ar: 'عقارات', icon: 'home', ads_count: 1240, color: '#4b315e' },
  { id: 2, name: 'Vehicles', name_ar: 'مركبات', icon: 'car', ads_count: 876, color: '#ff6001' },
  { id: 3, name: 'Electronics', name_ar: 'إلكترونيات', icon: 'laptop', ads_count: 654, color: '#2563EB' },
  { id: 4, name: 'Furniture', name_ar: 'أثاث', icon: 'couch', ads_count: 423, color: '#D97706' },
  { id: 5, name: 'Fashion', name_ar: 'أزياء', icon: 'tshirt', ads_count: 389, color: '#DB2777' },
  { id: 6, name: 'Jobs', name_ar: 'وظائف', icon: 'briefcase', ads_count: 712, color: '#059669' },
  { id: 7, name: 'Services', name_ar: 'خدمات', icon: 'tools', ads_count: 534, color: '#7C3AED' },
  { id: 8, name: 'Animals', name_ar: 'حيوانات', icon: 'paw', ads_count: 201, color: '#B45309' },
  { id: 9, name: 'Kids', name_ar: 'أطفال', icon: 'baby', ads_count: 178, color: '#0891B2' },
  { id: 10, name: 'Sports', name_ar: 'رياضة', icon: 'football-ball', ads_count: 298, color: '#16A34A' },
  { id: 11, name: 'Books', name_ar: 'كتب', icon: 'book', ads_count: 145, color: '#9333EA' },
  { id: 12, name: 'Garden', name_ar: 'حديقة', icon: 'seedling', ads_count: 93, color: '#65A30D' },
];

const FILTER_TABS = [
  { key: 'all', label: 'All', label_ar: 'الكل' },
  { key: 'popular', label: 'Popular', label_ar: 'الأكثر طلباً' },
  { key: 'new', label: 'New', label_ar: 'جديد' },
];

export default function CategoriesScreen() {
  const { colors } = useTheme();
  const { language, t } = useLanguage();
  const isArabic = language === 'ar';

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filtered = useMemo(() => {
    let list = MOCK_CATEGORIES;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) =>
        (isArabic ? c.name_ar : c.name).toLowerCase().includes(q)
      );
    }
    if (activeFilter === 'popular') {
      list = [...list].sort((a, b) => b.ads_count - a.ads_count);
    }
    return list;
  }, [search, activeFilter, isArabic]);

  const renderCategory = ({ item }: { item: typeof MOCK_CATEGORIES[0] }) => {
    const name = isArabic ? item.name_ar : item.name;
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.surface }]}
        activeOpacity={0.75}
        onPress={() => {}}
      >
        {/* Icon circle */}
        <View style={[styles.iconCircle, { backgroundColor: item.color + '18' }]}>
          <View style={[styles.iconInner, { backgroundColor: item.color + '30' }]}>
            <FontAwesome5 name={item.icon as any} size={26} color={item.color} />
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
        <View style={[styles.badge, { backgroundColor: item.color + '18' }]}>
          <Text style={[styles.badgeText, { color: item.color }]}>
            {item.ads_count.toLocaleString()} {t('home.ads')}
          </Text>
        </View>

        {/* Bottom accent line */}
        <View style={[styles.accentLine, { backgroundColor: item.color }]} />
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
          {isArabic ? 'الفئات' : 'Categories'}
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
            onChangeText={setSearch}
            textAlign={isArabic ? 'right' : 'left'}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={{ color: colors.fontSecondary, marginRight: 4 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={[styles.filterBtn, { backgroundColor: colors.secondary }]}>
          <SlidersHorizontal size={18} color="#fff" />
        </TouchableOpacity>
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
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        numColumns={NUM_COLUMNS}
        renderItem={renderCategory}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <FontAwesome5 name="search" size={40} color={colors.fontSecondary} />
            <Text style={[styles.emptyText, { color: colors.fontSecondary }]}>
              {isArabic ? 'لا توجد نتائج' : 'No results found'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
