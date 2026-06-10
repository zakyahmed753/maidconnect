import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { hwAPI, paymentsAPI, maidsAPI } from '../../services/api';
import { COLORS, FONTS } from '../../utils/theme';
import Toast from 'react-native-toast-message';
import { useTranslation } from '../../utils/i18n';

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
const WEEK_MS       = 7 * 24 * 60 * 60 * 1000;
const MONTH_MS      = 30 * 24 * 60 * 60 * 1000;

// Returns what the customer will pay when hiring their NEXT maid (not to release this one).
function getReplacementFee(hiredAt) {
  const ms = Date.now() - new Date(hiredAt || 0).getTime();
  if (ms <= THREE_DAYS_MS) return { amount: 0,    isFree: true  };
  if (ms <= WEEK_MS)       return { amount: 500,  isFree: false };
  if (ms <= MONTH_MS)      return { amount: 700,  isFree: false };
  return                          { amount: 1000, isFree: false };
}

export default function HiredMaidsScreen({ navigation }) {
  const { t } = useTranslation();
  const [hired, setHired]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [returning, setReturning]     = useState(null);

  // Mandatory review before release
  const [reviewModal, setReviewModal]     = useState(false);
  const [reviewMaid, setReviewMaid]       = useState(null); // { maidId, maidName, hiredAt, maid._id }
  const [reviewStar, setReviewStar]       = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);
      hwAPI.getProfile()
        .then(r => setHired(r.data?.profile?.hiredMaids || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, [])
  );

  const handleRelease = (maidId, maidName, hiredAt, maidProfileId) => {
    // Step 1: force review first
    setReviewMaid({ maidId, maidName, hiredAt, maidProfileId });
    setReviewStar(0);
    setReviewComment('');
    setReviewModal(true);
  };

  const submitReviewAndRelease = async () => {
    if (reviewStar === 0) {
      Toast.show({ type: 'error', text1: t('please_rate_before_release') });
      return;
    }
    setReviewLoading(true);
    try {
      // Submit review
      await maidsAPI.submitReview(reviewMaid.maidProfileId, {
        rating: reviewStar,
        comment: reviewComment.trim(),
      });
      setReviewModal(false);
      // Step 2: proceed with release
      proceedRelease(reviewMaid.maidId, reviewMaid.maidName, reviewMaid.hiredAt);
    } catch (err) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || t('review_submit_failed') });
    } finally {
      setReviewLoading(false);
    }
  };

  const proceedRelease = (maidId, maidName, hiredAt) => {
    const fee = getReplacementFee(hiredAt);

    // Dialog body is specific to each scenario
    const dialogBody = fee.isFree
      ? `${t('release_confirm_grace_body_1', { name: maidName })}\n\n${t('release_confirm_grace_body_2')}`
      : `${t('release_confirm_fee_body_1', { name: maidName })}\n\n${t('release_confirm_fee_body_2_prefix')} EGP ${fee.amount} ${t('release_confirm_fee_body_2_suffix')}`;

    Alert.alert(t('release_dialog_title'), dialogBody, [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('release_btn'),
        style: 'destructive',
        onPress: async () => {
          setReturning(maidId);
          try {
            const res = await paymentsAPI.returnMaid({ maidProfileId: maidId });
            setHired(prev => prev.filter(h => (h.maid?._id || h.maid) !== maidId));
            const penalty = res.data?.penaltyAmount || 0;
            // Toast is also scenario-specific
            Toast.show({
              type: penalty > 0 ? 'info' : 'success',
              text1: t('vacancy_released'),
              text2: penalty > 0
                ? `${t('release_toast_fee_prefix')} EGP ${penalty} ${t('release_toast_fee_suffix')}`
                : t('release_toast_free'),
            });
          } catch (err) {
            Toast.show({ type: 'error', text1: err.response?.data?.message || t('release_failed') });
          } finally {
            setReturning(null);
          }
        },
      },
    ]);
  };

  const getPenaltyBadge = (hiredAt) => {
    const fee = getReplacementFee(hiredAt);
    if (fee.isFree)        return { text: t('next_hire_free'),    color: '#2e7d5e', bg: 'rgba(46,125,94,0.1)' };
    if (fee.amount === 500) return { text: t('next_hire_fee_500'), color: '#b45309', bg: '#fffbeb' };
    if (fee.amount === 700) return { text: t('next_hire_fee_700'), color: '#b45309', bg: '#fffbeb' };
    return                        { text: t('next_hire_fee_1000'), color: '#b91c1c', bg: '#fef2f2' };
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.cream }}>

      {/* Mandatory Review Modal */}
      <Modal visible={reviewModal} transparent animationType="slide" onRequestClose={() => {}}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex:1 }}>
        <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.6)', justifyContent:'flex-end' }}>
          <View style={{ backgroundColor:COLORS.surface, borderTopLeftRadius:16, borderTopRightRadius:16, padding:22 }}>
            <Text style={{ fontFamily:FONTS.display, fontSize:20, color:COLORS.dark, marginBottom:4 }}>
              {t('rate_label')} {reviewMaid?.maidName}
            </Text>
            <Text style={{ fontSize:13, color:COLORS.muted, marginBottom:16, lineHeight:19 }}>
              {t('rate_required_release')}
            </Text>

            {/* Stars */}
            <View style={{ flexDirection:'row', gap:8, marginBottom:16, justifyContent:'center' }}>
              {[1,2,3,4,5].map(s => (
                <TouchableOpacity key={s} onPress={() => setReviewStar(s)}>
                  <Text style={{ fontSize:34 }}>{s <= reviewStar ? '⭐' : '☆'}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={{ borderWidth:1.5, borderColor:COLORS.border, borderRadius:8, padding:12, fontSize:14, color:COLORS.text, backgroundColor:COLORS.cream, minHeight:80, textAlignVertical:'top', marginBottom:16 }}
              placeholder={t('share_exp_release')}
              placeholderTextColor={COLORS.muted}
              value={reviewComment}
              onChangeText={setReviewComment}
              multiline
            />

            <TouchableOpacity
              style={{ backgroundColor: reviewStar > 0 ? '#e05555' : COLORS.border, padding:14, borderRadius:8, alignItems:'center', marginBottom:10, opacity: reviewLoading ? 0.6 : 1 }}
              onPress={submitReviewAndRelease}
              disabled={reviewLoading}>
              {reviewLoading
                ? <ActivityIndicator color="#fff"/>
                : <Text style={{ fontFamily:FONTS.bodySemiBold, fontSize:14, color: reviewStar > 0 ? '#fff' : COLORS.muted }}>
                    {t('submit_review_release')}
                  </Text>}
            </TouchableOpacity>
          </View>
        </View>
        </KeyboardAvoidingView>
      </Modal>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 22, color: 'rgba(232,201,122,0.6)' }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('hired_maid_title')}</Text>
        <Text style={styles.headerSub}>{t('hired_maid_sub')}</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.gold} />
        </View>
      ) : hired.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <Text style={{ fontSize: 52, marginBottom: 16 }}>🏠</Text>
          <Text style={{ fontFamily: FONTS.display, fontSize: 22, color: COLORS.dark, textAlign: 'center' }}>{t('no_hired_maid')}</Text>
          <Text style={{ fontSize: 13, color: COLORS.muted, textAlign: 'center', marginTop: 6, lineHeight: 20 }}>
            {t('no_hired_sub')}
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: COLORS.gold, paddingHorizontal: 28, paddingVertical: 13, borderRadius: 6, marginTop: 24 }}
            onPress={() => navigation.navigate('Browse')}>
            <Text style={{ fontFamily: FONTS.bodySemiBold, fontSize: 14, color: COLORS.dark }}>{t('browse_maids_btn')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {hired.map((item, idx) => {
            const maid      = item.maid || {};
            const maidId    = maid._id || item.maid;
            const maidName  = maid.fullName || 'Maid';
            const isRet     = returning === maidId;
            const badge     = getPenaltyBadge(item.hiredAt);

            return (
              <View key={String(maidId) + idx} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.avatar}>
                    <Text style={{ fontSize: 30 }}>👩</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.maidName}>{maidName}</Text>
                    <Text style={styles.maidSub}>{maid.nationality || ''}{maid.age ? ` · ${maid.age} yrs` : ''}</Text>
                    {maid.expectedSalary ? (
                      <Text style={styles.maidSalary}>EGP {maid.expectedSalary.toLocaleString()}/mo</Text>
                    ) : null}
                  </View>
                  <View style={styles.hiredBadge}>
                    <Text style={{ fontSize: 9, color: '#2e7d5e', fontWeight: '700', letterSpacing: 0.8 }}>HIRED ✓</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{t('hired_on')}</Text>
                  <Text style={styles.infoVal}>{new Date(item.hiredAt || Date.now()).toLocaleDateString()}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{t('skills_label_info')}</Text>
                  <Text style={styles.infoVal}>{(maid.skills || []).slice(0, 3).join(', ') || '—'}</Text>
                </View>

                {/* Penalty badge */}
                <View style={[styles.penaltyBadge, { backgroundColor: badge.bg }]}>
                  <Text style={[styles.penaltyTxt, { color: badge.color }]}>{badge.text}</Text>
                </View>

                {/* Release button — always visible */}
                <TouchableOpacity
                  style={[styles.btnRelease, isRet && { opacity: 0.5 }]}
                  onPress={() => handleRelease(maidId, maidName, item.hiredAt, maid._id)}
                  disabled={isRet}>
                  {isRet
                    ? <ActivityIndicator size="small" color="#e05555" />
                    : <Text style={styles.btnReleaseTxt}>{t('release_vacancy')}</Text>}
                </TouchableOpacity>
              </View>
            );
          })}

          <View style={styles.infoBox}>
            <Text style={{ fontSize: 12, color: COLORS.muted, lineHeight: 20 }}>
              <Text style={{ fontWeight: '700', color: COLORS.dark }}>📋 How replacement fees work{'\n'}</Text>
              {'\n'}
              <Text>If you encounter any issues with your maid and need to replace her, a fee applies based on how long you have been working together:{'\n'}</Text>
              {'\n'}
              <Text style={{ color: '#2e7d5e', fontWeight: '700' }}>  ✓  0 – 3 days</Text><Text>   →  Free (trial period — no commitment){'\n'}</Text>
              <Text style={{ fontWeight: '600' }}>  •  4 – 7 days</Text><Text>   →  EGP 500 replacement fee{'\n'}</Text>
              <Text style={{ fontWeight: '600' }}>  •  8 – 30 days</Text><Text>  →  EGP 700 replacement fee{'\n'}</Text>
              <Text style={{ fontWeight: '600' }}>  •  After 30 days</Text><Text> →  EGP 1,000 replacement fee{'\n'}</Text>
              {'\n'}
              <Text style={{ color: COLORS.dark }}>The fee is charged when you hire your next maid, not when you release. After releasing, you have 3 days to choose a replacement.</Text>
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header:       { backgroundColor: '#3d2203', padding: 20, paddingTop: 54 },
  headerTitle:  { fontFamily: FONTS.display, fontSize: 24, color: '#fff8ee', marginTop: 10 },
  headerSub:    { fontSize: 11, color: 'rgba(232,201,122,0.45)', marginTop: 2 },
  card:         { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#f0e8d8', elevation: 2, shadowColor: '#c9a84c', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  cardTop:      { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  avatar:       { width: 56, height: 56, borderRadius: 28, backgroundColor: '#fef6e4', borderWidth: 2, borderColor: COLORS.gold, alignItems: 'center', justifyContent: 'center' },
  maidName:     { fontFamily: FONTS.display, fontSize: 18, color: COLORS.dark },
  maidSub:      { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  maidSalary:   { fontSize: 12, color: COLORS.gold, fontWeight: '600', marginTop: 2 },
  hiredBadge:   { backgroundColor: 'rgba(46,125,94,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: 'rgba(46,125,94,0.25)' },
  infoRow:      { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderTopWidth: 1, borderTopColor: '#f5ede0' },
  infoLabel:    { fontSize: 11, color: COLORS.muted },
  infoVal:      { fontSize: 11, color: COLORS.dark, fontWeight: '500', flex: 1, textAlign: 'right' },
  penaltyBadge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 7, marginTop: 10, marginBottom: 2 },
  penaltyTxt:   { fontSize: 11, fontWeight: '600' },
  btnRelease:   { marginTop: 12, padding: 13, borderRadius: 8, backgroundColor: '#fff0f0', borderWidth: 1.5, borderColor: '#e05555', alignItems: 'center' },
  btnReleaseTxt:{ fontSize: 14, fontWeight: '700', color: '#e05555' },
  infoBox:      { backgroundColor: '#fffcf5', borderWidth: 1, borderColor: '#f0e8d8', borderRadius: 8, padding: 14, marginTop: 4, marginBottom: 20 },
});
