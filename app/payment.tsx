import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { AppDispatch, RootState } from '@/store';
import {
    capturePaypalOrder,
    clearCurrentPayment,
    fetchPaymentMethods,
    getPaymentStatus,
    initiatePayment,
    PaymentContext,
    PaymentMethod,
    PaymentProvider,
    uploadOfflineReceipt,
} from '@/store/slices/paymentSlice';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { CheckCircle, XCircle } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';
import { useDispatch, useSelector } from 'react-redux';

// ─── Types ───────────────────────────────────────────────────────────────────

type Step = 'select' | 'webview' | 'offline' | 'result';

const OFFLINE_PROVIDERS: PaymentProvider[] = ['bank_transfer', 'wallet', 'instapay'];
const ONLINE_PROVIDERS: PaymentProvider[] = ['paymob', 'paypal'];

// ─── Component ───────────────────────────────────────────────────────────────

export default function PaymentScreen() {
    const { colors } = useTheme();
    const { t, language } = useLanguage();
    const isArabic = language === 'ar';
    const dispatch = useDispatch<AppDispatch>();

    // Route params: amount, currency, context, description, metadata (JSON string)
    const params = useLocalSearchParams<{
        amount: string;
        currency?: string;
        context?: string;
        description?: string;
        metadata?: string;
    }>();

    const amount = params.amount ?? '0';
    const currency = params.currency ?? 'EGP';
    const payContext = (params.context ?? 'product_purchase') as PaymentContext;
    const description = params.description ?? '';
    const metadata = params.metadata ? JSON.parse(params.metadata) : {};

    const {
        methods,
        currentPayment,
        paymentStatus,
        methodsLoading,
        initiating,
        statusLoading,
        uploading,
        capturing,
        error,
    } = useSelector((s: RootState) => s.payment);

    const [step, setStep] = useState<Step>('select');
    const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | null>(null);
    const [receiptUploaded, setReceiptUploaded] = useState(false);
    const [resultStatus, setResultStatus] = useState<'success' | 'failed' | 'pending' | 'cancelled' | null>(null);

    // PayPal return URL we pass — we detect navigation to this URL in the WebView
    const PAYPAL_RETURN_URL = 'https://idrissimart.com/payment/success';
    const PAYPAL_CANCEL_URL = 'https://idrissimart.com/payment/cancel';

    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Fetch methods on mount
    useEffect(() => {
        dispatch(fetchPaymentMethods(payContext));
        return () => {
            dispatch(clearCurrentPayment());
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, []);

    // ─── Helpers ─────────────────────────────────────────────────────────────

    const startPolling = useCallback((paymentId: number) => {
        if (pollingRef.current) clearInterval(pollingRef.current);
        pollingRef.current = setInterval(async () => {
            const action = await dispatch(getPaymentStatus(paymentId));
            if (getPaymentStatus.fulfilled.match(action)) {
                const status = action.payload.status;
                if (status !== 'pending') {
                    clearInterval(pollingRef.current!);
                    pollingRef.current = null;
                    setResultStatus(status === 'completed' ? 'success' : status === 'cancelled' ? 'cancelled' : 'failed');
                    setStep('result');
                }
            }
        }, 3000);
    }, [dispatch]);

    const handleSelectProvider = async (provider: PaymentProvider) => {
        setSelectedProvider(provider);

        const payload: Parameters<typeof initiatePayment>[0] = {
            provider,
            amount,
            currency,
            description,
            context: payContext,
            metadata,
        };

        // PayPal needs return/cancel URLs
        if (provider === 'paypal') {
            payload.return_url = PAYPAL_RETURN_URL;
            payload.cancel_url = PAYPAL_CANCEL_URL;
        }

        const action = await dispatch(initiatePayment(payload));

        if (initiatePayment.rejected.match(action)) {
            Alert.alert(t('common.error'), action.payload as string || t('payment.errorInitiate'));
            return;
        }

        const response = action.payload;

        if (ONLINE_PROVIDERS.includes(provider)) {
            setStep('webview');
        } else {
            setStep('offline');
        }
    };

    // ─── WebView navigation handler ───────────────────────────────────────────

    const handleWebViewNav = useCallback(
        async (url: string) => {
            if (!currentPayment) return;

            // Paymob: payment result is handled via webhook; poll status when user comes back
            // PayPal: detect redirect to return_url and extract token
            if (selectedProvider === 'paypal') {
                if (url.startsWith(PAYPAL_RETURN_URL)) {
                    const urlObj = new URL(url);
                    const token = urlObj.searchParams.get('token');
                    if (token) {
                        const captureAction = await dispatch(
                            capturePaypalOrder({ payment_id: currentPayment.payment_id, paypal_order_id: token })
                        );
                        if (capturePaypalOrder.fulfilled.match(captureAction)) {
                            setResultStatus('success');
                        } else {
                            setResultStatus('failed');
                        }
                        setStep('result');
                        return true; // signal to block navigation
                    }
                }
                if (url.startsWith(PAYPAL_CANCEL_URL)) {
                    setResultStatus('cancelled');
                    setStep('result');
                    return true;
                }
            }

            if (selectedProvider === 'paymob') {
                // Paymob redirects to redirection_url after payment; fall back to polling
                if (url.includes('success') || url.includes('fail') || url.includes('pending')) {
                    startPolling(currentPayment.payment_id);
                    setStep('result');
                    setResultStatus('pending');
                    return true;
                }
            }

            return false;
        },
        [currentPayment, selectedProvider, dispatch, startPolling]
    );

    // ─── Receipt upload ───────────────────────────────────────────────────────

    const handleUploadReceipt = async () => {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
            Alert.alert('', t('errors.permissionDenied'));
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.85,
            allowsEditing: false,
        });

        if (result.canceled || !result.assets?.length) return;

        const asset = result.assets[0];
        const mimeType = asset.mimeType ?? 'image/jpeg';

        const action = await dispatch(
            uploadOfflineReceipt({
                paymentId: currentPayment!.payment_id,
                imageUri: asset.uri,
                mimeType,
            })
        );

        if (uploadOfflineReceipt.fulfilled.match(action)) {
            setReceiptUploaded(true);
        } else {
            Alert.alert(t('common.error'), action.payload as string || t('payment.errorUpload'));
        }
    };

    const handleCheckStatus = async () => {
        if (!currentPayment) return;
        const action = await dispatch(getPaymentStatus(currentPayment.payment_id));
        if (getPaymentStatus.fulfilled.match(action)) {
            const s = action.payload.status;
            if (s === 'completed') {
                setResultStatus('success');
                setStep('result');
            } else if (s === 'failed' || s === 'cancelled') {
                setResultStatus(s === 'failed' ? 'failed' : 'cancelled');
                setStep('result');
            }
        }
    };

    // ─── Rendering ───────────────────────────────────────────────────────────

    const renderMethodItem = (method: PaymentMethod) => {
        const provider = method.code as PaymentProvider;
        const isOnline = ONLINE_PROVIDERS.includes(provider);
        const icon = providerIcon(provider);

        return (
            <TouchableOpacity
                key={method.code}
                style={[styles.methodCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => handleSelectProvider(provider)}
                activeOpacity={0.75}
                disabled={initiating}
            >
                <View style={[styles.methodIcon, { backgroundColor: isOnline ? colors.primary + '18' : colors.secondary + '18' }]}>
                    <Ionicons name={icon} size={22} color={isOnline ? colors.primary : colors.secondary} />
                </View>
                <View style={styles.methodInfo}>
                    <Text style={[styles.methodLabel, { color: colors.text, textAlign: isArabic ? 'right' : 'left' }]}>
                        {method.label}
                    </Text>
                    <Text style={[styles.methodType, { color: colors.fontSecondary, textAlign: isArabic ? 'right' : 'left' }]}>
                        {isOnline ? t('payment.online') : t('payment.offline')}
                    </Text>
                </View>
                <Ionicons
                    name={isArabic ? 'chevron-back' : 'chevron-forward'}
                    size={18}
                    color={colors.fontSecondary}
                />
            </TouchableOpacity>
        );
    };

    // ─── Step: select ─────────────────────────────────────────────────────────

    if (step === 'select') {
        return (
            <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['top']}>
                <Header title={t('payment.title')} isArabic={isArabic} colors={colors} onBack={() => router.back()} />

                {/* Amount summary */}
                <View style={[styles.amountBox, { backgroundColor: colors.primary + '12', borderColor: colors.primary + '30' }]}>
                    <Text style={[styles.amountLabel, { color: colors.fontSecondary }]}>{t('payment.total')}</Text>
                    <Text style={[styles.amountValue, { color: colors.primary }]}>
                        {parseFloat(amount).toLocaleString()} {currency}
                    </Text>
                </View>

                <Text style={[styles.sectionTitle, { color: colors.fontSecondary, textAlign: isArabic ? 'right' : 'left' }]}>
                    {t('payment.selectMethod')}
                </Text>

                {methodsLoading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                ) : error && methods.length === 0 ? (
                    <View style={styles.center}>
                        <Text style={{ color: colors.fontSecondary, textAlign: 'center' }}>{t('payment.errorFetch')}</Text>
                        <TouchableOpacity
                            style={[styles.btn, { backgroundColor: colors.primary, marginTop: 16 }]}
                            onPress={() => dispatch(fetchPaymentMethods(payContext))}
                        >
                            <Text style={styles.btnText}>{t('common.retry')}</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <ScrollView contentContainerStyle={styles.methodList} showsVerticalScrollIndicator={false}>
                        {methods.map(renderMethodItem)}
                    </ScrollView>
                )}

                {initiating && (
                    <View style={styles.overlay}>
                        <ActivityIndicator size="large" color="#fff" />
                        <Text style={styles.overlayText}>{t('payment.initiating')}</Text>
                    </View>
                )}
            </SafeAreaView>
        );
    }

    // ─── Step: webview ────────────────────────────────────────────────────────

    if (step === 'webview') {
        const url =
            selectedProvider === 'paypal'
                ? currentPayment?.approval_url
                : currentPayment?.checkout_url;

        if (!url) {
            return (
                <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['top']}>
                    <Header title={t('payment.title')} isArabic={isArabic} colors={colors} onBack={() => setStep('select')} />
                    <View style={styles.center}>
                        <Text style={{ color: colors.fontSecondary }}>{t('payment.errorInitiate')}</Text>
                    </View>
                </SafeAreaView>
            );
        }

        return (
            <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['top']}>
                <Header title={t('payment.title')} isArabic={isArabic} colors={colors} onBack={() => setStep('select')} />
                {(capturing) && (
                    <View style={styles.overlay}>
                        <ActivityIndicator size="large" color="#fff" />
                        <Text style={styles.overlayText}>{t('payment.processing')}</Text>
                    </View>
                )}
                <WebView
                    source={{ uri: url }}
                    style={{ flex: 1 }}
                    onNavigationStateChange={(navState) => {
                        handleWebViewNav(navState.url);
                    }}
                />
            </SafeAreaView>
        );
    }

    // ─── Step: offline ────────────────────────────────────────────────────────

    if (step === 'offline') {
        return (
            <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['top']}>
                <Header title={t('payment.title')} isArabic={isArabic} colors={colors} onBack={() => setStep('select')} />

                <ScrollView contentContainerStyle={styles.offlineContainer}>
                    <View style={[styles.amountBox, { backgroundColor: colors.primary + '12', borderColor: colors.primary + '30' }]}>
                        <Text style={[styles.amountLabel, { color: colors.fontSecondary }]}>{t('payment.total')}</Text>
                        <Text style={[styles.amountValue, { color: colors.primary }]}>
                            {parseFloat(amount).toLocaleString()} {currency}
                        </Text>
                    </View>

                    <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={[styles.infoTitle, { color: colors.text, textAlign: isArabic ? 'right' : 'left' }]}>
                            {t('payment.uploadReceipt')}
                        </Text>
                        <Text style={[styles.infoDesc, { color: colors.fontSecondary, textAlign: isArabic ? 'right' : 'left' }]}>
                            {t('payment.uploadReceiptDesc')}
                        </Text>
                    </View>

                    {receiptUploaded ? (
                        <View style={styles.center}>
                            <CheckCircle size={56} color="#22C55E" />
                            <Text style={[styles.resultTitle, { color: colors.text }]}>{t('payment.receiptUploaded')}</Text>
                            <Text style={[styles.resultDesc, { color: colors.fontSecondary, textAlign: 'center' }]}>
                                {t('payment.receiptUploadedDesc')}
                            </Text>
                            <TouchableOpacity
                                style={[styles.btn, { backgroundColor: colors.primary, marginTop: 24 }]}
                                onPress={handleCheckStatus}
                                disabled={statusLoading}
                            >
                                {statusLoading
                                    ? <ActivityIndicator color="#fff" />
                                    : <Text style={styles.btnText}>{t('payment.checkStatus')}</Text>
                                }
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.btnOutline, { borderColor: colors.border, marginTop: 12 }]}
                                onPress={() => router.back()}
                            >
                                <Text style={[styles.btnOutlineText, { color: colors.text }]}>{t('payment.done')}</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={[styles.btn, { backgroundColor: colors.primary, marginTop: 8 }]}
                            onPress={handleUploadReceipt}
                            disabled={uploading}
                        >
                            {uploading
                                ? <ActivityIndicator color="#fff" />
                                : <Text style={styles.btnText}>{t('payment.chooseImage')}</Text>
                            }
                        </TouchableOpacity>
                    )}
                </ScrollView>
            </SafeAreaView>
        );
    }

    // ─── Step: result ─────────────────────────────────────────────────────────

    const isSuccess = resultStatus === 'success';
    const isPending = resultStatus === 'pending';

    return (
        <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['top']}>
            <Header title={t('payment.title')} isArabic={isArabic} colors={colors} onBack={() => router.back()} />

            <View style={styles.resultContainer}>
                {isSuccess ? (
                    <CheckCircle size={72} color="#22C55E" />
                ) : isPending ? (
                    <Ionicons name="time-outline" size={72} color={colors.primary} />
                ) : (
                    <XCircle size={72} color="#EF4444" />
                )}

                <Text style={[styles.resultTitle, { color: colors.text }]}>
                    {isSuccess
                        ? t('payment.success')
                        : isPending
                        ? t('payment.pending')
                        : resultStatus === 'cancelled'
                        ? t('payment.cancelled')
                        : t('payment.failed')}
                </Text>
                <Text style={[styles.resultDesc, { color: colors.fontSecondary, textAlign: 'center' }]}>
                    {isSuccess
                        ? t('payment.successDesc')
                        : isPending
                        ? t('payment.pendingDesc')
                        : resultStatus === 'cancelled'
                        ? t('payment.cancelledDesc')
                        : t('payment.failedDesc')}
                </Text>

                {isPending && (
                    <TouchableOpacity
                        style={[styles.btn, { backgroundColor: colors.primary, marginTop: 24 }]}
                        onPress={handleCheckStatus}
                        disabled={statusLoading}
                    >
                        {statusLoading
                            ? <ActivityIndicator color="#fff" />
                            : <Text style={styles.btnText}>{t('payment.checkStatus')}</Text>
                        }
                    </TouchableOpacity>
                )}

                {!isSuccess && !isPending && (
                    <TouchableOpacity
                        style={[styles.btn, { backgroundColor: colors.primary, marginTop: 24 }]}
                        onPress={() => {
                            setStep('select');
                            setSelectedProvider(null);
                            setResultStatus(null);
                            dispatch(clearCurrentPayment());
                        }}
                    >
                        <Text style={styles.btnText}>{t('payment.tryAgain')}</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={[styles.btnOutline, { borderColor: colors.border, marginTop: 12 }]}
                    onPress={() => router.back()}
                >
                    <Text style={[styles.btnOutlineText, { color: colors.text }]}>{t('payment.done')}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

// ─── Header ──────────────────────────────────────────────────────────────────

function Header({
    title,
    isArabic,
    colors,
    onBack,
}: {
    title: string;
    isArabic: boolean;
    colors: any;
    onBack: () => void;
}) {
    return (
        <View style={[styles.header, { borderBottomColor: colors.border }, isArabic && styles.headerRTL]}>
            <TouchableOpacity onPress={onBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons
                    name={isArabic ? 'chevron-forward' : 'chevron-back'}
                    size={24}
                    color={colors.text}
                />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>{title}</Text>
            <View style={{ width: 24 }} />
        </View>
    );
}

// ─── Utils ────────────────────────────────────────────────────────────────────

function providerIcon(provider: PaymentProvider): keyof typeof Ionicons.glyphMap {
    switch (provider) {
        case 'paymob': return 'card-outline';
        case 'paypal': return 'logo-paypal';
        case 'bank_transfer': return 'business-outline';
        case 'wallet': return 'wallet-outline';
        case 'instapay': return 'phone-portrait-outline';
        default: return 'cash-outline';
    }
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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
    headerTitle: { fontSize: 18, fontWeight: '700' },

    amountBox: {
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 14,
        borderWidth: 1,
        paddingVertical: 16,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    amountLabel: { fontSize: 13, marginBottom: 4 },
    amountValue: { fontSize: 28, fontWeight: '800' },

    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        marginTop: 20,
        marginBottom: 8,
        paddingHorizontal: 16,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    methodList: { paddingHorizontal: 16, paddingBottom: 32, gap: 10 },
    methodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 14,
        borderWidth: StyleSheet.hairlineWidth,
        padding: 14,
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    methodIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    methodInfo: { flex: 1, gap: 2 },
    methodLabel: { fontSize: 15, fontWeight: '600' },
    methodType: { fontSize: 12 },

    center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },

    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 99,
        gap: 14,
    },
    overlayText: { color: '#fff', fontSize: 16, fontWeight: '600' },

    offlineContainer: { padding: 16, gap: 14, paddingBottom: 40 },
    infoCard: {
        borderRadius: 14,
        borderWidth: StyleSheet.hairlineWidth,
        padding: 16,
        gap: 8,
    },
    infoTitle: { fontSize: 16, fontWeight: '700' },
    infoDesc: { fontSize: 14, lineHeight: 20 },

    resultContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        gap: 12,
    },
    resultTitle: { fontSize: 22, fontWeight: '800', textAlign: 'center', marginTop: 8 },
    resultDesc: { fontSize: 14, lineHeight: 21 },

    btn: {
        width: '100%',
        height: 52,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    btnOutline: {
        width: '100%',
        height: 52,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    btnOutlineText: { fontSize: 16, fontWeight: '600' },
});
