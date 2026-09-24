import api from './axios';

export const analyticsApi = {
  organizer: () => api.get('/analytics/organizer').then((r) => r.data),
  venueOwner: () => api.get('/analytics/venue-owner').then((r) => r.data),
  sponsor: () => api.get('/analytics/sponsor').then((r) => r.data),
  admin: () => api.get('/analytics/admin').then((r) => r.data),
};
