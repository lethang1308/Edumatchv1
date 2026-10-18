import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '@/services/authService';
import { fieldErrors, requestError } from '@/utils/formErrors';
import { PasswordField } from '@/components/auth/PasswordFields';
import { validateNewPassword } from '@/utils/passwordValidation';

const blank = { current_password: '', password: '', password_confirmation: '' };

export function SecurityForm() {
  const [form, setForm] = useState(blank);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const change = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setErrors((current) => ({ ...current, [event.target.name]: '' }));
    setMessage('');
  };
  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    const next = validateNewPassword(form);
    if (!form.current_password) next.current_password = 'Vui lòng nhập mật khẩu hiện tại.';
    if (form.password === form.current_password)
      next.password = 'Mật khẩu mới phải khác mật khẩu hiện tại.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    setMessage('');
    try {
      const response = await authService.changePassword(form);
      setForm(blank);
      toast.success(response.message);
      setMessage(response.message);
    } catch (error) {
      setErrors(fieldErrors(error));
      setMessage(requestError(error));
    } finally {
      setBusy(false);
    }
  };
  return (
    <form className="account-form" onSubmit={submit} noValidate>
      <div className="profile-section-heading">
        <ShieldCheck size={23} />
        <div>
          <h2>Bảo mật & đổi mật khẩu</h2>
          <p>Sau khi đổi mật khẩu, các phiên đăng nhập khác sẽ được thu hồi.</p>
        </div>
      </div>
      {message && (
        <p className="account-notice" role="status">
          {message}
        </p>
      )}
      <fieldset disabled={busy}>
        <PasswordField
          label="Mật khẩu hiện tại"
          name="current_password"
          value={form.current_password}
          onChange={change}
          error={errors.current_password}
          autoComplete="current-password"
        />
        <PasswordField
          label="Mật khẩu mới"
          name="password"
          value={form.password}
          onChange={change}
          error={errors.password}
        />
        <PasswordField
          label="Xác nhận mật khẩu mới"
          name="password_confirmation"
          value={form.password_confirmation}
          onChange={change}
          error={errors.password_confirmation}
        />
      </fieldset>
      <p className="profile-helper">
        Sử dụng từ 8 đến 128 ký tự và tránh dùng lại mật khẩu hiện tại.
      </p>
      <div className="account-actions">
        <button className="account-primary" type="submit" disabled={busy}>
          {busy ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
        </button>
      </div>
    </form>
  );
}
