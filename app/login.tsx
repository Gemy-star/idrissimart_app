import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { AppDispatch, RootState } from '@/store';
import { clearError, login } from '@/store/slices/authSlice';
import { router } from 'expo-router';
import { Eye, EyeOff, Lock, User } from 'lucide-react-native';
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

export default function LoginScreen() {
  const { colors } = useTheme();
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, isAuthenticated } = useSelector((s: RootState) => s.auth);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({ username: false, password: false });

  // Redirect when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  // Show API error
  useEffect(() => {
    if (error) {
      Alert.alert(isArabic ? 'خطأ' : 'Error', String(error));
      dispatch(clearError());
    }
  }, [error]);

  const usernameError = touched.username && !username.trim()
    ? (isArabic ? 'مطلوب' : 'Required')
    : null;
  const passwordError = touched.password && password.length < 6
    ? (isArabic ? 'كلمة المرور قصيرة' : 'Too short')
    : null;

  const valid = !!username.trim() && password.length >= 6;

  const handleLogin = () => {
    setTouched({ username: true, password: true });
    if (!valid) return;
    dispatch(login({ username: username.trim(), password }));
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primary}
      />

      {/* ── Purple wave header ── */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        {/* Decorative circles */}
        <View style={styles.circle1} />
        <View style={styles.circle2} />

        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/logo-square.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.appName}>Idrissimart</Text>
        <Text style={styles.tagline}>
          {isArabic ? 'مرحباً بك مجدداً' : 'Welcome back'}
        </Text>
      </View>

      {/* ── Form card ── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.formTitle, { color: colors.text }]}>
              {isArabic ? 'تسجيل الدخول' : 'Sign In'}
            </Text>
            <Text style={[styles.formSubtitle, { color: colors.fontSecondary }]}>
              {isArabic
                ? 'أدخل بيانات حسابك للمتابعة'
                : 'Enter your credentials to continue'}
            </Text>

            {/* Username */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                {isArabic ? 'اسم المستخدم' : 'Username'}
              </Text>
              <View
                style={[
                  styles.inputRow,
                  {
                    backgroundColor: colors.background,
                    borderColor: usernameError ? colors.error : colors.border,
                  },
                ]}
              >
                <User size={18} color={colors.fontSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder={isArabic ? 'اسم المستخدم' : 'Enter username'}
                  placeholderTextColor={colors.fontSecondary}
                  value={username}
                  onChangeText={setUsername}
                  onBlur={() => setTouched((p) => ({ ...p, username: true }))}
                  autoCapitalize="none"
                  textAlign={isArabic ? 'right' : 'left'}
                />
              </View>
              {usernameError && (
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {usernameError}
                </Text>
              )}
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                {isArabic ? 'كلمة المرور' : 'Password'}
              </Text>
              <View
                style={[
                  styles.inputRow,
                  {
                    backgroundColor: colors.background,
                    borderColor: passwordError ? colors.error : colors.border,
                  },
                ]}
              >
                <Lock size={18} color={colors.fontSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder={isArabic ? 'كلمة المرور' : 'Enter password'}
                  placeholderTextColor={colors.fontSecondary}
                  value={password}
                  onChangeText={setPassword}
                  onBlur={() => setTouched((p) => ({ ...p, password: true }))}
                  secureTextEntry={!showPassword}
                  textAlign={isArabic ? 'right' : 'left'}
                />
                <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
                  {showPassword
                    ? <Eye size={18} color={colors.fontSecondary} />
                    : <EyeOff size={18} color={colors.fontSecondary} />}
                </TouchableOpacity>
              </View>
              {passwordError && (
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {passwordError}
                </Text>
              )}
            </View>

            {/* Forgot password */}
            <TouchableOpacity style={styles.forgotRow}>
              <Text style={[styles.forgotText, { color: colors.secondary }]}>
                {isArabic ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
              </Text>
            </TouchableOpacity>

            {/* Login button */}
            <TouchableOpacity
              style={[
                styles.primaryBtn,
                { backgroundColor: colors.primary },
                (!valid || loading) && styles.btnDisabled,
              ]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>
                  {isArabic ? 'تسجيل الدخول' : 'Sign In'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.fontSecondary }]}>
                {isArabic ? 'أو' : 'or'}
              </Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            {/* Register link */}
            <TouchableOpacity
              style={[styles.secondaryBtn, { borderColor: colors.primary }]}
              onPress={() => router.push('/register')}
              activeOpacity={0.8}
            >
              <Text style={[styles.secondaryBtnText, { color: colors.primary }]}>
                {isArabic ? 'إنشاء حساب جديد' : 'Create new account'}
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
    paddingTop: Platform.OS === 'ios' ? 60 : (StatusBar.currentHeight ?? 0) + 20,
    paddingBottom: 40,
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
  logoContainer: {
    marginBottom: 12,
  },
  logoImage: {
    width: 80,
    height: 80,
  },
  appName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 13,
    marginBottom: 24,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    height: 50,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  forgotRow: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '600',
  },
  primaryBtn: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 13,
  },
  secondaryBtn: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
