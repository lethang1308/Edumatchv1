import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  GraduationCap,
  Menu,
  Moon,
  Phone,
  Search,
  ShieldCheck,
  Sun,
  X,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/common/Button';

export const Header = ({ theme, onToggleTheme }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [params, setParams] = useSearchParams();
  const { isAuthenticated, user, logout } = useAuth();
  const openDialog = (name) => {
    setMobileMenuOpen(false);
    setParams((current) => {
      current.set('dialog', name);
      return current;
    });
  };
  const search = (event) => {
    event.preventDefault();
    const value = new FormData(event.currentTarget).get('q').trim();
    setParams((current) => {
      if (value) current.set('q', value);
      else current.delete('q');
      return current;
    });
    setMobileMenuOpen(false);
    document.getElementById('giao-vien')?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
    });
  };

  return (
    <header className="edu-header">
      <a className="skip-link" href="#tim-gia-su">
        Đi đến nội dung chính
      </a>
      <div className="edu-container header-inner">
        <Link to={ROUTES.HOME} className="edu-brand" title="Trang chủ EduMatch">
          <span className="brand-symbol">
            E<span />
          </span>
          <span>
            Edu<span className="accent-text">Match</span>
          </span>
        </Link>
        <form className="header-search" role="search" onSubmit={search}>
          <Search size={16} aria-hidden="true" />
          <input
            key={params.get('q') || ''}
            name="q"
            defaultValue={params.get('q') || ''}
            aria-label="Tìm giáo viên hoặc môn học"
            placeholder="Tìm giáo viên, môn học..."
          />
          <kbd>↵</kbd>
        </form>
        <nav className="desktop-nav" aria-label="Điều hướng chính">
          <a href="#tim-gia-su">
            <GraduationCap size={16} />
            Tìm gia sư
          </a>
          <button onClick={() => openDialog('teacher')}>Đăng ký dạy</button>
          <button className="consultation-nav" onClick={() => openDialog('consultation')}>
            <Phone size={14} />
            Tư vấn miễn phí
          </button>
          <Link to={ROUTES.DASHBOARD} className="admin-nav" title="Bảng điều khiển">
            <ShieldCheck size={14} />
            <span>Quản trị</span>
          </Link>
        </nav>
        <div className="header-auth">
          <button
            className="theme-toggle"
            onClick={onToggleTheme}
            aria-label={
              theme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'
            }
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          {isAuthenticated ? (
            <>
              <span className="user-name">{user?.name}</span>
              <Button
                variant="outline"
                className="edu-button edu-button-outline"
                size="sm"
                onClick={logout}
              >
                Đăng xuất
              </Button>
            </>
          ) : (
            <>
              <Link to={ROUTES.LOGIN} className="login-link">
                Đăng nhập
              </Link>
              <Button
                size="sm"
                className="edu-button register-button"
                onClick={() => openDialog('register')}
              >
                Đăng ký
                <ArrowRight size={14} />
              </Button>
            </>
          )}
        </div>
        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen((current) => !current)}
          aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {mobileMenuOpen && (
        <nav
          id="mobile-navigation"
          className="mobile-navigation"
          aria-label="Điều hướng trên điện thoại"
        >
          <form className="header-search" role="search" onSubmit={search}>
            <Search size={18} />
            <input
              name="q"
              aria-label="Tìm kiếm trên điện thoại"
              placeholder="Tìm giáo viên, môn học..."
            />
            <button type="submit" aria-label="Tìm kiếm">
              <ArrowRight size={19} />
            </button>
          </form>
          <a href="#tim-gia-su" onClick={() => setMobileMenuOpen(false)}>
            Tìm gia sư
          </a>
          <button onClick={() => openDialog('teacher')}>Đăng ký dạy</button>
          <button onClick={() => openDialog('consultation')}>Tư vấn miễn phí</button>
          <Link to={ROUTES.DASHBOARD} onClick={() => setMobileMenuOpen(false)}>
            Quản trị
          </Link>
          {isAuthenticated ? (
            <button
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
            >
              Đăng xuất
            </button>
          ) : (
            <Link to={ROUTES.LOGIN} onClick={() => setMobileMenuOpen(false)}>
              Đăng nhập
            </Link>
          )}
        </nav>
      )}
    </header>
  );
};

export default Header;
