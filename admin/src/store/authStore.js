import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  timeout: 15000,
});

const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      admin: null,
      login: async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        if (res.data.user.role !== 'admin') throw new Error('Admin access only');
        set({ token: res.data.token, admin: res.data.user });
        return res.data;
      },
      logout: () => {
        set({ token: null, admin: null });
      }
    }),
    { name: 'maidconnect-admin-auth' }
  )
);

export default useAuthStore;