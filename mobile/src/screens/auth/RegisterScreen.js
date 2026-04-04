// src/screens/auth/RegisterScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, StatusBar, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import useAuthStore from '../../store/authStore';
import { maidsAPI, uploadAPI } from '../../services/api';
import { COLORS, FONTS } from '../../utils/theme';

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({ name:'', email:'', password:'', phone:'', nationality:'', age:'', experienceYears:'', expectedSalary:'', bio:'', skills:[] });
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const register = useAuthStore(s => s.register);

  const SKILLS = ['Cooking','Childcare','Eldercare','Cleaning','Laundry','Ironing'];

  const toggleSkill = (s) => setForm(f => ({ ...f, skills: f.skills.includes(s) ? f.skills.filter(x=>x!==s) : [...f.skills, s] }));

  const pickPhoto = async () => {
    if (photos.length >= 5) return Toast.show({ type:'info', text1:'Max 5 photos allowed' });
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!res.canceled) setPhotos(p => [...p, res.assets[0].uri]);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) return Toast.show({ type:'error', text1:'Fill required fields' });
    if (photos.length < 3) return Toast.show({ type:'error', text1:'Upload at least 3 photos' });
    setLoading(true);
    try {
      // Step 1: Register user account.
      // register() saves the token to SecureStore (so subsequent calls are authenticated)
      // but does NOT update Zustand state — preventing AppNavigator from switching screens
      // before photo upload and profile creation are complete.
      await register({ ...form, role:'maid' });

      // Step 2: Upload photos. If Cloudinary is not configured, skip gracefully.
      const uploadedPhotos = [];
      try {
        for (const uri of photos) {
          const r = await uploadAPI.image(uri);
          uploadedPhotos.push({ url: r.data.url, publicId: r.data.publicId });
        }
      } catch {
        Toast.show({ type:'info', text1:'Photos will be added later', text2:'Continue to complete your profile' });
      }

      // Step 3: Create maid profile
      await maidsAPI.createProfile({
        fullName: form.name, age: Number(form.age), nationality: form.nationality,
        origin: ['ethiopian','kenyan','ghanaian','nigerian'].includes(form.nationality?.toLowerCase()) ? 'african' : 'asian',
        experienceYears: Number(form.experienceYears), expectedSalary: Number(form.expectedSalary),
        bio: form.bio, skills: form.skills, photos: uploadedPhotos
      });

      // Step 4: Navigate to subscription (still on auth stack — Zustand not updated yet)
      navigation.navigate('Subscription');
    } catch (err) {
      Toast.show({ type:'error', text1: err.response?.data?.message || 'Registration failed' });
    } finally { setLoading(false); }
  };

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS==='ios'?'padding':undefined}>
      <StatusBar barStyle="light-content"/>
      <LinearGradient colors={['#1a1108','#3d2203']} style={styles.hero}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={{ fontSize:22, color:'rgba(232,201,122,0.6)' }}>←</Text></TouchableOpacity>
        <Text style={styles.heroTitle}>Create Profile</Text>
        <Text style={styles.heroSub}>Step 1 of 2 — Profile Information</Text>
      </LinearGradient>

      <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
        {[['Full Name','name','text'],['Email','email','email-address'],['Password','password','text'],['Phone','phone','phone-pad'],['Nationality','nationality','text'],].map(([label, key, kb]) => (
          <View key={key}>
            <Text style={styles.label}>{label}</Text>
            <TextInput style={styles.input} value={form[key]} onChangeText={v=>upd(key,v)}
              placeholder={label} placeholderTextColor={COLORS.muted}
              keyboardType={kb} secureTextEntry={key==='password'} autoCapitalize="none"/>
          </View>
        ))}
        <View style={styles.twoCol}>
          <View style={{ flex:1 }}>
            <Text style={styles.label}>Age</Text>
            <TextInput style={styles.input} value={form.age} onChangeText={v=>upd('age',v)} keyboardType="numeric" placeholder="25" placeholderTextColor={COLORS.muted}/>
          </View>
          <View style={{ flex:1 }}>
            <Text style={styles.label}>Experience (yrs)</Text>
            <TextInput style={styles.input} value={form.experienceYears} onChangeText={v=>upd('experienceYears',v)} keyboardType="numeric" placeholder="3" placeholderTextColor={COLORS.muted}/>
          </View>
        </View>
        <Text style={styles.label}>Expected Salary (USD/mo)</Text>
        <TextInput style={styles.input} value={form.expectedSalary} onChangeText={v=>upd('expectedSalary',v)} keyboardType="numeric" placeholder="350" placeholderTextColor={COLORS.muted}/>

        <Text style={styles.label}>About You</Text>
        <TextInput style={[styles.input, { height:80, textAlignVertical:'top' }]} value={form.bio} onChangeText={v=>upd('bio',v)} multiline placeholder="Describe your experience…" placeholderTextColor={COLORS.muted}/>

        <Text style={styles.label}>Skills</Text>
        <View style={styles.skillsWrap}>
          {SKILLS.map(s => (
            <TouchableOpacity key={s} onPress={() => toggleSkill(s)}
              style={[styles.skillChip, form.skills.includes(s) && styles.skillChipOn]}>
              <Text style={[styles.skillTxt, form.skills.includes(s) && styles.skillTxtOn]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Photos (minimum 3) — {photos.length}/5</Text>
        <TouchableOpacity style={styles.uploadBox} onPress={pickPhoto}>
          <Text style={{ fontSize:28, marginBottom:6 }}>📸</Text>
          <Text style={{ fontSize:12, fontWeight:'700', color:COLORS.gold }}>Tap to Upload Photos</Text>
          <Text style={{ fontSize:10, color:COLORS.muted, marginTop:2 }}>Clear, professional photos only</Text>
        </TouchableOpacity>
        <View style={styles.photoRow}>
          {photos.map((uri, i) => (
            <View key={i} style={styles.photoThumb}>
              <Image source={{ uri }} style={{ width:'100%', height:'100%', borderRadius:4 }}/>
              <TouchableOpacity onPress={() => setPhotos(p=>p.filter((_,idx)=>idx!==i))} style={styles.photoDel}>
                <Text style={{ fontSize:9, color:'#fff' }}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
        {photos.length < 3 && <Text style={{ fontSize:11, color:COLORS.red, marginTop:4 }}>{3-photos.length} more photo{3-photos.length!==1?'s':''} needed</Text>}

        <TouchableOpacity style={[styles.btn, (photos.length < 3 || loading) && styles.btnDisabled]}
          onPress={handleSubmit} disabled={photos.length < 3 || loading}>
          <Text style={styles.btnTxt}>{loading ? 'Creating Profile…' : 'Continue to Subscription →'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.linkTxt}>Already have an account? <Text style={{ color:COLORS.gold }}>Sign In</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  hero:      { padding:20, paddingTop:54 },
  heroTitle: { fontFamily:FONTS.display, fontSize:26, color:'#e8c97a', marginTop:8 },
  heroSub:   { fontSize:12, color:'rgba(232,201,122,0.5)', marginTop:3 },
  body:      { flex:1, backgroundColor:COLORS.cream, padding:20 },
  label:     { fontSize:10, letterSpacing:1.2, textTransform:'uppercase', color:COLORS.muted, marginBottom:5, marginTop:13, fontFamily:FONTS.bodySemiBold },
  input:     { borderWidth:1.5, borderColor:COLORS.border, borderRadius:5, padding:12, fontSize:14, color:COLORS.text, backgroundColor:COLORS.surface },
  twoCol:    { flexDirection:'row', gap:12 },
  skillsWrap:{ flexDirection:'row', flexWrap:'wrap', gap:7, marginBottom:4 },
  skillChip: { paddingHorizontal:13, paddingVertical:7, borderRadius:20, borderWidth:1.5, borderColor:COLORS.border, backgroundColor:COLORS.cream },
  skillChipOn:{ backgroundColor:COLORS.gold, borderColor:COLORS.gold },
  skillTxt:  { fontSize:12, color:COLORS.muted },
  skillTxtOn:{ color:COLORS.dark, fontWeight:'700' },
  uploadBox: { borderWidth:1.5, borderColor:COLORS.border, borderStyle:'dashed', borderRadius:7, padding:20, alignItems:'center', backgroundColor:COLORS.surface },
  photoRow:  { flexDirection:'row', flexWrap:'wrap', gap:8, marginTop:10 },
  photoThumb:{ width:68, height:68, borderRadius:4, borderWidth:1, borderColor:COLORS.border, position:'relative' },
  photoDel:  { position:'absolute', top:-6, right:-6, width:18, height:18, borderRadius:9, backgroundColor:COLORS.red, alignItems:'center', justifyContent:'center' },
  btn:       { backgroundColor:COLORS.gold, padding:15, borderRadius:5, alignItems:'center', marginTop:20, marginBottom:10 },
  btnDisabled:{ opacity:0.45 },
  btnTxt:    { fontFamily:FONTS.bodySemiBold, fontSize:14, color:COLORS.dark, letterSpacing:0.5 },
  link:      { alignItems:'center', marginBottom:30 },
  linkTxt:   { fontSize:13, color:COLORS.muted },
});
