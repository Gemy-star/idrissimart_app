import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { AppDispatch, RootState } from '@/store';
import { clearResetError, resetPassword } from '@/store/slices/authSlice';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
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

export default function ResetPasswordScreen() {
  const { colors } = useTheme();
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const dispatch = useDispatch<AppDispatch>();
  const { resetLoading, resetError } = useSelector((s: RootState) => s.auth);

  // uid and token arrive via deep link: idrissimart://reset-password?uid=xxx&token=yyy
  const params = useLocalSearchParams();
  const [uid, setUid] = useState(typeof params.uid === 'string' ? params.uid : '');
  const [token, setToken] = useState(typeof params.token === 'string' ? params.token : '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [done, setDone] = useState(false);

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

  // Sync params if a deep link arrives after mount
  useEffect(() => {
    if (typeof params.uid === 'string') setUid(params.uid);
    if (typeof params.token === 'string') setToken(params.token);
  }, [params.uid, params.token]);

  const errors = {
    uid: !uid.trim() ? (isArabic ? 'مطلوب' : 'Required') : null,
    token: !token.trim() ? (isArabic ? 'مطلوب' : 'Required') : null,
    newPassword: newPassword.length < 8
      ? (isArabic ? '٨ أحرف على الأقل' : 'At least 8 characters')
      : null,
    confirmPassword: confirmPassword !== newPassword
      ? (isArabic ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match')
      : null,
  };
  const isValid = Object.values(errors).every((e) => e === null);

  const err = (key: keyof typeof errors) => (submitted ? errors[key] : null);

  const handleReset = async () => {
    setSubmitted(true);
    if (!isValid) return;

    const result = await dispatch(
      resetPassword({
        uid: uid.trim(),
        token: token.trim(),
        new_password: newPassword,
        new_password_confirm: confirmPassword,
      })
    );

    if (resetPassword.fulfilled.match(result)) {
      setDone(true);
      Animated.spring(successScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 80,
        friction: 6,
      }).start();
    }
  };

  const inputBorderColor = (key: keyof typeof errors) =>
    err(key) ? colors.error : colors.border;

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
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            {/* Back button */}
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons
                name={isArabic ? 'arrow-forward' : 'arrow-back'}
                size={22}
                color="rgba(255,255,255,0.9)"
              />
            </TouchableOpacity>

            {/* Logo */}
            <View style={styles.logoRing}>
              <Image
                source={require('../assets/logo-square.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <Text style={[styles.title, { textAlign: isArabic ? 'right' : 'left' }]}>
              {isArabic ? 'إعادة تعيين كلمة المرور' : 'Reset Password'}
            </Text>
            <Text style={[styles.subtitle, { textAlign: isArabic ? 'right' : 'left' }]}>
              {isArabic
                ? 'أدخل الرمز الذي وصلك بالبريد الإلكتروني وكلمة المرور الجديدة'
                : 'Enter the code from your email and choose a new password'}
            </Text>
          </Animated.View>

          {/* Card */}
          <Animated.View
            style={[styles.card, { backgroundColor: colors.surface }, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
          >
            {done ? (
              /* ── Success state ── */
              <Animated.View style={[styles.successBox, { transform: [{ scale: successScale }] }]}>
                <View style={[styles.successIcon, { backgroundColor: colors.success + '20' }]}>
                  <Ionicons name="shield-checkmark" size={56} color={colors.success} />
                </View>
                <Text style={[styles.successTitle, { color: colors.text }]}>
                  {isArabic ? 'تم تغيير كلمة المرور!' : 'Password Changed!'}
                </Text>
                <Text style={[styles.successMsg, { color: colors.textSecondary }]}>
                  {isArabic
                    ? 'تم تعيين كلمة مرور جديدة لحسابك. يمكنك الآن تسجيل الدخول.'
                    : 'Your password has been updated. You can now sign in with your new password.'}
                </Text>
                <TouchableOpacity
                  style={[styles.primaryBtnOuter, { marginTop: 0 }]}
                  onPress={() => router.replace('/login')}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={[colors.primary, colors.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.primaryBtnGrad}
                  >
                    <Text style={styles.primaryBtnText}>
                      {isArabic ? 'تسجيل الدخول' : 'Sign In'}
                    </Text>
                    <Ionicons name={isArabic ? 'arrow-back' : 'arrow-forward'} size={18} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            ) : (
              /* ── Form ── */
              <>
                {/* Show token fields only when not pre-filled via deep link */}
                {(typeof params.uid !== 'string' || typeof params.token !== 'string') && (
                  <>
                    <Text style={[styles.sectionHint, { color: colors.textSecondary, borderColor: colors.border, textAlign: isArabic ? 'right' : 'left' }]}>
                      {isArabic
                        ? 'انسخ معرف المستخدم والرمز من رابط البريد الإلكتروني الذي استلمته'
                        : 'Copy the UID and token from the reset link in your email'}
                    </Text>

                    {/* UID */}
                    <View style={styles.fieldGroup}>
                      <Text style={[styles.label, { color: colors.textSecondary, textAlign: isArabic ? 'right' : 'left' }]}>
                        {isArabic ? 'معرف المستخدم (UID)' : 'User ID (UID)'}
                      </Text>
                      <View style={[styles.inputRow, isArabic && styles.inputRowRTL, {
                        backgroundColor: colors.background,
                        borderColor: inputBorderColor('uid'),
                      }]}>
                        <Ionicons name="person-circle-outline" size={17} color={colors.textSecondary} style={styles.inputIcon} />
                        <TextInput
                          style={[styles.input, { color: colors.text }]}
                          placeholder="e.g. MQ"
                          placeholderTextColor={colors.textSecondary}
                          value={uid}
                          onChangeText={setUid}
                          autoCapitalize="none"
                          autoCorrect={false}
                          textAlign={isArabic ? 'right' : 'left'}
                        />
                      </View>
                      {err('uid') && (
                        <Text style={[styles.errorText, { color: colors.error }]}>{err('uid')}</Text>
                      )}
                    </View>

                    {/* Token */}
                    <View style={styles.fieldGroup}>
                      <Text style={[styles.label, { color: colors.textSecondary, textAlign: isArabic ? 'right' : 'left' }]}>
                        {isArabic ? 'رمز إعادة التعيين' : 'Reset Token'}
                      </Text>
                      <View style={[styles.inputRow, isArabic && styles.inputRowRTL, {
                        backgroundColor: colors.background,
                        borderColor: inputBorderColor('token'),
                      }]}>
                        <Ionicons name="key-outline" size={17} color={colors.textSecondary} style={styles.inputIcon} />
                        <TextInput
                          style={[styles.input, { color: colors.text }]}
                          placeholder="e.g. c3ab8ff13720e8ad9047dd39466b3c89..."
                          placeholderTextColor={colors.textSecondary}
                          value={token}
                          onChangeText={setToken}
                          autoCapitalize="none"
                          autoCorrect={false}
                          textAlign={isArabic ? 'right' : 'left'}
                        />
                      </View>
                      {err('token') && (
                        <Text style={[styles.errorText, { color: colors.error }]}>{err('token')}</Text>
                      )}
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                  </>
                )}

                {/* New password */}
                <View style={styles.fieldGroup}>
                  <Text style={[styles.label, { color: colors.textSecondary, textAlign: isArabic ? 'right' : 'left' }]}>
                    {isArabic ? 'كلمة المرور الجديدة' : 'New Password'}
                  </Text>
                  <View style={[styles.inputRow, isArabic && styles.inputRowRTL, {
                    backgroundColor: colors.background,
                    borderColor: inputBorderColor('newPassword'),
                  }]}>
                    <Ionicons name="lock-closed-outline" size={17} color={colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder={isArabic ? '٨ أحرف على الأقل' : 'At least 8 characters'}
                      placeholderTextColor={colors.textSecondary}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={!showNew}
                      autoCapitalize="none"
                      textAlign={isArabic ? 'right' : 'left'}
                    />
                    <TouchableOpacity
                      onPress={() => setShowNew((v) => !v)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons
                        name={showNew ? 'eye-outline' : 'eye-off-outline'}
                        size={17}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                  {err('newPassword') && (
                    <Text style={[styles.errorText, { color: colors.error }]}>{err('newPassword')}</Text>
                  )}
                </View>

                {/* Confirm password */}
                <View style={styles.fieldGroup}>
                  <Text style={[styles.label, { color: colors.textSecondary, textAlign: isArabic ? 'right' : 'left' }]}>
                    {isArabic ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                  </Text>
                  <View style={[styles.inputRow, isArabic && styles.inputRowRTL, {
                    backgroundColor: colors.background,
                    borderColor: inputBorderColor('confirmPassword'),
                  }]}>
                    <Ionicons name="lock-closed-outline" size={17} color={colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder={isArabic ? 'أعد كتابة كلمة المرور' : 'Repeat new password'}
                      placeholderTextColor={colors.textSecondary}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirm}
                      autoCapitalize="none"
                      textAlign={isArabic ? 'right' : 'left'}
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirm((v) => !v)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons
                        name={showConfirm ? 'eye-outline' : 'eye-off-outline'}
                        size={17}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                  {err('confirmPassword') && (
                    <Text style={[styles.errorText, { color: colors.error }]}>{err('confirmPassword')}</Text>
                  )}
                </View>

                {/* Submit */}
                <TouchableOpacity
                  onPress={handleReset}
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
                            {isArabic ? 'تعيين كلمة المرور' : 'Set New Password'}
                          </Text>
                          <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                        </>}
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.backLink} onPress={() => router.replace('/login')}>
                  <Text style={[styles.backLinkText, { color: colors.textSecondary }]}>
                    {isArabic ? 'العودة لتسجيل الدخول ←' : '← Back to Sign In'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
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
  scroll: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 64 : (StatusBar.currentHeight ?? 24) + 24,
    paddingBottom: 48,
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
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 22,
    marginBottom: 28,
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
  sectionHint: {
    fontSize: 12,
    lineHeight: 18,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
  },
  fieldGroup: { marginBottom: 14 },
  label: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 13,
    paddingHorizontal: 12,
    height: 52,
  },
  inputIcon: { marginEnd: 8 },
  inputRowRTL: { flexDirection: 'row-reverse' },
  input: { flex: 1, fontSize: 14, height: 52 },
  errorText: { fontSize: 11, marginTop: 3 },
  divider: { height: 1, marginVertical: 16, opacity: 0.5 },
  primaryBtnOuter: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 6,
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
  // Success
  successBox: { alignItems: 'center', paddingVertical: 12, gap: 12 },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  successTitle: { fontSize: 22, fontWeight: '800' },
  successMsg: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
});
