import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, LogIn, LayoutDashboard, CheckCircle2, Box, Sparkles } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Container } from '@/components/common/Container';
import { ROUTES } from '@/constants/routes';

export const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="py-12 sm:py-16">
      <Container size="lg" className="space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <Badge variant="primary" dot size="md" className="shadow-sm">
            Starter Template
          </Badge>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            React Base Template
          </h1>

          <p className="text-lg text-slate-600 leading-relaxed">
            Reusable React + Vite starter chuẩn hóa với Tailwind CSS, React Router, Axios, Layouts
            và Reusable Components.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Button
              variant="primary"
              size="lg"
              leftIcon={<LayoutDashboard className="w-5 h-5" />}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => navigate(ROUTES.DASHBOARD)}
            >
              Dashboard
            </Button>

            <Button
              variant="outline"
              size="lg"
              leftIcon={<LogIn className="w-5 h-5" />}
              onClick={() => navigate(ROUTES.LOGIN)}
            >
              Login
            </Button>
          </div>
        </div>

        {/* Features Checklist */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 space-y-2">
              <div className="p-2.5 w-fit rounded-lg bg-blue-50 text-blue-600 mb-3">
                <Box className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-900 text-base">Cấu trúc Chuẩn hóa</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Tổ chức thư mục Clean Architecture: layouts, components, services, routes, hooks,
                utils.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 space-y-2">
              <div className="p-2.5 w-fit rounded-lg bg-emerald-50 text-emerald-600 mb-3">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-900 text-base">Bộ UI Reusable</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Đầy đủ Button, Input, Modal, ConfirmDialog, Table, Pagination, Loading, EmptyState,
                Toast.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 space-y-2">
              <div className="p-2.5 w-fit rounded-lg bg-indigo-50 text-indigo-600 mb-3">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-900 text-base">Sẵn sàng Phát triển</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Chỉ cần clone base, đổi biến môi trường API là có thể code nghiệp vụ ngay lập tức.
              </p>
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  );
};

export default Home;
