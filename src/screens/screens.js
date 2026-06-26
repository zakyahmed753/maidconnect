// ─── NotificationsScreen ───
import React, { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import useLangStore from '../store/langStore';
import useNotifStore from '../store/notifStore';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, StatusBar, Modal, ScrollView, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, RefreshControl, Image } from 'react-native';
import { LANGUAGES, useTranslation } from '../utils/i18n';
import { notificationsAPI, paymentsAPI, maidsAPI, chatsAPI, supportAPI, authAPI, hwAPI } from '../services/api';
import NotifBell from '../components/NotifBell';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { COLORS, FONTS } from '../utils/theme';
import { Ionicons } from '@expo/vector-icons';
import BackChevron from '../components/BackChevron';

const translateNotifTitle = (title = '', t) => {
  if (title.includes('Hire Request!') || title.includes('New Hire')) return t('notif_new_hire_title');
  if (title.includes('Declined') && title.includes('Hire')) return t('notif_hire_declined_title');
  if (title.includes('Approved') || title.includes('Verified!')) return t('notif_approved_title');
  if (title.includes('Rejected') || title.includes('Verification Rejected')) return t('notif_rejected_title');
  if (title.includes('Subscription') || title.includes('💵')) return t('notif_sub_title');
  if (title.includes('Released by Admin') || title.includes('Maid Released')) return t('notif_released_hw_title');
  if (title.includes('Available Again') || title.includes('Available')) return t('notif_released_maid_title');
  if (title.includes('Support Reply') || title.includes('Support')) return t('notif_support_reply_title') || title;
  return title;
};

