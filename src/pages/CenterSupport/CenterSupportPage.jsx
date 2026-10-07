import { useState } from 'react';
import { ArrowLeft, Building2, CheckCircle2, Handshake, PhoneCall, Send, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import './centerSupport.css';

const emptyForm = {
  centerName: '',
  field: '',
  representative: '',
  phone: '',
  note: '',
};

export function CenterSupportPage() {
  const { user } = useAuth();
  const [form, setForm] = useState(() => ({
    ...emptyForm,
    centerName: user?.role === 'center' ? user.name || '' : '',
    phone: user?.role === 'center' ? user.phone || '' : '',
  }));
  const [submitted, setSubmitted] = useState(false);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submit = (event) => {
    event.preventDefault();
    if (!form.centerName.trim() || !form.field.trim() || !form.representative.trim() || !form.phone.trim()) {
      toast.error('Vui lòng hoàn tất các thông tin bắt buộc.');
      return;
    }
    setSubmitted(true);
    toast.success('EduMatch đã ghi nhận yêu cầu tư vấn của Trung tâm.');
  };

  return (
    <section className="center-support">
      <div className="edu-container center-support__container">
        <Link className="center-support__back" to={ROUTES.HOME}>
          <ArrowLeft size={17} /> Về trang chủ
        </Link>

        <header className="center-support__hero">
          <div className="center-support__hero-icon" aria-hidden="true"><Handshake size={30} /></div>
          <p>ĐỒNG HÀNH CÙNG TRUNG TÂM ĐÀO TẠO</p>
          <h1>Hỗ trợ phát triển <span>trung tâm đào tạo</span></h1>
          <div>
            <p>
              Với đội ngũ chuyên gia nhiều năm kinh nghiệm trong lĩnh vực truyền thông, tuyển sinh, quản lý và vận hành trung tâm đào tạo, các chuyên gia EduMatch luôn sẵn sàng hỗ trợ Quý Đối tác.
            </p>
            <p>
              Đội ngũ chuyên viên tại EduMatch sẽ trao đổi trực tiếp cùng quý đối tác để nhận diện vấn đề, đề xuất giải pháp và định hướng phát triển phù hợp, giúp trung tâm nâng cao chất lượng đào tạo và hiệu quả kinh doanh.
            </p>
          </div>
        </header>

        <div className="center-support__layout">
          <section className="center-support__benefits" aria-labelledby="support-benefits-title">
            <h2 id="support-benefits-title">Đồng hành từ vấn đề đến giải pháp</h2>
            <div>
              <article><Building2 size={21} aria-hidden="true" /><h3>Hiểu đúng thực trạng</h3><p>Cùng rà soát hoạt động tuyển sinh, đào tạo, quản lý và vận hành của trung tâm.</p></article>
              <article><Target size={21} aria-hidden="true" /><h3>Định hướng phát triển</h3><p>Xây dựng giải pháp phù hợp với nguồn lực, mục tiêu và giai đoạn phát triển hiện tại.</p></article>
              <article><PhoneCall size={21} aria-hidden="true" /><h3>Trao đổi trực tiếp</h3><p>Kết nối cùng đội ngũ EduMatch để làm rõ nhu cầu và thống nhất bước triển khai tiếp theo.</p></article>
            </div>
          </section>

          <section className="center-support__form-card" aria-labelledby="support-form-title">
            <div className="center-support__form-heading">
              <span><Send size={18} /></span>
              <div><h2 id="support-form-title">Đăng ký nhận tư vấn</h2><p>Thông tin của Quý Trung tâm được dùng để đội ngũ EduMatch liên hệ hỗ trợ.</p></div>
            </div>
            {submitted ? (
              <div className="center-support__success" role="status"><CheckCircle2 size={30} /><h3>Yêu cầu đã được gửi</h3><p>EduMatch sẽ liên hệ với người đại diện theo số điện thoại đã đăng ký.</p><button type="button" onClick={() => setSubmitted(false)}>Gửi một yêu cầu khác</button></div>
            ) : (
              <form onSubmit={submit} noValidate>
                <label><span>Tên trung tâm <i>*</i></span><input name="centerName" value={form.centerName} onChange={updateField} placeholder="Nhập tên trung tâm" autoComplete="organization" /></label>
                <label><span>Lĩnh vực đào tạo <i>*</i></span><input name="field" value={form.field} onChange={updateField} placeholder="Ví dụ: Ngoại ngữ, kỹ năng, luyện thi" /></label>
                <label><span>Tên người đại diện trao đổi <i>*</i></span><input name="representative" value={form.representative} onChange={updateField} placeholder="Họ và tên người liên hệ" autoComplete="name" /></label>
                <label><span>Số điện thoại liên hệ <i>*</i></span><input name="phone" value={form.phone} onChange={updateField} placeholder="Nhập số điện thoại" inputMode="tel" autoComplete="tel" /></label>
                <label className="center-support__note"><span>Vấn đề cần hỗ trợ</span><textarea name="note" value={form.note} onChange={updateField} rows="4" placeholder="Hãy chia sẻ ngắn gọn nhu cầu hoặc vấn đề Trung tâm đang cần hỗ trợ..." /></label>
                <button type="submit"><Send size={17} /> Gửi yêu cầu tư vấn</button>
              </form>
            )}
          </section>
        </div>
      </div>
    </section>
  );
}

export default CenterSupportPage;
