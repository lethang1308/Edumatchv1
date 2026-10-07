import {
  Award,
  BadgeCheck,
  BookOpen,
  Building2,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  FileText,
  GraduationCap,
  Headset,
  LockKeyhole,
  Mail,
  Phone,
  SearchCheck,
  SquareCheckBig,
  UserRound,
  Users,
} from 'lucide-react';

export const registrationRoles = [
  { value: 'student', label: 'Học sinh', accessibleLabel: 'Tôi là học sinh', icon: GraduationCap },
  { value: 'teacher', label: 'Giáo viên', accessibleLabel: 'Tôi là giáo viên', icon: UserRound },
  { value: 'center', label: 'Trung tâm', accessibleLabel: 'Trung tâm đào tạo', icon: Building2 },
];

export const roleContent = {
  student: {
    description: 'Tham gia EduMatch để bắt đầu hành trình học tập hiệu quả hơn.',
    benefits: [
      { icon: SearchCheck, text: 'Tìm giáo viên phù hợp với bạn' },
      { icon: BadgeCheck, text: 'Học cùng giáo viên uy tín, chất lượng' },
      { icon: CalendarDays, text: 'Chủ động lịch học, linh hoạt thời gian' },
      { icon: Headset, text: 'Đội ngũ EduMatch luôn đồng hành' },
    ],
  },
  teacher: {
    description: 'Bắt đầu hành trình giảng dạy và kết nối với nhiều học sinh hơn.',
    benefits: [
      { icon: Users, text: 'Kết nối với học sinh có nhu cầu học tập' },
      { icon: SquareCheckBig, text: 'Xây dựng hồ sơ chuyên môn và uy tín' },
      { icon: CalendarDays, text: 'Linh hoạt thời gian, dạy online hoặc offline' },
      { icon: Headset, text: 'Được hỗ trợ tận tâm từ EduMatch' },
    ],
  },
  center: {
    description: 'Tạo tài khoản cho trung tâm và giới thiệu chương trình đào tạo của bạn.',
    benefits: [
      { icon: Users, text: 'Kết nối với học viên có nhu cầu học tập' },
      { icon: BookOpen, text: 'Giới thiệu các chương trình đào tạo' },
      { icon: BadgeCheck, text: 'Xây dựng hồ sơ và uy tín trung tâm' },
      { icon: Headset, text: 'Đội ngũ EduMatch luôn đồng hành' },
    ],
  },
};

const passwordFields = [
  { name: 'password', label: 'Mật khẩu', icon: LockKeyhole, autoComplete: 'new-password' },
  {
    name: 'confirmPassword',
    label: 'Nhập lại mật khẩu',
    icon: LockKeyhole,
    autoComplete: 'new-password',
  },
];

const phoneField = {
  name: 'phone',
  label: 'Số điện thoại',
  icon: Phone,
  type: 'tel',
  autoComplete: 'tel',
  maxLength: 20,
};

export const accountFields = [
  { name: 'name', label: 'Họ và tên', icon: UserRound, autoComplete: 'name', maxLength: 100 },
  {
    name: 'email',
    label: 'Email',
    icon: Mail,
    type: 'email',
    autoComplete: 'email',
    maxLength: 254,
  },
  phoneField,
  {
    name: 'dateOfBirth',
    label: 'Ngày sinh',
    icon: CalendarDays,
    type: 'date',
    autoComplete: 'bday',
    showLabel: true,
  },
  ...passwordFields,
];

export const centerAccountFields = [
  {
    name: 'centerName',
    label: 'Tên trung tâm',
    placeholder: 'VD: Trung tâm Anh ngữ EduMatch',
    icon: Building2,
    autoComplete: 'organization',
    maxLength: 150,
  },
  {
    ...phoneField,
    label: 'Số điện thoại (tài khoản đăng nhập)',
    placeholder: 'Số điện thoại dùng để đăng nhập',
  },
  ...passwordFields,
];

