import api from './api';
import { sharedGet } from './sharedGet';

export const accountNotificationService = {
  list: async () => (await sharedGet('/notifications')).data,
  read: (id) => api.post(`/notifications/${id}/read`),
  readAll: () => api.post('/notifications/read-all'),
};
