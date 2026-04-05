// ─── NotificationsScreen ───
import React, { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import useLangStore from '../store/langStore';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, StatusBar, Modal, ScrollView } from 'react-native';
import { LANGUAGES } from '../utils/i18n';
import { notificationsAPI } from '../services/api';
import { COLORS, FONTS } from '../utils/theme';

export function NotificationsScreen({ navigation }) {
  const [notifs, setNotifs] = useState([]);
  useEffect(() => { notificationsAPI.getAll().then(r => setNotifs(r.data.notifications)).catch(()=>{}); }, []);

  const markRead = async (id) => {
    await notificationsAPI.markRead(id);
    setNotifs(n => n.map(x => x._id===id ? {...x, isRead:true} : x));
  };

  const ICONS = { like:'❤️', chat:'💬', approval:'✅', payment:'💳', new_maid:'👩', hire_confirmed:'🎉', subscription:'👑', system:'📢' };

  return (
    <View style={{ flex:1, backgroundColor:COLORS.cream }}>
      <StatusBar barStyle="dark-content"/>
      <View style={styles.topBar}>
        <Text style={styles.pageTitle}>Notifications</Text>
        <TouchableOpacity onPress={() => notificationsAPI.markAll().then(() => setNotifs(n=>n.map(x=>({...x,isRead:true}))))}>
          <Text style={{ fontSize:12, color:COLORS.gold, fontFamily:FONTS.bodySemiBold }}>Mark all read</Text>
        </TouchableOpacity>
      </View>
      <FlatList data={notifs} keyExtractor={i=>i._id}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.notifItem, !item.isRead && styles.notifUnread]} onPress={() => markRead(item._id)}>
            <View style={[styles.notifIcon, { backgroundColor:`${COLORS.gold}15` }]}><Text style={{ fontSize:18 }}>{ICONS[item.type]||'🔔'}</Text></View>
            <View style={{ flex:1 }}>
              <Text style={styles.notifTitle}>{item.title}</Text>
              <Text style={styles.notifBody}>{item.body}</Text>
              <Text style={styles.notifTime}>{new Date(item.createdAt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</Text>
            </View>
            {!item.isRead && <View style={styles.unreadDot}/>}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

// ─── PaymentResultScreen ───
export function PaymentResultScreen({ route, navigation }) {
  const { type, fawryRef, amount, paymentId } = route.params || {};
  const completeAuth = useAuthStore(s => s.completeAuth);
  const [completing, setCompleting] = useState(false);

  const handleGoHome = async () => {
    setCompleting(true);
    try {
      // Finalize auth — reads token from SecureStore, sets Zustand state,
      // which triggers AppNavigator to switch to the correct home screen.
      await completeAuth();
    } catch {
      setCompleting(false);
    }
  };

  return (
    <View style={{ flex:1, backgroundColor: type==='fawry' ? '#0a1a0f' : '#0a1208', alignItems:'center', justifyContent:'center', padding:28 }}>
      <Text style={{ fontSize:60, marginBottom:16 }}>{type==='fawry' ? '🏧' : '🎉'}</Text>
      <Text style={{ fontFamily:FONTS.display, fontSize:28, color:'#fff8ee', textAlign:'center', marginBottom:8 }}>
        {type==='fawry' ? 'Fawry Code Ready!' : 'Payment Initiated!'}
      </Text>
      {type==='fawry' && <>
        <Text style={{ fontSize:13, color:'rgba(255,255,255,0.55)', textAlign:'center', lineHeight:20, marginBottom:24 }}>
          Pay at any Fawry outlet using this reference number:
        </Text>
        <View style={{ backgroundColor:'rgba(201,168,76,0.15)', borderWidth:1.5, borderColor:COLORS.gold, borderRadius:8, padding:16, marginBottom:24, width:'100%', alignItems:'center' }}>
          <Text style={{ fontSize:10, color:COLORS.gold, letterSpacing:1, textTransform:'uppercase', marginBottom:6 }}>Fawry Reference</Text>
          <Text style={{ fontFamily:FONTS.display, fontSize:30, color:'#e8c97a' }}>{fawryRef || '---'}</Text>
          <Text style={{ fontSize:12, color:'rgba(232,201,122,0.5)', marginTop:4 }}>EGP {amount?.toLocaleString()}</Text>
        </View>
        <Text style={{ fontSize:11, color:'rgba(255,255,255,0.35)', textAlign:'center', lineHeight:18 }}>
          Valid for 48 hours. You'll receive a confirmation notification once payment is processed.
        </Text>
      </>}
      {type !== 'fawry' && <Text style={{ fontSize:13, color:'rgba(255,255,255,0.55)', textAlign:'center', marginBottom:24 }}>
        You'll be redirected to complete payment. Check your notifications for confirmation.
      </Text>}
      <TouchableOpacity onPress={handleGoHome} disabled={completing}
        style={{ marginTop:28, backgroundColor:COLORS.gold, paddingHorizontal:28, paddingVertical:14, borderRadius:5, opacity: completing ? 0.6 : 1 }}>
        <Text style={{ fontFamily:FONTS.bodySemiBold, fontSize:14, color:COLORS.dark }}>
          {completing ? 'Loading…' : 'Go to Home →'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── ChatsListScreen ───
export function ChatsListScreen({ navigation }) {
  const [chats, setChats] = useState([]);
  const { chatsAPI } = require('../services/api');
  useEffect(() => { chatsAPI.getMyChats().then(r=>setChats(r.data.chats)).catch(()=>{}); }, []);
  return (
    <View style={{ flex:1, backgroundColor:COLORS.cream }}>
      <View style={styles.topBar}><Text style={styles.pageTitle}>Messages</Text></View>
      <FlatList data={chats} keyExtractor={i=>i._id}
        renderItem={({ item }) => {
          const other = item.maidProfile || item.maid;
          return (
            <TouchableOpacity style={styles.chatItem} onPress={() => navigation.navigate('Chat', { chatId:item._id, maidName: other?.fullName || other?.name })}>
              <View style={styles.chatAva}><Text style={{ fontSize:20 }}>👩</Text></View>
              <View style={{ flex:1 }}>
                <Text style={styles.chatName}>{other?.fullName || other?.name || 'Chat'}</Text>
                <Text style={styles.chatLast} numberOfLines={1}>{item.lastMessage?.content || (item.lastMessage?.type==='voice'?'🎙 Voice note':'No messages yet')}</Text>
              </View>
              <Text style={styles.chatTime}>{item.lastMessageAt ? new Date(item.lastMessageAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) : ''}</Text>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<Text style={{ textAlign:'center', color:COLORS.muted, marginTop:60, fontSize:14 }}>No chats yet</Text>}
      />
    </View>
  );
}

// ─── SavedScreen ───
export function SavedScreen({ navigation }) {
  const [maids, setMaids] = useState([]);
  const [loading, setLoading] = useState(true);
  const { maidsAPI } = require('../services/api');
  const { useFocusEffect } = require('@react-navigation/native');

  // Refetch every time this tab comes into focus
  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);
      maidsAPI.getSaved()
        .then(r => setMaids(r.data.maids || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, [])
  );

  return (
    <View style={{ flex:1, backgroundColor:COLORS.cream }}>
      <View style={styles.topBar}><Text style={styles.pageTitle}>Saved Maids ❤️</Text></View>
      {loading
        ? <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}>
            <View style={{ width:24, height:24, borderRadius:12, borderWidth:2, borderColor:COLORS.gold, borderTopColor:'transparent' }}/>
          </View>
        : <FlatList data={maids} keyExtractor={i=>i._id}
            contentContainerStyle={{ padding:14 }}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.savedCard}
                onPress={() => navigation.navigate('Browse', { screen:'MaidDetail', params:{ maid:item } })}>
                <View style={[styles.savedAva, { backgroundColor: item.origin==='african'?'#2d1a0a':'#1a0d2e' }]}>
                  {item.photos?.[0]?.url
                    ? <View style={{ width:44, height:44, borderRadius:22, overflow:'hidden' }}>
                        <View style={{ width:'100%', height:'100%', alignItems:'center', justifyContent:'center', backgroundColor: item.origin==='african'?'#2d1a0a':'#1a0d2e' }}>
                          <Text style={{ fontSize:22 }}>👩</Text>
                        </View>
                      </View>
                    : <Text style={{ fontSize:26 }}>👩</Text>}
                </View>
                <View style={{ flex:1 }}>
                  <Text style={styles.savedName}>{item.fullName}</Text>
                  <Text style={styles.savedSub}>{item.nationality} · {item.age}yrs · EGP {(item.expectedSalary||0).toLocaleString()}/mo</Text>
                  <View style={{ flexDirection:'row', gap:5, marginTop:4 }}>
                    {(item.skills||[]).slice(0,3).map(s=>(
                      <View key={s} style={{ backgroundColor:'#f4ede0', paddingHorizontal:6, paddingVertical:2, borderRadius:2 }}>
                        <Text style={{ fontSize:9, color:COLORS.muted }}>{s}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                <Text style={{ fontSize:18 }}>❤️</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={{ textAlign:'center', color:COLORS.muted, marginTop:60, fontSize:14 }}>No saved maids yet</Text>}
          />
      }
    </View>
  );
}

// ─── LanguageModal ───
function LanguageModal({ visible, onClose }) {
  const { lang, setLang } = useLangStore();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={{ flex:1, backgroundColor:'rgba(0,0,0,0.6)', justifyContent:'center', alignItems:'center' }} activeOpacity={1} onPress={onClose}>
        <View style={{ backgroundColor:COLORS.surface, borderRadius:10, overflow:'hidden', width:280, borderWidth:1, borderColor:COLORS.border }}>
          <View style={{ backgroundColor:'#1a1108', padding:16 }}>
            <Text style={{ fontFamily:FONTS.display, fontSize:18, color:'#e8c97a' }}>🌐 Language / اللغة</Text>
          </View>
          {LANGUAGES.map(l => (
            <TouchableOpacity key={l.code} onPress={() => { setLang(l.code); onClose(); }}
              style={{ flexDirection:'row', alignItems:'center', gap:12, padding:14, borderTopWidth:1, borderTopColor:COLORS.border, backgroundColor: lang===l.code ? '#fef9ee' : COLORS.surface }}>
              <Text style={{ fontSize:22 }}>{l.flag}</Text>
              <Text style={{ fontSize:14, color: lang===l.code ? COLORS.gold : COLORS.text, fontWeight: lang===l.code ? '700':'400', flex:1 }}>{l.label}</Text>
              {lang===l.code && <Text style={{ color:COLORS.gold, fontSize:16 }}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── HWProfileScreen ───
export function HWProfileScreen({ navigation }) {
  const useAuthStore = require('../store/authStore').default;
  const Toast = require('react-native-toast-message').default;
  const { user, logout } = useAuthStore();
  const [langVisible, setLangVisible] = useState(false);

  const MENU = [
    { icon:'❤️', title:'Saved Maids',   color:'',    onPress: () => navigation.navigate('Saved') },
    { icon:'💬', title:'Messages',       color:'',    onPress: () => navigation.navigate('Chats') },
    { icon:'✅', title:'Approval Flow',  color:'',    onPress: () => navigation.navigate('Browse', { screen:'Approval' }) },
    { icon:'💳', title:'Payments',       color:'',    onPress: () => Toast.show({ type:'info', text1:'Coming soon' }) },
    { icon:'🔔', title:'Notifications',  color:'',    onPress: () => navigation.navigate('Alerts') },
    { icon:'🌐', title:'Language',       color:'',    onPress: () => setLangVisible(true) },
    { icon:'🔒', title:'Security',       color:'',    onPress: () => Toast.show({ type:'info', text1:'Coming soon' }) },
    { icon:'🚪', title:'Sign Out',       color:'red', onPress: logout },
  ];

  return (
    <View style={{ flex:1, backgroundColor:COLORS.cream }}>
      <LanguageModal visible={langVisible} onClose={() => setLangVisible(false)}/>
      <ScrollView contentContainerStyle={{ paddingBottom:40 }} showsVerticalScrollIndicator={false}>
        <View style={{ backgroundColor:'#3d2203', padding:20, paddingTop:54, paddingBottom:20 }}>
          <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:12 }}>
            <View style={{ width:64, height:64, borderRadius:32, backgroundColor:COLORS.gold, alignItems:'center', justifyContent:'center' }}><Text style={{ fontSize:28 }}>👩</Text></View>
            <TouchableOpacity style={{ borderWidth:1, borderColor:'rgba(201,168,76,0.35)', paddingHorizontal:14, paddingVertical:8, borderRadius:4, alignSelf:'flex-start' }}><Text style={{ fontSize:12, color:'#e8c97a' }}>✏️ Edit</Text></TouchableOpacity>
          </View>
          <Text style={{ fontFamily:FONTS.display, fontSize:22, color:'#fff8ee' }}>{user?.name || 'Customer'}</Text>
          <Text style={{ fontSize:11, color:'rgba(232,201,122,0.45)', fontFamily:FONTS.body, marginTop:2 }}>{user?.email}</Text>
        </View>
        <View style={{ margin:14, backgroundColor:COLORS.surface, borderWidth:1, borderColor:COLORS.border, borderRadius:8, overflow:'hidden' }}>
          {MENU.map(({ icon, title, color, onPress }) => (
            <TouchableOpacity key={title} onPress={onPress}
              style={{ flexDirection:'row', alignItems:'center', gap:12, padding:14, borderBottomWidth:1, borderBottomColor:COLORS.border }}>
              <View style={{ width:32, height:32, borderRadius:6, backgroundColor:'#f4ede0', alignItems:'center', justifyContent:'center' }}><Text style={{ fontSize:15 }}>{icon}</Text></View>
              <Text style={{ fontSize:14, fontWeight:'500', color: color==='red' ? COLORS.red : COLORS.text, flex:1 }}>{title}</Text>
              <Text style={{ color:COLORS.muted, fontSize:16 }}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// ─── MaidDashScreen ───
export function MaidDashScreen() {
  const useAuthStore = require('../store/authStore').default;
  const { user, profile, logout } = useAuthStore();
  const [langVisible, setLangVisible] = useState(false);
  return (
    <View style={{ flex:1, backgroundColor:COLORS.cream }}>
      <LanguageModal visible={langVisible} onClose={() => setLangVisible(false)}/>
      <ScrollView contentContainerStyle={{ paddingBottom:40 }} showsVerticalScrollIndicator={false}>
        <View style={{ backgroundColor:'#1a1108', padding:20, paddingTop:54 }}>
          <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:10 }}>
            <View style={{ backgroundColor:'rgba(46,125,94,0.2)', borderWidth:1, borderColor:'rgba(46,125,94,0.35)', paddingHorizontal:10, paddingVertical:5, borderRadius:14, flexDirection:'row', alignItems:'center', gap:5 }}>
              <View style={{ width:5, height:5, borderRadius:3, backgroundColor:'#5dd6a8' }}/><Text style={{ fontSize:10, color:'#5dd6a8' }}>Active Subscription</Text>
            </View>
            <View style={{ backgroundColor:'rgba(201,168,76,0.1)', borderWidth:1, borderColor:COLORS.gold, paddingHorizontal:8, paddingVertical:3, borderRadius:2 }}><Text style={{ fontSize:9, color:COLORS.gold, fontWeight:'700' }}>Annual</Text></View>
          </View>
          <View style={{ width:64, height:64, borderRadius:32, backgroundColor:COLORS.gold, alignItems:'center', justifyContent:'center', marginBottom:8 }}><Text style={{ fontSize:28 }}>👩🏿</Text></View>
          <Text style={{ fontFamily:FONTS.display, fontSize:22, color:'#fff8ee' }}>{profile?.fullName || user?.name || 'Fatima'}</Text>
          <Text style={{ fontSize:11, color:'rgba(232,201,122,0.45)', marginTop:2 }}>@{user?.name?.toLowerCase().replace(' ','') || 'maid'} · {profile?.nationality || 'Ethiopia'}</Text>
        </View>
        <View style={{ flexDirection:'row', gap:10, padding:14 }}>
          {[['18','Views'],['7','Likes'],['3','Chats']].map(([n,l])=>(
            <View key={l} style={{ flex:1, backgroundColor:COLORS.surface, borderWidth:1, borderColor:COLORS.border, borderRadius:7, padding:12, alignItems:'center' }}>
              <Text style={{ fontFamily:FONTS.display, fontSize:22, color:COLORS.gold }}>{n}</Text>
              <Text style={{ fontSize:9, textTransform:'uppercase', letterSpacing:0.5, color:COLORS.muted, marginTop:2 }}>{l}</Text>
            </View>
          ))}
        </View>
        <View style={{ marginHorizontal:14, backgroundColor:COLORS.surface, borderWidth:1, borderColor:COLORS.border, borderRadius:8, overflow:'hidden' }}>
          {[['💬','Messages','3 active'],['💳','Subscription','Annual · Dec 2025'],['📊','Analytics','18 views'],['🌐','Language',''],['🔔','Notifications',''],['🚪','Sign Out','']].map(([icon,title,sub])=>(
            <TouchableOpacity key={title} onPress={title==='Sign Out' ? logout : title==='Language' ? () => setLangVisible(true) : undefined}
              style={{ flexDirection:'row', alignItems:'center', gap:11, padding:13, borderBottomWidth:1, borderBottomColor:COLORS.border }}>
              <View style={{ width:30, height:30, borderRadius:5, backgroundColor:'#f4ede0', alignItems:'center', justifyContent:'center' }}><Text style={{ fontSize:14 }}>{icon}</Text></View>
              <View style={{ flex:1 }}><Text style={{ fontSize:13, fontWeight:'500', color: title==='Sign Out'?COLORS.red:COLORS.text }}>{title}</Text>{sub?<Text style={{ fontSize:10, color:COLORS.muted }}>{sub}</Text>:null}</View>
              <Text style={{ color:COLORS.muted }}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// ─── ApprovalScreen ───
export function ApprovalScreen({ route, navigation }) {
  const { chatId, maidName } = route.params || {};
  const STEPS = [
    { title:'Initial Chat', desc:'Connected via in-app chat and voice notes.', state:'done', time:'Today 10:15 AM' },
    { title:'Profile Review', desc:'Reviewed full profile and references.', state:'done', time:'Today 10:30 AM' },
    { title:'Voice Interview', desc:'Confirm fit via voice call interview.', state:'active', time:'In progress' },
    { title:'Final Approval', desc:'Confirm hire and proceed to payment.', state:'pending', time:'Pending' },
    { title:'Commission Payment', desc:'Pay one-time commission to finalise.', state:'pending', time:'Pending' },
  ];
  const stateColors = { done:'#2e7d5e', active:COLORS.gold, pending:COLORS.border };
  return (
    <View style={{ flex:1, backgroundColor:COLORS.cream }}>
      <View style={{ backgroundColor:'#1a1108', padding:18, paddingTop:54 }}>
        <TouchableOpacity onPress={()=>navigation.goBack()}><Text style={{ fontSize:22, color:'rgba(232,201,122,0.6)' }}>←</Text></TouchableOpacity>
        <Text style={{ fontSize:10, color:'rgba(232,201,122,0.5)', letterSpacing:1, textTransform:'uppercase', marginTop:10 }}>Hire Request</Text>
        <Text style={{ fontFamily:FONTS.display, fontSize:20, color:'#fff8ee', marginTop:3 }}>{maidName || 'Maid'}</Text>
      </View>
      <View style={{ flex:1, padding:18 }}>
        <Text style={{ fontSize:10, letterSpacing:1.2, textTransform:'uppercase', color:COLORS.gold, marginBottom:14, fontFamily:FONTS.bodySemiBold }}>Approval Progress</Text>
        {STEPS.map((s, i) => (
          <View key={i} style={{ flexDirection:'row', gap:12, marginBottom:18 }}>
            <View style={{ alignItems:'center' }}>
              <View style={{ width:32, height:32, borderRadius:16, backgroundColor:stateColors[s.state], alignItems:'center', justifyContent:'center', borderWidth:s.state==='pending'?1.5:0, borderColor:COLORS.border }}>
                <Text style={{ fontSize:12, color: s.state==='pending'?COLORS.muted:'#fff' }}>{s.state==='done'?'✓':s.state==='active'?'▶':String(i+1)}</Text>
              </View>
              {i < STEPS.length-1 && <View style={{ width:1.5, flex:1, backgroundColor:COLORS.border, marginVertical:3 }}/>}
            </View>
            <View style={{ flex:1, paddingTop:4 }}>
              <Text style={{ fontSize:13, fontWeight:'600', color:COLORS.dark }}>{s.title}</Text>
              <Text style={{ fontSize:11, color:COLORS.muted, marginTop:2, lineHeight:16 }}>{s.desc}</Text>
              <Text style={{ fontSize:10, color:COLORS.gold, marginTop:3, fontFamily:FONTS.body }}>{s.time}</Text>
            </View>
          </View>
        ))}
        <View style={{ backgroundColor:'#fff9f0', borderWidth:1, borderColor:COLORS.border, borderRadius:7, padding:14, borderLeftWidth:3, borderLeftColor:COLORS.gold, marginBottom:16 }}>
          <Text style={{ fontSize:12, fontWeight:'700', color:COLORS.dark, marginBottom:8 }}>💰 Commission Summary</Text>
          {[['Maid Monthly Salary','$400.00'],['Commission Rate','20%'],['Commission Due','$80.00']].map(([l,v])=>(
            <View key={l} style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:4 }}>
              <Text style={{ fontSize:12, color:COLORS.muted }}>{l}</Text>
              <Text style={{ fontSize:12, fontWeight:'700', color: l.includes('Due')?COLORS.gold:COLORS.dark }}>{v}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity style={{ backgroundColor:'#2e7d5e', padding:14, borderRadius:5, alignItems:'center', marginBottom:10 }}
          onPress={() => navigation.navigate('Payment', { type:'commission', chatId, maidName, amount:3920 })}>
          <Text style={{ fontFamily:FONTS.bodySemiBold, fontSize:14, color:'#fff' }}>✅ Approve & Pay Commission</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ padding:14, borderRadius:5, alignItems:'center', borderWidth:1, borderColor:COLORS.border }}>
          <Text style={{ fontSize:14, color:COLORS.red }}>✗ Decline — Not the Right Fit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── EditProfileScreen ───
export function EditProfileScreen() {
  return (
    <View style={{ flex:1, backgroundColor:COLORS.cream, alignItems:'center', justifyContent:'center' }}>
      <Text style={{ fontSize:32, marginBottom:12 }}>✏️</Text>
      <Text style={{ fontFamily:FONTS.display, fontSize:22, color:COLORS.dark }}>Edit Profile</Text>
      <Text style={{ fontSize:13, color:COLORS.muted, marginTop:6 }}>Profile editing coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar:     { padding:16, paddingTop:54, backgroundColor:COLORS.surface, borderBottomWidth:1, borderBottomColor:COLORS.border, flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  pageTitle:  { fontFamily:FONTS.display, fontSize:22, color:COLORS.dark },
  notifItem:  { flexDirection:'row', gap:12, padding:14, borderBottomWidth:1, borderBottomColor:COLORS.border, alignItems:'flex-start' },
  notifUnread:{ backgroundColor:'#fffcf5' },
  notifIcon:  { width:38, height:38, borderRadius:19, alignItems:'center', justifyContent:'center', flexShrink:0 },
  notifTitle: { fontSize:13, fontWeight:'600', color:COLORS.dark, marginBottom:2 },
  notifBody:  { fontSize:12, color:COLORS.muted, lineHeight:17 },
  notifTime:  { fontSize:10, color:COLORS.muted, marginTop:3 },
  unreadDot:  { width:8, height:8, borderRadius:4, backgroundColor:COLORS.gold, marginTop:5 },
  chatItem:   { flexDirection:'row', gap:12, padding:14, borderBottomWidth:1, borderBottomColor:COLORS.border, alignItems:'center' },
  chatAva:    { width:44, height:44, borderRadius:22, backgroundColor:COLORS.gold, alignItems:'center', justifyContent:'center' },
  chatName:   { fontFamily:FONTS.display, fontSize:16, color:COLORS.dark },
  chatLast:   { fontSize:12, color:COLORS.muted, marginTop:1 },
  chatTime:   { fontSize:10, color:COLORS.muted },
  savedCard:  { flexDirection:'row', alignItems:'center', gap:12, padding:13, backgroundColor:COLORS.surface, borderWidth:1, borderColor:COLORS.border, borderRadius:8, marginBottom:10 },
  savedAva:   { width:44, height:44, borderRadius:22, alignItems:'center', justifyContent:'center' },
  savedName:  { fontFamily:FONTS.display, fontSize:16, color:COLORS.dark },
  savedSub:   { fontSize:11, color:COLORS.muted, marginTop:1 },
});

export default NotificationsScreen;
