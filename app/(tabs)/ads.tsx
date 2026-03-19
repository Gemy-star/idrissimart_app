import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Ad, AdsListParams, api } from '@/services/api';
import { FontAwesome5 } from '@expo/vector-icons';
import { LayoutGrid, List, Plus, Search, SlidersHorizontal, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

type SortOption = 'newest' | 'oldest' | 'price_asc' | 'price_desc';

interface FilterState {
  search: string;
  sort_by: SortOption;
  min_price: string;
  max_price: string;
}

const DEFAULT_FILTERS: FilterState = {
  search: '',
  sort_by: 'newest',
  min_price: '',
  max_price: '',
};

// ── AdCard ────────────────────────────────────────────────────────────────────
interface AdCardProps {
  ad: Ad;
  isGrid: boolean;
  isArabic: boolean;
  colors: any;
  t: (key: string) => string;
  onPress: (ad: Ad) => void;
}

const AdCard: React.FC<AdCardProps> = ({ ad, isGrid, isArabic, colors, t, onPress }) => {
  if (isGrid) {
    return (
      <TouchableOpacity
        style={[styles.gridCard, { backgroundColor: colors.surface }]}
        onPress={() => onPress(ad)}
        activeOpacity={0.8}
      >
        <View style={styles.gridImageWrap}>
          <Image
            source={{ uri: ad.primary_image }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
          {ad.is_urgent && (
            <View style={[styles.badge, styles.urgentBadge]}>
              <Text style={styles.badgeText}>{t('home.urgent')}</Text>
            </View>
          )}
          {ad.is_highlighted && (
            <View style={[styles.badge, styles.featuredBadge]}>
              <FontAwesome5 name="star" size={8} color="#fff" solid />
              <Text style={styles.badgeText}> {t('home.featured')}</Text>
            </View>
          )}
        </View>
        <View style={styles.gridBody}>
          <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
            {ad.title}
          </Text>
          <View style={styles.metaRow}>
            <FontAwesome5 name="map-marker-alt" size={10} color={colors.fontSecondary} />
            <Text style={[styles.metaText, { color: colors.fontSecondary }]} numberOfLines={1}>
              {' '}{ad.city}
            </Text>
          </View>
          <View style={styles.cardFooter}>
            <Text style={[styles.price, { color: colors.secondary }]}>
              ${parseFloat(ad.price).toFixed(0)}
            </Text>
            <View style={styles.viewsRow}>
              <FontAwesome5 name="eye" size={10} color={colors.fontSecondary} />
              <Text style={[styles.metaText, { color: colors.fontSecondary }]}>
                {' '}{ad.views_count}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.listCard, { backgroundColor: colors.surface }]}
      onPress={() => onPress(ad)}
      activeOpacity={0.8}
    >
      <View style={styles.listImageWrap}>
        <Image
          source={{ uri: ad.primary_image }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
        {ad.is_urgent && (
          <View style={[styles.badge, styles.urgentBadge]}>
            <Text style={styles.badgeText}>{t('home.urgent')}</Text>
          </View>
        )}
      </View>
      <View style={styles.listBody}>
        <View>
          <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
            {ad.title}
          </Text>
          <View style={styles.metaRow}>
            <FontAwesome5 name="map-marker-alt" size={10} color={colors.fontSecondary} />
            <Text style={[styles.metaText, { color: colors.fontSecondary }]} numberOfLines={1}>
              {' '}{ad.city}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <FontAwesome5 name="tag" size={10} color={colors.fontSecondary} />
            <Text style={[styles.metaText, { color: colors.fontSecondary }]} numberOfLines={1}>
              {' '}{isArabic ? ad.category.name_ar : ad.category.name}
            </Text>
          </View>
        </View>
        <View style={styles.listFooter}>
          <Text style={[styles.price, { color: colors.secondary }]}>
            ${parseFloat(ad.price).toFixed(0)}
          </Text>
          <View style={styles.viewsRow}>
            <FontAwesome5 name="eye" size={10} color={colors.fontSecondary} />
            <Text style={[styles.metaText, { color: colors.fontSecondary }]}>
              {' '}{ad.views_count}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function AdsScreen() {
  const { colors } = useTheme();
  const { t, language } = useLanguage();
  const isArabic = language === 'ar';

  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [draft, setDraft] = useState<FilterState>(DEFAULT_FILTERS);
  const [searchText, setSearchText] = useState('');
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeFilterCount = [
    filters.sort_by !== 'newest',
    filters.min_price !== '',
    filters.max_price !== '',
  ].filter(Boolean).length;

  const fetchAds = useCallback(async (
    pageNum: number,
    currentFilters: FilterState,
    append = false,
  ) => {
    if (!append) setLoading(true);
    else setLoadingMore(true);

    try {
      const params: AdsListParams = {
        page: pageNum,
        limit: 20,
        sort_by: currentFilters.sort_by,
      };
      if (currentFilters.search) params.search = currentFilters.search;
      if (currentFilters.min_price) params.min_price = parseFloat(currentFilters.min_price);
      if (currentFilters.max_price) params.max_price = parseFloat(currentFilters.max_price);

      const response = await api.getAds(params);

      if (response.success && response.data) {
        const newAds = response.data.results ?? response.data.ads ?? [];
        setAds(prev => (append ? [...prev, ...newAds] : newAds));
        const totalPages = response.data.total_pages
          ?? (response.data.count ? Math.ceil(response.data.count / 20) : 1);
        setHasMore(pageNum < totalPages);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    fetchAds(1, filters);
  }, [filters, fetchAds]);

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchAds(1, filters);
  };

  const handleLoadMore = () => {
    if (!loadingMore && !loading && hasMore) {
      const next = page + 1;
      setPage(next);
      fetchAds(next, filters, true);
    }
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPage(1);
      setFilters(prev => ({ ...prev, search: text }));
    }, 600);
  };

  const openFilter = () => {
    setDraft(filters);
    setFilterVisible(true);
  };

  const applyFilters = () => {
    setFilterVisible(false);
    setPage(1);
    setFilters(draft);
  };

  const resetDraft = () => {
    setDraft({ ...DEFAULT_FILTERS, search: filters.search });
  };

  const SORT_OPTIONS: { value: SortOption; label: string }[] = [
    { value: 'newest',     label: t('ads.newest')    },
    { value: 'oldest',     label: t('ads.oldest')    },
    { value: 'price_asc',  label: t('ads.priceAsc')  },
    { value: 'price_desc', label: t('ads.priceDesc') },
  ];

  const renderAd = ({ item }: { item: Ad }) => (
    <AdCard
      ad={item}
      isGrid={viewMode === 'grid'}
      isArabic={isArabic}
      colors={colors}
      t={t}
      onPress={(ad) => console.log('Ad pressed:', ad.id)}
    />
  );

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* ── Header ── */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('ads.title')}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setViewMode(m => (m === 'grid' ? 'list' : 'grid'))}
          >
            {viewMode === 'grid'
              ? <List size={22} color={colors.primary} />
              : <LayoutGrid size={22} color={colors.primary} />
            }
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterBtn,
              {
                backgroundColor: activeFilterCount > 0 ? colors.primary : colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={openFilter}
          >
            <SlidersHorizontal size={18} color={activeFilterCount > 0 ? '#fff' : colors.text} />
            {activeFilterCount > 0 && (
              <View style={[styles.filterBadge, { backgroundColor: colors.secondary }]}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Search ── */}
      <View style={[styles.searchWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Search size={16} color={colors.fontSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder={t('ads.search')}
          placeholderTextColor={colors.fontSecondary}
          value={searchText}
          onChangeText={handleSearch}
          returnKeyType="search"
          textAlign={isArabic ? 'right' : 'left'}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <X size={16} color={colors.fontSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Active filter chips ── */}
      {activeFilterCount > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {filters.sort_by !== 'newest' && (
            <TouchableOpacity
              style={[styles.chip, { backgroundColor: colors.primary }]}
              onPress={() => setFilters(prev => ({ ...prev, sort_by: 'newest' }))}
            >
              <Text style={styles.chipText}>
                {SORT_OPTIONS.find(s => s.value === filters.sort_by)?.label}
              </Text>
              <X size={11} color="#fff" />
            </TouchableOpacity>
          )}
          {filters.min_price !== '' && (
            <TouchableOpacity
              style={[styles.chip, { backgroundColor: colors.primary }]}
              onPress={() => setFilters(prev => ({ ...prev, min_price: '' }))}
            >
              <Text style={styles.chipText}>{t('ads.minPrice')}: {filters.min_price}</Text>
              <X size={11} color="#fff" />
            </TouchableOpacity>
          )}
          {filters.max_price !== '' && (
            <TouchableOpacity
              style={[styles.chip, { backgroundColor: colors.primary }]}
              onPress={() => setFilters(prev => ({ ...prev, max_price: '' }))}
            >
              <Text style={styles.chipText}>{t('ads.maxPrice')}: {filters.max_price}</Text>
              <X size={11} color="#fff" />
            </TouchableOpacity>
          )}
        </ScrollView>
      )}

      {/* ── List / Loading ── */}
      {loading && !refreshing ? (
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={ads}
          renderItem={renderAd}
          keyExtractor={item => item.id.toString()}
          key={viewMode}
          numColumns={viewMode === 'grid' ? 2 : 1}
          contentContainerStyle={[styles.list, ads.length === 0 && styles.listEmpty]}
          columnWrapperStyle={viewMode === 'grid' ? styles.columnWrapper : undefined}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <FontAwesome5 name="box-open" size={48} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.fontSecondary }]}>
                {t('ads.noAds')}
              </Text>
            </View>
          }
          ListFooterComponent={
            loadingMore
              ? <View style={styles.footerLoader}><ActivityIndicator size="small" color={colors.primary} /></View>
              : null
          }
        />
      )}

      {/* ── Floating Action Button ── */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.secondary }]}
        onPress={() => console.log('Create ad pressed')}
        activeOpacity={0.85}
      >
        <Plus size={28} color="#fff" />
      </TouchableOpacity>

      {/* ── Filter Bottom Sheet Modal ── */}
      <Modal
        visible={filterVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setFilterVisible(false)}
          />
          <View style={[styles.modalSheet, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t('ads.filters')}</Text>
              <TouchableOpacity onPress={() => setFilterVisible(false)}>
                <X size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalBody}>
              {/* Sort By */}
              <Text style={[styles.sectionLabel, { color: colors.text }]}>{t('ads.sortBy')}</Text>
              <View style={styles.sortGrid}>
                {SORT_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.sortChip,
                      {
                        backgroundColor: draft.sort_by === opt.value ? colors.primary : colors.surface,
                        borderColor: draft.sort_by === opt.value ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setDraft(prev => ({ ...prev, sort_by: opt.value }))}
                  >
                    <Text
                      style={[
                        styles.sortChipText,
                        { color: draft.sort_by === opt.value ? '#fff' : colors.text },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Price Range */}
              <Text style={[styles.sectionLabel, { color: colors.text }]}>{t('ads.priceRange')}</Text>
              <View style={styles.priceRow}>
                <TextInput
                  style={[styles.priceInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                  placeholder={t('ads.minPrice')}
                  placeholderTextColor={colors.fontSecondary}
                  keyboardType="numeric"
                  value={draft.min_price}
                  onChangeText={v => setDraft(prev => ({ ...prev, min_price: v.replace(/[^0-9.]/g, '') }))}
                />
                <View style={[styles.priceSeparator, { backgroundColor: colors.border }]} />
                <TextInput
                  style={[styles.priceInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                  placeholder={t('ads.maxPrice')}
                  placeholderTextColor={colors.fontSecondary}
                  keyboardType="numeric"
                  value={draft.max_price}
                  onChangeText={v => setDraft(prev => ({ ...prev, max_price: v.replace(/[^0-9.]/g, '') }))}
                />
              </View>
            </ScrollView>

            <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
              <TouchableOpacity
                style={[styles.resetBtn, { borderColor: colors.border }]}
                onPress={resetDraft}
              >
                <Text style={[styles.resetBtnText, { color: colors.text }]}>{t('ads.reset')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.applyBtn, { backgroundColor: colors.primary }]}
                onPress={applyFilters}
              >
                <Text style={styles.applyBtnText}>{t('ads.applyFilters')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 16 : 8,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontSize: 24, fontWeight: '700' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { padding: 8 },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },

  // Search
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, padding: 0 },

  // Chips
  chipsRow: { paddingHorizontal: 16, paddingBottom: 8, gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  chipText: { color: '#fff', fontSize: 12, fontWeight: '500' },

  // List
  list: { padding: 16, paddingBottom: 100 },
  listEmpty: { flex: 1 },
  columnWrapper: { justifyContent: 'space-between' },
  centerLoader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  footerLoader: { paddingVertical: 16, alignItems: 'center' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 16, fontWeight: '500' },

  // Grid card
  gridCard: {
    width: CARD_WIDTH,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  gridImageWrap: { width: '100%', height: 130, position: 'relative' },
  gridBody: { padding: 10, gap: 4 },

  // List card
  listCard: {
    flexDirection: 'row',
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  listImageWrap: { width: 120, height: 120, position: 'relative' },
  listBody: { flex: 1, padding: 10, justifyContent: 'space-between' },
  listFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Shared card
  cardTitle: { fontSize: 13, fontWeight: '600', lineHeight: 18, marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  metaText: { fontSize: 11 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  price: { fontSize: 15, fontWeight: '700' },
  viewsRow: { flexDirection: 'row', alignItems: 'center' },

  // Badges
  badge: {
    position: 'absolute',
    top: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  urgentBadge: { backgroundColor: '#EF4444' },
  featuredBadge: { backgroundColor: '#F59E0B', top: 32 },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '600' },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  // Modal
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 12,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalBody: { paddingHorizontal: 20, paddingBottom: 8 },
  sectionLabel: { fontSize: 15, fontWeight: '600', marginBottom: 12, marginTop: 4 },
  sortGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  sortChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  sortChipText: { fontSize: 13, fontWeight: '500' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  priceSeparator: { width: 12, height: 2, borderRadius: 1 },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  resetBtnText: { fontSize: 15, fontWeight: '600' },
  applyBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
