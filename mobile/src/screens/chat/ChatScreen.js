import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform, StatusBar, ActivityIndicator
} from 'react-native';
import { Audio } from 'expo-av';
import { chatsAPI, uploadAPI } from '../../services/api';
import { COLORS, FONTS } from '../../utils/theme';
import io from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import Toast from 'react-native-toast-message';

const WaveBar = ({ delay, color }) => {
  const height = useRef(4).current;
  return <View style={{ width:3, height:14, borderRadius:2, backgroundColor:color, opacity:0.6, marginHorizontal:1 }}/>;
};

const VoiceBubble = ({ msg, isMe }) => {
  const [playing, setPlaying] = useState(false);
  const soundRef = useRef(null);

  const playPause = async () => {
    if (!msg.voiceUrl) return;
    if (playing) {
      await soundRef.current?.pauseAsync();
      setPlaying(false);
    } else {
      const { sound } = await Audio.Sound.createAsync({ uri: msg.voiceUrl });
      soundRef.current = sound;
      await sound.playAsync();
      setPlaying(true);
      sound.setOnPlaybackStatusUpdate(s => { if (s.didJustFinish) setPlaying(false); });
    }
  };

  return (
    <View style={[styles.voiceBubble, isMe ? styles.voiceMe : styles.voiceThem]}>
      <TouchableOpacity style={styles.playBtn} onPress={playPause}>
        <Text style={{ fontSize:10, color: isMe ? COLORS.dark : COLORS.gold }}>{playing ? '⏸' : '▶'}</Text>
      </TouchableOpacity>
      <View style={styles.waveRow}>
        {Array.from({ length:16 }).map((_,i) => <WaveBar key={i} delay={i*60} color={isMe?COLORS.dark:COLORS.gold}/>)}
      </View>
      <Text style={[styles.vdur, { color: isMe ? COLORS.dark : COLORS.muted }]}>
        {msg.voiceDuration ? `${Math.floor(msg.voiceDuration)}s` : '—'}
      </Text>
    </View>
  );
};

