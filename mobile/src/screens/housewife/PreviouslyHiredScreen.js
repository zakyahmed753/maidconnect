import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { COLORS, FONTS } from '../../utils/theme';

export default function PreviouslyHiredScreen({ route, navigation }) {
  const { pastHired = [] } = route.params || {};

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.cream }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 22, color: 'rgba(232,201,122,0.6)' }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Previously Hired</Text>
        <Text style={styles.headerSub}>{pastHired.length} maid{pastHired.length !== 1 ? 's' : ''}</Text>
      </View>

      {pastHired.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>📋</Text>
          <Text style={{ fontFamily: FONTS.display, fontSize: 20, color: COLORS.dark, textAlign: 'center' }}>No history yet</Text>
          <Text style={{ fontSize: 13, color: COLORS.muted, textAlign: 'center', marginTop: 6 }}>
            Maids you release will appear here.
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
                  Released{'\n'}{new Date(item.releasedAt || Date.now()).toLocaleDateString()}
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
  header:       { backgroundColor: '#3d2203', padding: 20, paddingTop: 54 },
  headerTitle:  { fontFamily: FONTS.display, fontSize: 24, color: '#fff8ee', marginTop: 10 },
  headerSub:    { fontSize: 11, color: 'rgba(232,201,122,0.45)', marginTop: 2 },
  card:         { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#f0e8d8', elevation: 1 },
  avatar:       { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: COLORS.gold },
  avatarFallback:{ backgroundColor: '#fef6e4', alignItems: 'center', justifyContent: 'center' },
  name:         { fontFamily: FONTS.display, fontSize: 17, color: COLORS.dark },
  sub:          { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  date:         { fontSize: 10, color: COLORS.muted, textAlign: 'right', lineHeight: 16 },
});
