import api from './api';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { storage } from '@/utils/storage';

export function normalizeAuthUser(user) {
  return {
    ...user,
    dob: user.student_profile?.date_of_birth?.slice(0, 10) || user.dob || '',
  };
}

function saveSession(response) {
  const token = response?.token || response?.access_token;
  if (!token || !response?.user?.id) {
    throw new Error('Phản hồi xác thực không hợp lệ. Vui lòng thử lại.');
  }
  const user = normalizeAuthUser(response.user);
  storage.set(STORAGE_KEYS.ACCESS_TOKEN, token);
  storage.set(STORAGE_KEYS.USER_INFO, user);
  return { ...response, token, user };
}

export const authService = {
  async login(credentials) {
    return saveSession(await api.post('/auth/login', credentials));
  },

  async register(data) {
    return saveSession(await api.post('/auth/register', data));
  },

  async getProfile() {
    const response = await api.get('/auth/me');
    if (!response?.user?.id) {
      throw new Error('Không thể xác thực phiên đăng nhập.');
    }
    return { ...response, user: normalizeAuthUser(response.user) };
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
      storage.remove(STORAGE_KEYS.USER_INFO);
    }
  },
};

export default authService;
