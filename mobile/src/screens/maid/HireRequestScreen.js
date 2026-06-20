import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  ActivityIndicator, StatusBar, Modal, Pressable
} from 'react-native';

const TERMS_EN = `Servix Helper Terms & Conditions

Last Updated: June 2025

Welcome to Servix. By creating an account or using the Servix platform as a domestic helper, you agree to these Terms & Conditions.

1. Platform Purpose
Servix is a technology platform that connects domestic helpers with homeowners seeking household services.
Servix is not an employer, recruitment agency, sponsor, staffing company, or party to any employment agreement between users.

2. Eligibility
By registering as a helper, you confirm that:
• The information you provide is accurate and complete.
• You are legally permitted to offer your services in accordance with applicable laws.
• You will promptly update your information whenever necessary.

3. Your Profile
You are responsible for maintaining an accurate profile, including: name, contact information, experience, skills, availability, languages spoken, and any other information requested by the platform.
Providing false or misleading information may result in account suspension or permanent removal.

4. Conduct
Helpers agree to:
• Treat homeowners respectfully.
• Communicate honestly and professionally.
• Attend scheduled appointments whenever possible.
• Notify the homeowner promptly if unable to attend.
• Respect the homeowner's privacy and property.

5. Agreements with Homeowners
Any employment or service agreement is made directly between you and the homeowner. You are responsible for agreeing on salary, working hours, job responsibilities, working location, employment duration, and any additional terms.
Servix is not involved in negotiating or enforcing these agreements.

6. Ratings & Reviews
Homeowners may rate and review helpers after completed services. Repeated poor ratings, confirmed misconduct, or violations of these Terms may result in warnings, suspension, or account removal.

7. Payments
Servix may charge subscription fees or service fees for using certain platform features. All applicable fees will be clearly displayed before purchase.
Payments for work performed are arranged directly between the homeowner and the helper unless otherwise stated within the platform.

8. Compliance with Laws
Helpers are responsible for complying with all applicable laws and regulations, including those related to employment, residency, identity verification, taxation, and any other legal requirements in the country where services are provided.

9. Privacy & Confidentiality
Helpers must respect the privacy of homeowners. Personal information, home addresses, security information, photographs, or any confidential information obtained during or after providing services must not be disclosed without permission, except where required by law.

10. Account Suspension
Servix may suspend or permanently remove accounts that:
• Violate these Terms.
• Repeatedly receive verified complaints.
• Engage in fraudulent or abusive behavior.
• Provide false information.
• Use the platform for unlawful purposes.

11. Limitation of Liability
Servix provides a platform that facilitates introductions between users. Servix is not responsible for employment relationships, payments, disputes, damages, injuries, losses, or any agreements made between helpers and homeowners, to the maximum extent permitted by law.

12. Intellectual Property
All trademarks, logos, software, graphics, and content available on Servix remain the property of Servix or its licensors.

13. Changes to These Terms
Servix may update these Terms from time to time. Continued use of the platform after updates constitutes acceptance of the revised Terms.

14. Independent Relationship
Using Servix does not create any employment, agency, partnership, joint venture, representative, or contractual relationship between Servix and any helper. Servix acts solely as a technology platform connecting independent users. Any employment or service relationship exists solely between the homeowner and the helper.`;

