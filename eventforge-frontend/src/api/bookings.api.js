import api from './axios';

export const bookingsApi = {
  createOrder: (payload) => api.post('/bookings/create-order', payload).then((r) => r.data),
  verifyPayment: (payload) => api.post('/bookings/verify-payment', payload).then((r) => r.data),
  simulatePayment: (payload) => api.post('/bookings/simulate-payment', payload).then((r) => r.data),
  myBookings: () => api.get('/bookings/my').then((r) => r.data),
  get: (id) => api.get(`/bookings/${id}`).then((r) => r.data),
  downloadPdfUrl: (id) => `${api.defaults.baseURL}/bookings/${id}/pdf`,
  cancel: (id) => api.put(`/bookings/${id}/cancel`).then((r) => r.data),
  eventBookings: (eventId) => api.get(`/bookings/event/${eventId}`).then((r) => r.data),
};
