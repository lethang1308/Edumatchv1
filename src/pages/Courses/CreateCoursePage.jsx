import { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, MapPin, Monitor, PlusCircle, Video } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { getAge, getCourse, saveCourse, updateCourse } from '@/features/learning/marketplace';
import { AdministrativePicker } from '@/components/forms/AdministrativePicker';
import { administrativeProvinces, getAdministrativeWards } from '@/data/administrativeUnits';
import './courses.css';

const emptyForm = {
  title: '', description: '', price: '', paymentType: 'full-course', sessions: '', duration: '',
  sessionsPerWeek: '', schedule: '', learningMode: 'online', inPersonType: 'classroom', enrollmentStatus: 'open', province: '', ward: '',
};

const parseVnd = (value) => Number(String(value).replace(/[^\d]/g, ''));

export function CreateCoursePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editingCourseId = searchParams.get('edit');
  const editingCourse = editingCourseId ? getCourse(editingCourseId) : null;
  const isEditing = Boolean(editingCourse);
  const [form, setForm] = useState(() => isEditing ? { ...emptyForm, ...editingCourse } : emptyForm);
  const [errors, setErrors] = useState({});
  const summary = useMemo(() => ({
    name: user?.name || 'Giáo viên EduMatch', dob: user?.dob, qualifications: user?.qualifications || 'Đang cập nhật',
    experience: user?.experience || 'Đang cập nhật', bio: user?.bio || 'Đang cập nhật',
  }), [user]);
  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => {
      if (name === 'learningMode' && value === 'recorded') return { ...current, learningMode: value, paymentType: 'full-course' };
      if (name === 'paymentType' && current.learningMode === 'recorded') return current;
      return { ...current, [name]: value };
    });
  };
  const wardOptions = useMemo(() => getAdministrativeWards(form.province), [form.province]);
  const selectLocation = (name) => (value) => setForm((current) => ({
    ...current,
    [name]: value,
    ...(name === 'province' ? { ward: '' } : {}),
  }));
  const submit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    ['title', 'description'].forEach((name) => { if (!String(form[name]).trim()) nextErrors[name] = 'Vui lòng điền thông tin này'; });
    const price = parseVnd(form.price);
    if (form.price && (!Number.isFinite(price) || price <= 0)) nextErrors.price = 'Học phí cần lớn hơn 0';
    const paymentType = form.learningMode === 'recorded' ? 'full-course' : form.paymentType;
    if (paymentType === 'full-course' && !form.sessions) nextErrors.sessions = 'Nhập số buổi học';
    if (paymentType === 'full-course' && !form.duration) nextErrors.duration = 'Nhập thời lượng mỗi buổi';
    if (paymentType === 'monthly' && !form.sessionsPerWeek) nextErrors.sessionsPerWeek = 'Nhập số buổi mỗi tuần';
    if (form.learningMode === 'in-person' && !form.province.trim()) nextErrors.province = 'Vui lòng chọn tỉnh hoặc thành phố';
    if (form.learningMode === 'in-person' && !form.ward.trim()) nextErrors.ward = 'Vui lòng chọn xã, phường hoặc đặc khu';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    const courseData = { ...form, paymentType, price, location: [form.ward, form.province].filter(Boolean).join(', '), teacher: { id: user?.id, ...summary } };
    const course = isEditing
      ? updateCourse(editingCourse.id, courseData)
      : saveCourse({ id: `course-${Date.now()}`, ...courseData, createdAt: new Date().toISOString() });
    toast.success(isEditing ? 'Thông tin khóa học đã được cập nhật.' : 'Khóa học đã được đăng và hiển thị trên trang chủ.');
    navigate(ROUTES.COURSE_DETAIL(course.id));
  };
  if (user?.role !== 'teacher') return <section className="learning-page"><div className="learning-empty"><h1>Khu vực dành cho giáo viên</h1><p>Bạn cần đăng nhập bằng tài khoản giáo viên để tạo khóa học.</p><Link to={ROUTES.HOME}>Về trang chủ</Link></div></section>;
  if (isEditing && editingCourse.teacher?.id !== user?.id) return <section className="learning-page"><div className="learning-empty"><h1>Bạn không thể chỉnh sửa khóa học này</h1><p>Chỉ Giáo viên đã tạo khóa học mới có quyền cập nhật nội dung.</p><Link to={ROUTES.HOME}>Về trang chủ</Link></div></section>;
  return (
    <section className="learning-page">
      <div className="learning-container course-editor">
        <Link className="back-link" to={isEditing ? ROUTES.COURSE_DETAIL(editingCourse.id) : ROUTES.HOME}><ArrowLeft size={17} /> {isEditing ? 'Quay về khóa học' : 'Quay về trang chủ'}</Link>
        <div className="page-intro"><span><PlusCircle size={16} /> {isEditing ? 'CẬP NHẬT KHÓA HỌC' : 'KHÓA HỌC MỚI'}</span><h1>{isEditing ? 'Cập nhật thông tin khóa học.' : 'Thiết kế lớp học rõ ràng, dễ lựa chọn.'}</h1><p>Thông tin này sẽ hiển thị cho học viên khi họ khám phá khóa học của bạn.</p></div>
        <form className="course-form" onSubmit={submit} noValidate>
          <section className="form-surface form-surface--main">
            <div className="form-heading"><h2>Thông tin khóa học</h2><p>Hãy mô tả ngắn gọn giá trị học viên sẽ nhận được.</p></div>
            <Field label="Tên khóa học" error={errors.title}><input name="title" value={form.title} onChange={update} placeholder="Ví dụ: Luyện thi IELTS từ nền tảng đến 6.5" /></Field>
            <Field label="Mô tả khóa học" error={errors.description}><textarea name="description" value={form.description} onChange={update} rows="5" placeholder="Mục tiêu, lộ trình và phương pháp giảng dạy của khóa học..." /></Field>
            <Field label="Mức học phí (VNĐ)" hint="Không bắt buộc" error={errors.price}><input name="price" value={form.price} onChange={update} inputMode="numeric" placeholder="Điền học phí" /></Field>
            <fieldset className="radio-field"><legend>Hình thức đóng học phí</legend><div className="segmented-control">
              {[['full-course','Đóng trọn khóa'],['monthly','Đóng theo tháng'],['session','Đóng theo buổi']].map(([value,label]) => {
                const isLocked = form.learningMode === 'recorded' && value !== 'full-course';
                return <label key={value} className={isLocked ? 'is-disabled' : ''}><input type="radio" name="paymentType" value={value} checked={form.paymentType === value} onChange={update} disabled={isLocked} /><span>{label}</span></label>;
              })}
            </div>{form.learningMode === 'recorded' && <p className="payment-lock-note">Video quay sẵn chỉ hỗ trợ thanh toán trọn khóa.</p>}</fieldset>
            {form.paymentType === 'full-course' && <div className="form-split"><Field label="Số buổi học" error={errors.sessions}><input name="sessions" value={form.sessions} onChange={update} inputMode="numeric" placeholder="Ví dụ: 12" /></Field><Field label="Thời lượng mỗi buổi (phút)" error={errors.duration}><input name="duration" value={form.duration} onChange={update} inputMode="numeric" placeholder="Ví dụ: 90" /></Field></div>}
            {form.paymentType === 'monthly' && <Field label="Số buổi học mỗi tuần" error={errors.sessionsPerWeek}><input name="sessionsPerWeek" value={form.sessionsPerWeek} onChange={update} inputMode="numeric" placeholder="Ví dụ: 2" /></Field>}
            <Field label="Lịch học dự kiến" hint="Không bắt buộc"><textarea name="schedule" value={form.schedule} onChange={update} rows="3" placeholder="Ví dụ: Thứ 3, Thứ 6 từ 19:00 – 20:30" /></Field>
          </section>
          <aside className="form-surface form-surface--side">
            <div className="form-heading"><h2>Hình thức học</h2><p>Giúp học viên xác định lớp học phù hợp.</p></div>
            <div className="learning-mode-options">
              <label className={form.learningMode === 'online' ? 'is-selected' : ''}><input type="radio" name="learningMode" value="online" checked={form.learningMode === 'online'} onChange={update} /><Monitor size={20} /><span><strong>Trực tuyến</strong><small>Học qua nền tảng online</small></span></label>
              <label className={form.learningMode === 'in-person' ? 'is-selected' : ''}><input type="radio" name="learningMode" value="in-person" checked={form.learningMode === 'in-person'} onChange={update} /><MapPin size={20} /><span><strong>Trực tiếp</strong><small>Gặp mặt để học tập</small></span></label>
              <label className={form.learningMode === 'recorded' ? 'is-selected' : ''}><input type="radio" name="learningMode" value="recorded" checked={form.learningMode === 'recorded'} onChange={update} /><Video size={20} /><span><strong>Video quay sẵn</strong><small>Học theo video của khóa</small></span></label>
            </div>
            <fieldset className="radio-field"><legend>Trạng thái tuyển sinh</legend><div className="segmented-control"><label><input type="radio" name="enrollmentStatus" value="open" checked={form.enrollmentStatus === 'open'} onChange={update} /><span>Mở lớp</span></label><label><input type="radio" name="enrollmentStatus" value="closed" checked={form.enrollmentStatus === 'closed'} onChange={update} /><span>Đóng lớp</span></label></div><p className="enrollment-status-note">Lớp đóng vẫn hiển thị, nhưng học viên không thể đăng ký mới.</p></fieldset>
            {form.learningMode === 'in-person' && <>
              <fieldset className="radio-field"><legend>Địa điểm giảng dạy</legend><div className="segmented-control"><label><input type="radio" name="inPersonType" value="classroom" checked={form.inPersonType === 'classroom'} onChange={update} /><span>Dạy tại lớp</span></label><label><input type="radio" name="inPersonType" value="home" checked={form.inPersonType === 'home'} onChange={update} /><span>Dạy tại nhà</span></label></div></fieldset>
              <div className="form-split">
                <div className="form-location-field"><AdministrativePicker id="course-province" label="Tỉnh / Thành phố" value={form.province} options={administrativeProvinces} onSelect={selectLocation('province')} placeholder="Gõ để tìm tỉnh/thành, rồi chọn" />{errors.province && <small className="field-error">{errors.province}</small>}</div>
                <div className="form-location-field"><AdministrativePicker id="course-ward" label={form.inPersonType === 'classroom' ? 'Xã / Phường / Đặc khu có lớp' : 'Xã / Phường / Đặc khu nhận dạy'} value={form.ward} options={wardOptions} onSelect={selectLocation('ward')} placeholder={form.province ? 'Gõ để tìm xã/phường, rồi chọn' : 'Chọn tỉnh/thành trước'} disabled={!form.province} emptyText="Không tìm thấy xã/phường trong tỉnh/thành đã chọn." />{errors.ward && <small className="field-error">{errors.ward}</small>}</div>
              </div>
            </>}
            <div className="teacher-summary"><CheckCircle2 size={19} /><div><strong>Hồ sơ hiển thị cùng khóa học</strong><span>{summary.name} · {getAge(summary.dob)} tuổi</span></div></div>
            <button className="publish-course" type="submit">{isEditing ? 'Lưu thay đổi' : 'Đăng khóa học'}</button>
          </aside>
        </form>
      </div>
    </section>
  );
}

function Field({ label, hint, error, children }) { return <label className="form-field"><span>{label}{hint && <em>{hint}</em>}</span>{children}{error && <small className="field-error">{error}</small>}</label>; }
