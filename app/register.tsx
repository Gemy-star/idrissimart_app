import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { AppDispatch, RootState } from '@/store';
import { clearError, register } from '@/store/slices/authSlice';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { BadgeCheck, BookOpen, ShoppingBag, TrendingUp } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormState {
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    store_name: string;
    phone: string;
    password: string;
    password_confirm: string;
}

const INITIAL: FormState = {
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    store_name: '',
    phone: '',
    password: '',
    password_confirm: '',
};

// Benefits shown at the top of the form
const BENEFITS = [
    {
        icon: ShoppingBag,
        en: 'Sell your products & services',
        ar: 'بيع منتجاتك وخدماتك',
    },
    {
        icon: TrendingUp,
        en: 'Grow your business reach',
        ar: 'وسّع نطاق أعمالك',
    },
    {
        icon: BadgeCheck,
        en: 'Get a verified publisher badge',
        ar: 'احصل على شارة ناشر موثّق',
    },
    {
        icon: BookOpen,
        en: 'Access analytics & insights',
        ar: 'احصل على تحليلات وإحصاءات',
    },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function RegisterScreen() {
    const { colors } = useTheme();
    const { language } = useLanguage();
    const isArabic = language === 'ar';
    const dispatch = useDispatch<AppDispatch>();
    const { loading, error } = useSelector((s: RootState) => s.auth);

    const [form, setForm] = useState<FormState>(INITIAL);
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]).start();
    }, []);

    useEffect(() => {
        if (error) {
            Alert.alert(isArabic ? 'خطأ' : 'Error', String(error));
            dispatch(clearError());
        }
    }, [error]);

    const set = (key: keyof FormState) => (val: string) =>
        setForm((f) => ({ ...f, [key]: val }));

    // ─── Validation ───────────────────────────────────────────────────────────

    const errors = {
        first_name: !form.first_name.trim()
            ? (isArabic ? 'مطلوب' : 'Required') : null,
        last_name: !form.last_name.trim()
            ? (isArabic ? 'مطلوب' : 'Required') : null,
        username: !form.username.trim()
            ? (isArabic ? 'مطلوب' : 'Required') : null,
        email: !/^\S+@\S+\.\S+$/.test(form.email)
            ? (isArabic ? 'بريد غير صحيح' : 'Invalid email') : null,
        store_name: !form.store_name.trim()
            ? (isArabic ? 'مطلوب' : 'Required') : null,
        password: form.password.length < 8
            ? (isArabic ? '٨ أحرف على الأقل' : 'At least 8 characters') : null,
        password_confirm: form.password_confirm !== form.password
            ? (isArabic ? 'كلمات المرور غير متطابقة' : 'Passwords do not match') : null,
    };
    const isValid = Object.values(errors).every((e) => e === null);

    const err = (key: keyof typeof errors) => (submitted ? errors[key] : null);
    const inputBorder = (key: keyof typeof errors) =>
        err(key) ? colors.error : colors.border;

    // ─── Submit ───────────────────────────────────────────────────────────────

    const handleRegister = async () => {
        setSubmitted(true);
        if (!isValid) return;
        const result = await dispatch(
            register({
                first_name: form.first_name.trim(),
                last_name: form.last_name.trim(),
                username: form.username.trim(),
                email: form.email.trim(),
                store_name: form.store_name.trim(),
                phone: form.phone.trim() || undefined,
                password: form.password,
                password_confirm: form.password_confirm,
                profile_type: 'publisher',
            })
        );
        if (register.fulfilled.match(result)) {
            Alert.alert(
                isArabic ? 'تم التسجيل بنجاح!' : 'Registration Successful!',
                isArabic
                    ? 'تم إنشاء حساب الناشر الخاص بك. يمكنك الآن تسجيل الدخول.'
                    : 'Your publisher account has been created. You can now sign in.',
                [
                    {
                        text: isArabic ? 'تسجيل الدخول' : 'Sign In',
                        onPress: () => router.replace('/login'),
                    },
                ]
            );
        }
    };

    // ─── Field component ──────────────────────────────────────────────────────

    const Field = ({
        labelEn,
        labelAr,
        field,
        icon,
        keyboard = 'default' as any,
        secure = false,
        showToggle = false,
        show = false,
        onToggle = () => {},
        placeholder = '',
        optional = false,
    }: {
        labelEn: string;
        labelAr: string;
        field: keyof FormState;
        icon: string;
        keyboard?: any;
        secure?: boolean;
        showToggle?: boolean;
        show?: boolean;
        onToggle?: () => void;
        placeholder?: string;
        optional?: boolean;
    }) => (
        <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
                {isArabic ? labelAr : labelEn}
                {optional && (
                    <Text style={{ fontWeight: '400', textTransform: 'none' }}>
                        {' '}({isArabic ? 'اختياري' : 'optional'})
                    </Text>
                )}
            </Text>
            <View
                style={[
                    styles.inputRow,
                    isArabic && styles.inputRowRTL,
                    {
                        backgroundColor: colors.background,
                        borderColor: inputBorder(field as any),
                    },
                ]}
            >
                <Ionicons
                    name={icon as any}
                    size={17}
                    color={colors.textSecondary}
                    style={styles.inputIcon}
                />
                <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder={placeholder || (isArabic ? labelAr : labelEn)}
                    placeholderTextColor={colors.textSecondary}
                    value={form[field]}
                    onChangeText={set(field)}
                    keyboardType={keyboard}
                    autoCapitalize={
                        keyboard === 'email-address'
                            ? 'none'
                            : field === 'username'
                            ? 'none'
                            : 'words'
                    }
                    secureTextEntry={secure && !show}
                    textAlign={isArabic ? 'right' : 'left'}
                />
                {showToggle && (
                    <TouchableOpacity
                        onPress={onToggle}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <Ionicons
                            name={show ? 'eye-outline' : 'eye-off-outline'}
                            size={17}
                            color={colors.textSecondary}
                        />
                    </TouchableOpacity>
                )}
            </View>
            {err(field as any) && (
                <Text style={[styles.errorText, { color: colors.error }]}>
                    {err(field as any)}
                </Text>
            )}
        </View>
    );

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Background gradient */}
            <LinearGradient
                colors={['#0f172a', '#1e1b4b', '#312e81']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />

            {/* Decorative circles */}
            <View style={[styles.decorCircle, styles.decorCircle1]} />
            <View style={[styles.decorCircle, styles.decorCircle2]} />
            <View style={[styles.decorCircle, styles.decorCircle3]} />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* ── Top header ──────────────────────────────────────── */}
                    <Animated.View
                        style={[
                            styles.topHeader,
                            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
                        ]}
                    >
                        <TouchableOpacity
                            style={[styles.backBtn, isArabic && styles.backBtnRTL]}
                            onPress={() => router.back()}
                        >
                            <Ionicons
                                name={isArabic ? 'arrow-forward' : 'arrow-back'}
                                size={22}
                                color="rgba(255,255,255,0.9)"
                            />
                        </TouchableOpacity>

                        {/* Publisher badge */}
                        <View style={styles.publisherBadge}>
                            <ShoppingBag size={18} color="#fff" />
                            <Text style={styles.publisherBadgeText}>
                                {isArabic ? 'حساب ناشر' : 'Publisher Account'}
                            </Text>
                        </View>

                        <Text style={styles.heroTitle}>
                            {isArabic ? 'ابدأ البيع اليوم' : 'Start Selling Today'}
                        </Text>
                        <Text style={styles.heroSubtitle}>
                            {isArabic
                                ? 'أنشئ حساب ناشرك وابدأ في نشر إعلاناتك وخدماتك'
                                : 'Create your publisher account and start reaching more customers'}
                        </Text>
                    </Animated.View>

                    {/* ── Benefits strip ──────────────────────────────────── */}
                    <Animated.View
                        style={[
                            styles.benefitsRow,
                            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
                        ]}
                    >
                        {BENEFITS.map((b, i) => {
                            const Icon = b.icon;
                            return (
                                <View key={i} style={styles.benefitItem}>
                                    <View style={styles.benefitIconWrap}>
                                        <Icon size={16} color="#a5b4fc" />
                                    </View>
                                    <Text style={styles.benefitText}>
                                        {isArabic ? b.ar : b.en}
                                    </Text>
                                </View>
                            );
                        })}
                    </Animated.View>

                    {/* ── Form card ───────────────────────────────────────── */}
                    <Animated.View
                        style={[
                            styles.card,
                            { backgroundColor: colors.surface },
                            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
                        ]}
                    >
                        {/* Section: Personal */}
                        <View style={styles.formSection}>
                            <View style={styles.formSectionHeader}>
                                <View style={[styles.formSectionDot, { backgroundColor: colors.primary }]} />
                                <Text style={[styles.formSectionTitle, { color: colors.fontSecondary }]}>
                                    {isArabic ? 'المعلومات الشخصية' : 'Personal Information'}
                                </Text>
                            </View>

                            <View style={styles.twoCol}>
                                <View style={{ flex: 1 }}>
                                    <Field
                                        labelEn="First Name"
                                        labelAr="الاسم الأول"
                                        field="first_name"
                                        icon="person-outline"
                                        placeholder={isArabic ? 'الاسم' : 'First'}
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Field
                                        labelEn="Last Name"
                                        labelAr="اسم العائلة"
                                        field="last_name"
                                        icon="person-outline"
                                        placeholder={isArabic ? 'العائلة' : 'Last'}
                                    />
                                </View>
                            </View>

                            <Field
                                labelEn="Username"
                                labelAr="اسم المستخدم"
                                field="username"
                                icon="at-outline"
                                placeholder={isArabic ? 'اسم مستخدم فريد' : 'Unique username'}
                            />
                            <Field
                                labelEn="Email"
                                labelAr="البريد الإلكتروني"
                                field="email"
                                icon="mail-outline"
                                keyboard="email-address"
                                placeholder="publisher@email.com"
                            />
                            <Field
                                labelEn="Phone"
                                labelAr="رقم الهاتف"
                                field="phone"
                                icon="call-outline"
                                keyboard="phone-pad"
                                placeholder="+966 5xx xxx xxx"
                                optional
                            />
                        </View>

                        {/* Divider */}
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />

                        {/* Section: Store */}
                        <View style={styles.formSection}>
                            <View style={styles.formSectionHeader}>
                                <View style={[styles.formSectionDot, { backgroundColor: colors.secondary }]} />
                                <Text style={[styles.formSectionTitle, { color: colors.fontSecondary }]}>
                                    {isArabic ? 'معلومات المتجر' : 'Store Information'}
                                </Text>
                            </View>

                            <Field
                                labelEn="Store / Business Name"
                                labelAr="اسم المتجر / النشاط التجاري"
                                field="store_name"
                                icon="storefront-outline"
                                placeholder={isArabic ? 'اسم متجرك' : 'Your store name'}
                            />
                        </View>

                        {/* Divider */}
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />

                        {/* Section: Security */}
                        <View style={styles.formSection}>
                            <View style={styles.formSectionHeader}>
                                <View style={[styles.formSectionDot, { backgroundColor: '#6366F1' }]} />
                                <Text style={[styles.formSectionTitle, { color: colors.fontSecondary }]}>
                                    {isArabic ? 'الأمان' : 'Security'}
                                </Text>
                            </View>

                            <Field
                                labelEn="Password"
                                labelAr="كلمة المرور"
                                field="password"
                                icon="lock-closed-outline"
                                secure
                                showToggle
                                show={showPass}
                                onToggle={() => setShowPass((v) => !v)}
                                placeholder={isArabic ? '٨ أحرف على الأقل' : 'At least 8 characters'}
                            />
                            <Field
                                labelEn="Confirm Password"
                                labelAr="تأكيد كلمة المرور"
                                field="password_confirm"
                                icon="lock-closed-outline"
                                secure
                                showToggle
                                show={showConfirm}
                                onToggle={() => setShowConfirm((v) => !v)}
                                placeholder={isArabic ? 'أعد كتابة كلمة المرور' : 'Repeat password'}
                            />
                        </View>

                        {/* Terms note */}
                        <Text style={[styles.termsText, { color: colors.fontSecondary }]}>
                            {isArabic
                                ? 'بالتسجيل، أنت توافق على شروط الاستخدام وسياسة الخصوصية الخاصة بإدريسيمارت.'
                                : 'By registering, you agree to Idrissimart\'s Terms of Service and Privacy Policy.'}
                        </Text>

                        {/* Submit button */}
                        <TouchableOpacity
                            onPress={handleRegister}
                            disabled={loading}
                            activeOpacity={0.85}
                            style={[styles.submitOuter, loading && { opacity: 0.6 }]}
                        >
                            <LinearGradient
                                colors={['#6366F1', '#8B5CF6', '#A855F7']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.submitGrad}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <ShoppingBag size={18} color="#fff" />
                                        <Text style={styles.submitText}>
                                            {isArabic ? 'إنشاء حساب الناشر' : 'Create Publisher Account'}
                                        </Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Sign in link */}
                        <TouchableOpacity
                            style={styles.loginLink}
                            onPress={() => router.replace('/login')}
                        >
                            <Text style={[styles.loginLinkText, { color: colors.fontSecondary }]}>
                                {isArabic ? 'لديك حساب بالفعل؟ ' : 'Already have an account? '}
                                <Text style={{ color: colors.primary, fontWeight: '700' }}>
                                    {isArabic ? 'تسجيل الدخول' : 'Sign In'}
                                </Text>
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    root: { flex: 1 },

    // Background decorations
    decorCircle: { position: 'absolute', borderRadius: 999 },
    decorCircle1: {
        width: 300,
        height: 300,
        backgroundColor: 'rgba(99,102,241,0.12)',
        top: -100,
        right: -100,
    },
    decorCircle2: {
        width: 200,
        height: 200,
        backgroundColor: 'rgba(168,85,247,0.08)',
        top: 200,
        left: -80,
    },
    decorCircle3: {
        width: 150,
        height: 150,
        backgroundColor: 'rgba(99,102,241,0.07)',
        bottom: 100,
        right: -40,
    },

    scroll: { paddingHorizontal: 20, paddingBottom: 48 },

    // Top header
    topHeader: {
        paddingTop: Platform.OS === 'ios' ? 64 : (StatusBar.currentHeight ?? 24) + 24,
        paddingBottom: 20,
        alignItems: 'center',
    },
    backBtn: { marginBottom: 20, width: '100%', paddingLeft: 4 },
    backBtnRTL: { paddingLeft: 0, paddingRight: 4 },

    publisherBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        backgroundColor: 'rgba(99,102,241,0.35)',
        paddingHorizontal: 16,
        paddingVertical: 7,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(165,180,252,0.3)',
        marginBottom: 16,
    },
    publisherBadgeText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 0.3,
    },
    heroTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: '#fff',
        textAlign: 'center',
        letterSpacing: -0.5,
        marginBottom: 8,
    },
    heroSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.65)',
        textAlign: 'center',
        lineHeight: 20,
        maxWidth: 300,
    },

    // Benefits strip
    benefitsRow: {
        marginBottom: 20,
        gap: 10,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: 'rgba(255,255,255,0.07)',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: 'rgba(165,180,252,0.15)',
    },
    benefitIconWrap: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: 'rgba(99,102,241,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    benefitText: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.85)',
        fontWeight: '500',
        flex: 1,
    },

    // Form card
    card: {
        borderRadius: 24,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
        elevation: 12,
    },

    formSection: { gap: 0 },
    formSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 14,
        marginTop: 4,
    },
    formSectionDot: { width: 4, height: 16, borderRadius: 2 },
    formSectionTitle: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.7,
    },

    divider: { height: 1, marginVertical: 18 },

    // Fields
    twoCol: { flexDirection: 'row', gap: 10 },
    fieldGroup: { marginBottom: 14 },
    label: {
        fontSize: 11,
        fontWeight: '700',
        marginBottom: 5,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderRadius: 13,
        paddingHorizontal: 12,
        height: 50,
    },
    inputRowRTL: { flexDirection: 'row-reverse' },
    inputIcon: { marginEnd: 8 },
    input: { flex: 1, fontSize: 14, height: 50 },
    errorText: { fontSize: 11, marginTop: 3 },

    // Terms
    termsText: {
        fontSize: 11,
        textAlign: 'center',
        lineHeight: 16,
        marginTop: 4,
        marginBottom: 16,
        paddingHorizontal: 8,
    },

    // Submit button
    submitOuter: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 16,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    submitGrad: {
        height: 54,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    submitText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.3,
    },

    // Login link
    loginLink: { alignItems: 'center', marginTop: 4 },
    loginLinkText: { fontSize: 14 },
});
