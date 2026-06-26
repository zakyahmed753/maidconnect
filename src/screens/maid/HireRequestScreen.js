import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  ActivityIndicator, StatusBar, Modal, Pressable
} from 'react-native';

const TERMS_EN = `TERMS & CONDITIONS – Servix Platform

1. PLATFORM NATURE
Servix is a technology platform that facilitates communication between independent service providers ("Workers") and customers. Servix is not an employer, recruitment agency, labor office, sponsor, guarantor, or representative of any Worker listed on the platform.

2. INDEPENDENT RELATIONSHIP
Any agreement, engagement, employment, payment, accommodation, transportation, supervision, or other arrangement made between a customer and a Worker is solely between those parties.

3. NO RESPONSIBILITY FOR WORKER CONDUCT
Servix does not control, supervise, monitor, direct, or manage Workers during or after any engagement.

Accordingly, Servix shall not be liable for:
• The behavior, attitude, actions, negligence, misconduct, or performance of any Worker.
• Theft, fraud, misrepresentation, property damage, personal injury, disputes, conflicts, or any unlawful acts committed by any Worker.
• Any losses, damages, costs, claims, injuries, or expenses arising from interactions between customers and Workers.

4. CUSTOMER DUE DILIGENCE
Customers are solely responsible for:
• Verifying the identity and legal status of any Worker.
• Conducting interviews and background checks where appropriate.
• Monitoring and supervising the Worker during any service period.
• Taking reasonable security measures to protect family members, children, elderly persons, valuables, and property.

5. SAFETY RECOMMENDATION
Customers are strongly advised to:
• Never leave children unattended with a Worker before establishing trust.
• Secure valuables, cash, documents, jewelry, and sensitive information.
• Verify identity documents when required by law.
• Maintain appropriate supervision during service delivery.

6. NO GUARANTEES
Servix makes no warranties or guarantees regarding:
• Character, honesty, reliability, qualifications, skills, experience, behavior, availability, or suitability of any Worker.

7. CUSTOMER ASSUMPTION OF RISK
The customer voluntarily assumes all risks associated with hiring, engaging, communicating with, or allowing access to any Worker.

8. LIMITATION OF LIABILITY
To the maximum extent permitted by applicable law, Servix, its owners, employees, affiliates, and partners shall not be liable for any direct, indirect, incidental, consequential, special, punitive, or exemplary damages arising from use of the platform.

9. USER ACCEPTANCE
By clicking "Accept", the customer confirms that they understand and agree that Servix acts solely as a communication and marketplace platform and is not responsible for the acts, omissions, conduct, or performance of Workers.`;

