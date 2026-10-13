import { STORAGE_KEYS } from '@/constants/storageKeys';
import { storage } from '@/utils/storage';
import tutoringHero from '@/assets/tutoring-hero.webp';
import studyTogether from '@/assets/register-student.webp';
import teacherCommunity from '@/assets/vietnamese-teachers-avatar-strip.png';

const centerProfiles = {
  oldSchool: {
    id: 'center-old-school',
    name: 'Trung tâm The Old School',
    role: 'center',
    foundedYear: '2017',
    licenseVerificationStatus: 'verified',
    heartCount: 128,
    bio: 'Trung tâm ngoại ngữ với chương trình cá nhân hóa và đội ngũ giáo viên giàu kinh nghiệm.',
    detailedProfile: `The Old School xây dựng lộ trình tiếng Anh theo năng lực đầu vào, mục tiêu đầu ra và nhịp học của từng học viên. Mỗi lớp duy trì quy mô nhỏ để giáo viên có thể theo dõi tiến độ, phản hồi bài tập và điều chỉnh nội dung phù hợp.\n\nĐội ngũ chuyên môn của trung tâm tập trung vào tiếng Anh giao tiếp, IELTS nền tảng và IELTS Writing. Học viên được kiểm tra đầu vào, nhận kế hoạch học rõ ràng và tham gia các buổi thực hành định kỳ. Không gian học được thiết kế yên tĩnh, an toàn và thân thiện để người học tự tin đặt câu hỏi và tiến bộ từng tuần.\n\nTrung tâm cam kết công khai thông tin khóa học, học phí và lộ trình trước khi đăng ký. Hồ sơ pháp lý đã được EduMatch xác thực.`,
    profilePortfolioImages: [tutoringHero, studyTogether],
  },
  educare: {
    id: 'center-educare',
    name: 'Trung tâm EduCare',
    role: 'center',
    foundedYear: '2021',
    licenseVerificationStatus: 'pending',
    heartCount: 18,
    bio: 'Đơn vị đào tạo kỹ năng thực hành dành cho học sinh, sinh viên và người đi làm.',
    detailedProfile: `EduCare phát triển các chương trình kỹ năng thực hành dành cho học sinh, sinh viên và người đi làm. Nội dung học tập được thiết kế theo tình huống thực tế, kết hợp hướng dẫn chuyên môn, thực hành nhóm và phản hồi cá nhân.\n\nCác lớp nổi bật gồm thuyết trình, tư duy làm việc và ứng dụng Excel trong công việc. Trước mỗi khóa, học viên được chia sẻ mục tiêu, thời lượng và học phí để chủ động lựa chọn. Sau khóa học, EduCare gửi nhận xét tiến bộ và gợi ý lộ trình tiếp theo.\n\nHồ sơ giấy phép của trung tâm đã được gửi đến EduMatch và đang trong quá trình xét duyệt.`,
    profilePortfolioImages: [studyTogether, teacherCommunity],
  },
  melody: {
    id: 'center-melody-studio',
    name: 'Melody Studio',
    role: 'center',
    foundedYear: '2023',
    heartCount: 2,
    bio: 'Không gian học âm nhạc gần gũi dành cho trẻ em và người lớn.',
  },
  horizon: {
    id: 'center-horizon-learning',
    name: 'Horizon Learning Hub',
    role: 'center',
    foundedYear: '2019',
    licenseVerificationStatus: 'verified',
    heartCount: 64,
    bio: 'Trung tâm tiếng Anh ứng dụng với lớp học nhỏ, lộ trình rõ ràng và phản hồi sát sao.',
    detailedProfile: `Horizon Learning Hub đồng hành cùng học viên từ tiếng Anh nền tảng đến TOEIC và giao tiếp chuyên nghiệp. Trung tâm xây dựng lớp học nhỏ, kiểm tra đầu vào trước khi xếp lớp và công khai kế hoạch học, học phí cùng mục tiêu đầu ra.\n\nĐội ngũ giáo viên có kinh nghiệm luyện thi và đào tạo tiếng Anh cho người đi làm. Mỗi học viên có báo cáo tiến độ theo từng chặng để chủ động điều chỉnh mục tiêu học tập.\n\nHồ sơ pháp lý của trung tâm đã được EduMatch xác thực.`,
    profilePortfolioImages: [tutoringHero, teacherCommunity],
  },
  brightPath: {
    id: 'center-bright-path',
    name: 'Bright Path Academy',
    role: 'center',
    foundedYear: '2025',
    heartCount: 1,
    bio: 'Không gian đào tạo kỹ năng giao tiếp và thuyết trình dành cho sinh viên, người đi làm.',
  },
};

