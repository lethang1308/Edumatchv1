import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BadgeCheck, BookOpen, CornerDownRight, Heart, Image as ImageIcon, MessageCircle, Newspaper, Send, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createNotification, getCourses, getPosts, getProviderAffinity, trackProviderAffinity, updatePost } from '@/features/learning/marketplace';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import './feed.css';

const roleLabel = (role) => role === 'center' ? 'Trung tâm đào tạo' : role === 'student' ? 'Học viên EduMatch' : 'Giáo viên EduMatch';

const getAuthor = (item, providers) => {
  const provider = providers.get(item.authorId || item.teacherId);
  return {
    id: item.authorId || item.teacherId || '',
    name: item.authorName || item.author || provider?.name || 'Thành viên EduMatch',
    role: item.authorRole || provider?.role || 'teacher',
    avatar: item.authorAvatar || provider?.avatar || '',
  };
};

const shortTime = (dateValue) => {
  if (!dateValue) return 'Vừa xong';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 'Vừa xong';
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(date);
};

const interactionScore = (post) =>
  (post.likes || []).length * 2 + (post.comments || []).reduce((total, comment) => total + 3 + (comment.replies || []).length * 2, 0);

const affinityScore = (post, affinity) => {
  const providerId = post.authorId || post.teacherId;
  const alternateId = providerId?.startsWith('teacher-') ? providerId.slice('teacher-'.length) : `teacher-${providerId}`;
  return Number(affinity[providerId] || affinity[alternateId] || 0);
};

