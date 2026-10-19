import { useState } from 'react';
import toast from 'react-hot-toast';
import { Modal } from '@/components/feedback/Modal';
import { authService } from '@/services/authService';
import { fieldErrors, requestError } from '@/utils/formErrors';
import { PasswordField } from './PasswordFields';
import { validateNewPassword } from '@/utils/passwordValidation';
import './account.css';

export function ForgotPasswordModal({ onClose, onSuccess, initialIdentifier = '' }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    identifier: initialIdentifier,
    otp: '',
    password: '',
    password_confirmation: '',
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [debugOtp, setDebugOtp] = useState('');
  const [busy, setBusy] = useState(false);
  const change = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: name === 'otp' ? value.replace(/\D/g, '').slice(0, 6) : value,
    }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setMessage('');
  };
  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    const next = step === 2 ? validateNewPassword(form) : {};
    if (!form.identifier.trim()) next.identifier = 'Vui lòng nhập email hoặc số điện thoại.';
    if (step === 2 && !/^\d{6}$/.test(form.otp)) next.otp = 'Nhập mã gồm 6 chữ số.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    setMessage('');
    try {
      if (step === 1) {
        const response = await authService.forgotPassword(form.identifier.trim());
        setDebugOtp(response.debug_otp || '');
        setStep(2);
        setMessage(response.message);
      } else {
        await authService.resetPassword({ ...form, identifier: form.identifier.trim() });
        toast.success('Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.');
        onSuccess(form.identifier.trim());
        onClose();
      }
    } catch (error) {
      setErrors(fieldErrors(error));
      setMessage(
        error.response?.status === 429
          ? 'Bạn đã yêu cầu quá nhiều lần. Vui lòng chờ trước khi thử lại.'
          : requestError(error)
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal
      open
      onClose={() => {
        if (!busy) onClose();
      }}
      title={step === 1 ? 'Quên mật khẩu' : 'Đặt lại mật khẩu'}
      description={
        step === 1
          ? 'Nhập email hoặc số điện thoại của tài khoản để nhận mã xác nhận.'
          : `Mã có hiệu lực 15 phút và chỉ được dùng một lần. Tài khoản: ${form.identifier}`
      }
    >
      <form className="account-form" onSubmit={submit} noValidate>
        {message && (
          <p className="account-notice" role="status">
            {message}
          </p>
        )}
        {debugOtp && (
          <p className="account-debug">
            Môi trường local/test — mã kiểm thử: <strong>{debugOtp}</strong>
          </p>
        )}
        <fieldset disabled={busy}>
          {step === 1 ? (
            <label className="account-field">
              <span>Email hoặc số điện thoại</span>
              <input
                name="identifier"
                value={form.identifier}
                onChange={change}
                autoComplete="username"
                maxLength={191}
                required
                aria-invalid={Boolean(errors.identifier)}
              />
              {errors.identifier && <small className="account-error">{errors.identifier}</small>}
            </label>
          ) : (
            <>
              <label className="account-field">
                <span>Mã xác nhận 6 số</span>
                <input
                  name="otp"
                  value={form.otp}
                  onChange={change}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  required
                  aria-invalid={Boolean(errors.otp)}
                />
                {errors.otp && <small className="account-error">{errors.otp}</small>}
              </label>
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
            </>
          )}
        </fieldset>
        <div className="account-actions">
          {step === 2 && (
            <button
              className="account-secondary"
              type="button"
              disabled={busy}
              onClick={() => {
                setStep(1);
                setMessage('');
                setErrors({});
                setDebugOtp('');
                setForm((current) => ({
                  ...current,
                  otp: '',
                  password: '',
                  password_confirmation: '',
                }));
              }}
            >
              Đổi địa chỉ / Gửi lại mã
            </button>
          )}
          <button className="account-primary" type="submit" disabled={busy}>
            {busy ? 'Đang xử lý...' : step === 1 ? 'Gửi mã xác nhận' : 'Đặt lại mật khẩu'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
