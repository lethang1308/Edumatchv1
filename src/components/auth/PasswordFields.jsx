import { useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export function PasswordField({
  label,
  name,
  value,
  onChange,
  error,
  autoComplete = 'new-password',
}) {
  const inputId = useId();
  const [visible, setVisible] = useState(false);
  return (
    <div className="account-field">
      <label htmlFor={inputId}>{label}</label>
      <div className="account-password">
        <input
          id={inputId}
          name={name}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          maxLength={128}
          required
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          aria-label={`${visible ? 'Ẩn' : 'Hiện'} ${label.toLowerCase()}`}
          aria-pressed={visible}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && (
        <small id={`${inputId}-error`} className="account-error">
          {error}
        </small>
      )}
    </div>
  );
}
