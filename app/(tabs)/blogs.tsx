import { API_ENDPOINTS } from '@/config/api.config';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { BlogCategory, BlogPost, BlogsListParams, api } from '@/services/api';
import apiClient from '@/services/apiClient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Search, SlidersHorizontal, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  category_id: number | null;
  category_name: string;
  category_name_ar: string;
  tag: string;
}

const DEFAULT_FILTERS: FilterState = {
  search: '',
  sort_by: 'newest',
  category_id: null,
  category_name: '',
  category_name_ar: '',
  tag: '',
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
            <Ionicons name="book-outline" size={24} color={colors.fontSecondary} />
          </View>
        )}
        {/* Category badge */}
        {post.category && (
          <View style={[styles.categoryBadge, { backgroundColor: post.category.color || colors.primary, [isArabic ? 'right' : 'left']: 10 }]}>
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
        <View style={styles.authorRow}>
          {post.author.profile_image ? (
            <Image source={{ uri: post.author.profile_image }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: colors.border }]}>
              <Ionicons name="person-outline" size={10} color={colors.fontSecondary} />
            </View>
          )}
          <Text style={[styles.authorName, { color: colors.fontSecondary }]} numberOfLines={1}>
            {t('blogs.by')} {authorName}
          </Text>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {formattedDate !== '' && (
            <View style={styles.statItem}>
              <Ionicons name="calendar-outline" size={10} color={colors.fontSecondary} />
              <Text style={[styles.statText, { color: colors.fontSecondary }]}> {formattedDate}</Text>
            </View>
          )}
          <View style={styles.statItem}>
            <Ionicons name="eye-outline" size={10} color={colors.fontSecondary} />
            <Text style={[styles.statText, { color: colors.fontSecondary }]}> {post.views_count} {t('blogs.views')}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name={post.is_liked ? 'heart' : 'heart-outline'} size={10} color={post.is_liked ? '#e74c3c' : colors.fontSecondary} />
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

  // Category + tag filter data
  const [blogCategories, setBlogCategories] = useState<BlogCategory[]>([]);
  const [blogCategoriesLoading, setBlogCategoriesLoading] = useState(false);
  const [blogTags, setBlogTags] = useState<string[]>([]);

  const hasCategoryFilter = filters.category_id !== null;
  const hasTagFilter = filters.tag !== '';
  const activeFilterCount = (
    [filters.sort_by !== 'newest', hasCategoryFilter, hasTagFilter].filter(Boolean).length
  );

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
      if (currentFilters.category_id) params.category = currentFilters.category_id;
      if (currentFilters.tag) params.tag = currentFilters.tag;

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

  // Load blog categories on mount
  useEffect(() => {
    setBlogCategoriesLoading(true);
    apiClient
      .get(API_ENDPOINTS.BLOG.CATEGORIES)
      .then(res => {
        const payload = res.data;
        const list: BlogCategory[] = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.results)
          ? payload.results
          : [];
        setBlogCategories(list);
      })
      .catch(() => setBlogCategories([]))
      .finally(() => setBlogCategoriesLoading(false));

    // Try to load blog tags — gracefully no-ops if endpoint doesn't exist
    apiClient
      .get(API_ENDPOINTS.BLOG.TAGS)
      .then(res => {
        const payload = res.data;
        const raw = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.results)
          ? payload.results
          : [];
        const tags: string[] = raw
          .map((t: any) => (typeof t === 'string' ? t : t.name ?? t.tag ?? ''))
          .filter(Boolean);
        setBlogTags(tags);
      })
      .catch(() => setBlogTags([]));
  }, []);

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
      onPress={(post) => router.push(`/blog/${post.id}` as any)}
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

      {/* ── Quick Category Filter ── */}
      {(blogCategoriesLoading || blogCategories.length > 0) && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickFilterRow}
        >
          {blogCategoriesLoading ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginHorizontal: 8 }} />
          ) : (
            <>
              <TouchableOpacity
                style={[styles.quickChip, {
                  backgroundColor: !filters.category_id ? colors.primary : colors.surface,
                  borderColor: !filters.category_id ? colors.primary : colors.border,
                }]}
                onPress={() => setFilters(prev => ({ ...prev, category_id: null, category_name: '', category_name_ar: '' }))}
              >
                <Text style={[styles.quickChipText, { color: !filters.category_id ? '#fff' : colors.text }]}>
                  {t('blogs.allCategories')}
                </Text>
              </TouchableOpacity>
              {blogCategories.map(cat => {
                const isSelected = filters.category_id === cat.id;
                const catLabel = isArabic ? cat.name : (cat.name_en || cat.name);
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.quickChip, {
                      backgroundColor: isSelected ? (cat.color || colors.secondary) : colors.surface,
                      borderColor: isSelected ? (cat.color || colors.secondary) : colors.border,
                    }]}
                    onPress={() => setFilters(prev => ({
                      ...prev,
                      category_id: isSelected ? null : cat.id,
                      category_name: isSelected ? '' : (cat.name_en || cat.name),
                      category_name_ar: isSelected ? '' : cat.name,
                    }))}
                  >
                    {cat.color && !isSelected && <View style={[styles.quickDot, { backgroundColor: cat.color }]} />}
                    <Text style={[styles.quickChipText, { color: isSelected ? '#fff' : colors.text }]}>
                      {catLabel}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </>
          )}
        </ScrollView>
      )}

      {/* ── Quick Tags Filter ── */}
      {blogTags.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickFilterRow}
        >
          <TouchableOpacity
            style={[styles.quickChip, {
              backgroundColor: !filters.tag ? colors.primary : colors.surface,
              borderColor: !filters.tag ? colors.primary : colors.border,
            }]}
            onPress={() => setFilters(prev => ({ ...prev, tag: '' }))}
          >
            <Ionicons name="pricetag-outline" size={11} color={!filters.tag ? '#fff' : colors.fontSecondary} />
            <Text style={[styles.quickChipText, { color: !filters.tag ? '#fff' : colors.text }]}>
              {t('blogs.allTags')}
            </Text>
          </TouchableOpacity>
          {blogTags.map(tag => {
            const isSelected = filters.tag === tag;
            return (
              <TouchableOpacity
                key={tag}
                style={[styles.quickChip, {
                  backgroundColor: isSelected ? colors.primary : colors.surface,
                  borderColor: isSelected ? colors.primary : colors.border,
                }]}
                onPress={() => setFilters(prev => ({ ...prev, tag: isSelected ? '' : tag }))}
              >
                <Ionicons name="pricetag-outline" size={11} color={isSelected ? '#fff' : colors.fontSecondary} />
                <Text style={[styles.quickChipText, { color: isSelected ? '#fff' : colors.text }]}>
                  {tag}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* ── Active filter chips ── */}
      {(hasCategoryFilter || hasTagFilter || activeFilterCount > 0) && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {hasCategoryFilter && (
            <TouchableOpacity
              style={[styles.chip, { backgroundColor: colors.secondary }]}
              onPress={() => setFilters(prev => ({ ...prev, category_id: null, category_name: '', category_name_ar: '' }))}
            >
              <Ionicons name="bookmark-outline" size={11} color="#fff" />
              <Text style={[styles.chipText, { flexShrink: 1 }]}>
                {isArabic ? filters.category_name_ar : filters.category_name}
              </Text>
              <X size={11} color="#fff" />
            </TouchableOpacity>
          )}
          {hasTagFilter && (
            <TouchableOpacity
              style={[styles.chip, { backgroundColor: colors.primary }]}
              onPress={() => setFilters(prev => ({ ...prev, tag: '' }))}
            >
              <Ionicons name="pricetag-outline" size={11} color="#fff" />
              <Text style={[styles.chipText, { flexShrink: 1 }]}>{filters.tag}</Text>
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
              <Ionicons name="book-outline" size={48} color={colors.border} />
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
              {/* ── Sort ── */}
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

              {/* ── Category ── */}
              <Text style={[styles.sectionLabel, { color: colors.text }]}>{t('blogs.filterByCategory')}</Text>
              {blogCategoriesLoading ? (
                <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 8 }} />
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
                  {/* "All" chip */}
                  <TouchableOpacity
                    style={[
                      styles.catChip,
                      {
                        backgroundColor: draft.category_id === null ? colors.primary : colors.surface,
                        borderColor: draft.category_id === null ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setDraft(prev => ({ ...prev, category_id: null, category_name: '', category_name_ar: '' }))}
                  >
                    <Text style={[styles.catChipText, { color: draft.category_id === null ? '#fff' : colors.text }]}>
                      {t('blogs.allCategories')}
                    </Text>
                  </TouchableOpacity>
                  {blogCategories.map(cat => {
                    const catLabel = isArabic ? cat.name : (cat.name_en || cat.name);
                    const isSelected = draft.category_id === cat.id;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.catChip,
                          {
                            backgroundColor: isSelected ? colors.secondary : colors.surface,
                            borderColor: isSelected ? colors.secondary : colors.border,
                          },
                        ]}
                        onPress={() => setDraft(prev => ({
                          ...prev,
                          category_id: cat.id,
                          category_name: cat.name_en || cat.name,
                          category_name_ar: cat.name,
                        }))}
                      >
                        {cat.color ? (
                          <View style={[styles.catDot, { backgroundColor: cat.color }]} />
                        ) : null}
                        <Text style={[styles.catChipText, { color: isSelected ? '#fff' : colors.text }]}>
                          {catLabel}
                        </Text>
                        {cat.blogs_count > 0 && (
                          <Text style={[styles.catChipCount, { color: isSelected ? 'rgba(255,255,255,0.75)' : colors.fontSecondary }]}>
                            {cat.blogs_count}
                          </Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}

              {/* ── Tags (shown only if tags available) ── */}
              {blogTags.length > 0 && (
                <>
                  <Text style={[styles.sectionLabel, { color: colors.text }]}>{t('blogs.tags')}</Text>
                  <View style={styles.tagsGrid}>
                    {blogTags.map(tag => {
                      const isSelected = draft.tag === tag;
                      return (
                        <TouchableOpacity
                          key={tag}
                          style={[
                            styles.tagChip,
                            {
                              backgroundColor: isSelected ? colors.primary : colors.surface,
                              borderColor: isSelected ? colors.primary : colors.border,
                            },
                          ]}
                          onPress={() => setDraft(prev => ({ ...prev, tag: isSelected ? '' : tag }))}
                        >
                          <Ionicons name="pricetag-outline" size={11} color={isSelected ? '#fff' : colors.fontSecondary} />
                          <Text style={[styles.tagChipText, { color: isSelected ? '#fff' : colors.text }]}>
                            {tag}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </>
              )}
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    maxWidth: 140,
  },
  categoryBadgeText: { fontSize: 11, color: '#fff', fontWeight: '600' },
  cardBody: { padding: 12, gap: 8 },
  cardTitle: { fontSize: 15, fontWeight: '600', lineHeight: 21 },

  // Author row
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  avatar: { width: 24, height: 24, borderRadius: 12 },
  avatarPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  authorName: { fontSize: 12, flex: 1 },

  // Stats row
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
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

  // Category filter chips (inside modal)
  catScroll: { marginTop: 4 },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  catDot: { width: 8, height: 8, borderRadius: 4 },
  catChipText: { fontSize: 13, fontWeight: '500' },
  catChipCount: { fontSize: 11, fontWeight: '400' },

  // Quick filter strips (on-screen)
  quickFilterRow: { paddingHorizontal: 16, paddingBottom: 8, paddingTop: 2, gap: 8, flexDirection: 'row' },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  quickDot: { width: 7, height: 7, borderRadius: 3.5 },
  quickChipText: { fontSize: 13, fontWeight: '500' },

  // Tag chips (inside modal)
  tagsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  tagChipText: { fontSize: 12, fontWeight: '500' },

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
