import {
  BadgeCheck,
  CalendarDays,
  Headset,
  SearchCheck,
  SquareCheckBig,
  Users,
} from 'lucide-react';

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
};

export const teacherFields = [
  {
    name: 'subject',
    label: 'Môn dạy / Chuyên môn',
    options: [
      'Toán học',
      'Tiếng Anh',
      'Vật lý',
      'Hóa học',
      'Ngữ văn',
      'Sinh học',
      'Lập trình',
      'Piano',
      'Vẽ mỹ thuật',
      'Kỹ năng sống',
      'Môn học khác',
    ],
  },
  {
    name: 'area',
    label: 'Khu vực dạy',
    options: [
      'Toàn quốc (Online)',
      'Hà Nội',
      'TP. Hồ Chí Minh',
      'Đà Nẵng',
      'Hải Phòng',
      'Cần Thơ',
      'Khu vực khác',
    ],
  },
  {
    name: 'teachingMode',
    label: 'Hình thức dạy',
    options: ['Online', 'Offline', 'Online và Offline'],
  },
  {
    name: 'experience',
    label: 'Số năm kinh nghiệm',
    options: ['Dưới 1 năm', '1–3 năm', '3–5 năm', '5–10 năm', 'Trên 10 năm'],
  },
  {
    name: 'qualification',
    label: 'Bằng cấp / Chứng chỉ',
    options: [
      'Đang học đại học',
      'Cử nhân',
      'Thạc sĩ',
      'Tiến sĩ',
      'Chứng chỉ giảng dạy',
      'Bằng cấp / Chứng chỉ khác',
    ],
  },
];

export const initialForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  subject: '',
  area: '',
  teachingMode: '',
  experience: '',
  qualification: '',
  biography: '',
  workExperience: '',
};

export function validateRegistration(form, role) {
  const errors = {};
  if (form.name.trim().length < 2) errors.name = 'Vui lòng nhập họ và tên (ít nhất 2 ký tự).';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
    errors.email = 'Vui lòng nhập email hợp lệ.';
  if (!/^(?:0\d{9}|\+84\d{9})$/.test(form.phone.replace(/[\s.-]/g, '')))
    errors.phone = 'Nhập số điện thoại 10 chữ số hoặc bắt đầu bằng +84.';
  if (form.password.length < 8) errors.password = 'Mật khẩu cần có ít nhất 8 ký tự.';
  if (!form.confirmPassword) errors.confirmPassword = 'Vui lòng xác nhận mật khẩu.';
  else if (form.password !== form.confirmPassword)
    errors.confirmPassword = 'Mật khẩu xác nhận chưa khớp.';
  if (role === 'teacher') {
    teacherFields.forEach(({ name, label }) => {
      if (!form[name]) errors[name] = `Vui lòng chọn ${label.toLowerCase()}.`;
    });
  }
  return errors;
}
