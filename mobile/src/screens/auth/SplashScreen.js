// ═══════════════════════════════════════════════
// src/screens/auth/SplashScreen.js
// ═══════════════════════════════════════════════
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS } from '../../utils/theme';

const { width } = Dimensions.get('window');

export function SplashScreen({ navigation }) {
  const [role, setRole] = useState('housewife');

  return (
    <LinearGradient colors={['#1a1108','#3d2203','#5c3210']} style={styles.container}>
      <StatusBar barStyle="light-content"/>
      <Text style={styles.icon}>🏡</Text>
      <Text style={styles.title}>Find Your{'\n'}<Text style={styles.titleItalic}>Trusted Maid</Text></Text>
      <Text style={styles.subtitle}>PREMIUM DOMESTIC STAFFING</Text>

      {/* Role toggle */}
      <View style={styles.roleToggle}>
        {['housewife','maid'].map(r => (
          <TouchableOpacity key={r} onPress={() => setRole(r)}
            style={[styles.roleBtn, role === r && styles.roleBtnActive]}>
            <Text style={[styles.roleTxt, role === r && styles.roleTxtActive]}>
              {r === 'housewife' ? '🏠 House Wife' : '👩 I\'m a Maid'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.btnGold}
        onPress={() => navigation.navigate(role === 'maid' ? 'Register' : 'Login', { role })}>
        <Text style={styles.btnGoldTxt}>{role === 'maid' ? 'Create Maid Profile →' : 'Browse Maids →'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnOutline} onPress={() => navigation.navigate('Login', { role })}>
        <Text style={styles.btnOutlineTxt}>Sign In</Text>
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
  container:   { flex:1, alignItems:'center', justifyContent:'center', padding:28 },
  icon:        { fontSize:54, marginBottom:14 },
  title:       { fontFamily:FONTS.display, fontSize:40, color:'#e8c97a', textAlign:'center', lineHeight:46, marginBottom:6 },
  titleItalic: { fontFamily:FONTS.displayItalic, color:'#fff8ee' },
  subtitle:    { fontSize:10, color:'rgba(232,201,122,0.5)', letterSpacing:2, marginBottom:32, textAlign:'center' },
  roleToggle:  { flexDirection:'row', backgroundColor:'rgba(255,255,255,0.07)', borderRadius:6, padding:3, marginBottom:18, width:'100%' },
  roleBtn:     { flex:1, paddingVertical:10, borderRadius:4, alignItems:'center' },
  roleBtnActive:{ backgroundColor:'rgba(201,168,76,0.22)' },
  roleTxt:     { fontSize:13, color:'rgba(232,201,122,0.45)', fontFamily:FONTS.bodyMedium },
  roleTxtActive:{ color:'#e8c97a' },
  btnGold:     { width:'100%', padding:15, backgroundColor:'transparent', borderRadius:5, alignItems:'center', marginBottom:10, overflow:'hidden', backgroundColor:'#c9a84c' },
  btnGoldTxt:  { fontSize:14, fontWeight:'700', color:'#1a1108', letterSpacing:0.5, fontFamily:FONTS.bodySemiBold },
  btnOutline:  { width:'100%', padding:14, borderRadius:5, alignItems:'center', marginBottom:20, borderWidth:1.5, borderColor:'rgba(201,168,76,0.35)' },
  btnOutlineTxt:{ fontSize:14, color:'#e8c97a', fontFamily:FONTS.bodyMedium },
  dividerRow:  { flexDirection:'row', alignItems:'center', gap:10, width:'100%', marginBottom:14 },
  divLine:     { flex:1, height:1, backgroundColor:'rgba(201,168,76,0.15)' },
  divTxt:      { fontSize:10, color:'rgba(232,201,122,0.35)', letterSpacing:1 },
  socialRow:   { flexDirection:'row', gap:8, width:'100%' },
  socialBtn:   { flex:1, paddingVertical:11, borderRadius:5, borderWidth:1.5, borderColor:'rgba(201,168,76,0.22)', alignItems:'center', backgroundColor:'rgba(255,255,255,0.04)' },
  socialTxt:   { fontSize:11, color:'#e8c97a', fontFamily:FONTS.bodyMedium },
});

export default SplashScreen;
