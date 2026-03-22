import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useApi } from '@/hooks/useApi';
import { api } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// Home Components
import { AdsSection } from '@/components/home/AdsSection';
import { BlogsSection } from '@/components/home/BlogsSection';
import { CategoriesSection } from '@/components/home/CategoriesSection';
import { HeroSection } from '@/components/home/HeroSection';
import { SliderSection } from '@/components/home/SliderSection';
import { StatsSection } from '@/components/home/StatsSection';
import { WhyChooseSection } from '@/components/home/WhyChooseSection';

export default function HomeScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();
  
  // Fetch home data from API
  const { data: homeData, loading, error, refetch } = useApi(
    () => api.getHomeData('EG', 20, 20, 10),
    []
  );

  if (loading && !homeData) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          {t('common.loading')}
        </Text>
      </View>
    );
  }

  if (error && !homeData) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          {error}
        </Text>
        <Text 
          style={[styles.retryText, { color: colors.primary }]}
          onPress={refetch}
        >
          {t('common.retry')}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={loading} 
            onRefresh={refetch}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
      {/* Hero Section */}
      {homeData?.home_page && (
        <HeroSection
          data={homeData.home_page}
          onBadgePress={() => router.push('/(tabs)/ads')}
          onButtonPress={() => router.push('/(tabs)/ads')}
        />
      )}

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity
            style={styles.searchInputArea}
            activeOpacity={0.7}
            onPress={() => router.push('/(tabs)/ads')}
          >
            <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
            <Text style={[styles.searchPlaceholder, { color: colors.textSecondary }]}>
              {t('ads.search')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.searchFilterBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/ads')}
          >
            <Ionicons name="options-outline" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sliders Section */}
      {homeData?.sliders && homeData.sliders.length > 0 && (
        <SliderSection 
          sliders={homeData.sliders}
          onSlidePress={(slider) => {
            console.log('Slider pressed:', slider.button_url);
          }}
        />
      )}

      {/* Statistics Section */}
      {homeData?.home_page && (
        <StatsSection data={homeData.home_page} />
      )}

      {/* Why Choose Us Section */}
      {homeData?.home_page && (
        <WhyChooseSection data={homeData.home_page} />
      )}

      {/* Categories Section */}
      {homeData?.categories_by_section && 
       homeData.categories_by_section.length > 0 && 
       homeData.home_page?.show_featured_categories && (
        <CategoriesSection 
          sections={homeData.categories_by_section}
          onCategoryPress={(categoryId) => {
            console.log('Category pressed:', categoryId);
            // Navigate to category details
          }}
        />
      )}

      {/* Featured Ads Section */}
      {homeData?.featured_ads && 
       homeData.featured_ads.length > 0 && 
       homeData.home_page?.show_featured_ads && (
        <AdsSection 
          title={t('home.featured_ads')}
          ads={homeData.featured_ads}
          onAdPress={(ad) => {
            console.log('Ad pressed:', ad.id);
            // Navigate to ad details
          }}
          onViewAll={() => {
            console.log('View all featured ads');
          }}
        />
      )}

      {/* Latest Ads Section */}
      {homeData?.latest_ads && homeData.latest_ads.length > 0 && (
        <AdsSection 
          title={t('home.latest_ads')}
          ads={homeData.latest_ads}
          onAdPress={(ad) => {
            console.log('Ad pressed:', ad.id);
            // Navigate to ad details
          }}
          onViewAll={() => {
            console.log('View all latest ads');
          }}
        />
      )}

      {/* Latest Blogs Section */}
      {homeData?.latest_blogs && homeData.latest_blogs.length > 0 && (
        <BlogsSection 
          blogs={homeData.latest_blogs}
          onBlogPress={(blog) => router.push(`/blog/${blog.id}` as any)}
          onViewAll={() => router.push('/(tabs)/blogs' as any)}
        />
      )}

      {/* Bottom Padding */}
      <View style={{ height: 32 }} />
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  searchWrapper: {
    paddingHorizontal: 16,
    marginTop: -20,
    marginBottom: 8,
    zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  searchInputArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 15,
  },
  searchFilterBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
