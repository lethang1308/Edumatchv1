import { CalendarDays, Clock3, Monitor, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { enrollmentLabel, getCourseRating, modeLabel, paymentLabel } from '@/features/learning/marketplace';

const formatCurrency = (value) =>
  Number(value) > 0 ? `${new Intl.NumberFormat('vi-VN').format(value)}đ` : 'Liên hệ';

export function CourseCard({ course, editable = false }) {
  const rating = getCourseRating(course.id);
  return (
    <article className="course-card">
      <div className="course-card__top">
        <div className="course-card__badges">
          <span className="course-card__mode">{modeLabel(course)}</span>
          <span className={`course-card__status ${course.enrollmentStatus === 'closed' ? 'is-closed' : ''}`}>{enrollmentLabel(course)}</span>
        </div>
        <span className="course-card__rating"><Star size={14} fill="currentColor" /> {rating.total ? `${rating.average.toFixed(1)} · ${rating.total} đánh giá` : 'Mới'}</span>
      </div>
      <h3>{course.title}</h3>
      <div className="course-card__teacher" title={`GV. ${course.teacher.name}`}>
        <span className="course-card__avatar" aria-hidden="true">
          {course.teacher.avatar ? <img src={course.teacher.avatar} alt="" /> : course.teacher.name.slice(0, 1)}
        </span>
        <span>GV. {course.teacher.name}</span>
      </div>
      <p className="course-card__description">{course.description}</p>
      <div className="course-card__facts">
        <span><CalendarDays size={15} /> {paymentLabel(course.paymentType)}</span>
        {course.sessions && <span><Clock3 size={15} /> {course.sessions} buổi</span>}
        <span><Monitor size={15} /> {modeLabel(course)}</span>
      </div>
      <div className="course-card__bottom">
        <strong>{formatCurrency(course.price)}</strong>
        <div className="course-card__actions">
          {editable && <Link className="course-card__edit" to={`${ROUTES.CREATE_COURSE}?edit=${course.id}`}>Chỉnh sửa</Link>}
          <Link to={ROUTES.COURSE_DETAIL(course.id)}>Xem chi tiết <span aria-hidden="true">→</span></Link>
        </div>
      </div>
    </article>
  );
}
