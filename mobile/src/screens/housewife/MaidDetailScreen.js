import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, StatusBar, Modal, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { maidsAPI, chatsAPI, hwAPI, paymentsAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import { COLORS, FONTS, SHADOWS } from '../../utils/theme';
import Toast from 'react-native-toast-message';

export default function MaidDetailScreen({ route, navigation }) {
  const { maid } = route.params;
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reviewModal, setReviewModal] = useState(false);
  const [reviewStar, setReviewStar] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const user    = useAuthStore(s => s.user);
  const profile = useAuthStore(s => s.profile);
  const [isHired, setIsHired] = useState(false);

  useEffect(() => {
    maidsAPI.getReviews(maid._id)
      .then(r => setReviews(r.data?.reviews || []))
      .catch(() => {});
    hwAPI.getProfile().then(r => {
      const hired = (r.data?.profile?.hiredMaids || []).some(h =>
        h.maid === maid._id || h.maid?._id === maid._id
      );
      setIsHired(hired);
    }).catch(() => {});
  }, []);

  const handleLike = async () => {
    try { await maidsAPI.toggleLike(maid._id); setLiked(l => !l); }
    catch { Toast.show({ type:'error', text1:'Failed' }); }
  };

  const handleReviewSubmit = async () => {
    if (reviewStar === 0) return Toast.show({ type: 'error', text1: 'Please select a star rating' });
    setReviewLoading(true);
    try {
      await maidsAPI.submitReview(maid._id, { rating: reviewStar, comment: reviewComment.trim() });
      Toast.show({ type: 'success', text1: 'Review submitted!' });
      setReviewModal(false);
      setReviewStar(0);
      setReviewComment('');
      const r = await maidsAPI.getReviews(maid._id);
      setReviews(r.data?.reviews || []);
    } catch (err) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Failed to submit review' });
    } finally {
      setReviewLoading(false);
    }
  };

  const goToSubscription = () => navigation.navigate('CustomerSubscription', {
    maidUserId:    maid.user?._id || maid.user,
    maidProfileId: maid._id,
    maidName:      maid.fullName,
  });

  const handleOpenChat = async () => {
    // Client-side gate: housewife must have active subscription
    if (user?.role === 'housewife') {
      const sub = profile?.subscription;
      const active = sub?.status === 'active' && sub?.endDate && new Date(sub.endDate) > new Date();
      if (!active) { goToSubscription(); return; }
    }
    setLoading(true);
    try {
      const res = await chatsAPI.startChat({ maidUserId: maid.user?._id || maid.user, maidProfileId: maid._id });
      navigation.navigate('Chat', { chatId: res.data.chat._id, maidName: maid.fullName });
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.code === 'SUBSCRIPTION_REQUIRED') {
        goToSubscription();
      } else {
        Toast.show({ type: 'error', text1: err.response?.data?.message || 'Failed to open chat' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex:1, backgroundColor:COLORS.cream }}>
      <StatusBar barStyle="light-content"/>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding:4 }}>
          <Text style={{ fontSize:22, color:COLORS.muted }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Profile</Text>
        <TouchableOpacity onPress={handleLike}>
          <Text style={{ fontSize:22 }}>{liked ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom:100 }}>
        {/* Photo gallery */}
        <View style={styles.gallery}>
          <View style={[styles.galMain, { backgroundColor: maid.origin==='african'?'#2d1a0a':'#1a0d2e' }]}>
            {maid.photos?.[0]?.url
              ? <Image source={{ uri:maid.photos[0].url }} style={{ width:'100%', height:'100%' }}/>
              : <Text style={{ fontSize:60 }}>👩</Text>}
            {maid.isAvailable && <View style={styles.availBadge}><Text style={styles.availTxt}>● Available</Text></View>}
          </View>
          <View style={styles.galSide}>
            {[1,2].map(i => (
              <View key={i} style={[styles.galSm, { backgroundColor: maid.origin==='african'?'#2d1a0aaa':'#1a0d2eaa' }]}>
                {maid.photos?.[i]?.url
                  ? <Image source={{ uri:maid.photos[i].url }} style={{ width:'100%', height:'100%' }}/>
                  : <Text style={{ fontSize:28 }}>👩</Text>}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.name}>{maid.fullName}</Text>
          <View style={styles.originRow}>
            <Text style={{ fontSize:18 }}>{maid.nationality?.slice(0,2) || '🌍'}</Text>
            <Text style={styles.originTxt}>{maid.nationality} · {maid.age} yrs · ⭐{maid.rating?.toFixed(1)||'—'} ({maid.reviewCount||0} reviews)</Text>
          </View>

          <Text style={styles.secTitle}>About</Text>
          <Text style={styles.bio}>{maid.bio || 'No bio provided.'}</Text>

          <Text style={styles.secTitle}>Details</Text>
          <View style={styles.infoGrid}>
            {[['Experience',`${maid.experienceYears} Years`],['Expected Salary',`EGP ${(maid.expectedSalary||0).toLocaleString()}/mo`],['Age',`${maid.age} years`],['Origin',maid.nationality]].map(([l,v])=>(
              <View key={l} style={styles.infoBox}>
                <Text style={styles.infoLabel}>{l}</Text>
                <Text style={styles.infoVal}>{v}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.secTitle}>Skills</Text>
          <View style={styles.skillsWrap}>
            {(maid.skills||[]).map(s => <View key={s} style={styles.skillPill}><Text style={styles.skillTxt}>{s}</Text></View>)}
          </View>

          {(maid.languages||[]).length > 0 && <>
            <Text style={styles.secTitle}>Languages</Text>
            <View style={styles.skillsWrap}>
              {maid.languages.map(l=><View key={l} style={styles.skillPill}><Text style={styles.skillTxt}>{l}</Text></View>)}
            </View>
          </>}

          {/* Reviews section */}
          <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginTop:16 }}>
            <Text style={styles.secTitle}>Reviews</Text>
            {isHired && (
              <TouchableOpacity onPress={() => setReviewModal(true)} style={{ backgroundColor:COLORS.gold, paddingHorizontal:12, paddingVertical:5, borderRadius:4 }}>
                <Text style={{ fontSize:11, fontFamily:FONTS.bodySemiBold, color:COLORS.dark }}>✍️ Write Review</Text>
              </TouchableOpacity>
            )}
          </View>
          {reviews.length === 0
            ? <Text style={{ fontSize:13, color:COLORS.muted, marginBottom:8 }}>No reviews yet. Be the first!</Text>
            : reviews.map(rv => (
              <View key={rv._id} style={{ backgroundColor:COLORS.surface, borderWidth:1, borderColor:COLORS.border, borderRadius:7, padding:12, marginBottom:8 }}>
                <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:4 }}>
                  <Text style={{ fontSize:13, fontWeight:'600', color:COLORS.dark }}>{rv.housewife?.name || 'Customer'}</Text>
                  <Text style={{ fontSize:13, color:COLORS.gold }}>{'⭐'.repeat(rv.rating)}</Text>
                </View>
                {rv.comment ? <Text style={{ fontSize:12, color:COLORS.muted, lineHeight:18 }}>{rv.comment}</Text> : null}
                <Text style={{ fontSize:10, color:COLORS.muted, marginTop:4 }}>{new Date(rv.createdAt).toLocaleDateString()}</Text>
              </View>
            ))
          }
        </View>
      </ScrollView>

      {/* Review Modal */}
      <Modal visible={reviewModal} transparent animationType="slide" onRequestClose={() => setReviewModal(false)}>
        <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS==='ios'?'padding':'height'}>
          <TouchableOpacity style={{ flex:1, backgroundColor:'rgba(0,0,0,0.5)' }} activeOpacity={1} onPress={() => setReviewModal(false)}/>
          <View style={{ backgroundColor:COLORS.surface, borderTopLeftRadius:16, borderTopRightRadius:16, padding:24, paddingBottom:Platform.OS==='ios'?40:24 }}>
            <Text style={{ fontFamily:FONTS.display, fontSize:20, color:COLORS.dark, marginBottom:4 }}>Rate {maid.fullName}</Text>
            <Text style={{ fontSize:12, color:COLORS.muted, marginBottom:16 }}>Only available after hiring this maid</Text>
            <View style={{ flexDirection:'row', justifyContent:'center', gap:12, marginBottom:20 }}>
              {[1,2,3,4,5].map(s => (
                <TouchableOpacity key={s} onPress={() => setReviewStar(s)}>
                  <Text style={{ fontSize:36, opacity: s <= reviewStar ? 1 : 0.25 }}>⭐</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={{ borderWidth:1.5, borderColor:COLORS.border, borderRadius:6, padding:12, fontSize:14, color:COLORS.text, backgroundColor:COLORS.cream, height:100, textAlignVertical:'top', marginBottom:16 }}
              placeholder="Share your experience (optional)…"
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
                : <Text style={{ fontFamily:FONTS.bodySemiBold, fontSize:14, color:COLORS.dark }}>Submit Review</Text>
              }
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Action bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.btnSecondary} onPress={handleLike}>
          <Text style={styles.btnSecondaryTxt}>{liked ? '❤️ Saved' : '🤍 Save'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btnPrimary, loading && { opacity:0.6 }]} onPress={handleOpenChat} disabled={loading}>
          <Text style={styles.btnPrimaryTxt}>{loading ? 'Opening…' : '💬 Open Chat'}</Text>
        </TouchableOpacity>
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
  actionBar:   { position:'absolute', bottom:0, left:0, right:0, flexDirection:'row', gap:10, padding:14, paddingBottom:28, backgroundColor:COLORS.surface, borderTopWidth:1, borderTopColor:COLORS.border },
  btnSecondary:{ flex:1, padding:13, borderRadius:6, borderWidth:1.5, borderColor:COLORS.border, alignItems:'center', backgroundColor:COLORS.cream },
  btnSecondaryTxt:{ fontFamily:FONTS.bodyMedium, fontSize:14, color:COLORS.brown },
  btnPrimary:  { flex:1, padding:13, borderRadius:6, backgroundColor:COLORS.gold, alignItems:'center' },
  btnPrimaryTxt:{ fontFamily:FONTS.bodySemiBold, fontSize:14, color:COLORS.dark },
});
