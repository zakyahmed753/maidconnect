// src/screens/auth/SelfieVerificationScreen.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator, StatusBar, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { maidsAPI, uploadAPI } from '../../services/api';
import { COLORS, FONTS } from '../../utils/theme';

export default function SelfieVerificationScreen({ route, navigation }) {
  const { isEgyptian, idNumber, idPhotoUri, passportNumber, passportPhotoUri } = route.params || {};
  const resolvedIdNumber = idNumber || passportNumber;
  const resolvedIdPhotoUri = idPhotoUri || passportPhotoUri;
  const needsPassportPhoto = !isEgyptian && !resolvedIdPhotoUri; // resubmission for non-Egyptian
  const [selfieUri, setSelfieUri] = useState(null);
  const [resubmitPassportUri, setResubmitPassportUri] = useState(null);
  const [loading, setLoading] = useState(false);

  const takeSelfie = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      return Toast.show({ type: 'error', text1: 'Camera permission required' });
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
    if (!selfieUri) return Toast.show({ type: 'error', text1: 'Take or upload a selfie first' });
    if (needsPassportPhoto && !resubmitPassportUri) {
      return Toast.show({ type: 'error', text1: 'Upload your passport photo first' });
    }
    setLoading(true);
    try {
      // Upload ID photo (passport only — not needed for Egyptians)
      let passportPhotoUrl = null, passportPhotoPublicId = null;
      const passportUri = resolvedIdPhotoUri || resubmitPassportUri;
      if (!isEgyptian && passportUri) {
        const pRes = await uploadAPI.image(passportUri);
        passportPhotoUrl = pRes.data.url;
        passportPhotoPublicId = pRes.data.publicId;
      }

      // Upload selfie
      const sRes = await uploadAPI.image(selfieUri);
      const selfieUrl = sRes.data.url;
      const selfiePublicId = sRes.data.publicId;

      // Submit verification to backend
      await maidsAPI.submitVerification({
        ...(isEgyptian
          ? { nationalId: resolvedIdNumber }
          : { passportNumber: resolvedIdNumber, passportPhotoUrl, passportPhotoPublicId }),
        selfieUrl,
        selfiePublicId,
      });

      navigation.reset({ index: 0, routes: [{ name: 'PendingApproval' }] });
    } catch (err) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Submission failed' });
    } finally { setLoading(false); }
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content"/>
      <LinearGradient colors={['#1a1108', '#3d2203']} style={styles.hero}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 22, color: 'rgba(232,201,122,0.6)' }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.heroTitle}>Selfie Verification</Text>
        <Text style={styles.heroSub}>Step 2 of 2 — Identity Confirmation</Text>
      </LinearGradient>

      <ScrollView style={{ flex: 1, backgroundColor: COLORS.cream, padding: 20 }}>
        {/* Instructions */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>📸 Take a Clear Selfie</Text>
          {['Face the camera directly in good lighting',
            'Remove glasses or hats',
            'Plain background preferred',
            'This will be matched against your passport photo'].map(tip => (
            <Text key={tip} style={styles.infoItem}>• {tip}</Text>
          ))}
        </View>

        {/* Passport re-upload — only for non-Egyptian resubmission */}
        {needsPassportPhoto && (
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>🪪 Re-upload Passport Photo</Text>
            <Text style={styles.infoItem}>Your previous passport photo upload failed. Please upload it again.</Text>
            <TouchableOpacity style={[styles.galleryBtn, { marginTop: 10, marginBottom: 0 }]} onPress={pickPassportPhoto}>
              <Text style={styles.galleryBtnTxt}>{resubmitPassportUri ? '✅ Passport photo selected — tap to change' : '📎  Upload Passport Photo'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Selfie preview */}
        {selfieUri ? (
          <View style={styles.selfiePreview}>
            <Image source={{ uri: selfieUri }} style={styles.selfieImg}/>
            <TouchableOpacity style={styles.retakeBtn} onPress={takeSelfie}>
              <Text style={styles.retakeTxt}>Retake</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.selfieEmpty}>
            <Text style={{ fontSize: 48, marginBottom: 10 }}>🤳</Text>
            <Text style={{ fontSize: 13, color: COLORS.muted, textAlign: 'center' }}>No selfie yet</Text>
          </View>
        )}

        {/* Buttons */}
        <TouchableOpacity style={styles.cameraBtn} onPress={takeSelfie}>
          <Text style={styles.cameraBtnTxt}>📷  Open Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.galleryBtn} onPress={pickSelfie}>
          <Text style={styles.galleryBtnTxt}>🖼  Choose from Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitBtn, (!selfieUri || loading) && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!selfieUri || loading}>
          {loading
            ? <ActivityIndicator color={COLORS.dark}/>
            : <Text style={styles.submitBtnTxt}>Submit for Verification →</Text>}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Your documents are encrypted and only reviewed by Servix staff for identity verification purposes.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero:            { padding: 20, paddingTop: 54 },
  heroTitle:       { fontFamily: FONTS.display, fontSize: 24, color: '#e8c97a', marginTop: 8 },
  heroSub:         { fontSize: 12, color: 'rgba(232,201,122,0.5)', marginTop: 3 },
  infoBox:         { backgroundColor: '#fff9f0', borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 14, borderLeftWidth: 3, borderLeftColor: COLORS.gold, marginBottom: 20 },
  infoTitle:       { fontSize: 13, fontWeight: '700', color: COLORS.dark, marginBottom: 8 },
  infoItem:        { fontSize: 12, color: COLORS.muted, lineHeight: 20 },
  selfiePreview:   { alignItems: 'center', marginBottom: 16 },
  selfieImg:       { width: 180, height: 180, borderRadius: 90, borderWidth: 3, borderColor: COLORS.gold },
  retakeBtn:       { marginTop: 10, paddingHorizontal: 20, paddingVertical: 8, borderWidth: 1, borderColor: COLORS.border, borderRadius: 4 },
  retakeTxt:       { fontSize: 12, color: COLORS.muted },
  selfieEmpty:     { alignItems: 'center', justifyContent: 'center', height: 180, borderWidth: 1.5, borderStyle: 'dashed', borderColor: COLORS.border, borderRadius: 90, alignSelf: 'center', width: 180, marginBottom: 16 },
  cameraBtn:       { backgroundColor: COLORS.gold, padding: 14, borderRadius: 5, alignItems: 'center', marginBottom: 10 },
  cameraBtnTxt:    { fontFamily: FONTS.bodySemiBold, fontSize: 14, color: COLORS.dark },
  galleryBtn:      { padding: 13, borderRadius: 5, alignItems: 'center', marginBottom: 20, borderWidth: 1.5, borderColor: COLORS.border },
  galleryBtnTxt:   { fontSize: 14, color: COLORS.brown },
  submitBtn:       { backgroundColor: '#1a1108', padding: 15, borderRadius: 5, alignItems: 'center', marginBottom: 14 },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnTxt:    { fontFamily: FONTS.bodySemiBold, fontSize: 14, color: '#e8c97a', letterSpacing: 0.5 },
  disclaimer:      { fontSize: 11, color: COLORS.muted, textAlign: 'center', lineHeight: 16, marginBottom: 30 },
});
