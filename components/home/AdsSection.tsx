import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Ad } from '@/services/api';
import { FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface AdsSectionProps {
  title: string;
  ads: Ad[];
  onAdPress?: (ad: Ad) => void;
  onViewAll?: () => void;
}

export const AdsSection: React.FC<AdsSectionProps> = ({ 
  title, 
  ads, 
  onAdPress,
  onViewAll 
}) => {
  const { colors } = useTheme();
  const { language, t } = useLanguage();
  const isArabic = language === 'ar';

  if (!ads || ads.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {onViewAll && (
          <TouchableOpacity onPress={onViewAll}>
            <Text style={[styles.viewAll, { color: colors.primary }]}>
              {t('view_all') || 'View All'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.adsList}
      >
        {ads.map((ad) => (
          <TouchableOpacity
            key={ad.id}
            style={[styles.adCard, { backgroundColor: colors.surface }]}
            onPress={() => onAdPress?.(ad)}
            activeOpacity={0.8}
          >
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: ad.primary_image }} 
                style={styles.adImage}
                resizeMode="cover"
              />
              
              {ad.is_urgent && (
                <View style={[styles.badge, styles.urgentBadge]}>
                  <Text style={styles.badgeText}>{t('urgent') || 'Urgent'}</Text>
                </View>
              )}
              
              {ad.is_highlighted && (
                <View style={[styles.badge, styles.featuredBadge]}>
                  <FontAwesome5 name="star" size={10} color="#fff" />
                  <Text style={styles.badgeText}> {t('featured') || 'Featured'}</Text>
                </View>
              )}

              <TouchableOpacity style={styles.favoriteButton}>
                <FontAwesome5 
                  name={ad.is_favorited ? 'heart' : 'heart'} 
                  size={16} 
                  color={ad.is_favorited ? colors.secondary : '#fff'}
                  solid={ad.is_favorited}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.adContent}>
              <Text 
                style={[styles.adTitle, { color: colors.text }]}
                numberOfLines={2}
              >
                {ad.title}
              </Text>

              <View style={styles.categoryRow}>
                <FontAwesome5 
                  name={ad.category.icon.replace('fa-', '') || 'tag'} 
                  size={10} 
                  color={colors.fontSecondary} 
                />
                <Text style={[styles.categoryText, { color: colors.fontSecondary }]}>
                  {isArabic ? ad.category.name_ar : ad.category.name}
                </Text>
              </View>

              <View style={styles.locationRow}>
                <FontAwesome5 name="map-marker-alt" size={10} color={colors.fontSecondary} />
                <Text style={[styles.locationText, { color: colors.fontSecondary }]}>
                  {ad.city}
                </Text>
              </View>

              <View style={styles.footer}>
                <Text style={[styles.price, { color: colors.secondary }]}>
                  ${parseFloat(ad.price).toFixed(0)}
                  {ad.is_negotiable && (
                    <Text style={styles.negotiable}> {t('negotiable') || '(negotiable)'}</Text>
                  )}
                </Text>
                
                <View style={styles.views}>
                  <FontAwesome5 name="eye" size={10} color={colors.fontSecondary} />
                  <Text style={[styles.viewsText, { color: colors.fontSecondary }]}>
                    {' '}{ad.views_count}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  adsList: {
    paddingHorizontal: 16,
  },
  adCard: {
    width: 220,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: 160,
    position: 'relative',
  },
  adImage: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  urgentBadge: {
    backgroundColor: '#EF4444',
  },
  featuredBadge: {
    backgroundColor: '#F59E0B',
    top: 40,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adContent: {
    padding: 12,
  },
  adTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 20,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 11,
    marginLeft: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 11,
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  negotiable: {
    fontSize: 10,
    fontWeight: 'normal',
  },
  views: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewsText: {
    fontSize: 11,
  },
});
