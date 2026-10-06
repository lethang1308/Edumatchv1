import { useState } from 'react';
import { ArrowLeft, CalendarDays, Clock3, MessageCircle, Monitor, Send, Star, UserRound, X } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { addCourseReview, createConversationId, getAge, getCourse, getCourseReviews, modeLabel, paymentLabel, saveConversation } from '@/features/learning/marketplace';
import './courses.css';

const formatCurrency = (value) =>
  Number(value) > 0 ? `${new Intl.NumberFormat('vi-VN').format(value)}đ` : 'Liên hệ';

export function CourseDetailPage() {
  const { courseId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [viewerMode] = useLocalStorage(STORAGE_KEYS.VIEW_MODE, 'teacher');
  const [reviews, setReviews] = useState(() => getCourseReviews(courseId));
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('Chào thầy/cô, em muốn trao đổi thêm để sắp xếp lịch học phù hợp ạ.');
  const [showMessage, setShowMessage] = useState(false);
  const course = getCourse(courseId);
  const isStudentView = user?.role !== 'teacher' || viewerMode === 'student';
  const averageRating = reviews.length
    ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length
    : 0;
  if (!course) return <section className="learning-page"><div className="learning-empty"><h1>Không tìm thấy khóa học</h1><p>Khóa học có thể đã được gỡ hoặc đường dẫn không còn hợp lệ.</p><Link to={ROUTES.HOME}>Về trang chủ</Link></div></section>;
  const review = (event) => {
    event.preventDefault();
    if (!isAuthenticated) { toast.error('Vui lòng đăng nhập với tài khoản học viên để đánh giá.'); return; }
    if (!comment.trim()) { toast.error('Hãy viết nhận xét trước khi gửi.'); return; }
    const next = { id: `review-${Date.now()}`, courseId, rating, comment: comment.trim(), author: user.name || 'Học viên EduMatch', createdAt: new Date().toISOString() };
    addCourseReview(next); setReviews((current) => [next, ...current]); setComment(''); toast.success('Cảm ơn đánh giá của bạn!');
  };
  const send = (event) => {
    event.preventDefault();
    if (!isAuthenticated) { toast.error('Vui lòng đăng nhập để nhắn tin với giáo viên.'); return; }
    if (!message.trim()) return;
    saveConversation({ id: createConversationId('conversation'), courseId, teacherId: course.teacher.id, teacherName: course.teacher.name, studentId: user.id, studentName: user.name || 'Học viên EduMatch', senderId: user.id, text: message.trim(), createdAt: 'Vừa xong' });
    setShowMessage(false); toast.success('Tin nhắn đã được gửi đến giáo viên.');
  };
  return <section className="learning-page"><div className="learning-container course-detail">
    <Link className="back-link" to={ROUTES.HOME}><ArrowLeft size={17} /> Tất cả khóa học</Link>
    <div className="course-detail__grid"><article className="course-detail__main">
      <span className="course-detail__eyebrow">{modeLabel(course)} · {paymentLabel(course.paymentType)}</span>
      <h1>{course.title}</h1><p className="course-detail__lead">{course.description}</p>
      <div className="course-stat-grid"><span><CalendarDays size={19} /><strong>{course.paymentType === 'monthly' ? `${course.sessionsPerWeek} buổi/tuần` : course.sessions ? `${course.sessions} buổi học` : 'Linh hoạt'}</strong></span><span><Clock3 size={19} /><strong>{course.duration ? `${course.duration} phút/buổi` : paymentLabel(course.paymentType)}</strong></span><span><Monitor size={19} /><strong>{modeLabel(course)}</strong></span></div>
      {course.schedule && <section className="detail-block"><h2>Lịch học dự kiến</h2><p>{course.schedule}</p></section>}
      {course.learningMode === 'in-person' && <section className="detail-block"><h2>Địa điểm</h2><p>{course.inPersonType === 'home' ? 'Nhận dạy tại ' : 'Lớp học tại '}{course.location}</p></section>}
      <section className="teacher-profile-card"><div className="teacher-profile-card__avatar">{course.teacher.name.slice(0, 1)}</div><div><p>GIÁO VIÊN ĐỒNG HÀNH</p><h2>{course.teacher.name}</h2><span>{getAge(course.teacher.dob)} tuổi · {course.teacher.experience}</span></div><Link to={ROUTES.TEACHER_PROFILE(course.teacher.id)}><UserRound size={16} /> Xem trang cá nhân</Link></section>
      <section className="detail-block"><h2>Hồ sơ chuyên môn</h2><dl className="teacher-data"><div><dt>Bằng cấp, chứng chỉ</dt><dd>{course.teacher.qualifications}</dd></div><div><dt>Giới thiệu</dt><dd>{course.teacher.bio}</dd></div></dl></section>
      <section className="review-section"><div className="detail-block__head"><div><h2>Đánh giá khóa học</h2><p>{reviews.length ? `${reviews.length} nhận xét từ học viên` : 'Hãy là người đầu tiên chia sẻ trải nghiệm.'}</p></div>{reviews.length > 0 && <div className="review-summary"><Star size={18} fill="currentColor" /><strong>{averageRating.toFixed(1)}</strong><span>/ 5 · {reviews.length} đánh giá</span></div>}</div>
        {isStudentView && <form className="review-form" onSubmit={review}><div className="star-picker" aria-label="Chọn số sao">{[1,2,3,4,5].map((value) => <button type="button" key={value} onClick={() => setRating(value)} aria-label={`${value} sao`}><Star size={21} fill={value <= rating ? 'currentColor' : 'none'} /></button>)}</div><textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Chia sẻ trải nghiệm của bạn về khóa học..." rows="3" /><button type="submit">Gửi đánh giá</button></form>}
        <div className="review-list">{reviews.map((item) => <article key={item.id}><div><strong>{item.author}</strong><span>{Array.from({length:item.rating},(_,index)=><Star key={index} size={13} fill="currentColor" />)}</span></div><p>{item.comment}</p></article>)}</div>
      </section>
    </article><aside className="course-enroll-card"><span>HỌC PHÍ</span><strong>{formatCurrency(course.price)}</strong><small>{paymentLabel(course.paymentType)}</small>{isStudentView ? <button onClick={() => setShowMessage(true)}><MessageCircle size={18} /> Đăng ký học</button> : <p>Bạn đang xem với tư cách giáo viên.</p>}<ul><li>Trao đổi trực tiếp với giáo viên</li><li>Thống nhất lịch phù hợp trước khi học</li></ul></aside></div>
    {showMessage && <div className="message-panel" role="dialog" aria-modal="true" aria-label="Nhắn tin với giáo viên"><form className="message-dialog" onSubmit={send}><header className="message-dialog__header"><span className="message-dialog__icon"><MessageCircle size={20} /></span><div><p>NHẮN TIN TRỰC TIẾP</p><h2>Hẹn lịch học</h2></div><button className="message-dialog__close" type="button" onClick={() => setShowMessage(false)} aria-label="Đóng hộp nhắn tin"><X size={19} /></button></header><div className="message-dialog__recipient"><span>{course.teacher.name.slice(0, 1)}</span><div><strong>{course.teacher.name}</strong><small>Giáo viên của khóa học này</small></div><i>Đang hoạt động</i></div><label className="message-dialog__field">Lời nhắn mở đầu<textarea value={message} onChange={(event) => setMessage(event.target.value)} rows="5" /></label><p className="message-dialog__hint">Hai bên sẽ tự trao đổi để thống nhất lịch học phù hợp.</p><div className="message-dialog__actions"><button className="message-dialog__cancel" type="button" onClick={() => setShowMessage(false)}>Để sau</button><button className="message-dialog__send" type="submit"><Send size={17} /> Gửi tin nhắn</button></div></form></div>}
  </div></section>;
}
