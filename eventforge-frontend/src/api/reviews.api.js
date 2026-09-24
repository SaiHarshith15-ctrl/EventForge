import api from './axios';

export const reviewsApi = {
  forEvent: (eventId) => api.get(`/reviews/event/${eventId}`).then((r) => r.data),
  remove: (id) => api.delete(`/reviews/${id}`).then((r) => r.data),
};
