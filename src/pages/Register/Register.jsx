import { useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { ROUTES } from '@/constants/routes';
import { authService } from '@/services/authService';
import {
  accountFields,
  buildRegistrationPayload,
  centerAccountFields,
  centerFields,
  getTodayDate,
  initialForm,
  registrationRoles,
  roleContent,
  teacherFields,
  validateRegistration,
} from './registerData';
import registerImage from '@/assets/register-student.webp';
import './register.css';

function FieldError({ name, errors }) {
  return errors[name] ? (
    <p id={`register-${name}-error`} className="register-field__error">
      {errors[name]}
    </p>
  ) : null;
}

function ProfileField({ field, form, errors, onChange }) {
  const { name, label, placeholder, icon: Icon, multiline, maxLength } = field;
  const describedBy = [
    errors[name] && `register-${name}-error`,
    multiline && `register-${name}-count`,
  ]
    .filter(Boolean)
    .join(' ');
  const sharedProps = {
    id: `register-${name}`,
    name,
    placeholder,
    value: form[name],
    onChange,
    maxLength,
    required: true,
    'aria-invalid': Boolean(errors[name]),
    'aria-describedby': describedBy || undefined,
  };
  return (
    <div className="register-field">
      <label htmlFor={`register-${name}`} className="register-field-label">
        {label} <span aria-hidden="true">*</span>
      </label>
      <div
        className={`register-control ${multiline ? 'register-control--textarea' : ''} ${errors[name] ? 'is-invalid' : ''}`}
      >
        <Icon size={21} strokeWidth={1.8} aria-hidden="true" />
        {multiline ? (
          <div className="register-textarea-body">
            <textarea {...sharedProps} rows={3} />
            <span className="register-count" id={`register-${name}-count`}>
              {form[name].length}/{maxLength}
            </span>
          </div>
        ) : (
          <input {...sharedProps} type="text" />
        )}
      </div>
      <FieldError name={name} errors={errors} />
    </div>
  );
}

export function Register() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedRole = searchParams.get('role');
  const role = registrationRoles.some(({ value }) => value === requestedRole)
    ? requestedRole
    : 'student';
  const [form, setForm] = useState(initialForm);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const formRef = useRef(null);
  const content = roleContent[role];
  const fields = role === 'center' ? centerAccountFields : accountFields;
  const today = getTodayDate();

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setFormError('');
  };

  const changeRole = (nextRole) => {
    setSearchParams(nextRole === 'student' ? {} : { role: nextRole }, { replace: true });
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
    const data = buildRegistrationPayload(form, role);
    try {
      const result = await authService.register(data);
      if (result?.success === false)
        throw new Error(result.message || 'Chưa thể tạo tài khoản. Vui lòng thử lại.');
      toast.success('Tạo tài khoản thành công. Bạn có thể đăng nhập ngay.');
      navigate(ROUTES.LOGIN, {
        state: { registeredIdentifier: data.email || data.phone },
        replace: true,
      });
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
            {registrationRoles.map(({ value, label, accessibleLabel, icon: Icon }) => (
              <label key={value} className={`register-role ${role === value ? 'is-selected' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value={value}
                  aria-label={accessibleLabel}
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
              {fields.map(
                ({
                  name,
                  label,
                  placeholder,
                  icon: Icon,
                  type = 'text',
                  autoComplete,
                  maxLength,
                  showLabel,
                }) => {
                  const isPassword = name === 'password' || name === 'confirmPassword';
                  return (
                    <div className="register-field" key={name}>
                      <label
                        htmlFor={`register-${name}`}
                        className={
                          role === 'center' || showLabel
                            ? 'register-field-label'
                            : 'register-sr-only'
                        }
                      >
                        {label}{' '}
                        {(role === 'center' || showLabel) && <span aria-hidden="true">*</span>}
                      </label>
                      <div className={`register-control ${errors[name] ? 'is-invalid' : ''}`}>
                        <Icon size={21} strokeWidth={1.8} aria-hidden="true" />
                        <input
                          id={`register-${name}`}
                          name={name}
                          type={isPassword ? (visiblePasswords[name] ? 'text' : 'password') : type}
                          autoComplete={autoComplete}
                          placeholder={placeholder || label}
                          value={form[name]}
                          onChange={updateField}
                          required
                          maxLength={isPassword ? 128 : maxLength}
                          max={type === 'date' ? today : undefined}
                          lang={type === 'date' ? 'vi' : undefined}
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
                }
              )}
              <p className="register-hint" id="register-password-hint">
                Mật khẩu có ít nhất 8 ký tự.
              </p>
            </fieldset>

            {(role === 'teacher' || role === 'center') && (
              <fieldset className="register-fields register-profile-fields" disabled={loading}>
                <legend className="register-sr-only">
                  {role === 'teacher'
                    ? 'Thông tin dành cho giáo viên'
                    : 'Thông tin trung tâm đào tạo'}
                </legend>
                <div className="register-profile-heading">
                  <h2>
                    {role === 'teacher'
                      ? 'Thông tin dành cho giáo viên'
                      : 'Thông tin trung tâm đào tạo'}
                  </h2>
                  <p>
                    {role === 'teacher'
                      ? 'Hoàn thiện hồ sơ chuyên môn để học viên hiểu hơn về bạn.'
                      : 'Giới thiệu ngắn gọn để học viên hiểu rõ hơn về đơn vị của bạn.'}
                  </p>
                </div>
                {(role === 'teacher' ? teacherFields : centerFields).map((field) => (
                  <ProfileField
                    key={field.name}
                    field={field}
                    form={form}
                    errors={errors}
                    onChange={updateField}
                  />
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
