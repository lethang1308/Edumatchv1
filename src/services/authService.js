import api from './api';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { storage } from '@/utils/storage';

export const authService = {
  /**
   * Đăng nhập người dùng
   * @param {{ email: string, password: string }} credentials
   */
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      if (response?.token) {
        storage.set(STORAGE_KEYS.ACCESS_TOKEN, response.token);
      }
      return response;
    } catch {
      // Mock skeleton fallback khi backend chưa chạy
      const mockToken = 'mock_jwt_token_sample';
      const savedUser = storage.get(STORAGE_KEYS.USER_INFO, null);
      const mockUser = savedUser || {
        id: 'usr_1',
        name: 'Người dùng EduMatch',
        email: credentials.email || 'admin@example.com',
        role: 'student',
      };
      storage.set(STORAGE_KEYS.ACCESS_TOKEN, mockToken);
      storage.set(STORAGE_KEYS.USER_INFO, mockUser);
      return { token: mockToken, user: mockUser };
    }
  },

  /**
   * Đăng ký người dùng mới
   */
  async register(data) {
    return api.post('/auth/register', data);
  },

  /**
   * Lấy thông tin tài khoản hiện tại
   */
  async getProfile() {
    try {
      return await api.get('/auth/me');
    } catch {
      return storage.get(STORAGE_KEYS.USER_INFO, {
        id: 'usr_1',
        name: 'Demo Admin',
        email: 'admin@example.com',
        role: 'admin',
      });
    }
  },

  /**
   * Đăng xuất
   */
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
