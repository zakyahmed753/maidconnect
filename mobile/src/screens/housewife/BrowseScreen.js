import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput,
  ScrollView, Image, ActivityIndicator, RefreshControl, StatusBar,
  Modal, Pressable, KeyboardAvoidingView, Platform, Dimensions,
} from 'react-native';

const { width: SW, height: SH } = Dimensions.get('window');
import { useFocusEffect } from '@react-navigation/native';
import { maidsAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SHADOWS } from '../../utils/theme';
import Toast from 'react-native-toast-message';
import { useTranslation } from '../../utils/i18n';
import NotifBell from '../../components/NotifBell';

const SKILL_KEYS = {
  Cooking: 'filter_cooking', Childcare: 'filter_childcare', Eldercare: 'filter_eldercare',
  Cleaning: 'filter_cleaning', Laundry: 'filter_laundry', Ironing: 'filter_ironing',
  Driving: 'filter_driving', 'Pet Care': 'filter_petcare',
};

const LANG_KEYS = { English: 'lang_en', Arabic: 'lang_ar', French: 'lang_fr', Hausa: 'lang_ha' };

// Story-style quick filters (circular)
const STORIES = [
  { key: 'all',       icon: 'apps-outline',             lk: 'filter_all',       params: {} },
  { key: 'available', icon: 'checkmark-circle-outline', lk: 'filter_available', params: { isAvailable: 'true' } },
  { key: 'top_rated', icon: 'star-outline',             lk: 'filter_top_rated', params: { sort: 'rating' } },
  { key: 'african',   icon: 'globe-outline',            lk: 'filter_african',   params: { origin: 'african' } },
  { key: 'asian',     icon: 'globe-outline',            lk: 'filter_asian',     params: { origin: 'asian' } },
];

// Category pill filters
const CATEGORIES = [
  { key: 'cooking',   icon: 'restaurant-outline',  lk: 'filter_cooking',   params: { skills: 'Cooking' } },
  { key: 'childcare', icon: 'people-outline',      lk: 'filter_childcare', params: { skills: 'Childcare' } },
  { key: 'eldercare', icon: 'heart-outline',       lk: 'filter_eldercare', params: { skills: 'Eldercare' } },
  { key: 'cleaning',  icon: 'sparkles-outline',    lk: 'filter_cleaning',  params: { skills: 'Cleaning' } },
  { key: 'laundry',   icon: 'shirt-outline',       lk: 'filter_laundry',   params: { skills: 'Laundry' } },
  { key: 'ironing',   icon: 'layers-outline',      lk: 'filter_ironing',   params: { skills: 'Ironing' } },
  { key: 'driving',   icon: 'car-outline',         lk: 'filter_driving',   params: { skills: 'Driving' } },
  { key: 'petcare',   icon: 'paw-outline',         lk: 'filter_petcare',   params: { skills: 'Pet Care' } },
];

const CHIPS = [
  { key: 'all',       icon: 'apps-outline',             lk: 'filter_all',       params: {} },
  { key: 'available', icon: 'checkmark-circle-outline', lk: 'filter_available', params: { isAvailable: 'true' } },
  { key: 'top_rated', icon: 'star-outline',             lk: 'filter_top_rated', params: { sort: 'rating' } },
  { key: 'african',   icon: 'globe-outline',            lk: 'filter_african',   params: { origin: 'african' } },
  { key: 'asian',     icon: 'globe-outline',            lk: 'filter_asian',     params: { origin: 'asian' } },
  { key: 'cooking',   icon: 'restaurant-outline',       lk: 'filter_cooking',   params: { skills: 'Cooking' } },
  { key: 'childcare', icon: 'people-outline',           lk: 'filter_childcare', params: { skills: 'Childcare' } },
  { key: 'eldercare', icon: 'heart-outline',            lk: 'filter_eldercare', params: { skills: 'Eldercare' } },
  { key: 'cleaning',  icon: 'sparkles-outline',         lk: 'filter_cleaning',  params: { skills: 'Cleaning' } },
  { key: 'laundry',   icon: 'shirt-outline',            lk: 'filter_laundry',   params: { skills: 'Laundry' } },
  { key: 'ironing',   icon: 'layers-outline',           lk: 'filter_ironing',   params: { skills: 'Ironing' } },
  { key: 'driving',   icon: 'car-outline',              lk: 'filter_driving',   params: { skills: 'Driving' } },
  { key: 'petcare',   icon: 'paw-outline',              lk: 'filter_petcare',   params: { skills: 'Pet Care' } },
];

