import api from './axios';

export const checkinsApi = {
  scan: (payload) => api.post('/checkins/scan', payload).then((r) => r.data),
  eventCheckIns: (eventId) => api.get(`/checkins/event/${eventId}`).then((r) => r.data),
};
