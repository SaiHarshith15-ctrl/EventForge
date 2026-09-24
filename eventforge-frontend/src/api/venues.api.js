import api from './axios';

export const venuesApi = {
  list: (params) => api.get('/venues', { params }).then((r) => r.data),
  get: (id) => api.get(`/venues/${id}`).then((r) => r.data),
  create: (payload) => api.post('/venues', payload).then((r) => r.data),
  update: (id, payload) => api.put(`/venues/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/venues/${id}`).then((r) => r.data),
};

export const venueRequestsApi = {
  create: (payload) => api.post('/venue-requests', payload).then((r) => r.data),
  list: () => api.get('/venue-requests').then((r) => r.data),
  respond: (id, payload) => api.put(`/venue-requests/${id}/respond`, payload).then((r) => r.data),
};
