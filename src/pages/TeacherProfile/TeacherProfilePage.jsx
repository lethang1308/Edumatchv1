import { useRef, useState } from 'react';
import { Camera, Handshake, Heart, ImagePlus, MessageCircle, Pencil, Plus, Save, Send, Star, Video, X } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { getAge, getCourses, getPosts, savePost, syncTeacherCourseProfile, updatePost } from '@/features/learning/marketplace';
import { CourseCard } from '@/components/courses/CourseCard';
import { Modal } from '@/components/feedback/Modal';
import '@/components/courses/course.css';
import '../Courses/courses.css';

const MAX_PROFILE_IMAGE_SIZE = 2 * 1024 * 1024;

export function TeacherProfilePage() {
  const { teacherId } = useParams();
  const { user, updateUser } = useAuth();
  const [posts, setPosts] = useState(() => getPosts(teacherId));
  const [postText, setPostText] = useState('');
  const [media, setMedia] = useState(null);
  const [commentText, setCommentText] = useState({});
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState({});
  const [profileErrors, setProfileErrors] = useState({});
  const mediaInputRef = useRef(null);
  const courses = getCourses().filter((course) => course.teacher.id === teacherId);
  const ownsProfile = user?.id === teacherId;
  const profile = ownsProfile ? user : courses[0]?.teacher || null;
  const isCenterProfile = profile?.role === 'center';
  const isTeacherProfile = profile?.role === 'teacher' || (!isCenterProfile && courses.length > 0);
  const isEducationProviderProfile = isTeacherProfile || isCenterProfile;
  const canCreateCourse = ownsProfile && ['teacher', 'center'].includes(user?.role);

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
      qualifications: user?.qualifications || '',
      experience: user?.experience || '',
      bio: user?.bio || '',
    });
    setProfileErrors({});
    setIsEditingProfile(true);
  };
  const updateProfileDraft = (event) => {
    const { name, value } = event.target;
    setProfileDraft((current) => ({ ...current, [name]: value }));
    if (profileErrors[name]) setProfileErrors((current) => ({ ...current, [name]: '' }));
  };
  const saveProfile = (event) => {
    event.preventDefault();
    const nextErrors = {};
    const requiredFields = user?.role === 'center' ? ['name', 'bio'] : user?.role === 'teacher' ? ['name', 'dob', 'qualifications', 'experience', 'bio'] : ['bio'];
    requiredFields.forEach((field) => {
      if (!String(profileDraft[field] || '').trim()) nextErrors[field] = 'Vui lòng điền thông tin này';
    });
    setProfileErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    const updates = user?.role === 'center' ? {
      name: profileDraft.name.trim(),
      bio: profileDraft.bio.trim(),
    } : user?.role === 'teacher' ? {
      name: profileDraft.name.trim(),
      dob: profileDraft.dob,
      qualifications: profileDraft.qualifications.trim(),
      experience: profileDraft.experience.trim(),
      bio: profileDraft.bio.trim(),
    } : {
      bio: profileDraft.bio.trim(),
    };
    updateUser(updates);
    if (['teacher', 'center'].includes(user?.role)) syncTeacherCourseProfile(user.id, updates);
    setIsEditingProfile(false);
    toast.success('Thông tin hồ sơ đã được cập nhật.');
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
    const post = { id: `post-${Date.now()}`, teacherId, text: postText.trim(), media, createdAt: new Date().toISOString(), likes: [], comments: [] };
    savePost(post); setPosts((current) => [post, ...current]); setPostText(''); clearMedia(); toast.success('Bài viết đã được đăng.');
  };
  const like = (postId) => {
    if (!user) { toast.error('Vui lòng đăng nhập để tương tác.'); return; }
    const next = updatePost(postId, (post) => {
      const likes = post.likes || [];
      return { ...post, likes: likes.includes(user.id) ? likes.filter((id) => id !== user.id) : [...likes, user.id] };
    });
    setPosts(next.filter((post) => post.teacherId === teacherId));
  };
  const comment = (event, postId) => {
    event.preventDefault();
    if (!user) { toast.error('Vui lòng đăng nhập để bình luận.'); return; }
    const text = commentText[postId]?.trim();
    if (!text) return;
    const next = updatePost(postId, (post) => ({ ...post, comments: [...(post.comments || []), { id: `comment-${Date.now()}`, author: user.name || 'Thành viên EduMatch', text }] }));
    setPosts(next.filter((post) => post.teacherId === teacherId));
    setCommentText((current) => ({ ...current, [postId]: '' }));
  };

  const coverStyle = profile.coverImage ? { backgroundImage: `url(${profile.coverImage})` } : undefined;
  const profileType = isCenterProfile ? 'TRUNG TÂM ĐÀO TẠO' : isTeacherProfile ? 'GIÁO VIÊN' : 'HỌC VIÊN';
  const subtitle = isCenterProfile ? 'Đối tác đào tạo của EduMatch' : isTeacherProfile ? `${getAge(profile.dob)} tuổi · ${profile.qualifications || 'Đang cập nhật chuyên môn'}` : 'Học viên EduMatch';

  return <><section className="learning-page teacher-public-page"><div className="learning-container">
    <header className={`teacher-cover ${profile.coverImage ? 'has-custom-cover' : ''}`} style={coverStyle}>
      <div className="teacher-cover__avatar">{profile.avatar ? <img src={profile.avatar} alt={`Ảnh đại diện của ${profile.name}`} /> : profile.name?.slice(0, 1)}{ownsProfile && <label className="profile-avatar-upload" title="Cập nhật ảnh đại diện"><Camera size={15} /><input type="file" accept="image/*" onChange={(event) => chooseProfileImage(event, 'avatar')} /></label>}</div>
      <div><span>HỒ SƠ {profileType}</span><h1>{profile.name}</h1><p>{subtitle}</p></div>
      {ownsProfile && <label className="profile-cover-upload teacher-cover__cover-upload"><ImagePlus size={16} /> Ảnh bìa<input type="file" accept="image/*" onChange={(event) => chooseProfileImage(event, 'coverImage')} /></label>}
    </header>
    <div className="teacher-public-grid"><aside className="teacher-bio"><h2>{isEducationProviderProfile ? 'Hồ Sơ Năng Lực' : 'Thông Tin Cá Nhân'}</h2><p>{profile.bio || (isCenterProfile ? 'Trung tâm đang hoàn thiện phần giới thiệu.' : isTeacherProfile ? 'Giáo viên đang hoàn thiện phần giới thiệu.' : 'Học viên đang hoàn thiện phần giới thiệu.')}</p>{isTeacherProfile && <><h3>Kinh nghiệm</h3><p>{profile.experience || 'Đang cập nhật'}</p><h3>Bằng cấp, chứng chỉ</h3><p>{profile.qualifications || 'Đang cập nhật'}</p></>}{ownsProfile && canCreateCourse && <div className="teacher-bio__actions"><button type="button" className="teacher-bio__edit" onClick={openProfileEditor}><Pencil size={15} /> Chỉnh sửa hồ sơ</button>{isCenterProfile && <Link className="teacher-bio__support" to={ROUTES.CENTER_SUPPORT}><Handshake size={15} /> Đăng ký tư vấn</Link>}<Link className="teacher-bio__add-course" to={ROUTES.CREATE_COURSE}><Plus size={16} /> Thêm khóa học</Link></div>}{ownsProfile && !isEducationProviderProfile && <button type="button" className="teacher-bio__edit" onClick={openProfileEditor}><Pencil size={15} /> {profile.bio ? 'Chỉnh sửa giới thiệu bản thân' : 'Thêm giới thiệu bản thân'}</button>}</aside>
    <main className="teacher-feed"><section className="feed-heading"><h2>Hoạt động</h2><p>{isCenterProfile ? 'Những chia sẻ mới nhất từ trung tâm.' : isTeacherProfile ? 'Những chia sẻ mới nhất từ giáo viên.' : 'Những chia sẻ mới nhất từ học viên.'}</p></section>
      {ownsProfile && <form className="post-composer" onSubmit={publish}><textarea value={postText} onChange={(event) => setPostText(event.target.value)} rows="3" placeholder="Chia sẻ suy nghĩ, tài liệu hoặc một trải nghiệm học tập..." />{media && <div className="post-composer__preview">{media.type === 'video' ? <video src={media.src} controls /> : <img src={media.src} alt="Xem trước tệp đính kèm" />}<button type="button" onClick={clearMedia} aria-label="Xóa tệp đính kèm"><X size={16} /></button><span>{media.name}</span></div>}<div className="post-composer__actions"><input ref={mediaInputRef} id="post-media" type="file" accept="image/*,video/*" onChange={chooseMedia} /><label htmlFor="post-media"><ImagePlus size={17} /> Ảnh <Video size={16} /> Video</label><small>Tối đa 3 MB</small><button type="submit"><Send size={16} /> Đăng bài</button></div></form>}
      {posts.length ? posts.map((post) => { const likes = post.likes || []; const comments = post.comments || []; return <article className="social-post" key={post.id}><div className="social-post__head"><span>{profile.name.slice(0, 1)}</span><div><strong>{profile.name}</strong><small>Chia sẻ cùng cộng đồng EduMatch</small></div></div>{post.text && <p>{post.text}</p>}{post.media && <div className="social-post__media">{post.media.type === 'video' ? <video src={post.media.src} controls preload="metadata" /> : <img src={post.media.src} alt={`Nội dung do ${profile.name} chia sẻ`} />}</div>}<div className="social-post__actions"><button onClick={() => like(post.id)} className={likes.includes(user?.id) ? 'is-liked' : ''}><Heart size={17} fill={likes.includes(user?.id) ? 'currentColor' : 'none'} /> {likes.length || ''} Thích</button><span><MessageCircle size={16} /> {comments.length} bình luận</span></div>{comments.map((item) => <p className="post-comment" key={item.id}><strong>{item.author}</strong>{item.text}</p>)}<form className="post-comment-form" onSubmit={(event) => comment(event, post.id)}><input value={commentText[post.id] || ''} onChange={(event) => setCommentText((current) => ({ ...current, [post.id]: event.target.value }))} placeholder="Viết bình luận..." /><button type="submit">Gửi</button></form></article>; }) : <div className="feed-empty"><Star size={23} /><p>{isCenterProfile ? 'Trung tâm chưa có bài viết nào.' : isTeacherProfile ? 'Giáo viên chưa có bài viết nào.' : 'Học viên chưa có bài viết nào.'}</p></div>}
    </main></div>
    {isEducationProviderProfile && <section className="teacher-courses"><div className="feed-heading"><h2>Khóa học đang mở</h2><p>{courses.length ? (isCenterProfile ? 'Khám phá các chương trình đào tạo của trung tâm.' : 'Khám phá các lộ trình mà giáo viên đang giảng dạy.') : 'Khóa học sẽ xuất hiện tại đây.'}</p></div>{courses.length > 0 && <div className="course-grid">{courses.map((course) => <CourseCard course={course} editable={canCreateCourse} key={course.id} />)}</div>}</section>}
  </div></section>
    <Modal
      open={isEditingProfile}
      onClose={() => setIsEditingProfile(false)}
      title={user?.role === 'center' ? 'Chỉnh sửa hồ sơ Trung tâm' : user?.role === 'teacher' ? 'Chỉnh sửa hồ sơ giáo viên' : 'Giới thiệu bản thân'}
      description={user?.role === 'center' ? 'Tên và mô tả này sẽ hiển thị công khai trên hồ sơ và các khóa học của trung tâm.' : user?.role === 'teacher' ? 'Thông tin này sẽ hiển thị công khai trên hồ sơ và các khóa học của bạn.' : 'Chia sẻ ngắn gọn để cộng đồng EduMatch hiểu thêm về bạn.'}
      size="lg"
    >
      <form className="teacher-profile-editor" onSubmit={saveProfile} noValidate>
        {user?.role !== 'student' && <label>
          <span>{user?.role === 'center' ? 'Tên Trung tâm' : 'Họ và tên'}</span>
          <input name="name" value={profileDraft.name || ''} onChange={updateProfileDraft} autoComplete="name" />
          {profileErrors.name && <small>{profileErrors.name}</small>}
        </label>}
        {user?.role === 'teacher' && <>
        <label>
          <span>Ngày tháng năm sinh</span>
          <input name="dob" type="date" value={profileDraft.dob || ''} onChange={updateProfileDraft} />
          {profileErrors.dob && <small>{profileErrors.dob}</small>}
        </label>
        <label>
          <span>Bằng cấp, chứng chỉ</span>
          <input name="qualifications" value={profileDraft.qualifications || ''} onChange={updateProfileDraft} placeholder="Ví dụ: Cử nhân Sư phạm, IELTS 8.0" />
          {profileErrors.qualifications && <small>{profileErrors.qualifications}</small>}
        </label>
        <label>
          <span>Kinh nghiệm giảng dạy</span>
          <input name="experience" value={profileDraft.experience || ''} onChange={updateProfileDraft} placeholder="Ví dụ: 5 năm giảng dạy tiếng Anh" />
          {profileErrors.experience && <small>{profileErrors.experience}</small>}
        </label>
        </>}
        <label className="teacher-profile-editor__full">
          <span>{user?.role === 'center' ? 'Mô tả chi tiết về Trung tâm' : user?.role === 'teacher' ? 'Giới thiệu về bản thân' : 'Thông Tin Cá Nhân'}</span>
          <textarea name="bio" value={profileDraft.bio || ''} onChange={updateProfileDraft} rows="4" placeholder={user?.role === 'center' ? 'Chia sẻ về chương trình đào tạo, đội ngũ và giá trị của trung tâm...' : user?.role === 'teacher' ? 'Chia sẻ về phương pháp và phong cách giảng dạy của bạn...' : 'Hãy giới thiệu về bản thân mình'} />
          {profileErrors.bio && <small>{profileErrors.bio}</small>}
        </label>
        <div className="teacher-profile-editor__actions">
          <button type="button" onClick={() => setIsEditingProfile(false)}>Hủy</button>
          <button type="submit"><Save size={16} /> Lưu thông tin</button>
        </div>
      </form>
    </Modal>
  </>;
}