export const teacherFields = [
  {
    name: 'qualification',
    label: 'Bằng cấp, chứng chỉ',
    placeholder: 'VD: Cử nhân ĐH Sư phạm, IELTS 8.0...',
    icon: Award,
    maxLength: 200,
  },
  {
    name: 'experience',
    label: 'Kinh nghiệm giảng dạy',
    placeholder: 'VD: 3 năm dạy Toán THPT, luyện thi đại học...',
    icon: ChartNoAxesColumnIncreasing,
    maxLength: 500,
  },
  {
    name: 'biography',
    label: 'Giới thiệu về bản thân',
    placeholder:
      'Chia sẻ về chuyên môn, phong cách giảng dạy và thông điệp gửi gắm tới học viên...',
    icon: FileText,
    multiline: true,
    maxLength: 500,
  },
];

export const centerFields = [
  {
    name: 'centerDescription',
    label: 'Mô tả về trung tâm',
    placeholder:
      'Chia sẻ về chương trình đào tạo, đội ngũ giảng dạy và giá trị mà trung tâm mang đến...',
    icon: FileText,
    multiline: true,
    maxLength: 1000,
  },
];

export const initialForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  dateOfBirth: '',
  experience: '',
  qualification: '',
  biography: '',
  centerName: '',
  centerDescription: '',
};

export function getTodayDate(today = new Date()) {
  return [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-');
}

function validBirthDate(value, today) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(value + 'T00:00:00');
  return (
    year > 0 &&
    date.getFullYear() === year &&
    date.getMonth() + 1 === month &&
    date.getDate() === day &&
    value <= getTodayDate(today)
  );
}

export function validateRegistration(form, role, today = new Date()) {
  const errors = {};
  if (role === 'center') {
    if (form.centerName.trim().length < 2)
      errors.centerName = 'Vui lòng nhập tên trung tâm (ít nhất 2 ký tự).';
  } else {
    if (form.name.trim().length < 2) errors.name = 'Vui lòng nhập họ và tên (ít nhất 2 ký tự).';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      errors.email = 'Vui lòng nhập email hợp lệ.';
  }
  if (!/^(?:0\d{9}|\+84\d{9})$/.test(form.phone.replace(/[\s.-]/g, '')))
    errors.phone = 'Nhập số điện thoại 10 chữ số hoặc bắt đầu bằng +84.';
  if (role !== 'center') {
    if (!form.dateOfBirth) errors.dateOfBirth = 'Vui lòng chọn ngày sinh.';
    else if (!validBirthDate(form.dateOfBirth, today))
      errors.dateOfBirth = 'Ngày sinh phải hợp lệ và không nằm trong tương lai.';
  }
  if (form.password.length < 8) errors.password = 'Mật khẩu cần có ít nhất 8 ký tự.';
  if (!form.confirmPassword) errors.confirmPassword = 'Vui lòng xác nhận mật khẩu.';
  else if (form.password !== form.confirmPassword)
    errors.confirmPassword = 'Mật khẩu xác nhận chưa khớp.';
  if (role === 'teacher') {
    teacherFields.forEach(({ name, label }) => {
      if (!form[name].trim()) errors[name] = `Vui lòng nhập ${label.toLowerCase()}.`;
    });
  } else if (role === 'center' && !form.centerDescription.trim()) {
    errors.centerDescription = 'Vui lòng nhập thông tin mô tả về trung tâm.';
  }
  return errors;
}

// Only include the active role's fields; hidden profile values never reach the API.
export function buildRegistrationPayload(form, role) {
  const data = {
    name: (role === 'center' ? form.centerName : form.name).trim(),
    phone: form.phone.replace(/[\s.-]/g, ''),
    password: form.password,
    role,
  };
  if (role === 'center') {
    return { ...data, centerProfile: { description: form.centerDescription.trim() } };
  }
  return {
    ...data,
    email: form.email.trim(),
    dateOfBirth: form.dateOfBirth,
    ...(role === 'teacher' && {
      teacherProfile: Object.fromEntries(
        teacherFields.map(({ name }) => [name, form[name].trim()])
      ),
    }),
  };
}
