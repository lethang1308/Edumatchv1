import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Check,
  Eye,
  EyeOff,
  Lock,
  Menu,
  Search,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import studentImage from '@/assets/login-student-v2.png';
import teacherAvatarsImg from '@/assets/teacher-avatars.png';
import './login.css';

const benefits = [
  'Kết nối nhanh chóng',
  'Giáo viên uy tín, chất lượng',
  'Linh hoạt thời gian',
  'Phù hợp mọi trình độ',
];

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const nextErrors = {};
    if (!email) {
      nextErrors.email = 'Vui lòng nhập email hoặc số điện thoại';
    } else if (email.includes('@') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = 'Email chưa đúng định dạng';
    }

    if (!password) {
      nextErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (password.length < 6) {
      nextErrors.password = 'Mật khẩu cần có ít nhất 6 ký tự';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    if (!validate()) return;

    setLoading(true);
    const result = await login({ email, password, remember });
    setLoading(false);

    if (result.success) {
      toast.success('Đăng nhập thành công');
      navigate(location.state?.from?.pathname || ROUTES.HOME, { replace: true });
      return;
    }

    const message = result.message || 'Đăng nhập chưa thành công. Vui lòng thử lại.';
    setFormError(message);
    toast.error(message);
  };

  const announceSocialLogin = (provider) => {
    toast(`Đăng nhập bằng ${provider} đang được chuẩn bị.`);
  };

  return (
    <main className="login-page">
      {/* Top Navbar */}
      <header className="login-nav">
        <div className="login-nav__inner">
          <Link className="login-brand" to={ROUTES.HOME} aria-label="Về trang chủ EduMatch">
            <span className="login-brand__mark">E</span>
            <span>EduMatch</span>
          </Link>

          <nav className="login-nav__links" aria-label="Điều hướng chính">
            <Link to={ROUTES.HOME}>
              <Search size={18} aria-hidden="true" />
              Tìm gia sư
            </Link>
            <Link to={ROUTES.HOME}>Dành cho giáo viên</Link>
            <Link to={ROUTES.HOME}>Về chúng tôi</Link>
            <Link to={ROUTES.HOME}>Liên hệ</Link>
          </nav>

          <div className="login-nav__actions">
            <Link className="login-nav__button login-nav__button--outline" to={ROUTES.LOGIN}>
              Đăng nhập
            </Link>
            <Link className="login-nav__button login-nav__button--primary" to={ROUTES.REGISTER}>
              Đăng ký
            </Link>
          </div>

          <button className="login-nav__menu" type="button" aria-label="Mở điều hướng">
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Main Content Stage */}
      <section className="login-stage" aria-labelledby="login-title">
        {/* Soft Ambient Blur Blob */}
        <div className="login-stage__blob-left" aria-hidden="true" />

        <div className="login-shell">
          {/* Left Column: Login Card */}
          <section className="login-card" aria-label="Biểu mẫu đăng nhập">
            <div className="login-card__heading">
              <h1 id="login-title">Đăng nhập</h1>
              <p>Chào mừng bạn trở lại EduMatch</p>
            </div>

            {formError && <p className="login-alert" role="alert">{formError}</p>}

            <form className="login-form" onSubmit={handleSubmit} noValidate>
              {/* Email / Phone Field */}
              <div className="login-field">
                <label htmlFor="login-email" className="sr-only">Email hoặc số điện thoại</label>
                <div className={errors.email ? 'login-control is-invalid' : 'login-control'}>
                  <User size={20} className="login-control__icon" aria-hidden="true" />
                  <input
                    id="login-email"
                    name="email"
                    type="text"
                    inputMode="email"
                    autoComplete="username"
                    placeholder="Email / Số điện thoại"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      if (errors.email) setErrors((current) => ({ ...current, email: '' }));
                    }}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'login-email-error' : undefined}
                  />
                </div>
                {errors.email && <p id="login-email-error" className="login-field__error">{errors.email}</p>}
              </div>

              {/* Password Field */}
              <div className="login-field">
                <label htmlFor="login-password" className="sr-only">Mật khẩu</label>
                <div className={errors.password ? 'login-control is-invalid' : 'login-control'}>
                  <Lock size={20} className="login-control__icon" aria-hidden="true" />
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Mật khẩu"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      if (errors.password) setErrors((current) => ({ ...current, password: '' }));
                    }}
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={errors.password ? 'login-password-error' : undefined}
                  />
                  <button
                    className="login-control__toggle"
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && <p id="login-password-error" className="login-field__error">{errors.password}</p>}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="login-form__options">
                <label className="login-checkbox">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(event) => setRemember(event.target.checked)}
                  />
                  <span className="login-checkbox__box" aria-hidden="true">
                    <Check size={14} strokeWidth={3} />
                  </span>
                  <span className="login-checkbox__label">Ghi nhớ đăng nhập</span>
                </label>
                <button
                  type="button"
                  className="login-text-button"
                  onClick={() => toast('Liên kết đặt lại mật khẩu sẽ sớm khả dụng.')}
                >
                  Quên mật khẩu?
                </button>
              </div>

              {/* Submit Button */}
              <button className="login-submit" type="submit" disabled={loading}>
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </form>

            {/* Divider */}
            <div className="login-divider"><span>Hoặc đăng nhập bằng</span></div>

            {/* Social Logins */}
            <div className="login-socials" aria-label="Các phương thức đăng nhập khác">
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

            {/* Footer Registration Link */}
            <p className="login-register-copy">
              Chưa có tài khoản? <Link to={ROUTES.REGISTER}>Đăng ký ngay</Link>
            </p>
          </section>

          {/* Right Column: Hero Section + Student Composition */}
          <aside className="login-hero" aria-label="Lợi ích khi học cùng EduMatch">
            {/* Soft mint circular blobs behind the student */}
            <div className="login-hero__blob login-hero__blob--upper" aria-hidden="true" />
            <div className="login-hero__blob login-hero__blob--lower" aria-hidden="true" />

            {/* Dashed arc curve in top right */}
            <div className="login-hero__dashed-arc" aria-hidden="true">
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
            <div className="login-hero__content">
              {/* Floating Teacher Badge */}
              <div className="login-badge">
                <div className="login-badge__avatars" aria-hidden="true">
                  <img src={teacherAvatarsImg} alt="" className="login-badge__img" />
                </div>
                <span className="login-badge__text">
                  Hàng nghìn giáo viên<br />đang chờ bạn khám phá
                </span>
              </div>

              {/* Headline */}
              <h2 className="login-hero__title">
                Học tốt hơn<br />cùng <strong>EduMatch</strong>
              </h2>

              {/* Checklist */}
              <ul className="login-hero__list">
                {benefits.map((benefit) => (
                  <li key={benefit}>
                    <span className="login-hero__check-icon" aria-hidden="true">
                      <Check size={16} strokeWidth={3} />
                    </span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              {/* Paper Airplane with Curved Trail */}
              <div className="login-hero__plane-box" aria-hidden="true">
                <svg className="login-hero__plane-trail" width="130" height="65" viewBox="0 0 130 65" fill="none">
                  <path
                    d="M 8 52 C 45 56, 80 46, 108 20"
                    stroke="#087b68"
                    strokeWidth="2"
                    strokeDasharray="5 5"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="login-hero__plane-icon">
                  <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#087b68" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m22 2-7 20-4-9-9-4Z" />
                    <path d="M22 2 11 13" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Student Image: Fully visible, anchored at bottom */}
            <div className="login-hero__student-wrap">
              <img
                className="login-hero__student-img"
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

export default Login;
