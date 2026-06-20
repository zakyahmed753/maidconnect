import React, { useEffect, useRef } from 'react';
import { View, Text, Platform } from 'react-native';
import * as Font from 'expo-font';
import * as Notifications from 'expo-notifications';
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
  const loading = useAuthStore(s => s.loading);
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
        // Critical path only — lang + auth. Fonts load in background.
        await Promise.all([initLang(), init()]);

        // Kick off font loading without awaiting it — app renders with system
        // fonts instantly, then switches to custom fonts when ready.
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

  // Show branded green screen while auth initialises — never a black void.
  if (!appReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0D3827', alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(93,214,168,0.15)', borderWidth: 1, borderColor: 'rgba(93,214,168,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Text style={{ fontSize: 36 }}>🏠</Text>
        </View>
        <Text style={{ fontFamily: 'System', fontSize: 28, color: '#fff', fontWeight: '700', letterSpacing: 0.5 }}>Servix</Text>
        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 6, letterSpacing: 2, textTransform: 'uppercase' }}>Loading…</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppNavigator />
        <Toast />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