const TERMS_AR = `Ø§Ù„Ø´Ø±ÙˆØ· ÙˆØ§Ù„Ø£Ø­ÙƒØ§Ù… – Ù…Ù†ØµØ© Servix

1. Ø·Ø¨ÙŠØ¹Ø© Ø§Ù„Ù…Ù†ØµØ©
ØªØ·Ø¨ÙŠÙ‚ Servix Ù‡Ùˆ Ù…Ù†ØµØ© ØªÙ‚Ù†ÙŠØ© ØªÙ‡Ø¯Ù ÙÙ‚Ø· Ø¥Ù„Ù‰ ØªØ³Ù‡ÙŠÙ„ Ø§Ù„ØªÙˆØ§ØµÙ„ Ø¨ÙŠÙ† Ø§Ù„Ø¹Ù…Ù„Ø§Ø¡ ÙˆÙ…Ù‚Ø¯Ù…ÙŠ Ø§Ù„Ø®Ø¯Ù…Ø§Øª Ø§Ù„Ù…Ø³ØªÙ‚Ù„ÙŠÙ†ØŒ ÙˆÙ„Ø§ ÙŠØ¹ØªØ¨Ø± ØµØ§Ø­Ø¨ Ø¹Ù…Ù„ Ø£Ùˆ Ù…ÙƒØªØ¨ ØªÙˆØ¸ÙŠÙ Ø£Ùˆ Ø¬Ù‡Ø© ÙƒÙØ§Ù„Ø© Ø£Ùˆ Ù…Ù…Ø«Ù„Ù‹Ø§ Ù„Ø£ÙŠ Ø¹Ø§Ù…Ù„Ø© Ø£Ùˆ Ù…Ù‚Ø¯Ù… Ø®Ø¯Ù…Ø©.

2. Ø§Ù„Ø¹Ù„Ø§Ù‚Ø© Ø¨ÙŠÙ† Ø§Ù„Ø£Ø·Ø±Ø§Ù
Ø£ÙŠ Ø§ØªÙØ§Ù‚ Ø£Ùˆ ØªØ¹Ø§Ù‚Ø¯ Ø£Ùˆ ØªØ´ØºÙŠÙ„ Ø£Ùˆ Ø¯ÙØ¹ Ø£Ùˆ Ø¥Ù‚Ø§Ù…Ø© Ø£Ùˆ Ø¥Ø´Ø±Ø§Ù ÙŠØªÙ… Ø¨ÙŠÙ† Ø§Ù„Ø¹Ù…ÙŠÙ„ ÙˆØ§Ù„Ø¹Ø§Ù…Ù„Ø© ÙŠÙƒÙˆÙ† Ù…Ø³Ø¤ÙˆÙ„ÙŠØ© Ø§Ù„Ø·Ø±ÙÙŠÙ† ÙÙ‚Ø· Ø¯ÙˆÙ† Ø£ÙŠ Ù…Ø³Ø¤ÙˆÙ„ÙŠØ© Ø¹Ù„Ù‰ Servix.

3. Ø¥Ø®Ù„Ø§Ø¡ Ø§Ù„Ù…Ø³Ø¤ÙˆÙ„ÙŠØ©
Ù„Ø§ ÙŠÙ‚ÙˆÙ… Servix Ø¨Ø§Ù„Ø¥Ø´Ø±Ø§Ù Ø£Ùˆ Ø§Ù„Ø¥Ø¯Ø§Ø±Ø© Ø£Ùˆ Ø§Ù„Ù…Ø±Ø§Ù‚Ø¨Ø© Ø§Ù„Ù…Ø³ØªÙ…Ø±Ø© Ù„Ù„Ø¹Ø§Ù…Ù„Ø§ØªØŒ ÙˆØ¨Ø§Ù„ØªØ§Ù„ÙŠ Ù„Ø§ ÙŠØªØ­Ù…Ù„ Ø£ÙŠ Ù…Ø³Ø¤ÙˆÙ„ÙŠØ© Ø¹Ù†:
• Ø³Ù„ÙˆÙƒ Ø£Ùˆ ØªØµØ±ÙØ§Øª Ø£Ùˆ Ø£Ø¯Ø§Ø¡ Ø£ÙŠ Ø¹Ø§Ù…Ù„Ø©.
• Ø§Ù„Ø³Ø±Ù‚Ø© Ø£Ùˆ Ø§Ù„Ø§Ø­ØªÙŠØ§Ù„ Ø£Ùˆ Ø¥Ø³Ø§Ø¡Ø© Ø§Ù„ØªØµØ±Ù Ø£Ùˆ Ø§Ù„Ø¥Ù‡Ù…Ø§Ù„ Ø£Ùˆ Ø§Ù„Ø£Ø¶Ø±Ø§Ø± Ø§Ù„Ù…Ø§Ø¯ÙŠØ© Ø£Ùˆ Ø§Ù„Ø¬Ø³Ø¯ÙŠØ©.
• Ø£ÙŠ Ù†Ø²Ø§Ø¹Ø§Øª Ø£Ùˆ Ø®Ù„Ø§ÙØ§Øª Ø£Ùˆ Ù…Ø·Ø§Ù„Ø¨Ø§Øª ØªÙ†Ø´Ø£ Ø¨ÙŠÙ† Ø§Ù„Ø¹Ù…ÙŠÙ„ ÙˆØ§Ù„Ø¹Ø§Ù…Ù„Ø©.
• Ø£ÙŠ Ø®Ø³Ø§Ø¦Ø± Ù…Ø¨Ø§Ø´Ø±Ø© Ø£Ùˆ ØºÙŠØ± Ù…Ø¨Ø§Ø´Ø±Ø© ØªÙ†ØªØ¬ Ø¹Ù† Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„Ù…Ù†ØµØ©.

4. Ù…Ø³Ø¤ÙˆÙ„ÙŠØ© Ø§Ù„Ø¹Ù…ÙŠÙ„
ÙŠÙ‚Ø± Ø§Ù„Ø¹Ù…ÙŠÙ„ Ø¨Ø£Ù†Ù‡ Ø§Ù„Ù…Ø³Ø¤ÙˆÙ„ Ø§Ù„ÙˆØ­ÙŠØ¯ Ø¹Ù†:
• Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ù‡ÙˆÙŠØ© Ø§Ù„Ø¹Ø§Ù…Ù„Ø© ÙˆØµØ­Ø© Ù…Ø³ØªÙ†Ø¯Ø§ØªÙ‡Ø§.
• Ø¥Ø¬Ø±Ø§Ø¡ Ø§Ù„Ù…Ù‚Ø§Ø¨Ù„Ø§Øª ÙˆØ§Ù„ÙØ­Øµ Ø§Ù„Ù…Ù†Ø§Ø³Ø¨ Ù‚Ø¨Ù„ Ø§Ù„ØªØ¹Ø§Ù‚Ø¯.
• Ù…ØªØ§Ø¨Ø¹Ø© Ø§Ù„Ø¹Ø§Ù…Ù„Ø© ÙˆØ§Ù„Ø¥Ø´Ø±Ø§Ù Ø¹Ù„ÙŠÙ‡Ø§ Ø£Ø«Ù†Ø§Ø¡ ØªÙ‚Ø¯ÙŠÙ… Ø§Ù„Ø®Ø¯Ù…Ø©.
• Ø­Ù…Ø§ÙŠØ© Ø§Ù„Ø£Ø·ÙØ§Ù„ ÙˆÙƒØ¨Ø§Ø± Ø§Ù„Ø³Ù† ÙˆØ§Ù„Ù…Ù‚ØªÙ†ÙŠØ§Øª Ø§Ù„Ø«Ù…ÙŠÙ†Ø© ÙˆØ§Ù„Ù…Ù…ØªÙ„ÙƒØ§Øª Ø§Ù„Ø®Ø§ØµØ©.

5. ØªÙ†Ø¨ÙŠÙ‡ Ø£Ù…Ù†ÙŠ
ÙŠÙ†ØµØ­ Servix Ø§Ù„Ø¹Ù…Ù„Ø§Ø¡ Ø¨Ø¹Ø¯Ù… ØªØ±Ùƒ Ø§Ù„Ø£Ø·ÙØ§Ù„ Ø£Ùˆ Ø§Ù„Ø£Ø´Ø®Ø§Øµ Ø§Ù„Ù…Ø­ØªØ§Ø¬ÙŠÙ† Ù„Ù„Ø±Ø¹Ø§ÙŠØ© Ø¯ÙˆÙ† Ø¥Ø´Ø±Ø§Ù Ù…Ù†Ø§Ø³Ø¨ØŒ ÙˆØ§Ù„Ø§Ø­ØªÙØ§Ø¸ Ø¨Ø§Ù„Ù…Ù‚ØªÙ†ÙŠØ§Øª Ø§Ù„Ø«Ù…ÙŠÙ†Ø© ÙˆØ§Ù„Ø£Ù…ÙˆØ§Ù„ ÙˆØ§Ù„Ù…Ø³ØªÙ†Ø¯Ø§Øª Ø§Ù„Ù…Ù‡Ù…Ø© ÙÙŠ Ø£Ù…Ø§ÙƒÙ† Ø¢Ù…Ù†Ø©.

6. Ø¹Ø¯Ù… ØªÙ‚Ø¯ÙŠÙ… Ø¶Ù…Ø§Ù†Ø§Øª
Ù„Ø§ ÙŠÙ‚Ø¯Ù… Servix Ø£ÙŠ Ø¶Ù…Ø§Ù† Ø£Ùˆ ØªØ¹Ù‡Ø¯ ÙŠØªØ¹Ù„Ù‚ Ø¨Ø£Ø®Ù„Ø§Ù‚ Ø£Ùˆ Ø£Ù…Ø§Ù†Ø© Ø£Ùˆ ÙƒÙØ§Ø¡Ø© Ø£Ùˆ Ø®Ø¨Ø±Ø© Ø£Ùˆ Ø³Ù„ÙˆÙƒ Ø£Ùˆ Ù…Ù„Ø§Ø¡Ù…Ø© Ø£ÙŠ Ø¹Ø§Ù…Ù„Ø©.

7. ØªØ­Ù…Ù„ Ø§Ù„Ù…Ø®Ø§Ø·Ø±
ÙŠÙˆØ§ÙÙ‚ Ø§Ù„Ø¹Ù…ÙŠÙ„ Ø¹Ù„Ù‰ Ø£Ù†Ù‡ ÙŠØªØ­Ù…Ù„ ÙƒØ§Ù…Ù„ Ø§Ù„Ù…Ø³Ø¤ÙˆÙ„ÙŠØ© ÙˆØ§Ù„Ù…Ø®Ø§Ø·Ø± Ø§Ù„Ù†Ø§ØªØ¬Ø© Ø¹Ù† Ø§Ù„ØªØ¹Ø§Ù…Ù„ Ø£Ùˆ Ø§Ù„ØªØ¹Ø§Ù‚Ø¯ Ø£Ùˆ Ø§Ù„ØªÙˆØ§ØµÙ„ Ù…Ø¹ Ø£ÙŠ Ø¹Ø§Ù…Ù„Ø© Ù…Ù† Ø®Ù„Ø§Ù„ Ø§Ù„Ù…Ù†ØµØ©.

8. Ø§Ù„Ù…ÙˆØ§ÙÙ‚Ø©
Ø¨Ø§Ù„Ø¶ØºØ· Ø¹Ù„Ù‰ Ø²Ø± "Ù…ÙˆØ§ÙÙ‚"ØŒ ÙŠÙ‚Ø± Ø§Ù„Ø¹Ù…ÙŠÙ„ Ø¨Ø£Ù†Ù‡ ÙÙ‡Ù… ÙˆÙˆØ§ÙÙ‚ Ø¹Ù„Ù‰ Ø£Ù† Servix Ù…Ø¬Ø±Ø¯ Ù…Ù†ØµØ© Ø±Ø¨Ø· ÙˆØªÙˆØ§ØµÙ„ Ø¨ÙŠÙ† Ø§Ù„Ø£Ø·Ø±Ø§Ù ÙˆÙ„Ø§ ÙŠØªØ­Ù…Ù„ Ù…Ø³Ø¤ÙˆÙ„ÙŠØ© Ø£ÙØ¹Ø§Ù„ Ø£Ùˆ ØªØµØ±ÙØ§Øª Ø£Ùˆ Ø£Ø¯Ø§Ø¡ Ø§Ù„Ø¹Ø§Ù…Ù„Ø§Øª.`;
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { maidsAPI } from '../../services/api';
import { COLORS, FONTS } from '../../utils/theme';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useTranslation } from '../../utils/i18n';
import io from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import BackChevron from '../../components/BackChevron';

