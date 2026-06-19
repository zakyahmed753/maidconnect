import React, { useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { authAPI, notificationsAPI } from '../services/api';

// Show notifications + play sound even when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  true,
  }),
});
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import useAuthStore from '../store/authStore';
import useNotifStore from '../store/notifStore';
import { COLORS } from '../utils/theme';
import { useTranslation } from '../utils/i18n';
import HiredMaidsScreen from '../screens/housewife/HiredMaidsScreen';
import PreviouslyHiredScreen from '../screens/housewife/PreviouslyHiredScreen';

export const navigationRef = createNavigationContainerRef();

// Auth screens
import SplashScreen  from '../screens/auth/SplashScreen';
import LoginScreen   from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import RegisterHousewifeScreen from '../screens/auth/RegisterHousewifeScreen';
import SelfieVerificationScreen from '../screens/auth/SelfieVerificationScreen';
import PendingApprovalScreen from '../screens/auth/PendingApprovalScreen';
import SubscriptionScreen from '../screens/auth/SubscriptionScreen';
import PaymentScreen from '../screens/payment/PaymentScreen';
import PaymentResultScreen from '../screens/payment/PaymentResultScreen';
import CustomerSubscriptionScreen from '../screens/housewife/CustomerSubscriptionScreen';
import OTPVerificationScreen from '../screens/auth/OTPVerificationScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';

// Housewife screens
import BrowseScreen  from '../screens/housewife/BrowseScreen';
import MaidDetailScreen from '../screens/housewife/MaidDetailScreen';
import SavedScreen   from '../screens/housewife/SavedScreen';
import HWProfileScreen from '../screens/housewife/HWProfileScreen';
import ApprovalScreen from '../screens/housewife/ApprovalScreen';

// Shared screens
import ChatScreen    from '../screens/chat/ChatScreen';
import ChatsListScreen from '../screens/chat/ChatsListScreen';
import NotificationsScreen from '../screens/NotificationsScreen';

// Maid screens
import MaidDashScreen from '../screens/maid/MaidDashScreen';
import EditProfileScreen from '../screens/maid/EditProfileScreen';
import HireRequestScreen from '../screens/maid/HireRequestScreen';
import HiredCelebrationScreen from '../screens/maid/HiredCelebrationScreen';
import CouponScreen from '../screens/maid/CouponScreen';
import AreaSelectScreen from '../screens/housewife/AreaSelectScreen';
import { AnalyticsScreen, EditHWProfileScreen, SupportScreen, PaymentHistoryScreen } from '../screens/screens';

const Stack = createStackNavigator();
const Tab   = createBottomTabNavigator();

const TabIcon = ({ name, focused, labelKey, badge = 0 }) => {
  const { t } = useTranslation();
  return (
    <View style={{ alignItems: 'center', paddingTop: 2 }}>
      <View style={{
        width: 54, height: 30, borderRadius: 15,
        backgroundColor: focused ? 'rgba(13,56,39,0.12)' : 'transparent',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Ionicons
          name={focused ? name : `${name}-outline`}
          size={22}
          color={focused ? COLORS.green : COLORS.muted}
        />
        {badge > 0 && (
          <View style={{
            position: 'absolute', top: -4, right: 0,
            backgroundColor: '#e53e3e', borderRadius: 8,
            minWidth: 16, height: 16, alignItems: 'center',
            justifyContent: 'center', paddingHorizontal: 3,
          }}>
            <Text style={{ fontSize: 9, color: '#fff', fontWeight: '800' }}>
              {badge > 9 ? '9+' : String(badge)}
            </Text>
          </View>
        )}
      </View>
      <Text style={{
        fontSize: 9, marginTop: 2, letterSpacing: 0.4,
        color: focused ? COLORS.green : COLORS.muted,
        fontWeight: focused ? '700' : '400',
      }}>{t(labelKey)}</Text>
    </View>
  );
};

function HWProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown:false }}>
      <Stack.Screen name="HWProfile"       component={HWProfileScreen}/>
      <Stack.Screen name="EditHWProfile"   component={EditHWProfileScreen}/>
      <Stack.Screen name="Support"         component={SupportScreen}/>
      <Stack.Screen name="PaymentHistory"  component={PaymentHistoryScreen}/>
      <Stack.Screen name="HiredMaids"          component={HiredMaidsScreen}/>
      <Stack.Screen name="PreviouslyHired"     component={PreviouslyHiredScreen}/>
      <Stack.Screen name="Payment"         component={PaymentScreen}/>
      <Stack.Screen name="PaymentResult"   component={PaymentResultScreen}/>
    </Stack.Navigator>
  );
}

function HWChatsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown:false }}>
      <Stack.Screen name="HWChatsList" component={ChatsListScreen}/>
      <Stack.Screen name="Chat"        component={ChatScreen}/>
    </Stack.Navigator>
  );
}

// Housewife bottom tabs
function HouseWifeTabs() {
  const insets = useSafeAreaInsets();
  const { unreadCount, setCount } = useNotifStore();
  const refreshProfile = useAuthStore(s => s.refreshProfile);
  const loadUnread = useCallback(() => {
    notificationsAPI.getAll()
      .then(r => setCount((r.data.notifications || []).filter(n => !n.isRead).length))
      .catch(() => {});
  }, [setCount]);
  useEffect(() => {
    loadUnread();
    const iv = setInterval(loadUnread, 30000);
    return () => clearInterval(iv);
  }, [loadUnread]);
  // Poll profile so subscription approvals by admin are reflected promptly
  useEffect(() => {
    const iv = setInterval(refreshProfile, 15000);
    return () => clearInterval(iv);
  }, [refreshProfile]);
  return (
    <Tab.Navigator screenOptions={{ headerShown:false, tabBarStyle:{ backgroundColor:COLORS.surface, borderTopColor:COLORS.border, height:64 + insets.bottom, paddingBottom: insets.bottom, elevation:8, shadowColor:'#000', shadowOpacity:0.06, shadowRadius:8 }, tabBarShowLabel:false }}>
      <Tab.Screen name="Browse"  component={BrowseStack}   options={{ tabBarIcon:({focused})=><TabIcon name="home" focused={focused} labelKey="tab_home"/> }}/>
      <Tab.Screen name="Saved"   component={SavedScreen}   options={{ tabBarIcon:({focused})=><TabIcon name="bookmark" focused={focused} labelKey="tab_saved"/> }}/>
      <Tab.Screen name="Chats"   component={HWChatsStack}  options={{ tabBarIcon:({focused})=><TabIcon name="chatbubbles" focused={focused} labelKey="tab_chats"/> }}/>
      <Tab.Screen name="Alerts"  component={NotificationsScreen} options={{ tabBarButton:() => null, listeners:{ focus: loadUnread } }}/>
      <Tab.Screen name="Me"      component={HWProfileStack} options={{ tabBarIcon:({focused})=><TabIcon name="person" focused={focused} labelKey="tab_me" badge={unreadCount}/> }} listeners={({ navigation }) => ({ tabPress: e => { e.preventDefault(); navigation.navigate('Me', { screen: 'HWProfile' }); } })}/>
    </Tab.Navigator>
  );
}

function BrowseStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown:false }}>
      <Stack.Screen name="BrowseMain"  component={BrowseScreen}/>
      <Stack.Screen name="MaidDetail"  component={MaidDetailScreen}/>
      <Stack.Screen name="Chat"        component={ChatScreen}/>
      <Stack.Screen name="Approval"    component={ApprovalScreen}/>
      <Stack.Screen name="Payment"     component={PaymentScreen}/>
      <Stack.Screen name="PaymentResult" component={PaymentResultScreen}/>
      <Stack.Screen name="CustomerSubscription" component={CustomerSubscriptionScreen}/>
    </Stack.Navigator>
  );
}

function MaidHomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown:false }}>
      <Stack.Screen name="MaidDash"          component={MaidDashScreen}/>
      <Stack.Screen name="Subscription"      component={SubscriptionScreen}/>
      <Stack.Screen name="Payment"           component={PaymentScreen}/>
      <Stack.Screen name="PaymentResult"     component={PaymentResultScreen}/>
      <Stack.Screen name="Analytics"         component={AnalyticsScreen}/>
      <Stack.Screen name="Support"           component={SupportScreen}/>
      <Stack.Screen name="EditProfile"       component={EditProfileScreen}/>
      <Stack.Screen name="PaymentHistory"    component={PaymentHistoryScreen}/>
      <Stack.Screen name="HireRequest"       component={HireRequestScreen}/>
      <Stack.Screen name="HiredCelebration"  component={HiredCelebrationScreen}/>
      <Stack.Screen name="Coupons"           component={CouponScreen}/>
      <Stack.Screen name="Chat"              component={ChatScreen}/>
    </Stack.Navigator>
  );
}

function MaidChatsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown:false }}>
      <Stack.Screen name="MaidChatsList" component={ChatsListScreen}/>
      <Stack.Screen name="Chat"          component={ChatScreen}/>
    </Stack.Navigator>
  );
}

