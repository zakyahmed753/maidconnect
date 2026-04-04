// src/screens/auth/SubscriptionScreen.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS } from '../../utils/theme';
import useAuthStore from '../../store/authStore';

export default function SubscriptionScreen({ navigation }) {
  const completeAuth = useAuthStore(s => s.completeAuth);
  const [selected, setSelected] = useState('annual');
  const PLANS = [
    { id:'monthly', name:'Monthly Plan', price:'$9', per:'/month', egp:'EGP 441', features:['Active profile listing','Up to 5 photos','Voice messaging','Basic analytics'] },
    { id:'annual',  name:'Annual Plan',  price:'$79', per:'/year', egp:'EGP 3,871', popular:true, features:['Active profile all year','Unlimited photos','Voice messaging','Priority listing','Full analytics','Save 30% vs monthly'] },
  ];
  return (
    <View style={{ flex:1 }}>
      <StatusBar barStyle="light-content"/>
      <LinearGradient colors={['#1a1108','#3d2203']} style={styles.hero}>
        <Text style={{ fontSize:36, marginBottom:8 }}>👑</Text>
        <Text style={styles.heroT}>Maid Subscription</Text>
        <Text style={styles.heroS}>Stay visible to hundreds of families</Text>
      </LinearGradient>
      <ScrollView style={{ backgroundColor:COLORS.cream }} contentContainerStyle={{ padding:16, paddingBottom:40 }}>
        {PLANS.map(p => (
          <TouchableOpacity key={p.id} onPress={() => setSelected(p.id)}
            style={[styles.planCard, selected===p.id && styles.planSelected]}>
            <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
              <View><Text style={styles.planName}>{p.name}</Text>{p.popular && <View style={styles.popularBadge}><Text style={styles.popularTxt}>⭐ Most Popular</Text></View>}</View>
              <View style={{ alignItems:'flex-end' }}><Text style={styles.planPrice}>{p.price}</Text><Text style={styles.planPer}>{p.egp}{p.per}</Text></View>
            </View>
            {p.features.map(f=><View key={f} style={styles.featureRow}><Text style={{ color:COLORS.green, fontSize:14 }}>✓</Text><Text style={styles.featureTxt}>{f}</Text></View>)}
          </TouchableOpacity>
        ))}
        <View style={styles.commissionNote}>
          <Text style={styles.cnTitle}>💡 House Wife Commission Model</Text>
          <Text style={styles.cnBody}>House wives browse and chat for free. A one-time service commission is only charged when a maid is officially approved and hired.</Text>
        </View>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Payment', { type:'subscription', plan:selected })}>
          <Text style={styles.btnTxt}>Proceed to Payment →</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipBtn} onPress={completeAuth}>
          <Text style={styles.skipTxt}>Skip for now (Dev only)</Text>
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
  commissionNote:{ backgroundColor:'#fff9f0', borderWidth:1, borderColor:COLORS.border, borderRadius:7, padding:14, borderLeftWidth:3, borderLeftColor:COLORS.gold, marginBottom:16 },
  cnTitle:      { fontSize:12, fontWeight:'700', color:COLORS.dark, marginBottom:5 },
  cnBody:       { fontSize:12, color:COLORS.muted, lineHeight:18 },
  btn:          { backgroundColor:COLORS.gold, padding:15, borderRadius:5, alignItems:'center' },
  btnTxt:       { fontFamily:FONTS.bodySemiBold, fontSize:14, color:COLORS.dark, letterSpacing:0.5 },
  skipBtn:      { alignItems:'center', paddingVertical:14 },
  skipTxt:      { fontSize:12, color:COLORS.muted, textDecorationLine:'underline' },
});
