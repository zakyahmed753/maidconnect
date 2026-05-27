import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, StatusBar, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { COLORS, FONTS } from '../../utils/theme';
import useAuthStore from '../../store/authStore';
import { useTranslation } from '../../utils/i18n';
import { maidsAPI, couponsAPI } from '../../services/api';

function getMaidPrice(nationality = '') {
  const n = nationality.toLowerCase();
  if (n.includes('philip') || n.includes('filip')) return 1000;
  if (n.includes('indonesia') || n.includes('ethiopia')) return 800;
  return 500;
}

export default function SubscriptionScreen({ navigation }) {
  const { t } = useTranslation();
  const completeAuth = useAuthStore(s => s.completeAuth);
  const { profile } = useAuthStore();
  const [skipping, setSkipping]           = useState(false);
  const [nationality, setNationality]     = useState(profile?.nationality || '');

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
    useAuthStore.setState({
      token,
      user: store.user,
      profile: store.profile
        ? { ...store.profile, verificationStatus: 'verified', approvalStatus: 'approved' }
        : { verificationStatus: 'verified', approvalStatus: 'approved' },
    });
    setSkipping(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#1a1108', '#3d2203']} style={styles.hero}>
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

        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip} disabled={skipping}>
          {skipping
            ? <ActivityIndicator size="small" color={COLORS.muted} />
            : <Text style={styles.skipTxt}>{t('skip_dev')}</Text>}
        </TouchableOpacity>
      </ScrollView>
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
});
