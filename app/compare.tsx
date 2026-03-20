import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { AppDispatch, RootState } from '@/store';
import { clearCompare, toggleCompare } from '@/store/slices/compareSlice';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Scale, X } from 'lucide-react-native';
import React from 'react';
import {
    Dimensions,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const LABEL_COL = 100;
const AD_COL_WIDTH = Math.max(140, (SCREEN_WIDTH - LABEL_COL - 32) / 2);

type RowDef = {
    key: string;
    label: string;
    getValue: (ad: any, isArabic: boolean, t: (k: string) => string) => string;
};

const ROWS: RowDef[] = [
    {
        key: 'price',
        label: 'compare.price',
        getValue: (ad) => {
            const n = parseFloat(String(ad.price));
            return isNaN(n) ? String(ad.price) : n.toLocaleString();
        },
    },
    {
        key: 'negotiable',
        label: 'compare.negotiable',
        getValue: (ad, _, t) => ad.is_negotiable ? t('compare.yes') : t('compare.no'),
    },
    {
        key: 'category',
        label: 'compare.category',
        getValue: (ad, isArabic) => isArabic ? (ad.category?.name_ar ?? '') : (ad.category?.name ?? ''),
    },
    {
        key: 'location',
        label: 'compare.location',
        getValue: (ad) => ad.city ?? '',
    },
    {
        key: 'seller',
        label: 'compare.seller',
        getValue: (ad) => {
            const name = [ad.user?.first_name, ad.user?.last_name].filter(Boolean).join(' ');
            return name || ad.user?.username || '';
        },
    },
    {
        key: 'views',
        label: 'compare.views',
        getValue: (ad) => String(ad.views_count ?? 0),
    },
    {
        key: 'posted',
        label: 'compare.posted',
        getValue: (ad, isArabic) => {
            if (!ad.created_at) return '';
            return new Date(ad.created_at).toLocaleDateString(
                isArabic ? 'ar-SA' : 'en-US',
                { year: 'numeric', month: 'short', day: 'numeric' }
            );
        },
    },
];

export default function CompareScreen() {
    const { colors } = useTheme();
    const { t, language } = useLanguage();
    const isArabic = language === 'ar';
    const dispatch = useDispatch<AppDispatch>();
    const items = useSelector((s: RootState) => s.compare.items);

    const handleClearAll = () => {
        dispatch(clearCompare());
    };

    const handleRemove = (ad: any) => {
        dispatch(toggleCompare(ad));
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
                    <Text style={[styles.headerTitle, { color: colors.text }]}>{t('compare.title')}</Text>
                    {items.length > 0 && (
                        <View style={[styles.countBadge, { backgroundColor: colors.primary }]}>
                            <Text style={styles.countText}>{items.length}</Text>
                        </View>
                    )}
                </View>
                {items.length > 0 ? (
                    <TouchableOpacity onPress={handleClearAll} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Text style={[styles.clearAll, { color: '#EF4444' }]}>{t('compare.clearAll')}</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 48 }} />
                )}
            </View>

            {items.length === 0 ? (
                <View style={styles.center}>
                    <Scale size={56} color={colors.border} />
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('compare.empty')}</Text>
                    <Text style={[styles.emptySubtitle, { color: colors.fontSecondary }]}>{t('compare.emptySubtitle')}</Text>
                    <TouchableOpacity
                        style={[styles.browseBtn, { backgroundColor: colors.primary }]}
                        onPress={() => router.push('/(tabs)/ads')}
                    >
                        <Text style={styles.browseBtnText}>{t('navigation.ads')}</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View>
                            {/* Ad header cards row */}
                            <View style={[styles.adHeaderRow, isArabic && styles.adHeaderRowRTL]}>
                                {/* Label column spacer */}
                                <View style={[styles.labelCol, { backgroundColor: colors.background }]} />

                                {items.map((ad: any) => (
                                    <View
                                        key={ad.id}
                                        style={[styles.adHeaderCard, { width: AD_COL_WIDTH, backgroundColor: colors.surface, borderColor: colors.border }]}
                                    >
                                        <TouchableOpacity
                                            style={styles.removeAdBtn}
                                            onPress={() => handleRemove(ad)}
                                            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                                        >
                                            <X size={14} color={colors.fontSecondary} />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => router.push(`/ad/${ad.id}` as any)}
                                            activeOpacity={0.85}
                                        >
                                            <Image
                                                source={{ uri: ad.primary_image }}
                                                style={styles.adThumb}
                                                resizeMode="cover"
                                            />
                                            <View style={styles.adHeaderInfo}>
                                                <Text style={[styles.adHeaderTitle, { color: colors.text, textAlign: isArabic ? 'right' : 'left' }]} numberOfLines={2}>
                                                    {ad.title}
                                                </Text>
                                                {ad.user?.verification_status === 'verified' && (
                                                    <View style={[styles.verifiedRow, isArabic && styles.verifiedRowRTL]}>
                                                        <Ionicons name="checkmark-circle" size={12} color={colors.primary} />
                                                        <Text style={[styles.verifiedText, { color: colors.primary }]}>{t('adDetail.verified')}</Text>
                                                    </View>
                                                )}
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>

                            {/* Comparison rows */}
                            {ROWS.map((row, rowIdx) => (
                                <View
                                    key={row.key}
                                    style={[
                                        styles.tableRow,
                                        isArabic && styles.tableRowRTL,
                                        { borderBottomColor: colors.border },
                                        rowIdx % 2 === 0 && { backgroundColor: colors.surface + '60' },
                                    ]}
                                >
                                    {/* Label */}
                                    <View style={[styles.labelCol, { backgroundColor: 'transparent' }]}>
                                        <Text style={[styles.rowLabel, { color: colors.fontSecondary }]}>
                                            {t(row.label)}
                                        </Text>
                                    </View>

                                    {/* Ad values */}
                                    {items.map((ad: any) => {
                                        const values = items.map((a: any) => row.getValue(a, isArabic, t));
                                        const thisVal = row.getValue(ad, isArabic, t);
                                        const isBest = row.key === 'price'
                                            ? thisVal === values.reduce((min, v) => {
                                                const n = parseFloat(v.replace(/,/g, ''));
                                                const m = parseFloat(min.replace(/,/g, ''));
                                                return n < m ? v : min;
                                              }, values[0])
                                            : false;

                                        return (
                                            <View
                                                key={ad.id}
                                                style={[
                                                    styles.valueCell,
                                                    { width: AD_COL_WIDTH, borderLeftColor: colors.border },
                                                    isBest && { backgroundColor: colors.primary + '10' },
                                                ]}
                                            >
                                                <Text style={[
                                                    styles.valueText,
                                                    { color: isBest ? colors.primary : colors.text, textAlign: isArabic ? 'right' : 'left' },
                                                    isBest && styles.bestValue,
                                                ]}>
                                                    {thisVal || '—'}
                                                </Text>
                                                {isBest && items.length > 1 && (
                                                    <View style={[styles.bestBadge, { backgroundColor: colors.primary }]}>
                                                        <Text style={styles.bestBadgeText}>✓</Text>
                                                    </View>
                                                )}
                                            </View>
                                        );
                                    })}
                                </View>
                            ))}
                        </View>
                    </ScrollView>

                    {/* Add more hint */}
                    {items.length < 4 && (
                        <TouchableOpacity
                            style={[styles.addMoreRow, { borderColor: colors.border }]}
                            onPress={() => router.push('/(tabs)/ads')}
                        >
                            <Scale size={16} color={colors.primary} />
                            <Text style={[styles.addMoreText, { color: colors.primary }]}>
                                {t('compare.addMore')}
                            </Text>
                        </TouchableOpacity>
                    )}

                    <View style={{ height: 40 }} />
                </ScrollView>
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
    clearAll: { fontSize: 13, fontWeight: '600' },

    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
    emptyTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
    emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
    browseBtn: { marginTop: 8, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12 },
    browseBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

    // Table
    adHeaderRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
        gap: 8,
    },
    adHeaderRowRTL: { flexDirection: 'row-reverse' },

    labelCol: { width: LABEL_COL, paddingRight: 8 },

    adHeaderCard: {
        borderRadius: 12,
        borderWidth: StyleSheet.hairlineWidth,
        overflow: 'hidden',
        position: 'relative',
    },
    removeAdBtn: {
        position: 'absolute', top: 6, right: 6, zIndex: 1,
        width: 22, height: 22, borderRadius: 11,
        backgroundColor: 'rgba(0,0,0,0.35)',
        justifyContent: 'center', alignItems: 'center',
    },
    adThumb: { width: '100%', height: 100 },
    adHeaderInfo: { padding: 8, gap: 4 },
    adHeaderTitle: { fontSize: 12, fontWeight: '700', lineHeight: 16 },
    verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    verifiedRowRTL: { flexDirection: 'row-reverse' },
    verifiedText: { fontSize: 10, fontWeight: '600' },

    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        gap: 8,
        minHeight: 48,
    },
    tableRowRTL: { flexDirection: 'row-reverse' },
    rowLabel: { fontSize: 12, fontWeight: '600' },
    valueCell: {
        borderLeftWidth: StyleSheet.hairlineWidth,
        paddingHorizontal: 10,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        minHeight: 48,
    },
    valueText: { fontSize: 13, fontWeight: '600', flex: 1 },
    bestValue: { fontWeight: '800' },
    bestBadge: {
        width: 16, height: 16, borderRadius: 8,
        justifyContent: 'center', alignItems: 'center',
    },
    bestBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },

    addMoreRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginHorizontal: 16,
        marginTop: 20,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderStyle: 'dashed',
    },
    addMoreText: { fontSize: 14, fontWeight: '600' },
});
