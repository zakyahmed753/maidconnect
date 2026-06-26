// src/screens/auth/SplashScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Modal, ActivityIndicator, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../../utils/theme';
import useLangStore from '../../store/langStore';
import { LANGUAGES, useTranslation } from '../../utils/i18n';

const ROLE_KEY = 'servix_role_preference';

export function SplashScreen({ navigation }) {
  const [langOpen, setLangOpen] = useState(false);
  const [checking, setChecking] = useState(true);
  const { lang, setLang } = useLangStore();
  const { t } = useTranslation();
  const currentLang = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];
  const insets = useSafeAreaInsets();

  useEffect(() => {
    SecureStore.getItemAsync(ROLE_KEY)
      .then(savedRole => {
        if (savedRole === 'housewife' || savedRole === 'maid') {
          navigation.replace('Login', { role: savedRole });
        } else {
          setChecking(false);
        }
      })
      .catch(() => setChecking(false));
  }, []);

  const handleSelectRole = async (role) => {
    try { await SecureStore.setItemAsync(ROLE_KEY, role); } catch {}
    navigation.navigate(role === 'maid' ? 'Register' : 'RegisterHousewife', { role });
  };

  // ── Loading ────────────────────────────────────────────────────────────
  if (checking) {
    return (
      <View style={styles.loading}>
        <StatusBar barStyle="dark-content"/>
        <View style={styles.loadingLogo}>
          <Ionicons name="home" size={40} color="#fff" />
        </View>
        <ActivityIndicator color={COLORS.green} style={{ marginTop: 32 }}/>
      </View>
    );
  }

  // ── Main screen ────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content"/>

      {/* Language selector — globe icon */}
      <TouchableOpacity style={styles.langBtn} onPress={() => setLangOpen(true)}>
        <Ionicons name="globe-outline" size={16} color={COLORS.text} />
        <Text style={styles.langLabel}>{currentLang.label}</Text>
        <Text style={styles.langChevron}>▾</Text>
      </TouchableOpacity>

      {/* Language modal */}
      <Modal visible={langOpen} transparent animationType="fade" onRequestClose={() => setLangOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setLangOpen(false)}>
          <View style={styles.dropdown}>
            <Text style={styles.dropdownTitle}>{t('language')}</Text>
            {LANGUAGES.map(l => (
              <TouchableOpacity key={l.code}
                style={[styles.dropdownItem, lang === l.code && styles.dropdownItemActive]}
                onPress={() => { setLang(l.code); setLangOpen(false); }}>
                <Text style={styles.dropdownFlag}>{l.flag}</Text>
                <Text style={[styles.dropdownItemText, lang === l.code && styles.dropdownItemTextActive]}>{l.label}</Text>
                {lang === l.code && <Text style={{ color: COLORS.green }}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Branding */}
        <View style={styles.brand}>
          <View style={styles.logoCircle}>
            <Ionicons name="home" size={36} color="#fff" />
          </View>
          <Text style={styles.tagline}>FIND TRUSTED HOME HELPERS</Text>
        </View>

        {/* Welcome heading */}
        <View style={styles.welcomeBlock}>
          <Text style={styles.welcomeText}>Welcome to Servix</Text>
          <Text style={styles.welcomeSub}>How can we help you today?</Text>
        </View>

        {/* Card — Find a Maid */}
        <TouchableOpacity style={styles.card} onPress={() => handleSelectRole('housewife')} activeOpacity={0.84}>
          <View style={styles.cardTop}>
            <View style={[styles.cardIconWrap, { backgroundColor: '#e8f4f1' }]}>
              <Ionicons name="home" size={28} color={COLORS.green} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>I need a Helper</Text>
              <Text style={styles.cardSub}>Find trusted, vetted domestic staff for your home</Text>
            </View>
          </View>
          <View style={styles.cardBtn}>
            <Text style={styles.cardBtnTxt}>Get Started</Text>
            <Text style={styles.cardBtnArrow}>→</Text>
          </View>
        </TouchableOpacity>

        {/* Card — Find Work */}
        <TouchableOpacity style={styles.card} onPress={() => handleSelectRole('maid')} activeOpacity={0.84}>
          <View style={styles.cardTop}>
            <View style={[styles.cardIconWrap, { backgroundColor: '#fef3e2' }]}>
              <Ionicons name="briefcase" size={28} color="#d97706" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>I'm looking for work</Text>
              <Text style={styles.cardSub}>Find a domestic staff placement near you</Text>
            </View>
          </View>
          <View style={[styles.cardBtn, styles.cardBtnOutline]}>
            <Text style={[styles.cardBtnTxt, styles.cardBtnTxtOutline]}>Get Started</Text>
            <Text style={[styles.cardBtnArrow, { color: COLORS.green }]}>→</Text>
          </View>
        </TouchableOpacity>

        {/* Sign in */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}
          activeOpacity={0.7}>
          <Text style={styles.footerText}>Already a member?</Text>
          <Text style={[styles.footerLink, { marginLeft: 5 }]}>Sign In</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loading:          { flex: 1, backgroundColor: COLORS.cream, alignItems: 'center', justifyContent: 'center' },
  loadingLogo:      { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.green, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  loadingName:      { fontFamily: FONTS.display, fontSize: 32, color: COLORS.dark },

  container:        { flex: 1, backgroundColor: COLORS.cream },
  scroll:           { paddingHorizontal: 22, paddingTop: 110, paddingBottom: 0 },

  langBtn:          { position: 'absolute', top: 54, right: 18, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface, zIndex: 10 },
  langGlobe:        { fontSize: 16 },
  langLabel:        { fontSize: 11, color: COLORS.text, fontWeight: '600' },
  langChevron:      { fontSize: 9, color: COLORS.muted },

  modalOverlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-start', alignItems: 'flex-end', paddingTop: 108, paddingRight: 18 },
  dropdown:         { backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, minWidth: 190, overflow: 'hidden', elevation: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12 },
  dropdownTitle:    { fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: COLORS.muted, padding: 12, paddingBottom: 6, fontWeight: '700' },
  dropdownItem:     { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  dropdownItemActive: { backgroundColor: '#e8f4f1' },
  dropdownFlag:     { fontSize: 18 },
  dropdownItemText: { fontSize: 14, color: COLORS.text, flex: 1 },
  dropdownItemTextActive: { color: COLORS.green, fontWeight: '700' },

  brand:            { alignItems: 'center', marginBottom: 28 },
  logoCircle:       { width: 76, height: 76, borderRadius: 38, backgroundColor: COLORS.green, alignItems: 'center', justifyContent: 'center', marginBottom: 12, elevation: 4, shadowColor: COLORS.green, shadowOpacity: 0.3, shadowRadius: 10 },
  appName:          { fontFamily: FONTS.display, fontSize: 34, color: COLORS.dark, marginBottom: 5 },
  tagline:          { fontSize: 13, color: COLORS.muted, textAlign: 'center' },

  welcomeBlock:     { marginBottom: 22 },
  welcomeText:      { fontFamily: FONTS.display, fontSize: 28, color: COLORS.dark, marginBottom: 4 },
  welcomeSub:       { fontSize: 14, color: COLORS.muted },

  card:             { backgroundColor: COLORS.surface, borderRadius: 16, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  cardTop:          { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  cardIconWrap:     { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  cardEmoji:        { fontSize: 28 },
  cardTitle:        { fontFamily: FONTS.display, fontSize: 17, color: COLORS.dark, marginBottom: 4 },
  cardSub:          { fontSize: 12, color: COLORS.muted, lineHeight: 17 },

  cardBtn:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.green, borderRadius: 10, paddingVertical: 13, gap: 8 },
  cardBtnTxt:       { fontFamily: FONTS.bodySemiBold, fontSize: 15, color: '#fff' },
  cardBtnArrow:     { fontSize: 16, color: '#fff', fontWeight: '700' },
  cardBtnOutline:   { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: COLORS.green },
  cardBtnTxtOutline:{ color: COLORS.green },

  footer:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  footerText:       { fontSize: 13, color: COLORS.muted },
  footerLink:       { fontSize: 13, color: COLORS.green, fontWeight: '700' },
});

export default SplashScreen;
