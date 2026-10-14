import { useEffect, useRef, useState } from 'react';
import { BadgeCheck, Camera, FileCheck2, FileText, Handshake, Heart, ImagePlus, MessageCircle, Phone, Plus, Save, Send, Star, Upload, Video, X } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { createConversationId, createNotification, deletePost, getAge, getCourses, getPosts, getProviderTrustCount, hasProviderTrust, saveConversation, savePost, syncTeacherCourseProfile, toggleProviderTrust, trackProviderAffinity, updatePost } from '@/features/learning/marketplace';
import { CourseCard } from '@/components/courses/CourseCard';
import { Modal } from '@/components/feedback/Modal';
import { ImageAttachment } from '@/components/forms/ImageAttachment';
import { ContentMenu } from '@/components/feedback/ContentMenu';
import { LikesModal } from '@/components/feedback/LikesModal';
import { submitOnPlainEnter } from '@/utils/submitOnPlainEnter';
import '@/components/courses/course.css';
import '../Courses/courses.css';
import { tutors } from '../Home/homeData';

const MAX_PROFILE_IMAGE_SIZE = 2 * 1024 * 1024;
const MAX_LICENSE_IMAGE_SIZE = 3 * 1024 * 1024;
const SHORT_BIO_MAX_LENGTH = 500;
const MAX_PORTFOLIO_IMAGES = 4;
const limitProfileText = (value, maxLength = SHORT_BIO_MAX_LENGTH) => String(value || '').slice(0, maxLength);

