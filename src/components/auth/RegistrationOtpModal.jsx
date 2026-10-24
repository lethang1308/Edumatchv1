import { useEffect, useRef, useState } from 'react';
import { Modal } from '@/components/feedback/Modal';
import { fieldErrors, requestError } from '@/utils/formErrors';
import './account.css';

export function RegistrationOtpModal({ session, onClose, onConfirm, onResend }) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [resendAt, setResendAt] = useState(session.resendAt);
  const [debugOtp, setDebugOtp] = useState(session.debugOtp);
  const [now, setNow] = useState(Date.now);
  const inputRef = useRef(null);
  const seconds = Math.max(0, Math.ceil((resendAt - now) / 1000));

  useEffect(() => {
    inputRef.current?.focus();
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    if (!/^\d{6}$/.test(otp)) {
      setError('Vui lòng nhập mã OTP gồm đúng 6 chữ số.');
      inputRef.current?.focus();
      return;
    }
    setBusy(true);
    setError('');
    try {
      const result = await onConfirm(otp);
      if (!result?.success) {
        const otpError = result?.errors?.otp;
        setError(
          (Array.isArray(otpError) ? otpError[0] : otpError) ||
            result?.message ||
            'Chưa thể xác thực. Vui lòng thử lại.'
        );
      }
    } catch (failure) {
      setError(fieldErrors(failure).otp || requestError(failure));
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    if (busy || seconds > 0) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const response = await onResend();
      setResendAt(Date.now() + (response.resend_after || 60) * 1000);
      setDebugOtp(response.debug_otp || '');
      setOtp('');
      setNotice('Đã gửi mã mới. Vui lòng sử dụng mã trong email mới nhất.');
      inputRef.current?.focus();
    } catch (failure) {
      if (failure.response?.status === 429) {
        const wait = Number(failure.response.headers?.['retry-after']) || 60;
        setResendAt(Date.now() + wait * 1000);
        setError('Bạn đã yêu cầu quá nhiều lần. Vui lòng chờ trước khi gửi lại.');
      } else {
        const errors = fieldErrors(failure);
        setError(errors.email || errors.phone || requestError(failure));
      }
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
      title="Xác thực Email đăng ký"
      description={`Mã xác thực gồm 6 số đã được gửi đến ${session.payload.email}. Mã có hiệu lực 10 phút.`}
    >
      <form className="account-form" onSubmit={submit} noValidate aria-busy={busy}>
        <p className="account-notice">
          Kiểm tra hộp thư đến hoặc thư rác. Tài khoản sẽ được tạo sau khi xác thực thành công.
        </p>
        {notice && (
          <p className="account-notice" role="status">
            {notice}
          </p>
        )}
        {debugOtp && (
          <p className="account-debug">
            Môi trường local/test — mã kiểm thử: <strong>{debugOtp}</strong>
          </p>
        )}
        <label className="account-field registration-otp-field">
          <span>Mã OTP 6 số</span>
          <input
            ref={inputRef}
            name="otp"
            value={otp}
            onChange={(event) => {
              setOtp(event.target.value.replace(/\D/g, '').slice(0, 6));
              setError('');
            }}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            required
            disabled={busy}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'registration-otp-error' : undefined}
            className="registration-otp-input"
          />
          {error && (
            <small id="registration-otp-error" className="account-error" role="alert">
              {error}
            </small>
          )}
        </label>
        <div className="account-actions registration-otp-resend">
          <span>{seconds > 0 ? `Gửi lại mã sau ${seconds}s` : 'Chưa nhận được mã?'}</span>
          <button
            type="button"
            className="account-secondary"
            disabled={busy || seconds > 0}
            onClick={resend}
          >
            Gửi lại mã OTP
          </button>
        </div>
        <div className="account-actions">
          <button type="button" className="account-secondary" disabled={busy} onClick={onClose}>
            Đổi thông tin / Quay lại
          </button>
          <button type="submit" className="account-primary" disabled={busy}>
            {busy ? 'Đang xử lý...' : 'Xác nhận & Hoàn tất đăng ký'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
