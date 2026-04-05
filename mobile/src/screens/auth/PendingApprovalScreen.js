// src/screens/auth/PendingApprovalScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator, BackHandler } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { maidsAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import { COLORS, FONTS } from '../../utils/theme';
import { useTranslation } from '../../utils/i18n';

const POLL_INTERVAL = 30000;

export default function PendingApprovalScreen({ navigation }) {
  const { t } = useTranslation();
  const [status, setStatus] = useState('pending');
  const [note, setNote]     = useState('');
  const [checking, setChecking] = useState(false);
  const completeAuth = useAuthStore(s => s.completeAuth);
  const timerRef = useRef(null);

  const checkStatus = async () => {
    setChecking(true);
    try {
      const res = await maidsAPI.getMyProfile();
      const maid = res.data.maid;
      const verif    = maid?.verificationStatus;
      const approval = maid?.approvalStatus;
      const n        = maid?.verificationNote || maid?.approvalNote || '';

      const isApproved = verif === 'verified' || approval === 'approved';
      const isRejected = verif === 'rejected';

      setNote(n);
      if (isApproved) {
        setStatus('verified');
        clearInterval(timerRef.current);
        navigation.navigate('Subscription');
      } else if (isRejected) {
        setStatus('rejected');
        clearInterval(timerRef.current);
      } else {
        setStatus('pending');
      }
    } catch {
      const Toast = require('react-native-toast-message').default;
      Toast.show({ type: 'error', text1: 'Could not reach server. Try again.' });
    } finally { setChecking(false); }
  };

  useEffect(() => {
    checkStatus();
    timerRef.current = setInterval(checkStatus, POLL_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  const STATUS_CONFIG = {
    pending:  { icon:'⏳', title: t('under_review'),   subtitle: t('review_sub'),   color: COLORS.gold,   bg:'#1a1108' },
    verified: { icon:'✅', title: t('verified_title'), subtitle: t('verified_sub'), color: '#5dd6a8',     bg:'#0a1a0f' },
    rejected: { icon:'❌', title: t('rejected_title'), subtitle: note || t('rejected_sub'), color:'#f87171', bg:'#1a0808' },
  };

  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  const STEPS = [
    { label: 'Profile created',             done: true },
    { label: 'Passport & selfie submitted', done: true },
    { label: 'Identity review (24 hrs)',    done: false, active: true },
    { label: 'Subscription & payment',     done: false },
  ];

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content"/>
      <LinearGradient colors={[cfg.bg, '#1a1108']} style={styles.container}>
        <Text style={styles.appName}>Servix</Text>
        <Text style={{ fontSize: 64, marginBottom: 16 }}>{cfg.icon}</Text>
        <Text style={[styles.title, { color: cfg.color }]}>{cfg.title}</Text>
        <Text style={styles.subtitle}>{cfg.subtitle}</Text>

        {status === 'pending' && (
          <View style={styles.stepsBox}>
            {STEPS.map((s, i) => (
              <View key={i} style={styles.stepRow}>
                <View style={[styles.stepDot,
                  s.done   && { backgroundColor: '#5dd6a8' },
                  s.active && { backgroundColor: COLORS.gold },
                  !s.done && !s.active && { backgroundColor: 'rgba(255,255,255,0.1)' }
                ]}>
                  <Text style={{ fontSize: 10, color: '#fff' }}>{s.done ? '✓' : s.active ? '●' : String(i+1)}</Text>
                </View>
                <Text style={[styles.stepLabel, (s.done || s.active) && { color: '#fff8ee' }]}>{s.label}</Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.checkBtn} onPress={checkStatus} disabled={checking}>
          {checking
            ? <ActivityIndicator color={COLORS.dark} size="small"/>
            : <Text style={styles.checkBtnTxt}>{t('check_status')}</Text>}
        </TouchableOpacity>

        {status === 'verified' && (
          <TouchableOpacity style={styles.proceedBtn} onPress={() => navigation.navigate('Subscription')}>
            <Text style={styles.proceedBtnTxt}>{t('choose_subscription')}</Text>
          </TouchableOpacity>
        )}

        {status === 'rejected' && (
          <TouchableOpacity style={styles.resubmitBtn} onPress={() => navigation.navigate('SelfieVerification', {})}>
            <Text style={styles.resubmitBtnTxt}>{t('resubmit')}</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.hint}>{status === 'pending' ? t('auto_check') : ''}</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  appName:       { fontFamily: FONTS.display, fontSize: 14, color: 'rgba(232,201,122,0.4)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 24 },
  title:         { fontFamily: FONTS.display, fontSize: 28, textAlign: 'center', marginBottom: 10 },
  subtitle:      { fontSize: 13, color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 20, marginBottom: 28, maxWidth: 300 },
  stepsBox:      { width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 16, marginBottom: 24 },
  stepRow:       { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  stepDot:       { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  stepLabel:     { fontSize: 13, color: 'rgba(255,255,255,0.35)' },
  checkBtn:      { backgroundColor: COLORS.gold, paddingHorizontal: 28, paddingVertical: 13, borderRadius: 5, marginBottom: 12, minWidth: 160, alignItems: 'center' },
  checkBtnTxt:   { fontFamily: FONTS.bodySemiBold, fontSize: 14, color: COLORS.dark },
  proceedBtn:    { backgroundColor: '#2e7d5e', paddingHorizontal: 28, paddingVertical: 13, borderRadius: 5, marginBottom: 12 },
  proceedBtnTxt: { fontFamily: FONTS.bodySemiBold, fontSize: 14, color: '#fff' },
  resubmitBtn:   { borderWidth: 1.5, borderColor: 'rgba(232,201,122,0.35)', paddingHorizontal: 28, paddingVertical: 13, borderRadius: 5, marginBottom: 12 },
  resubmitBtnTxt:{ fontSize: 14, color: '#e8c97a' },
  hint:          { fontSize: 11, color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: 10 },
});
