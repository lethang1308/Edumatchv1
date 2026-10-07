import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  Bell,
  CheckCheck,
  GraduationCap,
  Heart,
  Info,
  Menu,
  MessageCircle,
  Moon,
  Newspaper,
  Phone,
  Search,
  Sun,
  X,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/common/Button';
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '@/features/learning/marketplace';

const notificationIcon = (type) => {
  if (type === 'post_like' || type === 'profile_like') return <Heart size={15} />;
  if (type === 'post_comment' || type === 'comment_reply' || type === 'course_comment') return <MessageCircle size={15} />;
  return <Info size={15} />;
};

const notificationTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Vừa xong';
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(date);
};

export const Header = ({ theme, onToggleTheme }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const locationKey = `${location.pathname}${location.search}${location.hash}`;
  const [notificationPanel, setNotificationPanel] = useState({ open: false, locationKey: '' });
  const { isAuthenticated, user, logout } = useAuth();
  const [notifications, setNotifications] = useState(() => user?.id ? getNotifications(user.id) : []);
  const isEducationProvider = isAuthenticated && ['teacher', 'center'].includes(user?.role);
  const isCenterAccount = isAuthenticated && user?.role === 'center';
  const teachingDestination = isEducationProvider ? ROUTES.CREATE_COURSE : ROUTES.REGISTER;
  const teachingLabel = isEducationProvider ? 'Thêm khóa học' : 'Đăng ký dạy';
  const unreadNotifications = notifications.filter((notification) => !notification.isRead).length;
  const notificationOpen = notificationPanel.open && notificationPanel.locationKey === locationKey;

  useEffect(() => {
    const refreshNotifications = () => setNotifications(user?.id ? getNotifications(user.id) : []);
    refreshNotifications();
    window.addEventListener('edumatch:notifications-updated', refreshNotifications);
    return () => window.removeEventListener('edumatch:notifications-updated', refreshNotifications);
  }, [user?.id]);

  const openNotification = (notificationId) => {
    markNotificationRead(notificationId);
    setNotificationPanel({ open: false, locationKey });
  };
  const toggleNotifications = () => {
    setNotificationPanel((current) => ({
      open: !(current.open && current.locationKey === locationKey),
      locationKey,
    }));
  };
  const readAllNotifications = () => {
    if (user?.id) markAllNotificationsRead(user.id);
  };
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
          <Link to={ROUTES.FEED}><Newspaper size={16} /> Bảng Tin</Link>
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
          {isAuthenticated && <div className="notification-menu">
            <button
              type="button"
              className="notification-trigger"
              onClick={toggleNotifications}
              aria-label={`Thông báo${unreadNotifications ? `, ${unreadNotifications} chưa đọc` : ''}`}
              aria-expanded={notificationOpen}
            >
              <Bell size={17} />
              {unreadNotifications > 0 && <b>{unreadNotifications > 99 ? '99+' : unreadNotifications}</b>}
            </button>
            {notificationOpen && <section className="notification-popover" aria-label="Danh sách thông báo">
              <header><div><strong>Thông báo</strong><span>{unreadNotifications ? `${unreadNotifications} chưa đọc` : 'Bạn đã đọc tất cả'}</span></div><button type="button" onClick={readAllNotifications} disabled={!unreadNotifications}><CheckCheck size={15} /> Đánh dấu đã đọc</button></header>
              <div className="notification-popover__list">
                {notifications.length ? notifications.slice(0, 8).map((notification) => <Link
                  to={notification.link || ROUTES.HOME}
                  key={notification.id}
                  className={!notification.isRead ? 'is-unread' : ''}
                  onClick={() => openNotification(notification.id)}
                >
                  {notification.actorAvatar ? <img src={notification.actorAvatar} alt="" /> : <span className="notification-type-icon">{notificationIcon(notification.type)}</span>}
                  <div><strong>{notification.title}</strong>{notification.description && <p>{notification.description}</p>}<small>{notificationTime(notification.createdAt)}</small></div>
                  {!notification.isRead && <i aria-label="Chưa đọc" />}
                </Link>) : <div className="notification-popover__empty"><Bell size={21} /><strong>Chưa có thông báo</strong><p>Các cập nhật về bài viết, khóa học và hoạt động sẽ hiển thị tại đây.</p></div>}
              </div>
            </section>}
          </div>}
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
          <Link to={ROUTES.FEED} onClick={() => setMobileMenuOpen(false)}>Bảng Tin</Link>
          <Link to={teachingDestination} onClick={() => setMobileMenuOpen(false)}>{teachingLabel}</Link>
          {isCenterAccount ? (
            <Link to={ROUTES.CENTER_SUPPORT} onClick={() => setMobileMenuOpen(false)}>Tư vấn miễn phí</Link>
          ) : (
            <button onClick={() => openDialog('consultation')}>Tư vấn miễn phí</button>
          )}
          {isAuthenticated && <Link to={ROUTES.MESSAGES} onClick={() => setMobileMenuOpen(false)}>Tin nhắn</Link>}
          {isAuthenticated && <button onClick={toggleNotifications}>Thông báo{unreadNotifications ? ` (${unreadNotifications})` : ''}</button>}
          {isAuthenticated && notificationOpen && <section className="mobile-notification-panel" aria-label="Danh sách thông báo">
            <header><strong>Thông báo</strong><button type="button" onClick={readAllNotifications} disabled={!unreadNotifications}>Đánh dấu đã đọc</button></header>
            {notifications.length ? notifications.slice(0, 8).map((notification) => <Link
              to={notification.link || ROUTES.HOME}
              key={notification.id}
              className={!notification.isRead ? 'is-unread' : ''}
              onClick={() => openNotification(notification.id)}
            >
              <span className="notification-type-icon">{notification.actorAvatar ? <img src={notification.actorAvatar} alt="" /> : notificationIcon(notification.type)}</span>
              <span><strong>{notification.title}</strong><small>{notificationTime(notification.createdAt)}</small></span>
            </Link>) : <p>Chưa có thông báo nào.</p>}
          </section>}
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
