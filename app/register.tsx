import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { AppDispatch, RootState } from '@/store';
import { clearError, register } from '@/store/slices/authSlice';
import { router } from 'expo-router';
import { Building2, Eye, EyeOff, Lock, Mail, Phone, User } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
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
  first_name: '',
  last_name: '',
  username: '',
  email: '',
  phone: '',
  password: '',
  password_confirm: '',
  profile_type: 'individual',
};

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

  useEffect(() => {
    if (error) {
      Alert.alert(isArabic ? 'خطأ' : 'Error', String(error));
      dispatch(clearError());
    }
  }, [error]);

  const set = (key: keyof FormState) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  // Validators
  const errors = {
    first_name: !form.first_name.trim() ? (isArabic ? 'مطلوب' : 'Required') : null,
    last_name: !form.last_name.trim() ? (isArabic ? 'مطلوب' : 'Required') : null,
    username: !form.username.trim() ? (isArabic ? 'مطلوب' : 'Required') : null,
    email: !/^\S+@\S+\.\S+$/.test(form.email)
      ? (isArabic ? 'بريد غير صحيح' : 'Invalid email')
      : null,
    password: form.password.length < 8
      ? (isArabic ? '8 أحرف على الأقل' : 'At least 8 characters')
      : null,
    password_confirm: form.password_confirm !== form.password
      ? (isArabic ? 'كلمات المرور غير متطابقة' : 'Passwords do not match')
      : null,
  };
  const isValid = Object.values(errors).every((e) => e === null);

  const handleRegister = async () => {
    setSubmitted(true);
    if (!isValid) return;
    const result = await dispatch(
      register({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        password: form.password,
        password_confirm: form.password_confirm,
        profile_type: form.profile_type,
      })
    );
    if (register.fulfilled.match(result)) {
      Alert.alert(
        isArabic ? 'تم التسجيل' : 'Registered',
        isArabic ? 'تم إنشاء حسابك. يمكنك الآن تسجيل الدخول.' : 'Account created. Please sign in.',
        [{ text: isArabic ? 'تسجيل الدخول' : 'Sign In', onPress: () => router.replace('/login') }]
      );
    }
  };

  const err = (key: keyof typeof errors) =>
    submitted ? errors[key] : null;

  const inputStyle = (key: keyof typeof errors) => [
    styles.inputRow,
    {
      backgroundColor: colors.background,
      borderColor: err(key) ? colors.error : colors.border,
    },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* ── Header ── */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />

        {/* Back button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>{isArabic ? '← رجوع' : '← Back'}</Text>
        </TouchableOpacity>

        <Image
          source={require('../assets/logo-square.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.headerTitle}>
          {isArabic ? 'إنشاء حساب' : 'Create Account'}
        </Text>
        <Text style={styles.headerSubtitle}>
          {isArabic ? 'انضم إلى إدريسيمارت اليوم' : 'Join Idrissimart today'}
        </Text>
      </View>

      {/* ── Form ── */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.card, { backgroundColor: colors.surface }]}>

            {/* Profile type selector */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                {isArabic ? 'نوع الحساب' : 'Account Type'}
              </Text>
              <View style={styles.typeRow}>
                {(['individual', 'commercial'] as ProfileType[]).map((type) => {
                  const active = form.profile_type === type;
                  const label = type === 'individual'
                    ? (isArabic ? 'فرد' : 'Individual')
                    : (isArabic ? 'تجاري' : 'Commercial');
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
                      {type === 'individual'
                        ? <User size={16} color={active ? '#fff' : colors.fontSecondary} />
                        : <Building2 size={16} color={active ? '#fff' : colors.fontSecondary} />}
                      <Text style={[styles.typeBtnText, { color: active ? '#fff' : colors.fontSecondary }]}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Name row */}
            <View style={styles.twoCol}>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  {isArabic ? 'الاسم الأول' : 'First Name'}
                </Text>
                <View style={inputStyle('first_name')}>
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder={isArabic ? 'الاسم الأول' : 'First'}
                    placeholderTextColor={colors.fontSecondary}
                    value={form.first_name}
                    onChangeText={set('first_name')}
                    textAlign={isArabic ? 'right' : 'left'}
                  />
                </View>
                {err('first_name') && <Text style={[styles.errorText, { color: colors.error }]}>{err('first_name')}</Text>}
              </View>

              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  {isArabic ? 'اسم العائلة' : 'Last Name'}
                </Text>
                <View style={inputStyle('last_name')}>
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder={isArabic ? 'اسم العائلة' : 'Last'}
                    placeholderTextColor={colors.fontSecondary}
                    value={form.last_name}
                    onChangeText={set('last_name')}
                    textAlign={isArabic ? 'right' : 'left'}
                  />
                </View>
                {err('last_name') && <Text style={[styles.errorText, { color: colors.error }]}>{err('last_name')}</Text>}
              </View>
            </View>

            {/* Username */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                {isArabic ? 'اسم المستخدم' : 'Username'}
              </Text>
              <View style={inputStyle('username')}>
                <User size={17} color={colors.fontSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder={isArabic ? 'اسم مستخدم فريد' : 'Unique username'}
                  placeholderTextColor={colors.fontSecondary}
                  value={form.username}
                  onChangeText={set('username')}
                  autoCapitalize="none"
                  textAlign={isArabic ? 'right' : 'left'}
                />
              </View>
              {err('username') && <Text style={[styles.errorText, { color: colors.error }]}>{err('username')}</Text>}
            </View>

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                {isArabic ? 'البريد الإلكتروني' : 'Email'}
              </Text>
              <View style={inputStyle('email')}>
                <Mail size={17} color={colors.fontSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="example@email.com"
                  placeholderTextColor={colors.fontSecondary}
                  value={form.email}
                  onChangeText={set('email')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  textAlign={isArabic ? 'right' : 'left'}
                />
              </View>
              {err('email') && <Text style={[styles.errorText, { color: colors.error }]}>{err('email')}</Text>}
            </View>

            {/* Phone (optional) */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                {isArabic ? 'رقم الهاتف (اختياري)' : 'Phone (optional)'}
              </Text>
              <View style={[styles.inputRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Phone size={17} color={colors.fontSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="+966 5xx xxx xxx"
                  placeholderTextColor={colors.fontSecondary}
                  value={form.phone}
                  onChangeText={set('phone')}
                  keyboardType="phone-pad"
                  textAlign={isArabic ? 'right' : 'left'}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                {isArabic ? 'كلمة المرور' : 'Password'}
              </Text>
              <View style={inputStyle('password')}>
                <Lock size={17} color={colors.fontSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder={isArabic ? '8 أحرف على الأقل' : 'At least 8 characters'}
                  placeholderTextColor={colors.fontSecondary}
                  value={form.password}
                  onChangeText={set('password')}
                  secureTextEntry={!showPass}
                  textAlign={isArabic ? 'right' : 'left'}
                />
                <TouchableOpacity onPress={() => setShowPass((v) => !v)}>
                  {showPass
                    ? <Eye size={17} color={colors.fontSecondary} />
                    : <EyeOff size={17} color={colors.fontSecondary} />}
                </TouchableOpacity>
              </View>
              {err('password') && <Text style={[styles.errorText, { color: colors.error }]}>{err('password')}</Text>}
            </View>

            {/* Confirm password */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                {isArabic ? 'تأكيد كلمة المرور' : 'Confirm Password'}
              </Text>
              <View style={inputStyle('password_confirm')}>
                <Lock size={17} color={colors.fontSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder={isArabic ? 'أعد كتابة كلمة المرور' : 'Repeat password'}
                  placeholderTextColor={colors.fontSecondary}
                  value={form.password_confirm}
                  onChangeText={set('password_confirm')}
                  secureTextEntry={!showConfirm}
                  textAlign={isArabic ? 'right' : 'left'}
                />
                <TouchableOpacity onPress={() => setShowConfirm((v) => !v)}>
                  {showConfirm
                    ? <Eye size={17} color={colors.fontSecondary} />
                    : <EyeOff size={17} color={colors.fontSecondary} />}
                </TouchableOpacity>
              </View>
              {err('password_confirm') && (
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {err('password_confirm')}
                </Text>
              )}
            </View>

            {/* Submit */}
            <TouchableOpacity
              style={[
                styles.primaryBtn,
                { backgroundColor: colors.secondary },
                loading && styles.btnDisabled,
              ]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>
                  {isArabic ? 'إنشاء الحساب' : 'Create Account'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Already have account */}
            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => router.push('/login')}
            >
              <Text style={[styles.loginLinkText, { color: colors.fontSecondary }]}>
                {isArabic ? 'لديك حساب بالفعل؟ ' : 'Already have an account? '}
                <Text style={{ color: colors.primary, fontWeight: '700' }}>
                  {isArabic ? 'تسجيل الدخول' : 'Sign In'}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight ?? 0) + 16,
    paddingBottom: 28,
    alignItems: 'center',
    overflow: 'hidden',
  },
  circle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -60,
    right: -50,
  },
  circle2: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.06)',
    bottom: -30,
    left: -30,
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginLeft: 16,
    marginBottom: 12,
  },
  backBtnText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
  },
  logoImage: {
    width: 70,
    height: 70,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    height: 48,
  },
  errorText: {
    fontSize: 11,
    marginTop: 3,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  typeBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  twoCol: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryBtn: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 16,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  loginLink: {
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 14,
  },
});
