import { useState } from 'react';
import { CheckCircle2, Heart, MessageCircle, ShieldCheck, Star } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import './studentWelcome.css';

export function StudentWelcomePage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState(false);

  if (!isAuthenticated || user?.role !== 'student') return <Navigate to={ROUTES.HOME} replace />;

  return (
    <section className="student-welcome">
      <div className="student-welcome__card">
        <span className="student-welcome__icon"><ShieldCheck size={30} /></span>
        <p className="student-welcome__eyebrow">CHÀO MỪNG ĐẾN VỚI EDUMATCH</p>
        <h1>Cảm ơn bạn đã <em>tin tưởng tham gia</em></h1>
        <p className="student-welcome__lead">
          EduMatch hướng đến một môi trường giáo dục <strong>an toàn, minh bạch và hiệu quả</strong> cho mọi học viên, giáo viên và trung tâm đào tạo.
        </p>
        <div className="student-welcome__contribution">
          <h2>Tiếng nói của bạn tạo nên cộng đồng tốt hơn</h2>
          <p>
            Mỗi đánh giá, cảm nhận, lượt tin tưởng giáo viên và bài review về trung tâm đào tạo của bạn đều là một đóng góp quan trọng cho cộng đồng. Dù trải nghiệm khóa học tốt hay chưa như mong đợi, hãy luôn chia sẻ ý kiến một cách chân thành và tôn trọng trong các mục đánh giá.
          </p>
          <ul>
            <li><Star size={17} /> Đánh giá trải nghiệm học tập rõ ràng</li>
            <li><Heart size={17} /> Ghi nhận những giáo viên bạn tin tưởng</li>
            <li><MessageCircle size={17} /> Chia sẻ review để hỗ trợ người học tiếp theo</li>
          </ul>
        </div>
        <label className="student-welcome__consent">
          <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} />
          <span>Tôi đồng ý cùng EduMatch xây dựng cộng đồng học tập an toàn, minh bạch và hiệu quả.</span>
        </label>
        <button type="button" disabled={!accepted} onClick={() => navigate(ROUTES.HOME, { replace: true })}>
          <CheckCircle2 size={18} /> Bắt đầu trải nghiệm
        </button>
      </div>
    </section>
  );
}

export default StudentWelcomePage;