export function TeacherProfilePage() {
  const { teacherId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, updateUser } = useAuth();
  const [posts, setPosts] = useState(() => getPosts(teacherId));
  const [postText, setPostText] = useState('');
  const [media, setMedia] = useState(null);
  const [commentText, setCommentText] = useState({});
  const [commentMedia, setCommentMedia] = useState({});
  const [openContentMenu, setOpenContentMenu] = useState(null);
  const [likesTarget, setLikesTarget] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingDetailedProfile, setIsEditingDetailedProfile] = useState(false);
  const [isViewingDetailedProfile, setIsViewingDetailedProfile] = useState(false);
  const [isVerifyingLicense, setIsVerifyingLicense] = useState(false);
  const [profileDraft, setProfileDraft] = useState({});
  const [profileErrors, setProfileErrors] = useState({});
  const [detailedProfileDraft, setDetailedProfileDraft] = useState('');
  const [portfolioImagesDraft, setPortfolioImagesDraft] = useState([]);
  const [verificationDraft, setVerificationDraft] = useState({});
  const [verificationErrors, setVerificationErrors] = useState({});
  const [, setTrustRefresh] = useState(0);
  const mediaInputRef = useRef(null);
  const portfolioImagesInputRef = useRef(null);
  const courses = getCourses().filter((course) => course.teacher.id === teacherId);
  const ownsProfile = user?.id === teacherId;
  const sampleTutor = tutors.find((tutor) => tutor.id === teacherId);
  const sampleProfile = sampleTutor ? {
    id: sampleTutor.id,
    name: [sampleTutor.title, sampleTutor.name].filter(Boolean).join(' '),
    role: 'teacher',
    avatar: sampleTutor.image,
    experience: typeof sampleTutor.experience === 'number' ? `${sampleTutor.experience} năm kinh nghiệm` : sampleTutor.experience,
    qualifications: sampleTutor.qualifications || 'Đang cập nhật',
    bio: [sampleTutor.description, sampleTutor.bio].filter(Boolean).join(' '),
    heartCount: sampleTutor.heartCount,
    phone: sampleTutor.phone || '',
    isPhonePublic: Boolean(sampleTutor.isPhonePublic),
    detailedProfile: sampleTutor.detailedProfile || '',
    profilePortfolioImages: sampleTutor.profilePortfolioImages || [],
  } : null;
  const postProfile = getPosts().find((post) => post.authorId === teacherId || post.teacherId === teacherId);
  const profile = ownsProfile ? user : courses[0]?.teacher || sampleProfile || (postProfile ? {
    id: postProfile.authorId || postProfile.teacherId,
    name: postProfile.authorName || postProfile.author || 'Thành viên EduMatch',
    role: postProfile.authorRole || 'student',
    avatar: postProfile.authorAvatar || '',
    bio: 'Thành viên cộng đồng EduMatch',
  } : null);
  const isCenterProfile = profile?.role === 'center';
  const isTeacherProfile = profile?.role === 'teacher' || (!isCenterProfile && courses.length > 0);
  const isEducationProviderProfile = isTeacherProfile || isCenterProfile;
  const canCreateCourse = ownsProfile && ['teacher', 'center'].includes(user?.role);
  const publicPhone = isEducationProviderProfile && profile?.isPhonePublic && profile?.phone;
  const trustCount = getProviderTrustCount(profile?.id, profile?.heartCount);
  const trustedByCurrentUser = hasProviderTrust(user?.id, profile?.id);
  const hasDetailedProfile = Boolean(profile?.detailedProfile?.trim() || profile?.profilePortfolioImages?.length);
  const profileIntro = profile?.bio || (isCenterProfile ? 'Trung tâm đang hoàn thiện phần giới thiệu.' : isTeacherProfile ? 'Giáo viên đang hoàn thiện phần giới thiệu.' : 'Học viên đang hoàn thiện phần giới thiệu.');
  const shortProfileIntro = limitProfileText(profileIntro);
  const profileQualifications = limitProfileText(profile?.qualifications);
  const profileExperience = limitProfileText(profile?.experience);

  useEffect(() => {
    if (user?.id && profile?.id && user.id !== profile.id) trackProviderAffinity(user.id, profile.id, 'viewed-profile', 1);
  }, [profile?.id, user?.id]);

  if (!profile) return <section className="learning-page"><div className="learning-empty"><h1>Chưa có hồ sơ công khai</h1><p>Hồ sơ sẽ xuất hiện sau khi người dùng hoàn thiện thông tin hoặc công khai khóa học đầu tiên.</p><Link to={ROUTES.HOME}>Về trang chủ</Link></div></section>;

  const chooseProfileImage = (event, field) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Vui lòng chọn một tệp ảnh.'); return; }
    if (file.size > MAX_PROFILE_IMAGE_SIZE) { toast.error('Ảnh đại diện và ảnh bìa tối đa 2 MB.'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const image = String(reader.result);
      updateUser({ [field]: image });
      if (field === 'avatar' && ['teacher', 'center'].includes(user?.role)) syncTeacherCourseProfile(user.id, { avatar: image });
      toast.success(field === 'avatar' ? 'Đã cập nhật ảnh đại diện.' : 'Đã cập nhật ảnh bìa.');
    };
    reader.readAsDataURL(file);
  };
  const openProfileEditor = () => {
    setProfileDraft({
      name: user?.name || '',
      dob: user?.dob || '',
      qualifications: limitProfileText(user?.qualifications),
      experience: limitProfileText(user?.experience),
      bio: limitProfileText(user?.bio),
      foundedYear: user?.foundedYear || '',
      isPhonePublic: Boolean(user?.isPhonePublic),
    });
    setProfileErrors({});
    setIsEditingProfile(true);
  };
  const updateProfileDraft = (event) => {
    const { name, value, type, checked } = event.target;
    const nextValue = ['bio', 'qualifications', 'experience'].includes(name)
      ? limitProfileText(value)
      : value;
    setProfileDraft((current) => ({ ...current, [name]: type === 'checkbox' ? checked : nextValue }));
    if (profileErrors[name]) setProfileErrors((current) => ({ ...current, [name]: '' }));
  };
  const saveProfile = (event) => {
    event.preventDefault();
    const nextErrors = {};
    const requiredFields = user?.role === 'center' ? ['name', 'bio', 'foundedYear'] : user?.role === 'teacher' ? ['name', 'dob', 'qualifications', 'experience', 'bio'] : ['bio'];
    requiredFields.forEach((field) => {
      if (!String(profileDraft[field] || '').trim()) nextErrors[field] = 'Vui lòng điền thông tin này';
    });
    ['bio', 'qualifications', 'experience'].forEach((field) => {
      if (String(profileDraft[field] || '').length > SHORT_BIO_MAX_LENGTH) {
        nextErrors[field] = `Tối đa ${SHORT_BIO_MAX_LENGTH} ký tự`;
      }
    });
    setProfileErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    const updates = user?.role === 'center' ? {
      name: profileDraft.name.trim(),
      bio: limitProfileText(profileDraft.bio).trim(),
      foundedYear: profileDraft.foundedYear.trim(),
      isPhonePublic: Boolean(profileDraft.isPhonePublic),
    } : user?.role === 'teacher' ? {
      name: profileDraft.name.trim(),
      dob: profileDraft.dob,
      qualifications: limitProfileText(profileDraft.qualifications).trim(),
      experience: limitProfileText(profileDraft.experience).trim(),
      bio: limitProfileText(profileDraft.bio).trim(),
      isPhonePublic: Boolean(profileDraft.isPhonePublic),
    } : {
      bio: limitProfileText(profileDraft.bio).trim(),
    };
    updateUser(updates);
    if (['teacher', 'center'].includes(user?.role)) syncTeacherCourseProfile(user.id, updates);
    setIsEditingProfile(false);
    toast.success('Thông tin hồ sơ đã được cập nhật.');
  };
  const openDetailedProfileEditor = () => {
    setDetailedProfileDraft(user?.detailedProfile || '');
    setPortfolioImagesDraft(user?.profilePortfolioImages || []);
    setIsEditingDetailedProfile(true);
  };
  const addPortfolioImages = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const availableSlots = MAX_PORTFOLIO_IMAGES - portfolioImagesDraft.length;
    if (availableSlots <= 0) {
      toast.error(`Hồ sơ năng lực hiển thị tối đa ${MAX_PORTFOLIO_IMAGES} ảnh.`);
      return;
    }
    const validFiles = files.slice(0, availableSlots).filter((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error('Chỉ hỗ trợ tệp ảnh.');
        return false;
      }
      if (file.size > MAX_PROFILE_IMAGE_SIZE) {
        toast.error('Mỗi ảnh tối đa 2 MB.');
        return false;
      }
      return true;
    });
    Promise.all(validFiles.map((file) => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.readAsDataURL(file);
    }))).then((images) => setPortfolioImagesDraft((current) => [...current, ...images].slice(0, MAX_PORTFOLIO_IMAGES)));
    event.target.value = '';
  };
  const saveDetailedProfile = (event) => {
    event.preventDefault();
    updateUser({
      detailedProfile: detailedProfileDraft.trim(),
      profilePortfolioImages: portfolioImagesDraft,
    });
    setIsEditingDetailedProfile(false);
    toast.success('Hồ sơ năng lực đã được cập nhật.');
  };
  const openVerificationForm = () => {
    setVerificationDraft({
      centerName: user?.name || '',
      companyName: user?.companyName || '',
      taxCode: user?.taxCode || '',
      foundedYear: user?.foundedYear || '',
      address: user?.address || '',
      trainingField: user?.licenseVerification?.trainingField || 'other',
      businessLicense: user?.licenseVerification?.businessLicense || '',
      englishCenterLicense: user?.licenseVerification?.englishCenterLicense || '',
    });
    setVerificationErrors({});
    setIsVerifyingLicense(true);
  };
  const updateVerificationDraft = (event) => {
    const { name, value } = event.target;
    setVerificationDraft((current) => ({ ...current, [name]: value }));
    if (verificationErrors[name]) setVerificationErrors((current) => ({ ...current, [name]: '' }));
  };
  const chooseLicenseImage = (event, field) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Vui lòng tải lên tệp ảnh giấy phép.'); return; }
    if (file.size > MAX_LICENSE_IMAGE_SIZE) { toast.error('Ảnh giấy phép tối đa 3 MB.'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      setVerificationDraft((current) => ({ ...current, [field]: String(reader.result) }));
      setVerificationErrors((current) => ({ ...current, [field]: '' }));
    };
    reader.readAsDataURL(file);
  };
  const submitVerification = (event) => {
    event.preventDefault();
    const requiredFields = ['centerName', 'companyName', 'taxCode', 'foundedYear', 'address', 'businessLicense'];
    if (verificationDraft.trainingField === 'english') requiredFields.push('englishCenterLicense');
    const nextErrors = {};
    requiredFields.forEach((field) => {
      if (!String(verificationDraft[field] || '').trim()) nextErrors[field] = 'Vui lòng điền hoặc tải lên thông tin này';
    });
    if (!/^\d{4}$/.test(verificationDraft.foundedYear || '')) nextErrors.foundedYear = 'Năm thành lập gồm 4 chữ số';
    setVerificationErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    const licenseVerification = { ...verificationDraft, submittedAt: new Date().toISOString() };
    const updates = {
      name: verificationDraft.centerName.trim(),
      companyName: verificationDraft.companyName.trim(),
      taxCode: verificationDraft.taxCode.trim(),
      foundedYear: verificationDraft.foundedYear.trim(),
      address: verificationDraft.address.trim(),
      licenseVerificationStatus: 'pending',
      licenseVerification,
    };
    updateUser(updates);
    syncTeacherCourseProfile(user.id, { name: updates.name, foundedYear: updates.foundedYear, licenseVerificationStatus: updates.licenseVerificationStatus });
    setIsVerifyingLicense(false);
    toast.success('Hồ sơ giấy phép đã được gửi để EduMatch xét duyệt.');
  };
  const chooseMedia = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) { toast.error('Chỉ hỗ trợ tệp ảnh hoặc video.'); return; }
    if (file.size > 3 * 1024 * 1024) { toast.error('Vui lòng chọn tệp có dung lượng tối đa 3 MB.'); return; }
    const reader = new FileReader();
    reader.onload = () => setMedia({ src: String(reader.result), type: file.type.startsWith('video/') ? 'video' : 'image', name: file.name });
    reader.readAsDataURL(file);
  };
  const clearMedia = () => { setMedia(null); if (mediaInputRef.current) mediaInputRef.current.value = ''; };
  const publish = (event) => {
    event.preventDefault();
    if (!postText.trim() && !media) { toast.error('Hãy viết nội dung hoặc chọn ảnh/video để đăng.'); return; }
    const post = { id: `post-${Date.now()}`, teacherId, authorId: user.id, authorName: profile.name, authorRole: user.role, authorAvatar: profile.avatar || '', authorLicenseVerificationStatus: user.licenseVerificationStatus || '', text: postText.trim(), media, createdAt: new Date().toISOString(), likes: [], comments: [] };
    savePost(post); setPosts((current) => [post, ...current]); setPostText(''); clearMedia(); toast.success('Bài viết đã được đăng.');
  };
  const like = (postId) => {
    if (!user) { toast.error('Vui lòng đăng nhập để tương tác.'); return; }
    const next = updatePost(postId, (post) => {
      const likes = post.likes || [];
      const hasLiked = likes.includes(user.id);
      if (!hasLiked && (post.authorId || post.teacherId) !== user.id) {
        createNotification({ recipientId: post.authorId || post.teacherId, actorName: user.name || 'Một thành viên', actorAvatar: user.avatar || '', type: 'post_like', title: `${user.name || 'Một thành viên'} đã thích bài viết của bạn`, description: 'Bấm để xem bài viết trong Bảng Tin.', link: `${ROUTES.FEED}#${postId}` });
      }
      return { ...post, likes: hasLiked ? likes.filter((id) => id !== user.id) : [...likes, user.id] };
    });
    setPosts(next.filter((post) => post.teacherId === teacherId || post.authorId === teacherId));
  };
  const comment = (event, postId) => {
    event.preventDefault();
    if (!user) { toast.error('Vui lòng đăng nhập để bình luận.'); return; }
    const text = commentText[postId]?.trim();
    const media = commentMedia[postId] || null;
    if (!text && !media) return;
    const targetPost = getPosts().find((post) => post.id === postId);
    if ((targetPost?.authorId || targetPost?.teacherId) !== user.id) {
      createNotification({ recipientId: targetPost?.authorId || targetPost?.teacherId, actorName: user.name || 'Một thành viên', actorAvatar: user.avatar || '', type: 'post_comment', title: `${user.name || 'Một thành viên'} đã bình luận về bài viết của bạn`, description: text, link: `${ROUTES.FEED}#${postId}` });
    }
    const next = updatePost(postId, (post) => ({ ...post, comments: [...(post.comments || []), { id: `comment-${Date.now()}`, author: user.name || 'Thành viên EduMatch', authorId: user.id, authorName: user.name || 'Thành viên EduMatch', authorRole: user.role || 'student', authorAvatar: user.avatar || '', text, media, replies: [], createdAt: new Date().toISOString() }] }));
    setPosts(next.filter((post) => post.teacherId === teacherId || post.authorId === teacherId));
    setCommentText((current) => ({ ...current, [postId]: '' }));
    setCommentMedia((current) => ({ ...current, [postId]: null }));
  };
  const toggleProfileCommentLike = (postId, commentId) => {
    if (!user) { toast.error('Vui lòng đăng nhập để thích bình luận.'); return; }
    const next = updatePost(postId, (post) => ({
      ...post,
      comments: (post.comments || []).map((item) => {
        if (item.id !== commentId) return item;
        const likes = item.likes || [];
        return { ...item, likes: likes.includes(user.id) ? likes.filter((id) => id !== user.id) : [...likes, user.id] };
      }),
    }));
    setPosts(next.filter((item) => item.teacherId === teacherId || item.authorId === teacherId));
  };
  const ownsContent = (authorId) => Boolean(user?.id && authorId === user.id);
  const editProfilePost = (post) => {
    if (!ownsContent(post.authorId || post.teacherId)) return;
    const text = window.prompt('Chỉnh sửa bài viết', post.text || '');
    if (text === null) return;
    const next = updatePost(post.id, (current) => ({ ...current, text: text.trim() }));
    setPosts(next.filter((item) => item.teacherId === teacherId || item.authorId === teacherId));
  };
  const removeProfilePost = (post) => {
    if (!ownsContent(post.authorId || post.teacherId) || !window.confirm('Xóa bài viết này?')) return;
    const next = deletePost(post.id);
    setPosts(next.filter((item) => item.teacherId === teacherId || item.authorId === teacherId));
  };
  const editProfileComment = (postId, commentId) => {
    const post = posts.find((item) => item.id === postId);
    const target = post?.comments?.find((item) => item.id === commentId);
    if (!target || !ownsContent(target.authorId)) return;
    const text = window.prompt('Chỉnh sửa bình luận', target.text || '');
    if (text === null) return;
    const next = updatePost(postId, (current) => ({ ...current, comments: (current.comments || []).map((item) => item.id === commentId ? { ...item, text: text.trim() } : item) }));
    setPosts(next.filter((item) => item.teacherId === teacherId || item.authorId === teacherId));
  };
  const removeProfileComment = (postId, commentId) => {
    const post = posts.find((item) => item.id === postId);
    const target = post?.comments?.find((item) => item.id === commentId);
    if (!target || !ownsContent(target.authorId) || !window.confirm('Xóa bình luận này?')) return;
    const next = updatePost(postId, (current) => ({ ...current, comments: (current.comments || []).filter((item) => item.id !== commentId) }));
    setPosts(next.filter((item) => item.teacherId === teacherId || item.authorId === teacherId));
  };
  const messageProfile = () => {
    if (!isAuthenticated) { toast.error('Vui lòng đăng nhập để nhắn tin.'); navigate(ROUTES.LOGIN); return; }
    if (ownsProfile) return;
    saveConversation({
      id: createConversationId('conversation'),
      courseId: `profile-${profile.id}`,
      teacherId: profile.id,
      teacherName: profile.name,
      studentId: user.id,
      studentName: user.name || 'Thành viên EduMatch',
      senderId: user.id,
      text: `Chào ${profile.name}, mình muốn trao đổi thêm với bạn.`,
      createdAt: 'Vừa xong',
    });
    toast.success('Đã mở cuộc trò chuyện mới.');
    navigate(ROUTES.MESSAGES);
  };
  const trustProfile = () => {
    if (!isAuthenticated) { toast.error('Vui lòng đăng nhập để tin tưởng hồ sơ này.'); navigate(ROUTES.LOGIN); return; }
    const added = toggleProviderTrust(user.id, profile.id);
    if (added) {
      trackProviderAffinity(user.id, profile.id, 'saved-profile', 4);
      createNotification({ recipientId: profile.id, actorName: user.name || 'Một thành viên', actorAvatar: user.avatar || '', type: 'profile_like', title: `${user.name || 'Một thành viên'} đã tin tưởng hồ sơ của bạn`, description: 'Uy tín của bạn được cộng đồng EduMatch ghi nhận.', link: ROUTES.TEACHER_PROFILE(profile.id) });
    }
    setTrustRefresh((value) => value + 1);
    toast.success(added ? 'Đã thêm vào danh sách tin tưởng.' : 'Đã bỏ tin tưởng hồ sơ này.');
  };

  const coverStyle = profile.coverImage ? { backgroundImage: `url(${profile.coverImage})` } : undefined;
  const profileType = isCenterProfile ? 'TRUNG TÂM ĐÀO TẠO' : isTeacherProfile ? 'GIÁO VIÊN' : 'HỌC VIÊN';
  const subtitle = isCenterProfile ? 'Đối tác đào tạo của EduMatch' : isTeacherProfile ? `${getAge(profile.dob)} tuổi · ${profileQualifications || 'Đang cập nhật chuyên môn'}` : 'Học viên EduMatch';

  return <><section className="learning-page teacher-public-page"><div className="learning-container">
    <header className={`teacher-cover ${profile.coverImage ? 'has-custom-cover' : ''}`} style={coverStyle}>
      <div className="teacher-cover__avatar">{profile.avatar ? <img src={profile.avatar} alt={`Ảnh đại diện của ${profile.name}`} /> : profile.name?.slice(0, 1)}{ownsProfile && <label className="profile-avatar-upload" title="Cập nhật ảnh đại diện"><Camera size={15} /><input type="file" accept="image/*" onChange={(event) => chooseProfileImage(event, 'avatar')} /></label>}</div>
      <div><span>HỒ SƠ {profileType}</span><h1>{profile.name}</h1><p>{subtitle}</p>{isEducationProviderProfile && <small className={`teacher-cover__trust-count ${trustCount < 3 ? 'is-new' : ''}`}>{trustCount < 3 ? 'Mới trên EduMatch' : <><Heart size={14} fill="currentColor" /> {trustCount} lượt tin tưởng</>}</small>}{isCenterProfile && profile.licenseVerificationStatus === 'verified' && <span className="center-verification-badge"><BadgeCheck size={14} /> Đã xác thực pháp lý</span>}</div>
      {ownsProfile && <label className="profile-cover-upload teacher-cover__cover-upload"><ImagePlus size={16} /> Ảnh bìa<input type="file" accept="image/*" onChange={(event) => chooseProfileImage(event, 'coverImage')} /></label>}
    </header>
    <div className="teacher-public-grid"><aside className="teacher-bio"><h2>{isEducationProviderProfile ? 'Thông tin' : 'Thông Tin Cá Nhân'}</h2><div className="teacher-bio__overview"><h3>Thông tin tổng quan</h3>{ownsProfile && <button type="button" className="teacher-bio__edit-link" onClick={openProfileEditor}>Chỉnh sửa</button>}</div><p>{shortProfileIntro}</p>{isCenterProfile && <><h3>Năm thành lập</h3><p>{profile.foundedYear || 'Đang cập nhật'}</p></>}{isTeacherProfile && <><h3>Kinh nghiệm</h3><p>{profileExperience || 'Đang cập nhật'}</p><h3>Bằng cấp, chứng chỉ</h3><p>{profileQualifications || 'Đang cập nhật'}</p></>}{publicPhone && <><h3>Điện thoại liên hệ</h3><a className="teacher-bio__phone" href={`tel:${profile.phone.replace(/\s/g, '')}`}><Phone size={14} /> {profile.phone}</a></>}{isEducationProviderProfile && !ownsProfile && (hasDetailedProfile ? <button type="button" className="teacher-bio__portfolio" onClick={() => setIsViewingDetailedProfile(true)}><FileText size={15} /> Xem hồ sơ năng lực</button> : <p className="teacher-bio__portfolio-status">Hồ sơ năng lực đang được hoàn thiện.</p>)}{ownsProfile && canCreateCourse && <div className="teacher-bio__actions"><button type="button" className="teacher-bio__portfolio" onClick={openDetailedProfileEditor}><FileText size={15} /> {hasDetailedProfile ? 'Chỉnh sửa hồ sơ năng lực' : 'Tạo hồ sơ năng lực'}</button>{isCenterProfile && <>{user?.licenseVerificationStatus === 'verified' ? <span className="teacher-bio__verified"><BadgeCheck size={15} /> Đã xác thực pháp lý</span> : user?.licenseVerificationStatus === 'pending' ? <span className="teacher-bio__pending"><FileCheck2 size={15} /> Hồ sơ đang xét duyệt</span> : <button type="button" className="teacher-bio__verify" onClick={openVerificationForm}><FileCheck2 size={15} /> Yêu cầu xác minh giấy phép</button>}<Link className="teacher-bio__support" to={ROUTES.CENTER_SUPPORT}><Handshake size={15} /> Đăng ký tư vấn</Link></>}<Link className="teacher-bio__add-course" to={ROUTES.CREATE_COURSE}><Plus size={16} /> Thêm khóa học</Link></div>}</aside>
    <main className="teacher-feed"><section className="feed-heading teacher-feed__heading"><div><h2>Hoạt động</h2><p>{isCenterProfile ? 'Những chia sẻ mới nhất từ trung tâm.' : isTeacherProfile ? 'Những chia sẻ mới nhất từ giáo viên.' : 'Những chia sẻ mới nhất từ học viên.'}</p></div>{!ownsProfile && <div className="teacher-cover__public-actions"><button type="button" className="teacher-cover__message" onClick={messageProfile}><MessageCircle size={16} /> Nhắn tin</button><button type="button" className={`teacher-cover__trust ${trustedByCurrentUser ? 'is-trusted' : ''}`} onClick={trustProfile}><Heart size={16} fill={trustedByCurrentUser ? 'currentColor' : 'none'} /> {trustedByCurrentUser ? 'Đã tin tưởng' : 'Tin tưởng'}</button></div>}</section>
      {ownsProfile && <form className="post-composer" onSubmit={publish}><textarea value={postText} onChange={(event) => setPostText(event.target.value)} onKeyDown={submitOnPlainEnter} rows="3" placeholder="Chia sẻ suy nghĩ, tài liệu hoặc một trải nghiệm học tập..." />{media && <div className="post-composer__preview">{media.type === 'video' ? <video src={media.src} controls /> : <img src={media.src} alt="Xem trước tệp đính kèm" />}<button type="button" onClick={clearMedia} aria-label="Xóa tệp đính kèm"><X size={16} /></button><span>{media.name}</span></div>}<div className="post-composer__actions"><input ref={mediaInputRef} id="post-media" type="file" accept="image/*,video/*" onChange={chooseMedia} /><label htmlFor="post-media"><ImagePlus size={17} /> Ảnh <Video size={16} /> Video</label><small>Tối đa 3 MB</small><button type="submit"><Send size={16} /> Đăng bài</button></div></form>}
      {posts.length ? posts.map((post) => {
        const likes = post.likes || [];
        const comments = post.comments || [];
        return <article className="social-post" key={post.id}>
          <div className="social-post__head"><span>{profile.name.slice(0, 1)}</span><div><Link className="social-post__author" to={ROUTES.TEACHER_PROFILE(post.authorId || post.teacherId || profile.id)}>{post.authorName || post.author || profile.name}</Link>{isCenterProfile && profile.licenseVerificationStatus === 'verified' && <small className="post-verification-badge"><BadgeCheck size={12} /> Đã xác thực pháp lý</small>}<small>Chia sẻ cùng cộng đồng EduMatch</small></div></div>
          {ownsContent(post.authorId || post.teacherId) && <ContentMenu id={`post-${post.id}`} openId={openContentMenu} onToggle={setOpenContentMenu} onEdit={() => editProfilePost(post)} onDelete={() => removeProfilePost(post)} label="bài viết" />}
          {post.text && <p>{post.text}</p>}
          {post.media && <div className="social-post__media">{post.media.type === 'video' ? <video src={post.media.src} controls preload="metadata" /> : <img src={post.media.src} alt={`Nội dung do ${profile.name} chia sẻ`} />}</div>}
          <div className="social-post__actions"><button onClick={() => like(post.id)} className={likes.includes(user?.id) ? 'is-liked' : ''}><Heart size={17} fill={likes.includes(user?.id) ? 'currentColor' : 'none'} /> Thích</button>{likes.length > 0 && <button type="button" className="social-likes-count" onClick={() => setLikesTarget({ ids: likes, label: 'Những người đã thích bài viết này' })}>{likes.length} lượt thích</button>}<span><MessageCircle size={16} /> {comments.length} bình luận</span></div>
          {comments.map((item) => {
            const commentLikes = item.likes || [];
            const isCommentLiked = commentLikes.includes(user?.id);
            return <div className="post-comment" key={item.id}><div className="post-comment__head">{item.authorId ? <Link className="post-comment__author" to={ROUTES.TEACHER_PROFILE(item.authorId)}>{item.authorName || item.author}</Link> : <strong>{item.author}</strong>}{ownsContent(item.authorId) && <ContentMenu id={`comment-${item.id}`} openId={openContentMenu} onToggle={setOpenContentMenu} onEdit={() => editProfileComment(post.id, item.id)} onDelete={() => removeProfileComment(post.id, item.id)} label="bình luận" />}</div>{item.text && <span>{item.text}</span>}{item.media && (item.media.type === 'video' ? <video className="review-media" src={item.media.src} controls preload="metadata" /> : <img className="review-media" src={item.media.src} alt={`Ảnh đính kèm từ ${item.author}`} />)}<div className="post-comment__reaction"><button type="button" className={`post-comment__like ${isCommentLiked ? 'is-liked' : ''}`} onClick={() => toggleProfileCommentLike(post.id, item.id)}><Heart size={13} fill={isCommentLiked ? 'currentColor' : 'none'} /> Thích</button>{commentLikes.length > 0 && <button type="button" className="social-likes-count" onClick={() => setLikesTarget({ ids: commentLikes, label: 'Những người đã thích bình luận này' })}>{commentLikes.length} lượt thích</button>}</div></div>;
          })}
          <form className="post-comment-form" onSubmit={(event) => comment(event, post.id)}><textarea value={commentText[post.id] || ''} onChange={(event) => setCommentText((current) => ({ ...current, [post.id]: event.target.value }))} onKeyDown={submitOnPlainEnter} placeholder="Viết bình luận..." rows="1" /><ImageAttachment id={`profile-comment-image-${post.id}`} value={commentMedia[post.id] || null} onChange={(media) => setCommentMedia((current) => ({ ...current, [post.id]: media }))} label="Tệp" /><button type="submit">Gửi</button></form>
        </article>;
      }) : <div className="feed-empty"><Star size={23} /><p>{isCenterProfile ? 'Trung tâm chưa có bài viết nào.' : isTeacherProfile ? 'Giáo viên chưa có bài viết nào.' : 'Học viên chưa có bài viết nào.'}</p></div>}
    </main></div>
    {isEducationProviderProfile && <section className="teacher-courses"><div className="feed-heading"><h2>Khóa học đang mở</h2><p>{courses.length ? (isCenterProfile ? 'Khám phá các chương trình đào tạo của trung tâm.' : 'Khám phá các lộ trình mà giáo viên đang giảng dạy.') : 'Khóa học sẽ xuất hiện tại đây.'}</p></div>{courses.length > 0 && <div className="course-grid">{courses.map((course) => <CourseCard course={course} editable={canCreateCourse} key={course.id} />)}</div>}</section>}
  </div></section>
    <LikesModal target={likesTarget} onClose={() => setLikesTarget(null)} />
    <Modal
      open={isEditingProfile}
      onClose={() => setIsEditingProfile(false)}
      title={user?.role === 'center' ? 'Chỉnh sửa hồ sơ Trung tâm' : user?.role === 'teacher' ? 'Chỉnh sửa hồ sơ giáo viên' : 'Giới thiệu bản thân'}
      description={user?.role === 'center' ? 'Thông tin tổng quan này hiển thị công khai trên hồ sơ và các khóa học của trung tâm.' : user?.role === 'teacher' ? 'Thông tin tổng quan này hiển thị công khai trên hồ sơ và các khóa học của bạn.' : 'Chia sẻ thông tin tổng quan để cộng đồng EduMatch hiểu thêm về bạn.'}
      size="lg"
    >
      <form className="teacher-profile-editor" onSubmit={saveProfile} noValidate>
        {user?.role !== 'student' && <label>
          <span>{user?.role === 'center' ? 'Tên Trung tâm' : 'Họ và tên'}</span>
          <input name="name" value={profileDraft.name || ''} onChange={updateProfileDraft} autoComplete="name" />
          {profileErrors.name && <small>{profileErrors.name}</small>}
        </label>}
        {user?.role === 'center' && <label>
          <span>Năm thành lập</span>
          <input name="foundedYear" inputMode="numeric" maxLength="4" value={profileDraft.foundedYear || ''} onChange={updateProfileDraft} placeholder="Ví dụ: 2018" />
          {profileErrors.foundedYear && <small>{profileErrors.foundedYear}</small>}
        </label>}
        {user?.role === 'teacher' && <>
        <label>
          <span>Ngày tháng năm sinh</span>
          <input name="dob" type="date" value={profileDraft.dob || ''} onChange={updateProfileDraft} />
          {profileErrors.dob && <small>{profileErrors.dob}</small>}
        </label>
        <label>
          <span>Bằng cấp, chứng chỉ</span>
          <input name="qualifications" value={profileDraft.qualifications || ''} onChange={updateProfileDraft} maxLength={500} placeholder="Ví dụ: Cử nhân Sư phạm, IELTS 8.0" />
          {profileErrors.qualifications && <small>{profileErrors.qualifications}</small>}
        </label>
        <label>
          <span>Kinh nghiệm giảng dạy</span>
          <input name="experience" value={profileDraft.experience || ''} onChange={updateProfileDraft} maxLength={500} placeholder="Ví dụ: 5 năm giảng dạy tiếng Anh" />
          {profileErrors.experience && <small>{profileErrors.experience}</small>}
        </label>
        </>}
        <label className="teacher-profile-editor__full">
          <span>Thông tin tổng quan</span>
          <textarea name="bio" value={profileDraft.bio || ''} onChange={updateProfileDraft} rows="3" maxLength={SHORT_BIO_MAX_LENGTH} placeholder={user?.role === 'center' ? 'Nêu sơ lược lĩnh vực đào tạo, điểm nổi bật và giá trị trung tâm mang đến...' : user?.role === 'teacher' ? 'Nêu sơ lược chuyên môn, phong cách giảng dạy hoặc điều bạn muốn học viên biết...' : 'Chia sẻ ngắn gọn điều bạn muốn cộng đồng biết về mình...'} />
          <small className={`teacher-profile-editor__counter ${String(profileDraft.bio || '').length >= SHORT_BIO_MAX_LENGTH ? 'is-limit' : ''}`}>{String(profileDraft.bio || '').length}/{SHORT_BIO_MAX_LENGTH} ký tự</small>
          {profileErrors.bio && <small>{profileErrors.bio}</small>}
        </label>
        {user?.role !== 'student' && <label className="teacher-profile-editor__phone-visibility teacher-profile-editor__full">
          <input name="isPhonePublic" type="checkbox" checked={Boolean(profileDraft.isPhonePublic)} onChange={updateProfileDraft} />
          <span><strong>Công khai số điện thoại</strong><small>Số điện thoại sẽ hiển thị trên hồ sơ, danh sách tìm kiếm và khóa học của bạn.</small></span>
        </label>}
        <div className="teacher-profile-editor__actions">
          <button type="button" onClick={() => setIsEditingProfile(false)}>Hủy</button>
          <button type="submit"><Save size={16} /> Lưu thông tin</button>
        </div>
      </form>
    </Modal>
    <Modal
      open={isEditingDetailedProfile}
      onClose={() => setIsEditingDetailedProfile(false)}
      title="Hồ sơ năng lực"
      description="Trình bày đầy đủ về chuyên môn, phương pháp, đội ngũ hoặc các dấu ấn của bạn. Nội dung này không giới hạn ký tự."
      size="lg"
    >
      <form className="teacher-profile-editor detailed-profile-editor" onSubmit={saveDetailedProfile}>
        <label className="teacher-profile-editor__full">
          <span>Nội dung hồ sơ</span>
          <textarea value={detailedProfileDraft} onChange={(event) => setDetailedProfileDraft(event.target.value)} rows="12" placeholder={isCenterProfile ? 'Giới thiệu đầy đủ về trung tâm, đội ngũ, phương pháp đào tạo, không gian học tập và những giá trị bạn theo đuổi...' : 'Giới thiệu đầy đủ về chuyên môn, phương pháp giảng dạy, kinh nghiệm và các dấu ấn của bạn...'} />
        </label>
        <div className="profile-portfolio-editor teacher-profile-editor__full">
          <div><strong>Hình ảnh minh họa</strong><small>Tối đa {MAX_PORTFOLIO_IMAGES} ảnh, mỗi ảnh không quá 2 MB.</small></div>
          {portfolioImagesDraft.length > 0 && <div className="profile-portfolio-editor__gallery">{portfolioImagesDraft.map((image, index) => <figure key={`${image.slice(0, 24)}-${index}`}><img src={image} alt={`Ảnh minh họa hồ sơ năng lực ${index + 1}`} /><button type="button" onClick={() => setPortfolioImagesDraft((current) => current.filter((_, imageIndex) => imageIndex !== index))} aria-label={`Xóa ảnh ${index + 1}`}><X size={15} /></button></figure>)}</div>}
          {portfolioImagesDraft.length < MAX_PORTFOLIO_IMAGES && <label className="profile-portfolio-editor__upload"><ImagePlus size={17} /> Thêm ảnh<input ref={portfolioImagesInputRef} type="file" accept="image/*" multiple onChange={addPortfolioImages} /></label>}
        </div>
        <div className="teacher-profile-editor__actions">
          <button type="button" onClick={() => setIsEditingDetailedProfile(false)}>Hủy</button>
          <button type="submit"><Save size={16} /> Lưu hồ sơ năng lực</button>
        </div>
      </form>
    </Modal>
    <Modal
      open={isViewingDetailedProfile}
      onClose={() => setIsViewingDetailedProfile(false)}
      title="Hồ sơ năng lực"
      description={`Thông tin do ${profile.name} cung cấp.`}
      size="lg"
    >
      {hasDetailedProfile ? <article className="profile-portfolio-view"><p>{profile.detailedProfile}</p>{profile.profilePortfolioImages?.length > 0 && <div className="profile-portfolio-view__gallery">{profile.profilePortfolioImages.map((image, index) => <img key={`${image.slice(0, 24)}-${index}`} src={image} alt={`Hình ảnh hồ sơ năng lực ${index + 1} của ${profile.name}`} />)}</div>}</article> : <div className="profile-portfolio-view__empty"><FileText size={22} /><p>{isCenterProfile ? 'Trung tâm đang hoàn thiện hồ sơ năng lực.' : 'Giáo viên đang hoàn thiện hồ sơ năng lực.'}</p></div>}
    </Modal>
    <Modal
      open={isVerifyingLicense}
      onClose={() => setIsVerifyingLicense(false)}
      title="Xác minh giấy phép hoạt động"
      description="EduMatch sẽ kiểm tra hồ sơ trước khi hiển thị nhãn xác thực công khai."
      size="lg"
    >
      <form className="teacher-profile-editor center-verification-form" onSubmit={submitVerification} noValidate>
        <label><span>Tên trung tâm</span><input name="centerName" value={verificationDraft.centerName || ''} onChange={updateVerificationDraft} />{verificationErrors.centerName && <small>{verificationErrors.centerName}</small>}</label>
        <label><span>Tên công ty</span><input name="companyName" value={verificationDraft.companyName || ''} onChange={updateVerificationDraft} />{verificationErrors.companyName && <small>{verificationErrors.companyName}</small>}</label>
        <label><span>Mã số thuế</span><input name="taxCode" value={verificationDraft.taxCode || ''} onChange={updateVerificationDraft} inputMode="numeric" />{verificationErrors.taxCode && <small>{verificationErrors.taxCode}</small>}</label>
        <label><span>Năm thành lập</span><input name="foundedYear" value={verificationDraft.foundedYear || ''} onChange={(event) => updateVerificationDraft({ target: { name: 'foundedYear', value: event.target.value.replace(/\D/g, '') } })} inputMode="numeric" maxLength="4" placeholder="Ví dụ: 2018" />{verificationErrors.foundedYear && <small>{verificationErrors.foundedYear}</small>}</label>
        <label className="teacher-profile-editor__full"><span>Địa điểm hoạt động</span><input name="address" value={verificationDraft.address || ''} onChange={updateVerificationDraft} placeholder="Số nhà, đường, phường/xã, tỉnh/thành phố" />{verificationErrors.address && <small>{verificationErrors.address}</small>}</label>
        <label className="teacher-profile-editor__full"><span>Lĩnh vực đào tạo</span><select name="trainingField" value={verificationDraft.trainingField || 'other'} onChange={updateVerificationDraft}><option value="other">Lĩnh vực đào tạo khác</option><option value="english">Trung tâm tiếng Anh</option></select></label>
        <label className="license-upload teacher-profile-editor__full"><span>Ảnh giấy phép đăng ký doanh nghiệp</span><input type="file" accept="image/*" onChange={(event) => chooseLicenseImage(event, 'businessLicense')} />{verificationDraft.businessLicense ? <img src={verificationDraft.businessLicense} alt="Giấy phép đăng ký doanh nghiệp đã tải lên" /> : <em><Upload size={17} /> Tải lên ảnh giấy phép, tối đa 3 MB</em>}{verificationErrors.businessLicense && <small>{verificationErrors.businessLicense}</small>}</label>
        {verificationDraft.trainingField === 'english' && <label className="license-upload teacher-profile-editor__full"><span>Ảnh giấy phép thành lập trung tâm tiếng Anh</span><input type="file" accept="image/*" onChange={(event) => chooseLicenseImage(event, 'englishCenterLicense')} />{verificationDraft.englishCenterLicense ? <img src={verificationDraft.englishCenterLicense} alt="Giấy phép thành lập trung tâm tiếng Anh đã tải lên" /> : <em><Upload size={17} /> Tải lên ảnh giấy phép, tối đa 3 MB</em>}{verificationErrors.englishCenterLicense && <small>{verificationErrors.englishCenterLicense}</small>}</label>}
        <div className="teacher-profile-editor__actions"><button type="button" onClick={() => setIsVerifyingLicense(false)}>Hủy</button><button type="submit"><FileCheck2 size={16} /> Gửi hồ sơ xét duyệt</button></div>
      </form>
    </Modal>
  </>;
}
