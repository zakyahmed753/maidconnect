import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { I18nManager } from 'react-native';

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
    } catch {}
  },
}));

export default useLangStore;
