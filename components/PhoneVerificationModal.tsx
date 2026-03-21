import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { AppDispatch, RootState } from '@/store';
import { clearOtpError, sendOtp, verifyOtp } from '@/store/slices/authSlice';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialPhone?: string;
}

export default function PhoneVerificationModal({ visible, onClose, onSuccess, initialPhone }: Props) {
  const { colors } = useTheme();
  const { language, t } = useLanguage();
  const isArabic = language === 'ar';
  const dispatch = useDispatch<AppDispatch>();
  const { otpLoading, otpError } = useSelector((s: RootState) => s.auth);

  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState(initialPhone ?? '');
  const [otp, setOtp] = useState('');

  useEffect(() => {
    if (visible) {
      setStep(1);
      setPhone(initialPhone ?? '');
      setOtp('');
      dispatch(clearOtpError());
    }
  }, [visible]);

  useEffect(() => {
    if (otpError) {
      Alert.alert(isArabic ? 'خطأ' : 'Error', otpError);
      dispatch(clearOtpError());
    }
  }, [otpError]);

  const handleSendOtp = async () => {
    if (!phone.trim()) {
      Alert.alert('', t('phoneVerification.enterPhone'));
      return;
    }
    const result = await dispatch(sendOtp(phone.trim()));
    if (sendOtp.fulfilled.match(result)) {
      setStep(2);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.trim().length < 4) {
      Alert.alert('', t('phoneVerification.enterCode'));
      return;
    }
    const result = await dispatch(verifyOtp(otp.trim()));
    if (verifyOtp.fulfilled.match(result)) {
      Alert.alert(
        t('phoneVerification.successTitle'),
        t('phoneVerification.successMessage'),
        [{ text: t('common.done'), onPress: onSuccess }]
      );
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={[styles.header, isArabic && styles.rowReverse]}>
            <Text style={[styles.title, { color: colors.text }]}>
              {t('phoneVerification.title')}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Step indicator */}
          <View style={[styles.stepRow, isArabic && styles.rowReverse]}>
            <View style={[styles.stepDot, { backgroundColor: colors.primary }]} />
            <View style={[styles.stepLine, { backgroundColor: step === 2 ? colors.primary : colors.border }]} />
            <View style={[styles.stepDot, { backgroundColor: step === 2 ? colors.primary : colors.border }]} />
          </View>

          {step === 1 ? (
            <>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {t('phoneVerification.subtitle')}
              </Text>
              <View style={[
                styles.inputRow,
                isArabic && styles.rowReverse,
                { backgroundColor: colors.background, borderColor: colors.border },
              ]}>
                <Ionicons name="call-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder={t('phoneVerification.phonePlaceholder')}
                  placeholderTextColor={colors.textSecondary}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  textAlign={isArabic ? 'right' : 'left'}
                  autoFocus
                />
              </View>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: colors.primary }, otpLoading && styles.disabled]}
                onPress={handleSendOtp}
                disabled={otpLoading}
              >
                {otpLoading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.btnText}>{t('phoneVerification.sendCode')}</Text>}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {t('phoneVerification.otpSubtitle').replace('{{phone}}', phone)}
              </Text>
              <View style={[
                styles.inputRow,
                { backgroundColor: colors.background, borderColor: colors.border },
              ]}>
                <Ionicons name="shield-checkmark-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.otpInput, { color: colors.text }]}
                  placeholder={t('phoneVerification.codePlaceholder')}
                  placeholderTextColor={colors.textSecondary}
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                  textAlign="center"
                  autoFocus
                />
              </View>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: colors.primary }, otpLoading && styles.disabled]}
                onPress={handleVerifyOtp}
                disabled={otpLoading}
              >
                {otpLoading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.btnText}>{t('phoneVerification.verify')}</Text>}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setStep(1); setOtp(''); }} style={styles.resendBtn}>
                <Text style={[styles.resendText, { color: colors.primary }]}>
                  {t('phoneVerification.resend')}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  stepLine: {
    flex: 1,
    height: 2,
    marginHorizontal: 6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 13,
    paddingHorizontal: 12,
    height: 52,
    marginBottom: 16,
  },
  inputIcon: { marginEnd: 10 },
  input: { flex: 1, fontSize: 15, height: 52 },
  otpInput: { fontSize: 22, letterSpacing: 8, fontWeight: '700' },
  btn: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  disabled: { opacity: 0.7 },
  resendBtn: { alignItems: 'center', marginTop: 14 },
  resendText: { fontSize: 14, fontWeight: '600' },
});
