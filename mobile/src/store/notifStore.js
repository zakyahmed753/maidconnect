import { create } from 'zustand';

const useNotifStore = create((set) => ({
  unreadCount: 0,
  setCount: (n) => set({ unreadCount: Math.max(0, n) }),
  decrement: () => set((s) => ({ unreadCount: Math.max(0, s.unreadCount - 1) })),
  reset: () => set({ unreadCount: 0 }),
}));

export default useNotifStore;
