import api from './axios';

export const sponsorsApi = {
  list: (params) => api.get('/sponsors', { params }).then((r) => r.data),
  get: (id) => api.get(`/sponsors/${id}`).then((r) => r.data),
  create: (payload) => api.post('/sponsors', payload).then((r) => r.data),
  updateMe: (payload) => api.put('/sponsors/me', payload).then((r) => r.data),
};

export const sponsorRequestsApi = {
  create: (payload) => api.post('/sponsor-requests', payload).then((r) => r.data),
  list: () => api.get('/sponsor-requests').then((r) => r.data),
  respond: (id, status) => api.put(`/sponsor-requests/${id}/respond`, { status }).then((r) => r.data),
};
