import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Layers, Menu, X, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { APP_CONFIG } from '@/config/app';
import { Button } from '@/components/common/Button';

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand */}
          <Link to={ROUTES.HOME} className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-900 text-lg tracking-tight">
              {APP_CONFIG.name}
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink
              to={ROUTES.HOME}
              className={({ isActive }) =>
                isActive
                  ? 'text-sm font-semibold text-blue-600'
                  : 'text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors'
              }
            >
              Trang chủ
            </NavLink>
            <NavLink
              to={ROUTES.DASHBOARD}
              className={({ isActive }) =>
                isActive
                  ? 'text-sm font-semibold text-blue-600'
                  : 'text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors'
              }
            >
              Bảng điều khiển
            </NavLink>
          </nav>

          {/* Right Action */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-700">{user?.name || 'User'}</span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Đăng xuất
                </Button>
              </div>
            ) : (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<LogIn className="w-4 h-4" />}
                onClick={() => navigate(ROUTES.LOGIN)}
              >
                Đăng nhập
              </Button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2">
          <Link
            to={ROUTES.HOME}
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Trang chủ
          </Link>
          <Link
            to={ROUTES.DASHBOARD}
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Bảng điều khiển
          </Link>
          <div className="pt-2 border-t border-slate-100">
            {isAuthenticated ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
              >
                Đăng xuất ({user?.name})
              </Button>
            ) : (
              <Button
                variant="primary"
                className="w-full"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate(ROUTES.LOGIN);
                }}
              >
                Đăng nhập
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
