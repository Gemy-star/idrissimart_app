import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { AppDispatch, RootState } from '@/store';
import {
  fetchChatRoomDetail,
  markChatAsRead,
  sendMessage,
  ChatMessage,
} from '@/store/slices/chatSlice';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

function formatMsgTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDateSeparator(dateStr: string, isArabic: boolean): string {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(d, today)) return isArabic ? 'اليوم' : 'Today';
  if (sameDay(d, yesterday)) return isArabic ? 'أمس' : 'Yesterday';
  return d.toLocaleDateString(isArabic ? 'ar' : 'en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

interface MessageWithSeparator {
  type: 'message' | 'separator';
  data?: ChatMessage;
  label?: string;
  key: string;
}

function buildListItems(messages: ChatMessage[], isArabic: boolean): MessageWithSeparator[] {
  const items: MessageWithSeparator[] = [];
  let lastDay = '';

  for (const msg of messages) {
    const day = new Date(msg.created_at).toDateString();
    if (day !== lastDay) {
      lastDay = day;
      items.push({
        type: 'separator',
        label: formatDateSeparator(msg.created_at, isArabic),
        key: `sep-${msg.created_at}`,
      });
    }
    items.push({ type: 'message', data: msg, key: `msg-${msg.id}` });
  }
  return items;
}

export default function ChatRoomScreen() {
  const { colors } = useTheme();
  const { language, t } = useLanguage();
  const isArabic = language === 'ar';
  const dispatch = useDispatch<AppDispatch>();
  const params = useLocalSearchParams();
  const roomId = Number(params.id);

  const { currentRoom, loading } = useSelector((s: RootState) => s.chat);
  const { user } = useSelector((s: RootState) => s.auth);

  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (roomId) {
      dispatch(fetchChatRoomDetail(roomId)).then(() => {
        dispatch(markChatAsRead(roomId));
      });
    }
  }, [roomId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (currentRoom?.messages?.length) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 100);
    }
  }, [currentRoom?.messages?.length]);

  const handleSend = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setText('');
    setSending(true);
    await dispatch(sendMessage({ roomId, message: trimmed }));
    setSending(false);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, [text, sending, roomId, dispatch]);

  const otherUser =
    currentRoom?.publisher?.id === user?.id
      ? currentRoom?.client
      : currentRoom?.publisher;

  const otherName = otherUser
    ? `${otherUser.first_name ?? ''} ${otherUser.last_name ?? ''}`.trim() ||
      otherUser.username
    : '...';

  const messages = currentRoom?.messages ?? [];
  const listItems = buildListItems(messages, isArabic);

  const renderItem = ({ item }: { item: MessageWithSeparator }) => {
    if (item.type === 'separator') {
      return (
        <View style={styles.separatorRow}>
          <View style={[styles.separatorLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.separatorText, { color: colors.textSecondary }]}>
            {item.label}
          </Text>
          <View style={[styles.separatorLine, { backgroundColor: colors.border }]} />
        </View>
      );
    }

    const msg = item.data!;
    const isMe = msg.sender?.id === user?.id || msg.sender?.username === user?.username;

    return (
      <View style={[styles.bubbleRow, isMe ? styles.bubbleRowMe : styles.bubbleRowOther]}>
        {!isMe && (
          <View style={[styles.bubbleAvatar, { backgroundColor: colors.primary + 'aa' }]}>
            <Text style={styles.bubbleAvatarText}>
              {(msg.sender?.first_name?.[0] ?? msg.sender?.username?.[0] ?? '?').toUpperCase()}
            </Text>
          </View>
        )}
        <View
          style={[
            styles.bubble,
            isMe
              ? [styles.bubbleMe, { backgroundColor: colors.primary }]
              : [styles.bubbleOther, { backgroundColor: colors.surface, borderColor: colors.border }],
          ]}
        >
          {msg.message ? (
            <Text style={[styles.bubbleText, { color: isMe ? '#fff' : colors.text }]}>
              {msg.message}
            </Text>
          ) : null}
          {msg.attachment ? (
            <Text style={[styles.attachmentText, { color: isMe ? 'rgba(255,255,255,0.8)' : colors.primary }]}>
              {t('chat.attachment')}
            </Text>
          ) : null}
          <Text
            style={[
              styles.bubbleTime,
              { color: isMe ? 'rgba(255,255,255,0.65)' : colors.textSecondary },
            ]}
          >
            {formatMsgTime(msg.created_at)}
            {isMe && (
              <Text> {msg.is_read ? '  ' : ' '}</Text>
            )}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons
            name={isArabic ? 'arrow-forward' : 'arrow-back'}
            size={22}
            color="#fff"
          />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.headerName} numberOfLines={1}>
            {otherName}
          </Text>
          {currentRoom?.ad_title || currentRoom?.ad?.title ? (
            <Text style={styles.headerSub} numberOfLines={1}>
              {currentRoom.ad_title ?? currentRoom.ad?.title}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {loading && messages.length === 0 ? (
          <View style={styles.loadingCenter}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={listItems}
            keyExtractor={(item) => item.key}
            renderItem={renderItem}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyCenter}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  {t('chat.noMessages')}
                </Text>
              </View>
            }
          />
        )}

        {/* Input */}
        <View
          style={[
            styles.inputRow,
            {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
            },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
            placeholder={t('chat.inputPlaceholder')}
            placeholderTextColor={colors.textSecondary}
            value={text}
            onChangeText={setText}
            multiline
            textAlign={isArabic ? 'right' : 'left'}
            textAlignVertical="center"
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              {
                backgroundColor:
                  text.trim() && !sending ? colors.primary : colors.border,
              },
            ]}
            onPress={handleSend}
            disabled={!text.trim() || sending}
            activeOpacity={0.8}
          >
            {sending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons
                name={isArabic ? 'send' : 'send'}
                size={18}
                color="#fff"
                style={isArabic ? { transform: [{ scaleX: -1 }] } : undefined}
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 56 : (StatusBar.currentHeight ?? 0) + 10,
    paddingBottom: 14,
    paddingHorizontal: 12,
    gap: 10,
  },
  backBtn: { padding: 6 },
  headerInfo: { flex: 1 },
  headerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  headerSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 1,
  },
  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  messagesList: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    paddingBottom: 8,
    flexGrow: 1,
  },
  separatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    gap: 8,
  },
  separatorLine: { flex: 1, height: StyleSheet.hairlineWidth },
  separatorText: { fontSize: 12 },
  bubbleRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-end',
    gap: 6,
  },
  bubbleRowMe: { justifyContent: 'flex-end' },
  bubbleRowOther: { justifyContent: 'flex-start' },
  bubbleAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubbleAvatarText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    gap: 4,
  },
  bubbleMe: {
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    borderBottomLeftRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
  },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  attachmentText: { fontSize: 13, fontWeight: '600' },
  bubbleTime: { fontSize: 10, alignSelf: 'flex-end' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 110,
    borderRadius: 20,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: { fontSize: 14, textAlign: 'center' },
});
