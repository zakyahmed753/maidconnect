import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import useAuthStore from '../store/authStore';
import { COLORS } from '../utils/theme';

// Auth screens
import SplashScreen  from '../screens/auth/SplashScreen';
import LoginScreen   from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import RegisterHousewifeScreen from '../screens/auth/RegisterHousewifeScreen';
import SubscriptionScreen from '../screens/auth/SubscriptionScreen';
import PaymentScreen from '../screens/payment/PaymentScreen';
import PaymentResultScreen from '../screens/payment/PaymentResultScreen';

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

const Stack = createStackNavigator();
const Tab   = createBottomTabNavigator();

const TabIcon = ({ icon, focused, label }) => (
  <View style={{ alignItems:'center', gap:3 }}>
    <Text style={{ fontSize:20 }}>{icon}</Text>
    <Text style={{ fontSize:8, letterSpacing:0.8, textTransform:'uppercase', color: focused ? COLORS.gold : COLORS.muted, fontWeight: focused ? '700' : '400' }}>{label}</Text>
  </View>
);

// Housewife bottom tabs
function HouseWifeTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown:false, tabBarStyle:{ backgroundColor:COLORS.surface, borderTopColor:COLORS.border, height:70, paddingBottom:10 }, tabBarShowLabel:false }}>
      <Tab.Screen name="Browse"  component={BrowseStack}  options={{ tabBarIcon:({focused})=><TabIcon icon="🔍" focused={focused} label="Browse"/> }}/>
      <Tab.Screen name="Saved"   component={SavedScreen}   options={{ tabBarIcon:({focused})=><TabIcon icon="❤️" focused={focused} label="Saved"/> }}/>
      <Tab.Screen name="Chats"   component={ChatsListScreen} options={{ tabBarIcon:({focused})=><TabIcon icon="💬" focused={focused} label="Chats"/> }}/>
      <Tab.Screen name="Alerts"  component={NotificationsScreen} options={{ tabBarIcon:({focused})=><TabIcon icon="🔔" focused={focused} label="Alerts"/> }}/>
      <Tab.Screen name="Me"      component={HWProfileScreen} options={{ tabBarIcon:({focused})=><TabIcon icon="👤" focused={focused} label="Me"/> }}/>
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
    </Stack.Navigator>
  );
}

// Maid bottom tabs
function MaidTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown:false, tabBarStyle:{ backgroundColor:COLORS.surface, borderTopColor:COLORS.border, height:70, paddingBottom:10 }, tabBarShowLabel:false }}>
      <Tab.Screen name="MaidDash"    component={MaidDashScreen} options={{ tabBarIcon:({focused})=><TabIcon icon="🏠" focused={focused} label="Home"/> }}/>
      <Tab.Screen name="MaidChats"   component={ChatsListScreen} options={{ tabBarIcon:({focused})=><TabIcon icon="💬" focused={focused} label="Chats"/> }}/>
      <Tab.Screen name="MaidAlerts"  component={NotificationsScreen} options={{ tabBarIcon:({focused})=><TabIcon icon="🔔" focused={focused} label="Alerts"/> }}/>
      <Tab.Screen name="EditProfile" component={EditProfileScreen} options={{ tabBarIcon:({focused})=><TabIcon icon="👤" focused={focused} label="Profile"/> }}/>
    </Tab.Navigator>
  );
}

// Root navigator
export default function AppNavigator() {
  const { token, user } = useAuthStore();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown:false, cardStyle:{ backgroundColor:COLORS.cream } }}>
        {!token ? (
          // Auth flow
          <>
            <Stack.Screen name="Splash"       component={SplashScreen}/>
            <Stack.Screen name="Login"        component={LoginScreen}/>
            <Stack.Screen name="Register"          component={RegisterScreen}/>
            <Stack.Screen name="RegisterHousewife" component={RegisterHousewifeScreen}/>
            <Stack.Screen name="Subscription" component={SubscriptionScreen}/>
            <Stack.Screen name="Payment"      component={PaymentScreen}/>
            <Stack.Screen name="PaymentResult" component={PaymentResultScreen}/>
          </>
        ) : user?.role === 'maid' ? (
          <Stack.Screen name="MaidMain" component={MaidTabs}/>
        ) : (
          <Stack.Screen name="HWMain" component={HouseWifeTabs}/>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
