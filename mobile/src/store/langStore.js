import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import * as Updates from 'expo-updates';
import { Alert, BackHandler, I18nManager, Platform } from 'react-native';

I18nManager.allowRTL(true);

const RESTART_LABELS = {
  en: { title: 'Restart Required', body: 'Close and reopen the app to apply RTL changes.', btn: 'Close App' },
  ar: { title: 'يلزم إغلاق التطبيق', body: 'أغلقي التطبيق وافتحيه تاني عشان اللغة تتطبق صح.', btn: 'أغلقي دلوقتي' },
  fr: { title: 'Redémarrage requis', body: "Fermez et rouvrez l'application pour appliquer la langue.", btn: 'Fermer' },
  ha: { title: 'Ana buƙatar sake farawa', body: 'Rufe kuma sake bude app don canza yaren.', btn: 'Rufe' },
};

const useLangStore = create((set) => ({
  lang: 'en',

  init: async () => {
    try {
      const saved = await SecureStore.getItemAsync('app_lang');
      if (saved) {
        I18nManager.forceRTL(saved === 'ar');
        set({ lang: saved });
      }
    } catch {}
  },

  setLang: async (lang) => {
    try {
      await SecureStore.setItemAsync('app_lang', lang);
      I18nManager.forceRTL(lang === 'ar');
      set({ lang });
      // Wait for modal close animation before showing Alert
      setTimeout(() => {
        const lbl = RESTART_LABELS[lang] || RESTART_LABELS.en;
        Alert.alert(lbl.title, lbl.body, [
          {
            text: lbl.btn,
            style: 'destructive',
            onPress: () => {
              if (Platform.OS === 'android') {
                // True process kill — guarantees cold start with fresh RTL on reopen
                BackHandler.exitApp();
              } else {
                // iOS: reload JS bundle (best available without native exit)
                Updates.reloadAsync().catch(() => {});
              }
            },
          },
          { text: 'Later', style: 'cancel' },
        ]);
      }, 500);
    } catch {}
  },
}));

export default useLangStore;
