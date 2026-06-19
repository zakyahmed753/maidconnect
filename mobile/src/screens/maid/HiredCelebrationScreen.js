import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import useAuthStore from '../../store/authStore';
import { COLORS, FONTS } from '../../utils/theme';
import { useTranslation } from '../../utils/i18n';

export default function HiredCelebrationScreen({ navigation }) {
  const { t } = useTranslation();
  const completeAuth = useAuthStore(s => s.completeAuth);

  const scaleAnim  = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim  = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim,  { toValue: 1, useNativeDriver: true, tension: 60, friction: 6 }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleGoHome = async () => {
    try { await completeAuth(); } catch {}
    navigation.reset({ index: 0, routes: [{ name: 'MaidDash' }] });
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0a1a0e', '#0d2e1a', '#1a3d25']} style={StyleSheet.absoluteFill} />

      {/* Decorative circles */}
      <View style={[styles.circle, { width: 300, height: 300, top: -80, right: -80, opacity: 0.06 }]} />
      <View style={[styles.circle, { width: 200, height: 200, bottom: 60, left: -60, opacity: 0.05 }]} />
      <View style={[styles.circle, { width: 120, height: 120, top: 160, left: 30, opacity: 0.04 }]} />

      <View style={styles.container}>
        {/* Big animated emoji */}
        <Animated.View style={{ transform: [{ scale: scaleAnim }], opacity: opacityAnim, marginBottom: 24 }}>
          <Text style={{ fontSize: 90 }}>🎉</Text>
        </Animated.View>

        <Animated.View style={{ opacity: opacityAnim, transform: [{ translateY: slideAnim }], alignItems: 'center' }}>
          <Text style={styles.congrats}>{t('congratulations')}</Text>
          <Text style={styles.headline}>{t('youre_hired')}</Text>

          <View style={styles.dividerLine} />

          <Text style={styles.body}>{t('hired_body')}</Text>

          <View style={styles.infoBox}>
            {[
              ['✅', t('hired_profile_unavail')],
              ['📧', t('hired_email_sent')],
              ['💬', t('hired_chat_employer')],
            ].map(([icon, text]) => (
              <View key={text} style={styles.infoRow}>
                <Text style={{ fontSize: 16 }}>{icon}</Text>
                <Text style={styles.infoText}>{text}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.btn} onPress={handleGoHome}>
            <Text style={styles.btnTxt}>{t('go_to_dashboard')}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  circle:     { position: 'absolute', borderRadius: 999, borderWidth: 2, borderColor: '#5dd6a8' },
  congrats:   { fontSize: 14, letterSpacing: 3, textTransform: 'uppercase', color: '#5dd6a8', fontFamily: FONTS.bodySemiBold, marginBottom: 6 },
  headline:   { fontFamily: FONTS.display, fontSize: 38, color: '#fff', textAlign: 'center', lineHeight: 44 },
  dividerLine:{ width: 60, height: 2, backgroundColor: 'rgba(93,214,168,0.4)', borderRadius: 1, marginVertical: 20 },
  body:       { fontSize: 14, color: 'rgba(255,255,255,0.55)', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  infoBox:    { width: '100%', backgroundColor: 'rgba(93,214,168,0.06)', borderWidth: 1, borderColor: 'rgba(93,214,168,0.15)', borderRadius: 10, padding: 16, marginBottom: 32, gap: 12 },
  infoRow:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoText:   { fontSize: 13, color: 'rgba(255,255,255,0.65)', flex: 1, lineHeight: 18 },
  btn:        { backgroundColor: '#2e7d5e', paddingHorizontal: 36, paddingVertical: 15, borderRadius: 8 },
  btnTxt:     { fontFamily: FONTS.bodySemiBold, fontSize: 15, color: '#fff' },
});
