import React, { createContext, useContext, useState, useEffect } from 'react';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { storage } from '@/utils/storage';
import { authService } from '@/services/authService';

export const AuthContext = createContext(null);

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();
const normalizePhone = (value) => String(value || '').replace(/[\s.()-]/g, '').replace(/^\+84/, '0');

const getRegisteredAccounts = () => {
  const savedAccounts = storage.get(STORAGE_KEYS.REGISTERED_ACCOUNTS, []);
  const accounts = Array.isArray(savedAccounts) ? savedAccounts : [];
  const currentUser = storage.get(STORAGE_KEYS.USER_INFO, null);

  if (!currentUser) return accounts;

  const currentEmail = normalizeEmail(currentUser.email);
  const currentPhone = normalizePhone(currentUser.phone);
  const isKnown = accounts.some((account) =>
    (currentEmail && normalizeEmail(account.email) === currentEmail)
    || (currentPhone && normalizePhone(account.phone) === currentPhone)
  );

  if (isKnown) return accounts;

  const nextAccounts = [...accounts, {
    id: currentUser.id,
    email: currentEmail,
    phone: currentPhone,
  }];
  storage.set(STORAGE_KEYS.REGISTERED_ACCOUNTS, nextAccounts);
  return nextAccounts;
};

const rememberRegisteredAccount = (account) => {
  const email = normalizeEmail(account.email);
  const phone = normalizePhone(account.phone);
  const accounts = getRegisteredAccounts();
  const existingIndex = accounts.findIndex((item) =>
    (email && normalizeEmail(item.email) === email)
    || (phone && normalizePhone(item.phone) === phone)
  );
  const nextAccount = { id: account.id, email, phone };
  const nextAccounts = existingIndex >= 0
    ? accounts.map((item, index) => (index === existingIndex ? { ...item, ...nextAccount } : item))
    : [...accounts, nextAccount];

  storage.set(STORAGE_KEYS.REGISTERED_ACCOUNTS, nextAccounts);
};

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
    const email = normalizeEmail(userData.email);
    const phone = normalizePhone(userData.phone);
    const registeredAccounts = getRegisteredAccounts();
    const duplicateEmail = email && registeredAccounts.some((account) => normalizeEmail(account.email) === email);
    const duplicatePhone = phone && registeredAccounts.some((account) => normalizePhone(account.phone) === phone);

    if (duplicateEmail || duplicatePhone) {
      return {
        success: false,
        message: duplicateEmail
          ? 'Email này đã được dùng để đăng ký một tài khoản khác.'
          : 'Số điện thoại này đã được dùng để đăng ký một tài khoản khác.',
      };
    }

    setLoading(true);
    try {
      const res = await authService.register(userData);
      const authToken = res?.token || res?.access_token || 'mock_jwt_token_register';
      const authUser = res?.user ? {
        ...res.user,
        phone: res.user.phone || userData.phone,
        isPhonePublic: res.user.isPhonePublic ?? Boolean(userData.isPhonePublic),
        foundedYear: res.user.foundedYear || userData.foundedYear || '',
      } : {
        id: `usr_${Date.now()}`,
        name: userData.fullName || 'Người dùng mới',
        email: userData.email,
        phone: userData.phone,
        role: userData.role || 'student',
        dob: userData.dob || '',
        qualifications: userData.qualifications || '',
        experience: userData.experience || '',
        bio: userData.bio || '',
        detailedProfile: userData.detailedProfile || '',
        profilePortfolioImages: userData.profilePortfolioImages || [],
        foundedYear: userData.foundedYear || '',
        isPhonePublic: Boolean(userData.isPhonePublic),
      };
      storage.set(STORAGE_KEYS.ACCESS_TOKEN, authToken);
      storage.set(STORAGE_KEYS.USER_INFO, authUser);
      rememberRegisteredAccount(authUser);
      setToken(authToken);
      setUser(authUser);
      return { success: true, user: authUser, data: res };
    } catch (error) {
      if (error?.response) {
        return {
          success: false,
          message: error.response?.data?.message || 'Không thể đăng ký tài khoản. Vui lòng thử lại.',
        };
      }

      // Mock skeleton fallback khi backend chưa kết nối
      const mockToken = 'mock_jwt_token_register';
      const mockUser = {
        id: 'usr_' + Date.now(),
        name: userData.fullName || 'Người dùng mới',
        email: userData.email,
        phone: userData.phone,
        role: userData.role || 'student',
        dob: userData.dob || '',
        qualifications: userData.qualifications || '',
        experience: userData.experience || '',
        bio: userData.bio || '',
        detailedProfile: userData.detailedProfile || '',
        profilePortfolioImages: userData.profilePortfolioImages || [],
        foundedYear: userData.foundedYear || '',
        isPhonePublic: Boolean(userData.isPhonePublic),
      };
      storage.set(STORAGE_KEYS.ACCESS_TOKEN, mockToken);
      storage.set(STORAGE_KEYS.USER_INFO, mockUser);
      rememberRegisteredAccount(mockUser);
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

  const updateUser = (updates) => {
    let nextUser;
    setUser((current) => {
      nextUser = { ...current, ...updates };
      storage.set(STORAGE_KEYS.USER_INFO, nextUser);
      return nextUser;
    });
    return nextUser;
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token),
    loading,
    login,
    register,
    updateUser,
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
