import { createContext, useContext, useState, useEffect } from 'react';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { storage } from '@/utils/storage';
import { authService } from '@/services/authService';

export const AuthContext = createContext(null);

const authFailure = (error, fallback) => ({
  success: false,
  message: error.response?.data?.message || (error.request ? 'Không thể kết nối đến máy chủ. Vui lòng thử lại.' : error.message) || fallback,
  errors: error.response?.data?.errors || {},
  status: error.response?.status,
});

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const clearSession = () => {
      storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
      storage.remove(STORAGE_KEYS.USER_INFO);
      if (active) {
        setToken(null);
        setUser(null);
      }
    };
    const initAuth = async () => {
      const savedToken = storage.get(STORAGE_KEYS.ACCESS_TOKEN);
      if (!savedToken) {
        clearSession();
        setLoading(false);
        return;
      }
      try {
        const response = await authService.getProfile();
        // Ignore a late response if another action has replaced the session.
        if (active && storage.get(STORAGE_KEYS.ACCESS_TOKEN) === savedToken) {
          setToken(savedToken);
          setUser(response.user);
          storage.set(STORAGE_KEYS.USER_INFO, response.user);
        }
      } catch {
        if (active && storage.get(STORAGE_KEYS.ACCESS_TOKEN) === savedToken) clearSession();
      } finally {
        if (active) setLoading(false);
      }
    };
    window.addEventListener('auth:expired', clearSession);
    initAuth();
    return () => {
      active = false;
      window.removeEventListener('auth:expired', clearSession);
    };
  }, []);

  const authenticate = async (method, data) => {
    setLoading(true);
    try {
      const response = await authService[method](data);
      setToken(response.token);
      setUser(response.user);
      return { success: true, user: response.user, data: response };
    } catch (error) {
      return authFailure(error, method === 'login' ? 'Đăng nhập không thành công.' : 'Không thể đăng ký tài khoản.');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      return { success: true };
    } catch (error) {
      return authFailure(error, 'Phiên trên thiết bị đã được xóa; chưa thể kết nối để thu hồi token trên máy chủ.');
    } finally {
      setToken(null);
      setUser(null);
    }
  };

  const updateUser = (updates) => {
    setUser((current) => {
      if (!current) return null;
      const nextUser = { ...current, ...updates };
      storage.set(STORAGE_KEYS.USER_INFO, nextUser);
      return nextUser;
    });
  };

  return (
    <AuthContext.Provider value={{
      user, token, isAuthenticated: Boolean(token && user), loading,
      login: (data) => authenticate('login', data),
      register: (data) => authenticate('register', data),
      logout, updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export default AuthContext;
