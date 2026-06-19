import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, StatusBar, Modal, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Linking, FlatList, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const { width: SW, height: SH } = Dimensions.get('window');
import { maidsAPI, chatsAPI, hwAPI, paymentsAPI, configAPI } from '../../services/api';
import io from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import useAuthStore from '../../store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SHADOWS } from '../../utils/theme';
import Toast from 'react-native-toast-message';
import { useTranslation } from '../../utils/i18n';
import BackChevron from '../../components/BackChevron';

const SKILL_KEYS = {
  Cooking: 'filter_cooking', Childcare: 'filter_childcare', Eldercare: 'filter_eldercare',
  Cleaning: 'filter_cleaning', Laundry: 'filter_laundry', Ironing: 'filter_ironing',
  Driving: 'filter_driving', 'Pet Care': 'filter_petcare',
};
const LANG_KEYS = { English: 'lang_en', Arabic: 'lang_ar', French: 'lang_fr', Hausa: 'lang_ha' };

const TERMS_EN = `TERMS & CONDITIONS – Servix Platform

1. PLATFORM NATURE
Servix is a technology platform that facilitates communication between independent service providers ("Workers") and customers. Servix is not an employer, recruitment agency, labor office, sponsor, guarantor, or representative of any Worker listed on the platform.

2. INDEPENDENT RELATIONSHIP
Any agreement, engagement, employment, payment, accommodation, transportation, supervision, or other arrangement made between a customer and a Worker is solely between those parties.

3. NO RESPONSIBILITY FOR WORKER CONDUCT
Servix does not control, supervise, monitor, direct, or manage Workers during or after any engagement.

Accordingly, Servix shall not be liable for:
• The behavior, attitude, actions, negligence, misconduct, or performance of any Worker.
• Theft, fraud, misrepresentation, property damage, personal injury, disputes, conflicts, or any unlawful acts committed by any Worker.
• Any losses, damages, costs, claims, injuries, or expenses arising from interactions between customers and Workers.

4. CUSTOMER DUE DILIGENCE
Customers are solely responsible for:
• Verifying the identity and legal status of any Worker.
• Conducting interviews and background checks where appropriate.
• Monitoring and supervising the Worker during any service period.
• Taking reasonable security measures to protect family members, children, elderly persons, valuables, and property.

5. SAFETY RECOMMENDATION
Customers are strongly advised to:
• Never leave children unattended with a Worker before establishing trust.
• Secure valuables, cash, documents, jewelry, and sensitive information.
• Verify identity documents when required by law.
• Maintain appropriate supervision during service delivery.

6. NO GUARANTEES
Servix makes no warranties or guarantees regarding:
• Character, honesty, reliability, qualifications, skills, experience, behavior, availability, or suitability of any Worker.

7. CUSTOMER ASSUMPTION OF RISK
The customer voluntarily assumes all risks associated with hiring, engaging, communicating with, or allowing access to any Worker.

8. LIMITATION OF LIABILITY
To the maximum extent permitted by applicable law, Servix, its owners, employees, affiliates, and partners shall not be liable for any direct, indirect, incidental, consequential, special, punitive, or exemplary damages arising from use of the platform.

9. USER ACCEPTANCE
By clicking "Accept", the customer confirms that they understand and agree that Servix acts solely as a communication and marketplace platform and is not responsible for the acts, omissions, conduct, or performance of Workers.`;

