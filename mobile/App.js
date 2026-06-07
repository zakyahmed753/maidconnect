import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import * as Font from 'expo-font';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import {
  CormorantGaramond_400Regular,
  CormorantGaramond_600SemiBold,
  CormorantGaramond_700Bold,
  CormorantGaramond_700Bold_Italic,
  CormorantGaramond_400Regular_Italic,
} from '@expo-google-fonts/cormorant-garamond';
import {
  Jost_300Light, Jost_400Regular,
  Jost_500Medium, Jost_600SemiBold, Jost_700Bold,
} from '@expo-google-fonts/jost';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import AppNavigator, { navigationRef } from './src/navigation/AppNavigator';
import useAuthStore from './src/store/authStore';
import useLangStore from './src/store/langStore';
import { authAPI } from './src/services/api';
import { COLORS } from './src/utils/theme';

// Show notifications while app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function registerForPushNotifications() {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return null;

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = tokenData.data;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#C9A84C',
      });
    }
    return token;
  } catch { return null; }
}

export default function App() {
  const [fontsLoaded, setFontsLoaded] = React.useState(false);
  const init = useAuthStore(s => s.init);
  const loading = useAuthStore(s => s.loading);
  const initLang = useLangStore(s => s.init);
  const notifResponseListener = useRef();

  useEffect(() => {
    async function load() {
      await initLang();
      await Font.loadAsync({
        CormorantGaramond_400Regular,
        CormorantGaramond_600SemiBold,
        CormorantGaramond_700Bold,
        CormorantGaramond_700Bold_Italic,
        CormorantGaramond_400Regular_Italic,
        Jost_300Light, Jost_400Regular,
        Jost_500Medium, Jost_600SemiBold, Jost_700Bold,
      });
      setFontsLoaded(true);
      await init();

      // Register push token and save to backend
      const token = await registerForPushNotifications();
      if (token) {
        try { await authAPI.updateMe({ fcmToken: token }); } catch {}
      }
    }
    load();

    // Navigate when user taps a notification
    notifResponseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (!navigationRef.isReady()) return;
      if (data?.screen === 'HireRequest') {
        navigationRef.navigate('MaidMain', { screen: 'MaidHome', params: { screen: 'HireRequest' } });
      } else if (data?.screen === 'Browse' || data?.screen === 'Home') {
        navigationRef.navigate('HWMain', { screen: 'Browse' });
      } else if (data?.chatId) {
        navigationRef.navigate('HWMain', { screen: 'Chats' });
      }
    });

    return () => {
      if (notifResponseListener.current) {
        Notifications.removeNotificationSubscription(notifResponseListener.current);
      }
    };
  }, []);

  if (!fontsLoaded || loading) {
    return (
      <View style={{ flex:1, backgroundColor:COLORS.dark, alignItems:'center', justifyContent:'center' }}>
        <ActivityIndicator size="large" color={COLORS.gold} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex:1 }}>
      <SafeAreaProvider>
        <AppNavigator />
        <Toast />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
