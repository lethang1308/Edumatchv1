/**
 * Application route constants
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PARTNER_TERMS: '/dieu-khoan-giao-vien-doi-tac',
  CENTER_SUPPORT: '/ho-tro-trung-tam-dao-tao',
  CONTACT: '/lien-he',
  FEED: '/bang-tin',
  MESSAGES: '/tin-nhan',
  CREATE_COURSE: '/khoa-hoc/them-moi',
  COURSE_DETAIL: (courseId = ':courseId') => `/khoa-hoc/${courseId}`,
  TEACHER_PROFILE: (teacherId = ':teacherId') => `/giao-vien/${teacherId}`,
  DASHBOARD: '/dashboard',
  FORBIDDEN: '/403',
  NOT_FOUND: '*',
};
