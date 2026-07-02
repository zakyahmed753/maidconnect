import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, StatusBar, ActivityIndicator, Modal, Pressable, Platform,
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
import Constants from 'expo-constants';

const MAID_MONTHLY_SKU = 'world.servix.maid.monthly';

// react-native-iap uses NitroModules which crash in Expo Go.
// Only require it on real iOS builds (EAS / TestFlight / App Store).
const IS_EXPO_GO = Constants.appOwnership === 'expo';
const USE_IAP = Platform.OS === 'ios' && !IS_EXPO_GO;

const iap = USE_IAP ? require('react-native-iap') : {};
const {
  initConnection,
  endConnection,
  getSubscriptions,
  requestSubscription,
  getAvailablePurchases,
  finishTransaction,
  purchaseUpdatedListener,
  purchaseErrorListener,
} = iap;

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
  const mountedRef   = useRef(true);
  React.useEffect(() => { return () => { mountedRef.current = false; }; }, []);

  const [nationality, setNationality]     = useState(profile?.nationality || '');
  const [offlineModal, setOfflineModal]   = useState(false);
  const [receiptUri, setReceiptUri]       = useState(null);
  const [submitting, setSubmitting]       = useState(false);
  const [submitError, setSubmitError]     = useState(null);

  const [couponInput, setCouponInput]     = useState('');
  const [applying, setApplying]           = useState(false);
  const [couponResult, setCouponResult]   = useState(null);

  const [pendingPayment, setPendingPayment] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(false);

  // ── iOS IAP state ──────────────────────────────────────────────────────────
  const [iapProduct,      setIapProduct]      = useState(null);
  const [iapLoading,      setIapLoading]      = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const purchaseListenerRef = useRef(null);
  const errorListenerRef    = useRef(null);

  useEffect(() => {
    if (!nationality) {
      maidsAPI.getMyProfile()
        .then(r => setNationality(r.data?.maid?.nationality || ''))
        .catch(() => {});
    }
  }, []);

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

  // ── iOS IAP connection + product fetch + purchase listeners ───────────────
  useEffect(() => {
    if (!USE_IAP) return;

    let mounted = true;

    const setup = async () => {
      try {
        setIapLoading(true);
        await initConnection();
        const subs = await getSubscriptions({ skus: [MAID_MONTHLY_SKU] });
        if (mounted && subs.length) setIapProduct(subs[0]);
      } catch {
        // IAP unavailable (simulator, no App Store Connect product yet) — silent
      } finally {
        if (mounted) setIapLoading(false);
      }
    };

    setup();

    // Fires when Apple confirms a purchase
    purchaseListenerRef.current = purchaseUpdatedListener(async (purchase) => {
      const receipt = purchase.transactionReceipt;
      if (!receipt) return;
      try {
        setPurchaseLoading(true);
        await paymentsAPI.verifyAppleIAP({ receiptData: receipt, productId: purchase.productId });
        await finishTransaction({ purchase, isConsumable: false });
        await goHomeAfterAuth();
      } catch {
        Toast.show({
          type: 'error',
          text1: 'Activation failed',
          text2: 'Payment was taken. Contact support if this persists.',
          visibilityTime: 6000,
        });
      } finally {
        if (mountedRef.current) setPurchaseLoading(false);
      }
    });

    errorListenerRef.current = purchaseErrorListener((error) => {
      if (error.code !== 'E_USER_CANCELLED') {
        Toast.show({ type: 'error', text1: error.message || 'Purchase failed' });
      }
      if (mountedRef.current) setPurchaseLoading(false);
    });

    return () => {
      mounted = false;
      purchaseListenerRef.current?.remove();
      errorListenerRef.current?.remove();
      endConnection();
    };
  }, []);

  const goHomeAfterAuth = async () => {
    await completeAuth();
    const p = useAuthStore.getState().profile;
    const active = p?.subscription?.status === 'active' && p?.subscription?.endDate && new Date(p.subscription.endDate) > new Date();
    if (mountedRef.current && active) navigation.navigate('MaidDash');
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

  // ── iOS purchase handlers ──────────────────────────────────────────────────
  const handleAppleSubscribe = async () => {
    if (purchaseLoading || !iapProduct) return;
    setPurchaseLoading(true);
    try {
      await requestSubscription({ sku: MAID_MONTHLY_SKU });
      // result comes via purchaseUpdatedListener — setPurchaseLoading reset there
    } catch (err) {
      if (err.code !== 'E_USER_CANCELLED') {
        Toast.show({ type: 'error', text1: err.message || 'Could not start purchase' });
      }
      if (mountedRef.current) setPurchaseLoading(false);
    }
  };

  const handleRestorePurchases = async () => {
    if (purchaseLoading) return;
    setPurchaseLoading(true);
    try {
      const purchases = await getAvailablePurchases();
      const maidPurchase = purchases.find(p => p.productId === MAID_MONTHLY_SKU);
      if (!maidPurchase) {
        Toast.show({ type: 'info', text1: 'No previous subscription found' });
        return;
      }
      await paymentsAPI.verifyAppleIAP({
        receiptData: maidPurchase.transactionReceipt,
        productId: maidPurchase.productId,
      });
      await finishTransaction({ purchase: maidPurchase, isConsumable: false });
      await goHomeAfterAuth();
    } catch {
      Toast.show({ type: 'error', text1: 'Could not restore subscription' });
    } finally {
      if (mountedRef.current) setPurchaseLoading(false);
    }
  };

  // ── Android-only helpers ───────────────────────────────────────────────────
  const monthlyPrice  = getMaidPrice(nationality);
  const displayPrice  = couponResult ? couponResult.finalAmount : monthlyPrice;

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

  const handleRemoveCoupon = () => { setCouponResult(null); setCouponInput(''); };

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

        {/* Pending receipt banner — Android + Expo Go iOS (real iOS uses IAP) */}
        {!USE_IAP && pendingPayment && (
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

        {/* Plan card — features always shown; price shown on Android only */}
        <View style={[styles.planCard, styles.planSelected]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <View>
              <Text style={styles.planName}>{t('monthly_plan_name')}</Text>
              <Text style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>{t('standard_pricing')}</Text>
            </View>
            {/* Price shown on Android + Expo Go iOS; real iOS price comes from Apple */}
            {!USE_IAP && (
              <View style={{ alignItems: 'flex-end' }}>
                {couponResult ? (
                  <>
                    <Text style={{ fontSize: 14, color: COLORS.muted, textDecorationLine: 'line-through' }}>
                      EGP {monthlyPrice.toLocaleString()}
                    </Text>
                    <Text style={styles.planPrice}>EGP {couponResult.finalAmount.toLocaleString()}</Text>
                    <Text style={{ fontSize: 10, color: '#2e7d5e', fontWeight: '700', marginTop: 1 }}>
                      -{couponResult.discountValue}% off
                    </Text>
                  </>
                ) : (
                  <Text style={styles.planPrice}>EGP {monthlyPrice.toLocaleString()}</Text>
                )}
              </View>
            )}
          </View>
          {[t('plan_active_listing'), t('plan_photos'), t('plan_chat'), t('plan_analytics'), t('plan_support')].map(f => (
            <View key={f} style={styles.featureRow}>
              <Text style={{ color: COLORS.green, fontSize: 14 }}>✓</Text>
              <Text style={styles.featureTxt}>{f}</Text>
            </View>
          ))}
        </View>

        {/* ── iOS real build — Apple In-App Purchase ──────────────────────── */}
        {USE_IAP && (
          <View style={styles.iapSection}>
            {iapLoading ? (
              <ActivityIndicator color={COLORS.green} style={{ marginVertical: 20 }} />
            ) : iapProduct ? (
              <TouchableOpacity
                style={[styles.iapBtn, purchaseLoading && { opacity: 0.6 }]}
                onPress={handleAppleSubscribe}
                disabled={purchaseLoading}
                activeOpacity={0.85}>
                {purchaseLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.iapBtnIcon}></Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.iapBtnTxt}>Subscribe with Apple</Text>
                      <Text style={styles.iapBtnPrice}>
                        {iapProduct.localizedPrice} / month · renews automatically
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.6)" />
                  </>
                )}
              </TouchableOpacity>
            ) : (
              <View style={styles.iapUnavailable}>
                <Text style={{ fontSize: 12, color: COLORS.muted, textAlign: 'center', lineHeight: 18 }}>
                  In-app purchase is unavailable right now.{'\n'}Please contact support to activate your subscription.
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={handleRestorePurchases}
              disabled={purchaseLoading}
              style={{ alignItems: 'center', paddingVertical: 10 }}>
              <Text style={styles.restoreLink}>Restore Previous Subscription</Text>
            </TouchableOpacity>

            <View style={styles.iapLegal}>
              <Text style={styles.iapLegalTxt}>
                Subscription auto-renews monthly. Cancel anytime in iPhone Settings → Apple ID → Subscriptions.
              </Text>
            </View>

            {/* Check status — in case admin activated manually */}
            <TouchableOpacity
              style={{ alignItems: 'center', paddingVertical: 12 }}
              onPress={async () => {
                try {
                  await goHomeAfterAuth();
                  if (mountedRef.current) Toast.show({ type: 'info', text1: t('checking_label') });
                } catch {
                  Toast.show({ type: 'error', text1: t('could_not_check') });
                }
              }}>
              <Text style={{ fontSize: 12, color: COLORS.muted }}>{t('already_paid_check')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Android + Expo Go iOS — coupon + cash transfer ───────────────── */}
        {!USE_IAP && (
          <>
            {IS_EXPO_GO && Platform.OS === 'ios' && (
              <View style={{ backgroundColor: '#fff8e1', borderWidth: 1, borderColor: '#f0c040', borderRadius: 8, padding: 10, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 18 }}>🧪</Text>
                <Text style={{ fontSize: 11, color: '#7a5c00', flex: 1, lineHeight: 16 }}>
                  Expo Go — using offline payment for testing.{'\n'}Real app uses Apple In-App Purchase.
                </Text>
              </View>
            )}
          </>
        )}
        {!USE_IAP && (
          <>
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

            <TouchableOpacity style={styles.offlineBtn} onPress={() => setOfflineModal(true)}>
              <Ionicons name="cash-outline" size={24} color={COLORS.green} style={{ marginRight: 4 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.offlineTxt}>{t('pay_cash')}</Text>
                <Text style={styles.offlineSub}>{t('arrange_offline')}</Text>
              </View>
              <Text style={{ color: COLORS.muted, fontSize: 16 }}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ alignItems: 'center', paddingVertical: 12 }}
              onPress={async () => {
                try {
                  await goHomeAfterAuth();
                  if (mountedRef.current) Toast.show({ type: 'info', text1: t('checking_label') });
                } catch {
                  Toast.show({ type: 'error', text1: t('could_not_check') });
                }
              }}>
              <Text style={{ fontSize: 12, color: COLORS.muted }}>{t('already_paid_check')}</Text>
            </TouchableOpacity>
          </>
        )}

      </ScrollView>

      {/* Offline Payment Modal — Android + Expo Go iOS */}
      {!USE_IAP && (
        <Modal visible={offlineModal} transparent animationType="slide" statusBarTranslucent>
          <Pressable style={styles.modalOverlay} onPress={() => { setOfflineModal(false); setReceiptUri(null); setSubmitError(null); }} />
          <ScrollView style={styles.modalSheet} contentContainerStyle={{ paddingBottom: 36 }} bounces={false}>
            <View style={styles.modalHandle} />

            <Text style={styles.modalTitle}>{t('cash_transfer_title')}</Text>
            <Text style={styles.modalSub}>{t('cash_transfer_sub')}</Text>

            <View style={styles.amountBox}>
              <Text style={styles.amountLabel}>{t('amount_due')}</Text>
              <Text style={styles.amountVal}>EGP {displayPrice.toLocaleString()}</Text>
              <Text style={styles.amountNote}>Monthly plan · {t('standard_pricing')}</Text>
            </View>

            <Text style={styles.detailsHeader}>{t('transfer_to')}</Text>
            {[
              { icon: 'flash-outline',          label: 'Instapay',      value: '01022781113' },
              { icon: 'phone-portrait-outline', label: 'Vodafone Cash', value: '01022781113' },
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

            <Text style={[styles.detailsHeader, { marginTop: 18 }]}>{t('upload_receipt')}</Text>
            <TouchableOpacity style={styles.receiptUploadBtn} onPress={pickReceipt}>
              {receiptUri ? (
                <View style={{ width: '100%', alignItems: 'center' }}>
                  <Text style={{ fontSize: 12, color: '#2e7d5e', fontWeight: '700', marginBottom: 6 }}>✓ {t('upload_receipt')} — tap to change</Text>
                </View>
              ) : (
                <>
                  <Text style={{ fontSize: 24, marginBottom: 6 }}>📎</Text>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.green }}>{t('tap_upload_receipt')}</Text>
                  <Text style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>{t('receipt_screenshot_note')}</Text>
                </>
              )}
            </TouchableOpacity>

            {submitError && (
              <View style={{ backgroundColor: 'rgba(224,85,85,0.12)', borderWidth: 1, borderColor: 'rgba(224,85,85,0.4)', borderRadius: 7, padding: 12, marginBottom: 12 }}>
                <Text style={{ fontSize: 12, color: '#e05555', lineHeight: 17 }}>⚠ {submitError}</Text>
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
      )}
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
  featureRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 5 },
  featureTxt:   { fontSize: 13, color: COLORS.brown },

  // iOS IAP
  iapSection:       { marginBottom: 4 },
  iapBtn:           { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#1c1c1e', borderRadius: 12, paddingVertical: 15, paddingHorizontal: 16, marginBottom: 4 },
  iapBtnIcon:       { fontSize: 22 },
  iapBtnTxt:        { fontFamily: FONTS.bodySemiBold, fontSize: 15, color: '#fff' },
  iapBtnPrice:      { fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  iapUnavailable:   { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 16, marginBottom: 8, alignItems: 'center' },
  restoreLink:      { fontSize: 12, color: COLORS.muted, textDecorationLine: 'underline' },
  iapLegal:         { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12, marginTop: 4, marginBottom: 8 },
  iapLegalTxt:      { fontSize: 10, color: COLORS.muted, lineHeight: 15, textAlign: 'center' },

  // Android coupon
  couponCard:   { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 14, marginBottom: 14 },
  couponLabel:  { fontSize: 11, color: COLORS.muted, marginBottom: 10 },
  couponRow:    { flexDirection: 'row', gap: 8 },
  couponInput:  { flex: 1, backgroundColor: COLORS.cream, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: COLORS.dark, letterSpacing: 1 },
  applyBtn:     { backgroundColor: COLORS.green, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  applyBtnTxt:  { fontFamily: FONTS.bodySemiBold, fontSize: 13, color: '#fff' },
  appliedRow:   { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(46,125,94,0.08)', borderRadius: 8, padding: 10 },

  // Android offline button
  offlineBtn:   { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 8, padding: 14, marginTop: 10 },
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
  detailsHeader: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.2, color: COLORS.muted, marginBottom: 8, fontWeight: '700' },
  detailRow:    { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.cream, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12, marginBottom: 8 },
  nameRow:      { backgroundColor: COLORS.cream, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12, marginBottom: 4 },
  detailLabel:  { fontSize: 10, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
  detailValue:  { fontSize: 15, fontWeight: '700', color: COLORS.dark, letterSpacing: 0.5 },
  receiptUploadBtn: { borderWidth: 1.5, borderStyle: 'dashed', borderColor: COLORS.green, borderRadius: 8, padding: 18, alignItems: 'center', backgroundColor: '#e8f4f1', marginBottom: 16 },
  gotItBtn:     { backgroundColor: COLORS.green, padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 4 },
  gotItTxt:     { fontFamily: FONTS.bodySemiBold, fontSize: 13, color: '#fff', letterSpacing: 0.3 },
});
