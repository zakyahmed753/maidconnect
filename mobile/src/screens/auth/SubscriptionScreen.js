// src/screens/auth/SubscriptionScreen.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { COLORS, FONTS } from '../../utils/theme';
import useAuthStore from '../../store/authStore';
import { useTranslation } from '../../utils/i18n';

export default function SubscriptionScreen({ navigation }) {
  const { t } = useTranslation();
  const completeAuth = useAuthStore(s => s.completeAuth);
  const [selected, setSelected] = useState('annual');
  const [skipping, setSkipping] = useState(false);

  const handleSkip = async () => {
    setSkipping(true);
    try {
      await completeAuth();
    } catch {
      // ignore — force navigate below
    }
    const store = useAuthStore.getState();
    let token = store.token;
    if (!token) {
      try {
        const SecureStore = require('expo-secure-store');
        token = await SecureStore.getItemAsync('maidconnect_token');
      } catch {}
    }
    useAuthStore.setState({
      token,
      user: store.user,
      profile: store.profile
        ? { ...store.profile, verificationStatus: 'verified', approvalStatus: 'approved' }
        : { verificationStatus: 'verified', approvalStatus: 'approved' },
    });
    setSkipping(false);
  };

  const PLANS = [
    { id:'monthly', name: t('monthly_plan'), price:'EGP 450',  per:'/month', features:['Active profile listing','Up to 5 photos','Voice messaging','Basic analytics'] },
    { id:'annual',  name: t('annual_plan'),  price:'EGP 3,900', per:'/year', popular:true, features:['Active profile all year','Unlimited photos','Voice messaging','Priority listing','Full analytics','Save 30% vs monthly'] },
  ];

  return (
    <View style={{ flex:1 }}>
      <StatusBar barStyle="light-content"/>
      <LinearGradient colors={['#1a1108','#3d2203']} style={styles.hero}>
        <Text style={{ fontSize:36, marginBottom:8 }}>👑</Text>
        <Text style={styles.heroT}>{t('subscription_title')}</Text>
        <Text style={styles.heroS}>{t('subscription_sub')}</Text>
      </LinearGradient>
      <ScrollView style={{ backgroundColor:COLORS.cream }} contentContainerStyle={{ padding:16, paddingBottom:40 }}>
        {PLANS.map(p => (
          <TouchableOpacity key={p.id} onPress={() => setSelected(p.id)}
            style={[styles.planCard, selected===p.id && styles.planSelected]}>
            <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
              <View>
                <Text style={styles.planName}>{p.name}</Text>
                {p.popular && <View style={styles.popularBadge}><Text style={styles.popularTxt}>{t('most_popular')}</Text></View>}
              </View>
              <View style={{ alignItems:'flex-end' }}>
                <Text style={styles.planPrice}>{p.price}</Text>
                <Text style={styles.planPer}>{p.per}</Text>
              </View>
            </View>
            {p.features.map(f => (
              <View key={f} style={styles.featureRow}>
                <Text style={{ color:COLORS.green, fontSize:14 }}>✓</Text>
                <Text style={styles.featureTxt}>{f}</Text>
              </View>
            ))}
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Payment', { type:'subscription', plan:selected })}>
          <Text style={styles.btnTxt}>{t('proceed_payment')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip} disabled={skipping}>
          {skipping
            ? <ActivityIndicator size="small" color={COLORS.muted}/>
            : <Text style={styles.skipTxt}>{t('skip_dev')}</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero:         { padding:22, paddingTop:54, alignItems:'center' },
  heroT:        { fontFamily:FONTS.display, fontSize:26, color:'#fff8ee', marginBottom:5 },
  heroS:        { fontSize:12, color:'rgba(232,201,122,0.55)', textAlign:'center' },
  planCard:     { backgroundColor:COLORS.surface, borderWidth:1.5, borderColor:COLORS.border, borderRadius:10, padding:16, marginBottom:12 },
  planSelected: { borderColor:COLORS.gold, backgroundColor:'#fef9ee' },
  planName:     { fontFamily:FONTS.display, fontSize:18, color:COLORS.dark, marginBottom:4 },
  popularBadge: { backgroundColor:COLORS.gold, paddingHorizontal:8, paddingVertical:2, borderRadius:3, alignSelf:'flex-start' },
  popularTxt:   { fontSize:9, color:COLORS.dark, fontWeight:'700' },
  planPrice:    { fontFamily:FONTS.display, fontSize:24, color:COLORS.gold },
  planPer:      { fontSize:10, color:COLORS.muted },
  featureRow:   { flexDirection:'row', alignItems:'center', gap:8, marginBottom:5 },
  featureTxt:   { fontSize:13, color:COLORS.brown },
  btn:          { backgroundColor:COLORS.gold, padding:15, borderRadius:5, alignItems:'center' },
  btnTxt:       { fontFamily:FONTS.bodySemiBold, fontSize:14, color:COLORS.dark, letterSpacing:0.5 },
  skipBtn:      { alignItems:'center', paddingVertical:14 },
  skipTxt:      { fontSize:12, color:COLORS.muted, textDecorationLine:'underline' },
});
