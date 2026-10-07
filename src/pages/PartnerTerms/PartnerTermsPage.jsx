import { ArrowLeft, BadgeCheck, Handshake, Landmark, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import './partnerTerms.css';

const feeItems = [
  {
    title: 'Phí khởi tạo khóa học',
    fee: '200.000 VNĐ/lần',
    detail: 'Thanh toán một lần cho mỗi khóa học được Giáo viên đăng ký và thiết lập trên nền tảng.',
  },
  {
    title: 'Phí duy trì khóa học',
    fee: '200.000 VNĐ/tháng',
    detail: 'Áp dụng để duy trì hiển thị, quản lý và vận hành khóa học trên EduMatch.',
  },
];

export function PartnerTermsPage() {
  return (
    <section className="partner-terms">
      <div className="edu-container partner-terms__container">
        <Link className="partner-terms__back" to={ROUTES.HOME}>
          <ArrowLeft size={17} /> Về trang chủ
        </Link>

        <header className="partner-terms__hero">
          <div className="partner-terms__hero-icon" aria-hidden="true"><Handshake size={29} /></div>
          <p>ĐỒNG HÀNH CÙNG EDUMATCH</p>
          <h1>Điều khoản dành cho<br /><span>Giáo viên &amp; Đối tác</span></h1>
          <div>
            <p>
              EduMatch trân trọng cảm ơn Quý Giáo viên và Quý Đối tác đã tin tưởng lựa chọn đồng hành cùng chúng tôi.
              Sự hiện diện của Quý vị là nền tảng để cộng đồng học tập trở nên phong phú, tử tế và bền vững hơn mỗi ngày.
            </p>
            <p>
              EduMatch là nền tảng kết nối học tập, tạo cầu nối tin cậy giữa giảng viên và học viên. Chúng tôi luôn nỗ lực
              xây dựng một môi trường giáo dục chuyên nghiệp, minh bạch và lấy chất lượng học tập làm trọng tâm.
            </p>
          </div>
        </header>

        <div className="partner-terms__content">
          <article className="partner-terms__statement">
            <Sparkles size={22} aria-hidden="true" />
            <div>
              <h2>Cam kết giai đoạn khởi nghiệp</h2>
              <p>
                EduMatch là đơn vị khởi nghiệp từ năm 2026, với tinh thần chủ động và quyết tâm phát triển một cộng đồng
                học tập chất lượng. Đến hết ngày 31/12/2026, EduMatch không thu bất kỳ khoản phí nền tảng nào từ học viên,
                giáo viên hoặc đối tác.
              </p>
            </div>
          </article>

          <section className="partner-terms__section">
            <div className="partner-terms__section-heading">
              <Landmark size={21} aria-hidden="true" />
              <div>
                <h2>Chính sách phí từ năm 2027</h2>
                <p>
                  Từ ngày 01/01/2027, EduMatch sẽ áp dụng một khoản phí hợp lý cho việc khởi tạo và duy trì khóa học trên nền tảng.
                </p>
              </div>
            </div>
            <div className="partner-terms__fee-grid">
              {feeItems.map((item) => (
                <article key={item.title} className="partner-terms__fee-item">
                  <h3>{item.title}</h3>
                  <strong>{item.fee}</strong>
                  <p>{item.detail}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="partner-terms__section partner-terms__section--collaboration">
            <div className="partner-terms__section-heading">
              <BadgeCheck size={21} aria-hidden="true" />
              <div>
                <h2>Phương thức hợp tác</h2>
                <p>Chúng tôi tôn trọng quyền chủ động của Giáo viên và Đối tác trong mọi hình thức hợp tác.</p>
              </div>
            </div>
            <div className="partner-terms__collaboration-grid">
              <article>
                <span>01</span>
                <h3>Giáo viên tự kết nối học viên</h3>
                <p>
                  Khi Giáo viên tự đăng bài, chủ động trao đổi và chốt lịch học với học viên, Giáo viên chỉ cần thanh toán phí
                  khởi tạo và phí duy trì khóa học theo chính sách nêu trên.
                </p>
              </article>
              <article>
                <span>02</span>
                <h3>EduMatch giới thiệu học viên</h3>
                <p>
                  Với học viên do EduMatch chủ động kết nối đến Giáo viên hoặc Đối tác, mức hoa hồng sẽ được thỏa thuận trước,
                  thông thường từ 15% đến 20% tổng học phí của khóa học.
                </p>
              </article>
            </div>
            <p className="partner-terms__notice">
              Giáo viên hoặc Đối tác có toàn quyền đồng ý tiếp nhận hoặc từ chối học viên được giới thiệu trước khi việc sắp xếp lớp học bắt đầu.
            </p>
          </section>
        </div>

        <footer className="partner-terms__closing">
          <p>Chính sách tính phí sẽ được điều chỉnh theo thời gian. Chúng tôi luôn nỗ lực để tìm ra chính sách phù hợp, có lợi cho Quý Thầy Cô và các đơn vị đối tác.</p>
          <h2>Trân trọng sự đồng hành của Quý Giáo viên và Quý Đối tác.</h2>
          <p>EduMatch cam kết lắng nghe, hoàn thiện từng ngày và cùng Quý vị kiến tạo một cộng đồng học tập đáng tin cậy.</p>
          <Link to={ROUTES.HOME}>Khám phá EduMatch</Link>
        </footer>
      </div>
    </section>
  );
}

export default PartnerTermsPage;
