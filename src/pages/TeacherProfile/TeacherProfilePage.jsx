import { useRef, useState } from 'react';
import { Heart, ImagePlus, MessageCircle, Plus, Send, Star, Video, X } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { getAge, getCourses, getPosts, savePost, updatePost } from '@/features/learning/marketplace';
import { CourseCard } from '@/components/courses/CourseCard';
import '@/components/courses/course.css';
import '../Courses/courses.css';

export function TeacherProfilePage() {
  const { teacherId } = useParams();
  const { user } = useAuth();
  const [posts, setPosts] = useState(() => getPosts(teacherId));
  const [postText, setPostText] = useState('');
  const [media, setMedia] = useState(null);
  const [commentText, setCommentText] = useState({});
  const mediaInputRef = useRef(null);
  const courses = getCourses().filter((course) => course.teacher.id === teacherId);
  const profile = courses[0]?.teacher || (user?.id === teacherId && user?.role === 'teacher' ? user : null);
  const ownsProfile = user?.role === 'teacher' && user?.id === teacherId;
  if (!profile) return <section className="learning-page"><div className="learning-empty"><h1>Chưa có hồ sơ giáo viên</h1><p>Hồ sơ sẽ xuất hiện khi giáo viên công khai khóa học đầu tiên.</p><Link to={ROUTES.HOME}>Về trang chủ</Link></div></section>;
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
  const publish = (event) => { event.preventDefault(); if (!postText.trim() && !media) { toast.error('Hãy viết nội dung hoặc chọn ảnh/video để đăng.'); return; } const post = { id:`post-${Date.now()}`, teacherId, text:postText.trim(), media, createdAt:new Date().toISOString(), likes:[], comments:[] }; savePost(post); setPosts((current)=>[post,...current]); setPostText(''); clearMedia(); toast.success('Bài viết đã được đăng.'); };
  const like = (postId) => { if (!user) { toast.error('Vui lòng đăng nhập để tương tác.'); return; } const next = updatePost(postId, (post) => ({ ...post, likes: post.likes.includes(user.id) ? post.likes.filter((id)=>id !== user.id) : [...post.likes, user.id] })); setPosts(next.filter((post)=>post.teacherId===teacherId)); };
  const comment = (event, postId) => { event.preventDefault(); if (!user) { toast.error('Vui lòng đăng nhập để bình luận.'); return; } const text = commentText[postId]?.trim(); if (!text) return; const next = updatePost(postId, (post) => ({ ...post, comments:[...post.comments,{id:`comment-${Date.now()}`, author:user.name || 'Học viên EduMatch', text}] })); setPosts(next.filter((post)=>post.teacherId===teacherId)); setCommentText((current)=>({...current,[postId]:''})); };
  return <section className="learning-page teacher-public-page"><div className="learning-container">
    <header className="teacher-cover"><div className="teacher-cover__avatar">{profile.name?.slice(0,1)}</div><div><span>HỒ SƠ GIÁO VIÊN</span><h1>{profile.name}</h1><p>{getAge(profile.dob)} tuổi · {profile.qualifications || 'Đang cập nhật chuyên môn'}</p></div>{ownsProfile && <Link to={ROUTES.CREATE_COURSE}><Plus size={17} /> Thêm khóa học</Link>}</header>
    <div className="teacher-public-grid"><aside className="teacher-bio"><h2>Giới thiệu</h2><p>{profile.bio || 'Giáo viên đang hoàn thiện phần giới thiệu.'}</p><h3>Kinh nghiệm</h3><p>{profile.experience || 'Đang cập nhật'}</p><h3>Bằng cấp, chứng chỉ</h3><p>{profile.qualifications || 'Đang cập nhật'}</p></aside>
    <main className="teacher-feed"><section className="feed-heading"><h2>Hoạt động</h2><p>Những chia sẻ mới nhất từ giáo viên.</p></section>
      {ownsProfile && <form className="post-composer" onSubmit={publish}><textarea value={postText} onChange={(event)=>setPostText(event.target.value)} rows="3" placeholder="Chia sẻ tài liệu, một mẹo học tập hoặc lịch khai giảng mới..." />{media && <div className="post-composer__preview">{media.type === 'video' ? <video src={media.src} controls /> : <img src={media.src} alt="Xem trước tệp đính kèm" />}<button type="button" onClick={clearMedia} aria-label="Xóa tệp đính kèm"><X size={16} /></button><span>{media.name}</span></div>}<div className="post-composer__actions"><input ref={mediaInputRef} id="post-media" type="file" accept="image/*,video/*" onChange={chooseMedia} /><label htmlFor="post-media"><ImagePlus size={17} /> Ảnh <Video size={16} /> Video</label><small>Tối đa 3 MB</small><button type="submit"><Send size={16} /> Đăng bài</button></div></form>}
      {posts.length ? posts.map((post)=><article className="social-post" key={post.id}><div className="social-post__head"><span>{profile.name.slice(0,1)}</span><div><strong>{profile.name}</strong><small>Chia sẻ cùng cộng đồng EduMatch</small></div></div>{post.text && <p>{post.text}</p>}{post.media && <div className="social-post__media">{post.media.type === 'video' ? <video src={post.media.src} controls preload="metadata" /> : <img src={post.media.src} alt={`Nội dung do ${profile.name} chia sẻ`} />}</div>}<div className="social-post__actions"><button onClick={()=>like(post.id)} className={post.likes.includes(user?.id) ? 'is-liked':''}><Heart size={17} fill={post.likes.includes(user?.id) ? 'currentColor':'none'} /> {post.likes.length || ''} Thích</button><span><MessageCircle size={16} /> {post.comments.length} bình luận</span></div>{post.comments.map((item)=><p className="post-comment" key={item.id}><strong>{item.author}</strong>{item.text}</p>)}<form className="post-comment-form" onSubmit={(event)=>comment(event,post.id)}><input value={commentText[post.id] || ''} onChange={(event)=>setCommentText((current)=>({...current,[post.id]:event.target.value}))} placeholder="Viết bình luận..." /><button type="submit">Gửi</button></form></article>) : <div className="feed-empty"><Star size={23} /><p>Giáo viên chưa có bài viết nào.</p></div>}
    </main></div>
    <section className="teacher-courses"><div className="feed-heading"><h2>Khóa học đang mở</h2><p>{courses.length ? 'Khám phá các lộ trình mà giáo viên đang giảng dạy.' : 'Khóa học sẽ xuất hiện tại đây.'}</p></div>{courses.length > 0 && <div className="course-grid">{courses.map((course)=><CourseCard course={course} key={course.id} />)}</div>}</section>
  </div></section>;
}
