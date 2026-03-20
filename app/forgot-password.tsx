import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { AppDispatch, RootState } from '@/store';
import { clearResetError, forgotPassword } from '@/store/slices/authSlice';
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
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

const { height } = Dimensions.get('window');

export default function ForgotPasswordScreen() {
  const { colors } = useTheme();
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const dispatch = useDispatch<AppDispatch>();
  const { resetLoading, resetError } = useSelector((s: RootState) => s.auth);

  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [touched, setTouched] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const successScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (resetError) {
      Alert.alert(isArabic ? 'خطأ' : 'Error', resetError);
      dispatch(clearResetError());
    }
  }, [resetError]);

  const emailError = touched && !/^\S+@\S+\.\S+$/.test(email)
    ? (isArabic ? 'بريد غير صحيح' : 'Invalid email address')
    : null;

  const handleSend = async () => {
    setTouched(true);
    if (!/^\S+@\S+\.\S+$/.test(email)) return;

    const result = await dispatch(forgotPassword(email));
    if (forgotPassword.fulfilled.match(result)) {
      setSent(true);
      Animated.spring(successScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 80,
        friction: 6,
      }).start();
    }
  };

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
        <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

          {/* Back button */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name={isArabic ? 'arrow-forward' : 'arrow-back'} size={22} color="rgba(255,255,255,0.9)" />
          </TouchableOpacity>

          {/* Logo */}
          <View style={styles.logoRing}>
            <Image source={require('../assets/logo-square.png')} style={styles.logo} resizeMode="contain" />
          </View>

          <Text style={[styles.title, { textAlign: isArabic ? 'right' : 'left' }]}>
            {isArabic ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
          </Text>
          <Text style={[styles.subtitle, { textAlign: isArabic ? 'right' : 'left' }]}>
            {isArabic
              ? 'أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور'
              : 'Enter your email address and we\'ll send you a password reset link'}
          </Text>

          {/* Card */}
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            {sent ? (
              /* Success state */
              <Animated.View style={[styles.successBox, { transform: [{ scale: successScale }] }]}>
                <View style={[styles.successIcon, { backgroundColor: colors.success + '20' }]}>
                  <Ionicons name="checkmark-circle" size={56} color={colors.success} />
                </View>
                <Text style={[styles.successTitle, { color: colors.text }]}>
                  {isArabic ? 'تم الإرسال!' : 'Email Sent!'}
                </Text>
                <Text style={[styles.successMsg, { color: colors.textSecondary }]}>
                  {isArabic
                    ? `تم إرسال رابط إعادة تعيين كلمة المرور إلى ${email}`
                    : `We've sent a reset link to ${email}`}
                </Text>
                <TouchableOpacity
                  style={[styles.backToLoginBtn, { borderColor: colors.primary }]}
                  onPress={() => router.replace('/login')}
                >
                  <Text style={[styles.backToLoginText, { color: colors.primary }]}>
                    {isArabic ? 'العودة لتسجيل الدخول' : 'Back to Sign In'}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ) : (
              /* Input state */
              <>
                <Text style={[styles.label, { color: colors.textSecondary, textAlign: isArabic ? 'right' : 'left' }]}>
                  {isArabic ? 'البريد الإلكتروني' : 'Email Address'}
                </Text>
                <View style={[
                  styles.inputRow,
                  isArabic && styles.inputRowRTL,
                  {
                    backgroundColor: colors.background,
                    borderColor: emailError ? colors.error : colors.border,
                  },
                ]}>
                  <Ionicons name="mail-outline" size={17} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder={isArabic ? 'example@email.com' : 'example@email.com'}
                    placeholderTextColor={colors.textSecondary}
                    value={email}
                    onChangeText={(v) => { setEmail(v); setTouched(true); }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    textAlign={isArabic ? 'right' : 'left'}
                  />
                </View>
                {emailError && (
                  <Text style={[styles.errorText, { color: colors.error }]}>{emailError}</Text>
                )}

                <TouchableOpacity
                  onPress={handleSend}
                  disabled={resetLoading}
                  activeOpacity={0.85}
                  style={[styles.primaryBtnOuter, resetLoading && { opacity: 0.6 }]}
                >
                  <LinearGradient
                    colors={[colors.primary, colors.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.primaryBtnGrad}
                  >
                    {resetLoading
                      ? <ActivityIndicator color="#fff" />
                      : <>
                          <Text style={styles.primaryBtnText}>
                            {isArabic ? 'إرسال رابط الإعادة' : 'Send Reset Link'}
                          </Text>
                          <Ionicons name="send" size={16} color="#fff" />
                        </>}
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
                  <Text style={[styles.backLinkText, { color: colors.textSecondary }]}>
                    {isArabic ? 'العودة لتسجيل الدخول ←' : '← Back to Sign In'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  blob: { position: 'absolute', borderRadius: 999, borderWidth: 1.5 },
  blobTR: { width: 250, height: 250, top: -80, right: -80 },
  blobBL: { width: 180, height: 180, bottom: height * 0.3, left: -60 },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 64 : (StatusBar.currentHeight ?? 24) + 24,
    paddingBottom: 40,
  },
  backBtn: { marginBottom: 24 },
  logoRing: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  logo: { width: 52, height: 52 },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 22,
    marginBottom: 32,
  },
  card: {
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 13,
    paddingHorizontal: 12,
    height: 52,
    marginBottom: 4,
  },
  inputIcon: { marginEnd: 8 },
  inputRowRTL: { flexDirection: 'row-reverse' },
  input: { flex: 1, fontSize: 14, height: 52 },
  errorText: { fontSize: 11, marginBottom: 6 },
  primaryBtnOuter: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 16,
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
  backLink: { alignItems: 'center', marginTop: 18 },
  backLinkText: { fontSize: 14 },
  // Success state
  successBox: { alignItems: 'center', paddingVertical: 12 },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  successTitle: { fontSize: 22, fontWeight: '800', marginBottom: 8 },
  successMsg: { fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  backToLoginBtn: {
    borderWidth: 2,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  backToLoginText: { fontSize: 15, fontWeight: '700' },
});
