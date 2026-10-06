import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Award,
  Briefcase,
  Calendar,
  Check,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
  Menu,
  Phone,
  Search,
  User,
  UserCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import studentImage from '@/assets/login-student-v2.png';
import teacherAvatarsImg from '@/assets/teacher-avatars.png';
import './register.css';

const benefits = [
  'Kết nối nhanh chóng',
  'Giáo viên uy tín, chất lượng',
  'Linh hoạt thời gian',
  'Phù hợp mọi trình độ',
];

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  // Role: 'student' | 'teacher'
  const [role, setRole] = useState('student');

  // Common Form State
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Teacher-Specific Form State
  const [qualifications, setQualifications] = useState('');
  const [experience, setExperience] = useState('');
  const [bio, setBio] = useState('');

  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const nextErrors = {};

    if (!fullName.trim()) {
      nextErrors.fullName = 'Vui lòng nhập họ và tên';
    }

    if (!dob) {
      nextErrors.dob = 'Vui lòng chọn ngày tháng năm sinh';
    }

    if (!email.trim()) {
      nextErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = 'Email chưa đúng định dạng';
    }

    if (!phone.trim()) {
      nextErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^(0|\+84)[0-9]{8,10}$/.test(phone.trim().replace(/\s/g, ''))) {
      nextErrors.phone = 'Số điện thoại không hợp lệ (9-11 số)';
    }

    if (!password) {
      nextErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (password.length < 6) {
      nextErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    // Teacher-specific validation
    if (role === 'teacher') {
      if (!qualifications.trim()) {
        nextErrors.qualifications = 'Vui lòng điền bằng cấp, chứng chỉ';
      }
      if (!experience.trim()) {
        nextErrors.experience = 'Vui lòng điền kinh nghiệm giảng dạy';
      }
      if (!bio.trim()) {
        nextErrors.bio = 'Vui lòng viết vài dòng giới thiệu về bản thân';
      }
    }

    if (!agreeTerms) {
      nextErrors.agreeTerms = 'Bạn cần đồng ý với điều khoản dịch vụ';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    if (!validate()) return;

    setLoading(true);
    const payload = {
      role,
      fullName: fullName.trim(),
      dob,
      email: email.trim(),
      phone: phone.trim(),
      password,
      ...(role === 'teacher'
        ? {
            qualifications: qualifications.trim(),
            experience: experience.trim(),
            bio: bio.trim(),
          }
        : {}),
    };

    const result = await register(payload);
    setLoading(false);

    if (result.success) {
      toast.success(
        role === 'teacher'
          ? 'Đăng ký tài khoản Giáo viên thành công!'
          : 'Đăng ký tài khoản Học viên thành công!'
      );
      navigate(ROUTES.HOME, { replace: true });
      return;
    }

    const message = result.message || 'Đăng ký chưa thành công. Vui lòng thử lại.';
    setFormError(message);
    toast.error(message);
  };

  const announceSocialLogin = (provider) => {
    toast(`Đăng ký bằng ${provider} đang được chuẩn bị.`);
  };

  return (
    <main className="register-page">
      {/* Top Navbar */}
      <header className="register-nav">
        <div className="register-nav__inner">
          <Link className="register-brand" to={ROUTES.HOME} aria-label="Về trang chủ EduMatch">
            <span className="register-brand__mark">E</span>
            <span>EduMatch</span>
          </Link>

          <nav className="register-nav__links" aria-label="Điều hướng chính">
            <Link to={ROUTES.HOME}>
              <Search size={18} aria-hidden="true" />
              Tìm gia sư
            </Link>
            <Link to={ROUTES.HOME}>Dành cho giáo viên</Link>
            <Link to={ROUTES.HOME}>Về chúng tôi</Link>
            <Link to={ROUTES.HOME}>Liên hệ</Link>
          </nav>

          <div className="register-nav__actions">
            <Link className="register-nav__button" to={ROUTES.LOGIN}>
              Đăng nhập
            </Link>
            <Link className="register-nav__button register-nav__button--primary" to={ROUTES.REGISTER}>
              Đăng ký
            </Link>
          </div>

          <button className="register-nav__menu" type="button" aria-label="Mở điều hướng">
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Main Content Stage */}
      <section className="register-stage" aria-labelledby="register-title">
        {/* Ambient Blur Blob */}
        <div className="register-stage__blob-left" aria-hidden="true" />

        <div className="register-shell">
          {/* Left Column: Register Card */}
          <section
            className={`register-card ${role === 'teacher' ? 'register-card--teacher' : ''}`}
            aria-label="Biểu mẫu đăng ký"
          >
            <div className="register-card__heading">
              <h1 id="register-title">Đăng ký</h1>
              <p>Tạo tài khoản để bắt đầu học tập và kết nối gia sư</p>
            </div>

            {/* 2 Role Tabs: Tôi Là Học Viên / Tôi Là Giáo Viên */}
            <div className="register-role-tabs" role="tablist" aria-label="Chọn vai trò">
              <button
                type="button"
                role="tab"
                aria-selected={role === 'student'}
                className={`register-role-tab ${role === 'student' ? 'is-active' : ''}`}
                onClick={() => {
                  setRole('student');
                  setErrors({});
                }}
              >
                {role === 'student' && (
                  <span className="register-role-tab__badge" aria-hidden="true">
                    <Check size={12} strokeWidth={3} />
                  </span>
                )}
                <div className="register-role-tab__icon">
                  <GraduationCap size={22} />
                </div>
                <span className="register-role-tab__title">Tôi Là Học Viên</span>
                <span className="register-role-tab__desc">Tìm & học cùng gia sư</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={role === 'teacher'}
                className={`register-role-tab ${role === 'teacher' ? 'is-active' : ''}`}
                onClick={() => {
                  setRole('teacher');
                  setErrors({});
                }}
              >
                {role === 'teacher' && (
                  <span className="register-role-tab__badge" aria-hidden="true">
                    <Check size={12} strokeWidth={3} />
                  </span>
                )}
                <div className="register-role-tab__icon">
                  <UserCheck size={22} />
                </div>
                <span className="register-role-tab__title">Tôi Là Giáo Viên</span>
                <span className="register-role-tab__desc">Nhận lớp & dạy kèm</span>
              </button>
            </div>

            {formError && <p className="register-alert" role="alert">{formError}</p>}

            <form className="register-form" onSubmit={handleSubmit} noValidate>
              {/* Họ Và Tên */}
              <div className="register-field">
                <label htmlFor="reg-name" className="register-field__label">
                  Họ và Tên <span className="is-required">*</span>
                </label>
                <div className={errors.fullName ? 'register-control is-invalid' : 'register-control'}>
                  <User size={19} className="register-control__icon" aria-hidden="true" />
                  <input
                    id="reg-name"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    placeholder={role === 'teacher' ? 'VD: Nguyễn Văn A (Thầy/Cô)' : 'VD: Nguyễn Văn A'}
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
                    }}
                    aria-invalid={Boolean(errors.fullName)}
                  />
                </div>
                {errors.fullName && <p className="register-field__error">{errors.fullName}</p>}
              </div>

              {/* Row: Ngày sinh & Email */}
              <div className="register-row">
                {/* Ngày tháng năm sinh */}
                <div className="register-field">
                  <label htmlFor="reg-dob" className="register-field__label">
                    Ngày tháng năm sinh <span className="is-required">*</span>
                  </label>
                  <div className={errors.dob ? 'register-control is-invalid' : 'register-control'}>
                    <Calendar size={19} className="register-control__icon" aria-hidden="true" />
                    <input
                      id="reg-dob"
                      name="dob"
                      type="date"
                      value={dob}
                      onChange={(e) => {
                        setDob(e.target.value);
                        if (errors.dob) setErrors((prev) => ({ ...prev, dob: '' }));
                      }}
                      aria-invalid={Boolean(errors.dob)}
                    />
                  </div>
                  {errors.dob && <p className="register-field__error">{errors.dob}</p>}
                </div>

                {/* Email */}
                <div className="register-field">
                  <label htmlFor="reg-email" className="register-field__label">
                    Email <span className="is-required">*</span>
                  </label>
                  <div className={errors.email ? 'register-control is-invalid' : 'register-control'}>
                    <Mail size={19} className="register-control__icon" aria-hidden="true" />
                    <input
                      id="reg-email"
                      name="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                      }}
                      aria-invalid={Boolean(errors.email)}
                    />
                  </div>
                  {errors.email && <p className="register-field__error">{errors.email}</p>}
                </div>
              </div>

              {/* Số điện thoại (Cũng là tài khoản đăng nhập) */}
              <div className="register-field">
                <label htmlFor="reg-phone" className="register-field__label">
                  Số điện thoại (Tài khoản đăng nhập) <span className="is-required">*</span>
                </label>
                <div className={errors.phone ? 'register-control is-invalid' : 'register-control'}>
                  <Phone size={19} className="register-control__icon" aria-hidden="true" />
                  <input
                    id="reg-phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="Số điện thoại dùng để đăng nhập"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                    }}
                    aria-invalid={Boolean(errors.phone)}
                  />
                </div>
                {errors.phone && <p className="register-field__error">{errors.phone}</p>}
              </div>

              {/* Row: Mật khẩu & Xác nhận mật khẩu */}
              <div className="register-row">
                {/* Mật khẩu */}
                <div className="register-field">
                  <label htmlFor="reg-password" className="register-field__label">
                    Mật khẩu <span className="is-required">*</span>
                  </label>
                  <div className={errors.password ? 'register-control is-invalid' : 'register-control'}>
                    <Lock size={19} className="register-control__icon" aria-hidden="true" />
                    <input
                      id="reg-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Tối thiểu 6 ký tự"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                      }}
                      aria-invalid={Boolean(errors.password)}
                    />
                    <button
                      className="register-control__toggle"
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <p className="register-field__error">{errors.password}</p>}
                </div>

                {/* Xác nhận mật khẩu */}
                <div className="register-field">
                  <label htmlFor="reg-confirm-password" className="register-field__label">
                    Xác nhận mật khẩu <span className="is-required">*</span>
                  </label>
                  <div className={errors.confirmPassword ? 'register-control is-invalid' : 'register-control'}>
                    <Lock size={19} className="register-control__icon" aria-hidden="true" />
                    <input
                      id="reg-confirm-password"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Nhập lại mật khẩu"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                      }}
                      aria-invalid={Boolean(errors.confirmPassword)}
                    />
                    <button
                      className="register-control__toggle"
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="register-field__error">{errors.confirmPassword}</p>}
                </div>
              </div>

              {/* TEACHER-ONLY FIELDS */}
              {role === 'teacher' && (
                <section className="register-role-section" aria-labelledby="teacher-details-title">
                  <div className="register-role-section__heading">
                    <h2 id="teacher-details-title">Thông tin dành cho giáo viên</h2>
                    <p>Hoàn thiện hồ sơ chuyên môn để học viên dễ tìm thấy bạn hơn.</p>
                  </div>

                  {/* Chuyên môn và kinh nghiệm */}
                  <div className="register-row">
                    {/* Bằng cấp, chứng chỉ */}
                    <div className="register-field">
                      <label htmlFor="reg-qualifications" className="register-field__label">
                        Bằng cấp, chứng chỉ <span className="is-required">*</span>
                      </label>
                      <div className={errors.qualifications ? 'register-control is-invalid' : 'register-control'}>
                        <Award size={19} className="register-control__icon" aria-hidden="true" />
                        <input
                          id="reg-qualifications"
                          name="qualifications"
                          type="text"
                          placeholder="VD: Cử nhân ĐH Sư Phạm, IELTS 8.0..."
                          value={qualifications}
                          onChange={(e) => {
                            setQualifications(e.target.value);
                            if (errors.qualifications) setErrors((prev) => ({ ...prev, qualifications: '' }));
                          }}
                          aria-invalid={Boolean(errors.qualifications)}
                        />
                      </div>
                      {errors.qualifications && <p className="register-field__error">{errors.qualifications}</p>}
                    </div>

                    {/* Kinh nghiệm giảng dạy */}
                    <div className="register-field">
                      <label htmlFor="reg-experience" className="register-field__label">
                        Kinh nghiệm giảng dạy <span className="is-required">*</span>
                      </label>
                      <div className={errors.experience ? 'register-control is-invalid' : 'register-control'}>
                        <Briefcase size={19} className="register-control__icon" aria-hidden="true" />
                        <input
                          id="reg-experience"
                          name="experience"
                          type="text"
                          placeholder="VD: 3 năm dạy Toán THPT, luyện thi ĐH..."
                          value={experience}
                          onChange={(e) => {
                            setExperience(e.target.value);
                            if (errors.experience) setErrors((prev) => ({ ...prev, experience: '' }));
                          }}
                          aria-invalid={Boolean(errors.experience)}
                        />
                      </div>
                      {errors.experience && <p className="register-field__error">{errors.experience}</p>}
                    </div>
                  </div>

                  {/* Giới thiệu về bản thân */}
                  <div className="register-field">
                    <label htmlFor="reg-bio" className="register-field__label">
                      Giới thiệu về bản thân <span className="is-required">*</span>
                    </label>
                    <textarea
                      id="reg-bio"
                      name="bio"
                      className="register-textarea"
                      rows={3}
                      placeholder="Chia sẻ ngắn gọn về phương pháp, phong cách giảng dạy và thông điệp gửi gắm tới học viên..."
                      value={bio}
                      onChange={(e) => {
                        setBio(e.target.value);
                        if (errors.bio) setErrors((prev) => ({ ...prev, bio: '' }));
                      }}
                      aria-invalid={Boolean(errors.bio)}
                    />
                    {errors.bio && <p className="register-field__error">{errors.bio}</p>}
                  </div>
                </section>
              )}

              {/* Điều khoản dịch vụ */}
              <label className="register-terms">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => {
                    setAgreeTerms(e.target.checked);
                    if (errors.agreeTerms) setErrors((prev) => ({ ...prev, agreeTerms: '' }));
                  }}
                  style={{ marginTop: '2px', accentColor: 'var(--reg-green)' }}
                />
                <span>
                  Tôi đồng ý với <Link to={ROUTES.HOME}>Điều khoản dịch vụ</Link> và{' '}
                  <Link to={ROUTES.HOME}>Chính sách bảo mật</Link> của EduMatch.
                </span>
              </label>
              {errors.agreeTerms && <p className="register-field__error">{errors.agreeTerms}</p>}

              {/* Submit Button */}
              <button className="register-submit" type="submit" disabled={loading} style={{ marginTop: '4px' }}>
                {loading
                  ? 'Đang đăng ký...'
                  : role === 'teacher'
                  ? 'Đăng ký tài khoản Giáo viên'
                  : 'Đăng ký tài khoản Học viên'}
              </button>
            </form>

            {/* Divider */}
            <div className="register-divider"><span>Hoặc đăng ký bằng</span></div>

            {/* Social Logins */}
            <div className="register-socials" aria-label="Các phương thức đăng ký khác">
              <button type="button" onClick={() => announceSocialLogin('Google')}>
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.04h3.88c2.28-2.09 3.66-5.18 3.66-9.14z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.04c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.13C3.25 21.31 7.31 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.28c-.25-.72-.38-1.49-.38-2.28s.13-1.56.38-2.28V6.59H1.26C.46 8.19 0 9.99 0 12s.46 3.81 1.26 5.41l4.02-3.13z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.69 1.26 6.59l4.02 3.13c.95-2.83 3.6-4.97 6.72-4.97z"/>
                </svg>
                <span>Google</span>
              </button>

              <button type="button" onClick={() => announceSocialLogin('Facebook')}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Facebook</span>
              </button>

              <button type="button" onClick={() => announceSocialLogin('Apple')}>
                <svg width="19" height="20" viewBox="0 0 170 170" fill="currentColor" aria-hidden="true">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.6-7.85-11.7-14.44-6.3-10.14-11.21-21.57-14.72-34.3-3.51-12.73-5.27-24.87-5.27-36.42 0-15.02 3.68-27.42 11.05-37.21 7.37-9.78 16.73-14.78 28.08-15 5.21 0 10.63 1.32 16.27 3.96 5.64 2.64 9.49 4.07 11.55 4.3 1.93-.23 5.89-1.72 11.88-4.47 5.99-2.75 11.26-4.01 15.82-3.78 12.08.77 21.72 4.9 28.94 12.4-10.55 6.38-15.7 15.19-15.46 26.43.24 9.17 3.75 16.92 10.53 23.24 6.78 6.33 14.86 10.13 24.24 11.41-2.04 6.07-4.43 12.19-7.18 18.36zm-39.63-107.82c0-6.19 2.24-12.05 6.72-17.58 4.48-5.53 10.05-9.35 16.72-11.45.35 1.58.53 3.05.53 4.41 0 6.07-2.39 12-7.17 17.78-4.78 5.78-10.49 9.5-17.13 11.17-.18-1.57-.27-3.02-.27-4.33z"/>
                </svg>
                <span>Apple</span>
              </button>
            </div>

            {/* Footer Login Link */}
            <p className="register-login-copy">
              Đã có tài khoản? <Link to={ROUTES.LOGIN}>Đăng nhập ngay</Link>
            </p>
          </section>

          {/* Right Column: Hero Section + Student Composition */}
          <aside className="register-hero" aria-label="Lợi ích khi học cùng EduMatch">
            {/* Soft mint circular blobs behind the student */}
            <div className="register-hero__blob register-hero__blob--upper" aria-hidden="true" />
            <div className="register-hero__blob register-hero__blob--lower" aria-hidden="true" />

            {/* Dashed arc curve in top right */}
            <div className="register-hero__dashed-arc" aria-hidden="true">
              <svg width="88" height="88" viewBox="0 0 88 88" fill="none">
                <path
                  d="M 12 76 A 52 52 0 0 1 76 12"
                  stroke="#087b68"
                  strokeWidth="2.5"
                  strokeDasharray="6 6"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Hero Left Content */}
            <div className="register-hero__content">
              {/* Floating Teacher Badge */}
              <div className="register-badge">
                <div className="register-badge__avatars" aria-hidden="true">
                  <img src={teacherAvatarsImg} alt="" className="register-badge__img" />
                </div>
                <span className="register-badge__text">
                  Hàng nghìn giáo viên<br />đang chờ bạn khám phá
                </span>
              </div>

              {/* Headline */}
              <h2 className="register-hero__title">
                Học tốt hơn<br />cùng <strong>EduMatch</strong>
              </h2>

              {/* Checklist */}
              <ul className="register-hero__list">
                {benefits.map((benefit) => (
                  <li key={benefit}>
                    <span className="register-hero__check-icon" aria-hidden="true">
                      <Check size={16} strokeWidth={3} />
                    </span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              {/* Paper Airplane with Curved Trail */}
              <div className="register-hero__plane-box" aria-hidden="true">
                <svg className="register-hero__plane-trail" width="130" height="65" viewBox="0 0 130 65" fill="none">
                  <path
                    d="M 8 52 C 45 56, 80 46, 108 20"
                    stroke="#087b68"
                    strokeWidth="2"
                    strokeDasharray="5 5"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="register-hero__plane-icon">
                  <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#087b68" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m22 2-7 20-4-9-9-4Z" />
                    <path d="M22 2 11 13" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Student Image: Fully visible, anchored at bottom */}
            <div className="register-hero__visual">
              <img
                className="register-hero__student-img"
                src={studentImage}
                alt="Sinh viên mang sách và máy tính bảng"
                width="1024"
                height="1536"
              />
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
};

export default Register;
