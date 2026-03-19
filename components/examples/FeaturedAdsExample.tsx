/**
 * Example Component: Featured Ads Screen
 * 
 * This component demonstrates how to use Redux Toolkit with the Idrissimart API
 * to fetch and display featured ads.
 */

import { Colors } from '@/constants/Colors';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchFeaturedAds, toggleFavorite } from '@/store/slices/adsSlice';
import { useEffect } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function FeaturedAdsExample() {
  const dispatch = useAppDispatch();
  
  // Access state from Redux store
  const { featuredAds, loading, error } = useAppSelector(state => state.ads);
  const { isAuthenticated } = useAppSelector(state => state.auth);

  // Fetch featured ads on component mount
  useEffect(() => {
    dispatch(fetchFeaturedAds());
  }, [dispatch]);

  // Handle favorite toggle
  const handleToggleFavorite = async (adId: number) => {
    if (!isAuthenticated) {
      alert('Please login to add favorites');
      return;
    }
    
    try {
      await dispatch(toggleFavorite(adId)).unwrap();
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.loadingText}>Loading featured ads...</Text>
      </View>
    );
  }

  // Render error state
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => dispatch(fetchFeaturedAds())}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Render empty state
  if (featuredAds.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No featured ads available</Text>
      </View>
    );
  }

  // Render ad card
  const renderAdCard = ({ item }: { item: typeof featuredAds[0] }) => (
    <TouchableOpacity style={styles.adCard}>
      <Image 
        source={{ uri: item.primary_image }} 
        style={styles.adImage}
        resizeMode="cover"
      />
      <View style={styles.adInfo}>
        <Text style={styles.adTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.adPrice}>
          ${item.price}
          {item.is_negotiable && <Text style={styles.negotiable}> (Negotiable)</Text>}
        </Text>
        <View style={styles.adMeta}>
          <Text style={styles.adLocation}>{item.city}</Text>
          <Text style={styles.adViews}>{item.views_count} views</Text>
        </View>
        {item.is_highlighted && (
          <View style={styles.highlightBadge}>
            <Text style={styles.highlightText}>Featured</Text>
          </View>
        )}
      </View>
      <TouchableOpacity 
        style={styles.favoriteButton}
        onPress={() => handleToggleFavorite(item.id)}
      >
        <Text style={styles.favoriteIcon}>
          {item.is_favorited ? '❤️' : '🤍'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Main render
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Featured Ads</Text>
      <FlatList
        data={featuredAds}
        renderItem={renderAdCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.primary,
    padding: 16,
  },
  listContainer: {
    padding: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  adCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  adImage: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.light.surface,
  },
  adInfo: {
    padding: 12,
  },
  adTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  adPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.secondary,
    marginBottom: 8,
  },
  negotiable: {
    fontSize: 14,
    fontWeight: 'normal',
    color: Colors.light.textSecondary,
  },
  adMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  adLocation: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  adViews: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  highlightBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: Colors.light.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  highlightText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteIcon: {
    fontSize: 20,
  },
});
