// src/screens/auth/SplashScreen.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS } from '../../utils/theme';
import useLangStore from '../../store/langStore';
import { LANGUAGES, useTranslation } from '../../utils/i18n';

export function SplashScreen({ navigation }) {
  const [role, setRole] = useState('housewife');
  const [langOpen, setLangOpen] = useState(false);
  const { lang, setLang } = useLangStore();
  const { t } = useTranslation();

  const currentLang = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  return (
    <LinearGradient colors={['#1a1108','#3d2203','#5c3210']} style={styles.container}>
      <StatusBar barStyle="light-content"/>

      {/* Language dropdown button — top right */}
      <TouchableOpacity style={styles.langBtn} onPress={() => setLangOpen(true)}>
        <Text style={styles.langFlag}>{currentLang.flag}</Text>
        <Text style={styles.langLabel}>{currentLang.label}</Text>
        <Text style={styles.langChevron}>▾</Text>
      </TouchableOpacity>

      {/* Language picker modal */}
      <Modal visible={langOpen} transparent animationType="fade" onRequestClose={() => setLangOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setLangOpen(false)}>
          <View style={styles.dropdown}>
            <Text style={styles.dropdownTitle}>{t('language')}</Text>
            {LANGUAGES.map(l => (
              <TouchableOpacity key={l.code} style={[styles.dropdownItem, lang === l.code && styles.dropdownItemActive]}
                onPress={() => { setLang(l.code); setLangOpen(false); }}>
                <Text style={styles.dropdownFlag}>{l.flag}</Text>
                <Text style={[styles.dropdownItemText, lang === l.code && styles.dropdownItemTextActive]}>{l.label}</Text>
                {lang === l.code && <Text style={{ color: COLORS.gold }}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <Text style={styles.icon}>🏡</Text>
      <Text style={styles.title}>Servix</Text>
      <Text style={styles.subtitle}>PREMIUM DOMESTIC STAFFING</Text>

      {/* Role toggle */}
      <View style={styles.roleToggle}>
        {['housewife','maid'].map(r => (
          <TouchableOpacity key={r} onPress={() => setRole(r)}
            style={[styles.roleBtn, role === r && styles.roleBtnActive]}>
            <Text style={[styles.roleTxt, role === r && styles.roleTxtActive]}>
              {r === 'housewife' ? `🏠 Customer` : `👩 ${t('login_maid')}`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.btnGold}
        onPress={() => navigation.navigate(role === 'maid' ? 'Register' : 'Login', { role })}>
        <Text style={styles.btnGoldTxt}>{role === 'maid' ? `${t('create_profile')} →` : `${t('browse_maids')} →`}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnOutline} onPress={() => navigation.navigate('Login', { role })}>
        <Text style={styles.btnOutlineTxt}>{t('sign_in')}</Text>
      </TouchableOpacity>

      <View style={styles.dividerRow}>
        <View style={styles.divLine}/><Text style={styles.divTxt}>or continue with</Text><View style={styles.divLine}/>
      </View>

      <View style={styles.socialRow}>
        {[{icon:'🔵', label:'Google'},{icon:'🍎', label:'Apple'},{icon:'📘', label:'Facebook'}].map(s=>(
          <TouchableOpacity key={s.label} style={styles.socialBtn}
            onPress={() => navigation.navigate(role==='maid'?'Register':'Login',{role,social:s.label})}>
            <Text style={styles.socialTxt}>{s.icon} {s.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:          { flex:1, alignItems:'center', justifyContent:'center', padding:28 },
  langBtn:            { position:'absolute', top:54, right:20, flexDirection:'row', alignItems:'center', gap:5, paddingHorizontal:10, paddingVertical:6, borderRadius:6, borderWidth:1, borderColor:'rgba(201,168,76,0.4)', backgroundColor:'rgba(201,168,76,0.1)' },
  langFlag:           { fontSize:16 },
  langLabel:          { fontSize:11, color:'#e8c97a', fontWeight:'600' },
  langChevron:        { fontSize:10, color:'rgba(232,201,122,0.6)' },
  modalOverlay:       { flex:1, backgroundColor:'rgba(0,0,0,0.6)', justifyContent:'flex-start', alignItems:'flex-end', paddingTop:100, paddingRight:20 },
  dropdown:           { backgroundColor:COLORS.surface, borderRadius:10, borderWidth:1, borderColor:COLORS.border, minWidth:180, overflow:'hidden' },
  dropdownTitle:      { fontSize:10, letterSpacing:1.2, textTransform:'uppercase', color:COLORS.muted, padding:12, paddingBottom:6, fontWeight:'700' },
  dropdownItem:       { flexDirection:'row', alignItems:'center', gap:10, paddingHorizontal:14, paddingVertical:12, borderTopWidth:1, borderTopColor:COLORS.border },
  dropdownItemActive: { backgroundColor:'#fef9ee' },
  dropdownFlag:       { fontSize:18 },
  dropdownItemText:   { fontSize:14, color:COLORS.text, flex:1 },
  dropdownItemTextActive: { color:COLORS.gold, fontWeight:'700' },
  icon:               { fontSize:54, marginBottom:14 },
  title:              { fontFamily:FONTS.display, fontSize:40, color:'#e8c97a', textAlign:'center', lineHeight:46, marginBottom:6 },
  subtitle:           { fontSize:10, color:'rgba(232,201,122,0.5)', letterSpacing:2, marginBottom:32, textAlign:'center' },
  roleToggle:         { flexDirection:'row', backgroundColor:'rgba(255,255,255,0.07)', borderRadius:6, padding:3, marginBottom:18, width:'100%' },
  roleBtn:            { flex:1, paddingVertical:10, borderRadius:4, alignItems:'center' },
  roleBtnActive:      { backgroundColor:'rgba(201,168,76,0.22)' },
  roleTxt:            { fontSize:13, color:'rgba(232,201,122,0.45)', fontFamily:FONTS.bodyMedium },
  roleTxtActive:      { color:'#e8c97a' },
  btnGold:            { width:'100%', padding:15, borderRadius:5, alignItems:'center', marginBottom:10, backgroundColor:'#c9a84c' },
  btnGoldTxt:         { fontSize:14, fontWeight:'700', color:'#1a1108', letterSpacing:0.5, fontFamily:FONTS.bodySemiBold },
  btnOutline:         { width:'100%', padding:14, borderRadius:5, alignItems:'center', marginBottom:20, borderWidth:1.5, borderColor:'rgba(201,168,76,0.35)' },
  btnOutlineTxt:      { fontSize:14, color:'#e8c97a', fontFamily:FONTS.bodyMedium },
  dividerRow:         { flexDirection:'row', alignItems:'center', gap:10, width:'100%', marginBottom:14 },
  divLine:            { flex:1, height:1, backgroundColor:'rgba(201,168,76,0.15)' },
  divTxt:             { fontSize:10, color:'rgba(232,201,122,0.35)', letterSpacing:1 },
  socialRow:          { flexDirection:'row', gap:8, width:'100%' },
  socialBtn:          { flex:1, paddingVertical:11, borderRadius:5, borderWidth:1.5, borderColor:'rgba(201,168,76,0.22)', alignItems:'center', backgroundColor:'rgba(255,255,255,0.04)' },
  socialTxt:          { fontSize:11, color:'#e8c97a', fontFamily:FONTS.bodyMedium },
});

export default SplashScreen;
