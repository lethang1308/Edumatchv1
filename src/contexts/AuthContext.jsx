import React, { createContext, useContext, useState, useEffect } from 'react';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { storage } from '@/utils/storage';
import { authService } from '@/services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => storage.get(STORAGE_KEYS.ACCESS_TOKEN, null));
  const [user, setUser] = useState(() => storage.get(STORAGE_KEYS.USER_INFO, null));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = storage.get(STORAGE_KEYS.ACCESS_TOKEN);
      const savedUser = storage.get(STORAGE_KEYS.USER_INFO);

      if (savedToken) {
        setToken(savedToken);
        setUser(
          savedUser || {
            id: 'usr_1',
            name: 'Demo Admin',
            email: 'admin@example.com',
            role: 'admin',
          }
        );
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const res = await authService.login(credentials);
      const authToken = res?.token || 'mock_jwt_token_sample';
      const authUser = res?.user || {
        id: 'usr_1',
        name: 'Demo Admin',
        email: credentials.email || 'admin@example.com',
        role: 'admin',
      };

      setToken(authToken);
      setUser(authUser);
      storage.set(STORAGE_KEYS.ACCESS_TOKEN, authToken);
      storage.set(STORAGE_KEYS.USER_INFO, authUser);

      return { success: true, user: authUser };
    } catch (error) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Đăng nhập không thành công!',
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await authService.register(userData);
      return { success: true, data: res };
    } catch {
      // Mock skeleton fallback khi backend chưa kết nối
      const mockToken = 'mock_jwt_token_register';
      const mockUser = {
        id: 'usr_' + Date.now(),
        name: userData.fullName || 'Người dùng mới',
        email: userData.email,
        phone: userData.phone,
        role: userData.role || 'student',
      };
      storage.set(STORAGE_KEYS.ACCESS_TOKEN, mockToken);
      storage.set(STORAGE_KEYS.USER_INFO, mockUser);
      setToken(mockToken);
      setUser(mockUser);
      return { success: true, user: mockUser };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setToken(null);
      setUser(null);
      storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
      storage.remove(STORAGE_KEYS.USER_INFO);
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token),
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
