import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  ActivityIndicator, Share, Clipboard, Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { couponsAPI } from '../../services/api';
import { COLORS, FONTS } from '../../utils/theme';
import Toast from 'react-native-toast-message';

const APP_STORE_LINK = 'https://servix.world';

export default function CouponScreen({ navigation }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      couponsAPI.getMyCode()
        .then(r => setData(r.data))
        .catch(() => Toast.show({ type: 'error', text1: 'Failed to load referral code' }))
        .finally(() => setLoading(false));
    }, [])
  );

  const handleCopy = () => {
    Clipboard.setString(data?.referralCode || '');
    Toast.show({ type: 'success', text1: 'Code copied!', text2: 'Share it with other maids.' });
  };

  const handleShare = async () => {
    const code = data?.referralCode || '';
    const discount = data?.discountOffered || 15;
    try {
      await Share.share({
        message:
          `Join Servix and find domestic work opportunities!\n\n` +
          `Use my referral code: ${code}\n` +
          `You'll get ${discount}% off your first subscription!\n\n` +
          `Download the app: ${APP_STORE_LINK}`,
        title: 'Join Servix with my referral code',
      });
    } catch {}
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.cream, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.gold} />
      </View>
    );
  }

  const code     = data?.referralCode   || '—';
  const count    = data?.referralCount  || 0;
  const discount = data?.discountOffered || 15;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.cream }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 22, color: 'rgba(232,201,122,0.6)' }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Referral & Coupons 🎁</Text>
        <Text style={styles.headerSub}>Earn rewards by inviting other maids</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

        {/* Code card */}
        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>YOUR REFERRAL CODE</Text>
          <Text style={styles.code}>{code}</Text>
          <Text style={styles.codeDesc}>
            Share this code with other maids. They get{' '}
            <Text style={{ fontWeight: '700', color: COLORS.gold }}>{discount}% off</Text>{' '}
            their first subscription — and you earn a referral credit!
          </Text>
          <View style={styles.codeActions}>
            <TouchableOpacity style={styles.copyBtn} onPress={handleCopy}>
              <Text style={styles.copyBtnTxt}>📋 Copy Code</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <Text style={styles.shareBtnTxt}>📤 Share App</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{count}</Text>
            <Text style={styles.statLbl}>Maids Referred</Text>
          </View>
          <View style={[styles.statBox, { borderLeftWidth: 1, borderLeftColor: COLORS.border }]}>
            <Text style={styles.statNum}>{discount}%</Text>
            <Text style={styles.statLbl}>Discount You Give</Text>
          </View>
        </View>

        {/* How it works */}
        <View style={styles.howCard}>
          <Text style={styles.howTitle}>How it works</Text>
          {[
            { icon: '1️⃣', text: 'Share your code with a maid friend' },
            { icon: '2️⃣', text: `She enters your code and gets ${discount}% off her first subscription` },
            { icon: '3️⃣', text: 'You earn a referral credit — admin will apply it to your next renewal' },
          ].map(({ icon, text }) => (
            <View key={icon} style={styles.howRow}>
              <Text style={{ fontSize: 18 }}>{icon}</Text>
              <Text style={styles.howTxt}>{text}</Text>
            </View>
          ))}
        </View>

        {/* Info */}
        <View style={styles.infoBox}>
          <Text style={{ fontSize: 12, color: COLORS.muted, lineHeight: 19 }}>
            💡 <Text style={{ fontWeight: '700', color: COLORS.dark }}>Note:</Text>{' '}
            Referral credits are reviewed and applied manually by admin. You'll receive a
            notification each time someone subscribes using your code.
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header:       { backgroundColor: '#3d2203', padding: 20, paddingTop: 54 },
  headerTitle:  { fontFamily: FONTS.display, fontSize: 24, color: '#fff8ee', marginTop: 10 },
  headerSub:    { fontSize: 11, color: 'rgba(232,201,122,0.45)', marginTop: 2 },

  codeCard:     { backgroundColor: '#fff', borderRadius: 14, padding: 20, marginBottom: 14, borderWidth: 1.5, borderColor: COLORS.gold, alignItems: 'center' },
  codeLabel:    { fontSize: 10, letterSpacing: 1.5, color: COLORS.muted, fontWeight: '700', marginBottom: 10 },
  code:         { fontFamily: FONTS.display, fontSize: 34, color: COLORS.dark, letterSpacing: 4, marginBottom: 10 },
  codeDesc:     { fontSize: 12, color: COLORS.muted, textAlign: 'center', lineHeight: 18, marginBottom: 16 },
  codeActions:  { flexDirection: 'row', gap: 10 },
  copyBtn:      { flex: 1, backgroundColor: '#f4ede0', paddingVertical: 11, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  copyBtnTxt:   { fontSize: 13, fontWeight: '600', color: COLORS.dark },
  shareBtn:     { flex: 1, backgroundColor: COLORS.gold, paddingVertical: 11, borderRadius: 8, alignItems: 'center' },
  shareBtnTxt:  { fontSize: 13, fontWeight: '700', color: COLORS.dark },

  statsRow:     { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, marginBottom: 14, overflow: 'hidden' },
  statBox:      { flex: 1, padding: 16, alignItems: 'center' },
  statNum:      { fontFamily: FONTS.display, fontSize: 28, color: COLORS.gold },
  statLbl:      { fontSize: 11, color: COLORS.muted, marginTop: 2, textAlign: 'center' },

  howCard:      { backgroundColor: '#fff', borderRadius: 10, padding: 16, borderWidth: 1, borderColor: COLORS.border, marginBottom: 14 },
  howTitle:     { fontFamily: FONTS.display, fontSize: 17, color: COLORS.dark, marginBottom: 12 },
  howRow:       { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  howTxt:       { fontSize: 13, color: COLORS.text, flex: 1, lineHeight: 19 },

  infoBox:      { backgroundColor: '#fffcf5', borderWidth: 1, borderColor: '#f0e8d8', borderRadius: 8, padding: 14 },
});
