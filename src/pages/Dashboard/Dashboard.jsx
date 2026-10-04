import React, { useState } from 'react';
import { Users, DollarSign, ShoppingCart, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import { Sidebar } from '@/components/navigation/Sidebar';
import { DashboardHeader } from './DashboardHeader';
import { StatsCard } from './StatsCard';
import { RecentActivity } from './RecentActivity';
import { Modal } from '@/components/feedback/Modal';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/form/Input';
import { cn } from '@/utils/cn';

const mockStats = [
  {
    id: 1,
    title: 'Tổng người dùng',
    value: '2,420',
    change: '+12%',
    isPositive: true,
    icon: Users,
  },
  {
    id: 2,
    title: 'Doanh thu tháng',
    value: '$45,200',
    change: '+8.4%',
    isPositive: true,
    icon: DollarSign,
  },
  {
    id: 3,
    title: 'Đơn hàng mới',
    value: '384',
    change: '-2.1%',
    isPositive: false,
    icon: ShoppingCart,
  },
  {
    id: 4,
    title: 'Tỷ lệ tương tác',
    value: '94.2%',
    change: '+4.3%',
    isPositive: true,
    icon: Activity,
  },
];

const mockActivities = [
  {
    id: 1,
    title: 'Người dùng nguyen.van.a@example.com đăng ký tài khoản mới',
    time: '5 phút trước',
    status: 'Thành công',
    statusVariant: 'success',
  },
  {
    id: 2,
    title: 'Hóa đơn #INV-2041 được thanh toán',
    time: '2 giờ trước',
    status: 'Hoàn tất',
    statusVariant: 'primary',
  },
  {
    id: 3,
    title: 'Cập nhật cấu hình bảo mật API',
    time: '1 ngày trước',
    status: 'Cảnh báo',
    statusVariant: 'warning',
  },
];

export const Dashboard = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Demo Modal & ConfirmDialog
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [sampleInput, setSampleInput] = useState('');

  const handleOpenAction = () => {
    setIsModalOpen(true);
  };

  const handleModalSave = () => {
    setIsModalOpen(false);
    toast.success('Đã lưu dữ liệu mẫu thành công!');
    setSampleInput('');
  };

  const handleDeleteConfirm = () => {
    setIsConfirmOpen(false);
    toast.success('Đã thực hiện xác nhận thao tác thành công!');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={cn(
          'flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out',
          isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        )}
      >
        {/* Mobile Header Toggle */}
        <div className="lg:hidden p-4 bg-white border-b border-slate-200 flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => setIsMobileOpen(true)}>
            Menu
          </Button>
          <span className="font-semibold text-sm">Dashboard</span>
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Dashboard Header with Breadcrumb */}
          <DashboardHeader
            title="Bảng điều khiển tổng quan"
            breadcrumbs={[{ label: 'Dashboard' }]}
            onAction={handleOpenAction}
          />

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockStats.map((stat) => (
              <StatsCard key={stat.id} {...stat} />
            ))}
          </div>

          {/* Grid Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RecentActivity items={mockActivities} />
            </div>

            <div className="space-y-4">
              <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-3">
                <h4 className="font-semibold text-slate-800 text-sm">
                  Kiểm tra Reusable Components
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Các component Modal, ConfirmDialog và Toast đã được tích hợp sẵn sàng để sử dụng.
                </p>
                <div className="flex flex-col gap-2 pt-1">
                  <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)}>
                    Mở Reusable Modal
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => setIsConfirmOpen(true)}>
                    Mở ConfirmDialog
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Demo Reusable Modal */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tạo mới dữ liệu mẫu"
        description="Modal reusable hỗ trợ ESC, click outside và animation."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Huỷ
            </Button>
            <Button variant="primary" size="sm" onClick={handleModalSave}>
              Lưu thay đổi
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Tiêu đề mẫu"
            placeholder="Nhập nội dung mẫu..."
            value={sampleInput}
            onChange={(e) => setSampleInput(e.target.value)}
          />
        </div>
      </Modal>

      {/* Demo Reusable ConfirmDialog */}
      <ConfirmDialog
        open={isConfirmOpen}
        title="Xác nhận thao tác"
        message="Đây là ConfirmDialog component dùng chung cho các hành động xóa, huỷ hoặc logout."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsConfirmOpen(false)}
        confirmText="Xác nhận"
        variant="danger"
      />
    </div>
  );
};

export default Dashboard;
