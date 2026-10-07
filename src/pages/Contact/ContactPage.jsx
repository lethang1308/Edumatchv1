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
          <h1>Kết nối để cùng <em>tiến bộ</em></h1>
          <p>
            EduMatch là nền tảng kết nối học viên với giáo viên và trung tâm đào tạo uy tín. Chúng tôi mang đến thông tin minh bạch, lựa chọn phù hợp và sự đồng hành thiết thực cho mỗi hành trình học tập.
          </p>
        </header>
        <div className="contact-page__content">
          <section className="contact-page__intro" aria-labelledby="contact-intro-title">
            <h2 id="contact-intro-title">Chúng tôi luôn sẵn sàng lắng nghe</h2>
            <p>
              Đội ngũ EduMatch sẵn sàng tiếp nhận nhu cầu, giải đáp thông tin và kết nối bạn với giải pháp học tập hoặc hợp tác phù hợp.
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
