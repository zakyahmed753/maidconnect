import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import useAuthStore from '../store/authStore';
import { COLORS } from '../utils/theme';
import { useTranslation } from '../utils/i18n';
import HiredMaidsScreen from '../screens/housewife/HiredMaidsScreen';

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
import WaitlistScreen from '../screens/housewife/WaitlistScreen';
import { AnalyticsScreen, EditHWProfileScreen, SupportScreen, PaymentHistoryScreen } from '../screens/screens';

const Stack = createStackNavigator();
const Tab   = createBottomTabNavigator();

const TabIcon = ({ icon, focused, labelKey }) => {
  const { t } = useTranslation();
  return (
    <View style={{ alignItems:'center', gap:3 }}>
      <Text style={{ fontSize:20 }}>{icon}</Text>
      <Text style={{ fontSize:8, letterSpacing:0.8, textTransform:'uppercase', color: focused ? COLORS.gold : COLORS.muted, fontWeight: focused ? '700' : '400' }}>{t(labelKey)}</Text>
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
      <Stack.Screen name="HiredMaids"      component={HiredMaidsScreen}/>
      <Stack.Screen name="Payment"         component={PaymentScreen}/>
      <Stack.Screen name="PaymentResult"   component={PaymentResultScreen}/>
    </Stack.Navigator>
  );
}

// Housewife bottom tabs
function HouseWifeTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator screenOptions={{ headerShown:false, tabBarStyle:{ backgroundColor:COLORS.surface, borderTopColor:COLORS.border, height:60 + insets.bottom, paddingBottom: insets.bottom }, tabBarShowLabel:false }}>
      <Tab.Screen name="Browse"  component={BrowseStack}   options={{ tabBarIcon:({focused})=><TabIcon icon="🔍" focused={focused} labelKey="tab_browse"/> }}/>
      <Tab.Screen name="Saved"   component={SavedScreen}   options={{ tabBarIcon:({focused})=><TabIcon icon="❤️" focused={focused} labelKey="tab_saved"/> }}/>
      <Tab.Screen name="Chats"   component={ChatsListScreen} options={{ tabBarIcon:({focused})=><TabIcon icon="💬" focused={focused} labelKey="tab_chats"/> }}/>
      <Tab.Screen name="Alerts"  component={NotificationsScreen} options={{ tabBarIcon:({focused})=><TabIcon icon="🔔" focused={focused} labelKey="tab_alerts"/> }}/>
      <Tab.Screen name="Me"      component={HWProfileStack} options={{ tabBarIcon:({focused})=><TabIcon icon="👤" focused={focused} labelKey="tab_me"/> }}/>
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
  return (
    <Tab.Navigator screenOptions={{ headerShown:false, tabBarStyle:{ backgroundColor:COLORS.surface, borderTopColor:COLORS.border, height:60 + insets.bottom, paddingBottom: insets.bottom }, tabBarShowLabel:false }}>
      <Tab.Screen name="MaidHome"   component={MaidHomeStack}     options={{ tabBarIcon:({focused})=><TabIcon icon="🏠" focused={focused} labelKey="tab_home"/> }}/>
      <Tab.Screen name="MaidChats"  component={MaidChatsStack}    options={{ tabBarIcon:({focused})=><TabIcon icon="💬" focused={focused} labelKey="tab_chats"/> }}/>
      <Tab.Screen name="MaidAlerts" component={NotificationsScreen} options={{ tabBarIcon:({focused})=><TabIcon icon="🔔" focused={focused} labelKey="tab_alerts"/> }}/>
    </Tab.Navigator>
  );
}

// Root navigator
export default function AppNavigator() {
  const { token, user, profile, activeAreas } = useAuthStore();

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
          </>
        ) : user?.role === 'maid' && profile && (
            profile.verificationStatus === 'pending' ||
            profile.approvalStatus !== 'approved'
          ) ? (
          // Maid awaiting admin approval
          <>
            <Stack.Screen name="PendingApproval"    component={PendingApprovalScreen}/>
            <Stack.Screen name="SelfieVerification" component={SelfieVerificationScreen}/>
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
        ) : !activeAreas.includes(profile?.residentialArea) ? (
          // Area not yet active — waitlist
          <>
            <Stack.Screen name="Waitlist" component={WaitlistScreen}/>
          </>
        ) : (
          <Stack.Screen name="HWMain" component={HouseWifeTabs}/>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
