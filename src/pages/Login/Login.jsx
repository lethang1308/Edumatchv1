import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/form/Input';
import { Button } from '@/components/common/Button';
import { FormError } from '@/components/form/FormError';
import { ROUTES } from '@/constants/routes';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!email) {
      errs.email = 'Vui lòng nhập địa chỉ email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Email không hợp lệ';
    }

    if (!password) {
      errs.password = 'Vui lòng nhập mật khẩu';
    } else if (password.length < 6) {
      errs.password = 'Mật khẩu phải từ 6 ký tự';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!validate()) return;

    setLoading(true);
    const result = await login({ email, password });
    setLoading(false);

    if (result.success) {
      toast.success('Đăng nhập thành công!');
      const destination = location.state?.from?.pathname || ROUTES.DASHBOARD;
      navigate(destination, { replace: true });
    } else {
      setFormError(result.message || 'Đăng nhập thất bại!');
      toast.error(result.message || 'Đăng nhập thất bại!');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Đăng nhập tài khoản</h2>
        <p className="mt-1 text-sm text-slate-500">
          Sử dụng tài khoản demo để trải nghiệm hệ thống
        </p>
      </div>

      {formError && <FormError message={formError} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Địa chỉ Email"
          name="email"
          type="email"
          placeholder="admin@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
          }}
          error={errors.email}
          leftIcon={<Mail className="w-4 h-4" />}
          required
        />

        <Input
          label="Mật khẩu"
          name="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
          }}
          error={errors.password}
          leftIcon={<Lock className="w-4 h-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
          required
        />

        <Button
          type="submit"
          variant="primary"
          loading={loading}
          rightIcon={<ArrowRight className="w-4 h-4" />}
          className="w-full h-10 mt-2"
        >
          Đăng nhập
        </Button>
      </form>

      <div className="text-center pt-2">
        <Link
          to={ROUTES.HOME}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline"
        >
          ← Quay lại trang chủ
        </Link>
      </div>
    </div>
  );
};

export default Login;
