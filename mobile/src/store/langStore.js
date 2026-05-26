import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { I18nManager, Alert } from 'react-native';

I18nManager.allowRTL(true);

const useLangStore = create((set, get) => ({
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
      const prev = get().lang;
      await SecureStore.setItemAsync('app_lang', lang);
      set({ lang });
      const needsReload = lang === 'ar' || prev === 'ar';
      I18nManager.forceRTL(lang === 'ar');
      if (needsReload) {
        Alert.alert(
          lang === 'ar' ? 'إعادة تشغيل مطلوبة' : 'Restart Required',
          lang === 'ar'
            ? 'يرجى إغلاق التطبيق وإعادة فتحه لتطبيق تخطيط اللغة العربية.'
            : 'Please close and reopen the app to apply the full layout.',
          [{ text: lang === 'ar' ? 'حسنًا' : 'OK' }]
        );
      }
    } catch {}
  },
}));

export default useLangStore;
