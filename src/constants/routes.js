/**
 * Application route constants
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  MESSAGES: '/tin-nhan',
  CREATE_COURSE: '/khoa-hoc/them-moi',
  COURSE_DETAIL: (courseId = ':courseId') => `/khoa-hoc/${courseId}`,
  TEACHER_PROFILE: (teacherId = ':teacherId') => `/giao-vien/${teacherId}`,
  DASHBOARD: '/dashboard',
  FORBIDDEN: '/403',
  NOT_FOUND: '*',
};
