import { create } from 'zustand';
import { authApi } from '../api/auth.api';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('ef_token') || null,
  isLoading: true,
  isAuthenticated: false,

  init: async () => {
    const token = localStorage.getItem('ef_token');
    if (!token) return set({ isLoading: false });
    try {
      const res = await authApi.me();
      set({ user: res.data, token, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem('ef_token');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email, password) => {
    const res = await authApi.login({ email, password });
    localStorage.setItem('ef_token', res.token);
    set({ user: res.user, token: res.token, isAuthenticated: true });
    return res.user;
  },

  register: async (payload) => {
    const res = await authApi.register(payload);
    localStorage.setItem('ef_token', res.token);
    set({ user: res.user, token: res.token, isAuthenticated: true });
    return res.user;
  },

  logout: async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    localStorage.removeItem('ef_token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateUser: (patch) => set({ user: { ...get().user, ...patch } }),
}));
