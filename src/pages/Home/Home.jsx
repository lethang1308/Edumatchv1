import { useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  GraduationCap,
  Headphones,
  Heart,
  LockKeyhole,
  Monitor,
  Phone,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  Users,
  X,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/feedback/Modal';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { ROUTES } from '@/constants/routes';
import { CourseCard } from '@/components/courses/CourseCard';
import { AdministrativePicker } from '@/components/forms/AdministrativePicker';
import { administrativeProvinces, getAdministrativeWards } from '@/data/administrativeUnits';
import { getCourseRating, getCourses } from '@/features/learning/marketplace';
import heroImage from '@/assets/tutoring-hero.webp';
import heroImageMobile from '@/assets/tutoring-hero-720.webp';
import { subjects, tutors, testimonials } from './homeData';
import './home.css';
import '@/components/courses/course.css';

const initialFilters = { subject: '', mode: '', province: '', ward: '', provider: '' };
const initialCourseFilters = { subject: '', mode: '' };
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

function FilterField({ label, icon: Icon, id, name, value, onChange, children }) {
  return (
    <label className="filter-field">
      <span>{label}</span>
      <div className="filter-input">
        <Icon size={19} aria-hidden="true" />
        <select id={id || `${name}-filter`} name={name} value={value} onChange={onChange}>
          {children}
        </select>
        <ChevronDown size={16} aria-hidden="true" />
      </div>
    </label>
  );
}

function SubjectFilterField({ value, onChange, id = 'subject-filter', listId = 'subject-suggestions', label = 'Môn học / Lĩnh vực' }) {
  return (
    <label className="filter-field">
      <span>{label}</span>
      <div className="filter-input filter-input--search">
        <BookOpen size={19} aria-hidden="true" />
        <input
          id={id}
          name="subject"
          type="search"
          value={value}
          onChange={onChange}
          list={listId}
          placeholder="Nhập môn học hoặc từ khóa"
          autoComplete="off"
          aria-label="Tìm môn học hoặc lĩnh vực"
        />
        <datalist id={listId}>
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
            {[tutor.title, tutor.name].filter(Boolean).join(' ')}
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
        {tutor.providerType === 'center'
          ? 'Trung tâm đào tạo'
          : typeof tutor.experience === 'number'
            ? `${tutor.experience} năm kinh nghiệm`
            : tutor.experience || 'Đang cập nhật kinh nghiệm'}
        <span className="mode-tag">{tutor.mode === 'online' ? 'Trực tuyến' : tutor.mode === 'recorded' ? 'Video quay sẵn' : tutor.mode === 'offline' ? 'Trực tiếp' : 'Trực tuyến & trực tiếp'}</span>
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
  const [params, setParams] = useSearchParams();
  const query = params.get('q') || '';
  const dialog = params.get('dialog');
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [courseFilters, setCourseFilters] = useState(initialCourseFilters);
  const [appliedCourseFilters, setAppliedCourseFilters] = useState(initialCourseFilters);
  const [savedIds, setSavedIds] = useLocalStorage('edumatch:saved-tutors', []);
  const [savedOnly, setSavedOnly] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [showAllSubjects, setShowAllSubjects] = useState(false);
  const [courseSort, setCourseSort] = useState('newest');
  const [showAllCourses, setShowAllCourses] = useState(false);
  const [coursePage, setCoursePage] = useState(1);
  const [showOtherSubjectSearch, setShowOtherSubjectSearch] = useState(false);
  const [otherCourseQuery, setOtherCourseQuery] = useState('');
  const [profile, setProfile] = useState(null);
  const [consultationComplete, setConsultationComplete] = useState(false);
  const [consultation, setConsultation] = useState({ name: '', phone: '', subject: '', note: '' });
  const resultsRef = useRef(null);
  const filterRef = useRef(null);
  const courseRef = useRef(null);
  const otherSubjectInputRef = useRef(null);
  const rankedCourses = getCourses()
    .map((course) => ({ ...course, ranking: getCourseRating(course.id) }))
    .filter((course) => {
      const courseMode = course.learningMode === 'in-person'
        ? 'in-person'
        : course.learningMode === 'recorded'
          ? 'recorded'
          : 'online';
      const courseSearchText = normalize([
        course.title,
        course.description,
        course.teacher?.name,
        course.location,
        course.schedule,
      ].filter(Boolean).join(' '));

      return (
        (!appliedCourseFilters.subject || courseSearchText.includes(normalize(appliedCourseFilters.subject))) &&
        (!appliedCourseFilters.mode || courseMode === appliedCourseFilters.mode)
      );
    })
    .sort((first, second) => {
      if (courseSort === 'top-rated') {
        return second.ranking.total - first.ranking.total
          || second.ranking.average - first.ranking.average
          || new Date(second.createdAt || 0) - new Date(first.createdAt || 0);
      }
      return new Date(second.createdAt || 0) - new Date(first.createdAt || 0);
    });
  const coursePageSize = 18;
  const totalCoursePages = Math.max(1, Math.ceil(rankedCourses.length / coursePageSize));
  const visibleCourses = showAllCourses
    ? rankedCourses.slice((coursePage - 1) * coursePageSize, coursePage * coursePageSize)
    : rankedCourses.slice(0, 6);
  const otherCourseMatches = (() => {
    const keyword = normalize(otherCourseQuery).trim();
    if (!keyword) return [];

    return rankedCourses
      .filter((course) => normalize([
        course.title,
        course.description,
        course.teacher?.name,
        course.location,
        course.schedule,
      ].filter(Boolean).join(' ')).includes(keyword))
      .slice(0, 6);
  })();

  const searchableTutors = (() => {
    const providers = new Map();

    getCourses().forEach((course) => {
      const provider = course.teacher;
      const key = provider.id;
      const rating = getCourseRating(course.id);
      const mode = course.learningMode === 'in-person' ? 'offline' : course.learningMode === 'recorded' ? 'recorded' : 'online';
      const current = providers.get(key) || {
        id: key,
        name: provider.name,
        title: provider.role === 'center' ? '' : 'GV.',
        providerType: provider.role === 'center' ? 'center' : 'teacher',
        ratingSum: 0,
        reviews: 0,
        heartCount: Number(provider.heartCount || 0),
        subjects: [],
        modes: new Set(),
        locations: [],
        province: '',
        ward: '',
        image: provider.avatar || '',
        experience: provider.experience || 'Đang cập nhật',
        price: course.price,
        description: provider.bio || course.description,
        bio: provider.bio || '',
        methods: ['Lộ trình học theo khóa', 'Chủ động trao đổi lịch học'],
      };
      current.subjects.push(course.title);
      current.modes.add(mode);
      current.locations.push(course.location || '');
      current.province ||= course.province || '';
      current.ward ||= course.ward || course.district || '';
      current.ratingSum += rating.average * rating.total;
      current.reviews += rating.total;
      current.price = Math.min(Number(current.price || 0) || Infinity, Number(course.price || 0) || Infinity);
      providers.set(key, current);
    });

    const courseProviders = [...providers.values()].map((provider) => ({
      ...provider,
      subject: [...new Set(provider.subjects)].join(' · '),
      mode: provider.modes.size === 1 ? [...provider.modes][0] : 'both',
      location: provider.locations.filter(Boolean).join(' · '),
      rating: provider.reviews ? provider.ratingSum / provider.reviews : 0,
      price: Number.isFinite(provider.price) ? provider.price : 0,
    }));

    return [
      ...tutors.map((tutor) => ({
        ...tutor,
        providerType: 'teacher',
        heartCount: Number(tutor.heartCount || 0),
      })),
      ...courseProviders,
    ];
  })();

  const filteredTutors = (() => {
    return searchableTutors.filter((tutor) => {
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
          (!appliedFilters.provider || tutor.providerType === appliedFilters.provider) &&
          (!savedOnly || savedIds.includes(tutor.id))
        );
    }).sort((first, second) => {
      const firstHearts = first.heartCount + (savedIds.includes(first.id) ? 1 : 0);
      const secondHearts = second.heartCount + (savedIds.includes(second.id) ? 1 : 0);
      return secondHearts - firstHearts
        || second.reviews - first.reviews
        || second.rating - first.rating;
    });
  })();

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
  const updateCourseFilter = (event) => {
    const { name, value } = event.target;
    setCourseFilters((current) => ({ ...current, [name]: value }));
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
              <GraduationCap size={15} /> CHỌN ĐÚNG THẦY, HỌC ĐÚNG CÁCH.
            </span>
            <h1 id="hero-title">
              Kết nối Học viên với
              <br />
              <span>Giáo viên, Trung Tâm Uy Tín</span>
            </h1>
            <p>
              Khám phá và lựa chọn giáo viên, trung tâm đào tạo cùng những khóa học phù hợp với nhu cầu, mục tiêu và lịch trình của bạn.
            </p>
            <div className="hero-actions">
              <Button
                className="edu-button"
                size="lg"
                onClick={() => {
                  scrollTo(courseRef.current, 'center');
                }}
              >
                <Search size={19} />
                Tìm kiếm lớp học
                <ArrowRight size={17} />
              </Button>
              <Button
                className="edu-button edu-button-outline"
                size="lg"
                onClick={() => {
                  scrollTo(filterRef.current, 'center');
                  document.getElementById('subject-filter')?.focus({ preventScroll: true });
                }}
              >
                <Search size={19} />
                Tìm kiếm giáo viên
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
        <section id="khoa-hoc" className="home-section course-section" ref={courseRef} aria-labelledby="courses-heading">
          <SectionHeading
            title={<span id="courses-heading">Lựa chọn <span className="accent-text">khóa học phù hợp</span></span>}
            description="Khám phá và phát triển bản thân qua các khóa học tại EduMatch."
          >
            <fieldset className="course-sort" aria-label="Sắp xếp khóa học">
              <legend className="sr-only">Sắp xếp khóa học</legend>
              <label>
                <input
                  type="radio"
                  name="course-sort"
                  value="newest"
                  checked={courseSort === 'newest'}
                  onChange={(event) => { setCourseSort(event.target.value); setCoursePage(1); }}
                />
                Hiển thị khóa học mới nhất
              </label>
              <label>
                <input
                  type="radio"
                  name="course-sort"
                  value="top-rated"
                  checked={courseSort === 'top-rated'}
                  onChange={(event) => { setCourseSort(event.target.value); setCoursePage(1); }}
                />
                Hiển thị theo lượt đánh giá
              </label>
            </fieldset>
          </SectionHeading>
          <form
            id="tim-khoa-hoc"
            className="course-search"
            aria-label="Tìm kiếm khóa học"
            onSubmit={(event) => {
              event.preventDefault();
              setAppliedCourseFilters(courseFilters);
              setCoursePage(1);
              setShowAllCourses(false);
            }}
          >
            <SubjectFilterField
              id="course-subject-filter"
              listId="course-subject-suggestions"
              label="Môn học / Từ khóa"
              value={courseFilters.subject}
              onChange={updateCourseFilter}
            />
            <FilterField
              id="course-mode-filter"
              label="Hình thức học"
              icon={Monitor}
              name="mode"
              value={courseFilters.mode}
              onChange={updateCourseFilter}
            >
              <option value="">Tất cả hình thức</option>
              <option value="online">Trực tuyến</option>
              <option value="in-person">Học trực tiếp</option>
              <option value="recorded">Video quay sẵn</option>
            </FilterField>
            <Button type="submit" className="edu-button course-search__submit">
              <Search size={18} />
              Tìm kiếm khóa học
            </Button>
          </form>
          <div className="course-grid">
            {visibleCourses.map((course) => <CourseCard key={course.id} course={course} />)}
          </div>
          {rankedCourses.length === 0 && (
            <div className="search-empty course-search__empty">
              <Search size={30} />
              <h3>Chưa tìm thấy khóa học phù hợp</h3>
              <p>Thử thay đổi môn học hoặc hình thức học.</p>
              <Button className="edu-button" onClick={() => { setCourseFilters(initialCourseFilters); setAppliedCourseFilters(initialCourseFilters); }}>
                Xóa bộ lọc
              </Button>
            </div>
          )}
          {rankedCourses.length > 6 && (
            <div className="course-pagination" aria-label="Điều hướng danh sách khóa học">
              {!showAllCourses ? (
                <button type="button" className="course-pagination__all" onClick={() => { setShowAllCourses(true); setCoursePage(1); }}>
                  Xem tất cả khóa học <ArrowRight size={16} />
                </button>
              ) : (
                <>
                  <button type="button" onClick={() => { setShowAllCourses(false); setCoursePage(1); }}>Thu gọn danh sách</button>
                  <div className="course-pagination__pages">
                    <button type="button" onClick={() => setCoursePage(1)} disabled={coursePage === 1}>Về đầu</button>
                    <button type="button" onClick={() => setCoursePage((current) => Math.max(1, current - 1))} disabled={coursePage === 1}>Trước</button>
                    {Array.from({ length: totalCoursePages }, (_, index) => index + 1).map((page) => (
                      <button type="button" key={page} className={page === coursePage ? 'is-current' : ''} aria-current={page === coursePage ? 'page' : undefined} onClick={() => setCoursePage(page)}>{page}</button>
                    ))}
                    <button type="button" onClick={() => setCoursePage((current) => Math.min(totalCoursePages, current + 1))} disabled={coursePage === totalCoursePages}>Trang sau</button>
                  </div>
                </>
              )}
            </div>
          )}
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
          <div id="tim-gia-su" className="tutor-search tutor-search--inline" ref={filterRef} aria-labelledby="search-title">
            <div className="search-panel-heading">
              <h3 id="search-title">
                <SlidersHorizontal size={21} />
                Tìm kiếm giáo viên, trung tâm phù hợp với bạn
              </h3>
              <span>Người đồng hành phù hợp. Hành trình khác biệt.</span>
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
                label="Hình thức giảng dạy"
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
              <FilterField
                label="Loại hồ sơ"
                icon={Users}
                name="provider"
                value={filters.provider}
                onChange={updateFilter}
              >
                <option value="">Giáo viên & Trung tâm</option>
                <option value="teacher">Giáo viên</option>
                <option value="center">Trung tâm đào tạo</option>
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
              <Button type="submit" className="edu-button search-submit">
                <Search size={18} />
                Tìm kiếm giáo viên
              </Button>
            </form>
          </div>
          {(isFiltered || savedIds.length > 0) && (
            <div className="results-toolbar">
              <span role="status">
                {isFiltered
                  ? `${filteredTutors.length} hồ sơ phù hợp${query ? ` với “${query}”` : ''}`
                  : 'Khám phá giáo viên và trung tâm nổi bật'}
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
              <h3>Chưa tìm thấy hồ sơ phù hợp</h3>
              <p>Thử chọn môn học, hình thức học hoặc khu vực khác.</p>
              <Button className="edu-button" onClick={resetSearch}>
                Xóa bộ lọc
              </Button>
            </div>
          )}
          <p className="sample-note">Hồ sơ giáo viên và trung tâm minh hoạ cho giao diện.</p>
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
            <a className="edu-button button-link" href="#tim-khoa-hoc">
              <Search size={18} />
              Tìm kiếm lớp học
            </a>
            <a className="edu-button edu-button-outline button-link" href="#tim-gia-su">
              <Search size={18} />
              Tìm kiếm giáo viên
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
