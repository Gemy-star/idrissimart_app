import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Ad } from '@/services/api';
import { AppDispatch, RootState } from '@/store';
import { toggleFavorite } from '@/store/slices/adsSlice';
import { addToCartThunk } from '@/store/slices/cartSlice';
import { MAX_COMPARE_ITEMS, toggleCompare } from '@/store/slices/compareSlice';
import { addToWishlist, removeFromWishlist } from '@/store/slices/wishlistSlice';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Eye, MapPin, Scale, Share2, ShoppingCart, Tag } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

interface AdsSectionProps {
  title: string;
  ads: Ad[];
  onAdPress?: (ad: Ad) => void;
  onViewAll?: () => void;
}

interface AdSectionCardProps {
  ad: Ad;
  isArabic: boolean;
  onPress?: (ad: Ad) => void;
}

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

const AdSectionCard: React.FC<AdSectionCardProps> = ({ ad, isArabic, onPress }) => {
  const { colors } = useTheme();
  const { t } = useLanguage();
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
      Alert.alert('', t('ads.loginToWishlist'), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('auth.signIn'), onPress: () => router.push('/login') },
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
      Alert.alert('', t('ads.loginToCart'), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('auth.signIn'), onPress: () => router.push('/login') },
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

  return (
    <TouchableOpacity
      style={[styles.adCard, { backgroundColor: colors.surface }]}
      onPress={() => {
        if (onPress) onPress(ad);
        else router.push(`/ad/${ad.id}` as any);
      }}
      activeOpacity={0.85}
    >
      {/* Image */}
      <View style={styles.imageWrap}>
        <Image source={{ uri: ad.primary_image }} style={StyleSheet.absoluteFill} resizeMode="cover" />

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
            style={[styles.actionBtn, inCompare && { borderWidth: 2, borderColor: colors.primary }]}
            onPress={(e) => { e.stopPropagation?.(); handleCompare(); }}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Scale size={13} color={inCompare ? colors.primary : colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
            <Share2 size={13} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Body */}
      <View style={styles.cardBody}>
        <View style={[styles.catChip, { backgroundColor: colors.primary + '12' }]}>
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

      </View>

      {/* Action strip */}
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
    </TouchableOpacity>
  );
};

export const AdsSection: React.FC<AdsSectionProps> = ({
  title,
  ads,
  onAdPress,
  onViewAll,
}) => {
  const { colors } = useTheme();
  const { language, t } = useLanguage();
  const isArabic = language === 'ar';

  if (!ads || ads.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={[styles.header, isArabic && styles.headerRTL]}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {onViewAll && (
          <TouchableOpacity onPress={onViewAll}>
            <Text style={[styles.viewAll, { color: colors.primary }]}>{t('home.viewAll')}</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.adsList}>
        {ads.map((ad) => (
          <AdSectionCard key={ad.id} ad={ad} isArabic={isArabic} onPress={onAdPress} />
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
  headerRTL: { flexDirection: 'row-reverse' },
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
    gap: 12,
  },
  adCard: {
    width: 220,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 8,
    elevation: 4,
  },
  imageWrap: {
    width: '100%',
    height: 150,
    position: 'relative',
  },
  badgesTopLeft: { position: 'absolute', top: 8, left: 8, gap: 4 },
  overlayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  overlayBadgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
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
  cardBody: { padding: 10, gap: 5 },
  cardTitle: { fontSize: 13, fontWeight: '700', lineHeight: 19 },
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
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
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
  metaText: { fontSize: 11 },
  metaDivider: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#D1D5DB' },
  actionStrip: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
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
});
