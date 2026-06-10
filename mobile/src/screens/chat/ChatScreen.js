import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform, StatusBar, ActivityIndicator, Keyboard
} from 'react-native';
import { chatsAPI } from '../../services/api';
import { COLORS, FONTS } from '../../utils/theme';
import io from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import Toast from 'react-native-toast-message';
import useAuthStore from '../../store/authStore';
import { useTranslation } from '../../utils/i18n';

const POLL_MS = 3000; // fallback poll interval when socket is unreliable

export default function ChatScreen({ route, navigation }) {
  const { chatId, maidName } = route.params || {};
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const listRef   = useRef();
  const socketRef = useRef();
  const pollRef   = useRef();
  const atBottomRef = useRef(true); // track if user is scrolled to bottom

  // ── Merge helper: add only messages we don't already have ──────────────────
  const mergeMessages = useCallback((incoming) => {
    setMessages(prev => {
      const existingIds = new Set(prev.filter(m => !m._isTemp).map(m => m._id));
      const newOnes = incoming.filter(m => !existingIds.has(m._id));
      if (newOnes.length === 0) return prev;
      // Keep unconfirmed temp messages at the end
      const temps = prev.filter(m => m._isTemp);
      const confirmed = [...prev.filter(m => !m._isTemp), ...newOnes]
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      const result = [...confirmed, ...temps];
      if (atBottomRef.current) {
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
      }
      return result;
    });
  }, []);

  // ── Load messages from server (used for initial load AND polling) ───────────
  const fetchMessages = useCallback(async (initial = false) => {
    try {
      const res = await chatsAPI.getMessages(chatId);
      const msgs = res.data.messages || [];
      if (initial) {
        setMessages(msgs);
        setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 50);
        setLoading(false);
      } else {
        mergeMessages(msgs);
      }
    } catch {
      if (initial) {
        Toast.show({ type: 'error', text1: t('failed_load_msgs') });
        setLoading(false);
      }
    }
  }, [chatId, mergeMessages]);

  // ── Socket: instant delivery ───────────────────────────────────────────────
  const connectSocket = useCallback(async () => {
    const token = await SecureStore.getItemAsync('maidconnect_token');
    const BASE = Constants.expoConfig?.extra?.API_URL?.replace('/api', '')
      || 'https://api.servix.world';

    const socket = io(BASE, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    // Join the chat room (and rejoin after every reconnect — 'connect' fires both)
    socket.on('connect', () => {
      socket.emit('join_chat', chatId);
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket] connect_error:', err.message);
    });

    // Primary: message arrives via room
    socket.on('new_message', (msg) => {
      setMessages(prev => {
        const isOwn = String(msg.sender?._id) === String(user?._id);
        if (isOwn) {
          const withoutTemp = prev.filter(m => !m._isTemp);
          const alreadyExists = withoutTemp.some(m => String(m._id) === String(msg._id));
          const result = alreadyExists ? withoutTemp : [...withoutTemp, msg];
          if (atBottomRef.current) setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
          return result;
        }
        if (prev.some(m => String(m._id) === String(msg._id))) return prev;
        if (atBottomRef.current) setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
        return [...prev, msg];
      });
    });

    // Fallback: recipient's user room — arrives even if room join was delayed
    socket.on('new_chat_message', ({ chatId: incomingId, message }) => {
      if (String(incomingId) !== String(chatId)) return;
      setMessages(prev => {
        if (prev.some(m => String(m._id) === String(message._id))) return prev;
        if (atBottomRef.current) setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
        return [...prev, message];
      });
    });
  }, [chatId, user]);

  useEffect(() => {
    // Initial load
    fetchMessages(true);

    // Socket for instant delivery
    connectSocket();

    // Polling fallback — guarantees delivery within POLL_MS even if socket fails
    pollRef.current = setInterval(() => fetchMessages(false), POLL_MS);

    // Keyboard scroll
    const sub = Keyboard.addListener('keyboardDidShow', () => {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    });

    return () => {
      socketRef.current?.disconnect();
      clearInterval(pollRef.current);
      sub.remove();
    };
  }, []);

  // ── Send message ───────────────────────────────────────────────────────────
  const sendText = async () => {
    if (!text.trim()) return;
    const content = text.trim();
    const tempId  = `temp_${Date.now()}`;
    setText('');

    const optimistic = {
      _id: tempId,
      _isTemp: true,
      content,
      type: 'text',
      sender: { _id: user?._id, role: user?.role },
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);

    try {
      await chatsAPI.sendMessage({ chatId, type: 'text', content });
      // Confirmed message arrives via socket new_message or next poll — temp gets replaced
    } catch {
      Toast.show({ type: 'error', text1: t('failed_send_msg') });
      setText(content);
      setMessages(prev => prev.filter(m => m._id !== tempId));
    }
  };

  const renderMessage = ({ item }) => {
    const isMe = String(item.sender?._id) === String(user?._id);
    if (item.type === 'voice') {
      return (
        <View style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
          <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
            <Text style={[styles.bubbleTxt, isMe && styles.bubbleTxtMe]}>{t('voice_note')}</Text>
          </View>
        </View>
      );
    }
    return (
      <View style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', marginBottom: 8, maxWidth: '78%' }}>
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
          <Text style={[styles.bubbleTxt, isMe && styles.bubbleTxtMe]}>{item.content}</Text>
        </View>
        <Text style={[styles.btime, { textAlign: isMe ? 'right' : 'left' }]}>
          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
          <Text style={{ fontSize: 22, color: COLORS.muted }}>←</Text>
        </TouchableOpacity>
        <View style={styles.chatAva}><Text style={{ fontSize: 18 }}>👩🏽</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.chatName}>{maidName || 'Maid'}</Text>
          <Text style={styles.chatOnline}>{t('chat_online')}</Text>
        </View>
      </View>

      {loading
        ? <ActivityIndicator size="large" color={COLORS.gold} style={{ flex: 1 }} />
        : <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={i => String(i._id)}
            contentContainerStyle={{ padding: 14, paddingBottom: 10 }}
            renderItem={renderMessage}
            onContentSizeChange={() => {
              if (atBottomRef.current) listRef.current?.scrollToEnd({ animated: false });
            }}
            onScroll={({ nativeEvent }) => {
              const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
              atBottomRef.current = contentOffset.y + layoutMeasurement.height >= contentSize.height - 40;
            }}
            scrollEventThrottle={100}
          />}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.textInput}
          value={text}
          onChangeText={setText}
          placeholder={t('type_message')}
          placeholderTextColor={COLORS.muted}
          multiline
          onSubmitEditing={sendText}
        />
        <TouchableOpacity
          onPress={sendText}
          style={[styles.sendBtn, !text.trim() && { opacity: 0.35 }]}
          disabled={!text.trim()}>
          <Text style={{ fontSize: 16, color: COLORS.dark }}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header:     { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, paddingTop: 54, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  chatAva:    { width: 38, height: 38, borderRadius: 19, backgroundColor: '#e8c97a', alignItems: 'center', justifyContent: 'center' },
  chatName:   { fontFamily: FONTS.display, fontSize: 16, color: COLORS.dark },
  chatOnline: { fontSize: 10, color: COLORS.green },
  bubble:     { borderRadius: 12, paddingHorizontal: 13, paddingVertical: 9 },
  bubbleThem: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderBottomLeftRadius: 3 },
  bubbleMe:   { backgroundColor: COLORS.gold, borderBottomRightRadius: 3 },
  bubbleTxt:  { fontSize: 14, color: COLORS.text, lineHeight: 20 },
  bubbleTxtMe:{ color: COLORS.dark },
  btime:      { fontSize: 10, color: COLORS.muted, marginTop: 2, marginHorizontal: 4 },
  inputRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, paddingBottom: Platform.OS === 'ios' ? 28 : 14, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border },
  textInput:  { flex: 1, backgroundColor: COLORS.cream, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 22, paddingHorizontal: 15, paddingVertical: 10, fontSize: 14, color: COLORS.text, maxHeight: 100 },
  sendBtn:    { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.gold, alignItems: 'center', justifyContent: 'center' },
});
