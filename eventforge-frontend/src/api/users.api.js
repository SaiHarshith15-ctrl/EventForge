import api from './axios';

export const usersApi = {
  updateProfile: (payload) => api.put('/users/profile', payload).then((r) => r.data),
  updateAvatar: (formData) => api.put('/users/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  savedEvents: () => api.get('/users/saved-events').then((r) => r.data),
  toggleSaved: (eventId) => api.put(`/users/saved-events/${eventId}`).then((r) => r.data),
  list: (params) => api.get('/users', { params }).then((r) => r.data),
  get: (id) => api.get(`/users/${id}`).then((r) => r.data),
  toggleSuspend: (id) => api.put(`/users/${id}/suspend`).then((r) => r.data),
  changeRole: (id, role) => api.put(`/users/${id}/role`, { role }).then((r) => r.data),
  remove: (id) => api.delete(`/users/${id}`).then((r) => r.data),
};
