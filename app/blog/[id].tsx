import { API_ENDPOINTS } from '@/config/api.config';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { BlogComment, BlogPostDetail } from '@/services/api';
import apiClient from '@/services/apiClient';
import { RootState } from '@/store';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, ChevronRight, Heart, MessageCircle, Send, Share2 } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

// ── HTML stripping helper ─────────────────────────────────────────────────────
const stripHtml = (html: string): string => {
    return html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<\/li>/gi, '\n')
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\n{3,}/g, '\n\n')
        .trim();
};

// ── Comment item (recursive for replies) ──────────────────────────────────────
interface CommentItemProps {
    comment: BlogComment;
    isArabic: boolean;
    colors: any;
    t: (key: string) => string;
    onReply: (comment: BlogComment) => void;
    depth?: number;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, isArabic, colors, t, onReply, depth = 0 }) => {
    const authorName = [comment.author.first_name, comment.author.last_name].filter(Boolean).join(' ')
        || comment.author.username;

    const formattedDate = comment.created_on
        ? new Date(comment.created_on).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
        : '';

    return (
        <View style={[
            styles.commentItem,
            depth > 0 && styles.replyItem,
            depth > 0 && {
                borderLeftWidth: isArabic ? 0 : 2,
                borderRightWidth: isArabic ? 2 : 0,
                borderLeftColor: isArabic ? 'transparent' : colors.primary + '40',
                borderRightColor: isArabic ? colors.primary + '40' : 'transparent',
                marginLeft: isArabic ? 0 : 16,
                marginRight: isArabic ? 16 : 0,
                paddingLeft: isArabic ? 0 : 12,
                paddingRight: isArabic ? 12 : 0,
            },
        ]}>
            <View style={styles.commentHeader}>
                {comment.author.profile_image ? (
                    <Image source={{ uri: comment.author.profile_image }} style={styles.commentAvatar} />
                ) : (
                    <View style={[styles.commentAvatar, styles.commentAvatarPlaceholder, { backgroundColor: colors.primary + '20' }]}>
                        <Ionicons name="person-outline" size={14} color={colors.primary} />
                    </View>
                )}
                <View style={{ flex: 1 }}>
                    <Text style={[styles.commentAuthor, { color: colors.text }]}>{authorName}</Text>
                    <Text style={[styles.commentDate, { color: colors.fontSecondary }]}>{formattedDate}</Text>
                </View>
                {depth === 0 && (
                    <TouchableOpacity onPress={() => onReply(comment)} style={styles.replyBtn}>
                        <Text style={[styles.replyBtnText, { color: colors.primary }]}>{t('blogs.reply')}</Text>
                    </TouchableOpacity>
                )}
            </View>
            <Text style={[styles.commentBody, { color: colors.text, paddingLeft: isArabic ? 0 : 42, paddingRight: isArabic ? 42 : 0 }]}>{comment.body}</Text>
            {(comment.replies ?? []).map(reply => (
                <CommentItem
                    key={reply.id}
                    comment={reply}
                    isArabic={isArabic}
                    colors={colors}
                    t={t}
                    onReply={onReply}
                    depth={depth + 1}
                />
            ))}
        </View>
    );
};

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function BlogDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { colors } = useTheme();
    const { t, language } = useLanguage();
    const isArabic = language === 'ar';
    const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);

    const [post, setPost] = useState<BlogPostDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [likeLoading, setLikeLoading] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [replyTo, setReplyTo] = useState<BlogComment | null>(null);
    const [commentLoading, setCommentLoading] = useState(false);
    const [comments, setComments] = useState<BlogComment[]>([]);

    const scrollRef = useRef<ScrollView>(null);
    const commentInputRef = useRef<TextInput>(null);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        setError(false);
        apiClient
            .get(API_ENDPOINTS.BLOG.POST_DETAIL(id))
            .then(res => {
                const data: BlogPostDetail = res.data;
                setPost(data);
                setLiked(data.is_liked ?? false);
                setLikesCount(data.likes_count ?? 0);
                setComments(data.comments ?? []);
            })
            .catch((err) => {
                console.error('[BlogDetail] fetch failed:', err?.response?.status, err?.response?.data ?? err?.message);
                setError(true);
            })
            .finally(() => setLoading(false));
    }, [id]);

    const handleLike = async () => {
        if (!isAuthenticated) {
            Alert.alert('', t('blogs.loginToLike'));
            return;
        }
        if (!post) return;
        setLikeLoading(true);
        try {
            const res = await apiClient.post(API_ENDPOINTS.BLOG.LIKE(post.id));
            setLiked(res.data.status === 'liked');
            setLikesCount(res.data.likes_count);
        } catch {
            Alert.alert('', t('blogs.likeError'));
        } finally {
            setLikeLoading(false);
        }
    };

    const handleShare = async () => {
        if (!post) return;
        try {
            await Share.share({
                title: post.title,
                message: post.title,
                url: post.image || undefined,
            });
        } catch {
            // ignore
        }
    };

    const handleReply = (comment: BlogComment) => {
        setReplyTo(comment);
        commentInputRef.current?.focus();
    };

    const handleSubmitComment = async () => {
        if (!isAuthenticated) {
            Alert.alert('', t('blogs.loginToComment'));
            return;
        }
        const body = commentText.trim();
        if (!body) return;

        setCommentLoading(true);
        try {
            const payload: Record<string, unknown> = { body };
            if (replyTo?.id) payload.parent = replyTo.id;
            const res = await apiClient.post(API_ENDPOINTS.BLOG.COMMENT(post!.id), payload);
            const newComment: BlogComment = res.data;
            if (replyTo) {
                setComments(prev =>
                    prev.map(c =>
                        c.id === replyTo.id
                            ? { ...c, replies: [...(c.replies ?? []), newComment] }
                            : c
                    )
                );
            } else {
                setComments(prev => [...prev, newComment]);
            }
            setCommentText('');
            setReplyTo(null);
        } catch {
            Alert.alert('', t('blogs.commentError'));
        } finally {
            setCommentLoading(false);
        }
    };

    const formatDate = (dateStr?: string) =>
        dateStr
            ? new Date(dateStr).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            })
            : '';

    const authorName = post
        ? [post.author.first_name, post.author.last_name].filter(Boolean).join(' ') || post.author.username
        : '';

    // ── Loading ────────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
                <View style={styles.topBar}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        {isArabic
                            ? <ChevronRight size={24} color={colors.text} />
                            : <ChevronLeft size={24} color={colors.text} />}
                    </TouchableOpacity>
                </View>
                <View style={styles.centerLoader}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={[styles.loadingText, { color: colors.fontSecondary }]}>{t('blogs.loadingPost')}</Text>
                </View>
            </SafeAreaView>
        );
    }

    // ── Error ──────────────────────────────────────────────────────────────────
    if (error || !post) {
        return (
            <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
                <View style={styles.topBar}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        {isArabic
                            ? <ChevronRight size={24} color={colors.text} />
                            : <ChevronLeft size={24} color={colors.text} />}
                    </TouchableOpacity>
                </View>
                <View style={styles.centerLoader}>
                    <Ionicons name="alert-circle-outline" size={56} color={colors.border} />
                    <Text style={[styles.loadingText, { color: colors.fontSecondary }]}>{t('blogs.postNotFound')}</Text>
                    <TouchableOpacity
                        style={[styles.retryBtn, { backgroundColor: colors.primary }]}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.retryBtnText}>{t('common.back')}</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // ── Main Content ───────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
            {/* Top bar */}
            <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    {isArabic
                        ? <ChevronRight size={24} color={colors.text} />
                        : <ChevronLeft size={24} color={colors.text} />}
                </TouchableOpacity>
                <View style={styles.topBarActions}>
                    <TouchableOpacity onPress={handleLike} style={styles.actionBtn} disabled={likeLoading}>
                        <Heart
                            size={22}
                            color={liked ? '#e74c3c' : colors.text}
                            fill={liked ? '#e74c3c' : 'transparent'}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleShare} style={styles.actionBtn}>
                        <Share2 size={22} color={colors.text} />
                    </TouchableOpacity>
                </View>
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={0}
            >
                <ScrollView
                    ref={scrollRef}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Hero image */}
                    {post.image ? (
                        <View style={styles.heroImageWrap}>
                            <Image source={{ uri: post.image }} style={styles.heroImage} resizeMode="cover" />
                            {/* Category badge overlay */}
                            {post.category && (
                                <View style={[styles.heroCategoryBadge, { backgroundColor: post.category.color || colors.primary }]}>
                                    <Text style={styles.heroCategoryText} numberOfLines={1}>
                                        {isArabic ? post.category.name : (post.category.name_en || post.category.name)}
                                    </Text>
                                </View>
                            )}
                        </View>
                    ) : (
                        post.category && (
                            <View style={[styles.categoryPill, { backgroundColor: (post.category.color || colors.primary) + '20' }]}>
                                <Text style={[styles.categoryPillText, { color: post.category.color || colors.primary }]}>
                                    {isArabic ? post.category.name : (post.category.name_en || post.category.name)}
                                </Text>
                            </View>
                        )
                    )}

                    <View style={styles.body}>
                        {/* Title */}
                        <Text style={[styles.title, { color: colors.text }]}>{post.title}</Text>

                        {/* Meta row */}
                        <View style={styles.metaRow}>
                            {/* Author */}
                            <View style={styles.authorRow}>
                                {post.author.profile_image ? (
                                    <Image source={{ uri: post.author.profile_image }} style={styles.authorAvatar} />
                                ) : (
                                    <View style={[styles.authorAvatar, styles.authorAvatarPlaceholder, { backgroundColor: colors.primary + '20' }]}>
                                        <Ionicons name="person-outline" size={14} color={colors.primary} />
                                    </View>
                                )}
                                <View>
                                    <Text style={[styles.authorName, { color: colors.text }]}>{authorName}</Text>
                                    {post.author.verification_status === 'verified' && (
                                        <View style={styles.verifiedRow}>
                                            <Ionicons name="checkmark-circle" size={12} color="#10B981" />
                                            <Text style={[styles.verifiedText, { color: '#10B981' }]}>Verified</Text>
                                        </View>
                                    )}
                                </View>
                            </View>

                            {/* Stats */}
                            <View style={styles.statsCol}>
                                <View style={styles.statItem}>
                                    <Ionicons name="eye-outline" size={13} color={colors.fontSecondary} />
                                    <Text style={[styles.statText, { color: colors.fontSecondary }]}>{post.views_count}</Text>
                                </View>
                                <TouchableOpacity style={styles.statItem} onPress={handleLike} disabled={likeLoading}>
                                    <Heart
                                        size={13}
                                        color={liked ? '#e74c3c' : colors.fontSecondary}
                                        fill={liked ? '#e74c3c' : 'transparent'}
                                    />
                                    <Text style={[styles.statText, { color: liked ? '#e74c3c' : colors.fontSecondary }]}>
                                        {likesCount}
                                    </Text>
                                </TouchableOpacity>
                                <View style={styles.statItem}>
                                    <MessageCircle size={13} color={colors.fontSecondary} />
                                    <Text style={[styles.statText, { color: colors.fontSecondary }]}>{comments.length}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Dates */}
                        <View style={[styles.datesRow, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
                            <View style={styles.dateItem}>
                                <Ionicons name="calendar-outline" size={13} color={colors.fontSecondary} />
                                <Text style={[styles.dateLabel, { color: colors.fontSecondary }]}>{t('blogs.publishedOn')}</Text>
                                <Text style={[styles.dateValue, { color: colors.text }]}>{formatDate(post.published_date)}</Text>
                            </View>
                            {post.updated_date && post.updated_date !== post.published_date && (
                                <View style={styles.dateItem}>
                                    <Ionicons name="refresh-outline" size={13} color={colors.fontSecondary} />
                                    <Text style={[styles.dateLabel, { color: colors.fontSecondary }]}>{t('blogs.updatedOn')}</Text>
                                    <Text style={[styles.dateValue, { color: colors.text }]}>{formatDate(post.updated_date)}</Text>
                                </View>
                            )}
                        </View>

                        {/* Content */}
                        <Text style={[styles.content, { color: colors.text }]}>{stripHtml(post.content || '')}</Text>

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                            <View style={styles.tagsSection}>
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('blogs.relatedTags')}</Text>
                                <View style={styles.tagsRow}>
                                    {post.tags.map(tag => (
                                        <View key={tag} style={[styles.tagChip, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}>
                                            <Ionicons name="pricetag-outline" size={11} color={colors.primary} />
                                            <Text style={[styles.tagChipText, { color: colors.primary }]}>{tag}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Divider */}
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />

                        {/* Comments section */}
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            {t('blogs.comments')} ({comments.length})
                        </Text>

                        {comments.length === 0 ? (
                            <View style={styles.noCommentsWrap}>
                                <MessageCircle size={36} color={colors.border} />
                                <Text style={[styles.noCommentsText, { color: colors.fontSecondary }]}>
                                    {t('blogs.noComments')}
                                </Text>
                            </View>
                        ) : (
                            comments.map(comment => (
                                <CommentItem
                                    key={comment.id}
                                    comment={comment}
                                    isArabic={isArabic}
                                    colors={colors}
                                    t={t}
                                    onReply={handleReply}
                                />
                            ))
                        )}
                    </View>
                </ScrollView>

                {/* Comment input bar */}
                <View style={[styles.commentBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                    {replyTo && (
                        <View style={[styles.replyBanner, { backgroundColor: colors.primary + '15' }]}>
                            <Text style={[styles.replyBannerText, { color: colors.primary }]} numberOfLines={1}>
                                ↩ {[replyTo.author.first_name, replyTo.author.last_name].filter(Boolean).join(' ') || replyTo.author.username}
                            </Text>
                            <TouchableOpacity onPress={() => setReplyTo(null)}>
                                <Ionicons name="close" size={16} color={colors.primary} />
                            </TouchableOpacity>
                        </View>
                    )}
                    <View style={styles.commentInputRow}>
                        <TextInput
                            ref={commentInputRef}
                            style={[styles.commentInput, {
                                backgroundColor: colors.surface,
                                borderColor: colors.border,
                                color: colors.text,
                            }]}
                            placeholder={t('blogs.addComment')}
                            placeholderTextColor={colors.fontSecondary}
                            value={commentText}
                            onChangeText={setCommentText}
                            multiline
                            maxLength={500}
                            textAlign={isArabic ? 'right' : 'left'}
                        />
                        <TouchableOpacity
                            style={[
                                styles.sendBtn,
                                { backgroundColor: commentText.trim() ? colors.primary : colors.border },
                            ]}
                            onPress={handleSubmitComment}
                            disabled={commentLoading || !commentText.trim()}
                        >
                            {commentLoading
                                ? <ActivityIndicator size="small" color="#fff" />
                                : <Send size={18} color="#fff" />}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },

    // Top bar
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    backBtn: { padding: 4 },
    topBarActions: { flexDirection: 'row', gap: 4 },
    actionBtn: { padding: 8 },

    // Loading / error states
    centerLoader: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
    loadingText: { fontSize: 15, textAlign: 'center' },
    retryBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 8 },
    retryBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },

    // Scroll content
    scrollContent: { paddingBottom: 16 },

    // Hero image
    heroImageWrap: { position: 'relative' },
    heroImage: { width: '100%', height: 240 },
    heroCategoryBadge: {
        position: 'absolute',
        bottom: 12,
        left: 16,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
        maxWidth: 180,
    },
    heroCategoryText: { color: '#fff', fontSize: 12, fontWeight: '600' },
    categoryPill: {
        alignSelf: 'flex-start',
        marginHorizontal: 16,
        marginTop: 16,
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
    },
    categoryPillText: { fontSize: 13, fontWeight: '600' },

    // Body
    body: { paddingHorizontal: 16, paddingTop: 16, gap: 14 },
    title: { fontSize: 22, fontWeight: '800', lineHeight: 30 },

    // Meta
    metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
    authorRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
    authorAvatar: { width: 40, height: 40, borderRadius: 20 },
    authorAvatarPlaceholder: { alignItems: 'center', justifyContent: 'center' },
    authorName: { fontSize: 14, fontWeight: '600' },
    verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
    verifiedText: { fontSize: 11 },
    statsCol: { flexDirection: 'row', gap: 12, alignItems: 'center' },
    statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    statText: { fontSize: 13 },

    // Dates
    datesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        paddingVertical: 10,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    dateItem: { flexDirection: 'row', alignItems: 'center', gap: 5, flex: 1, minWidth: 160 },
    dateLabel: { fontSize: 12 },
    dateValue: { fontSize: 12, fontWeight: '600' },

    // Content
    content: { fontSize: 15, lineHeight: 24 },

    // Tags
    tagsSection: { gap: 8 },
    tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    tagChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 14,
        borderWidth: 1,
    },
    tagChipText: { fontSize: 12, fontWeight: '500' },

    // Divider
    divider: { height: StyleSheet.hairlineWidth, marginVertical: 4 },

    // Section title
    sectionTitle: { fontSize: 16, fontWeight: '700' },

    // Comments
    noCommentsWrap: { alignItems: 'center', gap: 8, paddingVertical: 24 },
    noCommentsText: { fontSize: 14, textAlign: 'center' },

    commentItem: { paddingVertical: 12, gap: 6 },
    replyItem: {},
    commentHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    commentAvatar: { width: 32, height: 32, borderRadius: 16 },
    commentAvatarPlaceholder: { alignItems: 'center', justifyContent: 'center' },
    commentAuthor: { fontSize: 13, fontWeight: '600' },
    commentDate: { fontSize: 11 },
    replyBtn: { paddingHorizontal: 8, paddingVertical: 4 },
    replyBtnText: { fontSize: 12, fontWeight: '600' },
    commentBody: { fontSize: 14, lineHeight: 20 },

    // Comment input bar
    commentBar: { borderTopWidth: 1, paddingBottom: Platform.OS === 'android' ? 8 : 0 },
    replyBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 6,
    },
    replyBannerText: { fontSize: 13, flex: 1 },
    commentInputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 12,
        paddingVertical: 8,
        gap: 8,
    },
    commentInput: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 8,
        fontSize: 14,
        maxHeight: 100,
        minHeight: 40,
    },
    sendBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
