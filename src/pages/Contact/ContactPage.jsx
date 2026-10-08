import { ArrowLeft, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import './contact.css';

const contactChannels = [
  { icon: MapPin, label: 'Địa chỉ', value: '223 Quan Hoa, Cầu Giấy, Hà Nội, Việt Nam' },
  { icon: Phone, label: 'Hotline hỗ trợ học viên', value: '19001345', href: 'tel:19001345' },
  { icon: Phone, label: 'Hotline giáo viên và đối tác', value: '19001234', href: 'tel:19001234' },
  { icon: MessageCircle, label: 'Zalo', value: '0948927633', href: 'https://zalo.me/0948927633' },
  { icon: Mail, label: 'Email', value: 'EduMatch.edu.vn' },
];

export function ContactPage() {
  return (
    <section className="contact-page">
      <div className="edu-container contact-page__container">
        <Link className="contact-page__back" to={ROUTES.HOME}>
          <ArrowLeft size={17} /> Về trang chủ
        </Link>
        <header className="contact-page__hero">
          <span>LIÊN HỆ EDUMATCH</span>
          <h1>Kết nối với đội ngũ <em>EduMatch</em></h1>
          <p>
            EduMatch là nền tảng kết nối giữa học viên với giáo viên và trung tâm đào tạo uy tín. Chúng tôi luôn hướng tới một môi trường giáo dục <strong>an toàn, minh bạch và hiệu quả</strong>, mỗi lựa chọn học tập luôn minh bạch và đầy đủ thông tin. EduMatch xuất hiện để đồng hành và bảo vệ quý học viên/giáo viên và các đơn vị đối tác
          </p>
        </header>
        <div className="contact-page__content">
          <section className="contact-page__intro" aria-labelledby="contact-intro-title">
            <h2 id="contact-intro-title">Đội ngũ EduMatch luôn sẵn sàng hỗ trợ</h2>
            <p>
              Đội ngũ EduMatch sẵn sàng tiếp nhận nhu cầu, giải đáp thông tin và kết nối bạn với giải pháp học tập hoặc cơ hội hợp tác phù hợp. An toàn trong kết nối, minh bạch trong thông tin và hiệu quả trong học tập là ba tiêu chí chúng tôi theo đuổi mỗi ngày.
            </p>
          </section>
          <section className="contact-page__channels" aria-label="Thông tin liên hệ EduMatch">
            {contactChannels.map(({ icon: Icon, label, value, href }) => (
              <article key={label}>
                <span><Icon size={20} /></span>
                <div>
                  <h2>{label}</h2>
                  {href ? <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noreferrer' : undefined}>{value}</a> : <p>{value}</p>}
                </div>
              </article>
            ))}
          </section>
        </div>
      </div>
    </section>
  );
}

export default ContactPage;
