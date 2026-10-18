import api from './api';
import { sharedGet } from './sharedGet';
import { normalizeAuthUser } from './authService';

const withUser = (response) => ({ ...response, user: normalizeAuthUser(response.user) });

export const profileService = {
  async get() {
    return withUser(await sharedGet('/profile'));
  },
  async update(data) {
    return withUser(await api.put('/profile', data));
  },
  async uploadAvatar(file) {
    const data = new FormData();
    data.append('avatar', file);
    return withUser(
      await api.post('/profile/avatar', data, {
        // Let the browser supply the multipart boundary instead of sending JSON.
        headers: { 'Content-Type': undefined },
      })
    );
  },
  async areas(params) {
    const response = await sharedGet('/administrative-areas', params);
    return response.data;
  },
};
