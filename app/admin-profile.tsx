import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { AppDispatch, RootState } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
    BarChart2,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    Globe,
    LogOut,
    Settings,
    Shield,
    ShieldCheck,
    Tag,
    Users,
} from 'lucide-react-native';
import React from 'react';
import {
    Alert,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

// ─── helpers ─────────────────────────────────────────────────────────────────

function initials(first: string, last: string) {
    return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase() || '?';
}

// ─── components ──────────────────────────────────────────────────────────────

interface MenuRowProps {
    icon: React.ReactNode;
    label: string;
    sublabel?: string;
    onPress: () => void;
    isArabic: boolean;
    colors: any;
    danger?: boolean;
    badge?: string | number;
}

function MenuRow({ icon, label, sublabel, onPress, isArabic, colors, danger, badge }: MenuRowProps) {
    const ChevronIcon = isArabic ? ChevronLeft : ChevronRight;
    return (
        <TouchableOpacity
            style={[styles.menuRow, { borderBottomColor: colors.border }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.menuIcon, { backgroundColor: danger ? colors.error + '15' : colors.primary + '14' }]}>
                {icon}
            </View>
            <View style={styles.menuTextWrap}>
                <Text style={[styles.menuLabel, { color: danger ? colors.error : colors.text }]}>
                    {label}
                </Text>
                {sublabel ? (
                    <Text style={[styles.menuSublabel, { color: colors.fontSecondary }]}>{sublabel}</Text>
                ) : null}
            </View>
            {badge != null ? (
                <View style={[styles.badge, { backgroundColor: colors.secondary }]}>
                    <Text style={styles.badgeText}>{badge}</Text>
                </View>
            ) : null}
            <ChevronIcon size={16} color={colors.fontSecondary} />
        </TouchableOpacity>
    );
}

function StatCard({
    value,
    label,
    icon,
    color,
    colors,
}: {
    value: string | number;
    label: string;
    icon: React.ReactNode;
    color: string;
    colors: any;
}) {
    return (
        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.statIconWrap, { backgroundColor: color + '18' }]}>{icon}</View>
            <Text style={[styles.statValue, { color }]}>{value}</Text>
            <Text style={[styles.statLabel, { color: colors.fontSecondary }]}>{label}</Text>
        </View>
    );
}

// ─── screen ──────────────────────────────────────────────────────────────────

