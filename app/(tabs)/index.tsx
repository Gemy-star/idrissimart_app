import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useApi } from '@/hooks/useApi';
import { api } from '@/services/api';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View
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
          {t('loading') || 'Loading...'}
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
          {t('retry') || 'Tap to retry'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
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
          onButtonPress={() => {
            // Handle hero button press - navigate to ads listing
            console.log('Hero button pressed:', homeData.home_page.hero_button_url);
          }}
        />
      )}

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
          title={t('featured_ads') || 'Featured Ads'}
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
          title={t('latest_ads') || 'Latest Ads'}
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
          onBlogPress={(blog) => {
            console.log('Blog pressed:', blog.id);
            // Navigate to blog details
          }}
          onViewAll={() => {
            console.log('View all blogs');
          }}
        />
      )}

      {/* Bottom Padding */}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
