import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import * as Font from 'expo-font';
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
import Toast from 'react-native-toast-message';
import AppNavigator from './src/navigation/AppNavigator';
import useAuthStore from './src/store/authStore';
import useLangStore from './src/store/langStore';
import { COLORS } from './src/utils/theme';

export default function App() {
  const [fontsLoaded, setFontsLoaded] = React.useState(false);
  const init = useAuthStore(s => s.init);
  const loading = useAuthStore(s => s.loading);
  const initLang = useLangStore(s => s.init);

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
    }
    load();
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
      <AppNavigator />
      <Toast />
    </GestureHandlerRootView>
  );
}
