import { STORAGE_KEYS } from '@/constants/storageKeys';
import { storage } from '@/utils/storage';

const sampleCourses = [
  {
    id: 'course-english-foundation',
    title: 'Tiếng Anh giao tiếp nền tảng',
    description: 'Xây nền phản xạ nghe nói với lộ trình rõ ràng và bài tập cá nhân hoá.',
    price: 1800000,
    paymentType: 'full-course',
    sessions: 12,
    duration: 90,
    schedule: 'Thứ 3 và Thứ 6, 19:00 – 20:30',
    learningMode: 'online',
    enrollmentStatus: 'open',
    createdAt: '2026-10-01T09:00:00.000Z',
    teacher: {
      id: 'teacher-mai-anh',
      name: 'Mai Anh',
      dob: '1992-05-16',
      qualifications: 'Cử nhân Ngôn ngữ Anh, IELTS 8.0',
      experience: '7 năm giảng dạy tiếng Anh giao tiếp và IELTS',
      heartCount: 486,
      bio: 'Tôi ưu tiên môi trường học thân thiện, giúp học viên tự tin sử dụng tiếng Anh trong đời sống.',
    },
  },
];

const read = (key, fallback) => storage.get(key, fallback);
const write = (key, value) => storage.set(key, value);

export const getCourses = () => {
  const saved = read(STORAGE_KEYS.COURSES, []);
  const currentUser = read(STORAGE_KEYS.USER_INFO, null);
  const hydratedSavedCourses = saved.map((course) =>
    course.teacher?.id === currentUser?.id
      ? {
          ...course,
          teacher: {
            ...course.teacher,
            ...(currentUser.avatar ? { avatar: currentUser.avatar } : {}),
            ...(currentUser.phone ? { phone: currentUser.phone } : {}),
            ...(typeof currentUser.isPhonePublic === 'boolean'
              ? { isPhonePublic: currentUser.isPhonePublic }
              : {}),
          },
        }
      : course
  );
  return [...hydratedSavedCourses, ...sampleCourses];
};

export const getCourse = (id) => getCourses().find((course) => course.id === id);

export const saveCourse = (course) => {
  const saved = read(STORAGE_KEYS.COURSES, []);
  write(STORAGE_KEYS.COURSES, [course, ...saved]);
  return course;
};

export const updateCourse = (courseId, updates) => {
  const saved = read(STORAGE_KEYS.COURSES, []);
  const index = saved.findIndex((course) => course.id === courseId);
  if (index === -1) return getCourse(courseId);

  const next = [...saved];
  next[index] = { ...next[index], ...updates };
  write(STORAGE_KEYS.COURSES, next);
  return next[index];
};

export const syncTeacherCourseProfile = (teacherId, profileUpdates) => {
  const saved = read(STORAGE_KEYS.COURSES, []);
  const next = saved.map((course) =>
    course.teacher?.id === teacherId
      ? { ...course, teacher: { ...course.teacher, ...profileUpdates } }
      : course
  );
  write(STORAGE_KEYS.COURSES, next);
  return next;
};

export const getCourseReviews = (courseId) =>
  read(STORAGE_KEYS.COURSE_REVIEWS, []).filter((review) => review.courseId === courseId);

export const addCourseReview = (review) => {
  const saved = read(STORAGE_KEYS.COURSE_REVIEWS, []);
  write(STORAGE_KEYS.COURSE_REVIEWS, [review, ...saved]);
};

export const getCourseRating = (courseId) => {
  const reviews = getCourseReviews(courseId);
  const total = reviews.length;
  const average = total
    ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / total
    : 0;
  return { total, average };
};

export const getPosts = (authorId) => {
  const posts = read(STORAGE_KEYS.TEACHER_POSTS, []);
  return authorId ? posts.filter((post) => post.teacherId === authorId || post.authorId === authorId) : posts;
};

export const savePost = (post) => {
  const saved = read(STORAGE_KEYS.TEACHER_POSTS, []);
  write(STORAGE_KEYS.TEACHER_POSTS, [post, ...saved]);
};

export const updatePost = (postId, updater) => {
  const next = read(STORAGE_KEYS.TEACHER_POSTS, []).map((post) =>
    post.id === postId ? updater(post) : post
  );
  write(STORAGE_KEYS.TEACHER_POSTS, next);
  return next;
};

const notifyNotificationChange = () => {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('edumatch:notifications-updated'));
};

export const getNotifications = (recipientId) =>
  read(STORAGE_KEYS.NOTIFICATIONS, [])
    .filter((notification) => notification.recipientId === recipientId)
    .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt));

