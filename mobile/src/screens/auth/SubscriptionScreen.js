import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, StatusBar, ActivityIndicator, Modal, Pressable
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { COLORS, FONTS } from '../../utils/theme';
import useAuthStore from '../../store/authStore';
import { useTranslation } from '../../utils/i18n';
import { maidsAPI, couponsAPI, uploadAPI } from '../../services/api';
import * as ImagePicker from 'expo-image-picker';

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
  const [skipping, setSkipping]           = useState(false);
  const [nationality, setNationality]     = useState(profile?.nationality || '');
  const [offlineModal, setOfflineModal]   = useState(false);
  const [receiptUri, setReceiptUri]       = useState(null);
  const [submitting, setSubmitting]       = useState(false);
  const [submitError, setSubmitError]     = useState(null);

  const [couponInput, setCouponInput]     = useState('');
  const [applying, setApplying]           = useState(false);
  const [couponResult, setCouponResult]   = useState(null); // { discountAmount, finalAmount, discountValue, couponType }

  useEffect(() => {
    if (!nationality) {
      maidsAPI.getMyProfile()
        .then(r => setNationality(r.data?.maid?.nationality || ''))
        .catch(() => {});
    }
  }, []);

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
          text1: `${res.data.discountValue}% discount applied!`,
          text2: `You save EGP ${res.data.discountAmount}`,
        });
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Invalid coupon code' });
    } finally {
      setApplying(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponResult(null);
    setCouponInput('');
  };

  const handleSkip = async () => {
    setSkipping(true);
    try { await completeAuth(); } catch {}
    const store = useAuthStore.getState();
    let token = store.token;
    if (!token) {
      try {
        const SecureStore = require('expo-secure-store');
        token = await SecureStore.getItemAsync('maidconnect_token');
      } catch {}
    }
    const fakeEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    useAuthStore.setState({
      token,
      user: store.user,
      profile: {
        ...(store.profile || {}),
        verificationStatus: 'verified',
        approvalStatus:     'approved',
        subscription: {
          status:    'active',
          plan:      'monthly',
          startDate: new Date().toISOString(),
          endDate:   fakeEndDate,
        },
      },
    });
    setSkipping(false);
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
      <LinearGradient colors={['#1a1108', '#3d2203']} style={styles.hero}>
        <TouchableOpacity onPress={logout} style={{ alignSelf: 'flex-start', marginBottom: 10 }}>
          <Text style={{ fontSize: 22, color: 'rgba(232,201,122,0.6)' }}>←</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 36, marginBottom: 8 }}>👑</Text>
        <Text style={styles.heroT}>{t('subscription_title')}</Text>
        <Text style={styles.heroS}>{t('subscription_sub')}</Text>
      </LinearGradient>

      <ScrollView style={{ backgroundColor: COLORS.cream }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

        {/* Plan card */}
        <View style={[styles.planCard, styles.planSelected]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <View>
              <Text style={styles.planName}>Monthly Plan</Text>
              <Text style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>
                {nationality ? `Pricing for ${nationality}` : 'Standard pricing'}
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
                    −{couponResult.discountValue}% off
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.planPrice}>EGP {monthlyPrice.toLocaleString()}</Text>
                  <Text style={styles.planPer}>/month</Text>
                </>
              )}
            </View>
          </View>
          {['Active profile listing', 'Up to 5 photos', 'Chat messaging', 'Basic analytics', 'Priority support'].map(f => (
            <View key={f} style={styles.featureRow}>
              <Text style={{ color: COLORS.green, fontSize: 14 }}>✓</Text>
              <Text style={styles.featureTxt}>{f}</Text>
            </View>
          ))}
        </View>

        {/* Coupon input */}
        <View style={styles.couponCard}>
          <Text style={styles.couponLabel}>Have a referral or promo code? (Optional)</Text>
          {couponResult ? (
            <View style={styles.appliedRow}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, color: '#2e7d5e', fontWeight: '700' }}>
                  ✓ Code applied — {couponResult.discountValue}% off
                </Text>
                <Text style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>
                  You save EGP {couponResult.discountAmount}
                </Text>
              </View>
              <TouchableOpacity onPress={handleRemoveCoupon}>
                <Text style={{ fontSize: 12, color: '#e05555', fontWeight: '600' }}>Remove</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.couponRow}>
              <TextInput
                style={styles.couponInput}
                value={couponInput}
                onChangeText={t => setCouponInput(t.toUpperCase())}
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
                  : <Text style={styles.applyBtnTxt}>Apply</Text>}
              </TouchableOpacity>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.navigate('Payment', {
            type: 'subscription',
            plan: 'monthly',
            couponCode: couponResult ? couponInput.trim() : undefined,
            discountedAmount: couponResult ? couponResult.finalAmount : undefined,
          })}>
          <Text style={styles.btnTxt}>{t('proceed_payment')}</Text>
        </TouchableOpacity>

        {/* Offline / Cash Transfer option */}
        <TouchableOpacity style={styles.offlineBtn} onPress={() => setOfflineModal(true)}>
          <Text style={styles.offlineIcon}>💵</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.offlineTxt}>Pay via Cash Transfer</Text>
            <Text style={styles.offlineSub}>Arrange payment offline with admin</Text>
          </View>
          <Text style={{ color: COLORS.muted, fontSize: 16 }}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip} disabled={skipping}>
          {skipping
            ? <ActivityIndicator size="small" color={COLORS.muted} />
            : <Text style={styles.skipTxt}>{t('skip_dev')}</Text>}
        </TouchableOpacity>
      </ScrollView>

      {/* Offline Payment Modal */}
      <Modal visible={offlineModal} transparent animationType="slide" statusBarTranslucent>
        <Pressable style={styles.modalOverlay} onPress={() => { setOfflineModal(false); setReceiptUri(null); setSubmitError(null); }} />
        <ScrollView style={styles.modalSheet} contentContainerStyle={{ paddingBottom: 36 }} bounces={false}>
          <View style={styles.modalHandle} />

          <Text style={styles.modalTitle}>💵 Cash Transfer Payment</Text>
          <Text style={styles.modalSub}>
            Transfer your subscription fee to one of the accounts below, then upload your receipt to submit.
          </Text>

          {/* Amount box */}
          <View style={styles.amountBox}>
            <Text style={styles.amountLabel}>Amount Due</Text>
            <Text style={styles.amountVal}>EGP {displayPrice.toLocaleString()}</Text>
            <Text style={styles.amountNote}>Monthly plan · {nationality || 'Standard'} pricing</Text>
          </View>

          {/* Payment details */}
          <Text style={styles.detailsHeader}>Transfer To</Text>
          {[
            { icon: '💸', label: 'Instapay', value: '01022781113' },
            { icon: '📱', label: 'Vodafone Cash', value: '01022781113' },
          ].map(({ icon, label, value }) => (
            <View key={label} style={styles.detailRow}>
              <Text style={{ fontSize: 20 }}>{icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.detailLabel}>{label}</Text>
                <Text style={styles.detailValue}>{value}</Text>
              </View>
            </View>
          ))}
          <View style={styles.nameRow}>
            <Text style={styles.detailLabel}>Account Name</Text>
            <Text style={styles.detailValue}>Ahmed Ibrahim Zaky Ahmed Ismail</Text>
          </View>

          {/* Receipt upload */}
          <Text style={[styles.detailsHeader, { marginTop: 18 }]}>Upload Receipt</Text>
          <TouchableOpacity style={styles.receiptUploadBtn} onPress={pickReceipt}>
            {receiptUri ? (
              <View style={{ width: '100%', alignItems: 'center' }}>
                <Text style={{ fontSize: 12, color: '#2e7d5e', fontWeight: '700', marginBottom: 6 }}>✓ Receipt selected — tap to change</Text>
              </View>
            ) : (
              <>
                <Text style={{ fontSize: 24, marginBottom: 6 }}>📎</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.gold }}>Tap to Upload Receipt</Text>
                <Text style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>Screenshot or photo of transfer confirmation</Text>
              </>
            )}
          </TouchableOpacity>

          {submitError && (
            <View style={{ backgroundColor: 'rgba(224,85,85,0.12)', borderWidth: 1, borderColor: 'rgba(224,85,85,0.4)', borderRadius: 7, padding: 12, marginBottom: 12 }}>
              <Text style={{ fontSize: 12, color: '#e05555', lineHeight: 17 }}>⚠️ {submitError}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.gotItBtn, (!receiptUri || submitting) && { opacity: 0.5 }]}
            onPress={submitOfflinePayment}
            disabled={!receiptUri || submitting}>
            {submitting
              ? <ActivityIndicator color="#e8c97a" />
              : <Text style={styles.gotItTxt}>{submitError ? 'Try Again' : 'Submit Receipt for Confirmation'}</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={{ alignItems: 'center', paddingVertical: 12 }} onPress={() => { setOfflineModal(false); setReceiptUri(null); setSubmitError(null); }}>
            <Text style={{ fontSize: 13, color: COLORS.muted }}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  hero:         { padding: 22, paddingTop: 54, alignItems: 'center' },
  heroT:        { fontFamily: FONTS.display, fontSize: 26, color: '#fff8ee', marginBottom: 5 },
  heroS:        { fontSize: 12, color: 'rgba(232,201,122,0.55)', textAlign: 'center' },
  planCard:     { backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 10, padding: 16, marginBottom: 12 },
  planSelected: { borderColor: COLORS.gold, backgroundColor: '#fef9ee' },
  planName:     { fontFamily: FONTS.display, fontSize: 18, color: COLORS.dark, marginBottom: 4 },
  planPrice:    { fontFamily: FONTS.display, fontSize: 24, color: COLORS.gold },
  planPer:      { fontSize: 10, color: COLORS.muted },
  featureRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 5 },
  featureTxt:   { fontSize: 13, color: COLORS.brown },

  couponCard:   { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 14, marginBottom: 14 },
  couponLabel:  { fontSize: 11, color: COLORS.muted, marginBottom: 10 },
  couponRow:    { flexDirection: 'row', gap: 8 },
  couponInput:  { flex: 1, backgroundColor: COLORS.cream, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: COLORS.dark, letterSpacing: 1 },
  applyBtn:     { backgroundColor: COLORS.gold, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  applyBtnTxt:  { fontFamily: FONTS.bodySemiBold, fontSize: 13, color: COLORS.dark },
  appliedRow:   { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(46,125,94,0.08)', borderRadius: 8, padding: 10 },

  btn:          { backgroundColor: COLORS.gold, padding: 15, borderRadius: 5, alignItems: 'center' },
  btnTxt:       { fontFamily: FONTS.bodySemiBold, fontSize: 14, color: COLORS.dark, letterSpacing: 0.5 },
  skipBtn:      { alignItems: 'center', paddingVertical: 14 },
  skipTxt:      { fontSize: 12, color: COLORS.muted, textDecorationLine: 'underline' },

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
  amountBox:    { backgroundColor: '#fef9ee', borderWidth: 1.5, borderColor: COLORS.gold, borderRadius: 10, padding: 14, alignItems: 'center', marginBottom: 18 },
  amountLabel:  { fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: COLORS.muted, marginBottom: 4 },
  amountVal:    { fontFamily: FONTS.display, fontSize: 28, color: COLORS.gold },
  amountNote:   { fontSize: 11, color: COLORS.muted, marginTop: 3 },
  stepRow:      { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  stepNum:      { width: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.dark, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 },
  stepTxt:      { flex: 1, fontSize: 12, color: COLORS.text, lineHeight: 18 },
  detailsHeader: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.2, color: COLORS.muted, marginBottom: 8, fontWeight: '700' },
  detailRow:    { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.cream, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12, marginBottom: 8 },
  nameRow:      { backgroundColor: COLORS.cream, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12, marginBottom: 4 },
  detailLabel:  { fontSize: 10, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
  detailValue:  { fontSize: 15, fontWeight: '700', color: COLORS.dark, letterSpacing: 0.5 },
  receiptUploadBtn: { borderWidth: 1.5, borderStyle: 'dashed', borderColor: COLORS.gold, borderRadius: 8, padding: 18, alignItems: 'center', backgroundColor: '#fef9ee', marginBottom: 16 },
  gotItBtn:     { backgroundColor: COLORS.dark, padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 4 },
  gotItTxt:     { fontFamily: FONTS.bodySemiBold, fontSize: 13, color: '#e8c97a', letterSpacing: 0.3 },
});
