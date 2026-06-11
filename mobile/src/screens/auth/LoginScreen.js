// src/screens/auth/LoginScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import Toast from 'react-native-toast-message';
import useAuthStore from '../../store/authStore';
import { COLORS, FONTS } from '../../utils/theme';
import { useTranslation } from '../../utils/i18n';

const BIOMETRIC_KEY = 'biometric_credentials';

export default function LoginScreen({ navigation, route }) {
  const initialRole = route?.params?.role || 'housewife';
  const { t } = useTranslation();
  const [role, setRole]               = useState(initialRole);
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [loading, setLoading]         = useState(false);
  const [biometricReady, setBiometricReady] = useState(false);
  const [biometricType, setBiometricType]   = useState(null);
  const mountedRef = useRef(true);
  const login = useAuthStore(s => s.login);

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    checkAndTriggerBiometric();
  }, []);

  const checkAndTriggerBiometric = async () => {
    try {
      const hasHw   = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHw || !enrolled) return;

      const saved = await SecureStore.getItemAsync(BIOMETRIC_KEY);
      if (!saved) return;

      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      const hasFace        = types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
      const hasFingerprint = types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT);

      let bType = null;
      if (Platform.OS === 'ios') {
        bType = hasFace ? 'faceid' : null;
      } else {
        bType = hasFace ? 'faceid' : hasFingerprint ? 'fingerprint' : null;
      }
      if (!bType) return;

      if (mountedRef.current) {
        setBiometricType(bType);
        setBiometricReady(true);
      }

      // Auto-trigger biometric prompt on open, just like banking apps
      await triggerBiometric();
    } catch { /* hardware not available */ }
  };

  const triggerBiometric = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Log in to Servix',
        fallbackLabel: 'Use password',
        disableDeviceFallback: false,
      });

      if (!result.success) return; // cancelled or failed — stay on login form

      const savedJson = await SecureStore.getItemAsync(BIOMETRIC_KEY);
      if (!savedJson) {
        if (mountedRef.current) setBiometricReady(false);
        return;
      }

      const { email: savedEmail, password: savedPass, role: savedRole } = JSON.parse(savedJson);
      if (!mountedRef.current) return;

      setLoading(true);
      try {
        await login(savedEmail, savedPass, savedRole);
        // authStore triggers navigation automatically — no navigate() needed
      } catch (err) {
        if (!mountedRef.current) return;
        Toast.show({ type: 'error', text1: 'Biometric login failed — please use password' });
        // Clear stale credentials so button hides until next manual login
        await SecureStore.deleteItemAsync(BIOMETRIC_KEY);
        setBiometricReady(false);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    } catch { /* system cancelled */ }
  };

  const handleLogin = async () => {
    if (!email || !password) return Toast.show({ type: 'error', text1: t('fill_required') });
    setLoading(true);
    try {
      await login(email, password, role);
      // Save credentials for biometric on next open
      await SecureStore.setItemAsync(BIOMETRIC_KEY, JSON.stringify({ email, password, role }));
      Toast.show({ type: 'success', text1: t('login_success_toast') });
    } catch (err) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Login failed' });
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  const biometricIcon  = biometricType === 'faceid' ? '🔏' : '🫆';
  const biometricLabel = biometricType === 'faceid' ? 'Sign in with Face ID' : 'Sign in with Fingerprint';

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content"/>
      <LinearGradient colors={['#1a1108', '#3d2203']} style={styles.hero}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 22, color: 'rgba(232,201,122,0.6)' }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.heroTitle}>{t('welcome_back')}</Text>
        <View style={styles.roleTabs}>
          {[['housewife', t('role_customer')], ['maid', t('role_maid')]].map(([r, label]) => (
            <TouchableOpacity key={r} onPress={() => setRole(r)}
              style={[styles.roleTab, role === r && styles.roleTabActive]}>
              <Text style={[styles.roleTabTxt, role === r && styles.roleTabTxtActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
        {biometricReady && (
          <TouchableOpacity style={styles.biometricBtn} onPress={triggerBiometric} disabled={loading}>
            <Text style={styles.biometricIcon}>{biometricIcon}</Text>
            <Text style={styles.biometricLabel}>{biometricLabel}</Text>
          </TouchableOpacity>
        )}

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

        {biometricReady && (
          <Text style={styles.orText}>— or use password above —</Text>
        )}

        <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.linkTxt}>Forgot password? <Text style={{ color: COLORS.gold }}>Reset it</Text></Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.link, { marginTop: 8 }]} onPress={() => navigation.navigate(role === 'maid' ? 'Register' : 'RegisterHousewife')}>
          <Text style={styles.linkTxt}>{t('no_account')} <Text style={{ color: COLORS.gold }}>{t('sign_up_link')}</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  hero:             { padding: 24, paddingTop: 54, paddingBottom: 20 },
  heroTitle:        { fontFamily: FONTS.display, fontSize: 30, color: '#e8c97a', marginBottom: 16 },
  roleTabs:         { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 6, padding: 3 },
  roleTab:          { flex: 1, paddingVertical: 10, borderRadius: 4, alignItems: 'center' },
  roleTabActive:    { backgroundColor: 'rgba(201,168,76,0.25)' },
  roleTabTxt:       { fontSize: 13, color: 'rgba(232,201,122,0.45)', fontWeight: '600' },
  roleTabTxtActive: { color: '#e8c97a' },
  body:             { flex: 1, backgroundColor: COLORS.cream, padding: 22 },
  biometricBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, borderRadius: 5, backgroundColor: COLORS.dark, marginBottom: 6 },
  biometricIcon:    { fontSize: 22, marginRight: 10 },
  biometricLabel:   { fontFamily: FONTS.bodySemiBold, fontSize: 14, color: '#e8c97a' },
  orText:           { textAlign: 'center', fontSize: 11, color: COLORS.muted, marginTop: 14, marginBottom: 4 },
  label:            { fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: COLORS.muted, marginBottom: 5, marginTop: 14, fontFamily: FONTS.bodySemiBold },
  input:            { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 5, padding: 13, fontSize: 14, color: COLORS.text, backgroundColor: COLORS.surface, fontFamily: FONTS.body },
  btn:              { backgroundColor: COLORS.gold, padding: 15, borderRadius: 5, alignItems: 'center', marginTop: 22 },
  btnDisabled:      { opacity: 0.5 },
  btnTxt:           { fontFamily: FONTS.bodySemiBold, fontSize: 14, color: COLORS.dark, letterSpacing: 0.5 },
  link:             { alignItems: 'center', marginTop: 18 },
  linkTxt:          { fontSize: 13, color: COLORS.muted },
});
