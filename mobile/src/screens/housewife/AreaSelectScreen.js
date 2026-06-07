import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, StatusBar, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { COLORS, FONTS } from '../../utils/theme';
import useAuthStore from '../../store/authStore';
import { hwAPI } from '../../services/api';

export default function AreaSelectScreen({ navigation }) {
  const { activeAreas, allAreas, completeAuth } = useAuthStore();
  const [selected, setSelected] = useState(null);
  const [saving,   setSaving]   = useState(false);

  const handleSelect = async (area) => {
    setSelected(area);
    setSaving(true);
    try {
      await hwAPI.updateProfile({ residentialArea: area });
      await completeAuth();
      // AppNavigator will auto-route based on area status
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to save area. Please try again.' });
      setSelected(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#1a1108', '#3d2203']} style={styles.hero}>
        <Text style={{ fontSize: 32, marginBottom: 8 }}>📍</Text>
        <Text style={styles.heroT}>Where do you live?</Text>
        <Text style={styles.heroS}>We'll show you maids available in your area</Text>
      </LinearGradient>

      <ScrollView style={{ backgroundColor: COLORS.cream }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

        {/* Active areas */}
        <Text style={styles.sectionLabel}>Available now in Cairo</Text>
        <View style={styles.grid}>
          {allAreas.filter(a => activeAreas.includes(a)).map(area => (
            <TouchableOpacity
              key={area}
              style={[styles.areaCard, styles.areaActive, selected === area && styles.areaSelected]}
              onPress={() => handleSelect(area)}
              disabled={saving}>
              {saving && selected === area
                ? <ActivityIndicator size="small" color={COLORS.dark} />
                : <>
                    <Text style={styles.areaIcon}>✓</Text>
                    <Text style={[styles.areaName, selected === area && { color: COLORS.dark }]}>{area}</Text>
                  </>}
            </TouchableOpacity>
          ))}
        </View>

        {/* Coming soon areas */}
        <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Coming soon</Text>
        <View style={styles.grid}>
          {allAreas.filter(a => !activeAreas.includes(a)).map(area => (
            <TouchableOpacity
              key={area}
              style={[styles.areaCard, styles.areaInactive]}
              onPress={() => handleSelect(area)}
              disabled={saving}>
              <Text style={styles.areaSoon}>Soon</Text>
              <Text style={styles.areaNameMuted}>{area}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoBox}>
          <Text style={{ fontSize: 12, color: COLORS.muted, lineHeight: 19 }}>
            💡 <Text style={{ fontWeight: '700', color: COLORS.dark }}>Don't see your area?</Text>{' '}
            Select it anyway — we'll notify you as soon as we launch there.
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero:          { padding: 22, paddingTop: 54, alignItems: 'center' },
  heroT:         { fontFamily: FONTS.display, fontSize: 26, color: '#fff8ee', marginBottom: 5 },
  heroS:         { fontSize: 12, color: 'rgba(232,201,122,0.55)', textAlign: 'center' },
  sectionLabel:  { fontSize: 10, letterSpacing: 1.3, textTransform: 'uppercase', color: COLORS.muted, fontWeight: '700', marginBottom: 10 },
  grid:          { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  areaCard:      { width: '47%', borderRadius: 10, padding: 14, alignItems: 'center', borderWidth: 1.5 },
  areaActive:    { backgroundColor: COLORS.surface, borderColor: COLORS.gold },
  areaSelected:  { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
  areaInactive:  { backgroundColor: '#f8f5f0', borderColor: '#e5ddd0', borderStyle: 'dashed' },
  areaIcon:      { fontSize: 16, color: COLORS.gold, marginBottom: 4 },
  areaName:      { fontFamily: FONTS.display, fontSize: 15, color: COLORS.dark, textAlign: 'center' },
  areaNameMuted: { fontFamily: FONTS.display, fontSize: 14, color: COLORS.muted, textAlign: 'center' },
  areaSoon:      { fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: COLORS.muted, marginBottom: 4 },
  infoBox:       { marginTop: 20, backgroundColor: '#fffcf5', borderWidth: 1, borderColor: '#f0e8d8', borderRadius: 8, padding: 14 },
});
