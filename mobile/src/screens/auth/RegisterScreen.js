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
    experienceYears:'', expectedSalary:'', bio:'', skills:[], languages:[], idNumber:'',
  });
  const [photos, setPhotos] = useState([]);
  const [idPhoto, setIdPhoto] = useState(null); // passport photo (non-Egyptian only)
  const [loading, setLoading] = useState(false);
  const register = useAuthStore(s => s.register);

  const isEgyptian = form.nationality === 'Egypt';

  const SKILLS = ['Cooking','Childcare','Eldercare','Cleaning','Laundry','Ironing','Driving','Pet Care'];
  const LANGUAGES = ['Arabic','English','French','Amharic','Swahili','Filipino'];
  const toggleSkill = (s) => setForm(f => ({ ...f, skills: f.skills.includes(s) ? f.skills.filter(x=>x!==s) : [...f.skills, s] }));
  const toggleLang = (l) => setForm(f => ({ ...f, languages: f.languages.includes(l) ? f.languages.filter(x=>x!==l) : [...f.languages, l] }));

  const getOrigin = (nat) => {
    if (nat === 'Egypt') return 'egyptian';
    const african = ['Ethiopia','Kenya','Uganda','Tanzania','Sudan','South Sudan','Ghana','Nigeria','Cameroon','Côte d\'Ivoire','Senegal','Somalia','Rwanda','Burundi','Madagascar','Congo','Mozambique','Zimbabwe','Zambia','Malawi','Togo','Sierra Leone','Eritrea','Guinea','Morocco'];
    if (african.includes(nat)) return 'african';
    const asian = ['Philippines','Indonesia','Malaysia','Sri Lanka','India','Bangladesh','Nepal','Vietnam','Myanmar'];
    if (asian.includes(nat)) return 'asian';
    return 'other';
  };

  const pickPhoto = async () => {
    if (photos.length >= 5) return Toast.show({ type:'info', text1: t('max_photos') });
    const remaining = 5 - photos.length;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: remaining,
    });
    if (!res.canceled) {
      const uris = res.assets.map(a => a.uri);
      setPhotos(p => [...p, ...uris].slice(0, 5));
    }
  };

  const pickIdPhoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.9 });
    if (!res.canceled) setIdPhoto(res.assets[0].uri);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) return Toast.show({ type:'error', text1: t('fill_required') });
    if (photos.length < 3) return Toast.show({ type:'error', text1: t('min_photos') });

    const ageNum = Number(form.age);
    if (!form.age || isNaN(ageNum) || ageNum < 20 || ageNum > 45) {
      return Toast.show({ type:'error', text1: t('age_range') });
    }

    if (!form.nationality) return Toast.show({ type:'error', text1: t('select_nationality_err') });
    if (!form.bio.trim()) return Toast.show({ type:'error', text1: t('bio_required') });

    if (!form.phone || !form.phone.trim()) {
      return Toast.show({ type: 'error', text1: t('phone_required') });
    }
    const EGYPTIAN_PHONE = /^01[0125][0-9]{8}$/;
    const phoneNorm = form.phone.trim().replace(/\s|-/g, '');
    if (!EGYPTIAN_PHONE.test(phoneNorm)) {
      return Toast.show({ type: 'error', text1: t('phone_invalid_eg') });
    }

    // ID validation
    if (isEgyptian) {
      const idCheck = validateNationalId(form.idNumber);
      if (!idCheck.valid) return Toast.show({ type:'error', text1: idCheck.message });
    } else {
      const passportCheck = validatePassport(form.idNumber);
      if (!passportCheck.valid) return Toast.show({ type:'error', text1: passportCheck.message });
      if (!idPhoto) return Toast.show({ type:'error', text1: t('upload_passport_photo_err') });
    }

    setLoading(true);
    try {
      await register({ ...form, phone: phoneNorm, role:'maid' });

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
        origin: getOrigin(form.nationality),
        experienceYears: Number(form.experienceYears),
        expectedSalary: Number(form.expectedSalary),
        bio: form.bio,
        skills: form.skills,
        languages: form.languages,
        photos: uploadedPhotos,
      });

      navigation.navigate('OTPVerification', {
        email: form.email,
        onVerified: () => navigation.navigate('SelfieVerification', {
          isEgyptian,
          idNumber: form.idNumber,
          idPhotoUri: isEgyptian ? null : idPhoto,
        }),
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
            <Text style={styles.label}>{t(key === 'name' ? 'full_name' : key)}{key === 'phone' ? ' *' : ''}</Text>
            <TextInput style={styles.input} value={form[key]} onChangeText={v=>upd(key,v)}
              placeholder={label} placeholderTextColor={COLORS.muted}
              keyboardType={kb} secureTextEntry={key==='password'} autoCapitalize="none"/>
          </View>
        ))}

        {/* Nationality dropdown */}
        <Text style={styles.label}>{t('nationality')} *</Text>
        <CountryPicker value={form.nationality} onChange={v => upd('nationality', v)}/>

        {/* Age + Experience */}
        <View style={styles.twoCol}>
          <View style={{ flex:1 }}>
            <Text style={styles.label}>{t('age')} (20–45) *</Text>
            <TextInput style={styles.input} value={form.age} onChangeText={v=>upd('age',v)} keyboardType="numeric" placeholder="25" placeholderTextColor={COLORS.muted}/>
            {form.age.length > 0 && (Number(form.age) < 20 || Number(form.age) > 45) && (
              <Text style={{ fontSize:11, color:COLORS.red, marginTop:3 }}>{t('must_be_20_45')}</Text>
            )}
          </View>
          <View style={{ flex:1 }}>
            <Text style={styles.label}>{t('experience')}</Text>
            <TextInput style={styles.input} value={form.experienceYears} onChangeText={v=>upd('experienceYears',v)} keyboardType="numeric" placeholder="3" placeholderTextColor={COLORS.muted}/>
          </View>
        </View>

        <Text style={styles.label}>{t('expected_salary_egp')}</Text>
        <TextInput style={styles.input} value={form.expectedSalary} onChangeText={v=>upd('expectedSalary',v)} keyboardType="numeric" placeholder="17,500" placeholderTextColor={COLORS.muted}/>

        {/* ID section — changes based on nationality */}
        <Text style={styles.label}>{isEgyptian ? `${t('national_id_label')} *` : `${t('passport_number')} *`}</Text>
        <TextInput style={styles.input}
          value={form.idNumber}
          onChangeText={v => upd('idNumber', isEgyptian ? v.replace(/\D/g,'') : v.toUpperCase())}
          placeholder={isEgyptian ? t('national_id_ph') : 'e.g. A1234567'}
          placeholderTextColor={COLORS.muted}
          keyboardType={isEgyptian ? 'numeric' : 'default'}
          autoCapitalize={isEgyptian ? 'none' : 'characters'}
          maxLength={isEgyptian ? 14 : 15}/>
        {form.idNumber.length > 0 && (
          <Text style={{ fontSize:11, marginTop:3, color: idValidation.valid ? '#2e7d5e' : COLORS.red }}>
            {idValidation.valid ? t('valid_format') : idValidation.message}
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
                    <Text style={{ fontSize:12, fontWeight:'700', color:COLORS.gold }}>{t('tap_upload_passport')}</Text>
                    <Text style={{ fontSize:10, color:COLORS.muted, marginTop:2 }}>{t('clear_photo_of_page')}</Text>
                  </>}
            </TouchableOpacity>
          </>
        )}


        <Text style={styles.label}>{t('bio')} *</Text>
        <TextInput style={[styles.input, { height:80, textAlignVertical:'top' }]} value={form.bio} onChangeText={v=>upd('bio',v)} multiline placeholder={t('bio') + '…'} placeholderTextColor={COLORS.muted}/>

        <Text style={styles.label}>{t('languages_spoken_label')}</Text>
        <View style={styles.skillsWrap}>
          {LANGUAGES.map(l => (
            <TouchableOpacity key={l} onPress={() => toggleLang(l)}
              style={[styles.skillChip, form.languages.includes(l) && styles.skillChipOn]}>
              <Text style={[styles.skillTxt, form.languages.includes(l) && styles.skillTxtOn]}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>

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
          <Text style={{ fontSize:12, fontWeight:'700', color:COLORS.gold }}>{t('tap_upload_photos')}</Text>
          <Text style={{ fontSize:10, color:COLORS.muted, marginTop:2 }}>{t('professional_photos_note')}</Text>
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
