import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput,
  ScrollView, Image, ActivityIndicator, RefreshControl, StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { maidsAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import { COLORS, FONTS, SHADOWS } from '../../utils/theme';
import Toast from 'react-native-toast-message';
import { useTranslation } from '../../utils/i18n';

const FILTERS = ['All','African','Asian','Childcare','Cooking','Eldercare','Available'];

const MaidCard = ({ maid, onPress, initialLiked }) => {
  const [liked, setLiked] = useState(!!initialLiked);

  // Sync if parent savedIds change (e.g. after refresh)
  useEffect(() => { setLiked(!!initialLiked); }, [initialLiked]);

  const handleLike = async () => {
    const next = !liked;
    setLiked(next); // optimistic
    try {
      await maidsAPI.toggleLike(maid._id);
    } catch {
      setLiked(!next); // revert on failure
      Toast.show({ type:'error', text1:'Failed to save' });
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.photos}>
        <View style={[styles.photoMain, { backgroundColor: maid.origin==='african'?'#2d1a0a':'#1a0d2e' }]}>
          {maid.photos?.[0]?.url
            ? <Image source={{ uri: maid.photos[0].url }} style={styles.photoImg}/>
            : <Text style={styles.photoEmoji}>👩</Text>}
          {maid.isAvailable
            ? <View style={styles.availBadge}><Text style={styles.availTxt}>● Available</Text></View>
            : <View style={[styles.availBadge, { backgroundColor:COLORS.muted }]}><Text style={styles.availTxt}>Unavailable</Text></View>}
        </View>
        <View style={styles.photosSide}>
          <View style={[styles.photoSm, { backgroundColor: maid.origin==='african'?'#2d1a0a99':'#1a0d2e99' }]}>
            {maid.photos?.[1]?.url ? <Image source={{ uri:maid.photos[1].url }} style={{ width:'100%', height:'100%' }}/> : <Text style={{ fontSize:18 }}>👩</Text>}
          </View>
          <View style={[styles.photoSm, { backgroundColor: maid.origin==='african'?'#2d1a0a66':'#1a0d2e66' }]}>
            {maid.photos?.[2]?.url ? <Image source={{ uri:maid.photos[2].url }} style={{ width:'100%', height:'100%' }}/> : <Text style={{ fontSize:18 }}>📷</Text>}
          </View>
        </View>
      </View>

      <View style={styles.info}>
        <View style={styles.infoTop}>
          <View>
            <Text style={styles.name}>{maid.fullName}</Text>
            <Text style={styles.origin}>{maid.nationality} · {maid.age} yrs</Text>
          </View>
          <TouchableOpacity style={[styles.heartBtn, liked && styles.heartBtnLiked]} onPress={handleLike}>
            <Text style={{ fontSize:16 }}>{liked ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.tagsRow}>
          {(maid.skills||[]).slice(0,3).map(s => <View key={s} style={styles.tag}><Text style={styles.tagTxt}>{s}</Text></View>)}
        </View>
        <View style={styles.statsRow}>
          <View style={styles.stat}><Text style={styles.statN}>{maid.experienceYears}yr</Text><Text style={styles.statL}>Exp</Text></View>
          <View style={[styles.stat, styles.statBorder]}><Text style={styles.statN}>EGP {(maid.expectedSalary||0).toLocaleString()}</Text><Text style={styles.statL}>Expected</Text></View>
          <View style={styles.stat}><Text style={styles.statN}>⭐{maid.rating?.toFixed(1)||'—'}</Text><Text style={styles.statL}>{maid.reviewCount||0} rev</Text></View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function BrowseScreen({ navigation }) {
  const { t } = useTranslation();
  const user = useAuthStore(s => s.user);
  const [maids, setMaids] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [hasMore, setHasMore] = useState(true);

  const pageRef    = useRef(1);
  const hasMoreRef = useRef(true);
  const fetchingRef = useRef(false);

  // Load saved maid IDs so hearts persist across refreshes
  const loadSavedIds = useCallback(async () => {
    try {
      const res = await maidsAPI.getSaved();
      const ids = (res.data.maids || []).map(m => m._id);
      setSavedIds(new Set(ids));
    } catch {}
  }, []);

  const fetchMaids = useCallback(async (reset = false) => {
    if (fetchingRef.current) return;
    if (!hasMoreRef.current && !reset) return;
    fetchingRef.current = true;

    if (reset) {
      pageRef.current = 1;
      hasMoreRef.current = true;
      setMaids([]);
      setHasMore(true);
    }

    try {
      const params = { page: pageRef.current, limit: 10 };
      if (activeFilter === 'African')   params.origin = 'african';
      if (activeFilter === 'Asian')     params.origin = 'asian';
      if (activeFilter === 'Available') params.isAvailable = true;
      if (['Childcare','Cooking','Eldercare'].includes(activeFilter)) params.skills = activeFilter;

      const res = await maidsAPI.getAll(params);
      const newMaids = res.data.maids;
      const more = res.data.pagination.page < res.data.pagination.pages;

      setMaids(prev => reset ? newMaids : [...prev, ...newMaids]);
      hasMoreRef.current = more;
      setHasMore(more);
      pageRef.current += 1;
    } catch { Toast.show({ type:'error', text1: t('load_failed') }); }
    finally { fetchingRef.current = false; setLoading(false); setRefreshing(false); }
  }, [activeFilter]);

  useEffect(() => { setLoading(true); fetchMaids(true); }, [activeFilter]);

  // Load saved IDs on mount and after each refresh
  useEffect(() => { loadSavedIds(); }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadSavedIds();
    fetchMaids(true);
  };

  return (
    <View style={{ flex:1, backgroundColor:COLORS.cream }}>
      <StatusBar barStyle="light-content"/>

      <LinearGradient colors={['#3d2203','#1a1108']} style={styles.hero}>
        <Text style={styles.greet}>{t('good_morning')}</Text>
        <Text style={styles.heroName}>{user?.name || t('welcome')} 👋</Text>
        <View style={styles.searchRow}>
          <TextInput style={styles.searchInput} value={search} onChangeText={setSearch}
            placeholder={t('search_placeholder')}
            placeholderTextColor="rgba(232,201,122,0.38)"/>
          <View style={styles.filterFab}><Text style={{ fontSize:16, color:'#e8c97a' }}>⚙</Text></View>
        </View>
      </LinearGradient>

      <View style={styles.chipsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {FILTERS.map(f => (
            <TouchableOpacity key={f} onPress={() => setActiveFilter(f)}
              style={[styles.chip, activeFilter===f && styles.chipActive]}>
              <Text style={[styles.chipTxt, activeFilter===f && styles.chipTxtActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading
        ? <ActivityIndicator size="large" color={COLORS.gold} style={{ marginTop:40 }}/>
        : <FlatList
            data={maids.filter(m => !search || m.fullName?.toLowerCase().includes(search.toLowerCase()))}
            keyExtractor={item => item._id}
            contentContainerStyle={{ padding:14, paddingBottom:100 }}
            renderItem={({ item }) => (
              <MaidCard
                maid={item}
                initialLiked={savedIds.has(item._id)}
                onPress={() => navigation.navigate('MaidDetail', { maid: item })}
              />
            )}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold}/>}
            onEndReached={() => fetchMaids()}
            onEndReachedThreshold={0.5}
            ListFooterComponent={hasMore ? <ActivityIndicator color={COLORS.gold} style={{ marginVertical:20 }}/> : null}
          />}
    </View>
  );
}

const styles = StyleSheet.create({
  hero:       { paddingHorizontal:18, paddingTop:54, paddingBottom:18 },
  greet:      { fontSize:10, letterSpacing:1.5, textTransform:'uppercase', color:'rgba(232,201,122,0.5)', marginBottom:2 },
  heroName:   { fontFamily:FONTS.display, fontSize:26, color:'#fff8ee', marginBottom:12 },
  searchRow:  { flexDirection:'row', gap:10 },
  searchInput:{ flex:1, backgroundColor:'rgba(255,255,255,0.08)', borderWidth:1.5, borderColor:'rgba(201,168,76,0.22)', borderRadius:7, paddingHorizontal:14, paddingVertical:10, color:'#e8c97a', fontSize:13 },
  filterFab:  { width:42, height:42, backgroundColor:'rgba(201,168,76,0.14)', borderWidth:1.5, borderColor:'rgba(201,168,76,0.28)', borderRadius:7, alignItems:'center', justifyContent:'center' },
  chipsWrap:  { backgroundColor:COLORS.surface, borderBottomWidth:1, borderBottomColor:COLORS.border },
  chips:      { paddingHorizontal:14, paddingVertical:10, gap:7 },
  chip:       { paddingHorizontal:14, paddingVertical:7, borderRadius:20, borderWidth:1.5, borderColor:COLORS.border, backgroundColor:COLORS.cream },
  chipActive: { backgroundColor:COLORS.gold, borderColor:COLORS.gold },
  chipTxt:    { fontSize:12, fontFamily:FONTS.bodyMedium, color:COLORS.muted },
  chipTxtActive:{ color:'#fff' },
  card:       { backgroundColor:COLORS.surface, borderWidth:1, borderColor:COLORS.border, borderRadius:10, marginBottom:14, overflow:'hidden', ...SHADOWS.card },
  photos:     { flexDirection:'row', height:160 },
  photoMain:  { flex:2, alignItems:'center', justifyContent:'center', position:'relative' },
  photoImg:   { width:'100%', height:'100%', resizeMode:'cover' },
  photoEmoji: { fontSize:50 },
  photosSide: { flex:1, gap:1 },
  photoSm:    { flex:1, alignItems:'center', justifyContent:'center' },
  availBadge: { position:'absolute', top:8, left:8, backgroundColor:COLORS.green, borderRadius:2, paddingHorizontal:6, paddingVertical:2 },
  availTxt:   { fontSize:8, color:'#fff', letterSpacing:0.5, fontWeight:'700' },
  info:       { padding:13 },
  infoTop:    { flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 },
  name:       { fontFamily:FONTS.display, fontSize:18, color:COLORS.dark },
  origin:     { fontSize:11, color:COLORS.muted, marginTop:1 },
  heartBtn:   { width:34, height:34, borderRadius:17, borderWidth:1.5, borderColor:COLORS.border, backgroundColor:COLORS.cream, alignItems:'center', justifyContent:'center' },
  heartBtnLiked:{ backgroundColor:'#fff0f0', borderColor:'#f5a0a0' },
  tagsRow:    { flexDirection:'row', flexWrap:'wrap', gap:5, marginBottom:10 },
  tag:        { backgroundColor:'#f4ede0', paddingHorizontal:8, paddingVertical:3, borderRadius:2 },
  tagTxt:     { fontSize:10, color:COLORS.muted },
  statsRow:   { flexDirection:'row', borderTopWidth:1, borderTopColor:COLORS.border, paddingTop:10 },
  stat:       { flex:1, alignItems:'center' },
  statBorder: { borderLeftWidth:1, borderRightWidth:1, borderColor:COLORS.border },
  statN:      { fontFamily:FONTS.display, fontSize:15, color:COLORS.dark },
  statL:      { fontSize:9, color:COLORS.muted, textTransform:'uppercase', letterSpacing:0.5, marginTop:1 },
});
