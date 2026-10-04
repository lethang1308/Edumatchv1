import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { ROUTES } from '@/constants/routes';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 shadow-inner">
        <HelpCircle className="w-8 h-8" />
      </div>

      <div className="text-6xl font-black text-slate-800 tracking-tight mb-2">404</div>
      <h1 className="text-xl font-bold text-slate-900 mb-2">Không tìm thấy trang yêu cầu</h1>
      <p className="text-sm text-slate-500 max-w-sm mb-8 leading-relaxed">
        Đường dẫn bạn đang truy cập có thể đã bị di chuyển, xóa hoặc không tồn tại trên hệ thống.
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

export default NotFound;
