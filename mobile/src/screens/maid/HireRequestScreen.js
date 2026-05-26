import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  ActivityIndicator, StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { maidsAPI } from '../../services/api';
import { COLORS, FONTS } from '../../utils/theme';
import Toast from 'react-native-toast-message';

export default function HireRequestScreen({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(null); // requestId being actioned

  useEffect(() => {
    load();
  }, []);

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
        Toast.show({ type: 'info', text1: 'Request declined', text2: 'This customer will no longer see you in their search.' });
        setRequests(prev => prev.filter(r => r._id !== requestId));
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Failed to respond' });
    } finally {
      setResponding(null);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.cream }}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#1a1108', '#3d2203']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 22, color: 'rgba(232,201,122,0.6)' }}>←</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 10, color: 'rgba(232,201,122,0.5)', letterSpacing: 1.2, textTransform: 'uppercase' }}>Incoming</Text>
        <Text style={{ fontFamily: FONTS.display, fontSize: 26, color: '#fff8ee', marginTop: 2 }}>Hire Requests 👑</Text>
        <Text style={{ fontSize: 12, color: 'rgba(232,201,122,0.45)', marginTop: 4 }}>Review and respond to each request</Text>
      </LinearGradient>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.gold} />
        </View>
      ) : requests.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>📭</Text>
          <Text style={{ fontFamily: FONTS.display, fontSize: 20, color: COLORS.dark, textAlign: 'center' }}>No pending requests</Text>
          <Text style={{ fontSize: 13, color: COLORS.muted, textAlign: 'center', marginTop: 6, lineHeight: 20 }}>
            When a customer wants to hire you, their request will appear here.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {requests.map(req => (
            <View key={req._id} style={styles.card}>
              {/* Customer info */}
              <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                  <Text style={{ fontSize: 24 }}>👩</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.customerName}>{req.housewife?.name || 'Customer'}</Text>
                  <Text style={styles.customerSub}>{req.hwProfile?.city || ''}{req.hwProfile?.country ? ` · ${req.hwProfile.country}` : ''}</Text>
                  <Text style={styles.time}>{new Date(req.createdAt).toLocaleDateString([], { day:'numeric', month:'short', year:'numeric' })}</Text>
                </View>
                <View style={styles.badge}>
                  <Text style={{ fontSize: 9, color: COLORS.gold, fontWeight: '700', letterSpacing: 0.8 }}>PENDING</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <Text style={{ fontSize: 13, color: COLORS.muted, lineHeight: 20, marginBottom: 16 }}>
                <Text style={{ color: COLORS.dark, fontWeight: '600' }}>{req.housewife?.name}</Text> wants to hire you as their domestic helper. Review and decide below.
              </Text>

              {/* Action buttons */}
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                  style={[styles.btnReject, responding === req._id + 'reject' && { opacity: 0.5 }]}
                  onPress={() => respond(req._id, 'reject')}
                  disabled={!!responding}
                >
                  {responding === req._id + 'reject'
                    ? <ActivityIndicator size="small" color={COLORS.red} />
                    : <Text style={styles.btnRejectTxt}>✗ Decline</Text>
                  }
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btnApprove, responding === req._id + 'approve' && { opacity: 0.5 }]}
                  onPress={() => respond(req._id, 'approve')}
                  disabled={!!responding}
                >
                  {responding === req._id + 'approve'
                    ? <ActivityIndicator size="small" color={COLORS.dark} />
                    : <Text style={styles.btnApproveTxt}>✓ Accept Hire</Text>
                  }
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header:       { paddingHorizontal: 20, paddingTop: 54, paddingBottom: 22 },
  card:         { backgroundColor: '#fff', borderRadius: 12, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: '#f0e8d8', shadowColor: '#c9a84c', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
  cardHeader:   { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  avatar:       { width: 52, height: 52, borderRadius: 26, backgroundColor: '#fef6e4', borderWidth: 2, borderColor: COLORS.gold, alignItems: 'center', justifyContent: 'center' },
  customerName: { fontFamily: FONTS.display, fontSize: 18, color: COLORS.dark },
  customerSub:  { fontSize: 11, color: COLORS.muted, marginTop: 1 },
  time:         { fontSize: 10, color: COLORS.muted, marginTop: 3 },
  badge:        { backgroundColor: 'rgba(201,168,76,0.12)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: 'rgba(201,168,76,0.3)' },
  divider:      { height: 1, backgroundColor: '#f0e8d8', marginBottom: 12 },
  btnReject:    { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1.5, borderColor: '#e05555', alignItems: 'center' },
  btnRejectTxt: { fontSize: 14, fontWeight: '600', color: '#e05555' },
  btnApprove:   { flex: 2, padding: 12, borderRadius: 8, backgroundColor: '#2e7d5e', alignItems: 'center' },
  btnApproveTxt:{ fontSize: 14, fontFamily: FONTS.bodySemiBold, color: '#fff' },
});
