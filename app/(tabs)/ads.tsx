import { API_ENDPOINTS } from '@/config/api.config';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Ad, AdsListParams, Category, CustomField, api } from '@/services/api';
import apiClient from '@/services/apiClient';
import { AppDispatch, RootState } from '@/store';
import { toggleFavorite } from '@/store/slices/adsSlice';
import { addToCartThunk } from '@/store/slices/cartSlice';
import { MAX_COMPARE_ITEMS, toggleCompare } from '@/store/slices/compareSlice';
import { addToWishlist, removeFromWishlist } from '@/store/slices/wishlistSlice';
import { faToIonicon } from '@/utils/iconMap';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ChevronLeft, ChevronRight, Eye, LayoutGrid, List, MapPin, Scale, Search, Share2, ShoppingCart, SlidersHorizontal, Tag, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Image,
    Modal,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

type SortOption = 'newest' | 'oldest' | 'price_asc' | 'price_desc';

interface FilterState {
  search: string;
  sort_by: SortOption;
  min_price: string;
  max_price: string;
  category_id: number | null;
  category_name: string;
  category_name_ar: string;
  sub_category_id: number | null;
  custom_fields: Record<string, string>;
}

const DEFAULT_FILTERS: FilterState = {
  search: '',
  sort_by: 'newest',
  min_price: '',
  max_price: '',
  category_id: null,
  category_name: '',
  category_name_ar: '',
  sub_category_id: null,
  custom_fields: {},
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(isoDate: string, isArabic: boolean): string {
  const diff = Math.max(0, Date.now() - new Date(isoDate).getTime());
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (isArabic) {
    if (mins < 60) return `${mins} د`;
    if (hours < 24) {
      const m = mins % 60;
      return m > 0 ? `${hours} س، ${m} د` : `${hours} س`;
    }
    return `${days} يوم`;
  }
  if (mins < 60) return `${mins}m`;
  if (hours < 24) {
    const m = mins % 60;
    return m > 0 ? `${hours}h ${m}m` : `${hours}h`;
  }
  return `${days}d`;
}

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
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);
  const compareItems = useSelector((s: RootState) => s.compare.items);
  const cartItems = useSelector((s: RootState) => s.cart.items);

  const [favorited, setFavorited] = useState(ad.is_favorited);
  const [cartAdded, setCartAdded] = useState(
    () => cartItems.some((i: any) => (i.ad?.id ?? i.ad) === ad.id)
  );

  const catName = isArabic ? ad.category.name_ar : ad.category.name;
  const priceNum = parseFloat(ad.price);
  const ago = timeAgo(ad.created_at, isArabic);
  const initials = (ad.user.first_name?.[0] ?? ad.user.username?.[0] ?? '?').toUpperCase();
  const isVerified = ad.user.verification_status === 'verified';
  const inCompare = compareItems.some((a: any) => a.id === ad.id);

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      Alert.alert(t('createAd.loginRequired'), t('ads.loginToWishlist'), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('createAd.loginBtn'), onPress: () => router.push('/login') },
      ]);
      return;
    }
    const next = !favorited;
    setFavorited(next);
    try {
      await dispatch(toggleFavorite(ad.id));
      if (next) {
        dispatch(addToWishlist({ id: Date.now(), ad, added_at: new Date().toISOString() }));
      } else {
        dispatch(removeFromWishlist(ad.id));
      }
    } catch {
      setFavorited(!next);
    }
  };

  const handleCompare = () => {
    if (!inCompare && compareItems.length >= MAX_COMPARE_ITEMS) {
      Alert.alert('', t('ads.maxCompare'));
      return;
    }
    dispatch(toggleCompare(ad));
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      Alert.alert(t('createAd.loginRequired'), t('ads.loginToCart'), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('createAd.loginBtn'), onPress: () => router.push('/login') },
      ]);
      return;
    }
    if (cartAdded) return;
    setCartAdded(true);
    const result = await dispatch(addToCartThunk({ adId: ad.id }));
    if (addToCartThunk.rejected.match(result)) {
      setCartAdded(false);
      Alert.alert('', t('ads.cartError'));
    }
  };

  // Shared card body content
  const renderBody = (listMode = false) => (
    <View style={[styles.cardBody, listMode && { flex: 1 }]}>
      <View style={[styles.catChip, { backgroundColor: colors.primary + '12', alignSelf: isArabic ? 'flex-end' : 'flex-start' }]}>
        <Tag size={9} color={colors.primary} />
        <Text style={[styles.catChipText, { color: colors.primary }]} numberOfLines={1}>{catName}</Text>
      </View>
      <Text style={[styles.cardTitle, { color: colors.text, textAlign: isArabic ? 'right' : 'left' }]} numberOfLines={2}>
        {ad.title}
      </Text>
      <View style={[styles.priceRow, isArabic && styles.priceRowRTL]}>
        <Text style={[styles.cardPrice, { color: colors.secondary }]}>{priceNum.toLocaleString()}</Text>
        {ad.is_negotiable && (
          <View style={[styles.negotiablePill, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}>
            <Text style={[styles.negotiableText, { color: colors.primary }]}>{t('home.negotiable')}</Text>
          </View>
        )}
      </View>
      {!listMode && (
        <View style={[styles.cardFooter, isArabic && styles.cardFooterRTL]}>
          <View style={styles.avatarWrap}>
            {ad.user.profile_image
              ? <Image source={{ uri: ad.user.profile_image }} style={styles.avatar} />
              : <View style={[styles.avatarFallback, { backgroundColor: colors.primary }]}>
                  <Text style={styles.avatarInitial}>{initials}</Text>
                </View>
            }
            {isVerified && (
              <View style={[styles.verifiedDot, { backgroundColor: colors.primary }]}>
                <Ionicons name="checkmark" size={6} color="#fff" />
              </View>
            )}
          </View>
          <View style={[styles.footerMeta, isArabic && styles.footerMetaRTL]}>
            <View style={[styles.metaItem, isArabic && styles.metaItemRTL]}>
              <MapPin size={10} color={colors.fontSecondary} />
              <Text style={[styles.metaText, { color: colors.fontSecondary }]} numberOfLines={1}>{ad.city}</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={[styles.metaItem, isArabic && styles.metaItemRTL]}>
              <Eye size={10} color={colors.fontSecondary} />
              <Text style={[styles.metaText, { color: colors.fontSecondary }]}>{ad.views_count}</Text>
            </View>
            <View style={styles.metaDivider} />
            <Text style={[styles.metaText, { color: colors.fontSecondary }]}>{ago}</Text>
          </View>
        </View>
      )}
      {listMode && (
        <View style={[styles.metaItem, isArabic && styles.metaItemRTL, { marginTop: 2 }]}>
          <MapPin size={10} color={colors.fontSecondary} />
          <Text style={[styles.metaText, { color: colors.fontSecondary }]} numberOfLines={1}>{ad.city}</Text>
          <View style={styles.metaDivider} />
          <Eye size={10} color={colors.fontSecondary} />
          <Text style={[styles.metaText, { color: colors.fontSecondary }]}>{ad.views_count}</Text>
          <View style={styles.metaDivider} />
          <Text style={[styles.metaText, { color: colors.fontSecondary }]}>{ago}</Text>
        </View>
      )}
    </View>
  );

  // Wishlist + Cart action strip shown at the bottom of every card
  const renderActionStrip = () => (
    <View style={[styles.actionStrip, { borderTopColor: colors.border }]}>
      <TouchableOpacity
        style={[styles.stripBtn, favorited && { backgroundColor: '#FFF0F0' }]}
        onPress={handleFavorite}
        activeOpacity={0.75}
      >
        <Ionicons
          name={favorited ? 'heart' : 'heart-outline'}
          size={13}
          color={favorited ? '#EF4444' : colors.fontSecondary}
        />
        <Text style={[styles.stripBtnText, { color: favorited ? '#EF4444' : colors.fontSecondary }]} numberOfLines={1}>
          {favorited ? t('adDetail.unfavorite') : t('adDetail.favorite')}
        </Text>
      </TouchableOpacity>
      {ad.category.allow_cart && (
        <>
          <View style={[styles.stripDivider, { backgroundColor: colors.border }]} />
          <TouchableOpacity
            style={[styles.stripBtn, cartAdded && { backgroundColor: colors.primary + '12' }]}
            onPress={handleAddToCart}
            activeOpacity={0.75}
          >
            <ShoppingCart size={13} color={cartAdded ? colors.primary : colors.fontSecondary} />
            <Text style={[styles.stripBtnText, { color: cartAdded ? colors.primary : colors.fontSecondary }]} numberOfLines={1}>
              {cartAdded ? t('ads.addedToCart') : t('ads.addToCart')}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  // Shared image overlay
  const renderImageOverlay = () => (
    <>
      <View style={styles.badgesTopLeft}>
        {ad.is_urgent && (
          <View style={[styles.overlayBadge, { backgroundColor: '#EF4444' }]}>
            <Text style={styles.overlayBadgeText}>{t('home.urgent')}</Text>
          </View>
        )}
        {ad.is_highlighted && (
          <View style={[styles.overlayBadge, { backgroundColor: '#F59E0B' }]}>
            <Ionicons name="star" size={8} color="#fff" />
            <Text style={styles.overlayBadgeText}> {t('home.featured')}</Text>
          </View>
        )}
      </View>
      <View style={styles.actionBtns}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleFavorite} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
          <Ionicons name={favorited ? 'heart' : 'heart-outline'} size={15} color={favorited ? '#EF4444' : colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.actionBtn,
            inCompare && { borderWidth: 2, borderColor: colors.primary },
          ]}
          onPress={(e) => { e.stopPropagation?.(); handleCompare(); }}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Scale size={13} color={inCompare ? colors.primary : colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => {}} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
          <Share2 size={13} color={colors.text} />
        </TouchableOpacity>
      </View>
    </>
  );

  if (isGrid) {
    return (
      <TouchableOpacity
        style={[styles.gridCard, { backgroundColor: colors.surface }]}
        onPress={() => onPress(ad)}
        activeOpacity={0.85}
      >
        <View style={styles.gridImageWrap}>
          <Image source={{ uri: ad.primary_image }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          {renderImageOverlay()}
        </View>
        {renderBody()}
        {renderActionStrip()}
      </TouchableOpacity>
    );
  }

  // ── List card ──
  return (
    <View style={[styles.listCard, { backgroundColor: colors.surface }]}>
      <TouchableOpacity
        style={styles.listInner}
        onPress={() => onPress(ad)}
        activeOpacity={0.85}
      >
        <View style={styles.listImageWrap}>
          <Image source={{ uri: ad.primary_image }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          {ad.is_urgent && (
            <View style={[styles.overlayBadge, styles.overlayBadgeAbs, { backgroundColor: '#EF4444' }]}>
              <Text style={styles.overlayBadgeText}>{t('home.urgent')}</Text>
            </View>
          )}
          <View style={[styles.actionBtns, { top: 'auto', bottom: 8 }]}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleFavorite} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
              <Ionicons name={favorited ? 'heart' : 'heart-outline'} size={15} color={favorited ? '#EF4444' : colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, inCompare && { borderWidth: 2, borderColor: colors.primary }]}
              onPress={(e) => { e.stopPropagation?.(); handleCompare(); }}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Scale size={13} color={inCompare ? colors.primary : colors.text} />
            </TouchableOpacity>
          </View>
        </View>
        {renderBody(true)}
      </TouchableOpacity>
      {renderActionStrip()}
    </View>
  );
};

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function AdsScreen() {
  const { colors } = useTheme();
  const { t, language } = useLanguage();
  const isArabic = language === 'ar';
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);

  // Ads state
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter state
  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [draft, setDraft] = useState<FilterState>(DEFAULT_FILTERS);
  const [searchText, setSearchText] = useState('');
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Category state
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [rootCategories, setRootCategories] = useState<Category[]>([]);
  const [rootCatsLoading, setRootCatsLoading] = useState(false);
  const [selectedRootCat, setSelectedRootCat] = useState<Category | null>(null);
  const [catDetailLoading, setCatDetailLoading] = useState(false);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [customFieldsLoading, setCustomFieldsLoading] = useState(false);

  const activeFilterCount = (
    [filters.sort_by !== 'newest', filters.min_price !== '', filters.max_price !== '']
      .filter(Boolean).length +
    Object.values(filters.custom_fields).filter(v => v !== '').length
  );
  const hasCategoryFilter = filters.category_id !== null;

  // Load root categories on mount
  useEffect(() => {
    setRootCatsLoading(true);
    apiClient
      .get(API_ENDPOINTS.CATEGORIES.ROOT, { params: { section_type: 'classified' } })
      .then(res => {
        const payload = res.data;
        const list: Category[] = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.results)
          ? payload.results
          : [];
        setRootCategories(list);
      })
      .catch(() => setRootCategories([]))
      .finally(() => setRootCatsLoading(false));
  }, []);

  // Load custom fields when active category changes
  useEffect(() => {
    const catId = filters.sub_category_id ?? filters.category_id;
    if (!catId) { setCustomFields([]); return; }
    setCustomFieldsLoading(true);
    api.getCustomFieldsByCategory(catId)
      .then(res => {
        if (res.success && Array.isArray(res.data)) setCustomFields(res.data);
        else setCustomFields([]);
      })
      .finally(() => setCustomFieldsLoading(false));
  }, [filters.category_id, filters.sub_category_id]);

  const fetchAds = useCallback(async (
    pageNum: number,
    currentFilters: FilterState,
    append = false,
  ) => {
    if (!append) setLoading(true);
    else setLoadingMore(true);

    try {
      const effectiveCatId = currentFilters.sub_category_id ?? currentFilters.category_id;
      const params: AdsListParams = {
        page: pageNum,
        limit: 20,
        sort_by: currentFilters.sort_by,
      };
      if (currentFilters.search) params.search = currentFilters.search;
      if (currentFilters.min_price) params.min_price = parseFloat(currentFilters.min_price);
      if (currentFilters.max_price) params.max_price = parseFloat(currentFilters.max_price);
      if (effectiveCatId) params.category = effectiveCatId;
      const activeCustomFields = Object.fromEntries(
        Object.entries(currentFilters.custom_fields).filter(([, v]) => v !== '')
      );
      if (Object.keys(activeCustomFields).length > 0) {
        params.extra_params = activeCustomFields;
      }

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

  // ── Category handlers ──
  const openCategoryModal = () => {
    setSelectedRootCat(null);
    setCategoryModalVisible(true);
  };

  const closeCategoryModal = () => {
    setCategoryModalVisible(false);
    setSelectedRootCat(null);
  };

  const handleRootCategoryPress = async (cat: Category) => {
    if ((cat.subcategories_count ?? 0) > 0) {
      setCatDetailLoading(true);
      try {
        const res = await apiClient.get(API_ENDPOINTS.CATEGORIES.DETAIL(cat.id));
        const detail: Category = res.data;
        if ((detail.subcategories?.length ?? 0) > 0) {
          setSelectedRootCat(detail);
          setCatDetailLoading(false);
          return;
        }
      } catch {
        // fall through to select category directly
      }
      setCatDetailLoading(false);
    }
    setFilters(prev => ({
      ...prev,
      category_id: cat.id,
      category_name: cat.name,
      category_name_ar: cat.name_ar,
      sub_category_id: null,
      custom_fields: {},
    }));
    closeCategoryModal();
  };

  const handleSubCategoryPress = (sub: Category) => {
    setFilters(prev => ({
      ...prev,
      category_id: selectedRootCat!.id,
      sub_category_id: sub.id,
      category_name: sub.name,
      category_name_ar: sub.name_ar,
      custom_fields: {},
    }));
    closeCategoryModal();
  };

  const handleSelectAllInCategory = () => {
    if (!selectedRootCat) return;
    setFilters(prev => ({
      ...prev,
      category_id: selectedRootCat.id,
      category_name: selectedRootCat.name,
      category_name_ar: selectedRootCat.name_ar,
      sub_category_id: null,
      custom_fields: {},
    }));
    closeCategoryModal();
  };

  const clearCategoryFilter = () => {
    setFilters(prev => ({
      ...prev,
      category_id: null,
      category_name: '',
      category_name_ar: '',
      sub_category_id: null,
      custom_fields: {},
    }));
  };

  // ── Filter modal handlers ──
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
    setDraft({
      ...DEFAULT_FILTERS,
      search: filters.search,
      category_id: filters.category_id,
      category_name: filters.category_name,
      category_name_ar: filters.category_name_ar,
      sub_category_id: filters.sub_category_id,
    });
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
      onPress={(ad) => router.push(`/ad/${ad.id}` as any)}
    />
  );

  const activeCategoryName = isArabic ? filters.category_name_ar : filters.category_name;
  const selectedRootName = selectedRootCat
    ? (isArabic ? selectedRootCat.name_ar : selectedRootCat.name)
    : '';

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
          {/* Category filter button */}
          <TouchableOpacity
            style={[
              styles.filterBtn,
              {
                backgroundColor: hasCategoryFilter ? colors.secondary : colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={openCategoryModal}
          >
            <Ionicons name="apps-outline" size={18} color={hasCategoryFilter ? '#fff' : colors.text} />
          </TouchableOpacity>
          {/* Sort/Price/Custom fields filter button */}
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
      {(hasCategoryFilter || activeFilterCount > 0) && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {hasCategoryFilter && (
            <TouchableOpacity
              style={[styles.chip, { backgroundColor: colors.secondary }]}
              onPress={clearCategoryFilter}
            >
              <Ionicons name="apps-outline" size={11} color="#fff" />
              <Text style={styles.chipText}> {activeCategoryName}</Text>
              <X size={11} color="#fff" />
            </TouchableOpacity>
          )}
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
          {Object.entries(filters.custom_fields).map(([fieldName, value]) => {
            if (!value) return null;
            const field = customFields.find(f => f.name === fieldName);
            const label = field ? (isArabic ? field.label_ar : field.label_en) : fieldName;
            const option = field?.options?.find(o => o.value === value);
            const optionLabel = option ? (isArabic ? option.label_ar : option.label_en) : value;
            return (
              <TouchableOpacity
                key={fieldName}
                style={[styles.chip, { backgroundColor: colors.primary }]}
                onPress={() => setFilters(prev => ({
                  ...prev,
                  custom_fields: { ...prev.custom_fields, [fieldName]: '' },
                }))}
              >
                <Text style={styles.chipText}>{label}: {optionLabel}</Text>
                <X size={11} color="#fff" />
              </TouchableOpacity>
            );
          })}
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
              <Ionicons name="cube-outline" size={48} color={colors.border} />
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

              {/* Custom Fields (shown when a category is selected) */}
              {customFields.length > 0 && (
                <>
                  <Text style={[styles.sectionLabel, { color: colors.text }]}>{t('ads.specifications')}</Text>
                  {customFieldsLoading ? (
                    <ActivityIndicator size="small" color={colors.primary} style={styles.fieldLoader} />
                  ) : (
                    customFields.map(field => {
                      const label = isArabic ? field.label_ar : field.label_en;
                      const currentValue = draft.custom_fields[field.name] ?? '';

                      if (field.field_type === 'select' && field.options?.length > 0) {
                        return (
                          <View key={field.id} style={styles.fieldGroup}>
                            <Text style={[styles.fieldLabel, { color: colors.fontSecondary }]}>{label}</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                              <View style={styles.fieldOptionsRow}>
                                {field.options
                                  .filter(o => o.is_active)
                                  .sort((a, b) => a.order - b.order)
                                  .map(opt => {
                                    const optLabel = isArabic ? opt.label_ar : opt.label_en;
                                    const isSelected = currentValue === opt.value;
                                    return (
                                      <TouchableOpacity
                                        key={opt.id}
                                        style={[
                                          styles.sortChip,
                                          {
                                            backgroundColor: isSelected ? colors.primary : colors.surface,
                                            borderColor: isSelected ? colors.primary : colors.border,
                                          },
                                        ]}
                                        onPress={() => setDraft(prev => ({
                                          ...prev,
                                          custom_fields: {
                                            ...prev.custom_fields,
                                            [field.name]: isSelected ? '' : opt.value,
                                          },
                                        }))}
                                      >
                                        <Text style={[styles.sortChipText, { color: isSelected ? '#fff' : colors.text }]}>
                                          {optLabel}
                                        </Text>
                                      </TouchableOpacity>
                                    );
                                  })}
                              </View>
                            </ScrollView>
                          </View>
                        );
                      }

                      return (
                        <View key={field.id} style={styles.fieldGroup}>
                          <Text style={[styles.fieldLabel, { color: colors.fontSecondary }]}>{label}</Text>
                          <TextInput
                            style={[styles.fieldInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                            placeholder={label}
                            placeholderTextColor={colors.fontSecondary}
                            keyboardType={field.field_type === 'number' ? 'numeric' : 'default'}
                            value={currentValue}
                            onChangeText={v => setDraft(prev => ({
                              ...prev,
                              custom_fields: { ...prev.custom_fields, [field.name]: v },
                            }))}
                            textAlign={isArabic ? 'right' : 'left'}
                          />
                        </View>
                      );
                    })
                  )}
                </>
              )}
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

      {/* ── Category Selection Modal ── */}
      <Modal
        visible={categoryModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeCategoryModal}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={closeCategoryModal}
          />
          <View style={[styles.modalSheet, styles.categorySheet, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
            <View style={styles.modalHeader}>
              {selectedRootCat ? (
                <TouchableOpacity style={styles.backBtn} onPress={() => setSelectedRootCat(null)}>
                  {isArabic
                    ? <ChevronRight size={20} color={colors.text} />
                    : <ChevronLeft size={20} color={colors.text} />
                  }
                  <Text style={[styles.modalTitle, { color: colors.text }]}>{selectedRootName}</Text>
                </TouchableOpacity>
              ) : (
                <Text style={[styles.modalTitle, { color: colors.text }]}>{t('ads.filterByCategory')}</Text>
              )}
              <TouchableOpacity onPress={closeCategoryModal}>
                <X size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedRootCat ? (
                <>
                  {/* "All in [Category]" option */}
                  <TouchableOpacity
                    style={[styles.categoryRow, { borderBottomColor: colors.border }]}
                    onPress={handleSelectAllInCategory}
                  >
                    <View style={[styles.catIconWrap, { backgroundColor: colors.secondary + '20' }]}>
                      <Ionicons name="grid-outline" size={20} color={colors.secondary} />
                    </View>
                    <Text style={[styles.catName, { color: colors.text, fontWeight: '600' }]}>
                      {t('ads.allIn', { name: selectedRootName })}
                    </Text>
                  </TouchableOpacity>
                  {/* Subcategories */}
                  {selectedRootCat.subcategories?.map(sub => {
                    const subName = isArabic ? sub.name_ar : sub.name;
                    return (
                      <TouchableOpacity
                        key={sub.id}
                        style={[styles.categoryRow, { borderBottomColor: colors.border }]}
                        onPress={() => handleSubCategoryPress(sub)}
                      >
                        <View style={[styles.catIconWrap, { backgroundColor: colors.primary + '15' }]}>
                          <Ionicons name={faToIonicon(sub.icon)} size={20} color={colors.primary} />
                        </View>
                        <Text style={[styles.catName, { color: colors.text }]}>{subName}</Text>
                        {sub.ads_count !== undefined && (
                          <Text style={[styles.catCount, { color: colors.fontSecondary }]}>{sub.ads_count}</Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </>
              ) : (
                <>
                  {/* "All Categories" option */}
                  <TouchableOpacity
                    style={[styles.categoryRow, { borderBottomColor: colors.border }]}
                    onPress={() => { clearCategoryFilter(); closeCategoryModal(); }}
                  >
                    <View style={[styles.catIconWrap, { backgroundColor: colors.border + '60' }]}>
                      <Ionicons name="apps-outline" size={20} color={colors.fontSecondary} />
                    </View>
                    <Text style={[styles.catName, { color: colors.fontSecondary }]}>{t('ads.allCategories')}</Text>
                    {!hasCategoryFilter && (
                      <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                    )}
                  </TouchableOpacity>

                  {catDetailLoading || rootCatsLoading ? (
                    <View style={styles.catLoader}>
                      <ActivityIndicator size="small" color={colors.primary} />
                    </View>
                  ) : (
                    rootCategories.map(cat => {
                      const catName = isArabic ? cat.name_ar : cat.name;
                      const isActive = filters.category_id === cat.id;
                      return (
                        <TouchableOpacity
                          key={cat.id}
                          style={[
                            styles.categoryRow,
                            {
                              borderBottomColor: colors.border,
                              backgroundColor: isActive ? colors.primary + '10' : 'transparent',
                            },
                          ]}
                          onPress={() => handleRootCategoryPress(cat)}
                        >
                          <View style={[styles.catIconWrap, { backgroundColor: isActive ? colors.primary + '30' : colors.primary + '15' }]}>
                            <Ionicons name={faToIonicon(cat.icon)} size={20} color={colors.primary} />
                          </View>
                          <Text style={[styles.catName, { color: colors.text, fontWeight: isActive ? '700' : '400' }]}>
                            {catName}
                          </Text>
                          <View style={styles.catRight}>
                            {cat.ads_count !== undefined && (
                              <Text style={[styles.catCount, { color: colors.fontSecondary }]}>{cat.ads_count}</Text>
                            )}
                            {isActive
                              ? <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                              : (cat.subcategories_count ?? 0) > 0
                                ? isArabic
                                  ? <ChevronLeft size={16} color={colors.fontSecondary} />
                                  : <ChevronRight size={16} color={colors.fontSecondary} />
                                : null
                            }
                          </View>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </>
              )}
            </ScrollView>
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
  chipsRow: { paddingHorizontal: 16, paddingBottom: 8, gap: 8, flexDirection: 'row' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  chipText: { color: '#fff', fontSize: 12, fontWeight: '500', flexShrink: 1 },

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
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 8,
    elevation: 4,
  },
  gridImageWrap: { width: '100%', height: 140, position: 'relative' },

  // List card
  listCard: {
    flexDirection: 'row',
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 8,
    elevation: 4,
  },
  listImageWrap: { width: 120, height: 140, position: 'relative' },
  listBody: { flex: 1, padding: 10, gap: 4, justifyContent: 'center' },

  // Shared card body
  cardBody: { padding: 10, gap: 5 },
  cardTitle: { fontSize: 13, fontWeight: '700', lineHeight: 19 },
  metaText: { fontSize: 11 },

  // Category chip
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 20,
  },
  catChipText: { fontSize: 10, fontWeight: '600' },

  // Price
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  priceRowRTL: { flexDirection: 'row-reverse' },
  cardPrice: { fontSize: 16, fontWeight: '800' },
  negotiablePill: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  negotiableText: { fontSize: 10, fontWeight: '600' },

  // Card footer (avatar + meta)
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  cardFooterRTL: { flexDirection: 'row-reverse' },
  avatarWrap: { position: 'relative', width: 22, height: 22 },
  avatar: { width: 22, height: 22, borderRadius: 11 },
  avatarFallback: { width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  avatarInitial: { color: '#fff', fontSize: 9, fontWeight: '800' },
  verifiedDot: {
    position: 'absolute',
    bottom: -1, right: -1,
    width: 10, height: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  footerMeta: { flex: 1, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 },
  footerMetaRTL: { flexDirection: 'row-reverse' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaItemRTL: { flexDirection: 'row-reverse' },
  metaDivider: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#D1D5DB' },

  // Overlay badges on image
  badgesTopLeft: { position: 'absolute', top: 8, left: 8, gap: 4 },
  overlayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  overlayBadgeAbs: { position: 'absolute', top: 8, left: 8 },
  overlayBadgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },

  // Action buttons on image
  actionBtns: {
    position: 'absolute',
    top: 8, right: 8,
    flexDirection: 'row',
    gap: 6,
  },
  actionBtn: {
    width: 30, height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },

  // Action strip (wishlist + cart)
  actionStrip: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  listInner: {
    flexDirection: 'row',
    flex: 1,
  },
  stripBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
  },
  stripBtnText: { fontSize: 12, fontWeight: '600' },
  stripDivider: { width: StyleSheet.hairlineWidth },

  // Legacy (keep for filter modal usage)
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  price: { fontSize: 15, fontWeight: '700' },
  viewsRow: { flexDirection: 'row', alignItems: 'center' },
  listFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  urgentBadge: { backgroundColor: '#EF4444' },
  featuredBadge: { backgroundColor: '#F59E0B' },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4 },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '600' },

  // Modal shared
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

  // Custom fields
  fieldLoader: { marginBottom: 16 },
  fieldGroup: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, marginBottom: 8 },
  fieldOptionsRow: { flexDirection: 'row', gap: 8 },
  fieldInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },

  // Category modal
  categorySheet: { maxHeight: '80%' },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  catIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catName: { flex: 1, fontSize: 15 },
  catCount: { fontSize: 12 },
  catRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  catLoader: { padding: 24, alignItems: 'center' },
});
