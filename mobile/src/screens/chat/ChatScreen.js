import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform, StatusBar, ActivityIndicator
} from 'react-native';
import { chatsAPI } from '../../services/api';
import { COLORS, FONTS } from '../../utils/theme';
import io from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import Toast from 'react-native-toast-message';

export default function ChatScreen({ route, navigation }) {
  const { chatId, maidName } = route.params || {};
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const listRef = useRef();
  const socketRef = useRef();

  useEffect(() => {
    loadMessages();
    connectSocket();
    return () => { socketRef.current?.disconnect(); };
  }, []);

  const loadMessages = async () => {
    try {
      const res = await chatsAPI.getMessages(chatId);
      setMessages(res.data.messages);
    } catch { Toast.show({ type: 'error', text1: 'Failed to load messages' }); }
    finally { setLoading(false); }
  };

  const connectSocket = async () => {
    const token = await SecureStore.getItemAsync('maidconnect_token');
    const BASE = Constants.expoConfig?.extra?.API_URL?.replace('/api', '') || 'http://192.168.1.16:5001';
    const socket = io(BASE, { auth: { token } });
    socketRef.current = socket;
    socket.emit('join_chat', chatId);
    socket.on('new_message', (msg) => {
      setMessages(prev => [...prev, msg]);
      listRef.current?.scrollToEnd({ animated: true });
    });
  };

  const sendText = async () => {
    if (!text.trim()) return;
    const content = text.trim();
    setText('');
    try {
      await chatsAPI.sendMessage({ chatId, type: 'text', content });
    } catch { Toast.show({ type: 'error', text1: 'Failed to send' }); setText(content); }
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender?.role === 'housewife' || item.sender?._id === 'me';
    if (item.type === 'voice') {
      return (
        <View style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
          <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
            <Text style={[styles.bubbleTxt, isMe && styles.bubbleTxtMe]}>🎙 Voice note</Text>
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
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
          <Text style={{ fontSize: 22, color: COLORS.muted }}>←</Text>
        </TouchableOpacity>
        <View style={styles.chatAva}><Text style={{ fontSize: 18 }}>👩🏽</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.chatName}>{maidName || 'Maid'}</Text>
          <Text style={styles.chatOnline}>● Online</Text>
        </View>
      </View>

      {loading
        ? <ActivityIndicator size="large" color={COLORS.gold} style={{ flex: 1 }} />
        : <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={i => i._id || String(Math.random())}
            contentContainerStyle={{ padding: 14, paddingBottom: 10 }}
            renderItem={renderMessage}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          />}

      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.textInput}
          value={text}
          onChangeText={setText}
          placeholder="Type a message…"
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
