import api from './axios';

export const speakersApi = {
  list: (params) => api.get('/speakers', { params }).then((r) => r.data),
  get: (id) => api.get(`/speakers/${id}`).then((r) => r.data),
  create: (payload) => api.post('/speakers', payload).then((r) => r.data),
  updateMe: (payload) => api.put('/speakers/me', payload).then((r) => r.data),
  updateAvailability: (availability) => api.put('/speakers/me/availability', { availability }).then((r) => r.data),
};

export const speakerInvitesApi = {
  create: (payload) => api.post('/speaker-invites', payload).then((r) => r.data),
  list: () => api.get('/speaker-invites').then((r) => r.data),
  respond: (id, status) => api.put(`/speaker-invites/${id}/respond`, { status }).then((r) => r.data),
};
