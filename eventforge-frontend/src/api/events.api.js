import api from './axios';

export const eventsApi = {
  list: (params) => api.get('/events', { params }).then((r) => r.data),
  get: (id) => api.get(`/events/${id}`).then((r) => r.data),
  create: (payload) => api.post('/events', payload).then((r) => r.data),
  update: (id, payload) => api.put(`/events/${id}`, payload).then((r) => r.data),
  uploadCover: (id, formData) => api.put(`/events/${id}/cover`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  readiness: (id) => api.get(`/events/${id}/readiness`).then((r) => r.data),
  publish: (id) => api.put(`/events/${id}/publish`).then((r) => r.data),
  unpublish: (id) => api.put(`/events/${id}/unpublish`).then((r) => r.data),
  cancel: (id) => api.put(`/events/${id}/cancel`).then((r) => r.data),
  remove: (id) => api.delete(`/events/${id}`).then((r) => r.data),
  addSchedule: (id, payload) => api.post(`/events/${id}/schedule`, payload).then((r) => r.data),
  removeSchedule: (id, itemId) => api.delete(`/events/${id}/schedule/${itemId}`).then((r) => r.data),
  addReview: (id, payload) => api.post(`/events/${id}/reviews`, payload).then((r) => r.data),
};
