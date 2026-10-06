import { useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Award,
  BookOpen,
  ChartNoAxesColumnIncreasing,
  ChevronDown,
  Eye,
  EyeOff,
  FileText,
  GraduationCap,
  LockKeyhole,
  Mail,
  MapPin,
  Monitor,
  Phone,
  UserRound,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ROUTES } from '@/constants/routes';
import { authService } from '@/services/authService';
import { initialForm, roleContent, teacherFields, validateRegistration } from './registerData';
import registerImage from '@/assets/register-student.webp';
import './register.css';

const basicFields = [
  { name: 'name', label: 'Họ và tên', icon: UserRound, autoComplete: 'name' },
  { name: 'email', label: 'Email', icon: Mail, type: 'email', autoComplete: 'email' },
  { name: 'phone', label: 'Số điện thoại', icon: Phone, type: 'tel', autoComplete: 'tel' },
  { name: 'password', label: 'Mật khẩu', icon: LockKeyhole, autoComplete: 'new-password' },
  {
    name: 'confirmPassword',
    label: 'Xác nhận mật khẩu',
    icon: LockKeyhole,
    autoComplete: 'new-password',
  },
];
const teacherIcons = [BookOpen, MapPin, Monitor, ChartNoAxesColumnIncreasing, Award];

function FieldError({ name, errors }) {
  return errors[name] ? (
    <p id={`register-${name}-error`} className="register-field__error">
      {errors[name]}
    </p>
  ) : null;
}

