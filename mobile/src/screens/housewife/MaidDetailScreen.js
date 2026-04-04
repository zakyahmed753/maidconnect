import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, StatusBar } from 'react-native';
import { maidsAPI, chatsAPI } from '../../services/api';
import { COLORS, FONTS, SHADOWS } from '../../utils/theme';
import Toast from 'react-native-toast-message';

export default function MaidDetailScreen({ route, navigation }) {
  const { maid } = route.params;
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    try { await maidsAPI.toggleLike(maid._id); setLiked(l => !l); }
    catch { Toast.show({ type:'error', text1:'Failed' }); }
  };

  const handleOpenChat = async () => {
    setLoading(true);
    try {
      const res = await chatsAPI.startChat({ maidUserId: maid.user?._id || maid.user, maidProfileId: maid._id });
      navigation.navigate('Chat', { chatId: res.data.chat._id, maidName: maid.fullName });
    } catch (err) {
      Toast.show({ type:'error', text1: err.response?.data?.message || 'Failed to open chat' });
    } finally { setLoading(false); }
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
            {[['Experience',`${maid.experienceYears} Years`],['Expected Salary',`$${maid.expectedSalary}/mo`],['Age',`${maid.age} years`],['Origin',maid.nationality]].map(([l,v])=>(
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
        </View>
      </ScrollView>

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
