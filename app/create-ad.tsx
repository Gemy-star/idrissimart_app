import { API_ENDPOINTS } from '@/config/api.config';
import PhoneVerificationModal from '@/components/PhoneVerificationModal';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Category, api } from '@/services/api';
import apiClient from '@/services/apiClient';
import { RootState } from '@/store';
import { faToIonicon } from '@/utils/iconMap';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

const MAX_IMAGES = 5;

interface FormState {
    title: string;
    description: string;
    price: string;
    is_negotiable: boolean;
    category_id: number | null;
    category_name: string;
    category_name_ar: string;
    sub_category_id: number | null;
    city: string;
}

const INITIAL_FORM: FormState = {
    title: '',
    description: '',
    price: '',
    is_negotiable: false,
    category_id: null,
    category_name: '',
    category_name_ar: '',
    sub_category_id: null,
    city: '',
};

export default function CreateAdScreen() {
    const { colors } = useTheme();
    const { t, language } = useLanguage();
    const isArabic = language === 'ar';
    const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);
    const user = useSelector((s: RootState) => s.auth.user);

    const [form, setForm] = useState<FormState>(INITIAL_FORM);
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [submitting, setSubmitting] = useState(false);
    const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
    const [showVerifyModal, setShowVerifyModal] = useState(false);

    // Category modal state
    const [catModalVisible, setCatModalVisible] = useState(false);
    const [rootCategories, setRootCategories] = useState<Category[]>([]);
    const [rootCatsLoading, setRootCatsLoading] = useState(false);
    const [selectedRootCat, setSelectedRootCat] = useState<Category | null>(null);
    const [catDetailLoading, setCatDetailLoading] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]).start();
    }, []);

    // Auth guard — show alert and redirect to login
    useEffect(() => {
        if (!isAuthenticated) {
            Alert.alert(
                t('createAd.loginRequired'),
                t('createAd.loginRequiredMessage'),
                [
                    {
                        text: t('common.cancel'),
                        style: 'cancel',
                        onPress: () => router.back(),
                    },
                    {
                        text: t('createAd.loginBtn'),
                        onPress: () => router.replace('/login'),
                    },
                ],
                { cancelable: false }
            );
        }
    }, [isAuthenticated]);

    // Load root categories
    useEffect(() => {
        setRootCatsLoading(true);
        apiClient
            .get(API_ENDPOINTS.CATEGORIES.ROOT, { params: { section_type: 'classified' } })
            .then(res => {
                const payload = res.data;
                const list: Category[] = Array.isArray(payload)
                    ? payload
                    : Array.isArray(payload?.results)
                    ? payload.results
                    : [];
                setRootCategories(list);
            })
            .catch(() => setRootCategories([]))
            .finally(() => setRootCatsLoading(false));
    }, []);

    // ── Category handlers ──
    const handleRootCategoryPress = async (cat: Category) => {
        if ((cat.subcategories_count ?? 0) > 0) {
            setCatDetailLoading(true);
            const res = await api.getCategoryDetail(cat.id);
            setCatDetailLoading(false);
            if (res.success && res.data && (res.data.subcategories?.length ?? 0) > 0) {
                setSelectedRootCat(res.data);
                return;
            }
        }
        setForm(prev => ({
            ...prev,
            category_id: cat.id,
            category_name: cat.name,
            category_name_ar: cat.name_ar,
            sub_category_id: null,
        }));
        setCatModalVisible(false);
        setSelectedRootCat(null);
    };

    const handleSubCategoryPress = (sub: Category) => {
        setForm(prev => ({
            ...prev,
            category_id: selectedRootCat!.id,
            sub_category_id: sub.id,
            category_name: sub.name,
            category_name_ar: sub.name_ar,
        }));
        setCatModalVisible(false);
        setSelectedRootCat(null);
    };

    const closeCatModal = () => {
        setCatModalVisible(false);
        setSelectedRootCat(null);
    };

    // ── Image picker ──
    const pickImage = async () => {
        if (images.length >= MAX_IMAGES) {
            Alert.alert('', t('createAd.maxImages'));
            return;
        }
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(t('common.error'), t('createAd.imagePickerError'));
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsMultipleSelection: true,
            selectionLimit: MAX_IMAGES - images.length,
            quality: 0.8,
            allowsEditing: false,
        });
        if (!result.canceled) {
            setImages(prev => [...prev, ...result.assets].slice(0, MAX_IMAGES));
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    // ── Validation ──
    const errors: Record<string, string> = {};
    if (touched.title && !form.title.trim()) errors.title = t('createAd.fieldRequired');
    if (touched.description && !form.description.trim()) errors.description = t('createAd.fieldRequired');
    if (touched.price && !form.price.trim()) errors.price = t('createAd.fieldRequired');
    if (touched.category_id && !form.category_id) errors.category_id = t('createAd.fieldRequired');
    if (touched.city && !form.city.trim()) errors.city = t('createAd.fieldRequired');

    const touchAll = () => {
        setTouched({ title: true, description: true, price: true, category_id: true, city: true });
    };

    const isValid =
        form.title.trim() &&
        form.description.trim() &&
        form.price.trim() &&
        form.category_id &&
        form.city.trim();

    // ── Submit ──
    const handleSubmit = async () => {
        touchAll();
        if (!isValid) return;

        // Gate behind phone verification
        if (!user?.is_mobile_verified) {
            setShowVerifyModal(true);
            return;
        }

        setSubmitting(true);
        try {
            const effectiveCatId = form.sub_category_id ?? form.category_id;
            const formData = new FormData();
            formData.append('title', form.title.trim());
            formData.append('description', form.description.trim());
            formData.append('price', String(parseFloat(form.price)));
            formData.append('is_negotiable', String(form.is_negotiable));
            formData.append('category', String(effectiveCatId));
            formData.append('city', form.city.trim());
            images.forEach((img, index) => {
                const ext = img.uri.split('.').pop() ?? 'jpg';
                formData.append('images', {
                    uri: img.uri,
                    name: `image_${index}.${ext}`,
                    type: img.mimeType ?? `image/${ext}`,
                } as any);
            });
            await apiClient.post(API_ENDPOINTS.ADS.CREATE, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            Alert.alert(t('createAd.successTitle'), t('createAd.success'), [
                { text: t('common.done'), onPress: () => router.back() },
            ]);
        } catch {
            Alert.alert(t('common.error'), t('createAd.submitError'));
        } finally {
            setSubmitting(false);
        }
    };

    const selectedCatLabel = form.category_id
        ? (isArabic ? form.category_name_ar : form.category_name)
        : t('createAd.selectCategory');

    const selectedRootName = selectedRootCat
        ? (isArabic ? selectedRootCat.name_ar : selectedRootCat.name)
        : '';

    if (!isAuthenticated) return null;

    return (
        <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
            {/* ── Header ── */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    {isArabic
                        ? <ChevronRight size={24} color={colors.text} />
                        : <ChevronLeft size={24} color={colors.text} />
                    }
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>{t('createAd.title')}</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                        <Text style={[styles.subtitle, { color: colors.fontSecondary }]}>
                            {t('createAd.subtitle')}
                        </Text>

                        {/* ── Title ── */}
                        <View style={styles.fieldGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>
                                {t('createAd.adTitle')} <Text style={{ color: colors.error ?? '#EF4444' }}>*</Text>
                            </Text>
                            <View style={[
                                styles.inputWrap,
                                {
                                    backgroundColor: colors.surface,
                                    borderColor: errors.title ? (colors.error ?? '#EF4444') : colors.border,
                                },
                            ]}>
                                <TextInput
                                    style={[styles.input, { color: colors.text }]}
                                    placeholder={t('createAd.adTitlePlaceholder')}
                                    placeholderTextColor={colors.fontSecondary}
                                    value={form.title}
                                    onChangeText={v => setForm(p => ({ ...p, title: v }))}
                                    onBlur={() => setTouched(p => ({ ...p, title: true }))}
                                    textAlign={isArabic ? 'right' : 'left'}
                                    maxLength={120}
                                />
                            </View>
                            {errors.title && <Text style={[styles.errorText, { color: colors.error ?? '#EF4444' }]}>{errors.title}</Text>}
                        </View>

                        {/* ── Description ── */}
                        <View style={styles.fieldGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>
                                {t('createAd.description')} <Text style={{ color: colors.error ?? '#EF4444' }}>*</Text>
                            </Text>
                            <View style={[
                                styles.inputWrap,
                                styles.textAreaWrap,
                                {
                                    backgroundColor: colors.surface,
                                    borderColor: errors.description ? (colors.error ?? '#EF4444') : colors.border,
                                },
                            ]}>
                                <TextInput
                                    style={[styles.input, styles.textArea, { color: colors.text }]}
                                    placeholder={t('createAd.descriptionPlaceholder')}
                                    placeholderTextColor={colors.fontSecondary}
                                    value={form.description}
                                    onChangeText={v => setForm(p => ({ ...p, description: v }))}
                                    onBlur={() => setTouched(p => ({ ...p, description: true }))}
                                    multiline
                                    numberOfLines={5}
                                    textAlignVertical="top"
                                    textAlign={isArabic ? 'right' : 'left'}
                                    maxLength={2000}
                                />
                            </View>
                            {errors.description && <Text style={[styles.errorText, { color: colors.error ?? '#EF4444' }]}>{errors.description}</Text>}
                        </View>

                        {/* ── Price + Negotiable ── */}
                        <View style={styles.row}>
                            <View style={[styles.fieldGroup, { flex: 1 }]}>
                                <Text style={[styles.label, { color: colors.text }]}>
                                    {t('createAd.price')} <Text style={{ color: colors.error ?? '#EF4444' }}>*</Text>
                                </Text>
                                <View style={[
                                    styles.inputWrap,
                                    {
                                        backgroundColor: colors.surface,
                                        borderColor: errors.price ? (colors.error ?? '#EF4444') : colors.border,
                                    },
                                ]}>
                                    <TextInput
                                        style={[styles.input, { color: colors.text }]}
                                        placeholder={t('createAd.pricePlaceholder')}
                                        placeholderTextColor={colors.fontSecondary}
                                        value={form.price}
                                        onChangeText={v => setForm(p => ({ ...p, price: v.replace(/[^0-9.]/g, '') }))}
                                        onBlur={() => setTouched(p => ({ ...p, price: true }))}
                                        keyboardType="numeric"
                                        textAlign={isArabic ? 'right' : 'left'}
                                    />
                                </View>
                                {errors.price && <Text style={[styles.errorText, { color: colors.error ?? '#EF4444' }]}>{errors.price}</Text>}
                            </View>

                            <View style={[styles.fieldGroup, styles.negotiableGroup]}>
                                <Text style={[styles.label, { color: colors.text }]}>
                                    {t('createAd.negotiable')}
                                </Text>
                                <View style={[styles.switchWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                    <Switch
                                        value={form.is_negotiable}
                                        onValueChange={v => setForm(p => ({ ...p, is_negotiable: v }))}
                                        trackColor={{ false: colors.border, true: colors.primary + '80' }}
                                        thumbColor={form.is_negotiable ? colors.primary : colors.fontSecondary}
                                    />
                                </View>
                            </View>
                        </View>

                        {/* ── Category ── */}
                        <View style={styles.fieldGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>
                                {t('createAd.category')} <Text style={{ color: colors.error ?? '#EF4444' }}>*</Text>
                            </Text>
                            <TouchableOpacity
                                style={[
                                    styles.inputWrap,
                                    styles.selectWrap,
                                    {
                                        backgroundColor: colors.surface,
                                        borderColor: errors.category_id ? (colors.error ?? '#EF4444') : colors.border,
                                    },
                                ]}
                                onPress={() => {
                                    setTouched(p => ({ ...p, category_id: true }));
                                    setCatModalVisible(true);
                                }}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name="apps-outline"
                                    size={18}
                                    color={form.category_id ? colors.primary : colors.fontSecondary}
                                />
                                <Text style={[
                                    styles.selectText,
                                    { color: form.category_id ? colors.text : colors.fontSecondary },
                                ]}>
                                    {selectedCatLabel}
                                </Text>
                                {isArabic
                                    ? <ChevronLeft size={18} color={colors.fontSecondary} />
                                    : <ChevronRight size={18} color={colors.fontSecondary} />
                                }
                            </TouchableOpacity>
                            {errors.category_id && <Text style={[styles.errorText, { color: colors.error ?? '#EF4444' }]}>{errors.category_id}</Text>}
                        </View>

                        {/* ── City ── */}
                        <View style={styles.fieldGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>
                                {t('createAd.city')} <Text style={{ color: colors.error ?? '#EF4444' }}>*</Text>
                            </Text>
                            <View style={[
                                styles.inputWrap,
                                styles.cityWrap,
                                {
                                    backgroundColor: colors.surface,
                                    borderColor: errors.city ? (colors.error ?? '#EF4444') : colors.border,
                                },
                            ]}>
                                <Ionicons name="location-outline" size={18} color={colors.fontSecondary} />
                                <TextInput
                                    style={[styles.input, { color: colors.text }]}
                                    placeholder={t('createAd.cityPlaceholder')}
                                    placeholderTextColor={colors.fontSecondary}
                                    value={form.city}
                                    onChangeText={v => setForm(p => ({ ...p, city: v }))}
                                    onBlur={() => setTouched(p => ({ ...p, city: true }))}
                                    textAlign={isArabic ? 'right' : 'left'}
                                />
                            </View>
                            {errors.city && <Text style={[styles.errorText, { color: colors.error ?? '#EF4444' }]}>{errors.city}</Text>}
                        </View>

                        {/* ── Images ── */}
                        <View style={styles.fieldGroup}>
                            <View style={styles.imagesHeader}>
                                <Text style={[styles.label, { color: colors.text }]}>
                                    {t('createAd.images')}
                                </Text>
                                <Text style={[styles.imagesCount, { color: colors.fontSecondary }]}>
                                    {images.length}/{MAX_IMAGES}
                                </Text>
                            </View>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.imagesRow}
                            >
                                {images.map((img, index) => (
                                    <View key={index} style={styles.imageThumb}>
                                        <Image source={{ uri: img.uri }} style={styles.thumbImg} resizeMode="cover" />
                                        {index === 0 && (
                                            <View style={[styles.primaryBadge, { backgroundColor: colors.primary }]}>
                                                <Text style={styles.primaryBadgeText}>
                                                    {isArabic ? 'رئيسية' : 'Main'}
                                                </Text>
                                            </View>
                                        )}
                                        <TouchableOpacity
                                            style={[styles.removeBtn, { backgroundColor: 'rgba(0,0,0,0.55)' }]}
                                            onPress={() => removeImage(index)}
                                            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                                        >
                                            <X size={12} color="#fff" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                                {images.length < MAX_IMAGES && (
                                    <TouchableOpacity
                                        style={[styles.addImageBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                        onPress={pickImage}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="camera-outline" size={28} color={colors.primary} />
                                        <Text style={[styles.addImageText, { color: colors.fontSecondary }]}>
                                            {t('createAd.addImage')}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </ScrollView>
                            <Text style={[styles.imagesHint, { color: colors.fontSecondary }]}>
                                {t('createAd.maxImages')} · {isArabic ? 'أول صورة ستكون الصورة الرئيسية' : 'First image will be the main photo'}
                            </Text>
                        </View>

                        {/* ── Submit ── */}
                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={submitting}
                            activeOpacity={0.85}
                            style={[styles.submitOuter, submitting && { opacity: 0.7 }]}
                        >
                            <LinearGradient
                                colors={[colors.primary, colors.secondary]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.submitGrad}
                            >
                                {submitting ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <Text style={styles.submitText}>{t('createAd.submit')}</Text>
                                        <Ionicons
                                            name={isArabic ? 'arrow-back' : 'arrow-forward'}
                                            size={20}
                                            color="#fff"
                                        />
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* ── Category Modal ── */}
            <Modal
                visible={catModalVisible}
                transparent
                animationType="slide"
                onRequestClose={closeCatModal}
            >
                <View style={styles.modalContainer}>
                    <TouchableOpacity
                        style={styles.modalBackdrop}
                        activeOpacity={1}
                        onPress={closeCatModal}
                    />
                    <View style={[styles.modalSheet, { backgroundColor: colors.background }]}>
                        <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
                        <View style={styles.modalHeader}>
                            {selectedRootCat ? (
                                <TouchableOpacity
                                    style={styles.modalBackRow}
                                    onPress={() => setSelectedRootCat(null)}
                                >
                                    {isArabic
                                        ? <ChevronRight size={20} color={colors.text} />
                                        : <ChevronLeft size={20} color={colors.text} />
                                    }
                                    <Text style={[styles.modalTitle, { color: colors.text }]}>
                                        {selectedRootName}
                                    </Text>
                                </TouchableOpacity>
                            ) : (
                                <Text style={[styles.modalTitle, { color: colors.text }]}>
                                    {t('createAd.category')}
                                </Text>
                            )}
                            <TouchableOpacity onPress={closeCatModal}>
                                <X size={22} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {catDetailLoading || rootCatsLoading ? (
                                <View style={styles.catLoader}>
                                    <ActivityIndicator size="small" color={colors.primary} />
                                </View>
                            ) : selectedRootCat ? (
                                <>
                                    <TouchableOpacity
                                        style={[styles.categoryRow, { borderBottomColor: colors.border }]}
                                        onPress={() => {
                                            setForm(prev => ({
                                                ...prev,
                                                category_id: selectedRootCat.id,
                                                category_name: selectedRootCat.name,
                                                category_name_ar: selectedRootCat.name_ar,
                                                sub_category_id: null,
                                            }));
                                            closeCatModal();
                                        }}
                                    >
                                        <View style={[styles.catIconWrap, { backgroundColor: colors.secondary + '20' }]}>
                                            <Ionicons name="grid-outline" size={20} color={colors.secondary} />
                                        </View>
                                        <Text style={[styles.catName, { color: colors.text, fontWeight: '600' }]}>
                                            {isArabic
                                                ? `جميع ${selectedRootCat.name_ar}`
                                                : `All in ${selectedRootCat.name}`
                                            }
                                        </Text>
                                    </TouchableOpacity>
                                    {selectedRootCat.subcategories?.map(sub => {
                                        const subName = isArabic ? sub.name_ar : sub.name;
                                        const isActive = form.sub_category_id === sub.id;
                                        return (
                                            <TouchableOpacity
                                                key={sub.id}
                                                style={[
                                                    styles.categoryRow,
                                                    {
                                                        borderBottomColor: colors.border,
                                                        backgroundColor: isActive ? colors.primary + '10' : 'transparent',
                                                    },
                                                ]}
                                                onPress={() => handleSubCategoryPress(sub)}
                                            >
                                                <View style={[styles.catIconWrap, { backgroundColor: colors.primary + '15' }]}>
                                                    <Ionicons name={faToIonicon(sub.icon)} size={20} color={colors.primary} />
                                                </View>
                                                <Text style={[styles.catName, { color: colors.text }]}>{subName}</Text>
                                                {isActive && <Ionicons name="checkmark-circle" size={18} color={colors.primary} />}
                                            </TouchableOpacity>
                                        );
                                    })}
                                </>
                            ) : (
                                rootCategories.map(cat => {
                                    const catName = isArabic ? cat.name_ar : cat.name;
                                    const isActive = form.category_id === cat.id && !form.sub_category_id;
                                    return (
                                        <TouchableOpacity
                                            key={cat.id}
                                            style={[
                                                styles.categoryRow,
                                                {
                                                    borderBottomColor: colors.border,
                                                    backgroundColor: isActive ? colors.primary + '10' : 'transparent',
                                                },
                                            ]}
                                            onPress={() => handleRootCategoryPress(cat)}
                                        >
                                            <View style={[styles.catIconWrap, { backgroundColor: isActive ? colors.primary + '30' : colors.primary + '15' }]}>
                                                <Ionicons name={faToIonicon(cat.icon)} size={20} color={colors.primary} />
                                            </View>
                                            <Text style={[styles.catName, { color: colors.text, fontWeight: isActive ? '700' : '400' }]}>
                                                {catName}
                                            </Text>
                                            <View style={styles.catRight}>
                                                {isActive
                                                    ? <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                                                    : (cat.subcategories_count ?? 0) > 0
                                                        ? isArabic
                                                            ? <ChevronLeft size={16} color={colors.fontSecondary} />
                                                            : <ChevronRight size={16} color={colors.fontSecondary} />
                                                        : null
                                                }
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            <PhoneVerificationModal
                visible={showVerifyModal}
                onClose={() => setShowVerifyModal(false)}
                initialPhone={user?.phone ?? user?.mobile ?? ''}
                onSuccess={() => {
                    setShowVerifyModal(false);
                    handleSubmit();
                }}
            />
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
        paddingTop: Platform.OS === 'android' ? 16 : 8,
        paddingBottom: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    headerTitle: { fontSize: 20, fontWeight: '700' },
    backBtn: { width: 40, alignItems: 'flex-start' },

    scroll: {
        padding: 20,
        paddingBottom: 48,
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 24,
        lineHeight: 20,
    },

    fieldGroup: { marginBottom: 18 },
    label: { fontSize: 13, fontWeight: '600', marginBottom: 8 },

    inputWrap: {
        borderWidth: 1.5,
        borderRadius: 12,
        paddingHorizontal: 14,
        height: 52,
        justifyContent: 'center',
    },
    textAreaWrap: {
        height: 'auto' as any,
        paddingVertical: 12,
    },
    input: {
        fontSize: 15,
        padding: 0,
    },
    textArea: {
        minHeight: 110,
    },

    row: { flexDirection: 'row', gap: 12 },
    negotiableGroup: { width: 110 },
    switchWrap: {
        borderWidth: 1.5,
        borderRadius: 12,
        height: 52,
        justifyContent: 'center',
        alignItems: 'center',
    },

    selectWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    selectText: { flex: 1, fontSize: 15 },

    cityWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },

    errorText: { fontSize: 12, marginTop: 4 },

    // Images
    imagesHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
    imagesCount: { fontSize: 12, fontWeight: '600' },
    imagesRow: { flexDirection: 'row', gap: 10, paddingBottom: 4 },
    imageThumb: {
        width: 90,
        height: 90,
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
    },
    thumbImg: { width: '100%', height: '100%' },
    primaryBadge: {
        position: 'absolute',
        bottom: 4,
        left: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    primaryBadgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
    removeBtn: {
        position: 'absolute',
        top: 4,
        right: 4,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addImageBtn: {
        width: 90,
        height: 90,
        borderRadius: 12,
        borderWidth: 1.5,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
    },
    addImageText: { fontSize: 10, fontWeight: '500' },
    imagesHint: { fontSize: 11, marginTop: 8, lineHeight: 16 },

    submitOuter: {
        borderRadius: 16,
        overflow: 'hidden',
        marginTop: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    submitGrad: {
        height: 54,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },

    // Modal
    modalContainer: { flex: 1, justifyContent: 'flex-end' },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
    modalSheet: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '80%',
        paddingBottom: Platform.OS === 'ios' ? 34 : 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 12,
    },
    modalHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 4,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 14,
    },
    modalTitle: { fontSize: 18, fontWeight: '700' },
    modalBackRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },

    categoryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
        gap: 12,
    },
    catIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    catName: { flex: 1, fontSize: 15 },
    catRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    catLoader: { padding: 24, alignItems: 'center' },
});
