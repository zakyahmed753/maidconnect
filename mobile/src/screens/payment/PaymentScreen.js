import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, TextInput,
  StyleSheet, StatusBar, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { paymentsAPI } from '../../services/api';
import { COLORS, FONTS } from '../../utils/theme';
import Toast from 'react-native-toast-message';

const METHODS = [
  { id:'fawry',        icon:'🏧', name:'Fawry',          desc:'Pay at any Fawry outlet' },
  { id:'vodafone_cash',icon:'📱', name:'Vodafone Cash',   desc:'Pay via Vodafone Cash wallet' },
  { id:'instapay',     icon:'💸', name:'InstaPay',        desc:'Pay via InstaPay app' },
  { id:'amazon_pay',   icon:'🛒', name:'Amazon Pay',      desc:'Pay with Amazon Pay' },
];

export default function PaymentScreen({ route, navigation }) {
  const { type, plan, maidProfileId, chatId, amount, currency, maidName } = route.params || {};
  const [method, setMethod] = useState('fawry');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const USD_TO_EGP = 49;
  const displayAmount = amount || (plan === 'annual' ? 79 * USD_TO_EGP : 9 * USD_TO_EGP);

  const handlePay = async () => {
    setLoading(true);
    try {
      let res;
      const payload = { type, plan, maidProfileId, chatId };

      if (method === 'fawry') {
        res = await paymentsAPI.fawry(payload);
        navigation.replace('PaymentResult', {
          type: 'fawry',
          fawryRef: res.data.fawryRefNum,
          amount: res.data.amount,
          paymentId: res.data.paymentId
        });
      } else if (method === 'vodafone_cash') {
        if (!phone) { Toast.show({ type:'error', text1:'Enter Vodafone number' }); setLoading(false); return; }
        res = await paymentsAPI.vodafoneCash({ ...payload, phoneNumber: phone });
        navigation.replace('PaymentResult', { type:'vodafone', redirectUrl: res.data.redirectUrl, amount: res.data.amount, paymentId: res.data.paymentId });
      } else if (method === 'instapay') {
        res = await paymentsAPI.instapay(payload);
        navigation.replace('PaymentResult', { type:'instapay', paymentUrl: res.data.paymentUrl, amount: res.data.amount, paymentId: res.data.paymentId });
      } else if (method === 'amazon_pay') {
        res = await paymentsAPI.amazonPay(payload);
        navigation.replace('PaymentResult', { type:'amazon', amazonPayUrl: res.data.amazonPayUrl, amount: res.data.amount, paymentId: res.data.paymentId });
      }
    } catch (err) {
      Toast.show({ type:'error', text1: err.response?.data?.message || 'Payment initiation failed' });
    } finally { setLoading(false); }
  };

  return (
    <View style={{ flex:1, backgroundColor:COLORS.cream }}>
      <StatusBar barStyle="light-content"/>
      <LinearGradient colors={['#1a1108','#3d2203']} style={styles.hero}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom:12 }}>
          <Text style={{ fontSize:22, color:'rgba(232,201,122,0.6)' }}>←</Text>
        </TouchableOpacity>
        <Text style={{ fontSize:22, marginBottom:6 }}>💳</Text>
        <Text style={styles.heroTitle}>Complete Payment</Text>
        <Text style={styles.heroSub}>Secure checkout — activates instantly</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding:16, paddingBottom:40 }}>
        {/* Order summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionLabel}>Order Summary</Text>
          <View style={styles.summaryRow}><Text style={styles.sLabel}>{type === 'subscription' ? `${plan} Subscription` : `Commission — ${maidName}`}</Text><Text style={styles.sVal}>EGP {displayAmount.toLocaleString()}</Text></View>
          <View style={styles.summaryRow}><Text style={styles.sLabel}>Platform Fee</Text><Text style={styles.sVal}>EGP 0</Text></View>
          <View style={[styles.summaryRow, { borderBottomWidth:0, paddingTop:8, marginTop:4, borderTopWidth:1, borderTopColor:COLORS.border }]}>
            <Text style={[styles.sLabel, { fontWeight:'700', color:COLORS.dark }]}>Total Due</Text>
            <Text style={styles.totalVal}>EGP {displayAmount.toLocaleString()}</Text>
          </View>
        </View>

        {/* Payment methods */}
        <Text style={[styles.sectionLabel, { marginTop:18, marginBottom:10 }]}>Payment Method</Text>
        {METHODS.map(m => (
          <TouchableOpacity key={m.id} onPress={() => setMethod(m.id)}
            style={[styles.methodCard, method === m.id && styles.methodCardSelected]}>
            <View style={styles.methodIcon}><Text style={{ fontSize:20 }}>{m.icon}</Text></View>
            <View style={{ flex:1 }}>
              <Text style={styles.methodName}>{m.name}</Text>
              <Text style={styles.methodDesc}>{m.desc}</Text>
            </View>
            {method === m.id && <Text style={{ fontSize:18, color:COLORS.gold }}>✓</Text>}
          </TouchableOpacity>
        ))}

        {/* Vodafone number field */}
        {method === 'vodafone_cash' && (
          <View style={{ marginTop:8 }}>
            <Text style={styles.sectionLabel}>Vodafone Number</Text>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone}
              placeholder="01XXXXXXXXX" placeholderTextColor={COLORS.muted}
              keyboardType="phone-pad"/>
          </View>
        )}

        <View style={styles.secureNote}>
          <Text style={{ fontSize:14 }}>🔒</Text>
          <Text style={styles.secureTxt}>256-bit SSL encryption · PCI DSS compliant</Text>
        </View>

        <TouchableOpacity style={[styles.payBtn, loading && { opacity:0.6 }]} onPress={handlePay} disabled={loading}>
          {loading
            ? <ActivityIndicator color={COLORS.dark}/>
            : <Text style={styles.payBtnTxt}>Pay EGP {displayAmount.toLocaleString()} — Confirm Now</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero:        { paddingHorizontal:18, paddingTop:54, paddingBottom:20 },
  heroTitle:   { fontFamily:FONTS.display, fontSize:24, color:'#fff8ee', marginBottom:4 },
  heroSub:     { fontSize:12, color:'rgba(232,201,122,0.55)' },
  summaryCard: { backgroundColor:COLORS.surface, borderWidth:1, borderColor:COLORS.border, borderRadius:8, padding:16 },
  sectionLabel:{ fontSize:10, letterSpacing:1.2, textTransform:'uppercase', color:COLORS.muted, fontFamily:FONTS.bodySemiBold, marginBottom:10 },
  summaryRow:  { flexDirection:'row', justifyContent:'space-between', paddingVertical:7, borderBottomWidth:1, borderBottomColor:COLORS.border },
  sLabel:      { fontSize:13, color:COLORS.brown },
  sVal:        { fontSize:13, fontWeight:'600', color:COLORS.dark },
  totalVal:    { fontFamily:FONTS.display, fontSize:20, color:COLORS.gold },
  methodCard:  { flexDirection:'row', alignItems:'center', gap:12, padding:13, borderWidth:1.5, borderColor:COLORS.border, borderRadius:7, marginBottom:8, backgroundColor:COLORS.surface },
  methodCardSelected: { borderColor:COLORS.gold, backgroundColor:'#fef9ee' },
  methodIcon:  { width:38, height:38, backgroundColor:'#f4ede0', borderRadius:6, alignItems:'center', justifyContent:'center' },
  methodName:  { fontSize:14, fontWeight:'500', color:COLORS.text },
  methodDesc:  { fontSize:11, color:COLORS.muted },
  input:       { borderWidth:1.5, borderColor:COLORS.border, borderRadius:5, padding:12, fontSize:14, color:COLORS.text, backgroundColor:COLORS.surface },
  secureNote:  { flexDirection:'row', alignItems:'center', gap:6, marginVertical:14 },
  secureTxt:   { fontSize:11, color:COLORS.muted },
  payBtn:      { backgroundColor:COLORS.gold, padding:16, borderRadius:5, alignItems:'center' },
  payBtnTxt:   { fontFamily:FONTS.bodySemiBold, fontSize:14, color:COLORS.dark, letterSpacing:0.5 },
});
