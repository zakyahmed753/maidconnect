// src/screens/auth/LoginScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import useAuthStore from '../../store/authStore';
import { COLORS, FONTS } from '../../utils/theme';
import { useTranslation } from '../../utils/i18n';

const BIOMETRIC_KEY    = 'biometric_credentials';
const ROLE_PREF_KEY    = 'servix_role_preference';

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

      if (!result.success) return;

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
        await SecureStore.setItemAsync(ROLE_PREF_KEY, savedRole);
      } catch (err) {
        if (!mountedRef.current) return;
        Toast.show({ type: 'error', text1: 'Biometric login failed — please use password' });
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
      await SecureStore.setItemAsync(BIOMETRIC_KEY, JSON.stringify({ email, password, role }));
      await SecureStore.setItemAsync(ROLE_PREF_KEY, role);
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
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: COLORS.cream }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="dark-content"/>
      <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Top bar with back button */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={async () => {
            if (navigation.canGoBack()) { navigation.goBack(); return; }
            // After logout the role preference still exists, so Splash auto-redirects back here.
            // Clear it so Splash shows the role-selection screen instead of looping.
            try { await SecureStore.deleteItemAsync(ROLE_PREF_KEY); } catch {}
            navigation.navigate('Splash');
          }} style={styles.backBtn}>
            <Text style={{ fontSize: 26, color: COLORS.green, fontWeight: '300', lineHeight: 30 }}>‹</Text>
          </TouchableOpacity>
        </View>

        {/* Branding section */}
        <View style={styles.brandSection}>
          <View style={styles.logoCircle}>
            <Ionicons name="home" size={32} color="#fff" />
          </View>
          <Text style={styles.brandName}>Servix</Text>
          <Text style={styles.brandTagline}>{t('welcome_back')}</Text>
        </View>

        {/* Role selector */}
        <View style={styles.roleTabsWrap}>
          {[['housewife', t('role_customer')], ['maid', t('role_maid')]].map(([r, label]) => (
            <TouchableOpacity key={r} onPress={() => setRole(r)}
              style={[styles.roleTab, role === r && styles.roleTabActive]}>
              <Text style={[styles.roleTabTxt, role === r && styles.roleTabTxtActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Form card */}
        <View style={styles.formCard}>
          {biometricReady && (
            <TouchableOpacity style={styles.biometricBtn} onPress={triggerBiometric} disabled={loading}>
              <Text style={styles.biometricIcon}>{biometricIcon}</Text>
              <Text style={styles.biometricLabel}>{biometricLabel}</Text>
            </TouchableOpacity>
          )}
          {biometricReady && <Text style={styles.orText}>— or use password —</Text>}

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

          <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.linkTxt}>Forgot password? <Text style={{ color: COLORS.green }}>Reset it</Text></Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.link, { marginTop: 10, marginBottom: 4 }]} onPress={() => navigation.navigate(role === 'maid' ? 'Register' : 'RegisterHousewife')}>
            <Text style={styles.linkTxt}>{t('no_account')} <Text style={{ color: COLORS.green }}>{t('sign_up_link')}</Text></Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  topBar:           { paddingTop: 52, paddingHorizontal: 16, paddingBottom: 4 },
  backBtn:          { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e8f4f1', alignItems: 'center', justifyContent: 'center' },
  brandSection:     { alignItems: 'center', paddingTop: 12, paddingBottom: 24 },
  logoCircle:       { width: 76, height: 76, borderRadius: 38, backgroundColor: COLORS.green, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  brandName:        { fontFamily: FONTS.display, fontSize: 34, color: COLORS.dark },
  brandTagline:     { fontSize: 13, color: COLORS.muted, marginTop: 5 },
  roleTabsWrap:     { flexDirection: 'row', marginHorizontal: 22, backgroundColor: '#e8f4f1', borderRadius: 12, padding: 4, marginBottom: 18 },
  roleTab:          { flex: 1, paddingVertical: 11, borderRadius: 10, alignItems: 'center' },
  roleTabActive:    { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 4, elevation: 2 },
  roleTabTxt:       { fontSize: 13, color: COLORS.muted, fontWeight: '600' },
  roleTabTxtActive: { color: COLORS.green, fontWeight: '700' },
  formCard:         { backgroundColor: '#fff', marginHorizontal: 22, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: COLORS.border, marginBottom: 36, elevation: 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8 },
  biometricBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 10, backgroundColor: COLORS.green, marginBottom: 8 },
  biometricIcon:    { fontSize: 22, marginRight: 10 },
  biometricLabel:   { fontFamily: FONTS.bodySemiBold, fontSize: 14, color: '#fff' },
  orText:           { textAlign: 'center', fontSize: 11, color: COLORS.muted, marginTop: 4, marginBottom: 10 },
  label:            { fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: COLORS.muted, marginBottom: 6, marginTop: 14, fontFamily: FONTS.bodySemiBold },
  input:            { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 10, padding: 14, fontSize: 14, color: COLORS.text, backgroundColor: COLORS.cream, fontFamily: FONTS.body },
  btn:              { backgroundColor: COLORS.green, padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 22 },
  btnDisabled:      { opacity: 0.5 },
  btnTxt:           { fontFamily: FONTS.bodySemiBold, fontSize: 14, color: '#fff', letterSpacing: 0.5 },
  link:             { alignItems: 'center', marginTop: 16 },
  linkTxt:          { fontSize: 13, color: COLORS.muted },
});
