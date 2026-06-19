import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, StatusBar, ActivityIndicator, Modal, Pressable
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { COLORS, FONTS } from '../../utils/theme';
import useAuthStore from '../../store/authStore';
import { useTranslation } from '../../utils/i18n';
import { maidsAPI, couponsAPI, uploadAPI, paymentsAPI } from '../../services/api';
import * as ImagePicker from 'expo-image-picker';
import BackChevron from '../../components/BackChevron';

function getMaidPrice(nationality = '') {
  const n = nationality.toLowerCase();
  if (n.includes('philip') || n.includes('filip')) return 1000;
  if (n.includes('indonesia') || n.includes('ethiopia')) return 800;
  return 500;
}

export default function SubscriptionScreen({ navigation }) {
  const { t } = useTranslation();
  const completeAuth = useAuthStore(s => s.completeAuth);
  const logout       = useAuthStore(s => s.logout);
  const { profile }  = useAuthStore();
  const mountedRef   = React.useRef(true);
  React.useEffect(() => { return () => { mountedRef.current = false; }; }, []);
  const [nationality, setNationality]     = useState(profile?.nationality || '');
  const [offlineModal, setOfflineModal]   = useState(false);
  const [receiptUri, setReceiptUri]       = useState(null);
  const [submitting, setSubmitting]       = useState(false);
  const [submitError, setSubmitError]     = useState(null);

  const [couponInput, setCouponInput]     = useState('');
  const [applying, setApplying]           = useState(false);
  const [couponResult, setCouponResult]   = useState(null); // { discountAmount, finalAmount, discountValue, couponType }

  // pending offline receipt submitted by maid but not yet confirmed by admin
  const [pendingPayment, setPendingPayment] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(false);

  useEffect(() => {
    if (!nationality) {
      maidsAPI.getMyProfile()
        .then(r => setNationality(r.data?.maid?.nationality || ''))
        .catch(() => {});
    }
  }, []);

  // On every focus: refresh profile (auto-routes to app if admin confirmed) and
  // detect any maid-submitted receipt that is still awaiting admin confirmation.
  useFocusEffect(
    React.useCallback(() => {
      completeAuth().catch(() => {});
      paymentsAPI.getHistory()
        .then(r => {
          const pending = (r.data?.payments || []).find(
            p => p.method === 'cash_transfer' && p.status === 'pending'
          );
          setPendingPayment(pending || null);
        })
        .catch(() => {});
    }, [])
  );

  // After completeAuth, if still mounted (renewal — already in MaidTabs),
  // navigate explicitly; first-time case is handled by AppNavigator switching stacks.
  const goHomeAfterAuth = async () => {
    await completeAuth();
    const p = useAuthStore.getState().profile;
    const active = p?.subscription?.status === 'active' && p?.subscription?.endDate && new Date(p.subscription.endDate) > new Date();
    if (mountedRef.current && active) {
      navigation.navigate('MaidDash');
    }
  };

  const handleCheckPendingStatus = async () => {
    if (!pendingPayment?._id) return;
    setCheckingStatus(true);
    try {
      const res = await paymentsAPI.checkStatus(pendingPayment._id);
      if (res.data?.status === 'completed') {
        await goHomeAfterAuth();
      } else if (res.data?.status === 'failed') {
        setPendingPayment(null);
        Toast.show({ type: 'info', text1: t('receipt_rejected'), text2: t('receipt_rejected_sub') });
      } else {
        Toast.show({ type: 'info', text1: t('still_pending'), text2: t('admin_not_confirmed_yet') });
      }
    } catch {
      Toast.show({ type: 'error', text1: t('could_not_check') });
    } finally {
      setCheckingStatus(false);
    }
  };

  const monthlyPrice = getMaidPrice(nationality);
  const displayPrice = couponResult ? couponResult.finalAmount : monthlyPrice;

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setApplying(true);
    setCouponResult(null);
    try {
      const res = await couponsAPI.validate({ code: couponInput.trim(), amount: monthlyPrice });
      if (res.data.valid) {
        setCouponResult(res.data);
        Toast.show({
          type: 'success',
          text1: `${res.data.discountValue}${t('discount_applied_suffix')}`,
          text2: `${t('you_save')} ${res.data.discountAmount}`,
        });
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || t('coupon_invalid') });
    } finally {
      setApplying(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponResult(null);
    setCouponInput('');
  };

  const pickReceipt = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });
    if (!res.canceled) setReceiptUri(res.assets[0].uri);
  };

  const submitOfflinePayment = async () => {
    if (!receiptUri) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const up  = await uploadAPI.image(receiptUri);
      const res = await maidsAPI.requestOfflinePayment({
        receiptUrl: up.data.url,
        receiptPublicId: up.data.publicId,
        plan: 'monthly',
      });
      setOfflineModal(false);
      setReceiptUri(null);
      setSubmitError(null);
      navigation.navigate('PaymentResult', {
        amount:    displayPrice,
        paymentId: res.data.payment?._id,
        isOffline: true,
      });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit receipt. Check connection and try again.';
      setSubmitError(msg);
    } finally { setSubmitting(false); }
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0D3827', '#0d5e4a']} style={styles.hero}>
        <TouchableOpacity onPress={() => navigation.canGoBack() ? navigation.goBack() : logout()} style={{ width:38, height:38, borderRadius:19, backgroundColor:'rgba(255,255,255,0.2)', alignItems:'center', justifyContent:'center', marginBottom:10 }}>
          <BackChevron />
        </TouchableOpacity>
        <Ionicons name="star" size={36} color="#fff" style={{ marginBottom: 8 }} />
        <Text style={styles.heroT}>{t('subscription_title')}</Text>
        <Text style={styles.heroS}>{t('subscription_sub')}</Text>
      </LinearGradient>

      <ScrollView style={{ backgroundColor: COLORS.cream }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

        {/* Pending receipt banner — shown when maid already submitted but admin hasn't confirmed yet */}
        {pendingPayment && (
          <View style={{ backgroundColor: 'rgba(13,56,39,0.08)', borderWidth: 1.5, borderColor: COLORS.green, borderRadius: 10, padding: 16, marginBottom: 16 }}>
            <Text style={{ fontFamily: FONTS.display, fontSize: 17, color: COLORS.dark, marginBottom: 4 }}>{t('receipt_under_review')}</Text>
            <Text style={{ fontSize: 12, color: COLORS.muted, lineHeight: 18, marginBottom: 14 }}>
              {t('receipt_review_body')}
            </Text>
            <TouchableOpacity
              onPress={handleCheckPendingStatus}
              disabled={checkingStatus}
              style={{ backgroundColor: COLORS.green, padding: 12, borderRadius: 8, alignItems: 'center', opacity: checkingStatus ? 0.6 : 1 }}>
              {checkingStatus
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={{ fontFamily: FONTS.bodySemiBold, fontSize: 13, color: '#fff' }}>{t('check_confirmation_status')}</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setPendingPayment(null)} style={{ alignItems: 'center', paddingTop: 10 }}>
              <Text style={{ fontSize: 11, color: COLORS.muted }}>{t('submit_new_receipt')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Plan card */}
        <View style={[styles.planCard, styles.planSelected]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <View>
              <Text style={styles.planName}>{t('monthly_plan_name')}</Text>
              <Text style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>
                {nationality ? `${t('pricing_for')} ${nationality}` : t('standard_pricing')}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              {couponResult ? (
                <>
                  <Text style={{ fontSize: 14, color: COLORS.muted, textDecorationLine: 'line-through' }}>
                    EGP {monthlyPrice.toLocaleString()}
                  </Text>
                  <Text style={styles.planPrice}>EGP {couponResult.finalAmount.toLocaleString()}</Text>
                  <Text style={{ fontSize: 10, color: '#2e7d5e', fontWeight: '700', marginTop: 1 }}>
                    âˆ’{couponResult.discountValue}% off
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.planPrice}>EGP {monthlyPrice.toLocaleString()}</Text>
                </>
              )}
            </View>
          </View>
          {[t('plan_active_listing'), t('plan_photos'), t('plan_chat'), t('plan_analytics'), t('plan_support')].map(f => (
            <View key={f} style={styles.featureRow}>
              <Text style={{ color: COLORS.green, fontSize: 14 }}>✓</Text>
              <Text style={styles.featureTxt}>{f}</Text>
            </View>
          ))}
        </View>

        {/* Coupon input */}
        <View style={styles.couponCard}>
          <Text style={styles.couponLabel}>{t('have_coupon')}</Text>
          {couponResult ? (
            <View style={styles.appliedRow}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, color: '#2e7d5e', fontWeight: '700' }}>
                  {t('coupon_applied_pct')} {couponResult.discountValue}% off
                </Text>
                <Text style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>
                  {t('you_save')} {couponResult.discountAmount}
                </Text>
              </View>
              <TouchableOpacity onPress={handleRemoveCoupon}>
                <Text style={{ fontSize: 12, color: '#e05555', fontWeight: '600' }}>{t('remove_coupon')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.couponRow}>
              <TextInput
                style={styles.couponInput}
                value={couponInput}
                onChangeText={v => setCouponInput(v.toUpperCase())}
                placeholder="Enter code (e.g. FAT2K9X)"
                placeholderTextColor={COLORS.muted}
                autoCapitalize="characters"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={[styles.applyBtn, (!couponInput.trim() || applying) && { opacity: 0.5 }]}
                onPress={handleApplyCoupon}
                disabled={!couponInput.trim() || applying}>
                {applying
                  ? <ActivityIndicator size="small" color={COLORS.dark} />
                  : <Text style={styles.applyBtnTxt}>{t('apply_label')}</Text>}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Offline / Cash Transfer option */}
        <TouchableOpacity style={styles.offlineBtn} onPress={() => setOfflineModal(true)}>
          <Ionicons name="cash-outline" size={24} color={COLORS.green} style={{ marginRight: 4 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.offlineTxt}>{t('pay_cash')}</Text>
            <Text style={styles.offlineSub}>{t('arrange_offline')}</Text>
          </View>
          <Text style={{ color: COLORS.muted, fontSize: 16 }}>›</Text>
        </TouchableOpacity>

        {/* Check if admin has activated subscription */}
        <TouchableOpacity
          style={{ alignItems: 'center', paddingVertical: 12 }}
          onPress={async () => {
            try {
              await goHomeAfterAuth();
              // If still on this screen the subscription isn't active yet
              if (mountedRef.current) Toast.show({ type: 'info', text1: t('checking_label') });
            } catch {
              Toast.show({ type: 'error', text1: t('could_not_check') });
            }
          }}>
          <Text style={{ fontSize: 12, color: COLORS.muted }}>{t('already_paid_check')}</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Offline Payment Modal */}
      <Modal visible={offlineModal} transparent animationType="slide" statusBarTranslucent>
        <Pressable style={styles.modalOverlay} onPress={() => { setOfflineModal(false); setReceiptUri(null); setSubmitError(null); }} />
        <ScrollView style={styles.modalSheet} contentContainerStyle={{ paddingBottom: 36 }} bounces={false}>
          <View style={styles.modalHandle} />

          <Text style={styles.modalTitle}>{t('cash_transfer_title')}</Text>
          <Text style={styles.modalSub}>
            {t('cash_transfer_sub')}
          </Text>

          {/* Amount box */}
          <View style={styles.amountBox}>
            <Text style={styles.amountLabel}>{t('amount_due')}</Text>
            <Text style={styles.amountVal}>EGP {displayPrice.toLocaleString()}</Text>
            <Text style={styles.amountNote}>Monthly plan Â· {nationality || 'Standard'} pricing</Text>
          </View>

          {/* Payment details */}
          <Text style={styles.detailsHeader}>{t('transfer_to')}</Text>
          {[
            { icon: 'flash-outline',          label: 'Instapay',       value: '01022781113' },
            { icon: 'phone-portrait-outline', label: 'Vodafone Cash',  value: '01022781113' },
          ].map(({ icon, label, value }) => (
            <View key={label} style={styles.detailRow}>
              <Ionicons name={icon} size={20} color={COLORS.green} />
              <View style={{ flex: 1 }}>
                <Text style={styles.detailLabel}>{label}</Text>
                <Text style={styles.detailValue}>{value}</Text>
              </View>
            </View>
          ))}
          <View style={styles.nameRow}>
            <Text style={styles.detailLabel}>{t('account_name')}</Text>
            <Text style={styles.detailValue}>Ahmed Ibrahim Zaky Ahmed Ismail</Text>
          </View>

          {/* Receipt upload */}
          <Text style={[styles.detailsHeader, { marginTop: 18 }]}>{t('upload_receipt')}</Text>
          <TouchableOpacity style={styles.receiptUploadBtn} onPress={pickReceipt}>
            {receiptUri ? (
              <View style={{ width: '100%', alignItems: 'center' }}>
                <Text style={{ fontSize: 12, color: '#2e7d5e', fontWeight: '700', marginBottom: 6 }}>✓ {t('upload_receipt')} — tap to change</Text>
              </View>
            ) : (
              <>
                <Text style={{ fontSize: 24, marginBottom: 6 }}>ðŸ“Ž</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.green }}>{t('tap_upload_receipt')}</Text>
                <Text style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>{t('receipt_screenshot_note')}</Text>
              </>
            )}
          </TouchableOpacity>

          {submitError && (
            <View style={{ backgroundColor: 'rgba(224,85,85,0.12)', borderWidth: 1, borderColor: 'rgba(224,85,85,0.4)', borderRadius: 7, padding: 12, marginBottom: 12 }}>
              <Text style={{ fontSize: 12, color: '#e05555', lineHeight: 17 }}>⚠ {submitError}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.gotItBtn, (!receiptUri || submitting) && { opacity: 0.5 }]}
            onPress={submitOfflinePayment}
            disabled={!receiptUri || submitting}>
            {submitting
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.gotItTxt}>{submitError ? t('try_again_btn') : t('submit_receipt_btn')}</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={{ alignItems: 'center', paddingVertical: 12 }} onPress={() => { setOfflineModal(false); setReceiptUri(null); setSubmitError(null); }}>
            <Text style={{ fontSize: 13, color: COLORS.muted }}>{t('cancel')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  hero:         { padding: 22, paddingTop: 54, alignItems: 'center' },
  heroT:        { fontFamily: FONTS.display, fontSize: 26, color: '#fff', marginBottom: 5 },
  heroS:        { fontSize: 12, color: 'rgba(255,255,255,0.7)', textAlign: 'center' },
  planCard:     { backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 10, padding: 16, marginBottom: 12 },
  planSelected: { borderColor: COLORS.green, backgroundColor: '#e8f4f1' },
  planName:     { fontFamily: FONTS.display, fontSize: 18, color: COLORS.dark, marginBottom: 4 },
  planPrice:    { fontFamily: FONTS.display, fontSize: 24, color: COLORS.green },
  planPer:      { fontSize: 10, color: COLORS.muted },
  featureRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 5 },
  featureTxt:   { fontSize: 13, color: COLORS.brown },

  couponCard:   { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 14, marginBottom: 14 },
  couponLabel:  { fontSize: 11, color: COLORS.muted, marginBottom: 10 },
  couponRow:    { flexDirection: 'row', gap: 8 },
  couponInput:  { flex: 1, backgroundColor: COLORS.cream, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: COLORS.dark, letterSpacing: 1 },
  applyBtn:     { backgroundColor: COLORS.green, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  applyBtnTxt:  { fontFamily: FONTS.bodySemiBold, fontSize: 13, color: '#fff' },
  appliedRow:   { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(46,125,94,0.08)', borderRadius: 8, padding: 10 },

  btn:          { backgroundColor: COLORS.green, padding: 15, borderRadius: 5, alignItems: 'center' },
  btnTxt:       { fontFamily: FONTS.bodySemiBold, fontSize: 14, color: '#fff', letterSpacing: 0.5 },
  // Offline payment button
  offlineBtn:   { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 8, padding: 14, marginTop: 10 },
  offlineIcon:  { fontSize: 24 },
  offlineTxt:   { fontSize: 13, fontWeight: '600', color: COLORS.dark },
  offlineSub:   { fontSize: 11, color: COLORS.muted, marginTop: 1 },

  // Offline modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  modalSheet:   { backgroundColor: COLORS.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 22, paddingBottom: 36 },
  modalHandle:  { width: 40, height: 4, backgroundColor: COLORS.border, borderRadius: 2, alignSelf: 'center', marginBottom: 18 },
  modalTitle:   { fontFamily: FONTS.display, fontSize: 22, color: COLORS.dark, marginBottom: 6 },
  modalSub:     { fontSize: 12, color: COLORS.muted, lineHeight: 18, marginBottom: 18 },
  amountBox:    { backgroundColor: '#e8f4f1', borderWidth: 1.5, borderColor: COLORS.green, borderRadius: 10, padding: 14, alignItems: 'center', marginBottom: 18 },
  amountLabel:  { fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: COLORS.muted, marginBottom: 4 },
  amountVal:    { fontFamily: FONTS.display, fontSize: 28, color: COLORS.green },
  amountNote:   { fontSize: 11, color: COLORS.muted, marginTop: 3 },
  stepRow:      { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  stepNum:      { width: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.dark, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 },
  stepTxt:      { flex: 1, fontSize: 12, color: COLORS.text, lineHeight: 18 },
  detailsHeader: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.2, color: COLORS.muted, marginBottom: 8, fontWeight: '700' },
  detailRow:    { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.cream, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12, marginBottom: 8 },
  nameRow:      { backgroundColor: COLORS.cream, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12, marginBottom: 4 },
  detailLabel:  { fontSize: 10, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
  detailValue:  { fontSize: 15, fontWeight: '700', color: COLORS.dark, letterSpacing: 0.5 },
  receiptUploadBtn: { borderWidth: 1.5, borderStyle: 'dashed', borderColor: COLORS.green, borderRadius: 8, padding: 18, alignItems: 'center', backgroundColor: '#e8f4f1', marginBottom: 16 },
  gotItBtn:     { backgroundColor: COLORS.green, padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 4 },
  gotItTxt:     { fontFamily: FONTS.bodySemiBold, fontSize: 13, color: '#fff', letterSpacing: 0.3 },
});