function maskPhone(phone) {
  if (!phone) return null;
  const p = String(phone);
  if (p.length < 6) return p;
  return p.slice(0, 3) + '*'.repeat(p.length - 6) + p.slice(-3);
}

export default function HireRequestScreen({ navigation }) {
  const { t, lang } = useTranslation();
  const isAr = lang === 'ar';
  const [requests,      setRequests]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [responding,    setResponding]    = useState(null);
  const [profileModal,  setProfileModal]  = useState(null);
  const [termsModal,    setTermsModal]    = useState(false);
  const [termsAgreed,   setTermsAgreed]   = useState(false);
  const [termsError,    setTermsError]    = useState(false);
  const [pendingReqId,  setPendingReqId]  = useState(null);
  const socketRef = useRef();

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      const token = await SecureStore.getItemAsync('maidconnect_token');
      const BASE = Constants.expoConfig?.extra?.API_URL?.replace('/api', '') || 'https://api.servix.world';
      const socket = io(BASE, {
        auth: { token },
        transports: ['polling', 'websocket'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
      });
      socketRef.current = socket;
      socket.on('new_hire_request', (req) => {
        if (!mounted) return;
        setRequests(prev => prev.some(r => r._id === req._id) ? prev : [req, ...prev]);
        Toast.show({ type: 'info', text1: 'New Hire Request!', text2: `${req.housewife?.name} wants to hire you.` });
      });
    })();
    return () => { mounted = false; socketRef.current?.disconnect(); };
  }, []);

  const load = () => {
    setLoading(true);
    maidsAPI.getHireRequests()
      .then(r => setRequests(r.data.requests || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const openTermsForApprove = (requestId) => {
    setPendingReqId(requestId);
    setTermsAgreed(false);
    setTermsError(false);
    setTermsModal(true);
  };

  const confirmAccept = async () => {
    if (!termsAgreed) { setTermsError(true); return; }
    setTermsError(false);
    setTermsModal(false);
    await respond(pendingReqId, 'approve');
  };

  const respond = async (requestId, action) => {
    setResponding(requestId + action);
    try {
      await maidsAPI.respondHireRequest(requestId, action);
      if (action === 'approve') {
        navigation.replace('HiredCelebration');
      } else {
        Toast.show({ type: 'info', text1: t('request_declined') });
        setRequests(prev => prev.filter(r => r._id !== requestId));
      }
    } catch (err) {
      if (err.response?.data?.requiresResubscription) {
        Toast.show({
          type: 'error',
          text1: t('monthly_limit_reached'),
          text2: t('monthly_limit_desc'),
          visibilityTime: 5000,
        });
        navigation.navigate('Subscription');
      } else {
        Toast.show({ type: 'error', text1: err.response?.data?.message || t('failed_to_respond') });
      }
    } finally {
      setResponding(null);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.cream }}>
      <StatusBar barStyle="light-content" />

      {/* Customer Profile Modal */}
      <Modal visible={!!profileModal} transparent animationType="slide" onRequestClose={() => setProfileModal(null)}>
        <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.55)', justifyContent:'flex-end' }}>
          <View style={{ backgroundColor:COLORS.surface, borderTopLeftRadius:20, borderTopRightRadius:20, padding:24, paddingBottom:36 }}>

            <View style={{ alignItems:'center', marginBottom:18 }}>
              <View style={{ width:64, height:64, borderRadius:32, backgroundColor:'#e8f4f1', borderWidth:2, borderColor:COLORS.green, alignItems:'center', justifyContent:'center', marginBottom:10 }}>
                <Ionicons name="person" size={30} color={COLORS.green} />
              </View>
              <Text style={{ fontFamily:FONTS.display, fontSize:22, color:COLORS.dark }}>
                {profileModal?.housewife?.name || 'Customer'}
              </Text>
              {profileModal?.hwProfile?.subscription?.status === 'active' ? (
                <View style={{ flexDirection:'row', alignItems:'center', gap:5, marginTop:4, backgroundColor:'rgba(46,125,94,0.1)', paddingHorizontal:10, paddingVertical:4, borderRadius:12 }}>
                  <Text style={{ fontSize:11, color:'#2e7d5e', fontWeight:'700' }}>{t('verified_subscriber')}</Text>
                </View>
              ) : (
                <Text style={{ fontSize:11, color:COLORS.muted, marginTop:4 }}>{t('sub_status_unknown')}</Text>
              )}
            </View>

            {/* Info rows */}
            {[
              { label: t('area_info'), value: profileModal?.hwProfile?.residentialArea || profileModal?.hwProfile?.city || '—', icon: 'location-outline' },
              { label: t('phone_info'), value: maskPhone(profileModal?.housewife?.phone) || '—', icon: 'call-outline' },
              { label: t('country_info'), value: profileModal?.hwProfile?.country || 'Egypt', icon: 'globe-outline' },
              { label: t('request_date_info'), value: profileModal ? new Date(profileModal.createdAt).toLocaleDateString([], { day:'numeric', month:'long', year:'numeric' }) : '—', icon: 'calendar-outline' },
            ].map(({ label, value, icon }) => (
              <View key={label} style={{ flexDirection:'row', alignItems:'center', gap:12, paddingVertical:12, borderBottomWidth:1, borderBottomColor:COLORS.border }}>
                <Ionicons name={icon} size={18} color={COLORS.muted} style={{ width:26 }} />
                <Text style={{ fontSize:12, color:COLORS.muted, width:80 }}>{label}</Text>
                <Text style={{ fontSize:14, color:COLORS.dark, fontWeight:'500', flex:1 }}>{value}</Text>
              </View>
            ))}

            <View style={{ flexDirection:'row', gap:10, marginTop:20 }}>
              <TouchableOpacity
                style={[styles.btnReject, { flex:1 }]}
                onPress={() => { setProfileModal(null); respond(profileModal._id, 'reject'); }}
                disabled={!!responding}>
                <Text style={styles.btnRejectTxt}>{t('btn_decline')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnApprove, { flex:2 }]}
                onPress={() => { setProfileModal(null); openTermsForApprove(profileModal._id); }}
                disabled={!!responding}>
                <Text style={styles.btnApproveTxt}>{t('btn_accept_hire')}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => setProfileModal(null)} style={{ alignItems:'center', marginTop:14 }}>
              <Text style={{ fontSize:13, color:COLORS.muted }}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Terms & Conditions Modal — shown before accepting a hire */}
      <Modal visible={termsModal} transparent animationType="slide" onRequestClose={() => setTermsModal(false)}>
        <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.6)', justifyContent:'flex-end' }}>
          <View style={{ backgroundColor:COLORS.surface, borderTopLeftRadius:16, borderTopRightRadius:16, maxHeight:'90%' }}>
            <View style={{ padding:20, paddingBottom:12, borderBottomWidth:1, borderBottomColor:COLORS.border }}>
              <View style={{ width:36, height:4, backgroundColor:COLORS.border, borderRadius:2, alignSelf:'center', marginBottom:14 }}/>
              <Text style={{ fontFamily:FONTS.display, fontSize:22, color:COLORS.dark, textAlign: isAr ? 'right' : 'left' }}>
                {isAr ? 'Ø§Ù„Ø´Ø±ÙˆØ· ÙˆØ§Ù„Ø£Ø­ÙƒØ§Ù…' : 'Terms & Conditions'}
              </Text>
            </View>
            <ScrollView style={{ paddingHorizontal:20 }} contentContainerStyle={{ paddingVertical:16 }}>
              <Text style={{ fontSize:12.5, color:COLORS.text, lineHeight:22, textAlign: isAr ? 'right' : 'left' }}>
                {isAr ? TERMS_AR : TERMS_EN}
              </Text>
            </ScrollView>
            <View style={{ padding:20, paddingTop:12, borderTopWidth:1, borderTopColor:COLORS.border }}>
              <TouchableOpacity
                style={{ flexDirection: isAr ? 'row-reverse' : 'row', alignItems:'flex-start', gap:12, marginBottom:8,
                  padding:12, borderRadius:8,
                  backgroundColor: termsError ? 'rgba(224,85,85,0.06)' : termsAgreed ? 'rgba(46,125,94,0.08)' : '#f8f5f0',
                  borderWidth:1.5,
                  borderColor: termsError ? '#e05555' : termsAgreed ? '#2e7d5e' : COLORS.border }}
                onPress={() => { setTermsAgreed(!termsAgreed); setTermsError(false); }}>
                <View style={{ width:22, height:22, borderRadius:4, borderWidth:1.5, flexShrink:0, marginTop:1,
                  borderColor: termsError ? '#e05555' : termsAgreed ? '#2e7d5e' : COLORS.border,
                  backgroundColor: termsAgreed ? '#2e7d5e' : 'transparent',
                  alignItems:'center', justifyContent:'center' }}>
                  {termsAgreed && <Text style={{ color:'#fff', fontSize:13, fontWeight:'700' }}>✓</Text>}
                </View>
                <Text style={{ fontSize:12.5, color: termsError ? '#e05555' : COLORS.text, flex:1, lineHeight:19, textAlign: isAr ? 'right' : 'left' }}>
                  {isAr
                    ? 'Ø£Ù‚Ø± Ø¨Ø£Ù† Servix Ù…Ø¬Ø±Ø¯ Ù…Ù†ØµØ© ØªÙˆØ§ØµÙ„ ÙˆØ±Ø¨Ø· Ø¨ÙŠÙ† Ø§Ù„Ø£Ø·Ø±Ø§Ù ÙˆÙ„Ø§ ÙŠØªØ­Ù…Ù„ Ø£ÙŠ Ù…Ø³Ø¤ÙˆÙ„ÙŠØ© Ø¹Ù† ØªØµØ±ÙØ§Øª Ø£Ùˆ Ø£Ø¯Ø§Ø¡ Ø£Ùˆ Ø§Ù„ÙˆØ¶Ø¹ Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠ Ù„Ø£ÙŠ Ø¹Ø§Ù…Ù„Ø©.'
                    : 'I understand that Servix is only a communication platform and is not responsible for the conduct, actions, performance, safety, or legal status of any worker.'}
                </Text>
              </TouchableOpacity>
              {termsError && (
                <Text style={{ fontSize:12, color:'#e05555', marginBottom:10, textAlign: isAr ? 'right' : 'left' }}>
                  {isAr ? '⚠ ÙŠØ±Ø¬Ù‰ Ù‚Ø±Ø§Ø¡Ø© Ø§Ù„Ø´Ø±ÙˆØ· ÙˆØ§Ù„Ù…ÙˆØ§ÙÙ‚Ø© Ø¹Ù„ÙŠÙ‡Ø§ Ø£ÙˆÙ„Ø§Ù‹' : '⚠ Please read the terms and check the box to continue'}
                </Text>
              )}
              <TouchableOpacity
                style={{ backgroundColor:'#2e7d5e', padding:14, borderRadius:8, alignItems:'center', marginBottom:8 }}
                onPress={confirmAccept}>
                <Text style={{ fontFamily:FONTS.bodySemiBold, fontSize:14, color:'#fff' }}>
                  {isAr ? '✓ Ù‚Ø¨ÙˆÙ„ Ø§Ù„Ø·Ù„Ø¨' : '✓ Accept Hire Request'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setTermsModal(false)} style={{ alignItems:'center', padding:8 }}>
                <Text style={{ fontSize:13, color:COLORS.muted }}>{t('cancel')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <LinearGradient colors={['#0D3827', '#0d5e4a']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ width:38, height:38, borderRadius:19, backgroundColor:'rgba(255,255,255,0.2)', alignItems:'center', justifyContent:'center', marginBottom:12 }}>
          <BackChevron />
        </TouchableOpacity>
        <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', letterSpacing: 1.2, textTransform: 'uppercase' }}>{t('incoming_label')}</Text>
        <Text style={{ fontFamily: FONTS.display, fontSize: 26, color: '#fff', marginTop: 2 }}>{t('hire_requests_title')}</Text>
        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>{t('review_before_deciding')}</Text>
      </LinearGradient>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.gold} />
        </View>
      ) : requests.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>📭</Text>
          <Text style={{ fontFamily: FONTS.display, fontSize: 20, color: COLORS.dark, textAlign: 'center' }}>{t('no_pending_requests')}</Text>
          <Text style={{ fontSize: 13, color: COLORS.muted, textAlign: 'center', marginTop: 6, lineHeight: 20 }}>
            {t('no_pending_sub')}
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {requests.map(req => {
            const hw = req.hwProfile;
            const isSubscribed = hw?.subscription?.status === 'active';
            return (
              <View key={req._id} style={styles.card}>

                {/* Customer summary row */}
                <View style={styles.cardHeader}>
                  <View style={styles.avatar}>
                    <Ionicons name="person" size={26} color={COLORS.green} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.customerName}>{req.housewife?.name || 'Customer'}</Text>
                    <Text style={styles.customerSub}>
                      {hw?.residentialArea || hw?.city || 'Cairo'}
                    </Text>
                    <Text style={styles.time}>
                      {new Date(req.createdAt).toLocaleDateString([], { day:'numeric', month:'short', year:'numeric' })}
                    </Text>
                  </View>
                  <View style={{ alignItems:'flex-end', gap:4 }}>
                    <View style={styles.badge}>
                      <Text style={{ fontSize: 9, color: COLORS.gold, fontWeight: '700', letterSpacing: 0.8 }}>PENDING</Text>
                    </View>
                    {isSubscribed && (
                      <View style={{ backgroundColor:'rgba(46,125,94,0.1)', paddingHorizontal:6, paddingVertical:3, borderRadius:4 }}>
                        <Text style={{ fontSize: 8, color: '#2e7d5e', fontWeight: '700' }}>✓ VERIFIED</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* View profile button */}
                <TouchableOpacity
                  style={styles.viewProfileBtn}
                  onPress={() => setProfileModal(req)}>
                  <Text style={styles.viewProfileTxt}>{t('view_customer_profile')}</Text>
                  <Text style={{ color: COLORS.gold, fontSize: 14 }}>→</Text>
                </TouchableOpacity>

                <View style={styles.divider} />

                {/* Action buttons */}
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity
                    style={[styles.btnReject, responding === req._id + 'reject' && { opacity: 0.5 }]}
                    onPress={() => respond(req._id, 'reject')}
                    disabled={!!responding}>
                    {responding === req._id + 'reject'
                      ? <ActivityIndicator size="small" color={COLORS.red} />
                      : <Text style={styles.btnRejectTxt}>{t('btn_decline')}</Text>}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.btnApprove, responding === req._id + 'approve' && { opacity: 0.5 }]}
                    onPress={() => openTermsForApprove(req._id)}
                    disabled={!!responding}>
                    {responding === req._id + 'approve'
                      ? <ActivityIndicator size="small" color="#fff" />
                      : <Text style={styles.btnApproveTxt}>{t('btn_accept_hire')}</Text>}
                  </TouchableOpacity>
                </View>

              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header:         { paddingHorizontal: 20, paddingTop: 54, paddingBottom: 22 },
  card:           { backgroundColor: '#fff', borderRadius: 12, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border, shadowColor: '#0D3827', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
  cardHeader:     { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  avatar:         { width: 52, height: 52, borderRadius: 26, backgroundColor: '#e8f4f1', borderWidth: 2, borderColor: COLORS.green, alignItems: 'center', justifyContent: 'center' },
  customerName:   { fontFamily: FONTS.display, fontSize: 18, color: COLORS.dark },
  customerSub:    { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  time:           { fontSize: 10, color: COLORS.muted, marginTop: 3 },
  badge:          { backgroundColor: 'rgba(13,56,39,0.12)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: 'rgba(13,56,39,0.3)' },
  viewProfileBtn: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', backgroundColor:'#e8f4f1', borderWidth:1, borderColor:'rgba(13,56,39,0.3)', borderRadius:8, paddingHorizontal:14, paddingVertical:10, marginBottom:12 },
  viewProfileTxt: { fontSize: 13, color: COLORS.dark, fontWeight: '600' },
  divider:        { height: 1, backgroundColor: COLORS.border, marginBottom: 12 },
  btnReject:      { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1.5, borderColor: '#e05555', alignItems: 'center' },
  btnRejectTxt:   { fontSize: 14, fontWeight: '600', color: '#e05555' },
  btnApprove:     { flex: 2, padding: 12, borderRadius: 8, backgroundColor: '#2e7d5e', alignItems: 'center' },
  btnApproveTxt:  { fontSize: 14, fontFamily: FONTS.bodySemiBold, color: '#fff' },
});
