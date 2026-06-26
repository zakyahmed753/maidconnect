// src/screens/auth/SelfieVerificationScreen.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator, StatusBar, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { maidsAPI, uploadAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import { COLORS, FONTS } from '../../utils/theme';
import BackChevron from '../../components/BackChevron';
import { useTranslation } from '../../utils/i18n';

export default function SelfieVerificationScreen({ route, navigation }) {
  const { isEgyptian, idNumber, idPhotoUri, passportNumber, passportPhotoUri, isResubmit } = route.params || {};
  const completeAuth = useAuthStore(s => s.completeAuth);
  const { t } = useTranslation();
  const resolvedIdNumber = idNumber || passportNumber;
  const resolvedIdPhotoUri = idPhotoUri || passportPhotoUri;
  const needsPassportPhoto = !isEgyptian && !resolvedIdPhotoUri;
  const [selfieUri, setSelfieUri] = useState(null);
  const [resubmitPassportUri, setResubmitPassportUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const takeSelfie = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      return Toast.show({ type: 'error', text1: t('camera_permission') });
    }
    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
      cameraType: ImagePicker.CameraType.front,
    });
    if (!res.canceled) setSelfieUri(res.assets[0].uri);
  };

  const pickSelfie = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!res.canceled) setSelfieUri(res.assets[0].uri);
  };

  const pickPassportPhoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.9,
    });
    if (!res.canceled) setResubmitPassportUri(res.assets[0].uri);
  };

  const handleSubmit = async () => {
    if (!selfieUri) return setSubmitError(t('selfie_required'));
    if (needsPassportPhoto && !resubmitPassportUri) {
      return setSubmitError(t('selfie_passport_required'));
    }
    setLoading(true);
    setSubmitError(null);
    try {
      let passportPhotoUrl = null, passportPhotoPublicId = null;
      const passportUri = resolvedIdPhotoUri || resubmitPassportUri;
      if (!isEgyptian && passportUri) {
        const pRes = await uploadAPI.image(passportUri);
        passportPhotoUrl = pRes.data.url;
        passportPhotoPublicId = pRes.data.publicId;
      }

      const sRes = await uploadAPI.image(selfieUri);
      const selfieUrl = sRes.data.url;
      const selfiePublicId = sRes.data.publicId;

      await maidsAPI.submitVerification({
        ...(isEgyptian
          ? { nationalId: resolvedIdNumber }
          : { passportNumber: resolvedIdNumber, passportPhotoUrl, passportPhotoPublicId }),
        selfieUrl,
        selfiePublicId,
      });

      await completeAuth();
      if (isResubmit && navigation.canGoBack()) {
        navigation.goBack();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Submission failed. Check your connection and try again.';
      setSubmitError(msg);
    } finally { setLoading(false); }
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content"/>
      <LinearGradient colors={['#0D3827', '#0d5e4a']} style={styles.hero}>
        {navigation.canGoBack() && (
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ width:38, height:38, borderRadius:19, backgroundColor:'rgba(255,255,255,0.2)', alignItems:'center', justifyContent:'center' }}>
            <BackChevron />
          </TouchableOpacity>
        )}
        <Text style={styles.heroTitle}>{t('selfie_title')}</Text>
        <Text style={styles.heroSub}>{t('selfie_step')}</Text>
      </LinearGradient>

      <ScrollView style={{ flex: 1, backgroundColor: COLORS.cream, padding: 20 }}>
        {/* Instructions */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>{t('selfie_tip_title')}</Text>
          {[t('selfie_tip1'), t('selfie_tip2'), t('selfie_tip3'), t('selfie_tip4')].map((tip, i) => (
            <Text key={i} style={styles.infoItem}>• {tip}</Text>
          ))}
        </View>

        {/* Passport re-upload — only for non-Egyptian resubmission */}
        {needsPassportPhoto && (
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>{t('selfie_reupload_title')}</Text>
            <Text style={styles.infoItem}>{t('selfie_reupload_body')}</Text>
            <TouchableOpacity style={[styles.galleryBtn, { marginTop: 10, marginBottom: 0 }]} onPress={pickPassportPhoto}>
              <Text style={styles.galleryBtnTxt}>{resubmitPassportUri ? t('selfie_passport_selected') : t('selfie_upload_passport')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Selfie preview */}
        {selfieUri ? (
          <View style={styles.selfiePreview}>
            <Image source={{ uri: selfieUri }} style={styles.selfieImg}/>
            <TouchableOpacity style={styles.retakeBtn} onPress={takeSelfie}>
              <Text style={styles.retakeTxt}>{t('selfie_retake')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.selfieEmpty}>
            <Text style={{ fontSize: 48, marginBottom: 10 }}>🤳</Text>
            <Text style={{ fontSize: 13, color: COLORS.muted, textAlign: 'center' }}>{t('selfie_no_selfie')}</Text>
          </View>
        )}

        {/* Buttons */}
        <TouchableOpacity style={styles.cameraBtn} onPress={takeSelfie}>
          <Text style={styles.cameraBtnTxt}>{t('selfie_open_camera')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.galleryBtn} onPress={pickSelfie}>
          <Text style={styles.galleryBtnTxt}>{t('selfie_gallery')}</Text>
        </TouchableOpacity>

        {submitError && (
          <View style={{ backgroundColor: 'rgba(224,85,85,0.1)', borderWidth: 1, borderColor: 'rgba(224,85,85,0.4)', borderRadius: 8, padding: 12, marginBottom: 12 }}>
            <Text style={{ fontSize: 12, color: '#e05555', lineHeight: 18 }}>⚠ {submitError}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.submitBtn, (!selfieUri || loading) && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!selfieUri || loading}>
          {loading
            ? <ActivityIndicator color={COLORS.dark}/>
            : <Text style={styles.submitBtnTxt}>{submitError ? t('selfie_try_again') : t('selfie_submit')}</Text>}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>{t('selfie_disclaimer')}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero:            { padding: 20, paddingTop: 54 },
  heroTitle:       { fontFamily: FONTS.display, fontSize: 24, color: '#fff', marginTop: 8 },
  heroSub:         { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 3 },
  infoBox:         { backgroundColor: '#e8f4f1', borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 14, borderLeftWidth: 3, borderLeftColor: COLORS.green, marginBottom: 20 },
  infoTitle:       { fontSize: 13, fontWeight: '700', color: COLORS.dark, marginBottom: 8 },
  infoItem:        { fontSize: 12, color: COLORS.muted, lineHeight: 20 },
  selfiePreview:   { alignItems: 'center', marginBottom: 16 },
  selfieImg:       { width: 180, height: 180, borderRadius: 90, borderWidth: 3, borderColor: COLORS.green },
  retakeBtn:       { marginTop: 10, paddingHorizontal: 20, paddingVertical: 8, borderWidth: 1, borderColor: COLORS.border, borderRadius: 4 },
  retakeTxt:       { fontSize: 12, color: COLORS.muted },
  selfieEmpty:     { alignItems: 'center', justifyContent: 'center', height: 180, borderWidth: 1.5, borderStyle: 'dashed', borderColor: COLORS.border, borderRadius: 90, alignSelf: 'center', width: 180, marginBottom: 16 },
  cameraBtn:       { backgroundColor: COLORS.green, padding: 14, borderRadius: 5, alignItems: 'center', marginBottom: 10 },
  cameraBtnTxt:    { fontFamily: FONTS.bodySemiBold, fontSize: 14, color: '#fff' },
  galleryBtn:      { padding: 13, borderRadius: 5, alignItems: 'center', marginBottom: 20, borderWidth: 1.5, borderColor: COLORS.border },
  galleryBtnTxt:   { fontSize: 14, color: COLORS.dark },
  submitBtn:       { backgroundColor: COLORS.green, padding: 15, borderRadius: 5, alignItems: 'center', marginBottom: 14 },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnTxt:    { fontFamily: FONTS.bodySemiBold, fontSize: 14, color: '#fff', letterSpacing: 0.5 },
  disclaimer:      { fontSize: 11, color: COLORS.muted, textAlign: 'center', lineHeight: 16, marginBottom: 30 },
});
