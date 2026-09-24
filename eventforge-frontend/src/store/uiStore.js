import { create } from 'zustand';

export const useUiStore = create((set) => ({
  bookingEvent: null,
  openBooking: (event) => set({ bookingEvent: event }),
  closeBooking: () => set({ bookingEvent: null }),

  aiOpen: false,
  toggleAi: () => set((s) => ({ aiOpen: !s.aiOpen })),
  openAi: () => set({ aiOpen: true }),
  closeAi: () => set({ aiOpen: false }),

  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  closeSidebar: () => set({ sidebarOpen: false }),
}));
