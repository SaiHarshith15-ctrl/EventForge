import api from './axios';

export const aiApi = {
  chat: (message, history) => api.post('/ai/chat', { message, history }).then((r) => r.data),
};
