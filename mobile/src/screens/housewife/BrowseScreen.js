import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput,
  ScrollView, Image, ActivityIndicator, RefreshControl, StatusBar,
  Modal, Pressable, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { maidsAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import { COLORS, FONTS, SHADOWS } from '../../utils/theme';
import Toast from 'react-native-toast-message';
import { useTranslation } from '../../utils/i18n';

const CHIPS = [
  { key: 'all',       icon: '🌟', lk: 'filter_all',       params: {} },
  { key: 'available', icon: '✅', lk: 'filter_available',  params: { isAvailable: 'true' } },
  { key: 'top_rated', icon: '⭐', lk: 'filter_top_rated',  params: { sort: 'rating' } },
  { key: 'african',   icon: '🌍', lk: 'filter_african',    params: { origin: 'african' } },
  { key: 'asian',     icon: '🌏', lk: 'filter_asian',      params: { origin: 'asian' } },
  { key: 'cooking',   icon: '🍳', lk: 'filter_cooking',    params: { skills: 'Cooking' } },
  { key: 'childcare', icon: '👶', lk: 'filter_childcare',  params: { skills: 'Childcare' } },
  { key: 'eldercare', icon: '🫶', lk: 'filter_eldercare',  params: { skills: 'Eldercare' } },
];

const SORT_OPTS = [
  { lk: 'filter_newest',         v: 'createdAt' },
  { lk: 'filter_top_rated_sort', v: 'rating' },
  { lk: 'filter_highest_salary', v: 'expectedSalary' },
];

const EMPTY_ADV = { minSalary: '', maxSalary: '', minAge: '', maxAge: '', minExp: '', sort: 'createdAt' };

// ── Maid Card ──
const MaidCard = ({ maid, onPress, initialLiked }) => {
  const [liked, setLiked] = useState(!!initialLiked);
  useEffect(() => { setLiked(!!initialLiked); }, [initialLiked]);

  const handleLike = async () => {
    const next = !liked;
    setLiked(next);
    try { await maidsAPI.toggleLike(maid._id); }
    catch { setLiked(!next); Toast.show({ type: 'error', text1: 'Failed to save' }); }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.photos}>
        <View style={[styles.photoMain, { backgroundColor: maid.origin === 'african' ? '#2d1a0a' : '#1a0d2e' }]}>
          {maid.photos?.[0]?.url
            ? <Image source={{ uri: maid.photos[0].url }} style={styles.photoImg} />
            : <Text style={styles.photoEmoji}>👩</Text>}
          <View style={[styles.availBadge, !maid.isAvailable && { backgroundColor: COLORS.muted }]}>
            <Text style={styles.availTxt}>{maid.isAvailable ? '● Available' : 'Unavailable'}</Text>
          </View>
        </View>
        <View style={styles.photosSide}>
          <View style={[styles.photoSm, { backgroundColor: maid.origin === 'african' ? '#2d1a0a99' : '#1a0d2e99' }]}>
            {maid.photos?.[1]?.url
              ? <Image source={{ uri: maid.photos[1].url }} style={{ width: '100%', height: '100%' }} />
              : <Text style={{ fontSize: 18 }}>👩</Text>}
          </View>
          <View style={[styles.photoSm, { backgroundColor: maid.origin === 'african' ? '#2d1a0a66' : '#1a0d2e66' }]}>
            {maid.photos?.[2]?.url
              ? <Image source={{ uri: maid.photos[2].url }} style={{ width: '100%', height: '100%' }} />
              : <Text style={{ fontSize: 18 }}>📷</Text>}
          </View>
        </View>
      </View>

      <View style={styles.info}>
        <View style={styles.infoTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{maid.fullName}</Text>
            <Text style={styles.origin}>{maid.nationality} · {maid.age} yrs</Text>
          </View>
          <TouchableOpacity style={[styles.heartBtn, liked && styles.heartBtnLiked]} onPress={handleLike}>
            <Text style={{ fontSize: 16 }}>{liked ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.tagsRow}>
          {(maid.skills || []).slice(0, 3).map(s => (
            <View key={s} style={styles.tag}><Text style={styles.tagTxt}>{s}</Text></View>
          ))}
        </View>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statN}>{maid.experienceYears}yr</Text>
            <Text style={styles.statL}>Exp</Text>
          </View>
          <View style={[styles.stat, styles.statBorder]}>
            <Text style={styles.statN}>EGP {(maid.expectedSalary || 0).toLocaleString()}</Text>
            <Text style={styles.statL}>Salary</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statN}>⭐{maid.rating?.toFixed(1) || '—'}</Text>
            <Text style={styles.statL}>{maid.reviewCount || 0} rev</Text>
          </View>
        </View>
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

      {/* Hero */}
      <LinearGradient colors={['#3d2203', '#1a1108']} style={styles.hero}>
        <Text style={styles.greet}>{t('good_morning')}</Text>
        <Text style={styles.heroName}>{user?.name || t('welcome')} 👋</Text>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={onSearchChange}
            placeholder={t('search_placeholder')}
            placeholderTextColor="rgba(232,201,122,0.38)"
            returnKeyType="search"
          />
          <TouchableOpacity style={styles.filterFab} onPress={openFilter}>
            <Text style={{ fontSize: 16, color: '#e8c97a' }}>⚙</Text>
            {activeCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeTxt}>{activeCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Quick chip filters */}
      <View style={styles.chipsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {CHIPS.map(c => (
            <TouchableOpacity key={c.key} onPress={() => onChipPress(c.key)}
              style={[styles.chip, chip === c.key && styles.chipActive]}>
              <Text style={styles.chipIcon}>{c.icon}</Text>
              <Text style={[styles.chipTxt, chip === c.key && styles.chipTxtActive]}>{t(c.lk)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Maid list */}
      {loading
        ? <ActivityIndicator size="large" color={COLORS.gold} style={{ marginTop: 40 }} />
        : <FlatList
            data={maids}
            keyExtractor={item => item._id}
            contentContainerStyle={{ padding: 14, paddingBottom: 100 }}
            renderItem={({ item }) => (
              <MaidCard
                maid={item}
                initialLiked={savedIds.has(item._id)}
                onPress={() => navigation.navigate('MaidDetail', { maid: item })}
              />
            )}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => { setRefreshing(true); loadSavedIds(); resetFetch(chipRef.current, searchRef.current, advRef.current); }}
                tintColor={COLORS.gold}
              />
            }
            onEndReached={() => {
              if (hasMoreRef.current && !fetchingRef.current)
                fetchMaids(pageRef.current, searchRef.current, chipRef.current, advRef.current);
            }}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={
              <View style={{ alignItems: 'center', marginTop: 60 }}>
                <Text style={{ fontSize: 32 }}>🔍</Text>
                <Text style={{ color: COLORS.muted, marginTop: 8, fontSize: 14 }}>{t('no_maids')}</Text>
              </View>
            }
            ListFooterComponent={hasMore ? <ActivityIndicator color={COLORS.gold} style={{ marginVertical: 20 }} /> : null}
          />
      }

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
  // Hero
  hero:        { paddingHorizontal: 18, paddingTop: 54, paddingBottom: 18 },
  greet:       { fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(232,201,122,0.5)', marginBottom: 2 },
  heroName:    { fontFamily: FONTS.display, fontSize: 26, color: '#fff8ee', marginBottom: 12 },
  searchRow:   { flexDirection: 'row', gap: 10 },
  searchInput: { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1.5, borderColor: 'rgba(201,168,76,0.22)', borderRadius: 7, paddingHorizontal: 14, paddingVertical: 10, color: '#e8c97a', fontSize: 13 },
  filterFab:   { width: 42, height: 42, backgroundColor: 'rgba(201,168,76,0.14)', borderWidth: 1.5, borderColor: 'rgba(201,168,76,0.28)', borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  badge:       { position: 'absolute', top: -4, right: -4, backgroundColor: '#e05252', borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  badgeTxt:    { fontSize: 9, color: '#fff', fontWeight: '700' },

  // Chips
  chipsWrap:   { backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  chips:       { paddingHorizontal: 14, paddingVertical: 10, gap: 7 },
  chip:        { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.cream },
  chipActive:  { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
  chipIcon:    { fontSize: 12 },
  chipTxt:     { fontSize: 12, fontFamily: FONTS.bodyMedium, color: COLORS.muted },
  chipTxtActive: { color: '#fff' },

  // Card
  card:        { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, marginBottom: 14, overflow: 'hidden', ...SHADOWS.card },
  photos:      { flexDirection: 'row', height: 160 },
  photoMain:   { flex: 2, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  photoImg:    { width: '100%', height: '100%', resizeMode: 'cover' },
  photoEmoji:  { fontSize: 50 },
  photosSide:  { flex: 1, gap: 1 },
  photoSm:     { flex: 1, alignItems: 'center', justifyContent: 'center' },
  availBadge:  { position: 'absolute', top: 8, left: 8, backgroundColor: COLORS.green, borderRadius: 2, paddingHorizontal: 6, paddingVertical: 2 },
  availTxt:    { fontSize: 8, color: '#fff', letterSpacing: 0.5, fontWeight: '700' },
  info:        { padding: 13 },
  infoTop:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  name:        { fontFamily: FONTS.display, fontSize: 18, color: COLORS.dark },
  origin:      { fontSize: 11, color: COLORS.muted, marginTop: 1 },
  heartBtn:    { width: 34, height: 34, borderRadius: 17, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.cream, alignItems: 'center', justifyContent: 'center' },
  heartBtnLiked: { backgroundColor: '#fff0f0', borderColor: '#f5a0a0' },
  tagsRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 10 },
  tag:         { backgroundColor: '#f4ede0', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 2 },
  tagTxt:      { fontSize: 10, color: COLORS.muted },
  statsRow:    { flexDirection: 'row', borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 10 },
  stat:        { flex: 1, alignItems: 'center' },
  statBorder:  { borderLeftWidth: 1, borderRightWidth: 1, borderColor: COLORS.border },
  statN:       { fontFamily: FONTS.display, fontSize: 15, color: COLORS.dark },
  statL:       { fontSize: 9, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 1 },

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
  applyBtn:    { flex: 2, paddingVertical: 13, borderRadius: 8, backgroundColor: COLORS.gold, alignItems: 'center' },
  applyTxt:    { fontFamily: FONTS.bodyMedium, fontSize: 14, color: COLORS.dark, fontWeight: '700' },
  secLabel:    { fontFamily: FONTS.bodyMedium, fontSize: 11, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10, marginTop: 20 },
  optRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optChip:     { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.cream },
  optChipActive: { backgroundColor: COLORS.dark, borderColor: COLORS.dark },
  optChipTxt:  { fontSize: 13, color: COLORS.text },
  optChipTxtActive: { color: '#fff' },
  rangeRow:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rangeInput:  { flex: 1, backgroundColor: COLORS.cream, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: COLORS.text },
  rangeDash:   { fontSize: 18, color: COLORS.muted },
});
