import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { AppDispatch, RootState } from '@/store';
import { clearError, getUserRole, login } from '@/store/slices/authSlice';
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

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const { colors } = useTheme();
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, isAuthenticated, user } = useSelector((s: RootState) => s.auth);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({ username: false, password: false });

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      const role = getUserRole(user);
      if (role === 'admin') {
        router.replace('/admin-profile' as any);
      } else if (role === 'publisher') {
        router.replace('/(tabs)/profile');
      } else {
        router.replace('/(tabs)');
      }
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (error) {
      Alert.alert(isArabic ? 'خطأ' : 'Error', String(error));
      dispatch(clearError());
    }
  }, [error]);

  const usernameError = touched.username && !username.trim()
    ? (isArabic ? 'مطلوب' : 'Required') : null;
  const passwordError = touched.password && password.length < 6
    ? (isArabic ? 'كلمة المرور قصيرة' : 'Too short') : null;
  const valid = !!username.trim() && password.length >= 6;

  const handleLogin = () => {
    setTouched({ username: true, password: true });
    if (!valid) return;
    dispatch(login({ username: username.trim(), password }));
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Full-screen gradient background */}
      <LinearGradient
        colors={[colors.primary, '#1a0b2e', colors.secondary + 'cc']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative blobs */}
      <View style={[styles.blob, styles.blobTR, { borderColor: colors.secondary + '30' }]} />
      <View style={[styles.blob, styles.blobBL, { borderColor: colors.secondary + '20' }]} />
      <View style={[styles.dot, { top: height * 0.12, left: 40, backgroundColor: colors.secondary }]} />
      <View style={[styles.dot, { top: height * 0.22, right: 60, backgroundColor: colors.accent, opacity: 0.5 }]} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Logo area ── */}
          <Animated.View style={[styles.logoArea, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name={isArabic ? 'arrow-forward' : 'arrow-back'} size={22} color="rgba(255,255,255,0.9)" />
            </TouchableOpacity>
            <View style={styles.logoRing}>
              <Image
                source={require('../assets/logo-square.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.appName}>Idrissimart</Text>
            <Text style={styles.tagline}>
              {isArabic ? 'أهلاً بك مجدداً 👋' : 'Welcome back 👋'}
            </Text>
          </Animated.View>

          {/* ── Card ── */}
          <Animated.View
            style={[
              styles.card,
              { backgroundColor: colors.surface },
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              {isArabic ? 'تسجيل الدخول' : 'Sign In'}
            </Text>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
              {isArabic ? 'أدخل بيانات حسابك للمتابعة' : 'Enter your credentials to continue'}
            </Text>

            {/* Username */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                {isArabic ? 'اسم المستخدم' : 'Username'}
              </Text>
              <View style={[
                styles.inputRow,
                isArabic && styles.inputRowRTL,
                { backgroundColor: colors.background, borderColor: usernameError ? colors.error : colors.border },
              ]}>
                <Ionicons name="person-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder={isArabic ? 'اسم المستخدم' : 'Enter username'}
                  placeholderTextColor={colors.textSecondary}
                  value={username}
                  onChangeText={setUsername}
                  onBlur={() => setTouched((p) => ({ ...p, username: true }))}
                  autoCapitalize="none"
                  textAlign={isArabic ? 'right' : 'left'}
                />
              </View>
              {usernameError && (
                <Text style={[styles.errorText, { color: colors.error }]}>{usernameError}</Text>
              )}
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                {isArabic ? 'كلمة المرور' : 'Password'}
              </Text>
              <View style={[
                styles.inputRow,
                isArabic && styles.inputRowRTL,
                { backgroundColor: colors.background, borderColor: passwordError ? colors.error : colors.border },
              ]}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder={isArabic ? 'كلمة المرور' : 'Enter password'}
                  placeholderTextColor={colors.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  onBlur={() => setTouched((p) => ({ ...p, password: true }))}
                  secureTextEntry={!showPassword}
                  textAlign={isArabic ? 'right' : 'left'}
                />
                <TouchableOpacity onPress={() => setShowPassword((v) => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={18}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              {passwordError && (
                <Text style={[styles.errorText, { color: colors.error }]}>{passwordError}</Text>
              )}
            </View>

            {/* Forgot password */}
            <TouchableOpacity
              style={[styles.forgotRow, isArabic && { alignSelf: 'flex-start' }]}
              onPress={() => router.push('/forgot-password' as any)}
            >
              <Text style={[styles.forgotText, { color: colors.secondary }]}>
                {isArabic ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
              </Text>
            </TouchableOpacity>

            {/* Login button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
              style={[styles.primaryBtnOuter, (!valid || loading) && { opacity: 0.6 }]}
            >
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryBtnGrad}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <>
                      <Text style={styles.primaryBtnText}>
                        {isArabic ? 'تسجيل الدخول' : 'Sign In'}
                      </Text>
                      <Ionicons
                        name={isArabic ? 'arrow-back' : 'arrow-forward'}
                        size={18}
                        color="#fff"
                      />
                    </>}
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.textSecondary }]}>
                {isArabic ? 'أو' : 'or'}
              </Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            {/* Register link */}
            <TouchableOpacity
              style={[styles.secondaryBtn, { borderColor: colors.primary + '60' }]}
              onPress={() => router.push('/register')}
              activeOpacity={0.8}
            >
              <Text style={[styles.secondaryBtnText, { color: colors.primary }]}>
                {isArabic ? 'إنشاء حساب جديد' : 'Create new account'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  // Decorative
  blob: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1.5,
  },
  blobTR: {
    width: 250,
    height: 250,
    top: -80,
    right: -80,
  },
  blobBL: {
    width: 180,
    height: 180,
    bottom: height * 0.35,
    left: -60,
  },
  dot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 48,
    flexGrow: 1,
    justifyContent: 'center',
  },
  // Logo
  logoArea: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 80 : (StatusBar.currentHeight ?? 24) + 32,
    paddingBottom: 28,
  },
  backBtn: {
    marginBottom: 8,
    width: '100%',
    paddingLeft: 4,
  },
  logoRing: {
    width: 90,
    height: 90,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  logo: {
    width: 58,
    height: 58,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
  },
  // Card
  card: {
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
    textAlign: 'center',
  },
  // Fields
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: {
    marginEnd: 10,
  },
  inputRowRTL: {
    flexDirection: 'row-reverse',
  },
  input: {
    flex: 1,
    fontSize: 15,
    height: 52,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  forgotRow: {
    alignSelf: 'flex-end',
    marginBottom: 22,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '700',
  },
  // Buttons
  primaryBtnOuter: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#4b315e',
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