const teacherProfiles = {
  linhAn: {
    id: 'teacher-linh-an',
    name: 'Cô Lê Linh An',
    role: 'teacher',
    dob: '1991-08-12',
    qualifications: 'Thạc sĩ Giảng dạy tiếng Anh, IELTS 8.0',
    experience: '9 năm giảng dạy tiếng Anh giao tiếp và IELTS',
    heartCount: 247,
    isPhonePublic: true,
    phone: '0901234567',
    bio: 'Tôi giúp người học xây phản xạ tiếng Anh tự nhiên bằng lộ trình vừa sức và nhiều thực hành.',
    detailedProfile: `Tôi tập trung vào tiếng Anh giao tiếp, IELTS nền tảng và kỹ năng thuyết trình bằng tiếng Anh. Mỗi học viên được trao đổi mục tiêu ngay từ đầu để xây dựng nhịp học phù hợp, ưu tiên sử dụng ngôn ngữ trong những tình huống gần gũi.\n\nLớp học kết hợp phản xạ nghe nói, bài tập cá nhân và nhận xét sau từng buổi. Tôi tin rằng sự tiến bộ bền vững bắt đầu từ cảm giác an toàn khi được thử, được sai và được phản hồi rõ ràng.`,
    profilePortfolioImages: [studyTogether, tutoringHero],
  },
  ducHieu: {
    id: 'teacher-duc-hieu',
    name: 'Thầy Nguyễn Đức Hiếu',
    role: 'teacher',
    dob: '1997-03-22',
    qualifications: 'Cử nhân Sư phạm Toán học',
    experience: '3 năm đồng hành cùng học sinh THPT',
    heartCount: 2,
    bio: 'Dạy Toán theo tư duy nền tảng, giúp học viên hiểu bản chất trước khi luyện đề.',
  },
  phuongThao: {
    id: 'teacher-phuong-thao',
    name: 'Cô Phạm Phương Thảo',
    role: 'teacher',
    dob: '1993-11-04',
    qualifications: 'Cử nhân Thiết kế đồ họa, chứng chỉ Adobe Certified Professional',
    experience: '6 năm làm nghề và giảng dạy thiết kế',
    heartCount: 58,
    bio: 'Tôi hướng dẫn thiết kế từ nền tảng thị giác đến quy trình xây dựng một portfolio cá nhân.',
    detailedProfile: `Tôi dạy thiết kế đồ họa cho người mới bắt đầu, tập trung vào tư duy thị giác, bố cục, màu sắc và khả năng kể chuyện bằng hình ảnh. Lộ trình học đi từ bài tập nhỏ đến dự án portfolio cá nhân.\n\nHọc viên được xem phản hồi trực tiếp trên bài làm, nhận định hướng tài nguyên phù hợp và thực hành theo brief gần với môi trường công việc.`,
    profilePortfolioImages: [teacherCommunity, studyTogether],
  },
  minhKhoa: {
    id: 'teacher-minh-khoa',
    name: 'Thầy Trần Minh Khoa',
    role: 'teacher',
    dob: '1990-01-17',
    qualifications: 'Kỹ sư Công nghệ thông tin, chứng chỉ AWS Cloud Practitioner',
    experience: '8 năm phát triển phần mềm và 4 năm hướng dẫn lập trình',
    heartCount: 103,
    bio: 'Học lập trình bằng dự án nhỏ, từng bước hiểu cách biến ý tưởng thành sản phẩm.',
    detailedProfile: `Tôi hướng dẫn Python, JavaScript và kỹ năng xây dựng sản phẩm web cho người mới. Nội dung học luôn gắn với bài tập có đầu ra rõ ràng, giúp học viên hiểu luồng tư duy thay vì chỉ ghi nhớ cú pháp.\n\nHọc viên được theo sát từ bước cài đặt môi trường, chia nhỏ bài toán đến hoàn thiện dự án cá nhân.`,
    profilePortfolioImages: [tutoringHero, teacherCommunity],
  },
};

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
    teacher: { ...teacherProfiles.linhAn },
  },
  {
    id: 'course-old-school-ielts',
    title: 'IELTS nền tảng đến 6.5',
    description: 'Lộ trình tiếng Anh có kiểm tra đầu vào, theo sát tiến độ và luyện kỹ năng theo từng tuần.',
    price: 4200000,
    paymentType: 'full-course',
    sessions: 24,
    duration: 90,
    schedule: 'Thứ 3, Thứ 5 và Chủ nhật',
    learningMode: 'in-person',
    inPersonType: 'classroom',
    location: 'Cầu Giấy, Hà Nội',
    enrollmentStatus: 'open',
    createdAt: '2026-10-06T09:00:00.000Z',
    teacher: { ...centerProfiles.oldSchool },
  },
  {
    id: 'course-educare-skills',
    title: 'Kỹ năng thuyết trình tự tin',
    description: 'Lớp thực hành giúp học viên xây dựng tư duy trình bày, giọng nói và sự tự tin trước đám đông.',
    price: 2600000,
    paymentType: 'full-course',
    sessions: 10,
    duration: 120,
    schedule: 'Thứ 7 hằng tuần',
    learningMode: 'in-person',
    inPersonType: 'classroom',
    location: 'Hải Châu, Đà Nẵng',
    enrollmentStatus: 'open',
    createdAt: '2026-10-05T09:00:00.000Z',
    teacher: { ...centerProfiles.educare },
  },
  {
    id: 'course-melody-piano',
    title: 'Piano cho người mới bắt đầu',
    description: 'Học đọc nhạc và chơi những giai điệu đầu tiên trong lớp quy mô nhỏ, phù hợp người mới.',
    price: 1800000,
    paymentType: 'monthly',
    sessionsPerWeek: 2,
    duration: 60,
    schedule: 'Lịch linh hoạt theo lớp',
    learningMode: 'in-person',
    inPersonType: 'classroom',
    location: 'Quận 3, TP. Hồ Chí Minh',
    enrollmentStatus: 'open',
    createdAt: '2026-10-04T09:00:00.000Z',
    teacher: { ...centerProfiles.melody },
  },
  {
    id: 'course-old-school-ielts-writing',
    title: 'IELTS Writing chuyên sâu 6.5+',
    description: 'Lớp luyện viết theo chủ đề với chữa bài cá nhân và chiến lược triển khai ý rõ ràng.',
    price: 3200000,
    paymentType: 'full-course',
    sessions: 16,
    duration: 120,
    schedule: 'Thứ 2 và Thứ 6, 19:00 – 21:00',
    learningMode: 'online',
    enrollmentStatus: 'open',
    createdAt: '2026-10-07T08:30:00.000Z',
    teacher: { ...centerProfiles.oldSchool },
  },
  {
    id: 'course-educare-excel',
    title: 'Excel thực hành cho công việc',
    description: 'Thực hành công thức, báo cáo và xử lý dữ liệu với các tình huống công việc phổ biến.',
    price: 1950000,
    paymentType: 'full-course',
    sessions: 8,
    duration: 120,
    schedule: 'Chủ nhật hằng tuần',
    learningMode: 'in-person',
    inPersonType: 'classroom',
    location: 'Hải Châu, Đà Nẵng',
    enrollmentStatus: 'open',
    createdAt: '2026-10-07T10:00:00.000Z',
    teacher: { ...centerProfiles.educare },
  },
  {
    id: 'course-melody-guitar',
    title: 'Guitar đệm hát cho người mới',
    description: 'Bắt đầu từ hợp âm cơ bản đến tự tin đệm hát những ca khúc yêu thích.',
    price: 2100000,
    paymentType: 'monthly',
    sessionsPerWeek: 2,
    duration: 75,
    schedule: 'Tối thứ 4 và thứ 7',
    learningMode: 'in-person',
    inPersonType: 'classroom',
    location: 'Quận 3, TP. Hồ Chí Minh',
    enrollmentStatus: 'open',
    createdAt: '2026-10-07T11:00:00.000Z',
    teacher: { ...centerProfiles.melody },
  },
  {
    id: 'course-horizon-toeic',
    title: 'TOEIC nền tảng cho người đi làm',
    description: 'Lộ trình củng cố ngữ pháp, từ vựng và kỹ năng làm bài theo mục tiêu thực tế.',
    price: 3600000,
    paymentType: 'full-course',
    sessions: 18,
    duration: 90,
    schedule: 'Thứ 3 và Thứ 7, 19:00 – 20:30',
    learningMode: 'in-person',
    inPersonType: 'classroom',
    location: 'Thanh Xuân, Hà Nội',
    enrollmentStatus: 'open',
    createdAt: '2026-10-12T09:00:00.000Z',
    teacher: { ...centerProfiles.horizon },
  },
  {
    id: 'course-horizon-speaking',
    title: 'Tiếng Anh giao tiếp công sở',
    description: 'Thực hành các tình huống họp, giới thiệu bản thân và giao tiếp trong công việc.',
    price: 2400000,
    paymentType: 'monthly',
    sessionsPerWeek: 2,
    duration: 90,
    schedule: 'Thứ 2 và Thứ 5, 18:30 – 20:00',
    learningMode: 'online',
    enrollmentStatus: 'open',
    createdAt: '2026-10-11T14:00:00.000Z',
    teacher: { ...centerProfiles.horizon },
  },
  {
    id: 'course-bright-path-speaking',
    title: 'Thuyết trình tự tin từ nền tảng',
    description: 'Lớp thực hành giọng nói, cấu trúc nội dung và kỹ năng trình bày trước đám đông.',
    price: 2200000,
    paymentType: 'full-course',
    sessions: 8,
    duration: 120,
    schedule: 'Sáng Chủ nhật',
    learningMode: 'in-person',
    inPersonType: 'classroom',
    location: 'Bình Thạnh, TP. Hồ Chí Minh',
    enrollmentStatus: 'open',
    createdAt: '2026-10-10T10:00:00.000Z',
    teacher: { ...centerProfiles.brightPath },
  },
  {
    id: 'course-linh-an-speaking',
    title: 'Phản xạ tiếng Anh giao tiếp',
    description: 'Luyện nói theo tình huống đời sống với phản hồi cá nhân sau từng buổi học.',
    price: 2800000,
    paymentType: 'full-course',
    sessions: 12,
    duration: 90,
    schedule: 'Thứ 4 và Chủ nhật, 20:00 – 21:30',
    learningMode: 'online',
    enrollmentStatus: 'open',
    createdAt: '2026-10-13T08:00:00.000Z',
    teacher: { ...teacherProfiles.linhAn },
  },
  {
    id: 'course-duc-hieu-math',
    title: 'Toán nền tảng 10',
    description: 'Củng cố tư duy đại số và hình học cho học sinh cần học chắc từ gốc.',
    price: 1600000,
    paymentType: 'monthly',
    sessionsPerWeek: 2,
    duration: 90,
    schedule: 'Thứ 3 và Thứ 6, 18:00 – 19:30',
    learningMode: 'in-person',
    inPersonType: 'home',
    location: 'Nam Từ Liêm, Hà Nội',
    enrollmentStatus: 'open',
    createdAt: '2026-10-12T13:00:00.000Z',
    teacher: { ...teacherProfiles.ducHieu },
  },
  {
    id: 'course-phuong-thao-design',
    title: 'Thiết kế đồ họa cho người mới',
    description: 'Làm chủ bố cục, màu sắc và hoàn thiện portfolio thiết kế đầu tiên.',
    price: 3000000,
    paymentType: 'full-course',
    sessions: 10,
    duration: 120,
    schedule: 'Tối thứ 3 và thứ 5',
    learningMode: 'online',
    enrollmentStatus: 'open',
    createdAt: '2026-10-09T08:00:00.000Z',
    teacher: { ...teacherProfiles.phuongThao },
  },
  {
    id: 'course-minh-khoa-python',
    title: 'Python qua dự án thực tế',
    description: 'Khởi đầu cùng Python bằng các bài tập nhỏ và một dự án cá nhân hoàn chỉnh.',
    price: 3400000,
    paymentType: 'full-course',
    sessions: 14,
    duration: 120,
    schedule: 'Thứ 2 và Thứ 6, 19:30 – 21:30',
    learningMode: 'online',
    enrollmentStatus: 'open',
    createdAt: '2026-10-08T14:00:00.000Z',
    teacher: { ...teacherProfiles.minhKhoa },
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
            ...(currentUser.foundedYear ? { foundedYear: currentUser.foundedYear } : {}),
            ...(currentUser.licenseVerificationStatus ? { licenseVerificationStatus: currentUser.licenseVerificationStatus } : {}),
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
  write(STORAGE_KEYS.COURSE_REVIEWS, [{ ...review, replies: review.replies || [] }, ...saved]);
};

