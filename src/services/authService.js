import api from './api';
import { sharedGet } from './sharedGet';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { storage } from '@/utils/storage';

export function normalizeAuthUser(user) {
  const profile = user.student_profile || user.teacher_profile || user.center || {};
  return {
    ...user,
    name: user.center?.name || user.name,
    dob: profile.date_of_birth?.slice(0, 10) || user.dob || '',
    bio: profile.bio ?? user.bio ?? '',
    avatar: user.avatar_url || user.avatar || '',
    qualifications: user.teacher_profile?.headline || user.qualifications || '',
    experience: user.teacher_profile ? `${user.teacher_profile.experience_years ?? 0} năm kinh nghiệm` : user.experience || '',
    isPhonePublic: user.teacher_profile?.show_phone ?? user.isPhonePublic ?? false,
    foundedYear: user.center?.founded_year ? String(user.center.founded_year) : user.foundedYear || '',
    verificationStatus: profile.verification_status || 'unverified',
    verifiedAt: profile.verified_at || null,
    licenseVerificationStatus: user.center?.verification_status || '',
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

  sendRegistrationOtp(payload) {
    return api.post('/auth/register/send-otp', payload);
  },

  async getProfile() {
    const response = await sharedGet('/auth/me');
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

  forgotPassword(identifier) {
    return api.post('/auth/forgot-password', { identifier });
  },

  resetPassword(payload) {
    return api.post('/auth/reset-password', payload);
  },

  changePassword(payload) {
    return api.post('/auth/change-password', payload);
  },
};

export default authService;
