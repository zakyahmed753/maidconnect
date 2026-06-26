// src/screens/auth/ResetPasswordScreen.js
import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { authAPI } from '../../services/api';
import { COLORS, FONTS } from '../../utils/theme';
import BackChevron from '../../components/BackChevron';

export default function ResetPasswordScreen({ navigation, route }) {
  const { email: initialEmail = '' } = route.params || {};
  const [email, setEmail]         = useState(initialEmail);
  const [code, setCode]           = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [loading, setLoading]     = useState(false);
  const [showPass, setShowPass]   = useState(false);
  const mountedRef = useRef(true);

  React.useEffect(() => { return () => { mountedRef.current = false; }; }, []);

  const handleReset = async () => {
    if (!email.trim()) return Toast.show({ type: 'error', text1: 'Enter your email' });
    if (code.length < 6) return Toast.show({ type: 'error', text1: 'Enter the 6-digit reset code' });
    if (password.length < 6) return Toast.show({ type: 'error', text1: 'Password must be at least 6 characters' });
    if (password !== confirm) return Toast.show({ type: 'error', text1: 'Passwords do not match' });

    setLoading(true);
    try {
      await authAPI.resetPassword({
        email: email.trim().toLowerCase(),
        code: code.trim(),
        newPassword: password,
      });
      Toast.show({ type: 'success', text1: 'Password reset! Please log in.' });
      navigation.navigate('Login');
    } catch (err) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Reset failed — check your code' });
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content"/>
      <LinearGradient colors={['#0D3827', '#0d5e4a']} style={styles.hero}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ width:38, height:38, borderRadius:19, backgroundColor:'rgba(255,255,255,0.2)', alignItems:'center', justifyContent:'center', marginBottom:12 }}>
          <BackChevron />
        </TouchableOpacity>
        <Text style={styles.heroTitle}>Reset Password</Text>
        <Text style={styles.heroSub}>Enter the 6-digit code from your email and your new password.</Text>
      </LinearGradient>

      <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
        {!initialEmail && (
          <>
            <Text style={styles.label}>EMAIL ADDRESS</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail}
              placeholder="you@email.com" placeholderTextColor={COLORS.muted}
              keyboardType="email-address" autoCapitalize="none"/>
          </>
        )}

        <Text style={styles.label}>RESET CODE</Text>
        <TextInput
          style={[styles.input, styles.codeInput]}
          value={code}
          onChangeText={t => setCode(t.replace(/[^0-9]/g, '').slice(0, 6))}
          placeholder="6-digit code"
          placeholderTextColor={COLORS.muted}
          keyboardType="number-pad"
          maxLength={6}
        />

        <Text style={styles.label}>NEW PASSWORD</Text>
        <View style={styles.passRow}>
          <TextInput style={[styles.input, { flex: 1 }]} value={password} onChangeText={setPassword}
            placeholder="Min. 6 characters" placeholderTextColor={COLORS.muted}
            secureTextEntry={!showPass}/>
          <TouchableOpacity onPress={() => setShowPass(s => !s)} style={styles.eyeBtn}>
            <Text style={{ fontSize: 18 }}>{showPass ? 'ðŸ™ˆ' : 'ðŸ‘'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>CONFIRM PASSWORD</Text>
        <TextInput style={styles.input} value={confirm} onChangeText={setConfirm}
          placeholder="Repeat password" placeholderTextColor={COLORS.muted}
          secureTextEntry={!showPass}/>

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleReset}
          disabled={loading}>
          <Text style={styles.btnTxt}>{loading ? 'Resetting...' : 'Reset Password'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.linkTxt}>Didn't get a code? <Text style={{ color: COLORS.green }}>Resend</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  hero:        { padding: 24, paddingTop: 54, paddingBottom: 28 },
  heroTitle:   { fontFamily: FONTS.display, fontSize: 30, color: '#fff', marginBottom: 8 },
  heroSub:     { fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 20 },
  body:        { flex: 1, backgroundColor: COLORS.cream, padding: 22 },
  label:       { fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: COLORS.muted, marginBottom: 5, marginTop: 16, fontFamily: FONTS.bodySemiBold },
  input:       { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 5, padding: 13, fontSize: 14, color: COLORS.text, backgroundColor: COLORS.surface },
  codeInput:   { fontSize: 22, fontWeight: '700', letterSpacing: 8, textAlign: 'center' },
  passRow:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyeBtn:      { padding: 13, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 5, backgroundColor: COLORS.surface },
  btn:         { backgroundColor: COLORS.green, padding: 15, borderRadius: 5, alignItems: 'center', marginTop: 24 },
  btnDisabled: { opacity: 0.5 },
  btnTxt:      { fontFamily: FONTS.bodySemiBold, fontSize: 14, color: '#fff', letterSpacing: 0.5 },
  link:        { alignItems: 'center', marginTop: 18, marginBottom: 30 },
  linkTxt:     { fontSize: 13, color: COLORS.muted },
});
