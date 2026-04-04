import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { authAPI } from '../services/api';

const useAuthStore = create((set, get) => ({
  token:   null,
  user:    null,
  profile: null,
  loading: false,

  // Load persisted session
  init: async () => {
    set({ loading: true });
    try {
      const token = await SecureStore.getItemAsync('maidconnect_token');
      if (token) {
        const res = await authAPI.getMe();
        set({ token, user: res.data.user, profile: res.data.profile, loading: false });
      } else {
        set({ loading: false });
      }
    } catch {
      await SecureStore.deleteItemAsync('maidconnect_token');
      set({ token: null, user: null, profile: null, loading: false });
    }
  },

  register: async (data) => {
    const res = await authAPI.register(data);
    // Save to SecureStore so subsequent API calls (photo upload, createProfile) are authenticated
    // Do NOT update Zustand state yet — that would trigger AppNavigator to switch screens
    // mid-registration before photos and profile are created.
    await SecureStore.setItemAsync('maidconnect_token', res.data.token);
    return res.data;
  },

  // Call this after the full registration flow is complete (subscription/payment done)
  completeAuth: async () => {
    const token = await SecureStore.getItemAsync('maidconnect_token');
    if (token) {
      const me = await authAPI.getMe();
      set({ token, user: me.data.user, profile: me.data.profile });
    }
  },

  login: async (email, password) => {
    const res = await authAPI.login({ email, password });
    await SecureStore.setItemAsync('maidconnect_token', res.data.token);
    const me = await authAPI.getMe();
    set({ token: res.data.token, user: res.data.user, profile: me.data.profile });
    return res.data;
  },

  socialLogin: async (data) => {
    const res = await authAPI.socialAuth(data);
    await SecureStore.setItemAsync('maidconnect_token', res.data.token);
    const me = await authAPI.getMe();
    set({ token: res.data.token, user: res.data.user, profile: me.data.profile });
    return res.data;
  },

  setProfile: (profile) => set({ profile }),

  logout: async () => {
    await SecureStore.deleteItemAsync('maidconnect_token');
    set({ token: null, user: null, profile: null });
  },
}));

export default useAuthStore;
