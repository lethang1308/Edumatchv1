import { useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  FileCheck2,
  GraduationCap,
  Headphones,
  Heart,
  Laptop,
  LockKeyhole,
  Monitor,
  Phone,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import { BookPlus, CircleUserRound } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/feedback/Modal';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { ROUTES } from '@/constants/routes';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { useAuth } from '@/hooks/useAuth';
import { CourseCard } from '@/components/courses/CourseCard';
import { AdministrativePicker } from '@/components/forms/AdministrativePicker';
import { administrativeProvinces, getAdministrativeWards } from '@/data/administrativeUnits';
import { getCourses } from '@/features/learning/marketplace';
import heroImage from '@/assets/tutoring-hero.webp';
import heroImageMobile from '@/assets/tutoring-hero-720.webp';
import { subjects, tutors, testimonials } from './homeData';
import './home.css';
import '@/components/courses/course.css';

const initialFilters = { subject: '', mode: '', province: '', ward: '', rating: '' };
const currency = (value) => new Intl.NumberFormat('vi-VN').format(value);
const normalize = (text) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase();
const scrollTo = (element, block = 'start') =>
  element?.scrollIntoView({
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    block,
  });

function SectionHeading({ title, description, children }) {
  return (
    <div className="section-heading">
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {children}
    </div>
  );
}

function FilterField({ label, icon: Icon, name, value, onChange, children }) {
  return (
    <label className="filter-field">
      <span>{label}</span>
      <div className="filter-input">
        <Icon size={19} aria-hidden="true" />
        <select id={`${name}-filter`} name={name} value={value} onChange={onChange}>
          {children}
        </select>
        <ChevronDown size={16} aria-hidden="true" />
      </div>
    </label>
  );
}

function SubjectFilterField({ value, onChange }) {
  return (
    <label className="filter-field">
      <span>Môn học / Lĩnh vực</span>
      <div className="filter-input filter-input--search">
        <BookOpen size={19} aria-hidden="true" />
        <input
          id="subject-filter"
          name="subject"
          type="search"
          value={value}
          onChange={onChange}
          list="subject-suggestions"
          placeholder="Nhập môn học hoặc từ khóa"
          autoComplete="off"
          aria-label="Tìm môn học hoặc lĩnh vực"
        />
        <datalist id="subject-suggestions">
          {subjects.map((subject) => <option key={subject.name} value={subject.name} />)}
        </datalist>
      </div>
    </label>
  );
}

function TutorCard({ tutor, saved, onSave, onOpen }) {
  return (
    <article className="tutor-card">
      <div className="tutor-top">
        {tutor.image ? <img src={tutor.image} alt={tutor.name} width="68" height="76" loading="lazy" /> : <span className="tutor-avatar-fallback" aria-hidden="true">{tutor.name.slice(0, 1)}</span>}
        <div className="tutor-identity">
          <h3>
            {tutor.title} {tutor.name}
          </h3>
          <div className="tutor-rating">{tutor.reviews ? <><Star size={13} fill="currentColor" /><strong>{tutor.rating.toFixed(1)}</strong><span>({tutor.reviews} đánh giá)</span></> : <span>Hồ sơ mới</span>}</div>
          <span className="subject-tag">{tutor.subject}</span>
        </div>
        <button
          className={`save-button ${saved ? 'is-saved' : ''}`}
          onClick={onSave}
          aria-label={`${saved ? 'Bỏ lưu' : 'Lưu'} ${tutor.name}`}
          aria-pressed={saved}
        >
          <Heart size={18} fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>
      <p className="tutor-meta">
        <GraduationCap size={15} />
        {tutor.experience} năm kinh nghiệm
        <span className="mode-tag">{tutor.mode === 'online' ? 'Online' : tutor.mode === 'recorded' ? 'Video quay sẵn' : 'Online & tại nhà'}</span>
      </p>
      <p className="tutor-description">{tutor.description}</p>
      <div className="tutor-bottom">
        <div>
          <strong>{tutor.price ? `${currency(tutor.price)}đ` : 'Liên hệ'}</strong>
          {tutor.price && <span> / giờ</span>}
        </div>
        <Button className="edu-button profile-button" size="sm" onClick={onOpen}>
          Xem hồ sơ <ArrowRight size={14} />
        </Button>
      </div>
    </article>
  );
}

export const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const [viewerMode] = useLocalStorage(STORAGE_KEYS.VIEW_MODE, 'teacher');
  const [params, setParams] = useSearchParams();
  const query = params.get('q') || '';
  const dialog = params.get('dialog');
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [savedIds, setSavedIds] = useLocalStorage('edumatch:saved-tutors', []);
  const [savedOnly, setSavedOnly] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [showAllSubjects, setShowAllSubjects] = useState(false);
  const [showOtherSubjectSearch, setShowOtherSubjectSearch] = useState(false);
  const [otherCourseQuery, setOtherCourseQuery] = useState('');
  const [profile, setProfile] = useState(null);
  const [consultationComplete, setConsultationComplete] = useState(false);
  const [consultation, setConsultation] = useState({ name: '', phone: '', subject: '', note: '' });
  const resultsRef = useRef(null);
  const filterRef = useRef(null);
  const otherSubjectInputRef = useRef(null);
  const isTeacherView = isAuthenticated && user?.role === 'teacher' && viewerMode === 'teacher';
  const visibleCourses = getCourses();
  const otherCourseMatches = useMemo(() => {
    const keyword = normalize(otherCourseQuery).trim();
    if (!keyword) return [];

    return visibleCourses
      .filter((course) => normalize([
        course.title,
        course.description,
        course.teacher?.name,
        course.location,
        course.schedule,
      ].filter(Boolean).join(' ')).includes(keyword))
      .slice(0, 6);
  }, [otherCourseQuery, visibleCourses]);

  const searchableTutors = useMemo(() => {
    const courseTutors = getCourses().map((course) => ({
      id: `course-tutor-${course.id}`,
      name: course.teacher.name,
      title: 'GV.',
      rating: 0,
      reviews: 0,
      subject: course.title,
      experience: course.teacher.experience || 'Đang cập nhật',
      mode: course.learningMode === 'in-person' ? 'offline' : course.learningMode === 'recorded' ? 'recorded' : 'online',
      price: course.price,
      description: course.description,
      bio: course.teacher.bio || '',
      methods: ['Lộ trình học theo khóa', 'Chủ động trao đổi lịch học'],
      province: course.province || '',
      ward: course.ward || course.district || '',
      location: course.location || '',
    }));
    return [...tutors, ...courseTutors];
  }, []);

  const filteredTutors = useMemo(
    () =>
      searchableTutors.filter((tutor) => {
        const matchesQuery =
          !query ||
          normalize(`${tutor.title} ${tutor.name} ${tutor.subject} ${tutor.description}`).includes(
            normalize(query)
          );
        return (
          matchesQuery &&
          (!appliedFilters.subject ||
            normalize(`${tutor.subject} ${tutor.title} ${tutor.description}`).includes(
              normalize(appliedFilters.subject)
            )) &&
          (!appliedFilters.mode ||
            (appliedFilters.mode === 'online'
              ? tutor.mode === 'online' || tutor.mode === 'both'
              : appliedFilters.mode === 'recorded'
                ? tutor.mode === 'recorded'
                : tutor.mode === 'offline' || tutor.mode === 'both')) &&
          (!appliedFilters.province || normalize(`${tutor.province || ''} ${tutor.location || ''}`).includes(normalize(appliedFilters.province))) &&
          (!appliedFilters.ward || normalize(`${tutor.ward || ''} ${tutor.location || ''}`).includes(normalize(appliedFilters.ward))) &&
          (!appliedFilters.rating || tutor.rating >= Number(appliedFilters.rating)) &&
          (!savedOnly || savedIds.includes(tutor.id))
        );
      }),
    [query, appliedFilters, savedOnly, savedIds, searchableTutors]
  );

  const isFiltered = Boolean(query || savedOnly || Object.values(appliedFilters).some(Boolean));
  const visibleTutors = showAll || isFiltered ? filteredTutors : filteredTutors.slice(0, 4);
  const wardOptions = useMemo(() => getAdministrativeWards(filters.province), [filters.province]);
  const updateFilter = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({
      ...current,
      [name]: value,
      ...(name === 'mode' && value !== 'in-person' ? { province: '', ward: '' } : {}),
    }));
  };
  const selectLocation = (name) => (value) => {
    setFilters((current) => ({
      ...current,
      [name]: value,
      ...(name === 'province' ? { ward: '' } : {}),
    }));
  };
  const closeDialog = () => {
    setConsultationComplete(false);
    setParams(
      (current) => {
        current.delete('dialog');
        return current;
      },
      { replace: true }
    );
  };
  const openDialog = (name) => {
    setConsultationComplete(false);
    setParams((current) => {
      current.set('dialog', name);
      return current;
    });
  };
  const resetSearch = () => {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
    setSavedOnly(false);
    setParams(
      (current) => {
        current.delete('q');
        return current;
      },
      { replace: true }
    );
  };
  const chooseSubject = (subject) => {
    const next = { ...initialFilters, subject };
    setFilters(next);
    setAppliedFilters(next);
    setSavedOnly(false);
    setParams(
      (current) => {
        current.delete('q');
        return current;
      },
      { replace: true }
    );
    scrollTo(resultsRef.current);
  };
  const openOtherSubjectSearch = () => {
    setShowOtherSubjectSearch(true);
    requestAnimationFrame(() => otherSubjectInputRef.current?.focus());
  };

  return (
    <div className="edu-home">
      <section className="home-hero" aria-labelledby="hero-title">
        <div className="edu-container hero-grid">
          <div className="hero-copy">
            <span className="hero-eyebrow">
              <GraduationCap size={15} /> HỌC ĐÚNG THẦY, VỮNG TƯƠNG LAI
            </span>
            <h1 id="hero-title">
              Kết nối Học viên với
              <br />
              <span>Giáo viên Giỏi & Uy tín</span>
            </h1>
            <p>
              Học theo cách của bạn, tiến bộ cùng người thầy phù hợp.
              <br className="desktop-break" /> Kết nối hôm nay, mở ra những khả năng mới.
            </p>
            <div className="hero-actions">
              <Button
                className="edu-button"
                size="lg"
                onClick={() => {
                  scrollTo(filterRef.current, 'center');
                  document.getElementById('subject-filter')?.focus({ preventScroll: true });
                }}
              >
                <Search size={19} />
                Tìm gia sư phù hợp
                <ArrowRight size={17} />
              </Button>
            </div>
            <div className="hero-assurances">
              <span>
                <ShieldCheck size={18} />
                Giáo viên đã xác minh
              </span>
              <span>
                <LockKeyhole size={17} />
                Thanh toán an toàn
              </span>
              <span>
                <Headphones size={18} />
                Hỗ trợ tận tâm
              </span>
            </div>
          </div>
          <div className="hero-visual">
            <img
              className="hero-photo"
              src={heroImage}
              srcSet={`${heroImageMobile} 720w, ${heroImage} 1448w`}
              sizes="(max-width: 767px) calc(100vw - 32px), (max-width: 1023px) 55vw, 650px"
              alt="Cô giáo và học viên cùng học bên máy tính"
              width="1448"
              height="1086"
              fetchPriority="high"
            />
            <div className="community-note">
              <div className="avatar-stack">
                {tutors.slice(0, 3).map((tutor) => (
                  <img key={tutor.id} src={tutor.image} alt="" width="34" height="34" />
                ))}
              </div>
              <div>
                <strong>Cùng nhau tiến bộ</strong>
                <span>Mỗi ngày, một bước xa hơn</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="edu-container home-content">
        {isTeacherView && (
          <section className="teacher-workspace" aria-label="Không gian giáo viên">
            <div>
              <span>KHÔNG GIAN GIÁO VIÊN</span>
              <h2>Chia sẻ lớp học của bạn với học viên phù hợp.</h2>
              <p>Tạo khóa học, cập nhật hồ sơ và xây dựng cộng đồng học tập của riêng bạn.</p>
            </div>
            <div className="teacher-workspace__actions">
              <Link className="edu-button button-link" to={ROUTES.CREATE_COURSE}>
                <BookPlus size={18} /> Thêm khóa học
              </Link>
              <Link className="edu-button edu-button-outline button-link" to={ROUTES.TEACHER_PROFILE(user.id)}>
                <CircleUserRound size={18} /> Trang cá nhân
              </Link>
            </div>
          </section>
        )}
        <section id="khoa-hoc" className="home-section course-section" aria-labelledby="courses-heading">
          <SectionHeading
            title={<span id="courses-heading">Khóa học <span className="accent-text">đang mở</span></span>}
            description="Lộ trình rõ ràng từ các giáo viên trên EduMatch."
          >
            {isTeacherView && <Link className="text-link" to={ROUTES.CREATE_COURSE}>Tạo khóa học <ArrowRight size={16} /></Link>}
          </SectionHeading>
          <div className="course-grid">
            {visibleCourses.map((course) => <CourseCard key={course.id} course={course} />)}
          </div>
        </section>
        <section
          id="tim-gia-su"
          className="tutor-search"
          ref={filterRef}
          aria-labelledby="search-title"
        >
          <div className="search-panel-heading">
            <h2 id="search-title">
              <SlidersHorizontal size={21} />
              Tìm kiếm gia sư phù hợp với bạn
            </h2>
            <span>Người thầy phù hợp. Hành trình khác biệt.</span>
          </div>
          <form
            className={`filter-grid ${filters.mode === 'in-person' ? 'filter-grid--location' : ''}`}
            onSubmit={(event) => {
              event.preventDefault();
              setAppliedFilters(filters);
              scrollTo(resultsRef.current);
            }}
          >
            <SubjectFilterField value={filters.subject} onChange={updateFilter} />
            <FilterField
              label="Hình thức học"
              icon={Monitor}
              name="mode"
              value={filters.mode}
              onChange={updateFilter}
            >
              <option value="">Tất cả hình thức</option>
              <option value="online">Trực tuyến</option>
              <option value="in-person">Học trực tiếp</option>
              <option value="recorded">Video quay sẵn</option>
            </FilterField>
            {filters.mode === 'in-person' && <>
              <AdministrativePicker
                id="province-filter"
                label="Tỉnh / Thành phố"
                value={filters.province}
                options={administrativeProvinces}
                onSelect={selectLocation('province')}
                placeholder="Gõ để tìm tỉnh/thành, rồi chọn"
              />
              <AdministrativePicker
                id="ward-filter"
                label="Xã / Phường / Đặc khu"
                value={filters.ward}
                options={wardOptions}
                onSelect={selectLocation('ward')}
                placeholder={filters.province ? 'Gõ để tìm xã/phường, rồi chọn' : 'Chọn tỉnh/thành trước'}
                disabled={!filters.province}
                emptyText="Không tìm thấy xã/phường trong tỉnh/thành đã chọn."
              />
            </>}
            <FilterField
              label="Đánh giá tối thiểu"
              icon={Star}
              name="rating"
              value={filters.rating}
              onChange={updateFilter}
            >
              <option value="">Tất cả đánh giá</option>
              <option value="4.5">Từ 4.5 sao</option>
              <option value="4.8">Từ 4.8 sao</option>
              <option value="5">5.0 sao</option>
            </FilterField>
            <Button type="submit" className="edu-button search-submit">
              <Search size={18} />
              Tìm gia sư
            </Button>
          </form>
        </section>

        <section
          id="giao-vien"
          className="home-section tutors-section"
          ref={resultsRef}
          aria-labelledby="tutors-heading"
        >
          <SectionHeading
            title={
              <span id="tutors-heading">
                Gặp người thầy <span className="accent-text">truyền cảm hứng</span>
              </span>
            }
            description="Chuyên môn vững vàng, tận tâm đồng hành trên từng bước tiến."
          >
            <button className="text-link" onClick={() => setShowAll((current) => !current)}>
              {showAll ? 'Thu gọn danh sách' : 'Xem tất cả giáo viên'}
              <ArrowRight size={16} />
            </button>
          </SectionHeading>
          {(isFiltered || savedIds.length > 0) && (
            <div className="results-toolbar">
              <span role="status">
                {isFiltered
                  ? `${filteredTutors.length} gia sư phù hợp${query ? ` với “${query}”` : ''}`
                  : 'Khám phá giáo viên nổi bật'}
              </span>
              <div>
                <button
                  className={`saved-filter ${savedOnly ? 'active' : ''}`}
                  onClick={() => setSavedOnly((current) => !current)}
                  aria-pressed={savedOnly}
                >
                  <Heart size={14} />
                  Đã lưu ({savedIds.length})
                </button>
                {isFiltered && (
                  <button className="text-link" onClick={resetSearch}>
                    Xóa bộ lọc
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          )}
          <div className="tutors-grid">
            {visibleTutors.map((tutor) => (
              <TutorCard
                key={tutor.id}
                tutor={tutor}
                saved={savedIds.includes(tutor.id)}
                onSave={() =>
                  setSavedIds((current) =>
                    current.includes(tutor.id)
                      ? current.filter((id) => id !== tutor.id)
                      : [...current, tutor.id]
                  )
                }
                onOpen={() => setProfile(tutor)}
              />
            ))}
          </div>
          {visibleTutors.length === 0 && (
            <div className="search-empty">
              <Search size={30} />
              <h3>Chưa tìm thấy gia sư phù hợp</h3>
              <p>Thử chọn môn học khác hoặc mở rộng mức học phí của bạn.</p>
              <Button className="edu-button" onClick={resetSearch}>
                Xóa bộ lọc
              </Button>
            </div>
          )}
          <p className="sample-note">Hồ sơ giáo viên minh hoạ cho giao diện.</p>
        </section>

        <section id="mon-hoc" className="home-section" aria-labelledby="subjects-heading">
          <SectionHeading
            title={
              <span id="subjects-heading">
                Mỗi đam mê, một <span className="accent-text">khởi đầu mới</span>
              </span>
            }
            description="Từ kiến thức nền tảng đến kỹ năng bạn luôn muốn khám phá."
          >
            <button className="text-link" onClick={() => setShowAllSubjects((current) => !current)}>
              {showAllSubjects ? 'Thu gọn môn học' : 'Khám phá các môn học'}
              <ArrowRight size={16} />
            </button>
          </SectionHeading>
          <div className="subjects-grid">
            {subjects
              .slice(0, showAllSubjects ? subjects.length : 9)
              .map(({ name, icon: Icon, color }) => (
                <button
                  key={name}
                  className={`subject-tile subject-${color} ${appliedFilters.subject === name ? 'selected' : ''}`}
                  aria-pressed={appliedFilters.subject === name}
                  onClick={() => chooseSubject(name)}
                >
                  <span className="subject-icon">
                    <Icon size={26} strokeWidth={1.7} />
                  </span>
                  <span>{name}</span>
                </button>
              ))}
            <button
              className={`subject-tile subject-other ${showOtherSubjectSearch ? 'selected' : ''}`}
              aria-expanded={showOtherSubjectSearch}
              onClick={openOtherSubjectSearch}
            >
              <span className="subject-icon"><Search size={26} strokeWidth={1.8} /></span>
              <span>Khác</span>
            </button>
          </div>
          {showOtherSubjectSearch && (
            <div className="other-course-search" role="search" aria-label="Tìm khóa học khác">
              <div className="other-course-search__top">
                <div>
                  <strong>Tìm khóa học khác</strong>
                  <span>Nhập môn học, chủ đề hoặc tên khóa học bạn muốn tìm.</span>
                </div>
                <button type="button" onClick={() => { setShowOtherSubjectSearch(false); setOtherCourseQuery(''); }} aria-label="Đóng tìm kiếm khóa học"><X size={17} /></button>
              </div>
              <div className="other-course-search__input">
                <Search size={18} aria-hidden="true" />
                <input
                  ref={otherSubjectInputRef}
                  value={otherCourseQuery}
                  onChange={(event) => setOtherCourseQuery(event.target.value)}
                  placeholder="Ví dụ: IELTS, đàn guitar, luyện thi đại học..."
                  aria-label="Từ khóa tìm khóa học"
                />
              </div>
              {otherCourseQuery.trim() && (
                <div className="other-course-search__results">
                  <p>{otherCourseMatches.length ? `${otherCourseMatches.length} khóa học liên quan` : 'Chưa có khóa học phù hợp'}</p>
                  {otherCourseMatches.map((course) => (
                    <Link key={course.id} to={ROUTES.COURSE_DETAIL(course.id)} className="other-course-result">
                      <span><strong>{course.title}</strong><small>{course.teacher?.name || 'Giáo viên EduMatch'} · {course.description}</small></span>
                      <ArrowRight size={17} aria-hidden="true" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        <section id="cach-hoat-dong" className="how-section" aria-labelledby="how-heading">
          <SectionHeading
            title={
              <span id="how-heading">
                Hành trình học tập, <span className="accent-text">thật đơn giản</span>
              </span>
            }
            description="Bốn bước nhỏ để bắt đầu một thay đổi lớn."
          />
          <div className="steps-grid">
            {[
              {
                icon: Search,
                title: 'Tìm kiếm gia sư',
                description: 'Chọn môn học, hình thức và mức học phí phù hợp.',
              },
              {
                icon: FileCheck2,
                title: 'Chọn người đồng hành',
                description: 'Khám phá hồ sơ, kinh nghiệm và đánh giá thực tế.',
              },
              {
                icon: CalendarDays,
                title: 'Sắp xếp lịch học',
                description: 'Kết nối với giáo viên và chọn thời gian thuận tiện.',
              },
              {
                icon: TrendingUp,
                title: 'Bắt đầu tiến bộ',
                description: 'Học theo lộ trình riêng, phát triển mỗi ngày.',
              },
            ].map(({ icon: Icon, title, description }, index) => (
              <div className="learning-step" key={title}>
                <div className="step-top">
                  <span className="step-icon">
                    <Icon size={27} strokeWidth={1.7} />
                  </span>
                  <span className="step-number">0{index + 1}</span>
                  {index < 3 && <ArrowRight size={19} className="step-arrow" />}
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="vi-sao-edumatch"
          className="home-section why-section"
          aria-labelledby="why-heading"
        >
          <div className="why-intro">
            <span className="why-mark">
              <GraduationCap size={29} strokeWidth={1.5} />
            </span>
            <h2 id="why-heading">
              An tâm lựa chọn.
              <br />
              <span className="accent-text">Tự tin tiến bước.</span>
            </h2>
            <p>EduMatch giúp bạn tập trung vào điều quan trọng nhất: học tập và phát triển.</p>
            <a href="#cach-hoat-dong" className="text-link">
              Tìm hiểu cách EduMatch hoạt động
              <ArrowRight size={16} />
            </a>
          </div>
          <div className="benefits-grid">
            {[
              {
                icon: Award,
                title: 'Chuyên môn bạn có thể tin',
                description: 'Hồ sơ rõ ràng, chuyên môn được xác minh và đánh giá từ học viên.',
              },
              {
                icon: Laptop,
                title: 'Học theo nhịp sống của bạn',
                description: 'Trực tuyến hoặc tại nhà. Chủ động sắp xếp lịch học phù hợp.',
              },
              {
                icon: ShieldCheck,
                title: 'Minh bạch trong từng buổi học',
                description: 'Thông tin học phí rõ ràng, giúp bạn dễ dàng cân nhắc và lựa chọn.',
              },
              {
                icon: Headphones,
                title: 'Luôn có người đồng hành',
                description: 'Đội ngũ hỗ trợ sẵn sàng lắng nghe trong suốt hành trình học tập.',
              },
            ].map(({ icon: Icon, title, description }) => (
              <div className="benefit" key={title}>
                <span className="benefit-icon">
                  <Icon size={24} strokeWidth={1.7} />
                </span>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section
          id="danh-gia"
          className="home-section testimonials-section"
          aria-labelledby="reviews-heading"
        >
          <SectionHeading
            title={
              <span id="reviews-heading">
                Những câu chuyện <span className="accent-text">cùng EduMatch</span>
              </span>
            }
            description="Một người thầy phù hợp có thể tạo nên rất nhiều khác biệt."
          >
            <span className="reviews-caption">
              <Star size={16} fill="currentColor" />
              Cảm hứng từ học viên
            </span>
          </SectionHeading>
          <div className="testimonials-grid">
            {testimonials.map((review) => (
              <figure key={review.name} className="review-card">
                <div className="review-stars" role="img" aria-label="5 trên 5 sao">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star size={14} key={i} fill="currentColor" />
                  ))}
                </div>
                <blockquote>“{review.quote}”</blockquote>
                <figcaption>
                  <img src={review.image} alt="" width="42" height="42" loading="lazy" />
                  <div>
                    <strong>{review.name}</strong>
                    <span>{review.role}</span>
                  </div>
                  <CheckCircle2 size={18} />
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="sample-note">Nội dung đánh giá minh hoạ theo mẫu thiết kế.</p>
        </section>

        <section className="bottom-cta">
          <div className="cta-icon">
            <BookOpen size={37} strokeWidth={1.4} />
          </div>
          <div className="cta-copy">
            <h2>Bắt đầu hành trình của bạn hôm nay.</h2>
            <p>Một người thầy phù hợp, những cơ hội mới đang chờ.</p>
          </div>
          <div className="cta-actions">
            <a className="edu-button button-link" href="#tim-gia-su">
              <Search size={18} />
              Tìm gia sư ngay
            </a>
          </div>
        </section>
      </div>

      <Modal
        open={Boolean(profile)}
        onClose={() => setProfile(null)}
        title="Khám phá người đồng hành"
        size="md"
        className="edu-modal"
      >
        {profile && (
          <div className="profile-detail">
            <div className="profile-detail-heading">
              {profile.image ? <img src={profile.image} alt={profile.name} width="84" height="96" /> : <span className="profile-avatar-fallback" aria-hidden="true">{profile.name.slice(0, 1)}</span>}
              <div>
                <span className="subject-tag">{profile.subject}</span>
                <h3>
                  {profile.title} {profile.name}
                </h3>
                {profile.reviews ? <p><Star size={15} fill="currentColor" /> {profile.rating.toFixed(1)} <span>({profile.reviews} đánh giá)</span></p> : <p>Hồ sơ giáo viên mới</p>}
              </div>
            </div>
            <div className="profile-facts">
              <span>
                <GraduationCap size={19} />
                <strong>{profile.experience} năm</strong>Kinh nghiệm
              </span>
              <span>
                <Monitor size={19} />
                <strong>{profile.mode === 'online' ? 'Trực tuyến' : profile.mode === 'recorded' ? 'Video quay sẵn' : 'Linh hoạt'}</strong>Hình thức
                học
              </span>
              <span>
                <BookOpen size={19} />
                <strong>{currency(profile.price)}đ</strong>Mỗi giờ học
              </span>
            </div>
            <h4>Giới thiệu</h4>
            <p>
              {profile.description} {profile.bio}
            </p>
            <h4>Phương pháp giảng dạy</h4>
            <ul>
              {profile.methods.map((method) => (
                <li key={method}>
                  <Check size={16} />
                  {method}
                </li>
              ))}
            </ul>
            <div className="profile-demo-note">
              <ShieldCheck size={20} />
              <span>
                Đây là hồ sơ minh hoạ. Chức năng đặt lịch sẽ có khi kết nối hệ thống gia sư.
              </span>
            </div>
            <Button
              className="edu-button w-full"
              onClick={() => {
                setProfile(null);
                openDialog('consultation');
              }}
            >
              <Headphones size={18} />
              Tìm hiểu nhu cầu học tập
              <ArrowRight size={16} />
            </Button>
          </div>
        )}
      </Modal>

      <Modal
        open={dialog === 'teacher' || dialog === 'register'}
        onClose={closeDialog}
        title={dialog === 'teacher' ? 'Trở thành giáo viên EduMatch' : 'Bắt đầu cùng EduMatch'}
        className="edu-modal"
      >
        <div className="join-content">
          <span className="join-icon">
            {dialog === 'teacher' ? <GraduationCap size={35} /> : <Users size={35} />}
          </span>
          <h3>
            {dialog === 'teacher'
              ? 'Chia sẻ kiến thức. Truyền cảm hứng.'
              : 'Tìm người thầy phù hợp với bạn.'}
          </h3>
          <p>
            {dialog === 'teacher'
              ? 'Đồng hành cùng học viên, xây dựng lớp học của riêng bạn và giảng dạy theo lịch phù hợp.'
              : 'Khám phá giáo viên, lưu những hồ sơ yêu thích và chọn cách học phù hợp với bạn.'}
          </p>
          <div className="join-benefits">
            <span>
              <CheckCircle2 size={17} />
              Hồ sơ minh bạch
            </span>
            <span>
              <CheckCircle2 size={17} />
              Lịch học linh hoạt
            </span>
            <span>
              <CheckCircle2 size={17} />
              Hỗ trợ tận tâm
            </span>
          </div>
          <p className="dialog-note">
            Giao diện đăng ký đang được chuẩn bị. Bạn có thể tìm hiểu nhu cầu học tập hoặc sử dụng
            trang đăng nhập hiện có.
          </p>
          <Button className="edu-button w-full" onClick={() => openDialog('consultation')}>
            Tìm hiểu thêm
            <ArrowRight size={16} />
          </Button>
          <Link to={ROUTES.LOGIN} className="text-link join-login">
            Đã có tài khoản? Đăng nhập
          </Link>
        </div>
      </Modal>

      <Modal
        open={dialog === 'consultation'}
        onClose={closeDialog}
        title="Tư vấn lộ trình học tập"
        description="Cùng tìm ra cách học phù hợp với bạn."
        className="edu-modal"
      >
        {consultationComplete ? (
          <div className="consultation-success">
            <span className="join-icon">
              <CheckCircle2 size={36} />
            </span>
            <h3>Cảm ơn bạn, {consultation.name}!</h3>
            <p>
              Bạn đã hoàn tất trải nghiệm biểu mẫu. Thông tin chưa được gửi đi vì giao diện chưa kết
              nối dịch vụ tư vấn.
            </p>
            <Button className="edu-button" onClick={closeDialog}>
              Tiếp tục khám phá
              <ArrowRight size={16} />
            </Button>
          </div>
        ) : (
          <form
            className="consultation-form"
            onSubmit={(event) => {
              event.preventDefault();
              setConsultationComplete(true);
            }}
          >
            <a className="consultation-hotline" href="tel:19001345">
              <span><Phone size={19} aria-hidden="true" /></span>
              <div><small>Hotline tư vấn miễn phí</small><strong>1900 1345</strong></div>
              <ArrowRight size={17} aria-hidden="true" />
            </a>
            <label>
              Họ và tên
              <input
                name="name"
                autoComplete="name"
                required
                maxLength={80}
                placeholder="Tên của bạn"
                value={consultation.name}
                onChange={(event) =>
                  setConsultation((current) => ({ ...current, name: event.target.value }))
                }
              />
            </label>
            <label>
              Số điện thoại
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                pattern="[+]?[0-9]{9,15}"
                title="Nhập số điện thoại từ 9 đến 16 ký tự"
                placeholder="Nhập số điện thoại"
                value={consultation.phone}
                onChange={(event) =>
                  setConsultation((current) => ({ ...current, phone: event.target.value }))
                }
              />
            </label>
            <label>
              Khóa học / môn học cần tư vấn
              <input
                name="subject"
                type="text"
                list="consultation-subject-suggestions"
                maxLength={140}
                placeholder="Ví dụ: Luyện thi IELTS, Toán lớp 12..."
                value={consultation.subject}
                onChange={(event) =>
                  setConsultation((current) => ({ ...current, subject: event.target.value }))
                }
              />
              <datalist id="consultation-subject-suggestions">
                {subjects.map((subject) => (
                  <option key={subject.name} value={subject.name} />
                ))}
              </datalist>
            </label>
            <label>
              Ghi chú <em>(không bắt buộc)</em>
              <textarea
                name="note"
                rows="3"
                maxLength={600}
                placeholder="Chia sẻ mục tiêu học, thời gian mong muốn hoặc điều bạn cần được tư vấn..."
                value={consultation.note}
                onChange={(event) =>
                  setConsultation((current) => ({ ...current, note: event.target.value }))
                }
              />
            </label>
            <p className="dialog-note">
              Biểu mẫu minh hoạ. Thông tin chỉ được sử dụng để xem trước giao diện, chưa được gửi
              đến hệ thống.
            </p>
            <Button type="submit" className="edu-button w-full">
              Hoàn tất biểu mẫu
              <ArrowRight size={16} />
            </Button>
          </form>
        )}
      </Modal>
      <Modal
        open={['terms', 'privacy', 'faq', 'support'].includes(dialog)}
        onClose={closeDialog}
        title={
          {
            terms: 'Điều khoản sử dụng',
            privacy: 'Chính sách bảo mật',
            faq: 'Câu hỏi thường gặp',
            support: 'Hỗ trợ từ EduMatch',
          }[dialog]
        }
        className="edu-modal"
      >
        {dialog === 'faq' ? (
          <div className="faq-list">
            {[
              {
                q: 'Tôi có thể tìm giáo viên như thế nào?',
                a: 'Chọn môn học, hình thức, học phí và đánh giá tại bộ lọc. Bạn cũng có thể tìm theo tên bằng ô tìm kiếm trên đầu trang.',
              },
              {
                q: 'Có thể học trực tuyến không?',
                a: 'Bạn có thể chọn hình thức Trực tuyến trong bộ lọc để tìm những hồ sơ phù hợp.',
              },
              {
                q: 'Làm sao để lưu giáo viên yêu thích?',
                a: 'Nhấn biểu tượng trái tim trên hồ sơ. Danh sách được lưu trong trình duyệt của bạn.',
              },
            ].map((item) => (
              <details key={item.q}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        ) : (
          <div className="info-content">
            <ShieldCheck size={32} />
            <p>
              {dialog === 'support'
                ? 'Bạn có thể khám phá câu hỏi thường gặp hoặc điền thử biểu mẫu tư vấn để tìm hiểu trải nghiệm học tập.'
                : 'Nội dung chính sách chính thức sẽ được cập nhật khi EduMatch đi vào hoạt động. Giao diện hiện tại là bản thiết kế, với hồ sơ và đánh giá minh hoạ.'}
            </p>
            <Button
              className="edu-button"
              onClick={() => openDialog(dialog === 'support' ? 'faq' : 'consultation')}
            >
              {dialog === 'support' ? 'Xem câu hỏi thường gặp' : 'Tìm hiểu thêm'}
              <ArrowRight size={16} />
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Home;
