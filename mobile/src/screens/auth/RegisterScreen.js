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
import { validatePassport } from '../../utils/passportValidator';
import CountryPicker from '../../components/CountryPicker';
import { useTranslation } from '../../utils/i18n';


// Validate Egyptian National ID (14 digits)
function validateNationalId(id) {
  const cleaned = (id || '').replace(/\s/g, '');
  if (!/^\d{14}$/.test(cleaned)) {
    return { valid: false, message: 'National ID must be 14 digits' };
  }
  return { valid: true, message: 'Valid', normalized: cleaned };
}

export default function RegisterScreen({ navigation }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name:'', email:'', password:'', phone:'', nationality:'', age:'',
    experienceYears:'', expectedSalary:'', bio:'', skills:[], idNumber:'',
  });
  const [photos, setPhotos] = useState([]);
  const [idPhoto, setIdPhoto] = useState(null); // passport photo (non-Egyptian only)
  const [residencePermitPhoto, setResidencePermitPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const register = useAuthStore(s => s.register);

  const isEgyptian = form.nationality === 'Egypt';

  const SKILLS = ['Cooking','Childcare','Eldercare','Cleaning','Laundry','Ironing'];
  const toggleSkill = (s) => setForm(f => ({ ...f, skills: f.skills.includes(s) ? f.skills.filter(x=>x!==s) : [...f.skills, s] }));

  const pickPhoto = async () => {
    if (photos.length >= 5) return Toast.show({ type:'info', text1: t('max_photos') });
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!res.canceled) setPhotos(p => [...p, res.assets[0].uri]);
  };

  const pickIdPhoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.9 });
    if (!res.canceled) setIdPhoto(res.assets[0].uri);
  };

  const pickResidencePermit = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.9 });
    if (!res.canceled) setResidencePermitPhoto(res.assets[0].uri);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) return Toast.show({ type:'error', text1: t('fill_required') });
    if (photos.length < 3) return Toast.show({ type:'error', text1: t('min_photos') });

    const ageNum = Number(form.age);
    if (!form.age || isNaN(ageNum) || ageNum < 20 || ageNum > 45) {
      return Toast.show({ type:'error', text1: t('age_range') });
    }

    if (!form.nationality) return Toast.show({ type:'error', text1: 'Select nationality' });

    // ID validation
    if (isEgyptian) {
      const idCheck = validateNationalId(form.idNumber);
      if (!idCheck.valid) return Toast.show({ type:'error', text1: idCheck.message });
    } else {
      const passportCheck = validatePassport(form.idNumber);
      if (!passportCheck.valid) return Toast.show({ type:'error', text1: passportCheck.message });
      if (!idPhoto) return Toast.show({ type:'error', text1: 'Upload a photo of your passport' });
    }

    setLoading(true);
    try {
      await register({ ...form, role:'maid' });

      const uploadedPhotos = [];
      try {
        for (const uri of photos) {
          const r = await uploadAPI.image(uri);
          uploadedPhotos.push({ url: r.data.url, publicId: r.data.publicId });
        }
      } catch {
        Toast.show({ type:'info', text1: t('photos_later'), text2: t('photos_continue') });
      }

      await maidsAPI.createProfile({
        fullName: form.name,
        age: ageNum,
        nationality: form.nationality,
        origin: ['Ethiopia','Kenya','Ghana','Nigeria','Guinea','Congo','Ivory Coast','Uganda','Tanzania','Cameroon','Senegal','Sudan','Somalia'].includes(form.nationality) ? 'african' : 'asian',
        experienceYears: Number(form.experienceYears),
        expectedSalary: Number(form.expectedSalary),
        bio: form.bio,
        skills: form.skills,
        photos: uploadedPhotos,
      });

      navigation.navigate('SelfieVerification', {
        isEgyptian,
        idNumber: form.idNumber,
        idPhotoUri: isEgyptian ? null : idPhoto,
        residencePermitUri: residencePermitPhoto,
      });
    } catch (err) {
      Toast.show({ type:'error', text1: err.response?.data?.message || t('registration_failed') });
    } finally { setLoading(false); }
  };

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const idValidation = isEgyptian ? validateNationalId(form.idNumber) : validatePassport(form.idNumber);

  return (
    <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS==='ios'?'padding':undefined}>
      <StatusBar barStyle="light-content"/>
      <LinearGradient colors={['#1a1108','#3d2203']} style={styles.hero}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={{ fontSize:22, color:'rgba(232,201,122,0.6)' }}>←</Text></TouchableOpacity>
        <Text style={styles.heroTitle}>{t('create_profile')}</Text>
        <Text style={styles.heroSub}>{t('step1')}</Text>
      </LinearGradient>

      <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
        {/* Basic fields */}
        {[['Full Name','name','default'],['Email','email','email-address'],['Password','password','default'],['Phone','phone','phone-pad']].map(([label, key, kb]) => (
          <View key={key}>
            <Text style={styles.label}>{t(key === 'name' ? 'full_name' : key)}</Text>
            <TextInput style={styles.input} value={form[key]} onChangeText={v=>upd(key,v)}
              placeholder={label} placeholderTextColor={COLORS.muted}
              keyboardType={kb} secureTextEntry={key==='password'} autoCapitalize="none"/>
          </View>
        ))}

        {/* Nationality dropdown */}
        <Text style={styles.label}>{t('nationality')} *</Text>
        <CountryPicker value={form.nationality} onChange={v => upd('nationality', v)}/>

        {/* Residence Permit — attachment upload */}
        <Text style={styles.label}>Residence Permit (إقامة)</Text>
        <TouchableOpacity style={styles.uploadBox} onPress={pickResidencePermit}>
          {residencePermitPhoto
            ? <Image source={{ uri: residencePermitPhoto }} style={{ width:'100%', height:120, borderRadius:4, resizeMode:'cover' }}/>
            : <>
                <Text style={{ fontSize:24, marginBottom:4 }}>📄</Text>
                <Text style={{ fontSize:12, fontWeight:'700', color:COLORS.gold }}>Tap to Upload Residence Permit</Text>
                <Text style={{ fontSize:10, color:COLORS.muted, marginTop:2 }}>Valid residency document in Egypt</Text>
              </>}
        </TouchableOpacity>

        {/* Age + Experience */}
        <View style={styles.twoCol}>
          <View style={{ flex:1 }}>
            <Text style={styles.label}>{t('age')} (20–45) *</Text>
            <TextInput style={styles.input} value={form.age} onChangeText={v=>upd('age',v)} keyboardType="numeric" placeholder="25" placeholderTextColor={COLORS.muted}/>
            {form.age.length > 0 && (Number(form.age) < 20 || Number(form.age) > 45) && (
              <Text style={{ fontSize:11, color:COLORS.red, marginTop:3 }}>Must be 20–45</Text>
            )}
          </View>
          <View style={{ flex:1 }}>
            <Text style={styles.label}>{t('experience')}</Text>
            <TextInput style={styles.input} value={form.experienceYears} onChangeText={v=>upd('experienceYears',v)} keyboardType="numeric" placeholder="3" placeholderTextColor={COLORS.muted}/>
          </View>
        </View>

        <Text style={styles.label}>Expected Salary (EGP/mo)</Text>
        <TextInput style={styles.input} value={form.expectedSalary} onChangeText={v=>upd('expectedSalary',v)} keyboardType="numeric" placeholder="17,500" placeholderTextColor={COLORS.muted}/>

        {/* ID section — changes based on nationality */}
        <Text style={styles.label}>{isEgyptian ? 'National ID Number *' : `${t('passport_number')} *`}</Text>
        <TextInput style={styles.input}
          value={form.idNumber}
          onChangeText={v => upd('idNumber', isEgyptian ? v.replace(/\D/g,'') : v.toUpperCase())}
          placeholder={isEgyptian ? '14-digit National ID' : 'e.g. A1234567'}
          placeholderTextColor={COLORS.muted}
          keyboardType={isEgyptian ? 'numeric' : 'default'}
          autoCapitalize={isEgyptian ? 'none' : 'characters'}
          maxLength={isEgyptian ? 14 : 15}/>
        {form.idNumber.length > 0 && (
          <Text style={{ fontSize:11, marginTop:3, color: idValidation.valid ? '#2e7d5e' : COLORS.red }}>
            {idValidation.valid ? '✓ Valid format' : idValidation.message}
          </Text>
        )}

        {/* Passport photo — only for non-Egyptian */}
        {!isEgyptian && (
          <>
            <Text style={styles.label}>{t('passport_photo')} *</Text>
            <TouchableOpacity style={styles.uploadBox} onPress={pickIdPhoto}>
              {idPhoto
                ? <Image source={{ uri: idPhoto }} style={{ width:'100%', height:120, borderRadius:4, resizeMode:'cover' }}/>
                : <>
                    <Text style={{ fontSize:24, marginBottom:4 }}>🪪</Text>
                    <Text style={{ fontSize:12, fontWeight:'700', color:COLORS.gold }}>Tap to Upload Passport Photo</Text>
                    <Text style={{ fontSize:10, color:COLORS.muted, marginTop:2 }}>Clear photo of the photo page</Text>
                  </>}
            </TouchableOpacity>
          </>
        )}


        <Text style={styles.label}>{t('bio')}</Text>
        <TextInput style={[styles.input, { height:80, textAlignVertical:'top' }]} value={form.bio} onChangeText={v=>upd('bio',v)} multiline placeholder="Describe your experience…" placeholderTextColor={COLORS.muted}/>

        <Text style={styles.label}>{t('skills')}</Text>
        <View style={styles.skillsWrap}>
          {SKILLS.map(s => (
            <TouchableOpacity key={s} onPress={() => toggleSkill(s)}
              style={[styles.skillChip, form.skills.includes(s) && styles.skillChipOn]}>
              <Text style={[styles.skillTxt, form.skills.includes(s) && styles.skillTxtOn]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>{t('photos')} (minimum 3) — {photos.length}/5</Text>
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
          <Text style={styles.btnTxt}>{loading ? t('loading') : t('continue') + ' →'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.linkTxt}>{t('have_account')} <Text style={{ color:COLORS.gold }}>{t('sign_in_link')}</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  hero:        { padding:20, paddingTop:54 },
  heroTitle:   { fontFamily:FONTS.display, fontSize:26, color:'#e8c97a', marginTop:8 },
  heroSub:     { fontSize:12, color:'rgba(232,201,122,0.5)', marginTop:3 },
  body:        { flex:1, backgroundColor:COLORS.cream, padding:20 },
  label:       { fontSize:10, letterSpacing:1.2, textTransform:'uppercase', color:COLORS.muted, marginBottom:5, marginTop:13, fontFamily:FONTS.bodySemiBold },
  input:       { borderWidth:1.5, borderColor:COLORS.border, borderRadius:5, padding:12, fontSize:14, color:COLORS.text, backgroundColor:COLORS.surface },
  twoCol:      { flexDirection:'row', gap:12 },
  skillsWrap:  { flexDirection:'row', flexWrap:'wrap', gap:7, marginBottom:4 },
  skillChip:   { paddingHorizontal:13, paddingVertical:7, borderRadius:20, borderWidth:1.5, borderColor:COLORS.border, backgroundColor:COLORS.cream },
  skillChipOn: { backgroundColor:COLORS.gold, borderColor:COLORS.gold },
  skillTxt:    { fontSize:12, color:COLORS.muted },
  skillTxtOn:  { color:COLORS.dark, fontWeight:'700' },
  uploadBox:   { borderWidth:1.5, borderColor:COLORS.border, borderStyle:'dashed', borderRadius:7, padding:20, alignItems:'center', backgroundColor:COLORS.surface },
  photoRow:    { flexDirection:'row', flexWrap:'wrap', gap:8, marginTop:10 },
  photoThumb:  { width:68, height:68, borderRadius:4, borderWidth:1, borderColor:COLORS.border, position:'relative' },
  photoDel:    { position:'absolute', top:-6, right:-6, width:18, height:18, borderRadius:9, backgroundColor:COLORS.red, alignItems:'center', justifyContent:'center' },
  btn:         { backgroundColor:COLORS.gold, padding:15, borderRadius:5, alignItems:'center', marginTop:20, marginBottom:10 },
  btnDisabled: { opacity:0.45 },
  btnTxt:      { fontFamily:FONTS.bodySemiBold, fontSize:14, color:COLORS.dark, letterSpacing:0.5 },
  link:        { alignItems:'center', marginBottom:30 },
  linkTxt:     { fontSize:13, color:COLORS.muted },
});
