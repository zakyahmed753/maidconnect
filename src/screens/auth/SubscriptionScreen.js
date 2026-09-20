// src/screens/auth/SubscriptionScreen.js
import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  StatusBar, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import useAuthStore from '../../store/authStore';
import { COLORS, FONTS } from '../../utils/theme';

export default function SubscriptionScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);
  const completeAuth = useAuthStore(s => s.completeAuth);

  const handleActivate = async () => {
    setLoading(true);
    try {
      await completeAuth();
    } catch {
      if (mountedRef.current) {
        Toast.show({ type: 'error', text1: 'Something went wrong. Please try again.' });
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0D3827', '#0a4a39']} style={styles.container}>
        <Text style={styles.appName}>Servix</Text>

        <View style={styles.iconWrap}>
          <Ionicons name="gift-outline" size={52} color="#5dd6a8" />
        </View>

        <Text style={styles.heading}>Your Subscription is Free</Text>
        <Text style={styles.sub}>
          Servix is completely free for maids. No fees, no hidden charges — focus on finding great opportunities.
        </Text>

        <View style={styles.perksCard}>
          {[
            { icon: 'checkmark-circle', text: 'Full profile visibility to customers' },
            { icon: 'checkmark-circle', text: 'Receive hire requests & messages' },
            { icon: 'checkmark-circle', text: 'No subscription fees — ever' },
          ].map((p, i) => (
            <View key={i} style={styles.perkRow}>
              <Ionicons name={p.icon} size={20} color="#5dd6a8" />
              <Text style={styles.perkText}>{p.text}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleActivate} disabled={loading}>
          {loading
            ? <ActivityIndicator color={COLORS.dark} size="small" />
            : <Text style={styles.btnTxt}>Get Started</Text>}
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  appName:    { fontFamily: FONTS.display, fontSize: 14, color: 'rgba(255,255,255,0.5)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 32 },
  iconWrap:   { width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(93,214,168,0.12)', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  heading:    { fontFamily: FONTS.display, fontSize: 26, color: '#fff', textAlign: 'center', marginBottom: 12 },
  sub:        { fontSize: 14, color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 22, marginBottom: 32, maxWidth: 300 },
  perksCard:  { width: '100%', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 20, marginBottom: 32, gap: 14 },
  perkRow:    { flexDirection: 'row', alignItems: 'center', gap: 12 },
  perkText:   { fontSize: 14, color: 'rgba(255,255,255,0.85)', flex: 1 },
  btn:        { backgroundColor: '#5dd6a8', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 8, minWidth: 200, alignItems: 'center' },
  btnTxt:     { fontFamily: FONTS.bodySemiBold, fontSize: 16, color: '#0D3827' },
});
