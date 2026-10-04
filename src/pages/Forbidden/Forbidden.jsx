import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { ROUTES } from '@/constants/routes';

export const Forbidden = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-6 shadow-inner">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <div className="text-6xl font-black text-slate-800 tracking-tight mb-2">403</div>
      <h1 className="text-xl font-bold text-slate-900 mb-2">Truy cập bị từ chối</h1>
      <p className="text-sm text-slate-500 max-w-sm mb-8 leading-relaxed">
        Bạn không có quyền hạn cần thiết để truy cập tài nguyên này. Vui lòng liên hệ quản trị viên.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          variant="outline"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate(-1)}
        >
          Quay lại
        </Button>
        <Button
          variant="primary"
          leftIcon={<Home className="w-4 h-4" />}
          onClick={() => navigate(ROUTES.HOME)}
        >
          Về trang chủ
        </Button>
      </div>
    </div>
  );
};

export default Forbidden;
