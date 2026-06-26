// src/screens/auth/OTPVerificationScreen.js
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { authAPI } from '../../services/api';
import { COLORS, FONTS } from '../../utils/theme';
import BackChevron from '../../components/BackChevron';

export default function OTPVerificationScreen({ navigation, route }) {
  const { email, onVerified } = route.params || {};
  const [otp, setOtp]           = useState(['', '', '', '', '', '']);
  const [loading, setLoading]   = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputs = useRef([]);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => { if (mountedRef.current) setCountdown(c => c - 1); }, 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleChange = (text, idx) => {
    const digits = text.replace(/[^0-9]/g, '');
    if (!digits && !otp[idx]) return;
    const next = [...otp];
    if (digits.length > 1) {
      // Handle paste of full code
      const arr = digits.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) next[i] = arr[i] || '';
      setOtp(next);
      inputs.current[5]?.focus();
      return;
    }
    next[idx] = digits;
    setOtp(next);
    if (digits && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handleKeyPress = (e, idx) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[idx] && idx > 0) {
      const next = [...otp];
      next[idx - 1] = '';
      setOtp(next);
      inputs.current[idx - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) return Toast.show({ type: 'error', text1: 'Enter the 6-digit code' });
    setLoading(true);
    try {
      await authAPI.verifyOTP({ email, otp: code });
      Toast.show({ type: 'success', text1: 'Email verified!' });
      if (onVerified) onVerified();
    } catch (err) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Invalid code' });
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setResending(true);
    try {
      await authAPI.resendOTP({ email });
      Toast.show({ type: 'success', text1: 'New code sent to your email' });
      if (mountedRef.current) setCountdown(60);
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed to resend — try again' });
    } finally {
      if (mountedRef.current) setResending(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content"/>
      <LinearGradient colors={['#0D3827', '#0d5e4a']} style={styles.hero}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ width:38, height:38, borderRadius:19, backgroundColor:'rgba(255,255,255,0.2)', alignItems:'center', justifyContent:'center', marginBottom:12 }}>
          <BackChevron />
        </TouchableOpacity>
        <Text style={styles.heroTitle}>Verify Email</Text>
        <Text style={styles.heroSub}>We sent a 6-digit code to{'\n'}<Text style={{ color: '#fff' }}>{email}</Text></Text>
      </LinearGradient>

      <View style={styles.body}>
        <View style={styles.otpRow}>
          {otp.map((digit, idx) => (
            <TextInput
              key={idx}
              ref={r => { inputs.current[idx] = r; }}
              style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
              value={digit}
              onChangeText={t => handleChange(t, idx)}
              onKeyPress={e => handleKeyPress(e, idx)}
              keyboardType="number-pad"
              maxLength={6}
              selectTextOnFocus
              textAlign="center"
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleVerify}
          disabled={loading}>
          <Text style={styles.btnTxt}>{loading ? 'Verifying...' : 'Verify Email'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.resendBtn, countdown > 0 && styles.resendDisabled]}
          onPress={handleResend}
          disabled={countdown > 0 || resending}>
          <Text style={styles.resendTxt}>
            {countdown > 0
              ? `Resend code in ${countdown}s`
              : resending ? 'Sending...' : 'Resend code'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  hero:         { padding: 24, paddingTop: 54, paddingBottom: 28 },
  heroTitle:    { fontFamily: FONTS.display, fontSize: 30, color: '#fff', marginBottom: 8 },
  heroSub:      { fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 20 },
  body:         { flex: 1, backgroundColor: COLORS.cream, padding: 28, alignItems: 'center' },
  otpRow:       { flexDirection: 'row', gap: 10, marginTop: 32, marginBottom: 32 },
  otpBox:       { width: 46, height: 56, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 8, fontSize: 22, fontWeight: '700', color: COLORS.dark, backgroundColor: COLORS.surface },
  otpBoxFilled: { borderColor: COLORS.green, backgroundColor: '#e8f4f1' },
  btn:          { backgroundColor: COLORS.green, padding: 15, borderRadius: 5, alignItems: 'center', width: '100%' },
  btnDisabled:  { opacity: 0.5 },
  btnTxt:       { fontFamily: FONTS.bodySemiBold, fontSize: 14, color: '#fff', letterSpacing: 0.5 },
  resendBtn:    { marginTop: 20 },
  resendDisabled: { opacity: 0.4 },
  resendTxt:    { fontSize: 13, color: COLORS.green, fontFamily: FONTS.bodySemiBold },
});
