import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { AppDispatch, RootState } from '@/store';
import { clearError, register } from '@/store/slices/authSlice';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
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

const { height } = Dimensions.get('window');
type ProfileType = 'individual' | 'commercial';

interface FormState {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  password_confirm: string;
  profile_type: ProfileType;
}

const INITIAL: FormState = {
  first_name: '', last_name: '', username: '', email: '',
  phone: '', password: '', password_confirm: '', profile_type: 'individual',
};

const PROFILE_TYPES: Array<{ type: ProfileType; en: string; ar: string; icon: string }> = [
  { type: 'individual', en: 'Individual', ar: 'فرد', icon: 'person-outline' },
  { type: 'commercial', en: 'Commercial', ar: 'تجاري', icon: 'business-outline' },
];

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
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
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

  const errors = {
    first_name: !form.first_name.trim() ? (isArabic ? 'مطلوب' : 'Required') : null,
    last_name: !form.last_name.trim() ? (isArabic ? 'مطلوب' : 'Required') : null,
    username: !form.username.trim() ? (isArabic ? 'مطلوب' : 'Required') : null,
    email: !/^\S+@\S+\.\S+$/.test(form.email)
      ? (isArabic ? 'بريد غير صحيح' : 'Invalid email') : null,
    password: form.password.length < 8
      ? (isArabic ? '٨ أحرف على الأقل' : 'At least 8 characters') : null,
    password_confirm: form.password_confirm !== form.password
      ? (isArabic ? 'كلمات المرور غير متطابقة' : 'Passwords do not match') : null,
  };
  const isValid = Object.values(errors).every((e) => e === null);

  const handleRegister = async () => {
    setSubmitted(true);
    if (!isValid) return;
    const result = await dispatch(register({
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      username: form.username.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || undefined,
      password: form.password,
      password_confirm: form.password_confirm,
      profile_type: form.profile_type,
    }));
    if (register.fulfilled.match(result)) {
      Alert.alert(
        isArabic ? 'تم التسجيل' : 'Registered',
        isArabic ? 'تم إنشاء حسابك. يمكنك الآن تسجيل الدخول.' : 'Account created. Please sign in.',
        [{ text: isArabic ? 'تسجيل الدخول' : 'Sign In', onPress: () => router.replace('/login') }]
      );
    }
  };

  const err = (key: keyof typeof errors) => submitted ? errors[key] : null;

  const inputBorder = (key: keyof typeof errors) =>
    err(key) ? colors.error : colors.border;

  const Field = ({
    labelEn, labelAr, field, icon, keyboard = 'default', secure = false,
    showToggle = false, show = false, onToggle = () => {},
    placeholder = '', optional = false,
  }: {
    labelEn: string; labelAr: string;
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
        {optional && <Text style={{ fontWeight: '400', textTransform: 'none' }}> ({isArabic ? 'اختياري' : 'optional'})</Text>}
      </Text>
      <View style={[styles.inputRow, isArabic && styles.inputRowRTL, { backgroundColor: colors.background, borderColor: inputBorder(field as any) }]}>
        <Ionicons name={icon as any} size={17} color={colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder={placeholder || (isArabic ? labelAr : labelEn)}
          placeholderTextColor={colors.textSecondary}
          value={form[field]}
          onChangeText={set(field)}
          keyboardType={keyboard}
          autoCapitalize={keyboard === 'email-address' ? 'none' : field === 'username' ? 'none' : 'words'}
          secureTextEntry={secure && !show}
          textAlign={isArabic ? 'right' : 'left'}
        />
        {showToggle && (
          <TouchableOpacity onPress={onToggle} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name={show ? 'eye-outline' : 'eye-off-outline'} size={17} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      {err(field as any) && (
        <Text style={[styles.errorText, { color: colors.error }]}>{err(field as any)}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <LinearGradient
        colors={[colors.primary, '#1a0b2e', colors.secondary + 'cc']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.blob, styles.blobTR, { borderColor: colors.secondary + '30' }]} />
      <View style={[styles.blob, styles.blobBL, { borderColor: colors.secondary + '20' }]} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name={isArabic ? 'arrow-forward' : 'arrow-back'} size={22} color="rgba(255,255,255,0.9)" />
            </TouchableOpacity>
            <View style={styles.logoRing}>
              <Image source={require('../assets/logo-square.png')} style={styles.logo} resizeMode="contain" />
            </View>
            <Text style={styles.appName}>{isArabic ? 'إنشاء حساب' : 'Create Account'}</Text>
            <Text style={styles.tagline}>
              {isArabic ? 'انضم إلى إدريسيمارت اليوم' : 'Join Idrissimart today'}
            </Text>
          </Animated.View>

          {/* Form card */}
          <Animated.View
            style={[styles.card, { backgroundColor: colors.surface }, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
          >
            {/* Account type */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                {isArabic ? 'نوع الحساب' : 'Account Type'}
              </Text>
              <View style={styles.typeRow}>
                {PROFILE_TYPES.map(({ type, en, ar, icon }) => {
                  const active = form.profile_type === type;
                  const label = isArabic ? ar : en;
                  return (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeBtn,
                        {
                          backgroundColor: active ? colors.primary : colors.background,
                          borderColor: active ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => setForm((f) => ({ ...f, profile_type: type }))}
                    >
                      <Ionicons name={icon as any} size={16} color={active ? '#fff' : colors.textSecondary} />
                      <Text style={[styles.typeBtnText, { color: active ? '#fff' : colors.textSecondary }]}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Name row */}
            <View style={styles.twoCol}>
              <View style={{ flex: 1 }}>
                <Field labelEn="First Name" labelAr="الاسم الأول" field="first_name" icon="person-outline" placeholder={isArabic ? 'الاسم الأول' : 'First'} />
              </View>
              <View style={{ flex: 1 }}>
                <Field labelEn="Last Name" labelAr="اسم العائلة" field="last_name" icon="person-outline" placeholder={isArabic ? 'اسم العائلة' : 'Last'} />
              </View>
            </View>

            <Field labelEn="Username" labelAr="اسم المستخدم" field="username" icon="at-outline" placeholder={isArabic ? 'اسم مستخدم فريد' : 'Unique username'} />
            <Field labelEn="Email" labelAr="البريد الإلكتروني" field="email" icon="mail-outline" keyboard="email-address" placeholder="example@email.com" />
            <Field labelEn="Phone" labelAr="رقم الهاتف" field="phone" icon="call-outline" keyboard="phone-pad" placeholder="+966 5xx xxx xxx" optional />
            <Field
              labelEn="Password" labelAr="كلمة المرور"
              field="password" icon="lock-closed-outline"
              secure showToggle show={showPass} onToggle={() => setShowPass((v) => !v)}
              placeholder={isArabic ? '٨ أحرف على الأقل' : 'At least 8 characters'}
            />
            <Field
              labelEn="Confirm Password" labelAr="تأكيد كلمة المرور"
              field="password_confirm" icon="lock-closed-outline"
              secure showToggle show={showConfirm} onToggle={() => setShowConfirm((v) => !v)}
              placeholder={isArabic ? 'أعد كتابة كلمة المرور' : 'Repeat password'}
            />

            {/* Submit */}
            <TouchableOpacity
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
              style={[styles.primaryBtnOuter, loading && { opacity: 0.6 }]}
            >
              <LinearGradient
                colors={[colors.secondary, colors.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryBtnGrad}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <>
                      <Text style={styles.primaryBtnText}>
                        {isArabic ? 'إنشاء الحساب' : 'Create Account'}
                      </Text>
                      <Ionicons name={isArabic ? 'arrow-back' : 'arrow-forward'} size={18} color="#fff" />
                    </>}
              </LinearGradient>
            </TouchableOpacity>

            {/* Sign in link */}
            <TouchableOpacity style={styles.loginLink} onPress={() => router.replace('/login')}>
              <Text style={[styles.loginLinkText, { color: colors.textSecondary }]}>
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

const styles = StyleSheet.create({
  root: { flex: 1 },
  blob: { position: 'absolute', borderRadius: 999, borderWidth: 1.5 },
  blobTR: { width: 250, height: 250, top: -80, right: -80 },
  blobBL: { width: 180, height: 180, bottom: height * 0.3, left: -60 },
  scroll: { paddingHorizontal: 20, paddingBottom: 48 },
  header: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 64 : (StatusBar.currentHeight ?? 24) + 24,
    paddingBottom: 24,
  },
  backBtn: {
    marginBottom: 8,
    width: '100%',
    paddingLeft: 4,
  },
  logoRing: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  logo: { width: 52, height: 52 },
  appName: { fontSize: 24, fontWeight: '800', color: '#fff', letterSpacing: -0.5, marginBottom: 4, textAlign: 'center' },
  tagline: { fontSize: 14, color: 'rgba(255,255,255,0.7)', textAlign: 'center' },
  card: {
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
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
  inputIcon: { marginEnd: 8 },
  inputRowRTL: { flexDirection: 'row-reverse' },
  input: { flex: 1, fontSize: 14, height: 50 },
  errorText: { fontSize: 11, marginTop: 3 },
  typeRow: { flexDirection: 'row', gap: 10 },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  typeBtnText: { fontSize: 13, fontWeight: '600' },
  twoCol: { flexDirection: 'row', gap: 10 },
  primaryBtnOuter: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 4,
    marginBottom: 16,
    shadowColor: '#ff6001',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  primaryBtnGrad: {
    height: 54,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  loginLink: { alignItems: 'center', marginTop: 4 },
  loginLinkText: { fontSize: 14 },
});

