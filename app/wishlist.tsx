import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { AppDispatch, RootState } from '@/store';
import { toggleFavorite } from '@/store/slices/adsSlice';
import { fetchWishlistItems, removeFromWishlist, WishlistItem } from '@/store/slices/wishlistSlice';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Eye, Heart, MapPin, Trash2 } from 'lucide-react-native';
import React, { useEffect } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

export default function WishlistScreen() {
    const { colors } = useTheme();
    const { t, language } = useLanguage();
    const isArabic = language === 'ar';
    const dispatch = useDispatch<AppDispatch>();
    const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);
    const { items, loading } = useSelector((s: RootState) => s.wishlist);

    useEffect(() => {
        if (isAuthenticated) dispatch(fetchWishlistItems());
    }, [isAuthenticated]);

    const handleRemove = (item: WishlistItem) => {
        Alert.alert('', t('wishlist.removeConfirm'), [
            { text: t('common.cancel'), style: 'cancel' },
            {
                text: t('common.delete'),
                style: 'destructive',
                onPress: async () => {
                    dispatch(removeFromWishlist(item.ad.id));
                    await dispatch(toggleFavorite(item.ad.id));
                },
            },
        ]);
    };

    const renderItem = ({ item }: { item: WishlistItem }) => {
        const ad = item.ad;
        const priceNum = parseFloat(String(ad.price));
        const catName = isArabic ? ad.category?.name_ar : ad.category?.name;
        const initials = (ad.user?.first_name?.[0] ?? ad.user?.username?.[0] ?? '?').toUpperCase();

        return (
            <TouchableOpacity
                style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => router.push(`/ad/${ad.id}` as any)}
                activeOpacity={0.85}
            >
                {/* Image */}
                <View style={styles.imageWrap}>
                    <Image source={{ uri: ad.primary_image }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                    {ad.is_urgent && (
                        <View style={[styles.badge, { backgroundColor: '#EF4444' }]}>
                            <Text style={styles.badgeText}>{t('home.urgent')}</Text>
                        </View>
                    )}
                </View>

                {/* Body */}
                <View style={styles.body}>
                    {catName && (
                        <View style={[styles.catChip, { backgroundColor: colors.primary + '12' }]}>
                            <Text style={[styles.catChipText, { color: colors.primary }]} numberOfLines={1}>{catName}</Text>
                        </View>
                    )}
                    <Text style={[styles.title, { color: colors.text, textAlign: isArabic ? 'right' : 'left' }]} numberOfLines={2}>
                        {ad.title}
                    </Text>
                    <Text style={[styles.price, { color: colors.secondary }]}>
                        {isNaN(priceNum) ? ad.price : priceNum.toLocaleString()}
                    </Text>
                    <View style={[styles.meta, isArabic && styles.metaRTL]}>
                        {!!ad.city && (
                            <View style={[styles.metaItem, isArabic && styles.metaItemRTL]}>
                                <MapPin size={11} color={colors.fontSecondary} />
                                <Text style={[styles.metaText, { color: colors.fontSecondary }]}>{ad.city}</Text>
                            </View>
                        )}
                        <View style={[styles.metaItem, isArabic && styles.metaItemRTL]}>
                            <Eye size={11} color={colors.fontSecondary} />
                            <Text style={[styles.metaText, { color: colors.fontSecondary }]}>{ad.views_count}</Text>
                        </View>
                    </View>
                </View>

                {/* Remove button */}
                <TouchableOpacity
                    style={[styles.removeBtn, { backgroundColor: '#FEE2E2' }]}
                    onPress={() => handleRemove(item)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <Trash2 size={16} color="#EF4444" />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['top']}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }, isArabic && styles.headerRTL]}>
                <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    {isArabic
                        ? <Ionicons name="chevron-forward" size={24} color={colors.text} />
                        : <Ionicons name="chevron-back" size={24} color={colors.text} />
                    }
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>{t('wishlist.title')}</Text>
                <View style={{ width: 24 }} />
            </View>

            {!isAuthenticated ? (
                <View style={styles.center}>
                    <Heart size={56} color={colors.border} />
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('wishlist.empty')}</Text>
                    <Text style={[styles.emptySubtitle, { color: colors.fontSecondary }]}>{t('auth.login')}</Text>
                    <TouchableOpacity
                        style={[styles.loginBtn, { backgroundColor: colors.primary }]}
                        onPress={() => router.push('/login')}
                    >
                        <Text style={styles.loginBtnText}>{t('auth.signIn')}</Text>
                    </TouchableOpacity>
                </View>
            ) : loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : items.length === 0 ? (
                <View style={styles.center}>
                    <Heart size={56} color={colors.border} />
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('wishlist.empty')}</Text>
                    <Text style={[styles.emptySubtitle, { color: colors.fontSecondary }]}>{t('wishlist.emptySubtitle')}</Text>
                    <TouchableOpacity
                        style={[styles.loginBtn, { backgroundColor: colors.primary }]}
                        onPress={() => router.push('/(tabs)/ads')}
                    >
                        <Text style={styles.loginBtnText}>{t('home.viewAll')}</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={items}
                    renderItem={renderItem}
                    keyExtractor={item => String(item.id)}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'android' ? 12 : 8,
        paddingBottom: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    headerRTL: { flexDirection: 'row-reverse' },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
    emptyTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
    emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
    loginBtn: { marginTop: 8, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12 },
    loginBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
    list: { padding: 16, gap: 12 },

    card: {
        flexDirection: 'row',
        borderRadius: 14,
        borderWidth: StyleSheet.hairlineWidth,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    imageWrap: { width: 110, height: 120, position: 'relative', flexShrink: 0 },
    badge: {
        position: 'absolute', top: 6, left: 6,
        paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
    },
    badgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
    body: { flex: 1, padding: 10, gap: 4, justifyContent: 'center' },
    catChip: {
        alignSelf: 'flex-start',
        paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20,
    },
    catChipText: { fontSize: 10, fontWeight: '600' },
    title: { fontSize: 13, fontWeight: '700', lineHeight: 18 },
    price: { fontSize: 15, fontWeight: '800' },
    meta: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
    metaRTL: { flexDirection: 'row-reverse' },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    metaItemRTL: { flexDirection: 'row-reverse' },
    metaText: { fontSize: 11 },
    removeBtn: {
        width: 36, justifyContent: 'center', alignItems: 'center',
        borderRadius: 0,
    },
});