// Maid bottom tabs
function MaidTabs() {
  const insets = useSafeAreaInsets();
  const { unreadCount, setCount } = useNotifStore();
  const loadUnread = useCallback(() => {
    notificationsAPI.getAll()
      .then(r => setCount((r.data.notifications || []).filter(n => !n.isRead).length))
      .catch(() => {});
  }, [setCount]);
  useEffect(() => {
    loadUnread();
    const iv = setInterval(loadUnread, 30000);
    return () => clearInterval(iv);
  }, [loadUnread]);
  return (
    <Tab.Navigator screenOptions={{ headerShown:false, tabBarStyle:{ backgroundColor:COLORS.surface, borderTopColor:COLORS.border, height:64 + insets.bottom, paddingBottom: insets.bottom, elevation:8, shadowColor:'#000', shadowOpacity:0.06, shadowRadius:8 }, tabBarShowLabel:false }}>
      <Tab.Screen name="MaidHome"   component={MaidHomeStack}     options={{ tabBarIcon:({focused})=><TabIcon name="home" focused={focused} labelKey="tab_home"/> }}/>
      <Tab.Screen name="MaidChats"  component={MaidChatsStack}    options={{ tabBarIcon:({focused})=><TabIcon name="chatbubbles" focused={focused} labelKey="tab_chats"/> }}/>
      <Tab.Screen name="MaidAlerts" component={NotificationsScreen} options={{ tabBarButton:() => null, listeners:{ focus: loadUnread } }}/>
    </Tab.Navigator>
  );
}

// Root navigator
export default function AppNavigator() {
  const { token, user, profile } = useAuthStore();

  // Register Expo push token whenever the user logs in
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        // Android: create sound-enabled notification channel
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'Servix Notifications',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            sound: 'default',
            lightColor: '#0D3827',
          });
        }
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') return;
        const tokenResult = await Notifications.getExpoPushTokenAsync({
          projectId: 'aaf38d20-cf98-4589-b23d-1e6838133970',
        });
        const expoPushToken = tokenResult.data;
        console.log('[Push] token:', expoPushToken);
        await authAPI.updateFCMToken(expoPushToken);
      } catch (e) {
        console.error('[Push] token registration failed:', e.message);
      }
    })();
  }, [token]);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown:false, cardStyle:{ backgroundColor:COLORS.cream } }}>
        {!token ? (
          // Unauthenticated + mid-registration (completeAuth not yet called)
          <>
            <Stack.Screen name="Splash"             component={SplashScreen}/>
            <Stack.Screen name="Login"              component={LoginScreen}/>
            <Stack.Screen name="Register"           component={RegisterScreen}/>
            <Stack.Screen name="RegisterHousewife"  component={RegisterHousewifeScreen}/>
            <Stack.Screen name="SelfieVerification" component={SelfieVerificationScreen}/>
            <Stack.Screen name="PendingApproval"    component={PendingApprovalScreen}/>
            <Stack.Screen name="Subscription"       component={SubscriptionScreen}/>
            <Stack.Screen name="Payment"            component={PaymentScreen}/>
            <Stack.Screen name="PaymentResult"      component={PaymentResultScreen}/>
            <Stack.Screen name="OTPVerification"    component={OTPVerificationScreen}/>
            <Stack.Screen name="ForgotPassword"     component={ForgotPasswordScreen}/>
            <Stack.Screen name="ResetPassword"      component={ResetPasswordScreen}/>
          </>
        ) : user?.role === 'maid' && profile && (
            profile.verificationStatus === 'pending' ||
            profile.approvalStatus !== 'approved'
          ) ? (
          // Maid awaiting admin approval
          <>
            <Stack.Screen name="PendingApproval"    component={PendingApprovalScreen}/>
            <Stack.Screen name="SelfieResubmit"     component={SelfieVerificationScreen}/>
            <Stack.Screen name="Subscription"       component={SubscriptionScreen}/>
            <Stack.Screen name="Payment"            component={PaymentScreen}/>
            <Stack.Screen name="PaymentResult"      component={PaymentResultScreen}/>
          </>
        ) : user?.role === 'maid' && (
            profile?.subscription?.status !== 'active' ||
            (profile?.subscription?.endDate && new Date(profile.subscription.endDate) < new Date())
          ) ? (
          // Approved but subscription not yet paid or expired — go straight to subscription
          <>
            <Stack.Screen name="Subscription"       component={SubscriptionScreen}/>
            <Stack.Screen name="Payment"            component={PaymentScreen}/>
            <Stack.Screen name="PaymentResult"      component={PaymentResultScreen}/>
          </>
        ) : user?.role === 'maid' ? (
          <Stack.Screen name="MaidMain" component={MaidTabs}/>
        ) : !profile?.residentialArea ? (
          // Housewife hasn't picked an area yet
          <>
            <Stack.Screen name="AreaSelect" component={AreaSelectScreen}/>
          </>
        ) : (
          <Stack.Screen name="HWMain" component={HouseWifeTabs}/>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
