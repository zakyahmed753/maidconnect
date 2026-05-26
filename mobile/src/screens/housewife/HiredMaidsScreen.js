import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { hwAPI, paymentsAPI } from '../../services/api';
import { COLORS, FONTS } from '../../utils/theme';
import Toast from 'react-native-toast-message';
import { useTranslation } from '../../utils/i18n';

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

function daysLeftToReturn(hiredAt) {
  if (!hiredAt) return 0;
  const elapsed = Date.now() - new Date(hiredAt).getTime();
  return Math.max(0, Math.ceil((THREE_DAYS_MS - elapsed) / (24 * 60 * 60 * 1000)));
}

function canRelease(hiredAt) {
  if (!hiredAt) return false;
  return Date.now() - new Date(hiredAt).getTime() < THREE_DAYS_MS;
}

export default function HiredMaidsScreen({ navigation }) {
  const { t } = useTranslation();
  const [hired, setHired] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returning, setReturning] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      hwAPI.getProfile()
        .then(r => setHired(r.data?.profile?.hiredMaids || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, [])
  );

  const handleReturn = (maidId, maidName) => {
    Alert.alert(
      'Return Maid',
      `Are you sure you want to release ${maidName}? She will become available for other customers again. You will get a free replacement vacancy for 3 days.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Return',
          style: 'destructive',
          onPress: async () => {
            setReturning(maidId);
            try {
              await paymentsAPI.returnMaid({ maidProfileId: maidId });
              setHired(prev => prev.filter(h => (h.maid?._id || h.maid) !== maidId));
              Toast.show({ type: 'success', text1: 'Vacancy released', text2: 'You have 3 days to hire a replacement at no extra cost.' });
            } catch (err) {
              Toast.show({ type: 'error', text1: err.response?.data?.message || 'Failed to return maid' });
            } finally {
              setReturning(null);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.cream }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 22, color: 'rgba(232,201,122,0.6)' }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Hired Maid 👑</Text>
        <Text style={styles.headerSub}>Manage your current domestic helper</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.gold} />
        </View>
      ) : hired.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <Text style={{ fontSize: 52, marginBottom: 16 }}>🏠</Text>
          <Text style={{ fontFamily: FONTS.display, fontSize: 22, color: COLORS.dark, textAlign: 'center' }}>No hired maid yet</Text>
          <Text style={{ fontSize: 13, color: COLORS.muted, textAlign: 'center', marginTop: 6, lineHeight: 20 }}>
            Browse available maids and send a hire request to get started.
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: COLORS.gold, paddingHorizontal: 28, paddingVertical: 13, borderRadius: 6, marginTop: 24 }}
            onPress={() => navigation.navigate('Browse')}>
            <Text style={{ fontFamily: FONTS.bodySemiBold, fontSize: 14, color: COLORS.dark }}>🔍 Browse Maids</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {hired.map((item, idx) => {
            const maid = item.maid || {};
            const maidId = maid._id || item.maid;
            const maidName = maid.fullName || 'Maid';
            const isReturning = returning === maidId;
            return (
              <View key={String(maidId) + idx} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.avatar}>
                    <Text style={{ fontSize: 30 }}>👩</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.maidName}>{maidName}</Text>
                    <Text style={styles.maidSub}>{maid.nationality || ''}{maid.age ? ` · ${maid.age} yrs` : ''}</Text>
                    {maid.expectedSalary ? (
                      <Text style={styles.maidSalary}>EGP {maid.expectedSalary.toLocaleString()}/mo</Text>
                    ) : null}
                  </View>
                  <View style={styles.hiredBadge}>
                    <Text style={{ fontSize: 9, color: '#2e7d5e', fontWeight: '700', letterSpacing: 0.8 }}>HIRED ✓</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Hired on</Text>
                  <Text style={styles.infoVal}>{new Date(item.hiredAt || Date.now()).toLocaleDateString()}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Skills</Text>
                  <Text style={styles.infoVal}>{(maid.skills || []).slice(0, 3).join(', ') || '—'}</Text>
                </View>

                <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                  <TouchableOpacity
                    style={styles.btnChat}
                    onPress={() => navigation.navigate('Browse', { screen: 'Chat', params: { maidName } })}>
                    <Text style={styles.btnChatTxt}>💬 Chat</Text>
                  </TouchableOpacity>
                  {canRelease(item.hiredAt) ? (
                    <TouchableOpacity
                      style={[styles.btnReturn, isReturning && { opacity: 0.5 }]}
                      onPress={() => handleReturn(maidId, maidName)}
                      disabled={isReturning}>
                      {isReturning
                        ? <ActivityIndicator size="small" color="#e05555" />
                        : <Text style={styles.btnReturnTxt}>↩ Release ({daysLeftToReturn(item.hiredAt)}d left)</Text>
                      }
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.btnLocked}>
                      <Text style={styles.btnLockedTxt}>🔒 Return window closed</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}

          <View style={styles.infoBox}>
            <Text style={{ fontSize: 12, color: COLORS.muted, lineHeight: 18 }}>
              💡 You can release a maid <Text style={{ color: COLORS.gold, fontWeight: '600' }}>within 3 days of hiring</Text> and get a free replacement. After 3 days the return window closes and the hire is locked until your next subscription period.
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header:      { backgroundColor: '#3d2203', padding: 20, paddingTop: 54 },
  headerTitle: { fontFamily: FONTS.display, fontSize: 24, color: '#fff8ee', marginTop: 10 },
  headerSub:   { fontSize: 11, color: 'rgba(232,201,122,0.45)', marginTop: 2 },
  card:        { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#f0e8d8', elevation: 2, shadowColor: '#c9a84c', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  cardTop:     { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  avatar:      { width: 56, height: 56, borderRadius: 28, backgroundColor: '#fef6e4', borderWidth: 2, borderColor: COLORS.gold, alignItems: 'center', justifyContent: 'center' },
  maidName:    { fontFamily: FONTS.display, fontSize: 18, color: COLORS.dark },
  maidSub:     { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  maidSalary:  { fontSize: 12, color: COLORS.gold, fontWeight: '600', marginTop: 2 },
  hiredBadge:  { backgroundColor: 'rgba(46,125,94,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: 'rgba(46,125,94,0.25)' },
  infoRow:     { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderTopWidth: 1, borderTopColor: '#f5ede0' },
  infoLabel:   { fontSize: 11, color: COLORS.muted },
  infoVal:     { fontSize: 11, color: COLORS.dark, fontWeight: '500', flex: 1, textAlign: 'right' },
  btnChat:     { flex: 1, padding: 11, borderRadius: 7, borderWidth: 1.5, borderColor: COLORS.gold, alignItems: 'center' },
  btnChatTxt:  { fontSize: 13, fontWeight: '600', color: COLORS.gold },
  btnReturn:    { flex: 2, padding: 11, borderRadius: 7, backgroundColor: '#fff0f0', borderWidth: 1.5, borderColor: '#e05555', alignItems: 'center' },
  btnReturnTxt: { fontSize: 13, fontWeight: '600', color: '#e05555' },
  btnLocked:    { flex: 2, padding: 11, borderRadius: 7, backgroundColor: '#f5f5f5', borderWidth: 1.5, borderColor: '#ddd', alignItems: 'center' },
  btnLockedTxt: { fontSize: 12, color: COLORS.muted },
  infoBox:     { backgroundColor: '#fffcf5', borderWidth: 1, borderColor: '#f0e8d8', borderRadius: 8, padding: 14, marginTop: 4 },
});