export const addCourseReviewReply = (reviewId, reply) => {
  const next = read(STORAGE_KEYS.COURSE_REVIEWS, []).map((review) =>
    review.id === reviewId
      ? { ...review, replies: [...(review.replies || []), reply] }
      : review,
  );
  write(STORAGE_KEYS.COURSE_REVIEWS, next);
  return next.find((review) => review.id === reviewId);
};

export const toggleCourseReviewLike = (reviewId, userId, replyId = null) => {
  let updatedReview = null;
  const next = read(STORAGE_KEYS.COURSE_REVIEWS, []).map((review) => {
    if (review.id !== reviewId) return review;
    if (replyId) {
      const replies = (review.replies || []).map((reply) => {
        if (reply.id !== replyId) return reply;
        const likes = reply.likes || [];
        const nextReply = { ...reply, likes: likes.includes(userId) ? likes.filter((id) => id !== userId) : [...likes, userId] };
        updatedReview = { ...review, replies: (review.replies || []).map((item) => item.id === replyId ? nextReply : item) };
        return nextReply;
      });
      return { ...review, replies };
    }
    const likes = review.likes || [];
    updatedReview = { ...review, likes: likes.includes(userId) ? likes.filter((id) => id !== userId) : [...likes, userId] };
    return updatedReview;
  });
  write(STORAGE_KEYS.COURSE_REVIEWS, next);
  return updatedReview;
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