export const createNotification = (notification) => {
  if (!notification.recipientId) return null;
  const nextNotification = {
    id: `notification-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    isRead: false,
    createdAt: new Date().toISOString(),
    ...notification,
  };
  const saved = read(STORAGE_KEYS.NOTIFICATIONS, []);
  write(STORAGE_KEYS.NOTIFICATIONS, [nextNotification, ...saved]);
  notifyNotificationChange();
  return nextNotification;
};

export const markNotificationRead = (notificationId) => {
  const next = read(STORAGE_KEYS.NOTIFICATIONS, []).map((notification) =>
    notification.id === notificationId ? { ...notification, isRead: true } : notification
  );
  write(STORAGE_KEYS.NOTIFICATIONS, next);
  notifyNotificationChange();
  return next;
};

export const markAllNotificationsRead = (recipientId) => {
  const next = read(STORAGE_KEYS.NOTIFICATIONS, []).map((notification) =>
    notification.recipientId === recipientId ? { ...notification, isRead: true } : notification
  );
  write(STORAGE_KEYS.NOTIFICATIONS, next);
  notifyNotificationChange();
  return next;
};

export const getProviderAffinity = (userId) => {
  if (!userId) return {};
  return read(STORAGE_KEYS.FEED_AFFINITY, [])
    .filter((record) => record.userId === userId)
    .reduce((scores, record) => ({ ...scores, [record.providerId]: (scores[record.providerId] || 0) + Number(record.score || 0) }), {});
};

export const trackProviderAffinity = (userId, providerId, action, score = 1) => {
  if (!userId || !providerId || userId === providerId) return;
  const saved = read(STORAGE_KEYS.FEED_AFFINITY, []);
  const existingIndex = saved.findIndex((record) => record.userId === userId && record.providerId === providerId && record.action === action);
  const entry = { userId, providerId, action, score, updatedAt: new Date().toISOString() };
  const next = existingIndex === -1 ? [entry, ...saved] : saved.map((record, index) => index === existingIndex ? entry : record);
  write(STORAGE_KEYS.FEED_AFFINITY, next);
};

const trustRecords = () => read(STORAGE_KEYS.PROVIDER_TRUSTS, []);

export const getProviderTrustCount = (providerId, baseCount = 0) =>
  Number(baseCount || 0) + trustRecords().filter((record) => record.providerId === providerId).length;

export const hasProviderTrust = (userId, providerId) =>
  Boolean(userId && trustRecords().some((record) => record.userId === userId && record.providerId === providerId && record.source === 'profile'));

export const toggleProviderTrust = (userId, providerId) => {
  if (!userId || !providerId || userId === providerId) return false;
  const saved = trustRecords();
  const index = saved.findIndex((record) => record.userId === userId && record.providerId === providerId && record.source === 'profile');
  const next = index === -1
    ? [{ id: `trust-${Date.now()}`, userId, providerId, source: 'profile', createdAt: new Date().toISOString() }, ...saved]
    : saved.filter((_, recordIndex) => recordIndex !== index);
  write(STORAGE_KEYS.PROVIDER_TRUSTS, next);
  return index === -1;
};

export const addCourseRatingTrust = (userId, providerId, courseId) => {
  if (!userId || !providerId || !courseId || userId === providerId) return false;
  const source = `rating:${courseId}`;
  const saved = trustRecords();
  if (saved.some((record) => record.userId === userId && record.providerId === providerId && record.source === source)) return false;
  write(STORAGE_KEYS.PROVIDER_TRUSTS, [{ id: `trust-${Date.now()}`, userId, providerId, source, createdAt: new Date().toISOString() }, ...saved]);
  return true;
};

export const saveConversation = (conversation) => {
  const saved = read(STORAGE_KEYS.CONVERSATIONS, []);
  write(STORAGE_KEYS.CONVERSATIONS, [conversation, ...saved]);
};

export const createConversationId = (prefix = 'message') =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const getConversationsForUser = (userId) =>
  read(STORAGE_KEYS.CONVERSATIONS, []).filter(
    (message) => message.studentId === userId || message.teacherId === userId
  );

export const getAge = (dob) => {
  if (!dob) return '—';
  const date = new Date(dob);
  if (Number.isNaN(date.getTime())) return '—';
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) age -= 1;
  return age;
};

export const paymentLabel = (type) => ({
  'full-course': 'Trọn khóa',
  monthly: 'Theo tháng',
  session: 'Theo buổi',
}[type] || 'Linh hoạt');

export const modeLabel = (course) => {
  if (course.learningMode === 'online') return 'Trực tuyến';
  if (course.learningMode === 'recorded') return 'Video quay sẵn';
  return course.inPersonType === 'home' ? 'Dạy tại nhà' : 'Dạy tại lớp';
};

export const enrollmentLabel = (course) =>
  course.enrollmentStatus === 'closed' ? 'Đã đóng lớp' : 'Mở lớp';