const TERMS_AR = `الشروط والأحكام – منصة Servix

1. طبيعة المنصة
Servix تطبيق تقني بيسهّل التواصل بين ستات البيوت ومقدمات الخدمات المنزلية. Servix مش صاحب عمل ولا مكتب توظيف ولا ضامن ولا ممثل لأي عاملة على المنصة.

2. العلاقة بين الأطراف
أي اتفاق أو ترتيب أو دفع أو إشراف بيتم بين العميلة والعاملة هو مسؤولية الطرفين بس، من غير أي مسؤولية على Servix.

3. إخلاء المسؤولية
Servix مش بتشرف ولا بتراقب العاملات، وبالتالي مش مسؤولة عن:
• أي تصرفات أو سلوك أو أداء من أي عاملة.
• السرقة أو الاحتيال أو الأضرار المادية أو الجسدية.
• أي خسائر أو نزاعات تنشأ بين العميلة والعاملة.

4. مسؤولية العميلة
العميلة مسؤولة وحدها عن:
• التحقق من هوية العاملة ومستنداتها.
• إجراء المقابلات والفحص المناسب قبل التعاقد.
• متابعة العاملة والإشراف عليها.
• حماية الأطفال وكبار السن والممتلكات الثمينة.

5. تنبيه أمني
بتنصح Servix بعدم ترك الأطفال بدون إشراف مناسب، والاحتفاظ بالمقتنيات الثمينة في أماكن آمنة.

6. عدم تقديم ضمانات
Servix مش بتضمن أخلاق أو أمانة أو كفاءة أو سلوك أي عاملة.

7. الموافقة
بالضغط على تأكيد، بتوافقي إن Servix مجرد منصة تواصل ومش مسؤولة عن تصرفات أو أداء العاملات.`

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
  const { t, lang } = useTranslation();
  const isAr = lang === 'ar';
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
  const [termsError, setTermsError]           = useState(false);
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
          Toast.show({ type: 'success', text1: 'Hire Confirmed!', text2: `${respondingMaidName} accepted your request.`, visibilityTime: 5000 });
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
    setTermsError(false);
    setTermsModal(true);
  };

  const confirmHire = async () => {
    if (!termsAgreed) {
      setTermsError(true);
      return;
    }
    setTermsError(false);
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
          <View style={{ backgroundColor:COLORS.surface, borderTopLeftRadius:16, borderTopRightRadius:16, maxHeight:'90%' }}>
            {/* Header */}
            <View style={{ padding:20, paddingBottom:12, borderBottomWidth:1, borderBottomColor:COLORS.border }}>
              <View style={{ width:36, height:4, backgroundColor:COLORS.border, borderRadius:2, alignSelf:'center', marginBottom:14 }}/>
              <Text style={{ fontFamily:FONTS.display, fontSize:22, color:COLORS.dark, textAlign: isAr ? 'right' : 'left' }}>
                {t('terms_title')}
              </Text>
            </View>

            {/* Scrollable T&C body */}
            <ScrollView style={{ paddingHorizontal:20 }} contentContainerStyle={{ paddingVertical:16 }}>
              <Text style={{ fontSize:12.5, color:COLORS.text, lineHeight:22, textAlign: isAr ? 'right' : 'left', writingDirection: isAr ? 'rtl' : 'ltr' }}>
                {isAr ? TERMS_AR : TERMS_EN}
              </Text>
            </ScrollView>

            {/* Checkbox + actions pinned at bottom */}
            <View style={{ padding:20, paddingTop:12, borderTopWidth:1, borderTopColor:COLORS.border }}>
              <TouchableOpacity
                style={{ flexDirection: isAr ? 'row-reverse' : 'row', alignItems:'flex-start', gap:12, marginBottom:8,
                  padding:12, borderRadius:8,
                  backgroundColor: termsError ? 'rgba(224,85,85,0.06)' : termsAgreed ? 'rgba(46,125,94,0.08)' : '#f8f5f0',
                  borderWidth:1.5,
                  borderColor: termsError ? '#e05555' : termsAgreed ? '#2e7d5e' : COLORS.border }}
                onPress={() => { setTermsAgreed(!termsAgreed); setTermsError(false); }}>
                <View style={{ width:22, height:22, borderRadius:4, borderWidth:1.5, flexShrink:0, marginTop:1,
                  borderColor: termsError ? '#e05555' : termsAgreed ? COLORS.green : COLORS.border,
                  backgroundColor: termsAgreed ? COLORS.green : 'transparent',
                  alignItems:'center', justifyContent:'center' }}>
                  {termsAgreed && <Ionicons name="checkmark" size={14} color="#fff" />}
                </View>
                <Text style={{ fontSize:12.5, color: termsError ? '#e05555' : COLORS.text, flex:1, lineHeight:19, textAlign: isAr ? 'right' : 'left' }}>
                  {t('terms_agree_label')}
                </Text>
              </TouchableOpacity>

              {termsError && (
                <Text style={{ fontSize:12, color:'#e05555', marginBottom:10, textAlign: isAr ? 'right' : 'left' }}>
                  {t('please_agree_terms')}
                </Text>
              )}

              <TouchableOpacity
                style={{ backgroundColor: COLORS.green, padding:14, borderRadius:8, alignItems:'center', marginBottom:8, opacity: hireLoading ? 0.6 : 1 }}
                onPress={confirmHire} disabled={hireLoading}>
                <Text style={{ fontFamily:FONTS.bodySemiBold, fontSize:14, color:'#fff' }}>
                  {t('confirm_hire_btn')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setTermsModal(false)} style={{ alignItems:'center', padding:8 }}>
                <Text style={{ fontSize:13, color:COLORS.muted }}>{t('cancel')}</Text>
              </TouchableOpacity>
            </View>
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
                      : `${t('release_fee_label') || '⚠ Replacement fee applies'}: EGP ${fee.amount}`}
                  </Text>
                </View>
              );
            })()}
            <TouchableOpacity
              style={{ backgroundColor: COLORS.green, padding:14, borderRadius:8, alignItems:'center', marginBottom:10, opacity: releaseLoading ? 0.6 : 1 }}
              onPress={handleReleaseAndContinue}
              disabled={releaseLoading}>
              {releaseLoading
                ? <ActivityIndicator color="#fff" />
                : <Text style={{ fontFamily:FONTS.bodySemiBold, fontSize:14, color:'#fff' }}>
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
              <Text style={{ color:'#fff', fontSize:20 }}>âœ•</Text>
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
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ width:38, height:38, borderRadius:19, backgroundColor:'#e8f4f1', alignItems:'center', justifyContent:'center' }}>
          <BackChevron color={COLORS.green} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>{t('profile_title')}</Text>
        <TouchableOpacity onPress={handleLike}>
          <Ionicons name={liked ? 'bookmark' : 'bookmark-outline'} size={22} color={liked ? COLORS.green : COLORS.muted} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom:130 }}>
        {/* Photo gallery — tap any photo to open full-screen viewer */}
        <View style={styles.gallery}>
          <TouchableOpacity
            activeOpacity={0.92}
            style={[styles.galMain, { backgroundColor: '#dfeee8' }]}
            onPress={() => { setGalleryIndex(0); setGalleryVisible(true); }}>
            {photos[0]?.url
              ? <Image source={{ uri: photos[0].url }} style={{ width:'100%', height:'100%' }}/>
              : <Ionicons name="person" size={60} color="rgba(255,255,255,0.7)" />}
            {maid.isAvailable && <View style={styles.availBadge}><Text style={styles.availTxt}>{t('available_badge')}</Text></View>}
            {photos.length > 1 && (
              <View style={{ position:'absolute', bottom:8, right:8, backgroundColor:'rgba(0,0,0,0.55)', borderRadius:10, paddingHorizontal:8, paddingVertical:3 }}>
                <Text style={{ color:'#fff', fontSize:10, fontWeight:'600' }}>{photos.length} photos</Text>
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.galSide}>
            {[1,2].map(i => (
              <TouchableOpacity
                key={i}
                activeOpacity={0.85}
                style={[styles.galSm, { backgroundColor: '#c8e6df' }]}
                onPress={() => { setGalleryIndex(i); setGalleryVisible(true); }}>
                {photos[i]?.url
                  ? <Image source={{ uri: photos[i].url }} style={{ width:'100%', height:'100%' }}/>
                  : <Ionicons name="person" size={28} color="rgba(255,255,255,0.6)" />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.name}>{maid.fullName}</Text>
          <View style={styles.originRow}>
            <Ionicons name="location-outline" size={16} color={COLORS.muted} />
            <Text style={styles.originTxt}>{maid.nationality} Â· {maid.age} yrs Â· {maid.rating?.toFixed(1)||'—'} ({maid.reviewCount||0} reviews)</Text>
          </View>

          <Text style={styles.secTitle}>{t('about')}</Text>
          <Text style={styles.bio}>{maid.bio || t('no_bio')}</Text>

          <Text style={styles.secTitle}>{t('details')}</Text>
          <View style={styles.infoGrid}>
            {[[t('details_experience'),`${maid.experienceYears} ${t('yrs')}`],[t('details_salary'),`EGP ${(maid.expectedSalary||0).toLocaleString()}/mo`],[t('details_age'),`${maid.age} ${t('yrs')}`],[t('details_origin'),maid.nationality]].map(([l,v])=>(
              <View key={l} style={styles.infoBox}>
                <Text style={styles.infoLabel}>{l}</Text>
                <Text style={styles.infoVal}>{v}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.secTitle}>{t('skills')}</Text>
          <View style={styles.skillsWrap}>
            {(maid.skills||[]).map(s => <View key={s} style={styles.skillPill}><Text style={styles.skillTxt}>{t(SKILL_KEYS[s] ?? s)}</Text></View>)}
          </View>

          {(maid.languages||[]).length > 0 && <>
            <Text style={styles.secTitle}>{t('languages_spoken')}</Text>
            <View style={styles.skillsWrap}>
              {maid.languages.map(l=><View key={l} style={styles.skillPill}><Text style={styles.skillTxt}>{t(LANG_KEYS[l] ?? l)}</Text></View>)}
            </View>
          </>}

          {/* Reviews section */}
          <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginTop:20, marginBottom:12 }}>
            <Text style={styles.secTitle}>{t('reviews_section')} {reviews.length > 0 ? `(${reviews.length})` : ''}</Text>
            {isHired && (
              <TouchableOpacity onPress={() => setReviewModal(true)} style={{ backgroundColor:COLORS.green, paddingHorizontal:12, paddingVertical:6, borderRadius:6 }}>
                <Text style={{ fontSize:11, fontFamily:FONTS.bodySemiBold, color:'#fff' }}>{t('write_review')}</Text>
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
                  <View style={{ flexDirection:'row', gap:1, marginTop:2 }}>
                    {Array.from({ length: Math.round(Number(avg)) }).map((_, i) => <Ionicons key={i} name="star" size={14} color="#f59e0b" />)}
                  </View>
                  <Text style={{ fontSize:10, color:COLORS.muted, marginTop:3 }}>{reviews.length} review{reviews.length!==1?'s':''}</Text>
                </View>
                <View style={{ flex:1 }}>
                  {counts.map(({ star, count }) => (
                    <View key={star} style={{ flexDirection:'row', alignItems:'center', gap:6, marginBottom:4 }}>
                      <Text style={{ fontSize:10, color:COLORS.muted, width:10 }}>{star}</Text>
                      <Ionicons name="star" size={10} color="#f59e0b" />
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
              <Ionicons name="star-outline" size={32} color={COLORS.muted} style={{ marginBottom:8 }} />
              <Text style={{ fontSize:14, color:COLORS.dark, fontWeight:'600' }}>{t('no_reviews_label')}</Text>
              <Text style={{ fontSize:12, color:COLORS.muted, marginTop:4, textAlign:'center' }}>{t('no_reviews_sub')}</Text>
            </View>
          ) : reviews.map(rv => (
            <View key={rv._id} style={{ backgroundColor:'#fff', borderWidth:1, borderColor:COLORS.border, borderRadius:12, padding:16, marginBottom:10, shadowColor:'#0D3827', shadowOpacity:0.05, shadowRadius:4, elevation:1 }}>
              <View style={{ flexDirection:'row', alignItems:'center', gap:10, marginBottom:10 }}>
                <View style={{ width:38, height:38, borderRadius:19, backgroundColor:'#e8f4f1', borderWidth:1.5, borderColor:COLORS.green, alignItems:'center', justifyContent:'center' }}>
                  <Ionicons name="person" size={18} color={COLORS.green} />
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
                  <Ionicons name={s <= reviewStar ? 'star' : 'star-outline'} size={36} color={s <= reviewStar ? '#f59e0b' : COLORS.muted} />
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
              style={{ backgroundColor:COLORS.green, padding:14, borderRadius:6, alignItems:'center', opacity: reviewLoading ? 0.6 : 1 }}
              onPress={handleReviewSubmit}
              disabled={reviewLoading}
            >
              {reviewLoading
                ? <ActivityIndicator color="#fff"/>
                : <Text style={{ fontFamily:FONTS.bodySemiBold, fontSize:14, color:'#fff' }}>{t('submit_review')}</Text>
              }
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Action bar */}
      <View style={styles.actionBar}>
        <View style={{ flexDirection:'row', gap:10, marginBottom:10 }}>
          <TouchableOpacity style={styles.btnSecondary} onPress={handleLike}>
            <View style={{ flexDirection:'row', alignItems:'center', gap:6 }}>
              <Ionicons name={liked ? 'bookmark' : 'bookmark-outline'} size={15} color={liked ? COLORS.green : COLORS.muted} />
              <Text style={[styles.btnSecondaryTxt, liked && { color: COLORS.green }]}>{liked ? t('saved_label') : t('save_label')}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btnChat, loading && { opacity:0.6 }]} onPress={handleOpenChat} disabled={loading}>
            <Text style={styles.btnPrimaryTxt}>{loading ? t('opening') : t('open_chat')}</Text>
          </TouchableOpacity>
        </View>
        {isHired ? (
          <View style={[styles.btnHire, { backgroundColor:COLORS.green }]}>
            <Text style={styles.btnPrimaryTxt}>{t('already_hired')}</Text>
          </View>
        ) : hireRequestSent ? (
          <View style={[styles.btnHire, { backgroundColor:'rgba(13,56,39,0.1)', borderWidth:1.5, borderColor:COLORS.green }]}>
            <Text style={[styles.btnPrimaryTxt, { color:COLORS.green }]}>{t('request_sent_awaiting')}</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.btnHire, hireLoading && { opacity:0.6 }]}
            onPress={handleHire}
            disabled={hireLoading}
          >
            {hireLoading
              ? <ActivityIndicator color="#fff"/>
              : <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
                  <Ionicons name="checkmark-circle" size={17} color="#fff" />
                  <Text style={styles.btnPrimaryTxt}>{t('hire_this_maid')}</Text>
                </View>
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
  secTitle:    { fontSize:10, letterSpacing:1.2, textTransform:'uppercase', color:COLORS.green, fontFamily:FONTS.bodySemiBold, marginBottom:8, marginTop:16 },
  bio:         { fontSize:14, color:COLORS.text, lineHeight:22 },
  infoGrid:    { flexDirection:'row', flexWrap:'wrap', gap:10 },
  infoBox:     { flex:1, minWidth:'45%', backgroundColor:COLORS.surface, borderWidth:1, borderColor:COLORS.border, borderRadius:6, padding:12 },
  infoLabel:   { fontSize:9, color:COLORS.muted, letterSpacing:0.8, textTransform:'uppercase', marginBottom:3 },
  infoVal:     { fontFamily:FONTS.display, fontSize:16, color:COLORS.dark },
  skillsWrap:  { flexDirection:'row', flexWrap:'wrap', gap:7 },
  skillPill:   { paddingHorizontal:12, paddingVertical:6, backgroundColor:'#e8f4f1', borderRadius:20, borderWidth:1, borderColor:COLORS.border },
  skillTxt:    { fontSize:12, color:COLORS.brown },
  actionBar:   { position:'absolute', bottom:0, left:0, right:0, padding:14, paddingBottom:28, backgroundColor:COLORS.surface, borderTopWidth:1, borderTopColor:COLORS.border },
  btnSecondary:{ flex:1, padding:13, borderRadius:6, borderWidth:1.5, borderColor:COLORS.border, alignItems:'center', backgroundColor:COLORS.cream },
  btnSecondaryTxt:{ fontFamily:FONTS.bodyMedium, fontSize:14, color:COLORS.dark },
  btnChat:     { flex:1, padding:13, borderRadius:6, backgroundColor:COLORS.green, alignItems:'center' },
  btnHire:     { width:'100%', padding:14, borderRadius:6, backgroundColor:COLORS.green, alignItems:'center' },
  btnPrimaryTxt:{ fontFamily:FONTS.bodySemiBold, fontSize:14, color:'#fff' },
});