const SORT_OPTS = [
  { lk: 'filter_newest',         v: 'createdAt' },
  { lk: 'filter_top_rated_sort', v: 'rating' },
  { lk: 'filter_highest_salary', v: 'expectedSalary' },
];

const EMPTY_ADV = { minSalary: '', maxSalary: '', minAge: '', maxAge: '', minExp: '', sort: 'createdAt' };

// ── Maid Card ──
const MaidCard = ({ maid, onPress, onPhotoPress, initialLiked }) => {
  const { t } = useTranslation();
  const [liked, setLiked] = useState(!!initialLiked);
  useEffect(() => { setLiked(!!initialLiked); }, [initialLiked]);

  const handleLike = async () => {
    const next = !liked;
    setLiked(next);
    try { await maidsAPI.toggleLike(maid._id); }
    catch { setLiked(!next); Toast.show({ type: 'error', text1: 'Failed to save' }); }
  };

  const validPhotos = (maid.photos || []).filter(p => p?.url);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => validPhotos.length && onPhotoPress ? onPhotoPress(validPhotos, 0) : onPress()}
      >
        <View style={styles.photos}>
          <View style={[styles.photoMain, { backgroundColor: '#dfeee8' }]}>
            {maid.photos?.[0]?.url
              ? <Image source={{ uri: maid.photos[0].url }} style={styles.photoImg} />
              : <Ionicons name="person" size={40} color="rgba(255,255,255,0.7)" />}
            {maid.isAvailable ? (
              <View style={styles.availBadge}>
                <View style={styles.availDot}/>
                <Text style={styles.availTxt}>{t('available_badge')}</Text>
              </View>
            ) : (
              <View style={[styles.availBadge, styles.unavailBadge]}>
                <Text style={[styles.availTxt, styles.unavailTxt]}>{t('unavailable_badge')}</Text>
              </View>
            )}
            {validPhotos.length > 1 && (
              <View style={styles.photoCountBadge}>
                <Text style={styles.photoCountTxt}>1/{validPhotos.length} ▶</Text>
              </View>
            )}
          </View>
          <View style={styles.photosSide}>
            <TouchableOpacity
              style={[styles.photoSm, { backgroundColor: '#c8e6df' }]}
              activeOpacity={0.85}
              onPress={() => validPhotos.length > 1 && onPhotoPress ? onPhotoPress(validPhotos, 1) : null}
            >
              {maid.photos?.[1]?.url
                ? <Image source={{ uri: maid.photos[1].url }} style={{ width: '100%', height: '100%' }} />
                : <Ionicons name="person" size={20} color="rgba(255,255,255,0.6)" />}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.photoSm, { backgroundColor: '#b5d9d0' }]}
              activeOpacity={0.85}
              onPress={() => validPhotos.length > 2 && onPhotoPress ? onPhotoPress(validPhotos, 2) : null}
            >
              {maid.photos?.[2]?.url
                ? <Image source={{ uri: maid.photos[2].url }} style={{ width: '100%', height: '100%' }} />
                : <Ionicons name="camera-outline" size={18} color="rgba(255,255,255,0.5)" />}
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.info}>
        <View style={styles.infoTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{maid.fullName}</Text>
            <Text style={styles.origin}>{maid.nationality} · {maid.age} {t('yrs')}</Text>
          </View>
          <TouchableOpacity onPress={handleLike} style={{ padding: 4 }}>
            <Ionicons name={liked ? 'bookmark' : 'bookmark-outline'} size={20} color={liked ? COLORS.green : COLORS.muted} />
          </TouchableOpacity>
        </View>
        <View style={styles.tagsRow}>
          {(maid.skills || []).slice(0, 3).map(s => (
            <View key={s} style={styles.tag}><Text style={styles.tagTxt}>{t(SKILL_KEYS[s] ?? s)}</Text></View>
          ))}
        </View>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statN}>{maid.experienceYears} {t('yrs')}</Text>
            <Text style={styles.statL}>{t('exp_stat')}</Text>
          </View>
          <View style={[styles.stat, styles.statBorder]}>
            <Text style={styles.statN}>EGP {(maid.expectedSalary || 0).toLocaleString()}</Text>
            <Text style={styles.statL}>{t('salary_stat')}</Text>
          </View>
          <View style={styles.stat}>
            <View style={{ flexDirection:'row', alignItems:'center', gap:3 }}>
              <Ionicons name="star" size={11} color="#f59e0b" />
              <Text style={styles.statN}>{maid.rating?.toFixed(1) || '—'}</Text>
            </View>
            <Text style={styles.statL}>{maid.reviewCount || 0} {t('reviews_short')}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.bookBtn} onPress={onPress}>
          <Text style={styles.bookBtnTxt}>{t('view_profile')}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