export default function AdminProfileScreen() {
    const { colors } = useTheme();
    const { language, t } = useLanguage();
    const isArabic = language === 'ar';
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((s: RootState) => s.auth);

    const handleLogout = () => {
        Alert.alert(
            isArabic ? 'تسجيل الخروج' : 'Sign Out',
            isArabic ? 'هل أنت متأكد من تسجيل الخروج؟' : 'Are you sure you want to sign out?',
            [
                { text: isArabic ? 'إلغاء' : 'Cancel', style: 'cancel' },
                {
                    text: isArabic ? 'تسجيل الخروج' : 'Sign Out',
                    style: 'destructive',
                    onPress: () => dispatch(logout()),
                },
            ]
        );
    };

    if (!user) return null;

    const roleLabel = user.is_superuser
        ? (isArabic ? 'مشرف عام' : 'Super Admin')
        : (isArabic ? 'مدير النظام' : 'Administrator');

    return (
        <View style={[styles.root, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

            <ScrollView showsVerticalScrollIndicator={false} bounces>

                {/* ── Header ───────────────────────────────────────────────── */}
                <View style={[styles.header, { backgroundColor: colors.primary }]}>
                    <View style={styles.circle1} />
                    <View style={styles.circle2} />

                    {/* Settings */}
                    <TouchableOpacity
                        style={styles.settingsBtn}
                        onPress={() => router.push('/settings')}
                    >
                        <Settings size={22} color="#fff" />
                    </TouchableOpacity>

                    {/* Admin badge top */}
                    <View style={styles.adminBadgeRow}>
                        <Shield size={14} color="#fff" fill="rgba(255,255,255,0.3)" />
                        <Text style={styles.adminBadgeText}>{roleLabel}</Text>
                    </View>

                    {/* Avatar */}
                    <View style={styles.avatarWrap}>
                        <View style={[styles.avatar, { backgroundColor: '#6366F1' }]}>
                            <Text style={styles.avatarText}>
                                {initials(user.first_name, user.last_name)}
                            </Text>
                        </View>
                        <View style={[styles.adminDot, { backgroundColor: '#22C55E' }]} />
                    </View>

                    <Text style={styles.userName}>{user.first_name} {user.last_name}</Text>
                    <Text style={styles.userHandle}>@{user.username}</Text>

                    <View style={styles.tagRow}>
                        <View style={[styles.tag, { backgroundColor: 'rgba(255,255,255,0.22)' }]}>
                            <ShieldCheck size={11} color="#fff" />
                            <Text style={styles.tagText}>
                                {isArabic ? 'وصول كامل' : 'Full Access'}
                            </Text>
                        </View>
                        {user.is_superuser && (
                            <View style={[styles.tag, { backgroundColor: '#6366F1' }]}>
                                <Text style={styles.tagText}>
                                    {isArabic ? 'سوبر أدمن' : 'Superuser'}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* ── Stats ────────────────────────────────────────────────── */}
                <View style={styles.statsRow}>
                    <StatCard
                        value={user.total_ads ?? 0}
                        label={isArabic ? 'الإعلانات' : 'Ads'}
                        icon={<ClipboardList size={18} color={colors.primary} />}
                        color={colors.primary}
                        colors={colors}
                    />
                    <StatCard
                        value={user.active_ads ?? 0}
                        label={isArabic ? 'نشطة' : 'Active'}
                        icon={<BarChart2 size={18} color="#22C55E" />}
                        color="#22C55E"
                        colors={colors}
                    />
                    <StatCard
                        value={user.total_reviews ?? 0}
                        label={isArabic ? 'المراجعات' : 'Reviews'}
                        icon={<Tag size={18} color="#F59E0B" />}
                        color="#F59E0B"
                        colors={colors}
                    />
                </View>

                {/* ── Account info ─────────────────────────────────────────── */}
                <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
                    <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.infoLabel, { color: colors.fontSecondary }]}>
                            {isArabic ? 'البريد الإلكتروني' : 'Email'}
                        </Text>
                        <Text style={[styles.infoValue, { color: colors.text }]}>{user.email}</Text>
                    </View>
                    {(user.phone || user.mobile) && (
                        <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
                            <Text style={[styles.infoLabel, { color: colors.fontSecondary }]}>
                                {isArabic ? 'الهاتف' : 'Phone'}
                            </Text>
                            <Text style={[styles.infoValue, { color: colors.text }]}>
                                {user.phone ?? user.mobile}
                            </Text>
                        </View>
                    )}
                    <View style={[styles.infoRow, { borderBottomColor: 'transparent' }]}>
                        <Text style={[styles.infoLabel, { color: colors.fontSecondary }]}>
                            {isArabic ? 'الدور' : 'Role'}
                        </Text>
                        <View style={[styles.roleChip, { backgroundColor: colors.primary + '18' }]}>
                            <Text style={[styles.roleChipText, { color: colors.primary }]}>{roleLabel}</Text>
                        </View>
                    </View>
                </View>

                {/* ── Management section ───────────────────────────────────── */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.fontSecondary }]}>
                        {isArabic ? 'إدارة النظام' : 'System Management'}
                    </Text>
                </View>
                <View style={[styles.menuCard, { backgroundColor: colors.surface }]}>
                    <MenuRow
                        icon={<Users size={18} color={colors.primary} />}
                        label={isArabic ? 'إدارة المستخدمين' : 'Manage Users'}
                        sublabel={isArabic ? 'عرض وتعديل الحسابات' : 'View and edit accounts'}
                        onPress={() => {}}
                        isArabic={isArabic}
                        colors={colors}
                    />
                    <MenuRow
                        icon={<ClipboardList size={18} color={colors.primary} />}
                        label={isArabic ? 'إدارة الإعلانات' : 'Manage Ads'}
                        sublabel={isArabic ? 'مراجعة وإدارة الإعلانات' : 'Review and manage listings'}
                        onPress={() => {}}
                        isArabic={isArabic}
                        colors={colors}
                    />
                    <MenuRow
                        icon={<Tag size={18} color={colors.primary} />}
                        label={isArabic ? 'إدارة الفئات' : 'Manage Categories'}
                        onPress={() => {}}
                        isArabic={isArabic}
                        colors={colors}
                    />
                    <MenuRow
                        icon={<BarChart2 size={18} color={colors.primary} />}
                        label={isArabic ? 'التقارير والإحصاءات' : 'Reports & Analytics'}
                        onPress={() => {}}
                        isArabic={isArabic}
                        colors={colors}
                    />
                    <MenuRow
                        icon={<Globe size={18} color={colors.primary} />}
                        label={isArabic ? 'إدارة المدفوعات' : 'Payment Management'}
                        sublabel={isArabic ? 'مراجعة المعاملات' : 'Review transactions'}
                        onPress={() => {}}
                        isArabic={isArabic}
                        colors={colors}
                    />
                </View>

                {/* ── App section ──────────────────────────────────────────── */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.fontSecondary }]}>
                        {isArabic ? 'التطبيق' : 'Application'}
                    </Text>
                </View>
                <View style={[styles.menuCard, { backgroundColor: colors.surface }]}>
                    <MenuRow
                        icon={<Settings size={18} color={colors.primary} />}
                        label={isArabic ? 'الإعدادات' : 'Settings'}
                        onPress={() => router.push('/settings')}
                        isArabic={isArabic}
                        colors={colors}
                    />
                    <MenuRow
                        icon={<ShieldCheck size={18} color={colors.primary} />}
                        label={isArabic ? 'الأمان والخصوصية' : 'Security & Privacy'}
                        onPress={() => {}}
                        isArabic={isArabic}
                        colors={colors}
                    />
                </View>

                <View style={styles.sectionHeader} />
                <View style={[styles.menuCard, { backgroundColor: colors.surface }]}>
                    <MenuRow
                        icon={<LogOut size={18} color={colors.error} />}
                        label={isArabic ? 'تسجيل الخروج' : 'Sign Out'}
                        onPress={handleLogout}
                        isArabic={isArabic}
                        colors={colors}
                        danger
                    />
                </View>

                <Text style={[styles.version, { color: colors.fontSecondary }]}>
                    Idrissimart Admin v1.0.0
                </Text>
            </ScrollView>
        </View>
    );
}

