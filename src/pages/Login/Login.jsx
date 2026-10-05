import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Menu,
  Search,
  Send,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import studentImage from '@/assets/login-student-v2.png';
import './login.css';

const benefits = [
  'Kết nối nhanh chóng',
  'Giáo viên uy tín, chất lượng',
  'Linh hoạt thời gian',
  'Phù hợp mọi trình độ',
];

const teacherAvatars = ['/images/teacher-mai-anh.jpg', '/images/teacher-minh-tuan.jpg'];

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
      navigate(location.state?.from?.pathname || ROUTES.DASHBOARD, { replace: true });
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
            <Link className="login-nav__button login-nav__button--active" to={ROUTES.LOGIN}>
              Đăng nhập
            </Link>
            <Link className="login-nav__button login-nav__button--primary" to={ROUTES.HOME}>
              Đăng ký
            </Link>
          </div>

          <button className="login-nav__menu" type="button" aria-label="Mở điều hướng">
            <Menu size={22} />
          </button>
        </div>
      </header>

      <section className="login-stage" aria-labelledby="login-title">
        <div className="login-stage__orb login-stage__orb--one" aria-hidden="true" />
        <div className="login-stage__orb login-stage__orb--two" aria-hidden="true" />
        <div className="login-shell">
          <section className="login-card" aria-label="Biểu mẫu đăng nhập">
            <div className="login-card__heading">
              <h1 id="login-title">Đăng nhập</h1>
              <p>Chào mừng bạn trở lại EduMatch</p>
            </div>

            {formError && <p className="login-alert" role="alert">{formError}</p>}

            <form className="login-form" onSubmit={handleSubmit} noValidate>
              <div className="login-field">
                <label htmlFor="login-email">Email hoặc số điện thoại</label>
                <div className={errors.email ? 'login-control is-invalid' : 'login-control'}>
                  <Mail size={21} aria-hidden="true" />
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

              <div className="login-field">
                <label htmlFor="login-password">Mật khẩu</label>
                <div className={errors.password ? 'login-control is-invalid' : 'login-control'}>
                  <LockKeyhole size={21} aria-hidden="true" />
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
                    {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                  </button>
                </div>
                {errors.password && <p id="login-password-error" className="login-field__error">{errors.password}</p>}
              </div>

              <div className="login-form__options">
                <label className="login-checkbox">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(event) => setRemember(event.target.checked)}
                  />
                  <span aria-hidden="true"><Check size={15} /></span>
                  Ghi nhớ đăng nhập
                </label>
                <button type="button" className="login-text-button" onClick={() => toast('Liên kết đặt lại mật khẩu sẽ sớm khả dụng.')}>Quên mật khẩu?</button>
              </div>

              <button className="login-submit" type="submit" disabled={loading}>
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </form>

            <div className="login-divider"><span>Hoặc đăng nhập bằng</span></div>

            <div className="login-socials" aria-label="Các phương thức đăng nhập khác">
              <button type="button" onClick={() => announceSocialLogin('Google')}><span className="social-mark social-mark--google">G</span>Google</button>
              <button type="button" onClick={() => announceSocialLogin('Facebook')}><span className="social-mark social-mark--facebook">f</span>Facebook</button>
              <button type="button" onClick={() => announceSocialLogin('Apple')}><span className="social-mark social-mark--apple">●</span>Apple</button>
            </div>

            <p className="login-register-copy">Chưa có tài khoản? <Link to={ROUTES.HOME}>Đăng ký ngay</Link></p>
          </section>

          <aside className="login-promo" aria-label="Lợi ích khi học cùng EduMatch">
            <div className="login-promo__note">
              <div className="login-promo__avatars" aria-hidden="true">
                {teacherAvatars.map((avatar) => <img key={avatar} src={avatar} alt="" />)}
              </div>
              <span>Hàng nghìn giáo viên<br />đang chờ bạn khám phá</span>
            </div>
            <div className="login-promo__copy">
              <h2>Học tốt hơn<br />cùng <strong>EduMatch</strong></h2>
              <ul>
                {benefits.map((benefit) => (
                  <li key={benefit}><span><Check size={17} /></span>{benefit}</li>
                ))}
              </ul>
            </div>
            <Send className="login-promo__plane" size={70} strokeWidth={1.7} aria-hidden="true" />
            <img className="login-promo__student" src={studentImage} alt="Sinh viên mang sách và máy tính bảng" width="1024" height="1536" />
          </aside>
        </div>
      </section>
    </main>
  );
};

export default Login;