const TERMS_AR = `الشروط والأحكام الخاصة بالعاملات - Servix

آخر تحديث: يونيو 2025

مرحبًا بك في Servix. باستخدامك للمنصة أو إنشاء حساب كعاملة منزلية، فإنك توافقين على الالتزام بالشروط والأحكام التالية.

1. طبيعة الخدمة
Servix منصة تقنية تهدف إلى ربط العاملات المنزليات بأصحاب المنازل.
ولا تعتبر Servix جهة توظيف أو مكتب استقدام أو كفيل أو شركة تشغيل، كما أنها ليست طرفًا في أي علاقة عمل أو اتفاق يتم بين المستخدمين.

2. أهلية التسجيل
بتسجيلك في المنصة، فإنك تقرين بأن:
• جميع البيانات المقدمة صحيحة ودقيقة.
• يحق لك تقديم خدماتك وفقًا للقوانين المعمول بها.
• ستقومين بتحديث بياناتك عند الحاجة.

3. الملف الشخصي
تلتزم العاملة بالحفاظ على صحة البيانات الموجودة في حسابها، بما في ذلك: الاسم، وسائل التواصل، الخبرات، المهارات، أوقات التوفر، اللغات، وأي بيانات أخرى تطلبها المنصة.
ويجوز لـ Servix تعليق أو إزالة الحساب في حال تقديم معلومات غير صحيحة أو مضللة.

4. السلوك المهني
تلتزم العاملة بما يلي:
• معاملة أصحاب المنازل باحترام.
• التواصل بطريقة مهنية وواضحة.
• الالتزام بالمواعيد المتفق عليها قدر الإمكان.
• إبلاغ صاحب المنزل في حال تعذر الحضور.
• احترام خصوصية المنزل وممتلكاته.

5. الاتفاق مع صاحب المنزل
أي اتفاق يتم يكون مباشرة بين العاملة وصاحب المنزل. وتتحمل العاملة مسؤولية الاتفاق بشأن: الراتب، ساعات العمل، طبيعة العمل، مكان العمل، مدة العمل، وأي شروط إضافية.
ولا تكون Servix طرفًا في هذه الاتفاقات.

6. التقييمات
يجوز لأصحاب المنازل تقييم العاملات بعد انتهاء الخدمة. وقد تؤدي المخالفات المؤكدة أو التقييمات السلبية المتكررة إلى إرسال تنبيه أو تعليق الحساب أو إغلاقه.

7. الاشتراكات
قد تتطلب بعض خدمات Servix رسوم اشتراك أو رسوم استخدام، وسيتم توضيحها قبل الدفع.
أما الأجور الخاصة بالعمل، فيتم الاتفاق عليها مباشرة بين العاملة وصاحب المنزل ما لم تنص المنصة على خلاف ذلك.

8. الالتزام بالقوانين
تلتزم العاملة بالامتثال لجميع القوانين واللوائح المعمول بها، بما في ذلك ما يتعلق بالعمل والإقامة والهوية والضرائب وأي متطلبات قانونية أخرى.

9. الخصوصية والسرية
تلتزم العاملة بالحفاظ على خصوصية أصحاب المنازل. ولا يجوز مشاركة أو استخدام أي معلومات شخصية أو عناوين أو صور أو معلومات خاصة يتم الاطلاع عليها أثناء تقديم الخدمة إلا بموافقة صاحبها أو إذا تطلب القانون ذلك.

10. تعليق الحساب
يجوز لـ Servix تعليق أو حذف الحساب في حال:
• مخالفة هذه الشروط.
• تكرار الشكاوى المؤكدة.
• تقديم بيانات غير صحيحة.
• إساءة استخدام المنصة.
• مخالفة القوانين.

11. حدود المسؤولية
تقتصر مهمة Servix على توفير منصة إلكترونية لتسهيل التواصل بين المستخدمين. ولا تتحمل Servix المسؤولية عن أي علاقة عمل أو نزاع أو اتفاق أو خسائر أو أضرار أو مطالبات تنشأ بين العاملة وصاحب المنزل، وذلك في الحدود التي يسمح بها القانون.

12. الملكية الفكرية
جميع العلامات التجارية والشعارات والتصاميم والبرمجيات والمحتوى داخل Servix مملوكة أو مرخصة لصالح Servix، ولا يجوز استخدامها دون موافقة كتابية مسبقة.

13. تعديل الشروط
يجوز لـ Servix تعديل هذه الشروط في أي وقت. ويعد استمرار استخدام المنصة بعد نشر التعديلات موافقة عليها.

14. استقلالية العلاقة
لا يؤدي استخدام Servix إلى إنشاء أي علاقة عمل أو وكالة أو شراكة أو تمثيل قانوني بين Servix والعاملة. ويقتصر دور Servix على توفير منصة تقنية لتسهيل التواصل بين المستخدمين، بينما تكون أي علاقة عمل أو اتفاق قانوني بين العاملة وصاحب المنزل فقط.`;
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
          <Text style={{ fontSize: 48, marginBottom: 16 }}>ðŸ“­</Text>
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
