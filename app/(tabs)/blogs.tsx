import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { BlogPost, BlogsListParams, api } from '@/services/api';
import { FontAwesome5 } from '@expo/vector-icons';
import { Search, SlidersHorizontal, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Modal,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const SORT_TO_ORDERING: Record<SortOption, string> = {
  newest:      '-published_date',
  oldest:      'published_date',
  most_viewed: '-views_count',
  most_liked:  '-likes_count',
};

type SortOption = 'newest' | 'oldest' | 'most_viewed' | 'most_liked';

interface FilterState {
  search: string;
  sort_by: SortOption;
}

const DEFAULT_FILTERS: FilterState = {
  search: '',
  sort_by: 'newest',
};

// ── BlogCard ──────────────────────────────────────────────────────────────────
interface BlogCardProps {
  post: BlogPost;
  isArabic: boolean;
  colors: any;
  t: (key: string) => string;
  onPress: (post: BlogPost) => void;
}

const BlogCard: React.FC<BlogCardProps> = ({ post, isArabic, colors, t, onPress }) => {
  const authorName = [post.author.first_name, post.author.last_name].filter(Boolean).join(' ')
    || post.author.username;

  const formattedDate = post.published_date
    ? new Date(post.published_date).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface }]}
      onPress={() => onPress(post)}
      activeOpacity={0.85}
    >
      {/* Image */}
      <View style={styles.imageWrap}>
        {post.image ? (
          <Image
            source={{ uri: post.image }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.imagePlaceholder, { backgroundColor: colors.border }]}>
            <FontAwesome5 name="book-open" size={24} color={colors.fontSecondary} />
          </View>
        )}
        {/* Category badge */}
        {post.category && (
          <View style={[styles.categoryBadge, { backgroundColor: post.category.color || colors.primary }]}>
            <Text style={styles.categoryBadgeText} numberOfLines={1}>
              {isArabic ? post.category.name : (post.category.name_en || post.category.name)}
            </Text>
          </View>
        )}
      </View>

      {/* Body */}
      <View style={styles.cardBody}>
        <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
          {post.title}
        </Text>

        {/* Author row */}
        <View style={[styles.authorRow, { flexDirection: isArabic ? 'row-reverse' : 'row' }]}>
          {post.author.profile_image ? (
            <Image source={{ uri: post.author.profile_image }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: colors.border }]}>
              <FontAwesome5 name="user" size={10} color={colors.fontSecondary} />
            </View>
          )}
          <Text style={[styles.authorName, { color: colors.fontSecondary }]} numberOfLines={1}>
            {t('blogs.by')} {authorName}
          </Text>
        </View>

        {/* Stats row */}
        <View style={[styles.statsRow, { flexDirection: isArabic ? 'row-reverse' : 'row' }]}>
          {formattedDate !== '' && (
            <View style={[styles.statItem, { flexDirection: isArabic ? 'row-reverse' : 'row' }]}>
              <FontAwesome5 name="calendar-alt" size={10} color={colors.fontSecondary} />
              <Text style={[styles.statText, { color: colors.fontSecondary }]}> {formattedDate}</Text>
            </View>
          )}
          <View style={[styles.statItem, { flexDirection: isArabic ? 'row-reverse' : 'row' }]}>
            <FontAwesome5 name="eye" size={10} color={colors.fontSecondary} />
            <Text style={[styles.statText, { color: colors.fontSecondary }]}> {post.views_count} {t('blogs.views')}</Text>
          </View>
          <View style={[styles.statItem, { flexDirection: isArabic ? 'row-reverse' : 'row' }]}>
            <FontAwesome5 name={post.is_liked ? 'heart' : 'heart'} size={10} color={post.is_liked ? '#e74c3c' : colors.fontSecondary} solid={post.is_liked} />
            <Text style={[styles.statText, { color: colors.fontSecondary }]}> {post.likes_count} {t('blogs.likes')}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function BlogsScreen() {
  const { colors } = useTheme();
  const { t, language } = useLanguage();
  const isArabic = language === 'ar';

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [draft, setDraft] = useState<FilterState>(DEFAULT_FILTERS);
  const [searchText, setSearchText] = useState('');
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeFilterCount = [filters.sort_by !== 'newest'].filter(Boolean).length;

  const fetchPosts = useCallback(async (
    pageNum: number,
    currentFilters: FilterState,
    append = false,
  ) => {
    if (!append) setLoading(true);
    else setLoadingMore(true);

    try {
      const params: BlogsListParams = {
        page: pageNum,
        ordering: SORT_TO_ORDERING[currentFilters.sort_by],
      };
      if (currentFilters.search) params.search = currentFilters.search;

      const response = await api.getBlogPosts(params);

      if (response.success && response.data) {
        const newPosts = response.data.results ?? [];
        setPosts(prev => (append ? [...prev, ...newPosts] : newPosts));
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
    fetchPosts(1, filters);
  }, [filters, fetchPosts]);

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchPosts(1, filters);
  };

  const handleLoadMore = () => {
    if (!loadingMore && !loading && hasMore) {
      const next = page + 1;
      setPage(next);
      fetchPosts(next, filters, true);
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
    { value: 'newest',      label: t('blogs.newest')     },
    { value: 'oldest',      label: t('blogs.oldest')     },
    { value: 'most_viewed', label: t('blogs.mostViewed') },
    { value: 'most_liked',  label: t('blogs.mostLiked')  },
  ];

  const renderPost = ({ item }: { item: BlogPost }) => (
    <BlogCard
      post={item}
      isArabic={isArabic}
      colors={colors}
      t={t}
      onPress={(post) => console.log('Blog pressed:', post.id)}
    />
  );

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* ── Header ── */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('blogs.title')}</Text>
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

      {/* ── Search ── */}
      <View style={[styles.searchWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Search size={16} color={colors.fontSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder={t('blogs.search')}
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
        </ScrollView>
      )}

      {/* ── List / Loading ── */}
      {loading && !refreshing ? (
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={[styles.list, posts.length === 0 && styles.listEmpty]}
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
              <FontAwesome5 name="book-open" size={48} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.fontSecondary }]}>
                {t('blogs.noBlogs')}
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
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t('blogs.filters')}</Text>
              <TouchableOpacity onPress={() => setFilterVisible(false)}>
                <X size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalBody}>
              <Text style={[styles.sectionLabel, { color: colors.text }]}>{t('blogs.sortBy')}</Text>
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
            </ScrollView>

            <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
              <TouchableOpacity
                style={[styles.resetBtn, { borderColor: colors.border }]}
                onPress={resetDraft}
              >
                <Text style={[styles.resetBtnText, { color: colors.text }]}>{t('blogs.reset')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.applyBtn, { backgroundColor: colors.primary }]}
                onPress={applyFilters}
              >
                <Text style={styles.applyBtnText}>{t('blogs.applyFilters')}</Text>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 20, fontWeight: '700' },

  // Filter button
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: { fontSize: 10, color: '#fff', fontWeight: '700' },

  // Search
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 0 },

  // Active filter chips
  chipsRow: { paddingHorizontal: 16, paddingBottom: 8, gap: 8, flexDirection: 'row' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  chipText: { fontSize: 12, color: '#fff', fontWeight: '500' },

  // List
  list: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  listEmpty: { flexGrow: 1, justifyContent: 'center' },

  // Loading states
  centerLoader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  footerLoader: { paddingVertical: 16, alignItems: 'center' },

  // Empty state
  emptyContainer: { alignItems: 'center', gap: 12, paddingVertical: 48 },
  emptyText: { fontSize: 15, textAlign: 'center' },

  // Blog card
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  imageWrap: { height: 180, position: 'relative' },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  categoryBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    maxWidth: 140,
  },
  categoryBadgeText: { fontSize: 11, color: '#fff', fontWeight: '600' },
  cardBody: { padding: 12, gap: 8 },
  cardTitle: { fontSize: 15, fontWeight: '600', lineHeight: 21 },

  // Author row
  authorRow: { alignItems: 'center', gap: 7 },
  avatar: { width: 24, height: 24, borderRadius: 12 },
  avatarPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  authorName: { fontSize: 12, flex: 1 },

  // Stats row
  statsRow: { alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  statItem: { alignItems: 'center', gap: 3 },
  statText: { fontSize: 11 },

  // Modal
  modalContainer: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  modalSheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 32 },
  modalHandle: { alignSelf: 'center', width: 36, height: 4, borderRadius: 2, marginTop: 10, marginBottom: 6 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  modalTitle: { fontSize: 17, fontWeight: '700' },
  modalBody: { paddingHorizontal: 20, paddingBottom: 16, gap: 12 },
  sectionLabel: { fontSize: 14, fontWeight: '600', marginTop: 4 },
  sortGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sortChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  sortChipText: { fontSize: 13, fontWeight: '500' },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 14,
    gap: 12,
    borderTopWidth: 1,
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  resetBtnText: { fontSize: 14, fontWeight: '600' },
  applyBtn: { flex: 2, paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
  applyBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