// ─── styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    root: { flex: 1 },

    header: {
        paddingTop: Platform.OS === 'ios' ? 56 : (StatusBar.currentHeight ?? 0) + 16,
        paddingBottom: 32,
        alignItems: 'center',
        overflow: 'hidden',
    },
    circle1: {
        position: 'absolute',
        width: 240,
        height: 240,
        borderRadius: 120,
        backgroundColor: 'rgba(255,255,255,0.06)',
        top: -80,
        right: -70,
    },
    circle2: {
        position: 'absolute',
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: 'rgba(255,255,255,0.06)',
        bottom: -50,
        left: -50,
    },
    settingsBtn: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 56 : (StatusBar.currentHeight ?? 0) + 16,
        right: 16,
        padding: 6,
    },
    adminBadgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
        marginBottom: 14,
    },
    adminBadgeText: { fontSize: 12, fontWeight: '700', color: '#fff' },
    avatarWrap: { marginBottom: 12, position: 'relative' },
    avatar: {
        width: 88,
        height: 88,
        borderRadius: 44,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    avatarText: {
        fontSize: 32,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: 1,
    },
    adminDot: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#fff',
    },
    userName: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 2 },
    userHandle: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 10 },
    tagRow: { flexDirection: 'row', gap: 8 },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    },
    tagText: { fontSize: 12, fontWeight: '600', color: '#fff' },

    statsRow: {
        flexDirection: 'row',
        gap: 10,
        paddingHorizontal: 16,
        marginTop: 16,
        marginBottom: 12,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 14,
        borderRadius: 14,
        gap: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 6,
        elevation: 2,
    },
    statIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 2,
    },
    statValue: { fontSize: 20, fontWeight: '800' },
    statLabel: { fontSize: 11, fontWeight: '500' },

    infoCard: {
        marginHorizontal: 16,
        borderRadius: 14,
        marginBottom: 4,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 6,
        elevation: 2,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 13,
        borderBottomWidth: 1,
    },
    infoLabel: { fontSize: 13, fontWeight: '500' },
    infoValue: { fontSize: 13, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
    roleChip: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    roleChipText: { fontSize: 12, fontWeight: '700' },

    sectionHeader: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 6 },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    menuCard: {
        marginHorizontal: 16,
        borderRadius: 14,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 6,
        elevation: 2,
    },
    menuRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 13,
        borderBottomWidth: 1,
        gap: 12,
    },
    menuIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuTextWrap: { flex: 1 },
    menuLabel: { fontSize: 14, fontWeight: '600' },
    menuSublabel: { fontSize: 12, marginTop: 1 },
    badge: {
        borderRadius: 10,
        paddingHorizontal: 7,
        paddingVertical: 2,
    },
    badgeText: { fontSize: 11, fontWeight: '700', color: '#fff' },

    version: { textAlign: 'center', fontSize: 12, marginTop: 16, marginBottom: 32 },
});
