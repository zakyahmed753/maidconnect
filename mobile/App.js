import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Font from 'expo-font';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import Constants from 'expo-constants';
import {
  CormorantGaramond_600SemiBold,
  CormorantGaramond_700Bold,
  CormorantGaramond_700Bold_Italic,
} from '@expo-google-fonts/cormorant-garamond';
import {
  Jost_400Regular,
  Jost_500Medium, Jost_600SemiBold,
} from '@expo-google-fonts/jost';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import AppNavigator, { navigationRef } from './src/navigation/AppNavigator';
import useAuthStore from './src/store/authStore';
import useLangStore from './src/store/langStore';
import { authAPI } from './src/services/api';

// Keep the real native splash screen visible until we explicitly hide it
SplashScreen.preventAutoHideAsync().catch(() => {});

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
        lightColor: '#5dd6a8',
      });
    }
    return token;
  } catch { return null; }
}

export default function App() {
  const [appReady, setAppReady] = React.useState(false);
  const init = useAuthStore(s => s.init);
  const user = useAuthStore(s => s.user);
  const initLang = useLangStore(s => s.init);
  const notifResponseListener = useRef();

  useEffect(() => {
    if (!user?._id) return;
    (async () => {
      const pushToken = await registerForPushNotifications();
      if (pushToken) {
        try { await authAPI.updateMe({ fcmToken: pushToken }); } catch {}
      }
    })();
  }, [user?._id]);

  useEffect(() => {
    async function prepare() {
      try {
        // Safety net: if network is dead or server is slow, never freeze past 5s.
        // init() keeps running in background after timeout — Zustand will update
        // the store and re-render naturally once the call resolves.
        await Promise.race([
          Promise.all([initLang(), init()]),
          new Promise(resolve => setTimeout(resolve, 5000)),
        ]);

        // Fonts load in background — zero startup cost
        Font.loadAsync({
          CormorantGaramond_600SemiBold,
          CormorantGaramond_700Bold,
          CormorantGaramond_700Bold_Italic,
          Jost_400Regular,
          Jost_500Medium,
          Jost_600SemiBold,
        }).catch(() => {});
      } catch (e) {
        console.warn('App init error:', e);
      } finally {
        setAppReady(true);
        // Dismiss the real native splash screen (your logo design)
        SplashScreen.hideAsync().catch(() => {});
      }
    }

    prepare();

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

  // Return null while native splash is still showing — no custom screen needed
  if (!appReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppNavigator />
        <Toast />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
