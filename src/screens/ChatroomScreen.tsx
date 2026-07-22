import { useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons/static';
import { EmptyState } from '@/components/EmptyState';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';
import { useAuth } from '@/hooks/useAuth';
import { useWebSocket } from '@/hooks/useWebSocket';
import { ChatMessage } from '@/types/chat';
import { formatTime } from '@/utils/date';

const MessageBubble = ({ message }: { message: ChatMessage }) => (
  <View style={[styles.messageRow, message.isOwn && styles.messageRowOwn]}>
    {!message.isOwn ? <View style={styles.messageAvatar}><Text style={styles.messageInitial}>{message.senderName.charAt(0)}</Text></View> : null}
    <View style={[styles.bubble, message.isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
      {!message.isOwn ? <Text style={styles.sender}>{message.senderName}</Text> : null}
      <Text style={[styles.messageText, message.isOwn && styles.messageTextOwn]}>{message.text}</Text>
      <Text style={[styles.messageTime, message.isOwn && styles.messageTimeOwn]}>{formatTime(message.timestamp)}</Text>
    </View>
  </View>
);

export const ChatroomScreen = () => {
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const { user } = useAuth();
  const { messages, status, userCount, send, reconnect } = useWebSocket(user?.id ?? 'operator', user?.name ?? 'Operator');
  const [text, setText] = useState('');
  const connected = status === 'connected';

  const submit = () => {
    if (send(text)) setText('');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={84}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>SECURE CHANNEL</Text>
            <Text style={styles.title}>Operations Chat</Text>
          </View>
          <Pressable disabled={connected} onPress={reconnect} style={styles.connection}>
            <View style={[styles.connectionDot, { backgroundColor: connected ? colors.radar : colors.warning }]} />
            <View><Text style={[styles.connectionText, { color: connected ? colors.radar : colors.warning }]}>{status.toUpperCase()}</Text><Text style={styles.users}>{userCount} OPERATORS</Text></View>
          </Pressable>
        </View>
        <View style={styles.notice}>
          <MaterialCommunityIcons name="shield-lock-outline" size={15} color={colors.blue} />
          <Text style={styles.noticeText}>Messages are live only and are never stored.</Text>
        </View>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageBubble message={item} />}
          contentContainerStyle={[styles.messages, messages.length === 0 && styles.emptyMessages]}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={<EmptyState icon="message-text-outline" title="Channel is quiet" message="Connected operator messages will appear here in real time." />}
        />
        <View style={styles.composer}>
          <View style={[styles.inputShell, !connected && styles.inputDisabled]}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder={connected ? 'Message the operations room…' : 'Waiting for connection…'}
              placeholderTextColor={colors.textMuted}
              selectionColor={colors.radar}
              style={styles.input}
              multiline
              maxLength={500}
              editable={connected}
            />
            <Text style={styles.characterCount}>{text.length}/500</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Send message"
            accessibilityState={{ disabled: !connected || !text.trim() }}
            onPress={submit}
            disabled={!connected || !text.trim()}
            style={({ pressed }) => [styles.send, (!connected || !text.trim()) && styles.sendDisabled, pressed && styles.sendPressed]}
          >
            <Ionicons name="send" size={19} color={colors.background} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingTop: spacing.lg, paddingBottom: spacing.md },
  eyebrow: { color: colors.radar, fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
  title: { color: colors.text, fontSize: 23, fontWeight: '800', marginTop: 2 },
  connection: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.sm, paddingVertical: 8 },
  connectionDot: { width: 7, height: 7, borderRadius: 4 },
  connectionText: { fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  users: { color: colors.textMuted, fontSize: 7, marginTop: 2 },
  notice: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, marginHorizontal: spacing.md, paddingVertical: 9, borderRadius: radius.sm, backgroundColor: colors.blue12 },
  noticeText: { color: colors.textSecondary, fontSize: 10, fontWeight: '600' },
  messages: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl },
  emptyMessages: { flexGrow: 1, justifyContent: 'center' },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.xs, maxWidth: '86%' },
  messageRowOwn: { alignSelf: 'flex-end' },
  messageAvatar: { width: 28, height: 28, borderRadius: 10, backgroundColor: colors.blue12, alignItems: 'center', justifyContent: 'center' },
  messageInitial: { color: colors.blue, fontSize: 11, fontWeight: '800' },
  bubble: { paddingHorizontal: spacing.sm, paddingVertical: 10, borderRadius: radius.md, minWidth: 92 },
  bubbleOther: { backgroundColor: colors.card, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: colors.border },
  bubbleOwn: { backgroundColor: colors.radar, borderBottomRightRadius: 4 },
  sender: { color: colors.blue, fontSize: 10, fontWeight: '800', marginBottom: 4 },
  messageText: { color: colors.text, fontSize: 13, lineHeight: 19 },
  messageTextOwn: { color: colors.background },
  messageTime: { color: colors.textMuted, fontSize: 8, marginTop: 5, alignSelf: 'flex-end' },
  messageTimeOwn: { color: 'rgba(4,11,24,0.58)' },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.elevated },
  inputShell: { flex: 1, minHeight: 48, maxHeight: 104, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, paddingLeft: spacing.md, paddingRight: 44, paddingVertical: 6 },
  inputDisabled: { opacity: 0.55 },
  input: { color: colors.text, minHeight: 36, fontSize: 13, paddingTop: 8 },
  characterCount: { position: 'absolute', right: 8, bottom: 5, color: colors.textMuted, fontSize: 7 },
  send: { width: 48, height: 48, borderRadius: radius.md, backgroundColor: colors.radar, alignItems: 'center', justifyContent: 'center' },
  sendDisabled: { backgroundColor: colors.textMuted },
  sendPressed: { transform: [{ scale: 0.96 }] },
});
