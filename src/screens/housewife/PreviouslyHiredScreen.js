import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../../utils/theme';
import BackChevron from '../../components/BackChevron';
import { useTranslation } from '../../utils/i18n';

export default function PreviouslyHiredScreen({ route, navigation }) {
  const { pastHired = [] } = route.params || {};
  const { t } = useTranslation();

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.cream }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ width:38, height:38, borderRadius:19, backgroundColor:'rgba(255,255,255,0.2)', alignItems:'center', justifyContent:'center' }}>
          <BackChevron />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('old_helpers')}</Text>
        <Text style={styles.headerSub}>{pastHired.length} {t('past_placements')}</Text>
      </View>

      {pastHired.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <Ionicons name="people-outline" size={48} color={COLORS.muted} style={{ marginBottom: 12 }} />
          <Text style={{ fontFamily: FONTS.display, fontSize: 20, color: COLORS.dark, textAlign: 'center' }}>{t('no_history_yet')}</Text>
          <Text style={{ fontSize: 13, color: COLORS.muted, textAlign: 'center', marginTop: 6 }}>
            {t('released_here_sub')}
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {pastHired.map((item, idx) => {
            const maid   = item.maid || {};
            const photo  = maid.photos?.[0]?.url;
            const initial = (maid.fullName || 'M').charAt(0).toUpperCase();
            return (
              <View key={String(maid._id || idx)} style={styles.card}>
                {photo
                  ? <Image source={{ uri: photo }} style={styles.avatar} />
                  : <View style={[styles.avatar, styles.avatarFallback]}>
                      <Text style={{ fontSize: 24, color: COLORS.gold, fontFamily: FONTS.display }}>{initial}</Text>
                    </View>}
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{maid.fullName || '—'}</Text>
                  {maid.nationality ? (
                    <Text style={styles.sub}>{maid.nationality}</Text>
                  ) : null}
                </View>
                <Text style={styles.date}>
                  {t('released_on')}{'\n'}{new Date(item.releasedAt || Date.now()).toLocaleDateString()}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header:       { backgroundColor: '#0D3827', padding: 20, paddingTop: 54 },
  headerTitle:  { fontFamily: FONTS.display, fontSize: 24, color: '#fff', marginTop: 10 },
  headerSub:    { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  card:         { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border, elevation: 1 },
  avatar:       { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: COLORS.green },
  avatarFallback:{ backgroundColor: '#e8f4f1', alignItems: 'center', justifyContent: 'center' },
  name:         { fontFamily: FONTS.display, fontSize: 17, color: COLORS.dark },
  sub:          { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  date:         { fontSize: 10, color: COLORS.muted, textAlign: 'right', lineHeight: 16 },
});
