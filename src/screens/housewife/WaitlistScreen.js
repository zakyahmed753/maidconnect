import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS } from '../../utils/theme';
import useAuthStore from '../../store/authStore';

export default function WaitlistScreen({ navigation }) {
  const { profile } = useAuthStore();
  const area = profile?.residentialArea || 'your area';

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I just joined the Servix waitlist! The best way to find trusted domestic helpers is coming to ${area} soon. Join here: https://servix.world`,
      });
    } catch {}
  };

  const handleChangeArea = () => {
    // Clear area and let them re-pick — handled by AppNavigator
    const { hwAPI } = require('../../services/api');
    hwAPI.updateProfile({ residentialArea: null }).then(() => {
      useAuthStore.getState().completeAuth();
    }).catch(() => {});
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={['#0D3827', '#0d5e4a']} style={styles.hero}>
        <Text style={{ fontSize: 52, marginBottom: 12 }}>ðŸ—“</Text>
        <Text style={styles.heroT}>You're on the list!</Text>
        <Text style={styles.heroS}>Servix is launching in {area} soon</Text>
      </LinearGradient>

      <View style={{ flex: 1, backgroundColor: COLORS.cream, padding: 24 }}>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>What happens next?</Text>
          {[
            { icon: 'âœ‰', text: `We'll send you a notification the moment we go live in ${area}` },
            { icon: 'ðŸ†', text: 'As a waitlist member you\'ll get early access before public launch' },
            { icon: 'ðŸŽ', text: 'Waitlist members receive a special launch discount' },
          ].map(({ icon, text }) => (
            <View key={icon} style={styles.step}>
              <Text style={{ fontSize: 22 }}>{icon}</Text>
              <Text style={styles.stepTxt}>{text}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Text style={styles.shareTxt}>ðŸ“¤ Share with friends in {area}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.changeBtn} onPress={handleChangeArea}>
          <Text style={styles.changeTxt}>â† I'm in a different area</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero:      { padding: 22, paddingTop: 64, alignItems: 'center', paddingBottom: 36 },
  heroT:     { fontFamily: FONTS.display, fontSize: 28, color: '#fff', marginBottom: 6 },
  heroS:     { fontSize: 13, color: 'rgba(255,255,255,0.7)', textAlign: 'center' },
  card:      { backgroundColor: COLORS.surface, borderRadius: 12, padding: 18, borderWidth: 1, borderColor: COLORS.border, marginBottom: 16 },
  cardTitle: { fontFamily: FONTS.display, fontSize: 18, color: COLORS.dark, marginBottom: 14 },
  step:      { flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginBottom: 12 },
  stepTxt:   { fontSize: 13, color: COLORS.text, flex: 1, lineHeight: 19 },
  shareBtn:  { backgroundColor: COLORS.green, padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  shareTxt:  { fontFamily: FONTS.bodySemiBold, fontSize: 14, color: '#fff' },
  changeBtn: { alignItems: 'center', padding: 12 },
  changeTxt: { fontSize: 13, color: COLORS.muted, textDecorationLine: 'underline' },
});