export default function ChatScreen({ route, navigation }) {
  const { chatId, maidName, maidAvatar } = route.params || {};
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const listRef = useRef();
  const socketRef = useRef();

  // Load messages & connect socket
  useEffect(() => {
    loadMessages();
    connectSocket();
    return () => { socketRef.current?.disconnect(); };
  }, []);

  const loadMessages = async () => {
    try {
      const res = await chatsAPI.getMessages(chatId);
      setMessages(res.data.messages);
    } catch { Toast.show({ type:'error', text1:'Failed to load messages' }); }
    finally { setLoading(false); }
  };

  const connectSocket = async () => {
    const token = await SecureStore.getItemAsync('maidconnect_token');
    const BASE = Constants.expoConfig?.extra?.API_URL?.replace('/api','') || 'http://localhost:5000';
    const socket = io(BASE, { auth: { token } });
    socketRef.current = socket;
    socket.emit('join_chat', chatId);
    socket.on('new_message', (msg) => {
      setMessages(prev => [...prev, msg]);
      listRef.current?.scrollToEnd({ animated:true });
    });
  };

  const sendText = async () => {
    if (!text.trim()) return;
    const content = text.trim();
    setText('');
    try {
      await chatsAPI.sendMessage({ chatId, type:'text', content });
    } catch { Toast.show({ type:'error', text1:'Failed to send' }); setText(content); }
  };

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS:true, playsInSilentModeIOS:true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
      setIsRecording(true);
    } catch { Toast.show({ type:'error', text1:'Microphone permission needed' }); }
  };

  const stopRecording = async () => {
    if (!recording) return;
    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    const status = await recording.getStatusAsync();
    setRecording(null);
    try {
      const uploadRes = await uploadAPI.voice(uri, Math.round((status.durationMillis||0)/1000));
      await chatsAPI.sendMessage({ chatId, type:'voice', voiceUrl: uploadRes.data.url, voiceDuration: Math.round((status.durationMillis||0)/1000) });
    } catch { Toast.show({ type:'error', text1:'Failed to send voice note' }); }
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender?.role === 'housewife' || item.sender?._id === 'me';
    if (item.type === 'voice') {
      return <VoiceBubble msg={item} isMe={isMe}/>;
    }
    return (
      <View style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', marginBottom:8, maxWidth:'78%' }}>
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
          <Text style={[styles.bubbleTxt, isMe && styles.bubbleTxtMe]}>{item.content}</Text>
        </View>
        <Text style={[styles.btime, { textAlign: isMe ? 'right' : 'left' }]}>
          {new Date(item.createdAt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS==='ios'?'padding':undefined} keyboardVerticalOffset={0}>
      <StatusBar barStyle="dark-content"/>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding:4 }}>
          <Text style={{ fontSize:22, color:COLORS.muted }}>←</Text>
        </TouchableOpacity>
        <View style={styles.chatAva}><Text style={{ fontSize:18 }}>👩🏽</Text></View>
        <View style={{ flex:1 }}>
          <Text style={styles.chatName}>{maidName || 'Maid'}</Text>
          <Text style={styles.chatOnline}>● Online</Text>
        </View>
        <TouchableOpacity><Text style={{ fontSize:18, color:COLORS.muted }}>📞</Text></TouchableOpacity>
      </View>

      {loading
        ? <ActivityIndicator size="large" color={COLORS.gold} style={{ flex:1 }}/>
        : <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={i => i._id || String(Math.random())}
            contentContainerStyle={{ padding:14, paddingBottom:10 }}
            renderItem={renderMessage}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated:false })}
          />}

      {/* Input */}
      <View style={styles.inputRow}>
        <TouchableOpacity style={{ padding:4 }}><Text style={{ fontSize:18, color:COLORS.muted }}>📎</Text></TouchableOpacity>
        <TextInput style={styles.textInput} value={text} onChangeText={setText}
          placeholder="Type a message…" placeholderTextColor={COLORS.muted}
          multiline onSubmitEditing={sendText}/>
        {text.trim()
          ? <TouchableOpacity onPress={sendText} style={styles.sendBtn}>
              <Text style={{ fontSize:16, color:COLORS.dark }}>➤</Text>
            </TouchableOpacity>
          : <TouchableOpacity
              onPressIn={startRecording} onPressOut={stopRecording}
              style={[styles.micBtn, isRecording && styles.micBtnRec]}>
              <Text style={{ fontSize:18 }}>🎙</Text>
            </TouchableOpacity>}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header:    { flexDirection:'row', alignItems:'center', gap:10, padding:14, paddingTop:54, backgroundColor:COLORS.surface, borderBottomWidth:1, borderBottomColor:COLORS.border },
  chatAva:   { width:38, height:38, borderRadius:19, backgroundColor:'#e8c97a', alignItems:'center', justifyContent:'center' },
  chatName:  { fontFamily:FONTS.display, fontSize:16, color:COLORS.dark },
  chatOnline:{ fontSize:10, color:COLORS.green },
  bubble:    { borderRadius:12, paddingHorizontal:13, paddingVertical:9 },
  bubbleThem:{ backgroundColor:COLORS.surface, borderWidth:1, borderColor:COLORS.border, borderBottomLeftRadius:3 },
  bubbleMe:  { backgroundColor:COLORS.gold, borderBottomRightRadius:3 },
  bubbleTxt: { fontSize:14, color:COLORS.text, lineHeight:20 },
  bubbleTxtMe:{ color:COLORS.dark },
  btime:     { fontSize:10, color:COLORS.muted, marginTop:2, marginHorizontal:4 },
  voiceBubble:{ flexDirection:'row', alignItems:'center', gap:8, borderRadius:12, padding:10, marginBottom:8 },
  voiceMe:   { backgroundColor:COLORS.gold, alignSelf:'flex-end', borderBottomRightRadius:3 },
  voiceThem: { backgroundColor:COLORS.surface, borderWidth:1, borderColor:COLORS.border, alignSelf:'flex-start', borderBottomLeftRadius:3 },
  playBtn:   { width:28, height:28, borderRadius:14, backgroundColor:'rgba(0,0,0,0.1)', alignItems:'center', justifyContent:'center' },
  waveRow:   { flexDirection:'row', alignItems:'center', flex:1 },
  vdur:      { fontSize:10 },
  inputRow:  { flexDirection:'row', alignItems:'center', gap:8, padding:10, paddingBottom:Platform.OS==='ios'?28:14, backgroundColor:COLORS.surface, borderTopWidth:1, borderTopColor:COLORS.border },
  textInput: { flex:1, backgroundColor:COLORS.cream, borderWidth:1.5, borderColor:COLORS.border, borderRadius:22, paddingHorizontal:15, paddingVertical:10, fontSize:14, color:COLORS.text, maxHeight:100 },
  sendBtn:   { width:40, height:40, borderRadius:20, backgroundColor:COLORS.gold, alignItems:'center', justifyContent:'center' },
  micBtn:    { width:42, height:42, borderRadius:21, backgroundColor:COLORS.gold, alignItems:'center', justifyContent:'center' },
  micBtnRec: { backgroundColor:'#c0392b' },
});
