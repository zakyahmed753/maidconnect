import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, StatusBar, ActivityIndicator, Linking, AppState
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { paymentsAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import { COLORS, FONTS } from '../../utils/theme';
import Toast from 'react-native-toast-message';

const PLANS = {
  monthly: { label: 'Monthly',  price: 441,  period: '/month' },
  annual:  { label: 'Annual',   price: 3871, period: '/year', badge: 'Save 27%' },
};

const POLL_INTERVAL = 3000; // 3s between checks
const POLL_ATTEMPTS = 20;   // up to 60s total — Paymob can be slow

export default function PaymentScreen({ route, navigation }) {
  const { type, plan, maidProfileId, chatId, amount, maidName, couponCode, discountedAmount } = route.params || {};
  const [loading,  setLoading]  = useState(false);
  const [checking, setChecking] = useState(false);

  const pendingPaymentId = useRef(null);
  const appStateRef      = useRef(AppState.currentState);
  const pollTimer        = useRef(null);
  const completeAuth     = useAuthStore(s => s.completeAuth);
  const user             = useAuthStore(s => s.user);

  const [backendAmount, setBackendAmount] = useState(null);
  const displayAmount = backendAmount || discountedAmount || amount || (plan ? PLANS[plan]?.price : 0);
  const planInfo      = plan ? PLANS[plan] : null;

  // Poll backend until payment is confirmed or all attempts exhausted
  const pollStatus = (paymentId) => {
    let attempts = 0;
    setChecking(true);

    const check = async () => {
      attempts++;
      try {
        const res    = await paymentsAPI.checkStatus(paymentId);
        const status = res.data?.status;

        if (status === 'completed') {
          clearTimeout(pollTimer.current);
          await completeAuth();
          setChecking(false);
          if (type === 'release_fee') {
            navigation.navigate('HiredMaids');
          } else if (user?.role === 'housewife') {
            // customer_subscription or commission — go to Browse
            navigation.navigate('Browse');
          }
          // maid subscription: completeAuth() updates subscription.status → 'active'
          // AppNavigator auto-switches to MaidTabs; no explicit navigate needed
          return;
        }

        if (status === 'failed') {
          clearTimeout(pollTimer.current);
          setChecking(false);
          Toast.show({ type: 'error', text1: 'Payment failed', text2: 'Please try again.' });
          return;
        }

        // Still pending — retry if attempts remain
        if (attempts < POLL_ATTEMPTS) {
          pollTimer.current = setTimeout(check, POLL_INTERVAL);
        } else {
          // Exhausted all attempts — payment may still process via webhook
          setChecking(false);
          Toast.show({
            type: 'info',
            text1: 'Payment is being processed',
            text2: "You'll get a notification once confirmed.",
            visibilityTime: 5000,
          });
        }
      } catch {
        if (attempts < POLL_ATTEMPTS) {
          pollTimer.current = setTimeout(check, POLL_INTERVAL);
        } else {
          setChecking(false);
          Toast.show({ type: 'error', text1: 'Could not verify payment', text2: 'Check your payment history.' });
        }
      }
    };

    check();
  };

  // Detect when user returns from Paymob browser tab
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      const wasBackground = appStateRef.current.match(/inactive|background/);
      appStateRef.current = nextState;

      if (wasBackground && nextState === 'active' && pendingPaymentId.current) {
        const paymentId = pendingPaymentId.current;
        pendingPaymentId.current = null;
        pollStatus(paymentId);
      }
    });

    return () => {
      sub.remove();
      clearTimeout(pollTimer.current);
    };
  }, []);

  const handlePay = async () => {
    setLoading(true);
    try {
      const res = await paymentsAPI.initiatePaymob({ type, plan, maidProfileId, chatId, couponCode });
      const { iframeUrl, paymentId, amount: returnedAmount } = res.data;
      if (returnedAmount) setBackendAmount(returnedAmount);
      pendingPaymentId.current = paymentId;
      await Linking.openURL(iframeUrl);
    } catch (err) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Payment initiation failed' });
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || checking;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.cream }}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#1a1108', '#3d2203']} style={styles.hero}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 22, color: 'rgba(232,201,122,0.6)' }}>←</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 28, marginBottom: 6 }}>💳</Text>
        <Text style={styles.heroTitle}>Complete Payment</Text>
        <Text style={styles.heroSub}>Secured by Paymob · 256-bit SSL</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48 }}>

        {/* Order summary */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Order Summary</Text>
          <View style={styles.row}>
            <Text style={styles.rowKey}>
              {type === 'subscription'
                ? `${planInfo?.label ?? plan} Subscription`
                : type === 'customer_subscription'
                ? 'Customer Platform Subscription'
                : type === 'release_fee'
                ? `Release Fee — ${maidName || 'Maid'}`
                : `Commission — ${maidName || 'Maid'}`}
            </Text>
            {planInfo?.badge && (
              <View style={styles.badge}><Text style={styles.badgeTxt}>{planInfo.badge}</Text></View>
            )}
          </View>
          {couponCode && (
            <View style={styles.row}>
              <Text style={{ fontSize: 12, color: '#2e7d5e' }}>🏷 Coupon: {couponCode}</Text>
              <View style={[styles.badge, { backgroundColor: 'rgba(46,125,94,0.1)' }]}>
                <Text style={[styles.badgeTxt, { color: '#2e7d5e' }]}>Discount applied</Text>
              </View>
            </View>
          )}
          <View style={[styles.row, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Due</Text>
            <Text style={styles.totalAmount}>EGP {displayAmount?.toLocaleString()}</Text>
          </View>
        </View>

        {/* Paymob card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Payment Method</Text>
          <View style={styles.methodRow}>
            <View style={styles.methodIcon}>
              <Text style={{ fontSize: 22 }}>💳</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.methodName}>Credit / Debit Card</Text>
              <Text style={styles.methodDesc}>Visa · Mastercard · Meeza · Fawry</Text>
            </View>
            <Text style={{ color: COLORS.gold, fontSize: 18 }}>✓</Text>
          </View>
          <View style={styles.poweredRow}>
            <Text style={styles.poweredTxt}>Powered by</Text>
            <Text style={[styles.poweredTxt, { color: COLORS.gold, fontWeight: '700' }]}> Paymob</Text>
          </View>
        </View>

        {/* Test mode notice */}
        <View style={styles.testBanner}>
          <Text style={{ fontSize: 14 }}>🧪</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.testTitle}>Sandbox / Test Mode</Text>
            <Text style={styles.testDesc}>Use card 4987654321098769 · 05/21 · CVV 123 · OTP 123456</Text>
          </View>
        </View>

        <View style={styles.secureRow}>
          <Text style={{ fontSize: 13 }}>🔒</Text>
          <Text style={styles.secureTxt}>PCI DSS compliant · Payments processed by Paymob</Text>
        </View>

        {checking ? (
          <View style={styles.checkingBox}>
            <ActivityIndicator color={COLORS.gold} style={{ marginRight: 10 }} />
            <Text style={styles.checkingTxt}>Verifying payment…</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.payBtn, isDisabled && { opacity: 0.6 }]}
            onPress={handlePay}
            disabled={isDisabled}
          >
            {loading
              ? <ActivityIndicator color={COLORS.dark} />
              : <Text style={styles.payBtnTxt}>Pay EGP {displayAmount?.toLocaleString()} →</Text>}
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()} disabled={isDisabled}>
          <Text style={styles.cancelTxt}>Cancel</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero:        { paddingHorizontal: 20, paddingTop: 54, paddingBottom: 22 },
  heroTitle:   { fontFamily: FONTS.display, fontSize: 24, color: '#fff8ee', marginBottom: 4 },
  heroSub:     { fontSize: 12, color: 'rgba(232,201,122,0.55)' },
  card:        { backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 8, padding: 16, marginBottom: 14 },
  cardLabel:   { fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: COLORS.muted, fontFamily: FONTS.bodySemiBold, marginBottom: 12 },
  row:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
  rowKey:      { fontSize: 14, color: COLORS.text, flex: 1 },
  badge:       { backgroundColor: '#e8f5e9', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  badgeTxt:    { fontSize: 10, color: '#2e7d32', fontWeight: '700' },
  totalRow:    { borderTopWidth: 1, borderTopColor: COLORS.border, marginTop: 8, paddingTop: 12 },
  totalLabel:  { fontSize: 14, fontWeight: '700', color: COLORS.dark },
  totalAmount: { fontFamily: FONTS.display, fontSize: 22, color: COLORS.gold },
  methodRow:   { flexDirection: 'row', alignItems: 'center', gap: 12 },
  methodIcon:  { width: 42, height: 42, backgroundColor: '#f4ede0', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  methodName:  { fontSize: 14, fontWeight: '600', color: COLORS.dark },
  methodDesc:  { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  poweredRow:  { flexDirection: 'row', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.border },
  poweredTxt:  { fontSize: 11, color: COLORS.muted },
  testBanner:  { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#fffbeb', borderWidth: 1, borderColor: '#f59e0b', borderRadius: 7, padding: 12, marginBottom: 14 },
  testTitle:   { fontSize: 12, fontWeight: '700', color: '#92400e', marginBottom: 2 },
  testDesc:    { fontSize: 11, color: '#78350f', lineHeight: 16 },
  secureRow:   { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 18 },
  secureTxt:   { fontSize: 11, color: COLORS.muted, flex: 1 },
  checkingBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 6, padding: 16, marginBottom: 10 },
  checkingTxt: { fontSize: 14, color: COLORS.muted, fontFamily: FONTS.bodySemiBold },
  payBtn:      { backgroundColor: COLORS.gold, padding: 16, borderRadius: 6, alignItems: 'center', marginBottom: 10 },
  payBtnTxt:   { fontFamily: FONTS.bodySemiBold, fontSize: 15, color: COLORS.dark, letterSpacing: 0.5 },
  cancelBtn:   { alignItems: 'center', padding: 12 },
  cancelTxt:   { fontSize: 13, color: COLORS.muted },
});
