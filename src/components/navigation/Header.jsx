import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  GraduationCap,
  Menu,
  MessageCircle,
  Moon,
  Phone,
  Search,
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
  const isEducationProvider = isAuthenticated && ['teacher', 'center'].includes(user?.role);
  const isCenterAccount = isAuthenticated && user?.role === 'center';
  const teachingDestination = isEducationProvider ? ROUTES.CREATE_COURSE : ROUTES.REGISTER;
  const teachingLabel = isEducationProvider ? 'Thêm khóa học' : 'Đăng ký dạy';
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
      <a className="skip-link" href="#tim-khoa-hoc">
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
          <a href="#tim-khoa-hoc">
            <GraduationCap size={16} />
            Tìm kiếm lớp học
          </a>
          <Link to={teachingDestination}>{teachingLabel}</Link>
          {isCenterAccount ? (
            <Link className="consultation-nav" to={ROUTES.CENTER_SUPPORT}>
              <Phone size={14} />
              Tư vấn miễn phí
            </Link>
          ) : (
            <button className="consultation-nav" onClick={() => openDialog('consultation')}>
              <Phone size={14} />
              Tư vấn miễn phí
            </button>
          )}
          {isAuthenticated && (
            <Link to={ROUTES.MESSAGES} className="teacher-action-link">
              <MessageCircle size={15} /> Tin nhắn
            </Link>
          )}
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
              <Link to={ROUTES.TEACHER_PROFILE(user.id)} className="user-name user-profile-link" title="Đi đến trang cá nhân">
                {user?.name}
              </Link>
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
              <Link to={ROUTES.REGISTER} className="edu-button register-button">
                Đăng ký
                <ArrowRight size={14} />
              </Link>
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
          <a href="#tim-khoa-hoc" onClick={() => setMobileMenuOpen(false)}>
            Tìm kiếm lớp học
          </a>
          <Link to={teachingDestination} onClick={() => setMobileMenuOpen(false)}>{teachingLabel}</Link>
          {isCenterAccount ? (
            <Link to={ROUTES.CENTER_SUPPORT} onClick={() => setMobileMenuOpen(false)}>Tư vấn miễn phí</Link>
          ) : (
            <button onClick={() => openDialog('consultation')}>Tư vấn miễn phí</button>
          )}
          {isAuthenticated && <Link to={ROUTES.MESSAGES} onClick={() => setMobileMenuOpen(false)}>Tin nhắn</Link>}
          {isAuthenticated && <Link to={ROUTES.TEACHER_PROFILE(user.id)} onClick={() => setMobileMenuOpen(false)}>Trang cá nhân</Link>}
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
            <>
              <Link to={ROUTES.LOGIN} onClick={() => setMobileMenuOpen(false)}>Đăng nhập</Link>
              <Link to={ROUTES.REGISTER} onClick={() => setMobileMenuOpen(false)}>Đăng ký</Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
};

export default Header;