export function FeedPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState(() => getPosts().slice().sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt)));
  const [commentDrafts, setCommentDrafts] = useState({});
  const [replyTarget, setReplyTarget] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [feedTab, setFeedTab] = useState('providers');
  const providers = useMemo(() => new Map(getCourses().map((course) => [course.teacher.id, course.teacher])), []);
  const rankedPosts = useMemo(() => {
    const affinity = getProviderAffinity(user?.id);
    return posts.slice().sort((first, second) => {
      const firstAffinity = affinityScore(first, affinity);
      const secondAffinity = affinityScore(second, affinity);
      if (firstAffinity || secondAffinity) return secondAffinity - firstAffinity || new Date(second.createdAt) - new Date(first.createdAt);
      const interactionDifference = interactionScore(second) - interactionScore(first);
      return interactionDifference || new Date(second.createdAt) - new Date(first.createdAt);
    });
  }, [posts, user?.id]);
  const visiblePosts = rankedPosts.filter((post) => (feedTab === 'students' ? getAuthor(post, providers).role === 'student' : getAuthor(post, providers).role !== 'student'));

  useEffect(() => {
    const postId = window.location.hash.slice(1);
    if (!postId) return undefined;
    const timer = window.setTimeout(() => document.getElementById(postId)?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 0);
    return () => window.clearTimeout(timer);
  }, [posts]);

  const requireAuth = () => {
    if (isAuthenticated) return true;
    toast.error('Vui lòng đăng nhập để tương tác với Bảng Tin.');
    navigate(ROUTES.LOGIN);
    return false;
  };

  const saveInteraction = (postId, transform) => {
    const next = updatePost(postId, transform);
    setPosts(next.slice().sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt)));
  };

  const toggleLike = (postId) => {
    if (!requireAuth()) return;
    saveInteraction(postId, (post) => {
      const likes = post.likes || [];
      const hasLiked = likes.includes(user.id);
      if (!hasLiked && (post.authorId || post.teacherId) !== user.id) {
        trackProviderAffinity(user.id, post.authorId || post.teacherId, 'liked-post', 3);
        createNotification({
          recipientId: post.authorId || post.teacherId,
          actorName: user.name || 'Một thành viên',
          actorAvatar: user.avatar || '',
          type: 'post_like',
          title: `${user.name || 'Một thành viên'} đã thích bài viết của bạn`,
          description: 'Bấm để xem bài viết trong Bảng Tin.',
          link: `${ROUTES.FEED}#${postId}`,
        });
      }
      return { ...post, likes: hasLiked ? likes.filter((id) => id !== user.id) : [...likes, user.id] };
    });
  };

  const submitComment = (event, postId) => {
    event.preventDefault();
    if (!requireAuth()) return;
    const text = commentDrafts[postId]?.trim();
    if (!text) return;
    const comment = {
      id: `comment-${Date.now()}`,
      authorId: user.id,
      authorName: user.name || 'Thành viên EduMatch',
      authorRole: user.role || 'student',
      authorAvatar: user.avatar || '',
      text,
      createdAt: new Date().toISOString(),
      replies: [],
    };
    const postAuthorId = getPosts().find((post) => post.id === postId)?.authorId || getPosts().find((post) => post.id === postId)?.teacherId;
    trackProviderAffinity(user.id, postAuthorId, 'commented-post', 2);
    if (postAuthorId !== user.id) {
      const post = getPosts().find((item) => item.id === postId);
      createNotification({
        recipientId: post?.authorId || post?.teacherId,
        actorName: user.name || 'Một thành viên',
        actorAvatar: user.avatar || '',
        type: 'post_comment',
        title: `${user.name || 'Một thành viên'} đã bình luận về bài viết của bạn`,
        description: text,
        link: `${ROUTES.FEED}#${postId}`,
      });
    }
    saveInteraction(postId, (post) => ({ ...post, comments: [...(post.comments || []), comment] }));
    setCommentDrafts((current) => ({ ...current, [postId]: '' }));
  };

  const openReply = (postId, commentId) => {
    if (!requireAuth()) return;
    setReplyTarget({ postId, commentId });
    setReplyText('');
  };

  const submitReply = (event) => {
    event.preventDefault();
    if (!replyTarget || !requireAuth()) return;
    const text = replyText.trim();
    if (!text) return;
    const reply = {
      id: `reply-${Date.now()}`,
      authorId: user.id,
      authorName: user.name || 'Thành viên EduMatch',
      authorRole: user.role || 'student',
      authorAvatar: user.avatar || '',
      text,
      createdAt: new Date().toISOString(),
    };
    const post = getPosts().find((item) => item.id === replyTarget.postId);
    const parentComment = post?.comments?.find((comment) => comment.id === replyTarget.commentId);
    if (parentComment?.authorId && parentComment.authorId !== user.id) {
      createNotification({
        recipientId: parentComment.authorId,
        actorName: user.name || 'Một thành viên',
        actorAvatar: user.avatar || '',
        type: 'comment_reply',
        title: `${user.name || 'Một thành viên'} đã trả lời bình luận của bạn`,
        description: text,
        link: `${ROUTES.FEED}#${replyTarget.postId}`,
      });
    }
    saveInteraction(replyTarget.postId, (post) => ({
      ...post,
      comments: (post.comments || []).map((comment) => comment.id === replyTarget.commentId ? { ...comment, replies: [...(comment.replies || []), reply] } : comment),
    }));
    setReplyTarget(null);
    setReplyText('');
  };

  return (
    <section className="feed-page">
      <div className="edu-container feed-page__container">
        <div className="feed-page__layout">
          <aside className="feed-sidebar feed-sidebar--left" aria-label="Nội dung được tài trợ">
            <div className="feed-sidebar__label"><Sparkles size={14} /> GỢI Ý TỪ EDUMATCH</div>
            <article className="sponsored-card sponsored-card--teacher">
              <span className="sponsored-card__tag">Được tài trợ</span>
              <div className="sponsored-card__brand"><BookOpen size={18} /><span>THE OLD SCHOOL</span></div>
              <h2>Luyện IELTS cá nhân hoá</h2>
              <p>Lộ trình rõ ràng, lớp học linh hoạt cho mục tiêu IELTS của bạn.</p>
              <Link to={ROUTES.COURSE_DETAIL('course-english-foundation')}>Khám phá khóa học <ArrowRight size={15} /></Link>
            </article>
            <article className="sponsored-card sponsored-card--skills">
              <span className="sponsored-card__tag">Được tài trợ</span>
              <div className="sponsored-card__brand"><span className="sponsored-card__mark sponsored-card__mark--violet">S</span><span>SKILLUP ACADEMY</span></div>
              <h2>Học lập trình từ nền tảng</h2>
              <p>Lớp thực hành theo dự án, phù hợp cho người mới bắt đầu.</p>
              <Link to={`${ROUTES.HOME}#giao-vien`}>Tìm người hướng dẫn <ArrowRight size={15} /></Link>
            </article>
            <article className="sponsored-card sponsored-card--music">
              <span className="sponsored-card__tag">Được tài trợ</span>
              <div className="sponsored-card__brand"><span className="sponsored-card__mark sponsored-card__mark--rose">M</span><span>MELODY STUDIO</span></div>
              <h2>Piano cho người mới</h2>
              <p>Học theo nhịp riêng, từ những giai điệu đầu tiên.</p>
              <Link to={`${ROUTES.HOME}#giao-vien`}>Khám phá giáo viên <ArrowRight size={15} /></Link>
            </article>
            <article className="feed-sidebar__note"><BadgeCheck size={17} /><p>Quảng cáo luôn được gắn nhãn rõ ràng để bạn chủ động lựa chọn.</p></article>
          </aside>
          <main className="feed-page__main">
        <header className="feed-page__heading">
          <span><Newspaper size={17} /> BẢNG TIN EDUMATCH</span>
          <h1>Những chia sẻ mới nhất từ cộng đồng</h1>
          <p>Khám phá bài viết, tài liệu và những câu chuyện học tập từ giáo viên, học viên và trung tâm đào tạo.</p>
        </header>
        <div className="feed-tabs" role="tablist" aria-label="Loại nội dung Bảng Tin">
          <button type="button" role="tab" aria-selected={feedTab === 'providers'} className={feedTab === 'providers' ? 'is-active' : ''} onClick={() => setFeedTab('providers')}>Giáo viên & Trung tâm</button>
          <button type="button" role="tab" aria-selected={feedTab === 'students'} className={feedTab === 'students' ? 'is-active' : ''} onClick={() => setFeedTab('students')}>Review từ học viên</button>
        </div>
        <div className="feed-page__list">
          {visiblePosts.length ? visiblePosts.map((post) => {
            const author = getAuthor(post, providers);
            const likes = post.likes || [];
            const comments = post.comments || [];
            const isLiked = likes.includes(user?.id);
            return <article className="community-post" id={post.id} key={post.id}>
              <header className="community-post__header">
                {author.avatar ? <img src={author.avatar} alt={`Ảnh đại diện của ${author.name}`} /> : <span>{author.name.slice(0, 1)}</span>}
                <div>{author.id ? <Link className="community-post__author" to={ROUTES.TEACHER_PROFILE(author.id)}>{author.name}</Link> : <strong>{author.name}</strong>}<small>{roleLabel(author.role)} · {shortTime(post.createdAt)}</small></div>
              </header>
              {post.text && <p className="community-post__text">{post.text}</p>}
              {post.media && <div className="community-post__media">{post.media.type === 'video' ? <video src={post.media.src} controls preload="metadata" /> : <img src={post.media.src} alt={`Nội dung do ${author.name} chia sẻ`} />}</div>}
              <div className="community-post__summary">
                <span>{likes.length ? `${likes.length} lượt thích` : 'Hãy là người đầu tiên thích bài viết này'}</span>
                {comments.length > 0 && <span>{comments.length} bình luận</span>}
              </div>
              <div className="community-post__actions">
                <button type="button" className={isLiked ? 'is-liked' : ''} onClick={() => toggleLike(post.id)}><Heart size={17} fill={isLiked ? 'currentColor' : 'none'} /> {isLiked ? 'Đã thích' : 'Thích'}</button>
                <button type="button" onClick={() => document.getElementById(`comment-${post.id}`)?.focus()}><MessageCircle size={17} /> Bình luận</button>
              </div>
              {comments.length > 0 && <div className="community-post__comments">
                {comments.map((comment) => {
                  const commentAuthor = getAuthor(comment, providers);
                  const isReplying = replyTarget?.postId === post.id && replyTarget?.commentId === comment.id;
                  return <div className="feed-comment" key={comment.id}>
                    {commentAuthor.avatar ? <img src={commentAuthor.avatar} alt="" /> : <span>{commentAuthor.name.slice(0, 1)}</span>}
                    <div className="feed-comment__body">
                      <div className="feed-comment__bubble"><strong>{commentAuthor.name}</strong><p>{comment.text}</p></div>
                      <div className="feed-comment__meta"><span>{shortTime(comment.createdAt)}</span><button type="button" onClick={() => openReply(post.id, comment.id)}>Trả lời</button></div>
                      {(comment.replies || []).map((reply) => {
                        const replyAuthor = getAuthor(reply, providers);
                        return <div className="feed-comment__reply" key={reply.id}>
                          {replyAuthor.avatar ? <img src={replyAuthor.avatar} alt="" /> : <span>{replyAuthor.name.slice(0, 1)}</span>}
                          <div><div className="feed-comment__bubble"><strong>{replyAuthor.name}</strong><p>{reply.text}</p></div><small>{shortTime(reply.createdAt)}</small></div>
                        </div>;
                      })}
                      {isReplying && <form className="feed-reply-form" onSubmit={submitReply}><CornerDownRight size={15} /><input autoFocus value={replyText} onChange={(event) => setReplyText(event.target.value)} placeholder={`Trả lời ${commentAuthor.name}...`} /><button type="submit">Gửi</button></form>}
                    </div>
                  </div>;
                })}
              </div>}
              <form className="feed-comment-form" onSubmit={(event) => submitComment(event, post.id)}>
                <input id={`comment-${post.id}`} value={commentDrafts[post.id] || ''} onChange={(event) => setCommentDrafts((current) => ({ ...current, [post.id]: event.target.value }))} placeholder="Viết bình luận..." />
                <button type="submit" aria-label="Gửi bình luận"><Send size={17} /></button>
              </form>
            </article>;
          }) : <div className="feed-page__empty"><ImageIcon size={28} /><h2>Chưa có bài đăng nào</h2><p>Các chia sẻ từ cộng đồng EduMatch sẽ xuất hiện tại đây.</p></div>}
        </div>
          </main>
          <aside className="feed-sidebar feed-sidebar--right" aria-label="Thông tin đối tác được tài trợ">
            <div className="feed-sidebar__label">ĐỐI TÁC NỔI BẬT</div>
            <article className="sponsored-card sponsored-card--center">
              <span className="sponsored-card__tag">Được tài trợ</span>
              <div className="sponsored-card__brand"><span className="sponsored-card__mark">E</span><span>TRUNG TÂM EDUCARE</span></div>
              <h2>Không gian học tập hiện đại</h2>
              <p>Các chương trình phát triển kỹ năng dành cho học viên ở nhiều độ tuổi.</p>
              <Link to={ROUTES.CENTER_SUPPORT}>Tìm hiểu trung tâm <ArrowRight size={15} /></Link>
            </article>
            <article className="sponsored-card sponsored-card--art">
              <span className="sponsored-card__tag">Được tài trợ</span>
              <div className="sponsored-card__brand"><span className="sponsored-card__mark sponsored-card__mark--amber">A</span><span>ART HOUSE</span></div>
              <h2>Mỹ thuật sáng tạo</h2>
              <p>Khơi mở tư duy hình ảnh qua các lớp học thực hành.</p>
              <Link to={`${ROUTES.HOME}#khoa-hoc`}>Xem lớp phù hợp <ArrowRight size={15} /></Link>
            </article>
            <article className="feed-sidebar__help"><strong>Bạn muốn quảng bá?</strong><p>Giáo viên và trung tâm có thể giới thiệu khóa học phù hợp tới đúng người học.</p><Link to={ROUTES.CENTER_SUPPORT}>Xem hỗ trợ quảng bá <ArrowRight size={14} /></Link></article>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default FeedPage;