// ── Browse Screen ──
export default function BrowseScreen({ navigation }) {
  const { t } = useTranslation();
  const user = useAuthStore(s => s.user);

  const [maids, setMaids]                 = useState([]);
  const [savedIds, setSavedIds]           = useState(new Set());
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);
  const [chip, setChip]                   = useState('all');
  const [search, setSearch]               = useState('');
  const [advFilters, setAdvFilters]       = useState(EMPTY_ADV);
  const [draft, setDraft]                 = useState(EMPTY_ADV);
  const [filterVisible, setFilterVisible] = useState(false);
  const [hasMore, setHasMore]             = useState(true);
  const [photoViewer, setPhotoViewer]     = useState({ visible: false, photos: [], index: 0 });

  const pageRef     = useRef(1);
  const hasMoreRef  = useRef(true);
  const fetchingRef = useRef(false);
  const debounceRef = useRef(null);
  const chipRef     = useRef('all');
  const searchRef   = useRef('');
  const advRef      = useRef(EMPTY_ADV);

  const loadSavedIds = useCallback(async () => {
    try {
      const res = await maidsAPI.getSaved();
      setSavedIds(new Set((res.data.maids || []).map(m => m._id)));
    } catch {}
  }, []);

  const fetchMaids = useCallback(async (page, sq, chipKey, adv) => {
    if (fetchingRef.current && page > 1) return;
    fetchingRef.current = true;
    try {
      const chipDef = CHIPS.find(c => c.key === chipKey);
      const params  = { page, limit: 10, ...chipDef?.params };
      if (adv.minSalary) params.minSalary = adv.minSalary;
      if (adv.maxSalary) params.maxSalary = adv.maxSalary;
      if (adv.minAge)    params.minAge    = adv.minAge;
      if (adv.maxAge)    params.maxAge    = adv.maxAge;
      if (adv.minExp)    params.minExp    = adv.minExp;
      if (!chipDef?.params?.sort && adv.sort !== 'createdAt') params.sort = adv.sort;
      if (sq.trim())     params.name      = sq.trim();

      const res  = await maidsAPI.getAll(params);
      const list = res.data.maids || [];
      const { page: pg, pages } = res.data.pagination;
      setMaids(prev => page === 1 ? list : [...prev, ...list]);
      hasMoreRef.current = pg < pages;
      setHasMore(pg < pages);
      pageRef.current = page + 1;
    } catch {
      Toast.show({ type: 'error', text1: t('load_failed') });
    } finally {
      fetchingRef.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const resetFetch = useCallback((c, s, a) => {
    chipRef.current = c; searchRef.current = s; advRef.current = a;
    pageRef.current = 1; hasMoreRef.current = true;
    setMaids([]); setHasMore(true); setLoading(true);
    fetchMaids(1, s, c, a);
  }, [fetchMaids]);

  useEffect(() => { resetFetch(chip, searchRef.current, advFilters); }, [chip, advFilters]);
  useFocusEffect(React.useCallback(() => { loadSavedIds(); }, [loadSavedIds]));

  const onSearchChange = (text) => {
    setSearch(text);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => resetFetch(chipRef.current, text, advRef.current), 500);
  };

  const onChipPress  = (k) => { chipRef.current = k; setChip(k); };
  const openFilter   = () => { setDraft({ ...advFilters }); setFilterVisible(true); };
  const applyFilter  = () => { setFilterVisible(false); setAdvFilters({ ...draft }); };
  const resetFilter  = () => setDraft(EMPTY_ADV);

  const activeCount = [
    advFilters.minSalary, advFilters.maxSalary,
    advFilters.minAge, advFilters.maxAge,
    advFilters.minExp,
    advFilters.sort !== 'createdAt' ? '1' : '',
  ].filter(Boolean).length;

  const expOpts = [
    { label: t('filter_any'), v: '' },
    { label: '1+ yr', v: '1' },
    { label: '3+ yr', v: '3' },
    { label: '5+ yr', v: '5' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.cream }}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.hero}>
        <View style={{ flexDirection:'row', alignItems:'flex-start', justifyContent:'space-between', marginBottom:2 }}>
          <View>
            <Text style={styles.greet}>Hi, <Text style={{ color:'#5dd6a8' }}>{(user?.name || '').split(' ')[0] || 'there'}</Text></Text>
            <View style={styles.activePill}>
              <View style={styles.activeDot}/>
              <Text style={styles.activePillTxt}>Active</Text>
            </View>
          </View>
          <NotifBell color="rgba(255,255,255,0.9)" style={{ marginTop:4 }} />
        </View>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={onSearchChange}
            placeholder={t('search_placeholder')}
            placeholderTextColor="rgba(255,255,255,0.5)"
            returnKeyType="search"
          />
        </View>
      </View>

      {/* Story-style quick filters */}
      <View style={styles.storiesWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stories}>
          {STORIES.map(c => (
            <TouchableOpacity key={c.key} onPress={() => onChipPress(c.key)}
              style={[styles.story, chip === c.key && styles.storyActive]}>
              <Ionicons name={c.icon} size={20} color={chip === c.key ? COLORS.green : COLORS.muted} />
              <Text style={[styles.storyTxt, chip === c.key && styles.storyTxtActive]}>{t(c.lk)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Category pill filters */}
      <View style={styles.catsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cats}>
          {CATEGORIES.map(c => (
            <TouchableOpacity key={c.key} onPress={() => onChipPress(c.key)}
              style={[styles.cat, chip === c.key && styles.catActive]}>
              <Ionicons name={c.icon} size={16} color={chip === c.key ? COLORS.green : COLORS.muted} />
              <Text style={[styles.catTxt, chip === c.key && styles.catTxtActive]}>{t(c.lk)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Maid list */}
      {loading
        ? <ActivityIndicator size="large" color={COLORS.green} style={{ marginTop: 40 }} />
        : <FlatList
            data={maids}
            keyExtractor={item => item._id}
            contentContainerStyle={{ padding: 14, paddingBottom: 100 }}
            renderItem={({ item }) => (
              <MaidCard
                maid={item}
                initialLiked={savedIds.has(item._id)}
                onPress={() => navigation.navigate('MaidDetail', {
                  maid: item,
                  onHired: (id) => setMaids(prev => prev.filter(m => m._id !== id)),
                })}
                onPhotoPress={(photos, index) => setPhotoViewer({ visible: true, photos, index })}
              />
            )}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => { setRefreshing(true); loadSavedIds(); resetFetch(chipRef.current, searchRef.current, advRef.current); }}
                tintColor={COLORS.green}
              />
            }
            onEndReached={() => {
              if (hasMoreRef.current && !fetchingRef.current)
                fetchMaids(pageRef.current, searchRef.current, chipRef.current, advRef.current);
            }}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={
              <View style={{ alignItems:'center', padding:40, marginTop:20 }}>
                <View style={{ width:110, height:110, borderRadius:55, backgroundColor:'#e8f4f1', alignItems:'center', justifyContent:'center', marginBottom:20, borderWidth:2, borderColor:'rgba(13,56,39,0.12)' }}>
                  <Ionicons name="home-outline" size={52} color={COLORS.green} />
                </View>
                <Text style={{ fontFamily:FONTS.display, fontSize:20, color:COLORS.dark, marginBottom:8, textAlign:'center' }}>{t('no_maids')}</Text>
                <Text style={{ fontSize:13, color:COLORS.muted, textAlign:'center', lineHeight:20, maxWidth:260 }}>We're growing every day — a perfect home helper for you will be available soon.</Text>
              </View>
            }
            ListFooterComponent={hasMore ? <ActivityIndicator color={COLORS.green} style={{ marginVertical: 20 }} /> : null}
          />
      }

      {/* Photo Viewer Modal */}
      <Modal
        visible={photoViewer.visible}
        animationType="fade"
        transparent
        statusBarTranslucent
        onRequestClose={() => setPhotoViewer(v => ({ ...v, visible: false }))}
      >
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <FlatList
            data={photoViewer.photos}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={photoViewer.index}
            getItemLayout={(_, i) => ({ length: SW, offset: SW * i, index: i })}
            onMomentumScrollEnd={e => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / SW);
              setPhotoViewer(v => ({ ...v, index: idx }));
            }}
            renderItem={({ item }) => (
              <View style={{ width: SW, height: SH, justifyContent: 'center', alignItems: 'center' }}>
                <Image source={{ uri: item.url }} style={{ width: SW, height: SH * 0.75 }} resizeMode="contain" />
              </View>
            )}
            keyExtractor={(_, i) => String(i)}
          />
          <View style={styles.pvHeader}>
            <View style={styles.pvCountWrap}>
              <Text style={styles.pvCount}>{photoViewer.index + 1} / {photoViewer.photos.length}</Text>
            </View>
            <TouchableOpacity
              onPress={() => setPhotoViewer(v => ({ ...v, visible: false }))}
              style={styles.pvClose}
            >
              <Text style={{ fontSize: 18, color: '#fff' }}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.pvDots}>
            {photoViewer.photos.map((_, i) => (
              <View key={i} style={[styles.pvDot, i === photoViewer.index && styles.pvDotActive]} />
            ))}
          </View>
        </View>
      </Modal>

      {/* Filter Modal */}
      <Modal visible={filterVisible} animationType="slide" transparent statusBarTranslucent>
        <Pressable style={styles.overlay} onPress={() => setFilterVisible(false)} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{t('filter_title')}</Text>
            <TouchableOpacity onPress={() => setFilterVisible(false)}>
              <Text style={styles.sheetClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 12 }}>

            {/* Sort */}
            <Text style={styles.secLabel}>{t('filter_sort')}</Text>
            <View style={styles.optRow}>
              {SORT_OPTS.map(o => (
                <TouchableOpacity key={o.v} onPress={() => setDraft(d => ({ ...d, sort: o.v }))}
                  style={[styles.optChip, draft.sort === o.v && styles.optChipActive]}>
                  <Text style={[styles.optChipTxt, draft.sort === o.v && styles.optChipTxtActive]}>{t(o.lk)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Salary range */}
            <Text style={styles.secLabel}>{t('filter_salary')}</Text>
            <View style={styles.rangeRow}>
              <TextInput style={styles.rangeInput}
                placeholder={t('filter_min')} placeholderTextColor={COLORS.muted}
                keyboardType="numeric" value={draft.minSalary}
                onChangeText={v => setDraft(d => ({ ...d, minSalary: v }))} />
              <Text style={styles.rangeDash}>—</Text>
              <TextInput style={styles.rangeInput}
                placeholder={t('filter_max')} placeholderTextColor={COLORS.muted}
                keyboardType="numeric" value={draft.maxSalary}
                onChangeText={v => setDraft(d => ({ ...d, maxSalary: v }))} />
            </View>

            {/* Age range */}
            <Text style={styles.secLabel}>{t('filter_age')}</Text>
            <View style={styles.rangeRow}>
              <TextInput style={styles.rangeInput}
                placeholder={t('filter_min')} placeholderTextColor={COLORS.muted}
                keyboardType="numeric" value={draft.minAge}
                onChangeText={v => setDraft(d => ({ ...d, minAge: v }))} />
              <Text style={styles.rangeDash}>—</Text>
              <TextInput style={styles.rangeInput}
                placeholder={t('filter_max')} placeholderTextColor={COLORS.muted}
                keyboardType="numeric" value={draft.maxAge}
                onChangeText={v => setDraft(d => ({ ...d, maxAge: v }))} />
            </View>

            {/* Experience */}
            <Text style={styles.secLabel}>{t('filter_exp')}</Text>
            <View style={styles.optRow}>
              {expOpts.map(o => (
                <TouchableOpacity key={o.v} onPress={() => setDraft(d => ({ ...d, minExp: o.v }))}
                  style={[styles.optChip, draft.minExp === o.v && styles.optChipActive]}>
                  <Text style={[styles.optChipTxt, draft.minExp === o.v && styles.optChipTxtActive]}>{o.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

          </ScrollView>

          {/* Action buttons */}
          <View style={styles.sheetBtns}>
            <TouchableOpacity style={styles.resetBtn} onPress={resetFilter}>
              <Text style={styles.resetTxt}>{t('filter_reset')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyBtn} onPress={applyFilter}>
              <Text style={styles.applyTxt}>{t('filter_apply')}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // Header
  hero:         { paddingHorizontal: 18, paddingTop: 54, paddingBottom: 16, backgroundColor: '#0D3827' },
  greet:        { fontSize: 22, fontFamily: FONTS.display, color: '#fff', marginBottom: 8 },
  activePill:   { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: 'rgba(93,214,168,0.15)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(93,214,168,0.4)', marginBottom: 12 },
  activeDot:    { width: 6, height: 6, borderRadius: 3, backgroundColor: '#5dd6a8' },
  activePillTxt:{ fontSize: 11, color: '#5dd6a8', fontWeight: '700', letterSpacing: 0.8 },
  searchRow:   { flexDirection: 'row', gap: 10 },
  searchInput: { flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, color: '#fff', fontSize: 13, fontFamily: FONTS.body },
  filterFab:   { width: 44, height: 44, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.35)', borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  badge:       { position: 'absolute', top: -4, right: -4, backgroundColor: '#e05252', borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  badgeTxt:    { fontSize: 9, color: '#fff', fontWeight: '700' },

  // Stories (circular quick filters)
  storiesWrap: { backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  stories:     { paddingHorizontal: 14, paddingVertical: 12, gap: 12 },
  story:       { width: 72, height: 72, borderRadius: 36, backgroundColor: '#dfeee8', alignItems: 'center', justifyContent: 'center' },
  storyActive: { backgroundColor: COLORS.green },
  storyIcon:   { fontSize: 22 },
  storyTxt:    { fontSize: 10, color: COLORS.muted, marginTop: 2, textAlign: 'center', fontFamily: FONTS.bodyMedium },
  storyTxtActive: { color: '#fff' },

  // Category pill filters
  catsWrap:    { backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  cats:        { paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  cat:         { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, backgroundColor: COLORS.surface, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  catActive:   { backgroundColor: COLORS.green },
  catIcon:     { fontSize: 16 },
  catTxt:      { fontSize: 13, color: COLORS.dark, fontFamily: FONTS.bodyMedium },
  catTxtActive:{ color: '#fff' },

  // Card
  card:        { backgroundColor: COLORS.surface, borderRadius: 22, marginBottom: 14, overflow: 'hidden', ...SHADOWS.card },
  photos:      { flexDirection: 'row', height: 160 },
  photoMain:   { flex: 2, alignItems: 'center', justifyContent: 'center', position: 'relative', backgroundColor: '#dfeee8' },
  photoImg:    { width: '100%', height: '100%', resizeMode: 'cover' },
  photoEmoji:  { fontSize: 50 },
  photosSide:  { flex: 1, gap: 1 },
  photoSm:     { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#c8e6df' },
  availBadge:   { position: 'absolute', top: 10, left: 10, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(13,56,39,0.85)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(93,214,168,0.45)' },
  availDot:     { width: 6, height: 6, borderRadius: 3, backgroundColor: '#5dd6a8' },
  availTxt:     { fontSize: 10, color: '#5dd6a8', fontWeight: '700', letterSpacing: 0.5 },
  unavailBadge: { backgroundColor: 'rgba(80,80,80,0.75)', borderColor: 'rgba(180,180,180,0.3)' },
  unavailTxt:   { color: 'rgba(255,255,255,0.65)' },
  photoCountBadge: { position: 'absolute', bottom: 6, right: 6, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  photoCountTxt:   { fontSize: 9, color: '#fff', fontWeight: '700' },

  // Photo viewer modal
  pvHeader:    { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 50, paddingHorizontal: 18, paddingBottom: 10 },
  pvCountWrap: { backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  pvCount:     { color: '#fff', fontSize: 13, fontWeight: '600' },
  pvClose:     { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  pvDots:      { position: 'absolute', bottom: 60, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  pvDot:       { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' },
  pvDotActive: { width: 20, height: 6, borderRadius: 3, backgroundColor: COLORS.green },
  info:        { padding: 14 },
  infoTop:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  name:        { fontFamily: FONTS.display, fontSize: 18, color: COLORS.dark },
  origin:      { fontSize: 11, color: COLORS.muted, marginTop: 1 },
  heartBtn:    { width: 34, height: 34, borderRadius: 17, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.cream, alignItems: 'center', justifyContent: 'center' },
  heartBtnLiked: { backgroundColor: '#fff0f0', borderColor: '#f5a0a0' },
  tagsRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 10 },
  tag:         { backgroundColor: '#e8f4f1', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  tagTxt:      { fontSize: 10, color: COLORS.green },
  statsRow:    { flexDirection: 'row', borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 10 },
  stat:        { flex: 1, alignItems: 'center' },
  statBorder:  { borderLeftWidth: 1, borderRightWidth: 1, borderColor: COLORS.border },
  statN:       { fontFamily: FONTS.display, fontSize: 15, color: COLORS.dark },
  statL:       { fontSize: 9, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 1 },
  bookBtn:     { backgroundColor: COLORS.green, borderRadius: 14, padding: 12, alignItems: 'center', marginTop: 12 },
  bookBtnTxt:  { fontSize: 13, fontFamily: FONTS.bodySemiBold, color: '#fff' },

  // Filter modal
  overlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet:       { backgroundColor: COLORS.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%' },
  sheetHandle: { width: 40, height: 4, backgroundColor: COLORS.border, borderRadius: 2, alignSelf: 'center', marginTop: 10 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  sheetTitle:  { fontFamily: FONTS.display, fontSize: 20, color: COLORS.dark },
  sheetClose:  { fontSize: 18, color: COLORS.muted, paddingHorizontal: 4 },
  sheetBtns:   { flexDirection: 'row', gap: 10, padding: 16, paddingBottom: Platform.OS === 'ios' ? 30 : 16, borderTopWidth: 1, borderTopColor: COLORS.border },
  resetBtn:    { flex: 1, paddingVertical: 13, borderRadius: 8, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center' },
  resetTxt:    { fontFamily: FONTS.bodyMedium, fontSize: 14, color: COLORS.muted },
  applyBtn:    { flex: 2, paddingVertical: 13, borderRadius: 8, backgroundColor: COLORS.green, alignItems: 'center' },
  applyTxt:    { fontFamily: FONTS.bodyMedium, fontSize: 14, color: '#fff', fontWeight: '700' },
  secLabel:    { fontFamily: FONTS.bodyMedium, fontSize: 11, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10, marginTop: 20 },
  optRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optChip:     { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.cream },
  optChipActive: { backgroundColor: COLORS.green, borderColor: COLORS.green },
  optChipTxt:  { fontSize: 13, color: COLORS.text },
  optChipTxtActive: { color: '#fff' },
  rangeRow:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rangeInput:  { flex: 1, backgroundColor: COLORS.cream, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: COLORS.text },
  rangeDash:   { fontSize: 18, color: COLORS.muted },
});
