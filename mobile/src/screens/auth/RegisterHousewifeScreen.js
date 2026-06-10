import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import useAuthStore from '../../store/authStore';
import { hwAPI } from '../../services/api';
import { COLORS, FONTS } from '../../utils/theme';
import { useTranslation } from '../../utils/i18n';

const CAIRO_AREAS = [
  { label: 'Maadi',          active: true  },
  { label: 'Zamalek',        active: true  },
  { label: 'New Cairo',      active: true  },
  { label: 'Heliopolis',     active: true  },
  { label: 'Sheikh Zayed',   active: true  },
  { label: '6th of October', active: true  },
  { label: 'Nasr City',      active: false },
  { label: 'Dokki',          active: false },
  { label: 'Mohandessin',    active: false },
  { label: 'Garden City',    active: false },
  { label: 'Rehab City',     active: false },
  { label: 'Madinaty',       active: false },
  { label: 'Other',          active: false },
];

export default function RegisterHousewifeScreen({ navigation }) {
  const { t } = useTranslation();
  const [form, setForm]         = useState({ name: '', email: '', password: '', phone: '' });
  const [area, setArea]         = useState('');
  const [loading, setLoading]   = useState(false);
  const register     = useAuthStore(s => s.register);
  const completeAuth = useAuthStore(s => s.completeAuth);

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password || !form.phone) {
      return Toast.show({ type: 'error', text1: t('fill_required') });
    }
    if (!area) {
      return Toast.show({ type: 'error', text1: t('select_area_err') });
    }
    const EGYPTIAN_PHONE = /^01[0125][0-9]{8}$/;
    const normalizedPhone = form.phone.trim().replace(/\s|-/g, '');
    if (!EGYPTIAN_PHONE.test(normalizedPhone)) {
      return Toast.show({ type: 'error', text1: t('phone_invalid_hw') });
    }
    setLoading(true);
    try {
      await register({ ...form, phone: normalizedPhone, role: 'housewife' });
      // Save selected area to profile
      await hwAPI.updateProfile({ residentialArea: area });
      // Now load the full profile — AppNavigator routes based on area
      await completeAuth();
    } catch (err) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || t('registration_failed') });
    } finally { setLoading(false); }
  };

  const FIELDS = [
    [t('full_name') + ' *', 'name',     'default',       false],
    [t('email') + ' *',     'email',    'email-address', false],
    [t('password') + ' *',  'password', 'default',       true ],
    [t('phone') + ' *',     'phone',    'phone-pad',     false],
  ];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content"/>
      <LinearGradient colors={['#1a1108', '#3d2203']} style={styles.hero}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 22, color: 'rgba(232,201,122,0.6)' }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.heroTitle}>{t('sign_up')}</Text>
        <Text style={styles.heroSub}>{t('customer_subtitle')}</Text>
      </LinearGradient>

      <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">

        {FIELDS.map(([label, key, kb, secure]) => (
          <View key={key}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
              style={styles.input}
              value={form[key]}
              onChangeText={v => upd(key, v)}
              placeholder={label.replace(' *', '')}
              placeholderTextColor={COLORS.muted}
              keyboardType={kb}
              secureTextEntry={secure}
              autoCapitalize="none"
            />
          </View>
        ))}

        {/* Area selection */}
        <Text style={styles.label}>{t('your_area_cairo')} *</Text>
        <View style={styles.areaGrid}>
          {CAIRO_AREAS.map(({ label, active }) => {
            const selected = area === label;
            return (
              <TouchableOpacity
                key={label}
                style={[
                  styles.areaChip,
                  selected   && styles.areaChipSelected,
                  !active    && styles.areaChipSoon,
                ]}
                onPress={() => setArea(label)}>
                <Text style={[
                  styles.areaChipTxt,
                  selected && styles.areaChipTxtSelected,
                  !active  && styles.areaChipTxtSoon,
                ]}>
                  {label}
                </Text>
                {!active && (
                  <Text style={styles.areaSoonBadge}>{t('area_soon_badge')}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
        {area !== '' && !CAIRO_AREAS.find(a => a.label === area)?.active && (
          <View style={styles.waitlistNote}>
            <Text style={{ fontSize: 12, color: '#b45309' }}>
              ⏳ We're not in {area} yet — you'll be on the waitlist and notified on launch.
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={loading}>
          <Text style={styles.btnTxt}>{loading ? t('loading') : t('sign_up')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Login', { role: 'housewife' })}>
          <Text style={styles.linkTxt}>{t('have_account')} <Text style={{ color: COLORS.gold }}>{t('sign_in_link')}</Text></Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  hero:               { padding: 20, paddingTop: 54 },
  heroTitle:          { fontFamily: FONTS.display, fontSize: 26, color: '#e8c97a', marginTop: 8 },
  heroSub:            { fontSize: 12, color: 'rgba(232,201,122,0.5)', marginTop: 3 },
  body:               { flex: 1, backgroundColor: COLORS.cream, padding: 22 },
  label:              { fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: COLORS.muted, marginBottom: 5, marginTop: 14, fontFamily: FONTS.bodySemiBold },
  input:              { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 5, padding: 13, fontSize: 14, color: COLORS.text, backgroundColor: COLORS.surface },

  areaGrid:           { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  areaChip:           { paddingHorizontal: 13, paddingVertical: 9, borderRadius: 20, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.surface, flexDirection: 'row', alignItems: 'center', gap: 5 },
  areaChipSelected:   { borderColor: COLORS.gold, backgroundColor: COLORS.gold },
  areaChipSoon:       { borderStyle: 'dashed', opacity: 0.65 },
  areaChipTxt:        { fontSize: 13, color: COLORS.text },
  areaChipTxtSelected:{ color: COLORS.dark, fontWeight: '700' },
  areaChipTxtSoon:    { color: COLORS.muted },
  areaSoonBadge:      { fontSize: 8, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.5 },

  waitlistNote:       { marginTop: 8, backgroundColor: '#fffbeb', borderWidth: 1, borderColor: '#f59e0b', borderRadius: 6, padding: 10 },

  btn:                { backgroundColor: COLORS.gold, padding: 15, borderRadius: 5, alignItems: 'center', marginTop: 24 },
  btnDisabled:        { opacity: 0.5 },
  btnTxt:             { fontFamily: FONTS.bodySemiBold, fontSize: 14, color: COLORS.dark, letterSpacing: 0.5 },
  link:               { alignItems: 'center', marginTop: 18, marginBottom: 30 },
  linkTxt:            { fontSize: 13, color: COLORS.muted },
});
