// src/screens/auth/ForgotPasswordScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { authAPI } from '../../services/api';
import { COLORS, FONTS } from '../../utils/theme';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!email.trim()) return Toast.show({ type: 'error', text1: 'Enter your email address' });
    setLoading(true);
    try {
      await authAPI.forgotPassword({ email: email.trim().toLowerCase() });
      Toast.show({ type: 'success', text1: 'Reset code sent — check your email' });
      navigation.navigate('ResetPassword', { email: email.trim().toLowerCase() });
    } catch (err) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Failed to send reset code' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content"/>
      <LinearGradient colors={['#1a1108', '#3d2203']} style={styles.hero}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 22, color: 'rgba(232,201,122,0.6)' }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.heroTitle}>Forgot Password</Text>
        <Text style={styles.heroSub}>Enter your email and we'll send you a 6-digit reset code.</Text>
      </LinearGradient>

      <View style={styles.body}>
        <Text style={styles.label}>EMAIL ADDRESS</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="you@email.com"
          placeholderTextColor={COLORS.muted}
          keyboardType="email-address"
          autoCapitalize="none"
          autoFocus
        />
        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleSend}
          disabled={loading}>
          <Text style={styles.btnTxt}>{loading ? 'Sending...' : 'Send Reset Code'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('ResetPassword', { email: '' })}>
          <Text style={styles.linkTxt}>Already have a code? <Text style={{ color: COLORS.gold }}>Enter it here</Text></Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  hero:        { padding: 24, paddingTop: 54, paddingBottom: 28 },
  heroTitle:   { fontFamily: FONTS.display, fontSize: 30, color: '#e8c97a', marginBottom: 8 },
  heroSub:     { fontSize: 13, color: 'rgba(232,201,122,0.6)', lineHeight: 20 },
  body:        { flex: 1, backgroundColor: COLORS.cream, padding: 22 },
  label:       { fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: COLORS.muted, marginBottom: 5, marginTop: 20, fontFamily: FONTS.bodySemiBold },
  input:       { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 5, padding: 13, fontSize: 14, color: COLORS.text, backgroundColor: COLORS.surface },
  btn:         { backgroundColor: COLORS.gold, padding: 15, borderRadius: 5, alignItems: 'center', marginTop: 22 },
  btnDisabled: { opacity: 0.5 },
  btnTxt:      { fontFamily: FONTS.bodySemiBold, fontSize: 14, color: COLORS.dark, letterSpacing: 0.5 },
  link:        { alignItems: 'center', marginTop: 18 },
  linkTxt:     { fontSize: 13, color: COLORS.muted },
});
