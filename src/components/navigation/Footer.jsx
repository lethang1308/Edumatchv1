import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, BookOpen, GraduationCap, Mail, MessageCircle } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

export const Footer = () => {
  const [, setParams] = useSearchParams();
  const openDialog = (name) =>
    setParams((current) => {
      current.set('dialog', name);
      return current;
    });
  return (
    <footer className="edu-footer">
      <div className="edu-container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to={ROUTES.HOME} className="edu-brand">
              <span className="brand-symbol">
                E<span />
              </span>
              <span>
                Edu<span className="accent-text">Match</span>
              </span>
            </Link>
            <p>
              Kết nối tri thức, nuôi dưỡng tiềm năng.
              <br />
              Người thầy phù hợp cho mỗi hành trình.
            </p>
            <div className="footer-socials">
              <button onClick={() => openDialog('support')} aria-label="Trò chuyện hỗ trợ">
                <MessageCircle size={18} />
              </button>
              <button onClick={() => openDialog('consultation')} aria-label="Tư vấn học tập">
                <GraduationCap size={19} />
              </button>
              <a href="#mon-hoc" aria-label="Khám phá môn học">
                <BookOpen size={18} />
              </a>
            </div>
          </div>
          <div>
            <h3>Dành cho Học viên</h3>
            <a href="#tim-gia-su">Tìm gia sư phù hợp</a>
            <button onClick={() => openDialog('consultation')}>Tư vấn lộ trình học tập</button>
            <a href="#danh-gia">Câu chuyện học viên</a>
            <button onClick={() => openDialog('faq')}>Câu hỏi thường gặp</button>
          </div>
          <div>
            <h3>Dành cho Giáo viên</h3>
            <button onClick={() => openDialog('teacher')}>Trở thành giáo viên</button>
            <a href="#cach-hoat-dong">Cách EduMatch hoạt động</a>
            <button onClick={() => openDialog('terms')}>Hướng dẫn sử dụng</button>
            <Link to={ROUTES.LOGIN}>Đăng nhập tài khoản</Link>
          </div>
          <div className="footer-contact">
            <h3>Chúng tôi luôn sẵn sàng</h3>
            <p>Cùng bạn tìm ra cách học phù hợp.</p>
            <button className="footer-support" onClick={() => openDialog('support')}>
              <Mail size={17} />
              Kết nối với EduMatch
              <ArrowUpRight size={16} />
            </button>
            <span>Học tập tốt hơn, mỗi ngày.</span>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} EduMatch. Kết nối để cùng tiến bộ.</p>
          <div>
            <button onClick={() => openDialog('terms')}>Điều khoản sử dụng</button>
            <button onClick={() => openDialog('privacy')}>Chính sách bảo mật</button>
            <button onClick={() => openDialog('support')}>Liên hệ</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
