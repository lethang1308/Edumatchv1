import { CalendarDays, Clock3, Monitor, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { getCourseRating, modeLabel, paymentLabel } from '@/features/learning/marketplace';

const formatCurrency = (value) =>
  Number(value) > 0 ? `${new Intl.NumberFormat('vi-VN').format(value)}đ` : 'Liên hệ';

export function CourseCard({ course }) {
  const rating = getCourseRating(course.id);
  return (
    <article className="course-card">
      <div className="course-card__top">
        <span>{modeLabel(course)}</span>
        <span><Star size={14} fill="currentColor" /> {rating.total ? `${rating.average.toFixed(1)} · ${rating.total} đánh giá` : 'Mới'}</span>
      </div>
      <h3>{course.title}</h3>
      <p className="course-card__teacher">Giáo viên đồng hành <strong>{course.teacher.name}</strong></p>
      <p className="course-card__description">{course.description}</p>
      <div className="course-card__facts">
        <span><CalendarDays size={15} /> {paymentLabel(course.paymentType)}</span>
        {course.sessions && <span><Clock3 size={15} /> {course.sessions} buổi</span>}
        <span><Monitor size={15} /> {modeLabel(course)}</span>
      </div>
      <div className="course-card__bottom">
        <strong>{formatCurrency(course.price)}</strong>
        <Link to={ROUTES.COURSE_DETAIL(course.id)}>Xem chi tiết <span aria-hidden="true">→</span></Link>
      </div>
    </article>
  );
}
