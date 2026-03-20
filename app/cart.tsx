import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { AppDispatch, RootState } from '@/store';
import { CartItem, fetchCart, removeFromCartThunk } from '@/store/slices/cartSlice';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react-native';
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

export default function CartScreen() {
    const { colors } = useTheme();
    const { t, language } = useLanguage();
    const isArabic = language === 'ar';
    const dispatch = useDispatch<AppDispatch>();
    const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);
    const { items, loading } = useSelector((s: RootState) => s.cart);

    useEffect(() => {
        if (isAuthenticated) dispatch(fetchCart());
    }, [isAuthenticated]);

    const total = items.reduce((sum, item) => {
        const price = parseFloat(String(item.ad?.price ?? 0));
        return sum + (isNaN(price) ? 0 : price * (item.quantity || 1));
    }, 0);

    const handleRemove = (item: CartItem) => {
        Alert.alert('', t('cart.remove') + '?', [
            { text: t('common.cancel'), style: 'cancel' },
            {
                text: t('common.delete'),
                style: 'destructive',
                onPress: () => dispatch(removeFromCartThunk(item.id)),
            },
        ]);
    };

    const renderItem = ({ item }: { item: CartItem }) => {
        const ad = item.ad;
        if (!ad) return null;
        const priceNum = parseFloat(String(ad.price));
        const catName = isArabic ? ad.category?.name_ar : ad.category?.name;
        const itemTotal = isNaN(priceNum) ? 0 : priceNum * (item.quantity || 1);

        return (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <TouchableOpacity
                    style={styles.cardInner}
                    onPress={() => router.push(`/ad/${ad.id}` as any)}
                    activeOpacity={0.85}
                >
                    {/* Image */}
                    <View style={styles.imageWrap}>
                        <Image source={{ uri: ad.primary_image }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                    </View>

                    {/* Info */}
                    <View style={styles.info}>
                        {catName && (
                            <View style={[styles.catChip, { backgroundColor: colors.primary + '12' }]}>
                                <Text style={[styles.catChipText, { color: colors.primary }]} numberOfLines={1}>{catName}</Text>
                            </View>
                        )}
                        <Text style={[styles.title, { color: colors.text, textAlign: isArabic ? 'right' : 'left' }]} numberOfLines={2}>
                            {ad.title}
                        </Text>
                        <Text style={[styles.unitPrice, { color: colors.fontSecondary }]}>
                            {isNaN(priceNum) ? ad.price : priceNum.toLocaleString()} × {item.quantity || 1}
                        </Text>
                        <Text style={[styles.lineTotal, { color: colors.secondary }]}>
                            {itemTotal.toLocaleString()}
                        </Text>
                    </View>
                </TouchableOpacity>

                {/* Quantity + Remove */}
                <View style={[styles.actions, { borderTopColor: colors.border }, isArabic && styles.actionsRTL]}>
                    <View style={[styles.qtyRow, isArabic && styles.qtyRowRTL]}>
                        <TouchableOpacity
                            style={[styles.qtyBtn, { backgroundColor: colors.border }]}
                            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        >
                            <Minus size={14} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={[styles.qtyText, { color: colors.text }]}>{item.quantity || 1}</Text>
                        <TouchableOpacity
                            style={[styles.qtyBtn, { backgroundColor: colors.border }]}
                            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        >
                            <Plus size={14} color={colors.text} />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        style={[styles.removeBtn, { backgroundColor: '#FEE2E2' }]}
                        onPress={() => handleRemove(item)}
                    >
                        <Trash2 size={15} color="#EF4444" />
                        <Text style={styles.removeBtnText}>{t('cart.remove')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
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
                <View style={[styles.headerCenter, isArabic && styles.headerCenterRTL]}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>{t('cart.title')}</Text>
                    {items.length > 0 && (
                        <View style={[styles.countBadge, { backgroundColor: colors.primary }]}>
                            <Text style={styles.countText}>{items.length}</Text>
                        </View>
                    )}
                </View>
                <View style={{ width: 24 }} />
            </View>

            {!isAuthenticated ? (
                <View style={styles.center}>
                    <ShoppingCart size={56} color={colors.border} />
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('cart.empty')}</Text>
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                        onPress={() => router.push('/login')}
                    >
                        <Text style={styles.actionBtnText}>{t('auth.signIn')}</Text>
                    </TouchableOpacity>
                </View>
            ) : loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : items.length === 0 ? (
                <View style={styles.center}>
                    <ShoppingCart size={56} color={colors.border} />
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('cart.empty')}</Text>
                    <Text style={[styles.emptySubtitle, { color: colors.fontSecondary }]}>{t('cart.emptySubtitle')}</Text>
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                        onPress={() => router.push('/(tabs)/ads')}
                    >
                        <Text style={styles.actionBtnText}>{t('navigation.ads')}</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    <FlatList
                        data={items}
                        renderItem={renderItem}
                        keyExtractor={item => String(item.id)}
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={false}
                    />

                    {/* Total + Checkout */}
                    <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                        <View style={[styles.totalRow, isArabic && styles.totalRowRTL]}>
                            <Text style={[styles.totalLabel, { color: colors.fontSecondary }]}>
                                {t('cart.total')} ({items.length} {items.length === 1 ? t('cart.item') : t('cart.items')})
                            </Text>
                            <Text style={[styles.totalValue, { color: colors.secondary }]}>
                                {total.toLocaleString()}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.checkoutBtn, { backgroundColor: colors.primary }]}
                            activeOpacity={0.85}
                            onPress={() => Alert.alert('', isArabic ? 'قريباً' : 'Checkout coming soon')}
                        >
                            <ShoppingCart size={20} color="#fff" />
                            <Text style={styles.checkoutBtnText}>{t('cart.checkout')}</Text>
                        </TouchableOpacity>
                    </View>
                </>
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
    headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    headerCenterRTL: { flexDirection: 'row-reverse' },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    countBadge: { width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    countText: { color: '#fff', fontSize: 11, fontWeight: '700' },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
    emptyTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
    emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
    actionBtn: { marginTop: 8, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12 },
    actionBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
    list: { padding: 16, gap: 12, paddingBottom: 24 },

    card: {
        borderRadius: 14,
        borderWidth: StyleSheet.hairlineWidth,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    cardInner: { flexDirection: 'row' },
    imageWrap: { width: 110, height: 120, flexShrink: 0, position: 'relative' },
    info: { flex: 1, padding: 10, gap: 4, justifyContent: 'center' },
    catChip: { alignSelf: 'flex-start', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20 },
    catChipText: { fontSize: 10, fontWeight: '600' },
    title: { fontSize: 13, fontWeight: '700', lineHeight: 18 },
    unitPrice: { fontSize: 12 },
    lineTotal: { fontSize: 15, fontWeight: '800' },

    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderTopWidth: StyleSheet.hairlineWidth,
    },
    actionsRTL: { flexDirection: 'row-reverse' },
    qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    qtyRowRTL: { flexDirection: 'row-reverse' },
    qtyBtn: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    qtyText: { fontSize: 15, fontWeight: '700', minWidth: 20, textAlign: 'center' },
    removeBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
    },
    removeBtnText: { color: '#EF4444', fontSize: 12, fontWeight: '600' },

    // Footer
    footer: {
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: Platform.OS === 'ios' ? 12 : 16,
        borderTopWidth: StyleSheet.hairlineWidth,
        gap: 12,
    },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    totalRowRTL: { flexDirection: 'row-reverse' },
    totalLabel: { fontSize: 14 },
    totalValue: { fontSize: 22, fontWeight: '800' },
    checkoutBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 8, height: 52, borderRadius: 14,
    },
    checkoutBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
