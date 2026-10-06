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
      bio: 'Tôi ưu tiên môi trường học thân thiện, giúp học viên tự tin sử dụng tiếng Anh trong đời sống.',
    },
  },
];

const read = (key, fallback) => storage.get(key, fallback);
const write = (key, value) => storage.set(key, value);

export const getCourses = () => {
  const saved = read(STORAGE_KEYS.COURSES, []);
  return [...saved, ...sampleCourses];
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

export const getPosts = (teacherId) =>
  read(STORAGE_KEYS.TEACHER_POSTS, []).filter((post) => post.teacherId === teacherId);

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