export function NotificationsScreen({ navigation }) {
  const { t } = useTranslation();
  const user = useAuthStore(s => s.user);
  const { decrement, reset } = useNotifStore();
  const [notifs, setNotifs] = useState([]);
  useFocusEffect(
    React.useCallback(() => {
      notificationsAPI.getAll().then(r => setNotifs(r.data.notifications || [])).catch(()=>{});
    }, [])
  );

  const markRead = async (id) => {
    const wasUnread = notifs.find(x => x._id === id && !x.isRead);
    if (wasUnread) decrement();
    await notificationsAPI.markRead(id);
    setNotifs(n => n.map(x => x._id===id ? {...x, isRead:true} : x));
  };

  const ICONS = { like:'heart', chat:'chatbubble', approval:'checkmark-circle', payment:'card', new_maid:'person-add', hire_confirmed:'checkmark-circle', subscription:'star', system:'information-circle' };

  return (
    <View style={{ flex:1, backgroundColor:COLORS.cream }}>
      <StatusBar barStyle="dark-content"/>
      <View style={styles.topBar}>
        <Text style={styles.pageTitle}>{t('notifications_title')}</Text>
        <TouchableOpacity onPress={() => notificationsAPI.markAll().then(() => { setNotifs(n=>n.map(x=>({...x,isRead:true}))); reset(); })}>
          <Text style={{ fontSize:12, color:COLORS.green, fontFamily:FONTS.bodySemiBold }}>{t('mark_all_read')}</Text>
        </TouchableOpacity>
      </View>
      <FlatList data={notifs} keyExtractor={i=>i._id}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.notifItem, !item.isRead && styles.notifUnread]} onPress={() => {
              markRead(item._id);
              if (item.type === 'chat' && (item.data?.chatId || item.chatId)) {
                const chatId = item.data?.chatId || item.chatId;
                const tab = user?.role === 'maid' ? 'MaidChats' : 'Chats';
                try { navigation.navigate(tab, { screen: 'Chat', params: { chatId } }); } catch {}
              }
            }}>
            <View style={[styles.notifIcon, { backgroundColor:`${COLORS.green}15` }]}><Ionicons name={ICONS[item.type]||'notifications'} size={18} color={COLORS.green} /></View>
            <View style={{ flex:1 }}>
              <Text style={styles.notifTitle}>{translateNotifTitle(item.title, t)}</Text>
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
  const { amount, paymentId, isOffline, goTo } = route.params || {};
  const completeAuth = useAuthStore(s => s.completeAuth);
  const [completing, setCompleting] = useState(false);
  const [checking,  setChecking]   = useState(false);
  const { t } = useTranslation();
  // online: starts verifying; offline: starts as pending (waiting for admin)
  const [status, setStatus] = useState(isOffline ? 'pending' : 'verifying');
  const pollTimer = React.useRef(null);
  const mountedRef = React.useRef(true);
  React.useEffect(() => { return () => { mountedRef.current = false; }; }, []);

  // Online payment: fast auto-poll until confirmed (every 2s, 8 attempts)
  // Offline payment: slower auto-poll every 30s until admin confirms
  React.useEffect(() => {
    if (!paymentId) {
      if (!isOffline) setStatus('completed');
      return;
    }
    let attempts = 0;
    const interval = isOffline ? 30000 : 2000;
    const maxAttempts = isOffline ? 999 : 8; // keep polling offline indefinitely

    const check = async () => {
      attempts++;
      try {
        const res = await paymentsAPI.checkStatus(paymentId);
        if (res.data?.status === 'completed') { setStatus('completed'); return; }
        if (res.data?.status === 'failed')    { setStatus('failed');    return; }
      } catch {}
      if (attempts < maxAttempts) {
        pollTimer.current = setTimeout(check, interval);
      } else if (!isOffline) {
        setStatus('completed'); // online: give up after 8 attempts
      }
    };
    check();
    return () => clearTimeout(pollTimer.current);
  }, [paymentId, isOffline]);

  const handleGoHome = async () => {
    // Offline pending: maid is already logged in — just go back rather than
    // re-running completeAuth which would re-evaluate the subscription gate
    // and kick the maid out while the receipt is still awaiting admin approval.
    if (isOffline && status !== 'completed') {
      navigation.canGoBack() ? navigation.goBack() : navigation.navigate(goTo || 'MaidDash');
      return;
    }
    setCompleting(true);
    try {
      await completeAuth();
      if (mountedRef.current) navigation.navigate(goTo || 'MaidDash');
    } catch {
      if (mountedRef.current) setCompleting(false);
    }
  };

  // Offline: manual status check button
  const handleCheckStatus = async () => {
    if (!paymentId) return;
    setChecking(true);
    try {
      const res = await paymentsAPI.checkStatus(paymentId);
      if (res.data?.status === 'completed') {
        setStatus('completed');
      } else {
        Toast.show({ type: 'info', text1: t('still_pending'), text2: t('admin_not_confirmed_yet') });
      }
    } catch {
      Toast.show({ type: 'error', text1: t('could_not_check') });
    } finally { setChecking(false); }
  };

  // ── Offline waiting screen ──
  if (isOffline) {
    return (
      <View style={{ flex:1, backgroundColor:'#0d2e23', alignItems:'center', justifyContent:'center', padding:28 }}>
        <Ionicons name={status === 'completed' ? 'checkmark-circle' : 'time-outline'} size={64} color={status === 'completed' ? '#4ade80' : COLORS.muted} style={{ marginBottom:16 }} />
        <Text style={{ fontFamily:FONTS.display, fontSize:26, color:'#fff', textAlign:'center', marginBottom:10 }}>
          {status === 'completed' ? t('sub_activated') : t('receipt_submitted_title')}
        </Text>
        <Text style={{ fontSize:13, color:'rgba(255,255,255,0.55)', textAlign:'center', lineHeight:22, marginBottom:28 }}>
          {status === 'completed' ? t('offline_confirmed_body') : t('offline_pending_body')}
        </Text>

        <View style={{ backgroundColor:'rgba(13,56,39,0.15)', borderWidth:1, borderColor:'rgba(13,56,39,0.35)', borderRadius:8, padding:14, width:'100%', alignItems:'center', marginBottom:28 }}>
          <Text style={{ fontSize:10, color:'#4db595', letterSpacing:1, textTransform:'uppercase', marginBottom:4 }}>
            {status === 'completed' ? t('amount_confirmed_label') : t('amount_submitted_label')}
          </Text>
          <Text style={{ fontFamily:FONTS.display, fontSize:28, color:'#fff' }}>EGP {amount?.toLocaleString()}</Text>
          <View style={{ marginTop:8, paddingHorizontal:10, paddingVertical:4, borderRadius:10,
            backgroundColor: status === 'completed' ? 'rgba(77,181,149,0.2)' : 'rgba(13,56,39,0.15)',
            borderWidth:1, borderColor: status === 'completed' ? 'rgba(77,181,149,0.5)' : 'rgba(13,56,39,0.3)' }}>
            <Text style={{ fontSize:11, color: status === 'completed' ? '#5dd6a8' : '#4db595', fontWeight:'700', textTransform:'uppercase', letterSpacing:0.5 }}>
              {status === 'completed' ? t('confirmed_badge') : t('pending_admin_badge')}
            </Text>
          </View>
        </View>

        {status === 'completed' ? (
          <TouchableOpacity onPress={handleGoHome} disabled={completing}
            style={{ backgroundColor:COLORS.green, paddingHorizontal:32, paddingVertical:14, borderRadius:5, width:'100%', alignItems:'center', opacity: completing ? 0.6 : 1 }}>
            <Text style={{ fontFamily:FONTS.bodySemiBold, fontSize:14, color:'#fff' }}>
              {completing ? t('loading') : t('go_to_app')}
            </Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity onPress={handleCheckStatus} disabled={checking}
              style={{ backgroundColor:'rgba(255,255,255,0.1)', borderWidth:1, borderColor:'rgba(255,255,255,0.25)', paddingHorizontal:28, paddingVertical:13, borderRadius:5, width:'100%', alignItems:'center', marginBottom:12, opacity: checking ? 0.6 : 1 }}>
              {checking
                ? <ActivityIndicator color={'#fff'} />
                : <Text style={{ fontSize:14, color:'#fff', fontWeight:'600' }}>{t('check_status_btn2')}</Text>}
            </TouchableOpacity>
            <Text style={{ fontSize:11, color:'rgba(255,255,255,0.3)', textAlign:'center', lineHeight:17 }}>
              {t('offline_notification_note')}
            </Text>
          </>
        )}
      </View>
    );
  }

  // ── Online payment result screen ──
  return (
    <View style={{ flex:1, backgroundColor:'#0d2e23', alignItems:'center', justifyContent:'center', padding:28 }}>
      <Ionicons name="checkmark-circle" size={64} color="#4ade80" style={{ marginBottom:16 }} />
      <Text style={{ fontFamily:FONTS.display, fontSize:28, color:'#fff', textAlign:'center', marginBottom:10 }}>
        {t('payment_confirmed_online')}
      </Text>
      <Text style={{ fontSize:13, color:'rgba(255,255,255,0.55)', textAlign:'center', lineHeight:22, marginBottom:28 }}>
        {t('payment_of_egp')}{amount?.toLocaleString()}{t('payment_was_successful')}
      </Text>
      <View style={{ backgroundColor:'rgba(13,56,39,0.15)', borderWidth:1, borderColor:'rgba(13,56,39,0.35)', borderRadius:8, padding:14, width:'100%', alignItems:'center', marginBottom:28 }}>
        <Text style={{ fontSize:10, color:'#4db595', letterSpacing:1, textTransform:'uppercase', marginBottom:4 }}>{t('amount_paid_label')}</Text>
        <Text style={{ fontFamily:FONTS.display, fontSize:28, color:'#fff' }}>EGP {amount?.toLocaleString()}</Text>
      </View>
      {status === 'verifying' ? (
        <View style={{ flexDirection:'row', alignItems:'center', gap:10 }}>
          <ActivityIndicator color={'#fff'}/>
          <Text style={{ color:'rgba(255,255,255,0.5)', fontSize:13 }}>{t('verifying_payment')}</Text>
        </View>
      ) : (
        <TouchableOpacity onPress={handleGoHome} disabled={completing}
          style={{ backgroundColor:COLORS.green, paddingHorizontal:32, paddingVertical:14, borderRadius:5, opacity: completing ? 0.6 : 1 }}>
          <Text style={{ fontFamily:FONTS.bodySemiBold, fontSize:14, color:'#fff' }}>
            {completing ? t('loading') : t('go_home')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── ChatsListScreen ───
export function ChatsListScreen({ navigation }) {
  const { t } = useTranslation();
  const [chats, setChats] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const user    = useAuthStore(s => s.user);
  const profile = useAuthStore(s => s.profile);
  const socketRef = React.useRef(null);

  const loadChats = () => chatsAPI.getMyChats().then(r => setChats(r.data.chats || [])).catch(() => {});
  const onRefresh = React.useCallback(async () => { setRefreshing(true); await loadChats(); setRefreshing(false); }, []);

  // Refresh list whenever screen is focused (e.g. returning from ChatScreen)
  useFocusEffect(React.useCallback(() => { loadChats(); }, []));

  // Real-time: listen for new_chat_message on personal user room
  useEffect(() => {
    let socket;
    (async () => {
      const SecureStore = require('expo-secure-store');
      const Constants   = require('expo-constants').default;
      const io          = require('socket.io-client').default;
      const token = await SecureStore.getItemAsync('maidconnect_token');
      const BASE  = Constants.expoConfig?.extra?.API_URL?.replace('/api', '') || 'https://api.servix.world';
      socket = io(BASE, {
        auth: { token },
        transports: ['polling', 'websocket'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
      });
      socketRef.current = socket;
      socket.on('new_chat_message', () => loadChats());
      socket.on('connect_error', (err) => console.warn('[Socket] ChatsListScreen error:', err.message));
    })();
    return () => { socket?.disconnect(); };
  }, []);

  const isSubscribed = () => {
    if (user?.role !== 'housewife') return true;
    const sub = profile?.subscription;
    return sub && sub.status === 'active' && sub.endDate && new Date(sub.endDate) > new Date();
  };

  const handleOpenChat = (item, other) => {
    if (!isSubscribed()) {
      navigation.navigate('Browse', { screen: 'CustomerSubscription', params: {} });
      return;
    }
    const partnerName = user?.role === 'maid'
      ? (item.housewife?.name || item.housewife?.fullName)
      : (item.maidProfile?.fullName || item.maid?.name);
    navigation.navigate('Chat', { chatId: item._id, maidName: partnerName });
  };

  return (
    <View style={{ flex:1, backgroundColor:COLORS.cream }}>
      <View style={{ backgroundColor:'#0D3827', padding:16, paddingTop:54, flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
        <Text style={{ fontFamily:FONTS.display, fontSize:22, color:'#fff' }}>{t('chats_title')}</Text>
        <NotifBell color="rgba(255,255,255,0.9)" />
      </View>
      {user?.role === 'housewife' && !isSubscribed() ? (
        <View style={{ flex:1, alignItems:'center', justifyContent:'center', padding:30 }}>
          <Ionicons name="chatbubbles-outline" size={48} color={COLORS.muted} style={{ marginBottom:14 }} />
          <Text style={{ fontFamily:FONTS.display, fontSize:20, color:COLORS.dark, textAlign:'center', marginBottom:8 }}>{t('subscribe_chat_title')}</Text>
          <Text style={{ fontSize:13, color:COLORS.muted, textAlign:'center', lineHeight:20, marginBottom:24 }}>{t('subscribe_chat_body')}</Text>
          <TouchableOpacity
            style={{ backgroundColor:COLORS.green, paddingHorizontal:28, paddingVertical:13, borderRadius:6 }}
            onPress={() => navigation.navigate('Browse', { screen:'CustomerSubscription', params:{} })}>
            <Text style={{ fontFamily:FONTS.bodySemiBold, fontSize:14, color:'#fff' }}>{t('subscribe_btn')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList data={chats} keyExtractor={i=>i._id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.green} colors={[COLORS.green]} />}
          renderItem={({ item }) => {
            // Maid sees the customer (housewife); customer sees the maid profile
            const other = user?.role === 'maid'
              ? item.housewife
              : (item.maidProfile || item.maid);
            const photoUrl = user?.role === 'maid' ? null : (item.maidProfile || item.maid)?.photos?.[0]?.url;
            return (
              <TouchableOpacity style={styles.chatItem} onPress={() => handleOpenChat(item, other)}>
                <View style={styles.chatAva}>
                  {photoUrl
                    ? <Image source={{ uri: photoUrl }} style={{ width:'100%', height:'100%', borderRadius:22 }} resizeMode="cover"/>
                    : <Ionicons name="person" size={22} color="rgba(255,255,255,0.8)" />}
                </View>
                <View style={{ flex:1 }}>
                  <Text style={styles.chatName}>{other?.fullName || other?.name || 'Chat'}</Text>
                  <Text style={styles.chatLast} numberOfLines={1}>{item.lastMessage?.content || 'No messages yet'}</Text>
                </View>
                <Text style={styles.chatTime}>{item.lastMessageAt ? new Date(item.lastMessageAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) : ''}</Text>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={<Text style={{ textAlign:'center', color:COLORS.muted, marginTop:60, fontSize:14 }}>{t('no_chats')}</Text>}
        />
      )}
    </View>
  );
}

// ─── SavedScreen ───
export function SavedScreen({ navigation }) {
  const { t } = useTranslation();
  const [maids, setMaids] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);
      Promise.all([maidsAPI.getSaved(), hwAPI.getProfile()])
        .then(([savedRes, profileRes]) => {
          const all = savedRes.data.maids || [];
          const prof = profileRes.data?.profile || {};
          const excludedIds = new Set(
            [...(prof.hiredMaids || []), ...(prof.pastHiredMaids || [])]
              .map(h => h.maid?._id || h.maid)
          );
          setMaids(all.filter(m => !excludedIds.has(m._id)));
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, [])
  );

  return (
    <View style={{ flex:1, backgroundColor:COLORS.cream }}>
      <View style={{ backgroundColor:'#0D3827', padding:16, paddingTop:54, flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
        <Text style={{ fontFamily:FONTS.display, fontSize:22, color:'#fff' }}>{t('saved_title')}</Text>
        <NotifBell color="rgba(255,255,255,0.9)" />
      </View>
      {loading
        ? <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}>
            <View style={{ width:24, height:24, borderRadius:12, borderWidth:2, borderColor:COLORS.green, borderTopColor:'transparent' }}/>
          </View>
        : <FlatList data={maids} keyExtractor={i=>i._id}
            contentContainerStyle={{ padding:14, gap:12 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{ backgroundColor:COLORS.surface, borderRadius:14, borderWidth:1, borderColor:COLORS.border, overflow:'hidden', elevation:2, shadowColor:'#000', shadowOpacity:0.06, shadowRadius:6 }}
                onPress={() => navigation.navigate('Browse', { screen:'MaidDetail', params:{ maid:item } })}
                activeOpacity={0.88}
              >
                {/* Photo banner */}
                <View style={{ height:140, backgroundColor: item.origin==='african'?'#1e3a2f':'#1a1a2e', alignItems:'center', justifyContent:'center' }}>
                  {item.photos?.[0]?.url
                    ? <Image source={{ uri: item.photos[0].url }} style={{ width:'100%', height:'100%' }} resizeMode="cover" />
                    : <Ionicons name="person" size={52} color="rgba(255,255,255,0.35)" />}
                  <View style={{ position:'absolute', top:8, right:8, backgroundColor:'rgba(13,56,39,0.85)', borderRadius:14, paddingHorizontal:8, paddingVertical:3 }}>
                    <Ionicons name="bookmark" size={14} color="#fff" />
                  </View>
                </View>
                {/* Info row */}
                <View style={{ padding:12 }}>
                  <Text style={styles.savedName}>{item.fullName}</Text>
                  <Text style={styles.savedSub}>{item.nationality} Â· {item.age}yrs Â· EGP {(item.expectedSalary||0).toLocaleString()}/mo</Text>
                  <View style={{ flexDirection:'row', gap:5, marginTop:6, flexWrap:'wrap' }}>
                    {(item.skills||[]).slice(0,3).map(s=>(
                      <View key={s} style={{ backgroundColor:'#e8f4f1', paddingHorizontal:7, paddingVertical:3, borderRadius:4 }}>
                        <Text style={{ fontSize:10, color:COLORS.green }}>{s}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={{ textAlign:'center', color:COLORS.muted, marginTop:60, fontSize:14 }}>{t('no_saved_maids')}</Text>}
          />
      }
    </View>
  );
}

// ─── LanguageModal ───
function LanguageModal({ visible, onClose }) {
  const { lang, setLang } = useLangStore();
  const { t } = useTranslation();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={{ flex:1, backgroundColor:'rgba(0,0,0,0.6)', justifyContent:'center', alignItems:'center' }} activeOpacity={1} onPress={onClose}>
        <View style={{ backgroundColor:COLORS.surface, borderRadius:10, overflow:'hidden', width:280, borderWidth:1, borderColor:COLORS.border }}>
          <View style={{ backgroundColor:'#0D3827', padding:16 }}>
            <Text style={{ fontFamily:FONTS.display, fontSize:18, color:'#fff' }}>{t('change_language')}</Text>
          </View>
          {LANGUAGES.map(l => (
            <TouchableOpacity key={l.code} onPress={() => { onClose(); setLang(l.code); }}
              style={{ flexDirection:'row', alignItems:'center', gap:12, padding:14, borderTopWidth:1, borderTopColor:COLORS.border, backgroundColor: lang===l.code ? '#e8f4f1' : COLORS.surface }}>
              <Text style={{ fontSize:22 }}>{l.flag}</Text>
              <Text style={{ fontSize:14, color: lang===l.code ? COLORS.green : COLORS.text, fontWeight: lang===l.code ? '700':'400', flex:1 }}>{l.label}</Text>
              {lang===l.code && <Text style={{ color:COLORS.green, fontSize:16 }}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── HWProfileScreen ───
export function HWProfileScreen({ navigation }) {
  const { t } = useTranslation();
  const { user, profile, logout } = useAuthStore();
  const [langVisible, setLangVisible] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      t('delete_confirm_title'),
      t('delete_confirm_body'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete_account'),
          style: 'destructive',
          onPress: () => Alert.alert(
            t('confirm_deletion'),
            t('confirm_deletion_body'),
            [
              { text: t('cancel'), style: 'cancel' },
              {
                text: t('yes_delete'),
                style: 'destructive',
                onPress: async () => {
                  try {
                    await authAPI.deleteAccount({ reason: 'Customer requested account removal' });
                    logout();
                  } catch {
                    Toast.show({ type: 'error', text1: t('failed_delete') });
                  }
                },
              },
            ]
          ),
        },
      ]
    );
  };

  const MENU_SECTIONS = [
    {
      label: t('menu_activity'),
      items: [
        { icon:'bookmark-outline',      iconColor:COLORS.green,  bg:'#e8f4f1', title: t('menu_saved'),        onPress: () => navigation.navigate('Saved') },
        { icon:'chatbubbles-outline',   iconColor:'#7c3aed',     bg:'#ede8fd', title: t('menu_messages'),      onPress: () => navigation.navigate('Chats') },
        { icon:'home-outline',          iconColor:'#d97706',     bg:'#fef3e2', title: t('my_hired_maid'),      onPress: () => navigation.navigate('HiredMaids') },
        { icon:'card-outline',          iconColor:'#2563eb',     bg:'#e8f0fe', title: t('menu_payments'),      onPress: () => navigation.navigate('PaymentHistory') },
        { icon:'notifications-outline', iconColor:'#ef4444',     bg:'#fef2f2', title: t('menu_notifications'), onPress: () => navigation.navigate('Alerts') },
      ],
    },
    {
      label: t('menu_settings'),
      items: [
        { icon:'globe-outline',         iconColor:'#4f46e5',     bg:'#f0f4ff', title: t('language'),      onPress: () => setLangVisible(true) },
        { icon:'help-circle-outline',   iconColor:COLORS.green,  bg:'#e8f4f1', title: t('menu_support'),  onPress: () => navigation.navigate('Support') },
      ],
    },
    {
      label: t('menu_account'),
      items: [
        { icon:'trash-outline',         iconColor:'#e05555',     bg:'#fef2f2', title: t('delete_account'), color:'red', onPress: handleDeleteAccount },
        { icon:'log-out-outline',       iconColor:'#e05555',     bg:'#fef2f2', title: t('menu_sign_out'),   color:'red', onPress: logout },
      ],
    },
  ];

  return (
    <View style={{ flex:1, backgroundColor:COLORS.cream }}>
      <LanguageModal visible={langVisible} onClose={() => setLangVisible(false)}/>
      <ScrollView contentContainerStyle={{ paddingBottom:48 }} showsVerticalScrollIndicator={false}>
        {/* Profile header */}
        <View style={{ backgroundColor:'#0D3827', padding:20, paddingTop:54, paddingBottom:28 }}>
          <View style={{ flexDirection:'row', justifyContent:'flex-end', alignItems:'center', marginBottom:14 }}>
            <NotifBell color="rgba(255,255,255,0.9)" />
          </View>
          <View style={{ flexDirection:'row', alignItems:'center', gap:10, flexWrap:'wrap' }}>
            <Text style={{ fontFamily:FONTS.display, fontSize:24, color:'#fff' }}>{user?.name || 'Customer'}</Text>
            {profile?.subscription?.status === 'active' && (
              <View style={{ backgroundColor:'rgba(255,255,255,0.2)', paddingHorizontal:10, paddingVertical:4, borderRadius:10, borderWidth:1, borderColor:'rgba(255,255,255,0.35)' }}>
                <Text style={{ fontSize:11, color:'#fff', fontWeight:'700', textTransform:'capitalize', letterSpacing:0.5 }}>
                  {profile.subscription.plan || 'Active'}
                </Text>
              </View>
            )}
          </View>
          <Text style={{ fontSize:12, color:'rgba(255,255,255,0.65)', fontFamily:FONTS.body, marginTop:3 }}>{user?.email}</Text>
        </View>
        {/* Sectioned menu */}
        {MENU_SECTIONS.map(section => (
          <View key={section.label} style={{ marginHorizontal:16, marginTop:18 }}>
            <Text style={{ fontSize:10, letterSpacing:1.3, textTransform:'uppercase', color:COLORS.muted, fontFamily:FONTS.bodySemiBold, marginBottom:8, marginLeft:2 }}>{section.label}</Text>
            <View style={{ backgroundColor:COLORS.surface, borderRadius:14, borderWidth:1, borderColor:COLORS.border, overflow:'hidden', elevation:1, shadowColor:'#000', shadowOpacity:0.04, shadowRadius:6 }}>
              {section.items.map(({ icon, iconColor, bg, title, color, onPress }, i) => (
                <TouchableOpacity key={title} onPress={onPress}
                  style={{ flexDirection:'row', alignItems:'center', gap:12, paddingHorizontal:16, paddingVertical:15, borderBottomWidth: i < section.items.length - 1 ? 1 : 0, borderBottomColor:COLORS.border }}>
                  <View style={{ width:38, height:38, borderRadius:11, backgroundColor: bg, alignItems:'center', justifyContent:'center' }}>
                    <Ionicons name={icon} size={19} color={iconColor} />
                  </View>
                  <Text style={{ fontSize:14, fontWeight:'500', color: color==='red' ? '#e05555' : COLORS.text, flex:1 }}>{title}</Text>
                  <Text style={{ color:COLORS.muted, fontSize:20 }}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// ─── MaidDashScreen ───
export function MaidDashScreen({ navigation }) {
  const { t } = useTranslation();
  const { user, profile, logout } = useAuthStore();
  const [langVisible, setLangVisible] = useState(false);
  const [stats, setStats] = useState({ views: 0, likes: 0, chats: 0 });

  const handleDeleteAccount = () => {
    Alert.alert(
      t('delete_confirm_title'),
      t('delete_confirm_body'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete_account'),
          style: 'destructive',
          onPress: () => Alert.alert(
            t('confirm_deletion'),
            t('confirm_deletion_body'),
            [
              { text: t('cancel'), style: 'cancel' },
              {
                text: t('yes_delete'),
                style: 'destructive',
                onPress: async () => {
                  try {
                    await authAPI.deleteAccount({ reason: 'Maid requested account removal' });
                    logout();
                  } catch {
                    Toast.show({ type: 'error', text1: t('failed_delete') });
                  }
                },
              },
            ]
          ),
        },
      ]
    );
  };

  const [maidProfile, setMaidProfile] = useState(null);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [myReviews, setMyReviews] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = React.useCallback(async () => {
    try {
      const [profileRes, requestsRes] = await Promise.all([
        maidsAPI.getMyProfile(),
        maidsAPI.getHireRequests(),
      ]);
      const m = profileRes.data?.maid;
      const s = m?.stats || {};
      setStats({ views: s.views || 0, likes: s.likes || 0, chats: s.chats || 0 });
      setMaidProfile(m);
      setPendingRequests((requestsRes.data?.requests || []).length);
      if (m?._id) {
        const reviewsRes = await maidsAPI.getReviews(m._id);
        setMyReviews(reviewsRes.data?.reviews || []);
      }
    } catch {}
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  useFocusEffect(React.useCallback(() => { loadData(); }, [loadData]));

  return (
    <View style={{ flex:1, backgroundColor:COLORS.cream }}>
      <LanguageModal visible={langVisible} onClose={() => setLangVisible(false)}/>


      <ScrollView contentContainerStyle={{ paddingBottom:40 }} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.green} colors={[COLORS.green]} />}>
        <View style={{ backgroundColor:'#0D3827', padding:20, paddingTop:54 }}>
          <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
            <View>
              <View style={{ backgroundColor:'rgba(255,255,255,0.15)', borderWidth:1, borderColor:'rgba(255,255,255,0.3)', paddingHorizontal:10, paddingVertical:5, borderRadius:14, flexDirection:'row', alignItems:'center', gap:5 }}>
                <View style={{ width:5, height:5, borderRadius:3, backgroundColor:'#5dd6a8' }}/><Text style={{ fontSize:10, color:'#fff' }}>{t('active_subscription')}</Text>
              </View>
              {profile?.subscription?.endDate && (
                <Text style={{ fontSize:9, color:'rgba(255,255,255,0.6)', marginTop:3 }}>
                  {t('sub_ends')} {new Date(profile.subscription.endDate).toLocaleDateString([], { day:'numeric', month:'short', year:'numeric' })}
                </Text>
              )}
            </View>
            <NotifBell color="rgba(255,255,255,0.9)" />
          </View>
          <View style={{ width:64, height:64, borderRadius:32, backgroundColor:'rgba(255,255,255,0.2)', alignItems:'center', justifyContent:'center', marginBottom:8 }}><Ionicons name="person" size={30} color="rgba(255,255,255,0.85)" /></View>
          <Text style={{ fontFamily:FONTS.display, fontSize:22, color:'#fff' }}>{profile?.fullName || user?.name || 'Fatima'}</Text>
          <Text style={{ fontSize:11, color:'rgba(255,255,255,0.7)', marginTop:2 }}>@{user?.name?.toLowerCase().replace(' ','') || 'maid'} · {profile?.nationality || 'Ethiopia'}</Text>
        </View>
        <View style={{ flexDirection:'row', gap:10, padding:14 }}>
          {[[String(stats.views),t('views')],[String(stats.likes),t('likes')],[String(stats.chats),t('chats_stat')]].map(([n,l])=>(
            <View key={l} style={{ flex:1, backgroundColor:COLORS.surface, borderWidth:1, borderColor:COLORS.border, borderRadius:7, padding:12, alignItems:'center' }}>
              <Text style={{ fontFamily:FONTS.display, fontSize:22, color:COLORS.green }}>{n}</Text>
              <Text style={{ fontSize:9, textTransform:'uppercase', letterSpacing:0.5, color:COLORS.muted, marginTop:2 }}>{l}</Text>
            </View>
          ))}
        </View>
        {/* Pending hire requests banner */}
        {pendingRequests > 0 && (
          <TouchableOpacity onPress={() => navigation.navigate('HireRequest')}
            style={{ marginHorizontal:14, marginBottom:10, backgroundColor:'#e8f4f1', borderWidth:1.5, borderColor:COLORS.green, borderRadius:8, padding:13, flexDirection:'row', alignItems:'center', gap:10 }}>
            <Ionicons name="person-circle-outline" size={22} color={COLORS.green} />
            <View style={{ flex:1 }}>
              <Text style={{ fontSize:13, fontWeight:'700', color:COLORS.dark }}>
                {pendingRequests} {pendingRequests > 1 ? t('hire_reqs_waiting') : t('hire_req_waiting')}
              </Text>
              <Text style={{ fontSize:11, color:COLORS.muted, marginTop:1 }}>{t('tap_review_decide')}</Text>
            </View>
            <View style={{ backgroundColor:COLORS.green, width:24, height:24, borderRadius:12, alignItems:'center', justifyContent:'center' }}>
              <Text style={{ fontSize:12, fontWeight:'700', color:'#fff' }}>{pendingRequests}</Text>
            </View>
          </TouchableOpacity>
        )}


        {/* Simplified menu when maid is currently hired */}
        {maidProfile?.isHired ? (
          <View style={{ marginHorizontal:14, backgroundColor:COLORS.surface, borderWidth:1, borderColor:COLORS.border, borderRadius:8, overflow:'hidden' }}>
            <View style={{ backgroundColor:'rgba(46,125,94,0.08)', padding:14, borderBottomWidth:1, borderBottomColor:COLORS.border }}>
              <Text style={{ fontFamily:FONTS.display, fontSize:16, color:'#2e7d5e' }}>{t('currently_hired_badge')}</Text>
              <Text style={{ fontSize:12, color:COLORS.muted, marginTop:2 }}>{t('currently_hired_desc')}</Text>
            </View>
            {[
              { icon:'help-circle-outline', iconColor:COLORS.green, bg:'#e8f4f1', title:t('open_support'),  sub:t('contact_admin_note'), onPress:() => navigation.navigate('Support'), isRed:false },
              { icon:'globe-outline',       iconColor:'#4f46e5',    bg:'#f0f4ff', title:t('language'),       sub:'',                     onPress:() => setLangVisible(true),           isRed:false },
              { icon:'log-out-outline',     iconColor:'#e05555',    bg:'#fef2f2', title:t('menu_sign_out'), sub:'',                     onPress:logout,                               isRed:true },
            ].map(({ icon, iconColor, bg, title, sub, onPress, isRed })=>(
              <TouchableOpacity key={icon} onPress={onPress}
                style={{ flexDirection:'row', alignItems:'center', gap:11, padding:13, borderBottomWidth:1, borderBottomColor:COLORS.border }}>
                <View style={{ width:30, height:30, borderRadius:5, backgroundColor:bg, alignItems:'center', justifyContent:'center' }}><Ionicons name={icon} size={16} color={iconColor} /></View>
                <View style={{ flex:1 }}><Text style={{ fontSize:13, fontWeight:'500', color: isRed?COLORS.red:COLORS.text }}>{title}</Text>{sub?<Text style={{ fontSize:10, color:COLORS.muted }}>{sub}</Text>:null}</View>
                <Text style={{ color:COLORS.muted }}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={{ marginHorizontal:14, backgroundColor:COLORS.surface, borderWidth:1, borderColor:COLORS.border, borderRadius:8, overflow:'hidden' }}>
            {[
              { icon:'person-circle-outline', iconColor:'#d97706',   bg:'#fef3e2', id:'hire_req',  title:t('menu_hire_requests'), sub: pendingRequests > 0 ? `${pendingRequests} ${t('incoming_label')}` : '', isRed:false, onPress: () => navigation.navigate('HireRequest') },
              { icon:'chatbubbles-outline',   iconColor:'#7c3aed',   bg:'#ede8fd', id:'messages',  title:t('menu_messages2'),     sub: `${stats.chats} ${t('chats_stat')}`,                      isRed:false, onPress: () => navigation.navigate('MaidChats') },
              { icon:'card-outline',          iconColor:'#2563eb',   bg:'#e8f0fe', id:'payments',  title:t('menu_payments2'),     sub: profile?.subscription?.endDate ? `${t('active_subscription')} · ${new Date(profile.subscription.endDate).toLocaleDateString([], { day:'numeric', month:'short' })}` : '', isRed:false, onPress: () => navigation.navigate('PaymentHistory') },
              { icon:'gift-outline',          iconColor:'#d97706',   bg:'#fef3e2', id:'referrals', title:t('menu_referrals'),     sub: t('share_code_earn'),                                     isRed:false, onPress: () => navigation.navigate('Coupons') },
              { icon:'bar-chart-outline',     iconColor:'#0891b2',   bg:'#e0f2fe', id:'analytics', title:t('menu_analytics'),     sub: `${stats.views} ${t('views')} · ${stats.likes} ${t('likes')}`, isRed:false, onPress: () => navigation.navigate('Analytics') },
              { icon:'globe-outline',         iconColor:'#4f46e5',   bg:'#f0f4ff', id:'language',  title:t('language'),           sub: '',                                                       isRed:false, onPress: () => setLangVisible(true) },
              { icon:'notifications-outline', iconColor:'#ef4444',   bg:'#fef2f2', id:'notifs',    title:t('menu_notifications2'),sub: '',                                                       isRed:false, onPress: () => navigation.navigate('MaidAlerts') },
              { icon:'help-circle-outline',   iconColor:COLORS.green,bg:'#e8f4f1', id:'support',   title:t('menu_support2'),      sub: t('contact_admin_note'),                                  isRed:false, onPress: () => navigation.navigate('Support') },
              ...(!maidProfile?.isHired ? [{ icon:'trash-outline', iconColor:'#e05555', bg:'#fef2f2', id:'delete', title:t('menu_delete_account'), sub: t('deactivates_profile'), isRed:true, onPress: handleDeleteAccount }] : []),
              { icon:'log-out-outline',       iconColor:'#e05555',   bg:'#fef2f2', id:'sign_out',  title:t('menu_sign_out'),      sub: '',                                                       isRed:true,  onPress: logout },
            ].map(({ icon, iconColor, bg, id, title, sub, isRed, onPress }) => (
              <TouchableOpacity key={id} onPress={onPress}
                style={{ flexDirection:'row', alignItems:'center', gap:11, padding:13, borderBottomWidth:1, borderBottomColor:COLORS.border }}>
                <View style={{ width:30, height:30, borderRadius:5, backgroundColor:bg, alignItems:'center', justifyContent:'center' }}><Ionicons name={icon} size={16} color={iconColor} /></View>
                <View style={{ flex:1 }}><Text style={{ fontSize:13, fontWeight:'500', color: isRed?COLORS.red:COLORS.text }}>{title}</Text>{sub?<Text style={{ fontSize:10, color:COLORS.muted }}>{sub}</Text>:null}</View>
                <Text style={{ color:COLORS.muted }}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* My Reviews */}
        <View style={{ marginHorizontal:14, marginTop:20, marginBottom:8 }}>
          <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <Text style={{ fontFamily:FONTS.display, fontSize:20, color:COLORS.dark }}>
              {t('my_reviews')}
            </Text>
            {maidProfile?.rating > 0 && (
              <View style={{ backgroundColor:'rgba(13,56,39,0.12)', borderWidth:1, borderColor:'rgba(13,56,39,0.3)', borderRadius:8, paddingHorizontal:10, paddingVertical:5 }}>
                <Text style={{ fontFamily:FONTS.display, fontSize:18, color:COLORS.green }}>
                  {maidProfile.rating?.toFixed(1)} ★
                </Text>
              </View>
            )}
          </View>

          {myReviews.length === 0 ? (
            <View style={{ backgroundColor:COLORS.surface, borderRadius:10, borderWidth:1, borderColor:COLORS.border, padding:20, alignItems:'center' }}>
              <Ionicons name="star-outline" size={32} color={COLORS.muted} style={{ marginBottom:8 }} />
              <Text style={{ fontSize:14, color:COLORS.dark, fontWeight:'600' }}>{t('no_reviews_maid')}</Text>
              <Text style={{ fontSize:12, color:COLORS.muted, marginTop:4, textAlign:'center', lineHeight:18 }}>
                {t('no_reviews_maid_sub')}
              </Text>
            </View>
          ) : (
            <>
              {/* Rating summary */}
              {(() => {
                const avg = (myReviews.reduce((s,r) => s + r.rating, 0) / myReviews.length).toFixed(1);
                const counts = [5,4,3,2,1].map(s => ({ star:s, count: myReviews.filter(r=>r.rating===s).length }));
                return (
                  <View style={{ backgroundColor:COLORS.surface, borderRadius:12, borderWidth:1, borderColor:COLORS.border, padding:16, marginBottom:12, flexDirection:'row', gap:16, alignItems:'center' }}>
                    <View style={{ alignItems:'center', minWidth:64 }}>
                      <Text style={{ fontFamily:FONTS.display, fontSize:40, color:COLORS.green, lineHeight:44 }}>{avg}</Text>
                      <View style={{ flexDirection:'row', gap:1, marginTop:2 }}>
                        {Array.from({ length: Math.round(Number(avg)) }).map((_, i) => <Ionicons key={i} name="star" size={13} color="#f59e0b" />)}
                      </View>
                      <Text style={{ fontSize:10, color:COLORS.muted, marginTop:3 }}>{myReviews.length} review{myReviews.length!==1?'s':''}</Text>
                    </View>
                    <View style={{ flex:1 }}>
                      {counts.map(({ star, count }) => (
                        <View key={star} style={{ flexDirection:'row', alignItems:'center', gap:6, marginBottom:4 }}>
                          <Text style={{ fontSize:10, color:COLORS.muted, width:10 }}>{star}</Text>
                          <Ionicons name="star" size={10} color="#f59e0b" />
                          <View style={{ flex:1, height:6, backgroundColor:COLORS.border, borderRadius:3, overflow:'hidden' }}>
                            <View style={{ height:'100%', width: myReviews.length ? `${(count/myReviews.length)*100}%` : '0%', backgroundColor:COLORS.green, borderRadius:3 }}/>
                          </View>
                          <Text style={{ fontSize:10, color:COLORS.muted, width:16, textAlign:'right' }}>{count}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                );
              })()}

              {myReviews.map(rv => (
                <View key={rv._id} style={{ backgroundColor:'#fff', borderWidth:1, borderColor:COLORS.border, borderRadius:12, padding:16, marginBottom:10, shadowColor:'#0D3827', shadowOpacity:0.05, shadowRadius:4, elevation:1 }}>
                  <View style={{ flexDirection:'row', alignItems:'center', gap:10, marginBottom:8 }}>
                    <View style={{ width:36, height:36, borderRadius:18, backgroundColor:'#e8f4f1', borderWidth:1.5, borderColor:COLORS.green, alignItems:'center', justifyContent:'center' }}>
                      <Ionicons name="person" size={16} color={COLORS.green} />
                    </View>
                    <View style={{ flex:1 }}>
                      <Text style={{ fontSize:13, fontWeight:'700', color:COLORS.dark }}>{rv.housewife?.name || 'Customer'}</Text>
                      <Text style={{ fontSize:10, color:COLORS.muted }}>{new Date(rv.createdAt).toLocaleDateString([], { day:'numeric', month:'short', year:'numeric' })}</Text>
                    </View>
                    <View style={{ flexDirection:'row', gap:1 }}>
                      {[1,2,3,4,5].map(s => (
                        <Text key={s} style={{ fontSize:15, color: s <= rv.rating ? '#f59e0b' : '#e5e7eb' }}>★</Text>
                      ))}
                    </View>
                  </View>
                  {rv.comment ? (
                    <Text style={{ fontSize:13, color:COLORS.text, lineHeight:20, fontStyle:'italic' }}>"{rv.comment}"</Text>
                  ) : (
                    <Text style={{ fontSize:12, color:COLORS.muted, fontStyle:'italic' }}>{t('no_comment_short')}</Text>
                  )}
                </View>
              ))}
            </>
          )}
        </View>

      </ScrollView>
    </View>
  );
}

// ─── ApprovalScreen ─── (kept for navigation compatibility — hire is now done from maid profile)
export function ApprovalScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { maidName } = route.params || {};

  const STEPS = [
    { title: 'Chat with Maid',   desc: 'Open a chat from the maid\'s profile.',      state: 'done' },
    { title: 'Review Profile',   desc: 'Check experience, skills, and references.',   state: 'done' },
    { title: 'Hire the Maid',    desc: 'Tap "Hire this Maid" on her profile page.',   state: 'active' },
  ];
  const stateColors = { done: '#2e7d5e', active: COLORS.green };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.cream }}>
      <View style={{ backgroundColor: '#0D3827', padding: 18, paddingTop: 54 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ width:38, height:38, borderRadius:19, backgroundColor:'rgba(255,255,255,0.2)', alignItems:'center', justifyContent:'center' }}>
          <BackChevron />
        </TouchableOpacity>
        <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', letterSpacing: 1, textTransform: 'uppercase', marginTop: 10 }}>Hire Flow</Text>
        <Text style={{ fontFamily: FONTS.display, fontSize: 20, color: '#fff', marginTop: 3 }}>{maidName || 'How to Hire'}</Text>
      </View>
      <View style={{ flex: 1, padding: 18 }}>
        <Text style={{ fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: COLORS.green, marginBottom: 14, fontFamily: FONTS.bodySemiBold }}>Steps to Hire</Text>
        {STEPS.map((s, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 12, marginBottom: 18 }}>
            <View style={{ alignItems: 'center' }}>
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: stateColors[s.state] || COLORS.border, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 12, color: '#fff' }}>
                  {s.state === 'done' ? '✓' : 'â–¶'}
                </Text>
              </View>
              {i < STEPS.length - 1 && <View style={{ width: 1.5, flex: 1, backgroundColor: COLORS.border, marginVertical: 3 }} />}
            </View>
            <View style={{ flex: 1, paddingTop: 4 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.dark }}>{s.title}</Text>
              <Text style={{ fontSize: 11, color: COLORS.muted, marginTop: 2, lineHeight: 16 }}>{s.desc}</Text>
            </View>
          </View>
        ))}
        <View style={{ backgroundColor: '#e8f4f1', borderWidth: 1, borderColor: COLORS.border, borderRadius: 7, padding: 14, borderLeftWidth: 3, borderLeftColor: COLORS.green, marginTop: 8 }}>
          <Text style={{ fontSize: 13, color: COLORS.dark, lineHeight: 20 }}>
            To hire a helper, open her profile from Browse and tap <Text style={{ fontWeight:'700' }}>"Hire this Maid"</Text>. She will be marked as unavailable until you release the vacancy.
          </Text>
        </View>
        <TouchableOpacity
          style={{ backgroundColor: COLORS.green, padding: 14, borderRadius: 5, alignItems: 'center', marginTop: 20 }}
          onPress={() => navigation.navigate('BrowseMain')}>
          <Text style={{ fontFamily: FONTS.bodySemiBold, fontSize: 14, color: '#fff' }}>Browse Maids</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── SupportScreen ───
export function SupportScreen({ navigation }) {
  const { user } = useAuthStore();
  const { t } = useTranslation();

  const [subject, setSubject]   = useState('');
  const [message, setMessage]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [tickets, setTickets]   = useState([]);
  const [tab, setTab]           = useState('new'); // 'new' | 'history'

  const loadTickets = React.useCallback(() => {
    supportAPI.getMine().then(r => setTickets(r.data.tickets || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (tab === 'history') loadTickets();
  }, [tab, loadTickets]);

  useFocusEffect(React.useCallback(() => {
    if (tab === 'history') loadTickets();
  }, [tab, loadTickets]));

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) return Toast.show({ type:'error', text1:t('subject_msg_required') });
    setLoading(true);
    try {
      await supportAPI.create({ subject: subject.trim(), message: message.trim() });
      Toast.show({ type:'success', text1:t('ticket_submitted'), text2:t('ticket_submitted_sub') });
      setSubject(''); setMessage('');
      setTab('history');
    } catch (err) {
      Toast.show({ type:'error', text1: err.response?.data?.message || 'Failed to submit' });
    } finally { setLoading(false); }
  };

  const STATUS_COLOR = { open:COLORS.green, in_progress:'#2196F3', resolved:'#2e7d5e', closed:COLORS.muted };

  return (
    <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS==='ios'?'padding':undefined}>
      <View style={{ backgroundColor:'#0D3827', padding:18, paddingTop:54 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ width:38, height:38, borderRadius:19, backgroundColor:'rgba(255,255,255,0.2)', alignItems:'center', justifyContent:'center' }}>
          <BackChevron />
        </TouchableOpacity>
        <Text style={{ fontFamily:FONTS.display, fontSize:24, color:'#fff', marginTop:10 }}>{t('support_title')}</Text>
        <Text style={{ fontSize:11, color:'rgba(255,255,255,0.6)', marginTop:2 }}>{t('support_sub')}</Text>
      </View>
      {/* Tabs */}
      <View style={{ flexDirection:'row', backgroundColor:COLORS.surface, borderBottomWidth:1, borderBottomColor:COLORS.border }}>
        {[['new', t('new_ticket')],['history', t('my_tickets')]].map(([key, label]) => (
          <TouchableOpacity key={key} onPress={() => setTab(key)}
            style={{ flex:1, padding:14, alignItems:'center', borderBottomWidth:2, borderBottomColor: tab===key ? COLORS.green : 'transparent' }}>
            <Text style={{ fontSize:13, fontFamily:FONTS.bodySemiBold, color: tab===key ? COLORS.green : COLORS.muted }}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'new' ? (
        <ScrollView style={{ flex:1, backgroundColor:COLORS.cream }} contentContainerStyle={{ padding:20 }} keyboardShouldPersistTaps="handled">
          <Text style={{ fontSize:10, letterSpacing:1.2, textTransform:'uppercase', color:COLORS.muted, marginBottom:5, fontFamily:FONTS.bodySemiBold }}>{t('subject_label')}</Text>
          <TextInput style={{ borderWidth:1.5, borderColor:COLORS.border, borderRadius:5, padding:13, fontSize:14, color:COLORS.text, backgroundColor:COLORS.surface, marginBottom:16 }}
            value={subject} onChangeText={setSubject} placeholder={t('subject_ph')} placeholderTextColor={COLORS.muted}/>
          <Text style={{ fontSize:10, letterSpacing:1.2, textTransform:'uppercase', color:COLORS.muted, marginBottom:5, fontFamily:FONTS.bodySemiBold }}>{t('message_label2')}</Text>
          <TextInput style={{ borderWidth:1.5, borderColor:COLORS.border, borderRadius:5, padding:13, fontSize:14, color:COLORS.text, backgroundColor:COLORS.surface, height:140, textAlignVertical:'top', marginBottom:20 }}
            value={message} onChangeText={setMessage} placeholder={t('message_ph')} placeholderTextColor={COLORS.muted} multiline/>
          <TouchableOpacity style={{ backgroundColor:COLORS.green, padding:15, borderRadius:5, alignItems:'center', opacity: loading ? 0.6 : 1 }}
            onPress={handleSubmit} disabled={loading}>
            <Text style={{ fontFamily:FONTS.bodySemiBold, fontSize:14, color:'#fff' }}>{loading ? t('submitting') : t('submit_ticket')}</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={i => i._id}
          contentContainerStyle={{ padding:14 }}
          renderItem={({ item }) => (
            <View style={{ backgroundColor:COLORS.surface, borderWidth:1, borderColor:COLORS.border, borderRadius:8, padding:14, marginBottom:10, borderLeftWidth:3, borderLeftColor: STATUS_COLOR[item.status] || COLORS.gold }}>
              <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:4 }}>
                <Text style={{ fontSize:13, fontFamily:FONTS.bodySemiBold, color:COLORS.dark, flex:1 }}>{item.subject}</Text>
                <View style={{ backgroundColor:`${STATUS_COLOR[item.status]}20`, paddingHorizontal:8, paddingVertical:3, borderRadius:10 }}>
                  <Text style={{ fontSize:10, color: STATUS_COLOR[item.status], textTransform:'uppercase', letterSpacing:0.5 }}>{item.status.replace('_',' ')}</Text>
                </View>
              </View>
              <Text style={{ fontSize:12, color:COLORS.muted, lineHeight:18 }} numberOfLines={2}>{item.message}</Text>
              {item.adminReply ? (
                <View style={{ backgroundColor:'#f0f7f4', borderLeftWidth:3, borderLeftColor:'#2e7d5e', borderRadius:4, padding:8, marginTop:8 }}>
                  <Text style={{ fontSize:11, color:'#2e7d5e', fontFamily:FONTS.bodySemiBold, marginBottom:3 }}>💬 Support</Text>
                  <Text style={{ fontSize:12, color:'#1a4a35', lineHeight:18 }}>{item.adminReply}</Text>
                  {item.repliedAt ? <Text style={{ fontSize:10, color:COLORS.muted, marginTop:4 }}>{new Date(item.repliedAt).toLocaleDateString()}</Text> : null}
                </View>
              ) : null}
              <Text style={{ fontSize:10, color:COLORS.muted, marginTop:6 }}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={{ textAlign:'center', color:COLORS.muted, marginTop:60 }}>{t('no_tickets')}</Text>}
        />
      )}
    </KeyboardAvoidingView>
  );
}

// ─── EditHWProfileScreen ───
export function EditHWProfileScreen({ navigation }) {
  const { authAPI, hwAPI } = require('../services/api');
  const { user, init } = useAuthStore();
  const { t } = useTranslation();

  const [name, setName]       = useState(user?.name || '');
  const [phone, setPhone]     = useState(user?.phone || '');
  const [city, setCity]       = useState('');
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    hwAPI.getProfile().then(r => {
      const p = r.data?.profile;
      if (p) { setCity(p.city || ''); setCountry(p.country || ''); }
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!name.trim()) return Toast.show({ type:'error', text1:t('name_required_err') });
    setLoading(true);
    try {
      await Promise.all([
        authAPI.updateMe({ name: name.trim(), phone: phone.trim() }),
        hwAPI.updateProfile({ city: city.trim(), country: country.trim() }),
      ]);
      await init();
      Toast.show({ type:'success', text1:t('profile_updated') });
      navigation.goBack();
    } catch (err) {
      Toast.show({ type:'error', text1: err.response?.data?.message || t('update_failed') });
    } finally { setLoading(false); }
  };

  const Field = ({ label, value, onChange, placeholder, keyboardType }) => (
    <View style={{ marginBottom:16 }}>
      <Text style={{ fontSize:10, letterSpacing:1.2, textTransform:'uppercase', color:COLORS.muted, marginBottom:5, fontFamily:FONTS.bodySemiBold }}>{label}</Text>
      <TextInput
        style={{ borderWidth:1.5, borderColor:COLORS.border, borderRadius:5, padding:13, fontSize:14, color:COLORS.text, backgroundColor:COLORS.surface, fontFamily:FONTS.body }}
        value={value} onChangeText={onChange} placeholder={placeholder}
        placeholderTextColor={COLORS.muted} keyboardType={keyboardType || 'default'}
      />
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS==='ios'?'padding':undefined}>
      <View style={{ backgroundColor:'#0D3827', padding:18, paddingTop:54 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ width:38, height:38, borderRadius:19, backgroundColor:'rgba(255,255,255,0.2)', alignItems:'center', justifyContent:'center' }}>
          <BackChevron />
        </TouchableOpacity>
        <Text style={{ fontFamily:FONTS.display, fontSize:24, color:'#fff', marginTop:10 }}>{t('edit_profile_title2')}</Text>
      </View>
      <ScrollView style={{ flex:1, backgroundColor:COLORS.cream }} contentContainerStyle={{ padding:20 }} keyboardShouldPersistTaps="handled">
        <Field label={t('field_full_name')} value={name}    onChange={setName}    placeholder={t('name_ph')} />
        <Field label={t('phone')}           value={phone}   onChange={setPhone}   placeholder="+20 ..." keyboardType="phone-pad" />
        <Field label={t('field_city')}      value={city}    onChange={setCity}    placeholder={t('city_ph')} />
        <Field label={t('field_country')}   value={country} onChange={setCountry} placeholder={t('country_ph')} />
        <TouchableOpacity
          style={{ backgroundColor:COLORS.green, padding:15, borderRadius:5, alignItems:'center', marginTop:8, opacity: loading ? 0.6 : 1 }}
          onPress={handleSave} disabled={loading}>
          <Text style={{ fontFamily:FONTS.bodySemiBold, fontSize:14, color:'#fff' }}>{loading ? t('saving') : t('save_changes')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── AnalyticsScreen ───
export function AnalyticsScreen({ navigation }) {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);
      maidsAPI.getMyProfile()
        .then(r => setStats(r.data?.maid?.stats || {}))
        .catch(() => setStats({}))
        .finally(() => setLoading(false));
    }, [])
  );

  const rows = [
    { icon:'eye-outline',          iconColor:'#0891b2', label:t('stat_views'),   value: stats?.views     ?? 0 },
    { icon:'heart-outline',        iconColor:'#e05555', label:t('stat_likes'),   value: stats?.likes     ?? 0 },
    { icon:'chatbubbles-outline',  iconColor:'#7c3aed', label:t('stat_chats2'),  value: stats?.chats     ?? 0 },
    { icon:'home-outline',         iconColor:COLORS.green, label:t('stat_hired'), value: stats?.hireCount ?? 0 },
  ];

  return (
    <View style={{ flex:1, backgroundColor:COLORS.cream }}>
      <View style={{ backgroundColor:'#0D3827', padding:18, paddingTop:54 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ width:38, height:38, borderRadius:19, backgroundColor:'rgba(255,255,255,0.2)', alignItems:'center', justifyContent:'center' }}>
          <BackChevron />
        </TouchableOpacity>
        <Text style={{ fontFamily:FONTS.display, fontSize:24, color:'#fff', marginTop:10 }}>{t('analytics_title')}</Text>
        <Text style={{ fontSize:11, color:'rgba(255,255,255,0.6)', marginTop:2 }}>{t('analytics_sub')}</Text>
      </View>
      {loading
        ? <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}>
            <View style={{ width:24, height:24, borderRadius:12, borderWidth:2, borderColor:COLORS.green, borderTopColor:'transparent' }}/>
          </View>
        : <ScrollView contentContainerStyle={{ padding:16 }}>
            <View style={{ flexDirection:'row', flexWrap:'wrap', gap:10, marginBottom:16 }}>
              {rows.map(({ icon, iconColor, label, value }) => (
                <View key={label} style={{ width:'47%', backgroundColor:COLORS.surface, borderWidth:1, borderColor:COLORS.border, borderRadius:8, padding:16, alignItems:'center' }}>
                  <Ionicons name={icon} size={28} color={iconColor} style={{ marginBottom:6 }} />
                  <Text style={{ fontFamily:FONTS.display, fontSize:30, color:COLORS.green }}>{value}</Text>
                  <Text style={{ fontSize:10, textTransform:'uppercase', letterSpacing:0.8, color:COLORS.muted, marginTop:4, textAlign:'center' }}>{label}</Text>
                </View>
              ))}
            </View>
            <View style={{ backgroundColor:COLORS.surface, borderWidth:1, borderColor:COLORS.border, borderRadius:8, padding:16 }}>
              <Text style={{ fontSize:11, letterSpacing:1, textTransform:'uppercase', color:COLORS.green, fontFamily:FONTS.bodySemiBold, marginBottom:12 }}>{t('summary_label')}</Text>
              {rows.map(({ icon, iconColor, label, value }) => (
                <View key={label} style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingVertical:8, borderBottomWidth:1, borderBottomColor:COLORS.border }}>
                  <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
                    <Ionicons name={icon} size={15} color={iconColor} />
                    <Text style={{ fontSize:13, color:COLORS.text }}>{label}</Text>
                  </View>
                  <Text style={{ fontSize:13, fontFamily:FONTS.bodySemiBold, color:COLORS.dark }}>{value}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
      }
    </View>
  );
}

// ─── PaymentHistoryScreen ───
export function PaymentHistoryScreen({ navigation }) {
  const { t } = useTranslation();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentsAPI.getHistory()
      .then(r => setPayments(r.data?.payments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statusColor = { completed:'#2e7d5e', pending:COLORS.green, failed:'#e05555', refunded:'#888' };
  const methodIcon  = { fawry:'card-outline', vodafone_cash:'phone-portrait-outline', instapay:'flash-outline', amazon_pay:'bag-outline', paymob:'card-outline', cash_transfer:'cash-outline' };

  return (
    <View style={{ flex:1, backgroundColor:COLORS.cream }}>
      <View style={{ backgroundColor:'#0D3827', padding:18, paddingTop:54 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ width:38, height:38, borderRadius:19, backgroundColor:'rgba(255,255,255,0.2)', alignItems:'center', justifyContent:'center' }}>
          <BackChevron />
        </TouchableOpacity>
        <Text style={{ fontFamily:FONTS.display, fontSize:24, color:'#fff', marginTop:10 }}>{t('payments_title')}</Text>
        <Text style={{ fontSize:11, color:'rgba(255,255,255,0.6)', marginTop:2 }}>{t('payments_sub')}</Text>
      </View>
      {loading
        ? <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}>
            <ActivityIndicator size="large" color={COLORS.green}/>
          </View>
        : <FlatList
            data={payments}
            keyExtractor={i => i._id}
            contentContainerStyle={{ padding:14 }}
            removeClippedSubviews
            renderItem={({ item }) => (
              <View style={{ backgroundColor:COLORS.surface, borderWidth:1, borderColor:COLORS.border, borderRadius:8, padding:14, marginBottom:10, borderLeftWidth:3, borderLeftColor: statusColor[item.status] || COLORS.green }}>
                <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                  <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
                    <Ionicons name={methodIcon[item.method] || 'card-outline'} size={22} color={COLORS.muted} />
                    <View>
                      <View style={{ flexDirection:'row', alignItems:'center', gap:6 }}>
                        <Text style={{ fontSize:13, fontWeight:'600', color:COLORS.dark, textTransform:'capitalize' }}>{item.type}</Text>
                        {item.offlineByAdmin && <View style={{ backgroundColor:'rgba(13,56,39,0.15)', paddingHorizontal:6, paddingVertical:1, borderRadius:4, borderWidth:1, borderColor:'rgba(13,56,39,0.4)' }}><Text style={{ fontSize:9, color:COLORS.green, fontWeight:'700', textTransform:'uppercase', letterSpacing:0.5 }}>Offline</Text></View>}
                      </View>
                      <Text style={{ fontSize:11, color:COLORS.muted }}>{(item.method||'').replace('_',' ')}</Text>
                    </View>
                  </View>
                  <View style={{ alignItems:'flex-end' }}>
                    <Text style={{ fontFamily:FONTS.display, fontSize:18, color:COLORS.green }}>EGP {(item.amount||0).toLocaleString()}</Text>
                    <View style={{ backgroundColor:`${statusColor[item.status]||'#888'}20`, paddingHorizontal:8, paddingVertical:2, borderRadius:10, marginTop:3 }}>
                      <Text style={{ fontSize:10, color: statusColor[item.status]||'#888', textTransform:'uppercase', letterSpacing:0.5 }}>{item.status}</Text>
                    </View>
                  </View>
                </View>
                {item.subscriptionPlan && <Text style={{ fontSize:11, color:COLORS.muted, marginBottom:2 }}>Plan: {item.subscriptionPlan}</Text>}
                <Text style={{ fontSize:10, color:COLORS.muted }}>{new Date(item.createdAt).toLocaleDateString()}</Text>
              </View>
            )}
            ListEmptyComponent={
              <View style={{ alignItems:'center', marginTop:80 }}>
                <Ionicons name="card-outline" size={48} color={COLORS.muted} style={{ marginBottom:12 }} />
                <Text style={{ fontSize:15, color:COLORS.dark, fontFamily:FONTS.display }}>{t('no_payments')}</Text>
                <Text style={{ fontSize:12, color:COLORS.muted, marginTop:4 }}>{t('transactions_here')}</Text>
              </View>
            }
          />
      }
    </View>
  );
}

// ─── EditProfileScreen ───
export function EditProfileScreen() {
  return (
    <View style={{ flex:1, backgroundColor:COLORS.cream, alignItems:'center', justifyContent:'center' }}>
      <Ionicons name="create-outline" size={36} color={COLORS.muted} style={{ marginBottom:12 }} />
      <Text style={{ fontFamily:FONTS.display, fontSize:22, color:COLORS.dark }}>Edit Profile</Text>
      <Text style={{ fontSize:13, color:COLORS.muted, marginTop:6 }}>Profile editing coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar:     { padding:16, paddingTop:54, backgroundColor:COLORS.surface, borderBottomWidth:1, borderBottomColor:COLORS.border, flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  pageTitle:  { fontFamily:FONTS.display, fontSize:22, color:COLORS.dark },
  notifItem:  { flexDirection:'row', gap:12, padding:14, borderBottomWidth:1, borderBottomColor:COLORS.border, alignItems:'flex-start' },
  notifUnread:{ backgroundColor:'#e8f4f1' },
  notifIcon:  { width:38, height:38, borderRadius:19, alignItems:'center', justifyContent:'center', flexShrink:0 },
  notifTitle: { fontSize:13, fontWeight:'600', color:COLORS.dark, marginBottom:2 },
  notifBody:  { fontSize:12, color:COLORS.muted, lineHeight:17 },
  notifTime:  { fontSize:10, color:COLORS.muted, marginTop:3 },
  unreadDot:  { width:8, height:8, borderRadius:4, backgroundColor:COLORS.green, marginTop:5 },
  chatItem:   { flexDirection:'row', gap:12, padding:14, borderBottomWidth:1, borderBottomColor:COLORS.border, alignItems:'center' },
  chatAva:    { width:44, height:44, borderRadius:22, backgroundColor:COLORS.green, alignItems:'center', justifyContent:'center', overflow:'hidden' },
  chatName:   { fontFamily:FONTS.display, fontSize:16, color:COLORS.dark },
  chatLast:   { fontSize:12, color:COLORS.muted, marginTop:1 },
  chatTime:   { fontSize:10, color:COLORS.muted },
  savedCard:  { flexDirection:'row', alignItems:'center', gap:12, padding:13, backgroundColor:COLORS.surface, borderWidth:1, borderColor:COLORS.border, borderRadius:8, marginBottom:10 },
  savedAva:   { width:44, height:44, borderRadius:22, alignItems:'center', justifyContent:'center' },
  savedName:  { fontFamily:FONTS.display, fontSize:16, color:COLORS.dark },
  savedSub:   { fontSize:11, color:COLORS.muted, marginTop:1 },
});

export default NotificationsScreen;