export function Register() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const role = searchParams.get('role') === 'teacher' ? 'teacher' : 'student';
  const [form, setForm] = useState(initialForm);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const formRef = useRef(null);
  const content = roleContent[role];

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setFormError('');
  };

  const changeRole = (nextRole) => {
    setSearchParams(nextRole === 'teacher' ? { role: 'teacher' } : {}, { replace: true });
    setErrors({});
    setFormError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;
    const nextErrors = validateRegistration(form, role);
    setErrors(nextErrors);
    setFormError('');
    const firstError = Object.keys(nextErrors)[0];
    if (firstError) {
      formRef.current.elements.namedItem(firstError)?.focus();
      return;
    }

    setLoading(true);
    const data = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.replace(/[\s.-]/g, ''),
      password: form.password,
      role,
      ...(role === 'teacher' && {
        teacherProfile: Object.fromEntries(
          [
            'subject',
            'area',
            'teachingMode',
            'experience',
            'qualification',
            'biography',
            'workExperience',
          ].map((key) => [key, form[key].trim()])
        ),
      }),
    };
    try {
      const result = await authService.register(data);
      if (result?.success === false)
        throw new Error(result.message || 'Chưa thể tạo tài khoản. Vui lòng thử lại.');
      toast.success('Tạo tài khoản thành công. Bạn có thể đăng nhập ngay.');
      navigate(ROUTES.LOGIN, { state: { registeredEmail: data.email }, replace: true });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        (error.response
          ? 'Chưa thể tạo tài khoản. Vui lòng kiểm tra thông tin và thử lại.'
          : 'Chưa thể kết nối để tạo tài khoản. Vui lòng thử lại sau.');
      setFormError(error.response || error.code ? message : error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={`register-page register-page--${role}`}>
      <div className="register-shell">
        <section className="register-card" aria-labelledby="register-title">
          <div className="register-heading">
            <h1 id="register-title">Tạo tài khoản</h1>
            <p>{content.description}</p>
          </div>

          <fieldset className="register-roles" disabled={loading}>
            <legend className="register-sr-only">Vai trò tài khoản</legend>
            {[
              { value: 'student', label: 'Tôi là học sinh', icon: GraduationCap },
              { value: 'teacher', label: 'Tôi là giáo viên', icon: UserRound },
            ].map(({ value, label, icon: Icon }) => (
              <label key={value} className={`register-role ${role === value ? 'is-selected' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value={value}
                  checked={role === value}
                  onChange={() => changeRole(value)}
                />
                <Icon size={27} strokeWidth={1.8} aria-hidden="true" />
                <span>{label}</span>
              </label>
            ))}
          </fieldset>

          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="register-form"
            noValidate
            aria-busy={loading}
          >
            <fieldset className="register-fields" disabled={loading}>
              <legend className="register-sr-only">Thông tin tài khoản</legend>
              {basicFields.map(({ name, label, icon: Icon, type = 'text', autoComplete }) => {
                const isPassword = name === 'password' || name === 'confirmPassword';
                return (
                  <div className="register-field" key={name}>
                    <label htmlFor={`register-${name}`} className="register-sr-only">
                      {label}
                    </label>
                    <div className={`register-control ${errors[name] ? 'is-invalid' : ''}`}>
                      <Icon size={21} strokeWidth={1.8} aria-hidden="true" />
                      <input
                        id={`register-${name}`}
                        name={name}
                        type={isPassword ? (visiblePasswords[name] ? 'text' : 'password') : type}
                        autoComplete={autoComplete}
                        placeholder={label}
                        value={form[name]}
                        onChange={updateField}
                        required
                        maxLength={
                          isPassword ? 128 : name === 'name' ? 100 : name === 'phone' ? 20 : 254
                        }
                        aria-invalid={Boolean(errors[name])}
                        aria-describedby={
                          errors[name]
                            ? `register-${name}-error`
                            : name === 'password'
                              ? 'register-password-hint'
                              : undefined
                        }
                      />
                      {isPassword && (
                        <button
                          type="button"
                          className="register-password-toggle"
                          onClick={() =>
                            setVisiblePasswords((current) => ({
                              ...current,
                              [name]: !current[name],
                            }))
                          }
                          aria-label={`${visiblePasswords[name] ? 'Ẩn' : 'Hiện'} ${label.toLowerCase()}`}
                          aria-pressed={Boolean(visiblePasswords[name])}
                        >
                          {visiblePasswords[name] ? <EyeOff size={21} /> : <Eye size={21} />}
                        </button>
                      )}
                    </div>
                    <FieldError name={name} errors={errors} />
                  </div>
                );
              })}
              <p className="register-hint" id="register-password-hint">
                Mật khẩu có ít nhất 8 ký tự.
              </p>
            </fieldset>

            {role === 'teacher' && (
              <fieldset className="register-fields register-teacher-fields" disabled={loading}>
                <legend className="register-sr-only">Thông tin giảng dạy</legend>
                {teacherFields.map(({ name, label, options }, index) => {
                  const Icon = teacherIcons[index];
                  return (
                    <div className="register-field" key={name}>
                      <label htmlFor={`register-${name}`} className="register-sr-only">
                        {label}
                      </label>
                      <div
                        className={`register-control register-control--select ${errors[name] ? 'is-invalid' : ''}`}
                      >
                        <Icon size={21} strokeWidth={1.8} aria-hidden="true" />
                        <select
                          id={`register-${name}`}
                          name={name}
                          value={form[name]}
                          onChange={updateField}
                          required
                          aria-invalid={Boolean(errors[name])}
                          aria-describedby={errors[name] ? `register-${name}-error` : undefined}
                        >
                          <option value="" disabled>
                            {label}
                          </option>
                          {options.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={18}
                          aria-hidden="true"
                          className="register-select-chevron"
                        />
                      </div>
                      <FieldError name={name} errors={errors} />
                    </div>
                  );
                })}
                {[
                  {
                    name: 'biography',
                    label: 'Mô tả bản thân',
                    placeholder: 'Giới thiệu về bạn, phong cách giảng dạy, điểm mạnh...',
                    maxLength: 500,
                  },
                  {
                    name: 'workExperience',
                    label: 'Kinh nghiệm làm việc',
                    placeholder: 'Chia sẻ kinh nghiệm giảng dạy, thành tích, nơi từng công tác...',
                    maxLength: 1000,
                  },
                ].map(({ name, label, placeholder, maxLength }) => (
                  <div className="register-control register-control--textarea" key={name}>
                    <FileText size={21} strokeWidth={1.8} aria-hidden="true" />
                    <div className="register-textarea-body">
                      <label htmlFor={`register-${name}`}>
                        {label} <span>(không bắt buộc)</span>
                      </label>
                      <textarea
                        id={`register-${name}`}
                        name={name}
                        placeholder={placeholder}
                        value={form[name]}
                        onChange={updateField}
                        maxLength={maxLength}
                        rows={2}
                        aria-describedby={`register-${name}-count`}
                      />
                      <span className="register-count" id={`register-${name}-count`}>
                        {form[name].length}/{maxLength}
                      </span>
                    </div>
                  </div>
                ))}
              </fieldset>
            )}

            {formError && (
              <p className="register-alert" role="alert">
                {formError}
              </p>
            )}
            <button type="submit" className="register-submit" disabled={loading}>
              {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
            </button>
          </form>
          <p className="register-login-copy">
            Đã có tài khoản? <Link to={ROUTES.LOGIN}>Đăng nhập ngay</Link>
          </p>
        </section>

        <aside className="register-hero" aria-label="Lợi ích khi tham gia EduMatch">
          <div className="register-hero__content">
            <h2>
              Tham gia <strong>EduMatch</strong>
              <br />
              ngay hôm nay
            </h2>
            <ul className="register-benefits">
              {content.benefits.map(({ icon: Icon, text }) => (
                <li key={text}>
                  <span className="register-benefit-icon">
                    <Icon size={26} strokeWidth={1.9} aria-hidden="true" />
                  </span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="register-hero__photo">
            <img
              src={registerImage}
              alt="Học viên mỉm cười bên laptop và vở ghi chép"
              width="1200"
              height="900"
              fetchPriority="high"
            />
          </div>
        </aside>
      </div>
    </main>
  );
}

export default Register;
