import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  StatusBar, ActivityIndicator, Modal, Pressable,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { COLORS, FONTS } from '../../utils/theme';
import useAuthStore from '../../store/authStore';
import { hwAPI, paymentsAPI, uploadAPI } from '../../services/api';
import * as ImagePicker from 'expo-image-picker';
import BackChevron from '../../components/BackChevron';
import { useTranslation } from '../../utils/i18n';

const PRICE = 1000;

export default function CustomerSubscriptionScreen({ route, navigation }) {
  const { maidUserId, maidProfileId, maidName } = route.params || {};
  const completeAuth = useAuthStore(s => s.completeAuth);
  const { t } = useTranslation();

  const FEATURES = [
    ['chatbubble-outline',        '#7c3aed', t('feat_chat_any')],
    ['document-text-outline',     COLORS.green, t('feat_profile_refs')],
    ['checkmark-done-outline',    '#0891b2', t('feat_hire_inapp')],
    ['star-outline',              '#f59e0b', t('feat_leave_reviews')],
    ['refresh-outline',           '#2e7d5e', t('feat_free_replace')],
  ];

  const [offlineModal,   setOfflineModal]   = useState(false);
  const [receiptUri,     setReceiptUri]     = useState(null);
  const [submitting,     setSubmitting]     = useState(false);
  const [submitError,    setSubmitError]    = useState(null);
  const [pendingPayment, setPendingPayment] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(false);

  // On every focus: check if subscription is already active or receipt pending
  useFocusEffect(
    React.useCallback(() => {
      completeAuth().catch(() => {});
      paymentsAPI.getHistory()
        .then(r => {
          const pending = (r.data?.payments || []).find(
            p => p.type === 'customer_subscription' && p.method === 'cash_transfer' && p.status === 'pending'
          );
          setPendingPayment(pending || null);
        })
        .catch(() => {});
    }, [])
  );

  const handleCheckPendingStatus = async () => {
    if (!pendingPayment?._id) return;
    setCheckingStatus(true);
    try {
      const res = await paymentsAPI.checkStatus(pendingPayment._id);
      if (res.data?.status === 'completed') {
        await completeAuth();
        if (maidUserId) {
          const { chatsAPI } = require('../../services/api');
          const chatRes = await chatsAPI.startChat({ maidUserId, maidProfileId });
          navigation.replace('Chat', { chatId: chatRes.data.chat._id, maidName });
        } else {
          navigation.goBack();
        }
      } else if (res.data?.status === 'failed') {
        setPendingPayment(null);
        Toast.show({ type: 'info', text1: t('receipt_rejected'), text2: t('receipt_rejected_sub') });
      } else {
        Toast.show({ type: 'info', text1: t('still_pending'), text2: t('receipt_still_pending_sub') });
      }
    } catch {
      Toast.show({ type: 'error', text1: t('could_not_check') });
    } finally {
      setCheckingStatus(false);
    }
  };

  const pickReceipt = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });
    if (!res.canceled) setReceiptUri(res.assets[0].uri);
  };

  const submitOfflinePayment = async () => {
    if (!receiptUri) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const up  = await uploadAPI.image(receiptUri);
      const res = await hwAPI.requestOfflinePayment({
        receiptUrl:      up.data.url,
        receiptPublicId: up.data.publicId,
      });
      setOfflineModal(false);
      setReceiptUri(null);
      navigation.navigate('PaymentResult', {
        amount:    PRICE,
        paymentId: res.data.payment?._id,
        isOffline: true,
        goTo:      'Browse',
      });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || t('save_failed');
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => { setOfflineModal(false); setReceiptUri(null); setSubmitError(null); };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0D3827', '#0d5e4a']} style={styles.hero}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ width:38, height:38, borderRadius:19, backgroundColor:'rgba(255,255,255,0.2)', alignItems:'center', justifyContent:'center', marginBottom:10 }}>
          <BackChevron />
        </TouchableOpacity>
        <Ionicons name="chatbubbles" size={36} color="#fff" style={{ marginBottom: 8 }} />
        <Text style={styles.heroTitle}>{t('unlock_chat_access')}</Text>
        <Text style={styles.heroSub}>{t('cust_sub_hero_sub')}</Text>
      </LinearGradient>

      <ScrollView style={{ backgroundColor: COLORS.cream }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

        {/* Pending receipt banner */}
        {pendingPayment && (
          <View style={styles.pendingBanner}>
            <Text style={styles.pendingTitle}>{t('receipt_under_review')}</Text>
            <Text style={styles.pendingSub}>{t('cust_sub_receipt_body')}</Text>
            <TouchableOpacity
              onPress={handleCheckPendingStatus}
              disabled={checkingStatus}
              style={[styles.checkBtn, checkingStatus && { opacity: 0.6 }]}>
              {checkingStatus
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.checkBtnTxt}>{t('check_confirmation_status')}</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setPendingPayment(null)} style={{ alignItems: 'center', paddingTop: 10 }}>
              <Text style={{ fontSize: 11, color: COLORS.muted }}>{t('submit_new_receipt')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Features card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>{t('what_you_get')}</Text>
          {FEATURES.map(([icon, iconColor, text]) => (
            <View key={icon} style={styles.featureRow}>
              <Ionicons name={icon} size={18} color={iconColor} />
              <Text style={{ fontSize: 13, color: COLORS.text, flex: 1 }}>{text}</Text>
            </View>
          ))}
        </View>

        {/* Price card */}
        <View style={[styles.card, { alignItems: 'center', paddingVertical: 20 }]}>
          <Text style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>{t('monthly_plan_name')}</Text>
          <Text style={{ fontFamily: FONTS.display, fontSize: 40, color: COLORS.green }}>EGP {PRICE.toLocaleString()}</Text>
          <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 4 }}>{t('cancel_anytime')}</Text>
        </View>

        {/* Cash Transfer button */}
        <TouchableOpacity style={styles.offlineBtn} onPress={() => setOfflineModal(true)}>
          <Ionicons name="cash-outline" size={24} color={COLORS.green} />
          <View style={{ flex: 1 }}>
            <Text style={styles.offlineTxt}>{t('pay_cash')}</Text>
            <Text style={styles.offlineSub}>{t('instapay_voda_hint')}</Text>
          </View>
          <Text style={{ color: COLORS.muted, fontSize: 16 }}>›</Text>
        </TouchableOpacity>

        {/* Already paid check */}
        <TouchableOpacity
          style={{ alignItems: 'center', paddingVertical: 12 }}
          onPress={async () => {
            try {
              await completeAuth();
              if (maidUserId) {
                const { chatsAPI } = require('../../services/api');
                const chatRes = await chatsAPI.startChat({ maidUserId, maidProfileId });
                navigation.replace('Chat', { chatId: chatRes.data.chat._id, maidName });
              } else {
                navigation.goBack();
              }
            } catch {
              Toast.show({ type: 'info', text1: t('sub_not_active') });
            }
          }}>
          <Text style={{ fontSize: 12, color: COLORS.muted }}>{t('already_paid_check')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{ alignItems: 'center', padding: 12 }} onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 13, color: COLORS.muted }}>{t('maybe_later')}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Offline Payment Modal */}
      <Modal visible={offlineModal} transparent animationType="slide" statusBarTranslucent>
        <Pressable style={styles.modalOverlay} onPress={closeModal} />
        <ScrollView style={styles.modalSheet} contentContainerStyle={{ paddingBottom: 36 }} bounces={false}>
          <View style={styles.modalHandle} />

          <Text style={styles.modalTitle}>{t('cash_transfer_title')}</Text>
          <Text style={styles.modalSub}>{t('cash_transfer_modal_sub')}</Text>

          {/* Amount box */}
          <View style={styles.amountBox}>
            <Text style={styles.amountLabel}>{t('amount_due')}</Text>
            <Text style={styles.amountVal}>EGP {PRICE.toLocaleString()}</Text>
            <Text style={styles.amountNote}>{t('monthly_access_note')}</Text>
          </View>

          {/* Payment details */}
          <Text style={styles.detailsHeader}>{t('transfer_to')}</Text>
          {[
            { icon: 'flash-outline',          label: 'Instapay',       value: '01022781113' },
            { icon: 'phone-portrait-outline', label: 'Vodafone Cash',  value: '01022781113' },
          ].map(({ icon, label, value }) => (
            <View key={label} style={styles.detailRow}>
              <Ionicons name={icon} size={20} color={COLORS.green} />
              <View style={{ flex: 1 }}>
                <Text style={styles.detailLabel}>{label}</Text>
                <Text style={styles.detailValue}>{value}</Text>
              </View>
            </View>
          ))}
          <View style={styles.nameRow}>
            <Text style={styles.detailLabel}>{t('account_name')}</Text>
            <Text style={styles.detailValue}>Ahmed Ibrahim Zaky Ahmed Ismail</Text>
          </View>

          {/* Receipt upload */}
          <Text style={[styles.detailsHeader, { marginTop: 18 }]}>{t('upload_receipt')}</Text>
          <TouchableOpacity style={styles.receiptBtn} onPress={pickReceipt}>
            {receiptUri ? (
              <Text style={{ fontSize: 12, color: '#2e7d5e', fontWeight: '700' }}>{t('receipt_selected')}</Text>
            ) : (
              <>
                <Text style={{ fontSize: 24, marginBottom: 6 }}>📎</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.green }}>{t('tap_upload_receipt')}</Text>
                <Text style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>{t('receipt_screenshot_note')}</Text>
              </>
            )}
          </TouchableOpacity>

          {submitError && (
            <View style={styles.errorBox}>
              <Text style={{ fontSize: 12, color: '#e05555', lineHeight: 17 }}>⚠ {submitError}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.submitBtn, (!receiptUri || submitting) && { opacity: 0.5 }]}
            onPress={submitOfflinePayment}
            disabled={!receiptUri || submitting}>
            {submitting
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.submitTxt}>{submitError ? t('retry') : t('cust_submit_receipt')}</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={{ alignItems: 'center', paddingVertical: 12 }} onPress={closeModal}>
            <Text style={{ fontSize: 13, color: COLORS.muted }}>{t('cancel')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  hero:        { padding: 22, paddingTop: 54, alignItems: 'center' },
  heroTitle:   { fontFamily: FONTS.display, fontSize: 26, color: '#fff', marginBottom: 5 },
  heroSub:     { fontSize: 12, color: 'rgba(255,255,255,0.7)', textAlign: 'center' },

  pendingBanner: { backgroundColor: 'rgba(13,56,39,0.08)', borderWidth: 1.5, borderColor: COLORS.green, borderRadius: 10, padding: 16, marginBottom: 16 },
  pendingTitle:  { fontFamily: FONTS.display, fontSize: 17, color: COLORS.dark, marginBottom: 4 },
  pendingSub:    { fontSize: 12, color: COLORS.muted, lineHeight: 18, marginBottom: 14 },
  checkBtn:      { backgroundColor: COLORS.green, padding: 12, borderRadius: 8, alignItems: 'center' },
  checkBtnTxt:   { fontFamily: FONTS.bodySemiBold, fontSize: 13, color: '#fff' },

  card:        { backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 10, padding: 16, marginBottom: 12 },
  cardLabel:   { fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: COLORS.muted, fontFamily: FONTS.bodySemiBold, marginBottom: 12 },
  featureRow:  { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: COLORS.border },

  offlineBtn:  { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.green, borderRadius: 8, padding: 14, marginBottom: 10 },
  offlineTxt:  { fontSize: 13, fontWeight: '600', color: COLORS.dark },
  offlineSub:  { fontSize: 11, color: COLORS.muted, marginTop: 1 },

  modalOverlay:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  modalSheet:    { backgroundColor: COLORS.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 22 },
  modalHandle:   { width: 40, height: 4, backgroundColor: COLORS.border, borderRadius: 2, alignSelf: 'center', marginBottom: 18 },
  modalTitle:    { fontFamily: FONTS.display, fontSize: 22, color: COLORS.dark, marginBottom: 6 },
  modalSub:      { fontSize: 12, color: COLORS.muted, lineHeight: 18, marginBottom: 18 },
  amountBox:     { backgroundColor: '#e8f4f1', borderWidth: 1.5, borderColor: COLORS.green, borderRadius: 10, padding: 14, alignItems: 'center', marginBottom: 18 },
  amountLabel:   { fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: COLORS.muted, marginBottom: 4 },
  amountVal:     { fontFamily: FONTS.display, fontSize: 28, color: COLORS.green },
  amountNote:    { fontSize: 11, color: COLORS.muted, marginTop: 3 },
  detailsHeader: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.2, color: COLORS.muted, marginBottom: 8, fontWeight: '700' },
  detailRow:     { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.cream, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12, marginBottom: 8 },
  nameRow:       { backgroundColor: COLORS.cream, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12, marginBottom: 4 },
  detailLabel:   { fontSize: 10, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
  detailValue:   { fontSize: 15, fontWeight: '700', color: COLORS.dark, letterSpacing: 0.5 },
  receiptBtn:    { borderWidth: 1.5, borderStyle: 'dashed', borderColor: COLORS.green, borderRadius: 8, padding: 18, alignItems: 'center', backgroundColor: '#e8f4f1', marginBottom: 16 },
  errorBox:      { backgroundColor: 'rgba(224,85,85,0.12)', borderWidth: 1, borderColor: 'rgba(224,85,85,0.4)', borderRadius: 7, padding: 12, marginBottom: 12 },
  submitBtn:     { backgroundColor: COLORS.green, padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 4 },
  submitTxt:     { fontFamily: FONTS.bodySemiBold, fontSize: 13, color: '#fff', letterSpacing: 0.3 },
});
