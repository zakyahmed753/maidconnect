// src/screens/auth/LoginScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import useAuthStore from '../../store/authStore';
import { COLORS, FONTS } from '../../utils/theme';
import { useTranslation } from '../../utils/i18n';

export default function LoginScreen({ navigation, route }) {
  const role = route?.params?.role || 'housewife';
  const { t } = useTranslation();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const login = useAuthStore(s => s.login);

  const handleLogin = async () => {
    if (!email || !password) return Toast.show({ type:'error', text1: t('fill_required') });
    setLoading(true);
    try {
      await login(email, password);
      Toast.show({ type:'success', text1:'Welcome back! 👋' });
    } catch (err) {
      Toast.show({ type:'error', text1: err.response?.data?.message || 'Login failed' });
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS==='ios'?'padding':undefined}>
      <StatusBar barStyle="light-content"/>
      <LinearGradient colors={['#1a1108','#3d2203']} style={styles.hero}>
        <Text style={styles.heroTitle}>Welcome Back</Text>
        <Text style={styles.heroSub}>{role === 'maid' ? t('login_maid') : t('login_hw')}</Text>
      </LinearGradient>
      <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>{t('email')}</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail}
          placeholder="you@email.com" placeholderTextColor={COLORS.muted}
          keyboardType="email-address" autoCapitalize="none"/>
        <Text style={styles.label}>{t('password')}</Text>
        <TextInput style={styles.input} value={password} onChangeText={setPassword}
          placeholder="••••••••" placeholderTextColor={COLORS.muted} secureTextEntry/>
        <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleLogin} disabled={loading}>
          <Text style={styles.btnTxt}>{loading ? t('loading') : t('sign_in')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.link} onPress={() => navigation.navigate(role === 'maid' ? 'Register' : 'RegisterHousewife')}>
          <Text style={styles.linkTxt}>{t('no_account')} <Text style={{ color:COLORS.gold }}>{t('sign_up_link')}</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  hero:       { padding:28, paddingTop:60, paddingBottom:28 },
  heroTitle:  { fontFamily:FONTS.display, fontSize:30, color:'#e8c97a' },
  heroSub:    { fontSize:13, color:'rgba(232,201,122,0.5)', marginTop:4 },
  body:       { flex:1, backgroundColor:COLORS.cream, padding:22 },
  label:      { fontSize:10, letterSpacing:1.2, textTransform:'uppercase', color:COLORS.muted, marginBottom:5, marginTop:14, fontFamily:FONTS.bodySemiBold },
  input:      { borderWidth:1.5, borderColor:COLORS.border, borderRadius:5, padding:13, fontSize:14, color:COLORS.text, backgroundColor:COLORS.surface, fontFamily:FONTS.body },
  btn:        { backgroundColor:COLORS.gold, padding:15, borderRadius:5, alignItems:'center', marginTop:22 },
  btnDisabled:{ opacity:0.5 },
  btnTxt:     { fontFamily:FONTS.bodySemiBold, fontSize:14, color:COLORS.dark, letterSpacing:0.5 },
  link:       { alignItems:'center', marginTop:18 },
  linkTxt:    { fontSize:13, color:COLORS.muted },
});
