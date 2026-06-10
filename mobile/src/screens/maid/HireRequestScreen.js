import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  ActivityIndicator, StatusBar, Modal
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { maidsAPI } from '../../services/api';
import { COLORS, FONTS } from '../../utils/theme';
import Toast from 'react-native-toast-message';
import { useTranslation } from '../../utils/i18n';

function maskPhone(phone) {
  if (!phone) return null;
  const p = String(phone);
  if (p.length < 6) return p;
  return p.slice(0, 3) + '*'.repeat(p.length - 6) + p.slice(-3);
}

export default function HireRequestScreen({ navigation }) {
  const { t } = useTranslation();
  const [requests,    setRequests]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [responding,  setResponding]  = useState(null);
  const [profileModal, setProfileModal] = useState(null); // holds the req object to show

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const load = () => {
    setLoading(true);
    maidsAPI.getHireRequests()
      .then(r => setRequests(r.data.requests || []))
      .catch(() => {})
      .finally(() => setLoading(false));
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
        navigation.navigate('PaymentHistory');
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
              <View style={{ width:64, height:64, borderRadius:32, backgroundColor:'#fef6e4', borderWidth:2, borderColor:COLORS.gold, alignItems:'center', justifyContent:'center', marginBottom:10 }}>
                <Text style={{ fontSize:30 }}>👤</Text>
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
              { label: t('area_info'), value: profileModal?.hwProfile?.residentialArea || profileModal?.hwProfile?.city || '—', icon: '📍' },
              { label: t('phone_info'), value: maskPhone(profileModal?.housewife?.phone) || '—', icon: '📞' },
              { label: t('country_info'), value: profileModal?.hwProfile?.country || 'Egypt', icon: '🌍' },
              { label: t('request_date_info'), value: profileModal ? new Date(profileModal.createdAt).toLocaleDateString([], { day:'numeric', month:'long', year:'numeric' }) : '—', icon: '🗓' },
            ].map(({ label, value, icon }) => (
              <View key={label} style={{ flexDirection:'row', alignItems:'center', gap:12, paddingVertical:12, borderBottomWidth:1, borderBottomColor:COLORS.border }}>
                <Text style={{ fontSize:18, width:26 }}>{icon}</Text>
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
                onPress={() => { setProfileModal(null); respond(profileModal._id, 'approve'); }}
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

      <LinearGradient colors={['#1a1108', '#3d2203']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 22, color: 'rgba(232,201,122,0.6)' }}>←</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 10, color: 'rgba(232,201,122,0.5)', letterSpacing: 1.2, textTransform: 'uppercase' }}>{t('incoming_label')}</Text>
        <Text style={{ fontFamily: FONTS.display, fontSize: 26, color: '#fff8ee', marginTop: 2 }}>{t('hire_requests_title')}</Text>
        <Text style={{ fontSize: 12, color: 'rgba(232,201,122,0.45)', marginTop: 4 }}>{t('review_before_deciding')}</Text>
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
                    <Text style={{ fontSize: 26 }}>👤</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.customerName}>{req.housewife?.name || 'Customer'}</Text>
                    <Text style={styles.customerSub}>
                      {hw?.residentialArea ? `📍 ${hw.residentialArea}` : hw?.city ? `📍 ${hw.city}` : '📍 Cairo'}
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
                    onPress={() => respond(req._id, 'approve')}
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
  card:           { backgroundColor: '#fff', borderRadius: 12, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: '#f0e8d8', shadowColor: '#c9a84c', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
  cardHeader:     { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  avatar:         { width: 52, height: 52, borderRadius: 26, backgroundColor: '#fef6e4', borderWidth: 2, borderColor: COLORS.gold, alignItems: 'center', justifyContent: 'center' },
  customerName:   { fontFamily: FONTS.display, fontSize: 18, color: COLORS.dark },
  customerSub:    { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  time:           { fontSize: 10, color: COLORS.muted, marginTop: 3 },
  badge:          { backgroundColor: 'rgba(201,168,76,0.12)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: 'rgba(201,168,76,0.3)' },
  viewProfileBtn: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', backgroundColor:'#fef9ee', borderWidth:1, borderColor:'rgba(201,168,76,0.3)', borderRadius:8, paddingHorizontal:14, paddingVertical:10, marginBottom:12 },
  viewProfileTxt: { fontSize: 13, color: COLORS.dark, fontWeight: '600' },
  divider:        { height: 1, backgroundColor: '#f0e8d8', marginBottom: 12 },
  btnReject:      { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1.5, borderColor: '#e05555', alignItems: 'center' },
  btnRejectTxt:   { fontSize: 14, fontWeight: '600', color: '#e05555' },
  btnApprove:     { flex: 2, padding: 12, borderRadius: 8, backgroundColor: '#2e7d5e', alignItems: 'center' },
  btnApproveTxt:  { fontSize: 14, fontFamily: FONTS.bodySemiBold, color: '#fff' },
});
