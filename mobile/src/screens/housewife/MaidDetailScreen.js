import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, StatusBar, Modal, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Linking, FlatList, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const { width: SW, height: SH } = Dimensions.get('window');
import { maidsAPI, chatsAPI, hwAPI, paymentsAPI, configAPI } from '../../services/api';
import io from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import useAuthStore from '../../store/authStore';
import { COLORS, FONTS, SHADOWS } from '../../utils/theme';
import Toast from 'react-native-toast-message';
import { useTranslation } from '../../utils/i18n';

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
const WEEK_MS       = 7 * 24 * 60 * 60 * 1000;
const MONTH_MS      = 30 * 24 * 60 * 60 * 1000;
function getReplacementFee(hiredAt) {
  const ms = Date.now() - new Date(hiredAt || 0).getTime();
  if (ms <= THREE_DAYS_MS) return { amount: 0,   isFree: true  };
  if (ms <= WEEK_MS)       return { amount: 500,  isFree: false };
  if (ms <= MONTH_MS)      return { amount: 700,  isFree: false };
  return                          { amount: 1000, isFree: false };
}

export default function MaidDetailScreen({ route, navigation }) {
  const { maid } = route.params;
  const { t } = useTranslation();
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hireLoading, setHireLoading] = useState(false);
  const [reviewModal, setReviewModal] = useState(false);
  const [reviewStar, setReviewStar] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const user    = useAuthStore(s => s.user);
  const profile = useAuthStore(s => s.profile);
  const [isHired, setIsHired]               = useState(false);
  const [hireRequestSent, setHireRequestSent] = useState(false);
  const [termsModal, setTermsModal]           = useState(false);
  const [termsAgreed, setTermsAgreed]         = useState(false);
  const [termsUrl, setTermsUrl]               = useState(null);
  const [galleryVisible, setGalleryVisible]   = useState(false);
  const [galleryIndex, setGalleryIndex]       = useState(0);
  const galleryRef                            = useRef(null);
  const [activeHire, setActiveHire]           = useState(null); // hired maid that is NOT this one
  const [releaseModal, setReleaseModal]       = useState(false);
  const [releaseLoading, setReleaseLoading]   = useState(false);
  const [pendingAction, setPendingAction]     = useState(null); // 'chat' | 'hire'

  const photos = (maid.photos || []).filter(p => p?.url);
  const socketRef = useRef();

  // Real-time: listen for hire request response (approve/reject) while screen is open
  useEffect(() => {
    let mounted = true;
    (async () => {
      const token = await SecureStore.getItemAsync('maidconnect_token');
      const BASE = Constants.expoConfig?.extra?.API_URL?.replace('/api', '') || 'https://api.servix.world';
      const socket = io(BASE, {
        auth: { token },
        transports: ['polling', 'websocket'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
      });
      socketRef.current = socket;
      socket.on('hire_request_response', ({ action, maidName: respondingMaidName }) => {
        if (!mounted) return;
        // Re-fetch profile to get accurate hired/pending state
        hwAPI.getProfile().then(r => {
          if (!mounted) return;
          const hw = r.data?.profile;
          const hired = (hw?.hiredMaids || []).some(h => h.maid === maid._id || h.maid?._id === maid._id);
          setIsHired(hired);
          setHireRequestSent((r.data?.pendingHireRequests || []).includes(maid._id));
        }).catch(() => {});
        if (action === 'approve') {
          route.params?.onHired?.(maid._id);
          Toast.show({ type: 'success', text1: '🎉 Hire Confirmed!', text2: `${respondingMaidName} accepted your request.`, visibilityTime: 5000 });
        } else {
          Toast.show({ type: 'info', text1: 'Request Declined', text2: `${respondingMaidName} declined your request.`, visibilityTime: 4000 });
        }
      });
    })();
    return () => { mounted = false; socketRef.current?.disconnect(); };
  }, []);

  // Re-fetch on every focus so hire status stays fresh after maid approves
  useFocusEffect(
    useCallback(() => {
      maidsAPI.getReviews(maid._id)
        .then(r => setReviews(r.data?.reviews || []))
        .catch(() => {});
      hwAPI.getProfile().then(r => {
        const hw = r.data?.profile;
        const hiredMaids = hw?.hiredMaids || [];
        const hired = hiredMaids.some(h =>
          h.maid === maid._id || h.maid?._id === maid._id
        );
        setIsHired(hired);
        // Track any OTHER hired maid (different from the one being viewed)
        const other = hiredMaids.find(h => {
          const hId = h.maid?._id || h.maid;
          return String(hId) !== String(maid._id);
        });
        setActiveHire(other || null);
        const pending = (r.data?.pendingHireRequests || []);
        setHireRequestSent(pending.includes(maid._id));
        const isSaved = (hw?.savedMaids || []).some(s =>
          s === maid._id || s?._id === maid._id
        );
        setLiked(isSaved);
      }).catch(() => {});
      configAPI.getTerms().then(r => setTermsUrl(r.data?.termsUrl || null)).catch(() => {});
    }, [maid._id])
  );

  const handleLike = async () => {
    const next = !liked;
    setLiked(next);
    try { await maidsAPI.toggleLike(maid._id); }
    catch { setLiked(!next); Toast.show({ type:'error', text1: t('save_failed') }); }
  };

  const handleHire = () => {
    const sub = profile?.subscription;
    const active = sub?.status === 'active' && sub?.endDate && new Date(sub.endDate) > new Date();
    if (!active) { goToSubscription(); return; }
    // Block if customer already has a different maid hired — must release first
    if (activeHire) { setPendingAction('hire'); setReleaseModal(true); return; }
    setTermsAgreed(false);
    setTermsModal(true);
  };

  const confirmHire = async () => {
    if (!termsAgreed) {
      Toast.show({ type: 'error', text1: t('please_agree_terms') });
      return;
    }
    setTermsModal(false);
    setHireLoading(true);
    try {
      await hwAPI.hireMaid({ maidProfileId: maid._id });
      setHireRequestSent(true);
      Toast.show({ type:'success', text1: t('hire_req_sent'), text2: t('hire_req_sent_sub') });
    } catch (err) {
      if (err.response?.data?.requiresReplacementFee) {
        navigation.navigate('Payment', {
          type: 'replacement_fee',
          amount: err.response.data.penaltyAmount,
          maidName: maid.fullName,
        });
        return;
      }
      if (err.response?.data?.requiresSubscription) { goToSubscription(); return; }
      Toast.show({ type:'error', text1: err.response?.data?.message || t('hire_failed') });
    } finally {
      setHireLoading(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (reviewStar === 0) return Toast.show({ type: 'error', text1: t('please_rate_star') });
    setReviewLoading(true);
    try {
      await maidsAPI.submitReview(maid._id, { rating: reviewStar, comment: reviewComment.trim() });
      Toast.show({ type: 'success', text1: t('review_submitted') });
      setReviewModal(false);
      setReviewStar(0);
      setReviewComment('');
      const r = await maidsAPI.getReviews(maid._id);
      setReviews(r.data?.reviews || []);
    } catch (err) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || t('review_submit_failed') });
    } finally {
      setReviewLoading(false);
    }
  };

  const goToSubscription = () => navigation.navigate('CustomerSubscription', {
    maidUserId:    maid.user?._id || maid.user,
    maidProfileId: maid._id,
    maidName:      maid.fullName,
  });

  const handleReleaseAndContinue = async () => {
    if (!activeHire) return;
    setReleaseLoading(true);
    try {
      const maidProfileId = activeHire.maid?._id || activeHire.maid;
      await paymentsAPI.returnMaid({ maidProfileId });
      setActiveHire(null);
      setReleaseModal(false);
      if (pendingAction === 'chat') {
        setLoading(true);
        try {
          const res = await chatsAPI.startChat({ maidUserId: maid.user?._id || maid.user, maidProfileId: maid._id });
          navigation.navigate('Chat', { chatId: res.data.chat._id, maidName: maid.fullName });
        } catch (err) {
          Toast.show({ type: 'error', text1: err.response?.data?.message || t('chat_open_failed') });
        } finally {
          setLoading(false);
        }
      } else if (pendingAction === 'hire') {
        setTermsAgreed(false);
        setTermsModal(true);
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || t('release_failed') });
    } finally {
      setReleaseLoading(false);
    }
  };

  const handleOpenChat = async () => {
    if (user?.role === 'housewife') {
      const sub = profile?.subscription;
      const active = sub?.status === 'active' && sub?.endDate && new Date(sub.endDate) > new Date();
      if (!active) { goToSubscription(); return; }
      // Block if customer already has a different maid hired — must release first
      if (activeHire) { setPendingAction('chat'); setReleaseModal(true); return; }
    }
    setLoading(true);
    try {
      const res = await chatsAPI.startChat({ maidUserId: maid.user?._id || maid.user, maidProfileId: maid._id });
      navigation.navigate('Chat', { chatId: res.data.chat._id, maidName: maid.fullName });
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.code === 'REPLACEMENT_FEE_REQUIRED') {
        navigation.navigate('Payment', {
          type: 'replacement_fee',
          amount: err.response.data.penaltyAmount,
          maidName: maid.fullName,
        });
      } else if (err.response?.status === 403 && err.response?.data?.code === 'SUBSCRIPTION_REQUIRED') {
        goToSubscription();
      } else {
        Toast.show({ type: 'error', text1: err.response?.data?.message || t('chat_open_failed') });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex:1, backgroundColor:COLORS.cream }}>
      {/* Terms & Conditions Modal */}
      <Modal visible={termsModal} transparent animationType="slide" onRequestClose={() => setTermsModal(false)}>
        <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.6)', justifyContent:'flex-end' }}>
          <View style={{ backgroundColor:COLORS.surface, borderTopLeftRadius:16, borderTopRightRadius:16, padding:22 }}>
            <Text style={{ fontFamily:FONTS.display, fontSize:20, color:COLORS.dark, marginBottom:8 }}>{t('terms_title')}</Text>
            <Text style={{ fontSize:13, color:COLORS.muted, lineHeight:20, marginBottom:16 }}>
              {t('terms_body_short')}
            </Text>
            {termsUrl && (
              <TouchableOpacity onPress={() => Linking.openURL(termsUrl)} style={{ marginBottom:16 }}>
                <Text style={{ fontSize:13, color:COLORS.gold, textDecorationLine:'underline' }}>{t('terms_read_full')}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={{ flexDirection:'row', alignItems:'center', gap:12, marginBottom:20, padding:12, borderRadius:8, backgroundColor: termsAgreed ? 'rgba(46,125,94,0.08)' : '#f8f5f0', borderWidth:1, borderColor: termsAgreed ? '#2e7d5e' : COLORS.border }}
              onPress={() => setTermsAgreed(!termsAgreed)}>
              <View style={{ width:22, height:22, borderRadius:4, borderWidth:1.5, borderColor: termsAgreed ? '#2e7d5e' : COLORS.border, backgroundColor: termsAgreed ? '#2e7d5e' : 'transparent', alignItems:'center', justifyContent:'center' }}>
                {termsAgreed && <Text style={{ color:'#fff', fontSize:13, fontWeight:'700' }}>✓</Text>}
              </View>
              <Text style={{ fontSize:13, color:COLORS.text, flex:1 }}>{t('terms_agree_label')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ backgroundColor: termsAgreed ? COLORS.gold : COLORS.border, padding:14, borderRadius:8, alignItems:'center', marginBottom:10 }}
              onPress={confirmHire} disabled={!termsAgreed}>
              <Text style={{ fontFamily:FONTS.bodySemiBold, fontSize:14, color: termsAgreed ? COLORS.dark : COLORS.muted }}>
                {t('confirm_hire_btn')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setTermsModal(false)} style={{ alignItems:'center', padding:10 }}>
              <Text style={{ fontSize:13, color:COLORS.muted }}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Release current maid to chat/hire a new one */}
      <Modal visible={releaseModal} transparent animationType="fade" onRequestClose={() => { if (!releaseLoading) setReleaseModal(false); }}>
        <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.6)', justifyContent:'center', alignItems:'center', padding:24 }}>
          <View style={{ backgroundColor:COLORS.surface, borderRadius:16, padding:24, width:'100%' }}>
            <Text style={{ fontFamily:FONTS.display, fontSize:18, color:COLORS.dark, marginBottom:8 }}>
              {t('release_to_chat_title') || 'You have a maid hired'}
            </Text>
            <Text style={{ fontSize:13, color:COLORS.muted, lineHeight:20, marginBottom:6 }}>
              {`${activeHire?.maid?.fullName || 'Your current maid'} ${t('release_to_chat_body') || 'is currently hired. Release her to chat with or hire a new maid.'}`}
            </Text>
            {activeHire && (() => {
              const fee = getReplacementFee(activeHire.hiredAt);
              return (
                <View style={{ backgroundColor: fee.isFree ? 'rgba(46,125,94,0.08)' : 'rgba(224,85,85,0.08)', borderRadius:8, padding:12, marginBottom:16 }}>
                  <Text style={{ fontSize:13, color: fee.isFree ? '#2e7d5e' : '#c0392b', fontWeight:'600' }}>
                    {fee.isFree
                      ? (t('release_free_grace') || '✓ Within grace period — release is free')
                      : `${t('release_fee_label') || '⚠️ Replacement fee applies'}: EGP ${fee.amount}`}
                  </Text>
                </View>
              );
            })()}
            <TouchableOpacity
              style={{ backgroundColor: COLORS.gold, padding:14, borderRadius:8, alignItems:'center', marginBottom:10, opacity: releaseLoading ? 0.6 : 1 }}
              onPress={handleReleaseAndContinue}
              disabled={releaseLoading}>
              {releaseLoading
                ? <ActivityIndicator color={COLORS.dark} />
                : <Text style={{ fontFamily:FONTS.bodySemiBold, fontSize:14, color:COLORS.dark }}>
                    {pendingAction === 'chat'
                      ? (t('release_and_chat') || 'Release & Open Chat')
                      : (t('release_and_hire') || 'Release & Send Hire Request')}
                  </Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setReleaseModal(false)} style={{ alignItems:'center', padding:10 }} disabled={releaseLoading}>
              <Text style={{ fontSize:13, color:COLORS.muted }}>{t('cancel') || 'Cancel'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Full-screen Photo Gallery Modal */}
      <Modal visible={galleryVisible} transparent={false} animationType="fade" onRequestClose={() => setGalleryVisible(false)}>
        <View style={{ flex:1, backgroundColor:'#000' }}>
          {/* Close + counter */}
          <View style={{ position:'absolute', top:0, left:0, right:0, zIndex:10, flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingTop:54, paddingHorizontal:20, paddingBottom:12 }}>
            <TouchableOpacity onPress={() => setGalleryVisible(false)}
              style={{ backgroundColor:'rgba(0,0,0,0.6)', borderRadius:20, width:38, height:38, alignItems:'center', justifyContent:'center' }}>
              <Text style={{ color:'#fff', fontSize:20 }}>✕</Text>
            </TouchableOpacity>
            <View style={{ backgroundColor:'rgba(0,0,0,0.6)', borderRadius:14, paddingHorizontal:12, paddingVertical:5 }}>
              <Text style={{ color:'#fff', fontSize:13, fontWeight:'600' }}>{galleryIndex + 1} / {photos.length}</Text>
            </View>
            <View style={{ width:38 }}/>
          </View>

          {/* Swipeable photos */}
          <FlatList
            ref={galleryRef}
            data={photos}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={galleryIndex}
            getItemLayout={(_, i) => ({ length: SW, offset: SW * i, index: i })}
            onMomentumScrollEnd={e => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / SW);
              setGalleryIndex(idx);
            }}
            keyExtractor={(_, i) => String(i)}
            renderItem={({ item }) => (
              <View style={{ width:SW, height:SH, justifyContent:'center', alignItems:'center' }}>
                <Image
                  source={{ uri: item.url }}
                  style={{ width:SW, height:SH * 0.75 }}
                  resizeMode="contain"
                />
              </View>
            )}
          />

          {/* Dot indicators */}
          {photos.length > 1 && (
            <View style={{ position:'absolute', bottom:50, left:0, right:0, flexDirection:'row', justifyContent:'center', gap:6 }}>
              {photos.map((_, i) => (
                <View key={i} style={{ width: i===galleryIndex ? 20 : 7, height:7, borderRadius:3.5, backgroundColor: i===galleryIndex ? COLORS.gold : 'rgba(255,255,255,0.4)', transition:'width 0.2s' }}/>
              ))}
            </View>
          )}
        </View>
      </Modal>

      <StatusBar barStyle="light-content"/>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding:4 }}>
          <Text style={{ fontSize:22, color:COLORS.muted }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>{t('profile_title')}</Text>
        <TouchableOpacity onPress={handleLike}>
          <Text style={{ fontSize:22 }}>{liked ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom:130 }}>
        {/* Photo gallery — tap any photo to open full-screen viewer */}
        <View style={styles.gallery}>
          <TouchableOpacity
            activeOpacity={0.92}
            style={[styles.galMain, { backgroundColor: maid.origin==='african'?'#2d1a0a':'#1a0d2e' }]}
            onPress={() => { setGalleryIndex(0); setGalleryVisible(true); }}>
            {photos[0]?.url
              ? <Image source={{ uri: photos[0].url }} style={{ width:'100%', height:'100%' }}/>
              : <Text style={{ fontSize:60 }}>👩</Text>}
            {maid.isAvailable && <View style={styles.availBadge}><Text style={styles.availTxt}>{t('available_badge')}</Text></View>}
            {photos.length > 1 && (
              <View style={{ position:'absolute', bottom:8, right:8, backgroundColor:'rgba(0,0,0,0.55)', borderRadius:10, paddingHorizontal:8, paddingVertical:3 }}>
                <Text style={{ color:'#fff', fontSize:10, fontWeight:'600' }}>📷 {photos.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.galSide}>
            {[1,2].map(i => (
              <TouchableOpacity
                key={i}
                activeOpacity={0.85}
                style={[styles.galSm, { backgroundColor: maid.origin==='african'?'#2d1a0aaa':'#1a0d2eaa' }]}
                onPress={() => { setGalleryIndex(i); setGalleryVisible(true); }}>
                {photos[i]?.url
                  ? <Image source={{ uri: photos[i].url }} style={{ width:'100%', height:'100%' }}/>
                  : <Text style={{ fontSize:28 }}>👩</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.name}>{maid.fullName}</Text>
          <View style={styles.originRow}>
            <Text style={{ fontSize:18 }}>{maid.nationality?.slice(0,2) || '🌍'}</Text>
            <Text style={styles.originTxt}>{maid.nationality} · {maid.age} yrs · ⭐{maid.rating?.toFixed(1)||'—'} ({maid.reviewCount||0} reviews)</Text>
          </View>

          <Text style={styles.secTitle}>{t('about')}</Text>
          <Text style={styles.bio}>{maid.bio || t('no_bio')}</Text>

          <Text style={styles.secTitle}>{t('details')}</Text>
          <View style={styles.infoGrid}>
            {[[t('details_experience'),`${maid.experienceYears} yrs`],[t('details_salary'),`EGP ${(maid.expectedSalary||0).toLocaleString()}/mo`],[t('details_age'),`${maid.age} yrs`],[t('details_origin'),maid.nationality]].map(([l,v])=>(
              <View key={l} style={styles.infoBox}>
                <Text style={styles.infoLabel}>{l}</Text>
                <Text style={styles.infoVal}>{v}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.secTitle}>{t('skills')}</Text>
          <View style={styles.skillsWrap}>
            {(maid.skills||[]).map(s => <View key={s} style={styles.skillPill}><Text style={styles.skillTxt}>{s}</Text></View>)}
          </View>

          {(maid.languages||[]).length > 0 && <>
            <Text style={styles.secTitle}>{t('languages_spoken')}</Text>
            <View style={styles.skillsWrap}>
              {maid.languages.map(l=><View key={l} style={styles.skillPill}><Text style={styles.skillTxt}>{l}</Text></View>)}
            </View>
          </>}

          {/* Reviews section */}
          <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginTop:20, marginBottom:12 }}>
            <Text style={styles.secTitle}>{t('reviews_section')} {reviews.length > 0 ? `(${reviews.length})` : ''}</Text>
            {isHired && (
              <TouchableOpacity onPress={() => setReviewModal(true)} style={{ backgroundColor:COLORS.gold, paddingHorizontal:12, paddingVertical:6, borderRadius:6 }}>
                <Text style={{ fontSize:11, fontFamily:FONTS.bodySemiBold, color:COLORS.dark }}>✏️ {t('write_review')}</Text>
              </TouchableOpacity>
            )}
          </View>

          {reviews.length > 0 && (() => {
            const avg = (reviews.reduce((s,r) => s + r.rating, 0) / reviews.length).toFixed(1);
            const counts = [5,4,3,2,1].map(s => ({ star:s, count: reviews.filter(r=>r.rating===s).length }));
            return (
              <View style={{ backgroundColor:COLORS.surface, borderRadius:12, borderWidth:1, borderColor:COLORS.border, padding:16, marginBottom:14, flexDirection:'row', gap:16, alignItems:'center' }}>
                <View style={{ alignItems:'center', minWidth:64 }}>
                  <Text style={{ fontFamily:FONTS.display, fontSize:42, color:COLORS.gold, lineHeight:48 }}>{avg}</Text>
                  <Text style={{ fontSize:18, marginTop:2 }}>{'⭐'.repeat(Math.round(Number(avg)))}</Text>
                  <Text style={{ fontSize:10, color:COLORS.muted, marginTop:3 }}>{reviews.length} review{reviews.length!==1?'s':''}</Text>
                </View>
                <View style={{ flex:1 }}>
                  {counts.map(({ star, count }) => (
                    <View key={star} style={{ flexDirection:'row', alignItems:'center', gap:6, marginBottom:4 }}>
                      <Text style={{ fontSize:10, color:COLORS.muted, width:10 }}>{star}</Text>
                      <Text style={{ fontSize:10 }}>⭐</Text>
                      <View style={{ flex:1, height:6, backgroundColor:COLORS.border, borderRadius:3, overflow:'hidden' }}>
                        <View style={{ height:'100%', width: reviews.length ? `${(count/reviews.length)*100}%` : '0%', backgroundColor:COLORS.gold, borderRadius:3 }}/>
                      </View>
                      <Text style={{ fontSize:10, color:COLORS.muted, width:16, textAlign:'right' }}>{count}</Text>
                    </View>
                  ))}
                </View>
              </View>
            );
          })()}

          {reviews.length === 0 ? (
            <View style={{ backgroundColor:COLORS.surface, borderRadius:10, borderWidth:1, borderColor:COLORS.border, padding:20, alignItems:'center', marginBottom:8 }}>
              <Text style={{ fontSize:28, marginBottom:8 }}>💬</Text>
              <Text style={{ fontSize:14, color:COLORS.dark, fontWeight:'600' }}>{t('no_reviews_label')}</Text>
              <Text style={{ fontSize:12, color:COLORS.muted, marginTop:4, textAlign:'center' }}>{t('no_reviews_sub')}</Text>
            </View>
          ) : reviews.map(rv => (
            <View key={rv._id} style={{ backgroundColor:'#fff', borderWidth:1, borderColor:COLORS.border, borderRadius:12, padding:16, marginBottom:10, shadowColor:'#c9a84c', shadowOpacity:0.05, shadowRadius:4, elevation:1 }}>
              <View style={{ flexDirection:'row', alignItems:'center', gap:10, marginBottom:10 }}>
                <View style={{ width:38, height:38, borderRadius:19, backgroundColor:'#fef6e4', borderWidth:1.5, borderColor:COLORS.gold, alignItems:'center', justifyContent:'center' }}>
                  <Text style={{ fontSize:18 }}>👤</Text>
                </View>
                <View style={{ flex:1 }}>
                  <Text style={{ fontSize:14, fontWeight:'700', color:COLORS.dark }}>{rv.housewife?.name || 'Customer'}</Text>
                  <Text style={{ fontSize:10, color:COLORS.muted }}>{new Date(rv.createdAt).toLocaleDateString([], { day:'numeric', month:'short', year:'numeric' })}</Text>
                </View>
                <View style={{ flexDirection:'row', gap:2 }}>
                  {[1,2,3,4,5].map(s => (
                    <Text key={s} style={{ fontSize:16, color: s <= rv.rating ? '#f59e0b' : '#e5e7eb' }}>★</Text>
                  ))}
                </View>
              </View>
              {rv.comment ? (
                <Text style={{ fontSize:14, color:COLORS.text, lineHeight:21, fontStyle:'italic' }}>"{rv.comment}"</Text>
              ) : (
                <Text style={{ fontSize:12, color:COLORS.muted, fontStyle:'italic' }}>{t('no_comment_left')}</Text>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Review Modal */}
      <Modal visible={reviewModal} transparent animationType="slide" onRequestClose={() => setReviewModal(false)}>
        <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS==='ios'?'padding':'height'}>
          <TouchableOpacity style={{ flex:1, backgroundColor:'rgba(0,0,0,0.5)' }} activeOpacity={1} onPress={() => setReviewModal(false)}/>
          <View style={{ backgroundColor:COLORS.surface, borderTopLeftRadius:16, borderTopRightRadius:16, padding:24, paddingBottom:Platform.OS==='ios'?40:24 }}>
            <Text style={{ fontFamily:FONTS.display, fontSize:20, color:COLORS.dark, marginBottom:4 }}>{t('rate_label')} {maid.fullName}</Text>
            <Text style={{ fontSize:12, color:COLORS.muted, marginBottom:16 }}>{t('review_after_hire_note')}</Text>
            <View style={{ flexDirection:'row', justifyContent:'center', gap:12, marginBottom:20 }}>
              {[1,2,3,4,5].map(s => (
                <TouchableOpacity key={s} onPress={() => setReviewStar(s)}>
                  <Text style={{ fontSize:36, opacity: s <= reviewStar ? 1 : 0.25 }}>⭐</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={{ borderWidth:1.5, borderColor:COLORS.border, borderRadius:6, padding:12, fontSize:14, color:COLORS.text, backgroundColor:COLORS.cream, height:100, textAlignVertical:'top', marginBottom:16 }}
              placeholder={t('share_exp_optional')}
              placeholderTextColor={COLORS.muted}
              value={reviewComment}
              onChangeText={setReviewComment}
              multiline
            />
            <TouchableOpacity
              style={{ backgroundColor:COLORS.gold, padding:14, borderRadius:6, alignItems:'center', opacity: reviewLoading ? 0.6 : 1 }}
              onPress={handleReviewSubmit}
              disabled={reviewLoading}
            >
              {reviewLoading
                ? <ActivityIndicator color={COLORS.dark}/>
                : <Text style={{ fontFamily:FONTS.bodySemiBold, fontSize:14, color:COLORS.dark }}>{t('submit_review')}</Text>
              }
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Action bar */}
      <View style={styles.actionBar}>
        <View style={{ flexDirection:'row', gap:10, marginBottom:10 }}>
          <TouchableOpacity style={styles.btnSecondary} onPress={handleLike}>
            <Text style={styles.btnSecondaryTxt}>{liked ? t('saved_label') : t('save_label')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btnChat, loading && { opacity:0.6 }]} onPress={handleOpenChat} disabled={loading}>
            <Text style={styles.btnPrimaryTxt}>{loading ? t('opening') : `💬 ${t('open_chat')}`}</Text>
          </TouchableOpacity>
        </View>
        {isHired ? (
          <View style={[styles.btnHire, { backgroundColor:'#2e7d5e' }]}>
            <Text style={styles.btnPrimaryTxt}>{t('already_hired')}</Text>
          </View>
        ) : hireRequestSent ? (
          <View style={[styles.btnHire, { backgroundColor:'#3d2203', borderWidth:1.5, borderColor:COLORS.gold }]}>
            <Text style={[styles.btnPrimaryTxt, { color:COLORS.gold }]}>{t('request_sent_awaiting')}</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.btnHire, hireLoading && { opacity:0.6 }]}
            onPress={handleHire}
            disabled={hireLoading}
          >
            {hireLoading
              ? <ActivityIndicator color={COLORS.dark}/>
              : <Text style={styles.btnPrimaryTxt}>👑 {t('hire_this_maid')}</Text>
            }
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar:      { flexDirection:'row', alignItems:'center', justifyContent:'space-between', padding:14, paddingTop:54, backgroundColor:COLORS.surface, borderBottomWidth:1, borderBottomColor:COLORS.border },
  topBarTitle: { fontFamily:FONTS.display, fontSize:18, color:COLORS.dark },
  gallery:     { flexDirection:'row', height:220 },
  galMain:     { flex:2, alignItems:'center', justifyContent:'center', position:'relative' },
  galSide:     { flex:1, flexDirection:'column' },
  galSm:       { flex:1, alignItems:'center', justifyContent:'center' },
  availBadge:  { position:'absolute', top:8, left:8, backgroundColor:COLORS.green, borderRadius:2, paddingHorizontal:6, paddingVertical:2 },
  availTxt:    { fontSize:8, color:'#fff', fontWeight:'700' },
  body:        { padding:18 },
  name:        { fontFamily:FONTS.display, fontSize:28, color:COLORS.dark, marginBottom:4 },
  originRow:   { flexDirection:'row', alignItems:'center', gap:8, marginBottom:16, flexWrap:'wrap' },
  originTxt:   { fontSize:12, color:COLORS.muted },
  secTitle:    { fontSize:10, letterSpacing:1.2, textTransform:'uppercase', color:COLORS.gold, fontFamily:FONTS.bodySemiBold, marginBottom:8, marginTop:16 },
  bio:         { fontSize:14, color:'#5c3210', lineHeight:22 },
  infoGrid:    { flexDirection:'row', flexWrap:'wrap', gap:10 },
  infoBox:     { flex:1, minWidth:'45%', backgroundColor:COLORS.surface, borderWidth:1, borderColor:COLORS.border, borderRadius:6, padding:12 },
  infoLabel:   { fontSize:9, color:COLORS.muted, letterSpacing:0.8, textTransform:'uppercase', marginBottom:3 },
  infoVal:     { fontFamily:FONTS.display, fontSize:16, color:COLORS.dark },
  skillsWrap:  { flexDirection:'row', flexWrap:'wrap', gap:7 },
  skillPill:   { paddingHorizontal:12, paddingVertical:6, backgroundColor:'#f4ede0', borderRadius:20, borderWidth:1, borderColor:COLORS.border },
  skillTxt:    { fontSize:12, color:COLORS.brown },
  actionBar:   { position:'absolute', bottom:0, left:0, right:0, padding:14, paddingBottom:28, backgroundColor:COLORS.surface, borderTopWidth:1, borderTopColor:COLORS.border },
  btnSecondary:{ flex:1, padding:13, borderRadius:6, borderWidth:1.5, borderColor:COLORS.border, alignItems:'center', backgroundColor:COLORS.cream },
  btnSecondaryTxt:{ fontFamily:FONTS.bodyMedium, fontSize:14, color:COLORS.brown },
  btnChat:     { flex:1, padding:13, borderRadius:6, backgroundColor:COLORS.gold, alignItems:'center' },
  btnHire:     { width:'100%', padding:14, borderRadius:6, backgroundColor:COLORS.gold, alignItems:'center' },
  btnPrimaryTxt:{ fontFamily:FONTS.bodySemiBold, fontSize:14, color:COLORS.dark },
});
