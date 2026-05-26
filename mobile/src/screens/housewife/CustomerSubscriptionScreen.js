import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, StatusBar, ActivityIndicator, Linking, AppState } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { paymentsAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import { COLORS, FONTS } from '../../utils/theme';
import Toast from 'react-native-toast-message';

const POLL_INTERVAL = 2000;
const POLL_ATTEMPTS = 8;

export default function CustomerSubscriptionScreen({ route, navigation }) {
  const { maidUserId, maidProfileId, maidName, chatTarget } = route.params || {};
  const [loading,  setLoading]  = useState(false);
  const [checking, setChecking] = useState(false);

  const pendingPaymentId = useRef(null);
  const appStateRef      = useRef(AppState.currentState);
  const pollTimer        = useRef(null);
  const completeAuth     = useAuthStore(s => s.completeAuth);

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
          // After subscription is active, open the chat
          if (maidUserId) {
            const { chatsAPI } = require('../../services/api');
            const chatRes = await chatsAPI.startChat({ maidUserId, maidProfileId });
            setChecking(false);
            navigation.replace('Chat', { chatId: chatRes.data.chat._id, maidName });
          } else {
            setChecking(false);
            navigation.goBack();
          }
          return;
        }
        if (status === 'failed') {
          clearTimeout(pollTimer.current);
          setChecking(false);
          Toast.show({ type: 'error', text1: 'Payment failed', text2: 'Please try again.' });
          return;
        }
        if (attempts < POLL_ATTEMPTS) {
          pollTimer.current = setTimeout(check, POLL_INTERVAL);
        } else {
          setChecking(false);
          Toast.show({ type: 'info', text1: 'Payment is being processed', text2: "You'll get a notification once confirmed.", visibilityTime: 5000 });
        }
      } catch {
        if (attempts < POLL_ATTEMPTS) {
          pollTimer.current = setTimeout(check, POLL_INTERVAL);
        } else {
          setChecking(false);
          Toast.show({ type: 'error', text1: 'Could not verify payment' });
        }
      }
    };
    check();
  };

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
    return () => { sub.remove(); clearTimeout(pollTimer.current); };
  }, []);

  const handlePay = async () => {
    setLoading(true);
    try {
      const res = await paymentsAPI.initiatePaymob({ type: 'customer_subscription' });
      const { iframeUrl, paymentId } = res.data;
      pendingPaymentId.current = paymentId;
      await Linking.openURL(iframeUrl);
    } catch (err) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Payment initiation failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.cream }}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#1a1108', '#3d2203']} style={styles.hero}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 22, color: 'rgba(232,201,122,0.6)' }}>←</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 32, marginBottom: 6 }}>💬</Text>
        <Text style={styles.heroTitle}>Unlock Chat Access</Text>
        <Text style={styles.heroSub}>Subscribe to start chatting with maids</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48 }}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>What You Get</Text>
          {[
            ['💬', 'Chat with any maid on the platform'],
            ['📋', 'Full profile access & references'],
            ['🤝', 'Complete hiring process in-app'],
            ['⭐', 'Leave reviews after hiring'],
            ['🔄', "Free replacement if maid doesn't fit (within 3 days)"],
          ].map(([icon, text]) => (
            <View key={text} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
              <Text style={{ fontSize: 18 }}>{icon}</Text>
              <Text style={{ fontSize: 13, color: COLORS.text, flex: 1 }}>{text}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.card, { alignItems: 'center', paddingVertical: 24 }]}>
          <Text style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Monthly Subscription</Text>
          <Text style={{ fontFamily: FONTS.display, fontSize: 40, color: COLORS.gold }}>EGP 1,000</Text>
          <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 4 }}>per month · cancel anytime</Text>
        </View>

        {checking ? (
          <View style={styles.checkingBox}>
            <ActivityIndicator color={COLORS.gold} style={{ marginRight: 10 }} />
            <Text style={styles.checkingTxt}>Verifying payment…</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.payBtn, loading && { opacity: 0.6 }]}
            onPress={handlePay}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={COLORS.dark} />
              : <Text style={styles.payBtnTxt}>Subscribe — EGP 1,000/mo →</Text>}
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelTxt}>Maybe later</Text>
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
  checkingBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 6, padding: 16, marginBottom: 10 },
  checkingTxt: { fontSize: 14, color: COLORS.muted },
  payBtn:      { backgroundColor: COLORS.gold, padding: 16, borderRadius: 6, alignItems: 'center', marginBottom: 10 },
  payBtnTxt:   { fontFamily: FONTS.bodySemiBold, fontSize: 15, color: COLORS.dark, letterSpacing: 0.5 },
  cancelBtn:   { alignItems: 'center', padding: 12 },
  cancelTxt:   { fontSize: 13, color: COLORS.muted },
});
