import React, { useEffect, useRef } from 'react';
import { Platform, View, Modal, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import * as Font from 'expo-font';
import * as Updates from 'expo-updates';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import Constants from 'expo-constants';
import * as Application from 'expo-application';
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
import { authAPI, configAPI } from './src/services/api';

const IOS_STORE_URL     = 'https://apps.apple.com/app/id6782191284';
const ANDROID_STORE_URL = 'https://play.google.com/store/apps/details?id=app.servix.world';
const IOS_APP_ID        = '6782191284';
const ANDROID_PKG       = 'app.servix.world';

function isNewerVersion(serverVer, localVer) {
  const parse = v => (v || '0.0.0').split('.').map(Number);
  const [sM, sm, sp] = parse(serverVer);
  const [lM, lm, lp] = parse(localVer);
  if (sM !== lM) return sM > lM;
  if (sm !== lm) return sm > lm;
  return sp > lp;
}

// Check the store directly from the device — device IPs are never blocked by stores.
// For iOS: Apple's official iTunes lookup API (always reliable).
// For Android: fetch Play Store page and parse the version from embedded data.
async function fetchStoreVersion() {
  if (Platform.OS === 'ios') {
    const r = await fetch(`https://itunes.apple.com/lookup?id=${IOS_APP_ID}&country=us`);
    const d = await r.json();
    return d.results?.[0]?.version ?? null;
  }
  const r = await fetch(
    `https://play.google.com/store/apps/details?id=${ANDROID_PKG}&hl=en_US`,
    { headers: { 'Accept-Language': 'en-US,en;q=0.9' } }
  );
  const html = await r.text();
  // JSON-LD structured data is the most stable pattern Google embeds
  const patterns = [
    /"softwareVersion"\s*:\s*"([^"]+)"/,
    /\[\[\["([\d]+\.[\d]+\.[\d]+)"\]\],null,\[/,
    /\["([\d]+\.[\d]+\.[\d]+)","[\d]+\.[\d]+/,
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m?.[1]) return m[1];
  }
  return null;
}

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
  const [appReady, setAppReady]     = React.useState(false);
  const [updateUrl, setUpdateUrl]   = React.useState(null);
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
        // Explicit OTA check: download + apply immediately so users never need
        // to restart the app twice. reloadAsync() restarts the JS bundle in-place.
        if (!__DEV__ && Updates.isEnabled) {
          try {
            const update = await Updates.checkForUpdateAsync();
            if (update.isAvailable) {
              await Updates.fetchUpdateAsync();
              await Updates.reloadAsync();
              return; // reloadAsync() restarts the JS — code below won't run
            }
          } catch {}
        }

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
      notifResponseListener.current?.remove();
    };
  }, []);

  // Version check — runs after appReady so the Modal is already mounted when setUpdateUrl fires.
  useEffect(() => {
    if (!appReady) return;
    (async () => {
      try {
        const localVersion = Application.nativeApplicationVersion || Constants.expoConfig?.version || '0.0.0';
        let storeVersion = null;
        try {
          storeVersion = await Promise.race([
            fetchStoreVersion(),
            new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 8000)),
          ]);
        } catch {}
        if (!storeVersion) {
          const res = await configAPI.getVersion();
          storeVersion = Platform.OS === 'ios' ? res.data?.ios : res.data?.android;
        }
        if (storeVersion && isNewerVersion(storeVersion, localVersion)) {
          setUpdateUrl(Platform.OS === 'ios' ? IOS_STORE_URL : ANDROID_STORE_URL);
        }
      } catch {}
    })();
  }, [appReady]);

  // In production: native splash stays on top until hideAsync() — this view is never seen.
  // In Expo Go: native splash isn't controlled by us, so show a plain cream background
  // to avoid a black flash while init runs.
  if (!appReady) return <View style={{ flex: 1, backgroundColor: '#f9f5f0' }} />;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppNavigator />
        <Toast />

        {/* ── App update banner ─────────────────────────────────────────── */}
        <Modal visible={!!updateUrl} transparent animationType="slide" statusBarTranslucent>
          <View style={upStyles.overlay}>
            <View style={upStyles.sheet}>
              <View style={upStyles.iconWrap}>
                <Text style={upStyles.icon}>🆕</Text>
              </View>
              <Text style={upStyles.title}>Update Available</Text>
              <Text style={upStyles.titleAr}>يوجد تحديث جديد</Text>
              <Text style={upStyles.body}>
                A new version of Servix is available. Update now to get the latest features and improvements.
              </Text>
              <Text style={upStyles.bodyAr}>
                يتوفر إصدار جديد من Servix. قم بالتحديث الآن للحصول على أحدث الميزات والتحسينات.
              </Text>
              <TouchableOpacity
                style={upStyles.updateBtn}
                onPress={() => Linking.openURL(updateUrl)}
                activeOpacity={0.85}>
                <Text style={upStyles.updateBtnTxt}>
                  {Platform.OS === 'ios' ? '  Update on App Store' : '  Update on Google Play'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={upStyles.laterBtn}
                onPress={() => setUpdateUrl(null)}>
                <Text style={upStyles.laterTxt}>Maybe Later  /  ربما لاحقاً</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const upStyles = StyleSheet.create({
  overlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet:        { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 28, paddingBottom: 40, alignItems: 'center' },
  iconWrap:     { width: 64, height: 64, borderRadius: 32, backgroundColor: '#e8f4f1', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  icon:         { fontSize: 30 },
  title:        { fontSize: 22, fontWeight: '700', color: '#0D3827', marginBottom: 2, textAlign: 'center' },
  titleAr:      { fontSize: 18, fontWeight: '700', color: '#0D3827', marginBottom: 12, textAlign: 'center' },
  body:         { fontSize: 13, color: '#555', lineHeight: 20, textAlign: 'center', marginBottom: 4 },
  bodyAr:       { fontSize: 13, color: '#555', lineHeight: 20, textAlign: 'center', marginBottom: 24 },
  updateBtn:    { backgroundColor: '#0D3827', borderRadius: 12, paddingVertical: 15, paddingHorizontal: 32, width: '100%', alignItems: 'center', marginBottom: 12 },
  updateBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },
  laterBtn:     { paddingVertical: 10 },
  laterTxt:     { fontSize: 13, color: '#888' },
});
