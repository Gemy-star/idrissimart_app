import { API_ENDPOINTS } from '@/config/api.config';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { AdDetail } from '@/services/api';
import apiClient from '@/services/apiClient';
import { AppDispatch, RootState } from '@/store';
import { toggleFavorite } from '@/store/slices/adsSlice';
import { addToCartThunk } from '@/store/slices/cartSlice';
import { MAX_COMPARE_ITEMS, toggleCompare } from '@/store/slices/compareSlice';
import { CustomField } from '@/store/slices/customFieldsSlice';
import { addToWishlist, removeFromWishlist } from '@/store/slices/wishlistSlice';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Calendar, ChevronLeft, ChevronRight, Eye, Heart, MapPin, MessageCircle, Scale, Share2, ShoppingCart, Star, Tag } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Image,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Platform,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
    return (
        <View style={{ flexDirection: 'row', gap: 2 }}>
            {[1, 2, 3, 4, 5].map(i => (
                <Star
                    key={i}
                    size={size}
                    color={i <= Math.round(rating) ? '#F59E0B' : '#D1D5DB'}
                    fill={i <= Math.round(rating) ? '#F59E0B' : 'transparent'}
                />
            ))}
        </View>
    );
}

export default function AdDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { colors } = useTheme();
    const { t, language } = useLanguage();
    const isArabic = language === 'ar';
    const dispatch = useDispatch<AppDispatch>();
    const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);
    const compareItems = useSelector((s: RootState) => s.compare.items);
    const cartItems = useSelector((s: RootState) => s.cart.items);

    const [ad, setAd] = useState<AdDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [favorited, setFavorited] = useState(false);
    const [favLoading, setFavLoading] = useState(false);
    const [cartAdded, setCartAdded] = useState(false);
    const [imageIndex, setImageIndex] = useState(0);
    const [customFieldDefs, setCustomFieldDefs] = useState<CustomField[]>([]);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        setError(false);
        apiClient
            .get(API_ENDPOINTS.ADS.DETAIL(Number(id)))
            .then(res => {
                setAd(res.data);
                setFavorited(res.data.is_favorited ?? false);
                setCartAdded(cartItems.some((i: any) => (i.ad?.id ?? i.ad) === Number(id)));
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        const categoryId = (ad as any)?.category?.id ?? (ad as any)?.category_id;
        if (!categoryId) return;
        apiClient
            .get(API_ENDPOINTS.CUSTOM_FIELDS.BY_CATEGORY, { params: { category_id: categoryId } })
            .then(res => {
                const list: CustomField[] = Array.isArray(res.data)
                    ? res.data
                    : Array.isArray(res.data?.results)
                    ? res.data.results
                    : [];
                setCustomFieldDefs(list);
            })
            .catch(() => setCustomFieldDefs([]));
    }, [(ad as any)?.category?.id ?? (ad as any)?.category_id]);

    const inCompare = ad ? compareItems.some((a: any) => a.id === ad.id) : false;

    const handleFavorite = async () => {
        if (!isAuthenticated) {
            Alert.alert('', t('adDetail.loginToFavorite'), [
                { text: t('common.cancel'), style: 'cancel' },
                { text: t('auth.signIn'), onPress: () => router.push('/login') },
            ]);
            return;
        }
        setFavLoading(true);
        const next = !favorited;
        setFavorited(next);
        try {
            await dispatch(toggleFavorite(Number(id)));
            if (next && ad) {
                dispatch(addToWishlist({ id: Date.now(), ad, added_at: new Date().toISOString() }));
            } else {
                dispatch(removeFromWishlist(Number(id)));
            }
        } catch {
            setFavorited(!next);
        } finally {
            setFavLoading(false);
        }
    };

    const handleCompare = () => {
        if (!ad) return;
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
        const result = await dispatch(addToCartThunk({ adId: Number(id) }));
        if (addToCartThunk.rejected.match(result)) {
            setCartAdded(false);
            Alert.alert('', t('ads.cartError'));
        }
    };

    const handleShare = async () => {
        if (!ad) return;
        try {
            await Share.share({
                title: ad.title,
                message: `${ad.title} - $${parseFloat(ad.price).toFixed(0)}\n${ad.city}`,
            });
        } catch {}
    };

    const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
        setImageIndex(idx);
    };

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
        });

    const sellerName = ad
        ? [ad.user.first_name, ad.user.last_name].filter(Boolean).join(' ') || ad.user.username
        : '';

    const allImages = ad
        ? ad.images?.length
            ? ad.images.sort((a, b) => a.order - b.order).map(i => i.image)
            : [ad.primary_image]
        : [];

    const customFieldEntries = ad?.custom_fields
        ? Object.entries(ad.custom_fields).filter(([, v]) => v)
        : [];

    if (loading) {
        return (
            <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
                <View style={styles.centerLoader}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (error || !ad) {
        return (
            <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
                <View style={styles.centerLoader}>
                    <Ionicons name="alert-circle-outline" size={48} color={colors.border} />
                    <Text style={[styles.errorText, { color: colors.fontSecondary }]}>
                        {t('adDetail.loadError')}
                    </Text>
                    <TouchableOpacity
                        style={[styles.retryBtn, { backgroundColor: colors.primary }]}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.retryText}>{t('common.back')}</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['bottom']}>
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>

                {/* ── Image Gallery ── */}
                <View style={styles.galleryWrap}>
                    <FlatList
                        data={allImages}
                        keyExtractor={(_, i) => String(i)}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        renderItem={({ item }) => (
                            <Image
                                source={{ uri: item }}
                                style={styles.galleryImage}
                                resizeMode="cover"
                            />
                        )}
                    />

                    {/* Overlay: back + share + favorite */}
                    <SafeAreaView style={styles.galleryOverlay} edges={['top']}>
                        <TouchableOpacity
                            style={[styles.overlayBtn, { backgroundColor: 'rgba(0,0,0,0.45)' }]}
                            onPress={() => router.back()}
                        >
                            {isArabic
                                ? <ChevronRight size={22} color="#fff" />
                                : <ChevronLeft size={22} color="#fff" />
                            }
                        </TouchableOpacity>
                        <View style={styles.overlayRight}>
                            <TouchableOpacity
                                style={[styles.overlayBtn, { backgroundColor: 'rgba(0,0,0,0.45)' }]}
                                onPress={handleShare}
                            >
                                <Share2 size={18} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.overlayBtn,
                                    { backgroundColor: 'rgba(0,0,0,0.45)' },
                                    inCompare && { borderWidth: 2, borderColor: '#fff' },
                                ]}
                                onPress={handleCompare}
                            >
                                <Scale size={18} color={inCompare ? colors.primary : '#fff'} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.overlayBtn, { backgroundColor: 'rgba(0,0,0,0.45)' }]}
                                onPress={handleFavorite}
                                disabled={favLoading}
                            >
                                <Heart
                                    size={18}
                                    color={favorited ? '#EF4444' : '#fff'}
                                    fill={favorited ? '#EF4444' : 'transparent'}
                                />
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>

                    {/* Pagination dots */}
                    {allImages.length > 1 && (
                        <View style={styles.dotsRow}>
                            {allImages.map((_, i) => (
                                <View
                                    key={i}
                                    style={[
                                        styles.dot,
                                        {
                                            backgroundColor: i === imageIndex ? '#fff' : 'rgba(255,255,255,0.45)',
                                            width: i === imageIndex ? 18 : 6,
                                        },
                                    ]}
                                />
                            ))}
                        </View>
                    )}

                    {/* Image counter */}
                    <View style={[styles.imageCounter, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                        <Text style={styles.imageCounterText}>
                            {imageIndex + 1}/{allImages.length}
                        </Text>
                    </View>

                    {/* Badges */}
                    <View style={[styles.badgesRow, isArabic && styles.badgesRowRTL]}>
                        {ad.is_urgent && (
                            <View style={[styles.badge, { backgroundColor: '#EF4444' }]}>
                                <Text style={styles.badgeText}>{t('adDetail.urgent')}</Text>
                            </View>
                        )}
                        {ad.is_highlighted && (
                            <View style={[styles.badge, { backgroundColor: '#F59E0B' }]}>
                                <Star size={9} color="#fff" fill="#fff" />
                                <Text style={styles.badgeText}> {t('adDetail.featured')}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* ── Content ── */}
                <View style={[styles.content, { backgroundColor: colors.background }]}>

                    {/* Title + Price */}
                    <View style={[styles.titleRow, isArabic && styles.titleRowRTL]}>
                        <Text style={[styles.title, { color: colors.text, textAlign: isArabic ? 'right' : 'left' }]} numberOfLines={3}>
                            {ad.title}
                        </Text>
                        <View style={styles.priceBlock}>
                            <Text style={[styles.price, { color: colors.secondary }]}>
                                ${parseFloat(ad.price).toFixed(0)}
                            </Text>
                            {ad.is_negotiable && (
                                <Text style={[styles.negotiable, { color: colors.primary }]}>
                                    {t('adDetail.negotiable')}
                                </Text>
                            )}
                        </View>
                    </View>

                    {/* Quick meta row */}
                    <View style={[styles.metaRow, isArabic && styles.metaRowRTL]}>
                        <View style={styles.metaItem}>
                            <MapPin size={13} color={colors.fontSecondary} />
                            <Text style={[styles.metaText, { color: colors.fontSecondary }]}>{ad.city}</Text>
                        </View>
                        <View style={styles.metaDot} />
                        <View style={styles.metaItem}>
                            <Eye size={13} color={colors.fontSecondary} />
                            <Text style={[styles.metaText, { color: colors.fontSecondary }]}>
                                {ad.views_count} {t('adDetail.views')}
                            </Text>
                        </View>
                        <View style={styles.metaDot} />
                        <View style={styles.metaItem}>
                            <Calendar size={13} color={colors.fontSecondary} />
                            <Text style={[styles.metaText, { color: colors.fontSecondary }]}>
                                {formatDate(ad.created_at)}
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    {/* ── Description ── */}
                    {!!ad.description && (
                        <>
                            <SectionTitle title={t('adDetail.description')} colors={colors} isArabic={isArabic} />
                            <Text style={[styles.description, { color: colors.text, textAlign: isArabic ? 'right' : 'left' }]}>
                                {ad.description}
                            </Text>
                            <View style={[styles.divider, { backgroundColor: colors.border }]} />
                        </>
                    )}

                    {/* ── Specifications / Custom Fields ── */}
                    {customFieldEntries.length > 0 && (
                        <>
                            <SectionTitle title={t('adDetail.specifications')} colors={colors} isArabic={isArabic} />
                            <View style={[styles.specsGrid, isArabic && styles.specsGridRTL]}>
                                {customFieldEntries.map(([key, value]) => {
                                    const fieldDef = customFieldDefs.find(f => f.name === key);
                                    const label = fieldDef
                                        ? (isArabic ? fieldDef.label_ar : fieldDef.label_en)
                                        : key;
                                    const optionDef = fieldDef?.options?.find(o => o.value === value);
                                    const displayValue = optionDef
                                        ? (isArabic ? optionDef.label_ar : optionDef.label_en)
                                        : value;
                                    return (
                                        <View key={key} style={[styles.specItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                            <Text style={[styles.specKey, { color: colors.fontSecondary }]}>{label}</Text>
                                            <Text style={[styles.specValue, { color: colors.text }]}>{displayValue}</Text>
                                        </View>
                                    );
                                })}
                            </View>
                            <View style={[styles.divider, { backgroundColor: colors.border }]} />
                        </>
                    )}

                    {/* ── Details ── */}
                    <SectionTitle title={t('adDetail.details')} colors={colors} isArabic={isArabic} />
                    <View style={[styles.detailsList, { borderColor: colors.border }]}>
                        <DetailRow
                            icon={<Tag size={15} color={colors.primary} />}
                            label={t('adDetail.category')}
                            value={isArabic ? ad.category.name_ar : ad.category.name}
                            colors={colors}
                            isArabic={isArabic}
                        />
                        <DetailRow
                            icon={<MapPin size={15} color={colors.primary} />}
                            label={t('adDetail.location')}
                            value={ad.city}
                            colors={colors}
                            isArabic={isArabic}
                        />
                        {!!ad.address && (
                            <DetailRow
                                icon={<MapPin size={15} color={colors.primary} />}
                                label={t('adDetail.address')}
                                value={ad.address}
                                colors={colors}
                                isArabic={isArabic}
                            />
                        )}
                        <DetailRow
                            icon={<Calendar size={15} color={colors.primary} />}
                            label={t('adDetail.postedOn')}
                            value={formatDate(ad.created_at)}
                            colors={colors}
                            isArabic={isArabic}
                            isLast
                        />
                    </View>
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    {/* ── Seller ── */}
                    <SectionTitle title={t('adDetail.seller')} colors={colors} isArabic={isArabic} />
                    <View style={[styles.sellerCard, { backgroundColor: colors.surface, borderColor: colors.border }, isArabic && styles.sellerCardRTL]}>
                        {ad.user.profile_image ? (
                            <Image source={{ uri: ad.user.profile_image }} style={styles.sellerAvatar} />
                        ) : (
                            <View style={[styles.sellerAvatarFallback, { backgroundColor: colors.primary + '20' }]}>
                                <Ionicons name="person" size={28} color={colors.primary} />
                            </View>
                        )}
                        <View style={[styles.sellerInfo, isArabic && { alignItems: 'flex-end' }]}>
                            <View style={[styles.sellerNameRow, isArabic && styles.sellerNameRowRTL]}>
                                <Text style={[styles.sellerName, { color: colors.text }]}>{sellerName}</Text>
                                {ad.user.verification_status === 'verified' && (
                                    <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                                )}
                                {ad.user.is_premium && (
                                    <View style={[styles.premiumBadge, { backgroundColor: '#F59E0B' }]}>
                                        <Text style={styles.premiumText}>{t('adDetail.premium')}</Text>
                                    </View>
                                )}
                            </View>
                            {(ad.user.average_rating ?? 0) > 0 && (
                                <View style={[styles.sellerRating, isArabic && styles.sellerRatingRTL]}>
                                    <StarRating rating={ad.user.average_rating} />
                                    <Text style={[styles.sellerRatingText, { color: colors.fontSecondary }]}>
                                        {ad.user.average_rating?.toFixed(1)}
                                    </Text>
                                </View>
                            )}
                            <Text style={[styles.sellerType, { color: colors.fontSecondary }]}>
                                {isArabic
                                    ? (ad.user.profile_type === 'commercial' ? 'تجاري' : 'فردي')
                                    : (ad.user.profile_type === 'commercial' ? 'Commercial' : 'Individual')
                                }
                            </Text>
                        </View>
                    </View>
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    {/* ── Reviews ── */}
                    <SectionTitle
                        title={`${t('adDetail.reviews')} ${ad.rating_count > 0 ? `(${ad.rating_count})` : ''}`}
                        colors={colors}
                        isArabic={isArabic}
                        right={
                            ad.rating_count > 0
                                ? <View style={[styles.overallRating, isArabic && styles.overallRatingRTL]}>
                                    <StarRating rating={ad.rating} size={13} />
                                    <Text style={[styles.overallScore, { color: colors.text }]}>{ad.rating?.toFixed(1)}</Text>
                                  </View>
                                : undefined
                        }
                    />
                    {ad.reviews?.length > 0 ? (
                        ad.reviews.map(review => (
                            <View key={review.id} style={[styles.reviewCard, { backgroundColor: colors.surface, borderColor: colors.border }, isArabic && styles.reviewCardRTL]}>
                                <View style={[styles.reviewHeader, isArabic && styles.reviewHeaderRTL]}>
                                    {review.reviewer_image ? (
                                        <Image source={{ uri: review.reviewer_image }} style={styles.reviewAvatar} />
                                    ) : (
                                        <View style={[styles.reviewAvatarFallback, { backgroundColor: colors.border }]}>
                                            <Ionicons name="person" size={14} color={colors.fontSecondary} />
                                        </View>
                                    )}
                                    <View style={[styles.reviewMeta, isArabic && { alignItems: 'flex-end' }]}>
                                        <Text style={[styles.reviewerName, { color: colors.text }]}>{review.reviewer_name}</Text>
                                        <View style={[styles.reviewRatingRow, isArabic && styles.reviewRatingRowRTL]}>
                                            <StarRating rating={review.rating} size={11} />
                                            <Text style={[styles.reviewDate, { color: colors.fontSecondary }]}>
                                                {formatDate(review.created_at)}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                {!!review.comment && (
                                    <Text style={[styles.reviewComment, { color: colors.text, textAlign: isArabic ? 'right' : 'left' }]}>
                                        {review.comment}
                                    </Text>
                                )}
                            </View>
                        ))
                    ) : (
                        <Text style={[styles.noReviews, { color: colors.fontSecondary }]}>
                            {t('adDetail.noReviews')}
                        </Text>
                    )}

                    {/* Bottom spacer for FAB */}
                    <View style={{ height: 90 }} />
                </View>
            </ScrollView>

            {/* ── Bottom Bar ── */}
            <View style={[styles.bottomBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                <View style={[styles.bottomBtns, isArabic && styles.bottomBtnsRTL]}>
                    {ad.is_cart_enabled && (
                        <TouchableOpacity
                            style={[
                                styles.cartDetailBtn,
                                cartAdded
                                    ? { backgroundColor: colors.primary + '15', borderColor: colors.primary, borderWidth: 1 }
                                    : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
                            ]}
                            activeOpacity={0.85}
                            onPress={handleAddToCart}
                        >
                            <ShoppingCart size={20} color={cartAdded ? colors.primary : colors.text} />
                            <Text style={[styles.cartDetailBtnText, { color: cartAdded ? colors.primary : colors.text }]}>
                                {cartAdded ? t('ads.addedToCart') : t('ads.addToCart')}
                            </Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={[styles.contactBtn, { backgroundColor: colors.primary, flex: ad.is_cart_enabled ? 1 : undefined }]}
                        activeOpacity={0.85}
                        onPress={() => {
                            if (!isAuthenticated) {
                                Alert.alert('', t('createAd.loginRequiredMessage'), [
                                    { text: t('common.cancel'), style: 'cancel' },
                                    { text: t('createAd.loginBtn'), onPress: () => router.push('/login') },
                                ]);
                                return;
                            }
                            Alert.alert('', isArabic ? 'سيتم فتح المحادثة قريباً' : 'Chat coming soon');
                        }}
                    >
                        <MessageCircle size={20} color="#fff" />
                        <Text style={styles.contactBtnText}>{t('adDetail.contactSeller')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

// ── Section Title Helper ─────────────────────────────────────────────────────
function SectionTitle({
    title, colors, isArabic, right,
}: {
    title: string; colors: any; isArabic: boolean; right?: React.ReactNode;
}) {
    return (
        <View style={[styles.sectionTitleRow, isArabic && styles.sectionTitleRowRTL]}>
            <Text style={[styles.sectionTitle, { color: colors.text, textAlign: isArabic ? 'right' : 'left' }]}>
                {title}
            </Text>
            {right}
        </View>
    );
}

// ── Detail Row Helper ────────────────────────────────────────────────────────
function DetailRow({
    icon, label, value, colors, isArabic, isLast = false,
}: {
    icon: React.ReactNode; label: string; value: string;
    colors: any; isArabic: boolean; isLast?: boolean;
}) {
    return (
        <View style={[
            styles.detailRow,
            isArabic && styles.detailRowRTL,
            { borderBottomColor: colors.border },
            isLast && { borderBottomWidth: 0 },
        ]}>
            <View style={[styles.detailIconLabel, isArabic && styles.detailIconLabelRTL]}>
                {icon}
                <Text style={[styles.detailLabel, { color: colors.fontSecondary }]}>{label}</Text>
            </View>
            <Text style={[styles.detailValue, { color: colors.text }]}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
    centerLoader: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16, padding: 32 },
    errorText: { fontSize: 15, textAlign: 'center' },
    retryBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
    retryText: { color: '#fff', fontWeight: '700' },

    // Gallery
    galleryWrap: { position: 'relative', width: SCREEN_WIDTH, height: SCREEN_WIDTH * 0.72 },
    galleryImage: { width: SCREEN_WIDTH, height: SCREEN_WIDTH * 0.72 },
    galleryOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: 12,
        paddingTop: Platform.OS === 'android' ? 12 : 4,
    },
    overlayBtn: {
        width: 38, height: 38,
        borderRadius: 19,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlayRight: { flexDirection: 'row', gap: 8 },
    dotsRow: {
        position: 'absolute',
        bottom: 12,
        left: 0, right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
    },
    dot: { height: 6, borderRadius: 3 },
    imageCounter: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    imageCounterText: { color: '#fff', fontSize: 11, fontWeight: '600' },
    badgesRow: { position: 'absolute', bottom: 12, left: 12, flexDirection: 'row', gap: 6 },
    badgesRowRTL: { left: undefined, right: 12 },
    badge: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 8, paddingVertical: 4,
        borderRadius: 6,
    },
    badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },

    // Content
    content: { borderTopLeftRadius: 20, borderTopRightRadius: 20, marginTop: -16, padding: 20 },

    // Title + price
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 10 },
    titleRowRTL: { flexDirection: 'row-reverse' },
    title: { flex: 1, fontSize: 20, fontWeight: '800', lineHeight: 28 },
    priceBlock: { alignItems: 'flex-end' },
    price: { fontSize: 22, fontWeight: '800' },
    negotiable: { fontSize: 11, fontWeight: '600', marginTop: 2 },

    // Meta row
    metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
    metaRowRTL: { flexDirection: 'row-reverse' },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { fontSize: 12 },
    metaDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#D1D5DB' },

    divider: { height: StyleSheet.hairlineWidth, marginVertical: 16 },

    // Description
    description: { fontSize: 14, lineHeight: 22, marginBottom: 4 },

    // Specs
    specsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 4 },
    specsGridRTL: { flexDirection: 'row-reverse' },
    specItem: {
        borderWidth: 1, borderRadius: 10,
        paddingHorizontal: 12, paddingVertical: 8,
        minWidth: 100,
    },
    specKey: { fontSize: 11, fontWeight: '600', marginBottom: 2, textTransform: 'uppercase' },
    specValue: { fontSize: 13, fontWeight: '700' },

    // Section title
    sectionTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitleRowRTL: { flexDirection: 'row-reverse' },
    sectionTitle: { fontSize: 16, fontWeight: '700' },

    // Details list
    detailsList: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 14, overflow: 'hidden', marginBottom: 4 },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    detailRowRTL: { flexDirection: 'row-reverse' },
    detailIconLabel: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    detailIconLabelRTL: { flexDirection: 'row-reverse' },
    detailLabel: { fontSize: 13 },
    detailValue: { fontSize: 13, fontWeight: '600', maxWidth: '55%', textAlign: 'right' },

    // Seller
    sellerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        padding: 14,
        borderWidth: 1,
        borderRadius: 14,
        marginBottom: 4,
    },
    sellerCardRTL: { flexDirection: 'row-reverse' },
    sellerAvatar: { width: 56, height: 56, borderRadius: 28 },
    sellerAvatarFallback: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
    sellerInfo: { flex: 1, gap: 3 },
    sellerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    sellerNameRowRTL: { flexDirection: 'row-reverse' },
    sellerName: { fontSize: 15, fontWeight: '700' },
    premiumBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    premiumText: { color: '#fff', fontSize: 9, fontWeight: '700' },
    sellerRating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    sellerRatingRTL: { flexDirection: 'row-reverse' },
    sellerRatingText: { fontSize: 12 },
    sellerType: { fontSize: 12 },

    // Overall rating
    overallRating: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    overallRatingRTL: { flexDirection: 'row-reverse' },
    overallScore: { fontSize: 14, fontWeight: '700' },

    // Reviews
    reviewCard: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
    },
    reviewCardRTL: {},
    reviewHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
    reviewHeaderRTL: { flexDirection: 'row-reverse' },
    reviewAvatar: { width: 36, height: 36, borderRadius: 18 },
    reviewAvatarFallback: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    reviewMeta: { flex: 1, gap: 3 },
    reviewerName: { fontSize: 13, fontWeight: '700' },
    reviewRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    reviewRatingRowRTL: { flexDirection: 'row-reverse' },
    reviewDate: { fontSize: 11 },
    reviewComment: { fontSize: 13, lineHeight: 20 },
    noReviews: { fontSize: 14, textAlign: 'center', paddingVertical: 16 },

    // Bottom bar
    bottomBar: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 8 : 12,
        borderTopWidth: StyleSheet.hairlineWidth,
    },
    bottomBtns: { flexDirection: 'row', gap: 10, alignItems: 'center' },
    bottomBtnsRTL: { flexDirection: 'row-reverse' },
    contactBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 52,
        borderRadius: 14,
        flex: 1,
        paddingHorizontal: 16,
    },
    contactBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
    cartDetailBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        height: 52,
        borderRadius: 14,
        flex: 1,
        paddingHorizontal: 12,
    },
    cartDetailBtnText: { fontSize: 13, fontWeight: '700' },
});
