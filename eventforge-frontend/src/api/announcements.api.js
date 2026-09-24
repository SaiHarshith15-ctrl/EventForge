import api from './axios';

export const announcementsApi = {
  create: (payload) => api.post('/announcements', payload).then((r) => r.data),
  forEvent: (eventId) => api.get(`/announcements/event/${eventId}`).then((r) => r.data),
};
