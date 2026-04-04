// src/screens/auth/RegisterHousewifeScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import useAuthStore from '../../store/authStore';
import { COLORS, FONTS } from '../../utils/theme';

export default function RegisterHousewifeScreen({ navigation }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const register = useAuthStore(s => s.register);

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) {
      return Toast.show({ type: 'error', text1: 'Fill required fields' });
    }
    setLoading(true);
    try {
      await register({ ...form, role: 'housewife' });
      Toast.show({ type: 'success', text1: 'Account created! Welcome 🏠' });
      // AppNavigator will auto-navigate to HouseWifeTabs once token is set
    } catch (err) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Registration failed' });
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content"/>
      <LinearGradient colors={['#1a1108', '#3d2203']} style={styles.hero}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 22, color: 'rgba(232,201,122,0.6)' }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.heroTitle}>Create Account</Text>
        <Text style={styles.heroSub}>House Wife — Find your trusted maid</Text>
      </LinearGradient>

      <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
        {[
          ['Full Name *', 'name', 'default'],
          ['Email *', 'email', 'email-address'],
          ['Password *', 'password', 'default'],
          ['Phone', 'phone', 'phone-pad'],
        ].map(([label, key, kb]) => (
          <View key={key}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
              style={styles.input}
              value={form[key]}
              onChangeText={v => upd(key, v)}
              placeholder={label.replace(' *', '')}
              placeholderTextColor={COLORS.muted}
              keyboardType={kb}
              secureTextEntry={key === 'password'}
              autoCapitalize="none"
            />
          </View>
        ))}

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={loading}>
          <Text style={styles.btnTxt}>{loading ? 'Creating Account…' : 'Create Account'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Login', { role: 'housewife' })}>
          <Text style={styles.linkTxt}>Already have an account? <Text style={{ color: COLORS.gold }}>Sign In</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  hero:      { padding: 20, paddingTop: 54 },
  heroTitle: { fontFamily: FONTS.display, fontSize: 26, color: '#e8c97a', marginTop: 8 },
  heroSub:   { fontSize: 12, color: 'rgba(232,201,122,0.5)', marginTop: 3 },
  body:      { flex: 1, backgroundColor: COLORS.cream, padding: 22 },
  label:     { fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: COLORS.muted, marginBottom: 5, marginTop: 14, fontFamily: FONTS.bodySemiBold },
  input:     { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 5, padding: 13, fontSize: 14, color: COLORS.text, backgroundColor: COLORS.surface, fontFamily: FONTS.body },
  btn:       { backgroundColor: COLORS.gold, padding: 15, borderRadius: 5, alignItems: 'center', marginTop: 24 },
  btnDisabled: { opacity: 0.5 },
  btnTxt:    { fontFamily: FONTS.bodySemiBold, fontSize: 14, color: COLORS.dark, letterSpacing: 0.5 },
  link:      { alignItems: 'center', marginTop: 18, marginBottom: 30 },
  linkTxt:   { fontSize: 13, color: COLORS.muted },
});
