import { create } from 'zustand';
import { notificationsApi } from '../api/notifications.api';

export const useNotificationStore = create((set, get) => ({
  items: [],
  unreadCount: 0,

  fetch: async () => {
    try {
      const res = await notificationsApi.list();
      set({ items: res.data, unreadCount: res.unreadCount });
    } catch { /* ignore */ }
  },

  push: (notification) => {
    set({ items: [notification, ...get().items], unreadCount: get().unreadCount + 1 });
  },

  markRead: async (id) => {
    set({
      items: get().items.map((n) => (n._id === id ? { ...n, read: true } : n)),
      unreadCount: Math.max(0, get().unreadCount - 1),
    });
    try { await notificationsApi.markRead(id); } catch { /* ignore */ }
  },

  markAllRead: async () => {
    set({ items: get().items.map((n) => ({ ...n, read: true })), unreadCount: 0 });
    try { await notificationsApi.markAllRead(); } catch { /* ignore */ }
  },
}));
