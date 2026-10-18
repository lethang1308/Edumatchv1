import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, BadgeCheck, BookOpen, CornerDownRight, Heart, Image as ImageIcon, MessageCircle, Newspaper, Send, Share2, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createNotification, deletePost, getCourses, getPosts, getProviderAffinity, savePost, trackProviderAffinity, updatePost } from '@/features/learning/marketplace';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { ImageAttachment } from '@/components/forms/ImageAttachment';
import { ContentMenu } from '@/components/feedback/ContentMenu';
import { LikesModal } from '@/components/feedback/LikesModal';
import { Modal } from '@/components/feedback/Modal';
import { submitOnPlainEnter } from '@/utils/submitOnPlainEnter';
import './feed.css';

const getAuthor = (item, providers) => {
  const provider = providers.get(item.authorId || item.teacherId);
  return {
    id: item.authorId || item.teacherId || '',
    name: item.authorName || item.author || provider?.name || 'Thành viên EduMatch',
    role: item.authorRole || provider?.role || 'teacher',
    avatar: item.authorAvatar || provider?.avatar || '',
    licenseVerificationStatus: item.authorLicenseVerificationStatus || provider?.licenseVerificationStatus || '',
  };
};

const shortTime = (dateValue) => {
  if (!dateValue) return 'Vừa xong';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 'Vừa xong';
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
};

const getMediaItems = (item) => Array.isArray(item?.mediaItems) && item.mediaItems.length
  ? item.mediaItems
  : item?.media
    ? [item.media]
    : [];

const getOriginalSharedPost = (post, posts, getPostAuthor) => {
  let snapshot = post.sharedPost;
  const visited = new Set([post.id]);

  while (snapshot?.id && !visited.has(snapshot.id)) {
    visited.add(snapshot.id);
    const sourcePost = posts.find((item) => item.id === snapshot.id);
    if (!sourcePost) break;
    if (!sourcePost.sharedPost) {
      return {
        id: sourcePost.id,
        author: getPostAuthor(sourcePost),
        text: sourcePost.text || '',
        media: sourcePost.media || null,
        mediaItems: sourcePost.mediaItems || [],
      };
    }
    snapshot = sourcePost.sharedPost;
  }

  return snapshot;
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
  const [commentMedia, setCommentMedia] = useState({});
  const [replyTarget, setReplyTarget] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyMedia, setReplyMedia] = useState(null);
  const [shareTarget, setShareTarget] = useState(null);
  const [shareText, setShareText] = useState('');
  const [openContentMenu, setOpenContentMenu] = useState(null);
  const [likesTarget, setLikesTarget] = useState(null);
  const [feedTab, setFeedTab] = useState('providers');
  const handledPostHash = useRef('');
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
  const visiblePosts = rankedPosts.filter((post) => post.sharedPost || (feedTab === 'students' ? getAuthor(post, providers).role === 'student' : getAuthor(post, providers).role !== 'student'));

  useEffect(() => {
    const postId = window.location.hash.slice(1);
    if (!postId || handledPostHash.current === postId) return undefined;
    const target = document.getElementById(postId);
    if (!target) return undefined;
    handledPostHash.current = postId;
    const timer = window.setTimeout(() => target.scrollIntoView({ block: 'center', behavior: 'smooth' }), 0);
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

  const owns = (authorId) => Boolean(user?.id && authorId === user.id);
  const editPost = (post) => {
    if (!owns(post.authorId || post.teacherId)) return;
    const text = window.prompt('Chỉnh sửa bài viết', post.text || '');
    if (text === null) return;
    saveInteraction(post.id, (current) => ({ ...current, text: text.trim() }));
  };
  const removePost = (post) => {
    if (!owns(post.authorId || post.teacherId) || !window.confirm('Xóa bài viết này?')) return;
    setPosts(deletePost(post.id).slice().sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt)));
  };
  const openShareDialog = (post) => {
    if (!requireAuth()) return;
    setShareTarget(post);
    setShareText('');
  };
  const sharePost = (event) => {
    event.preventDefault();
    if (!shareTarget || !requireAuth()) return;
    const post = shareTarget;
    const originalPost = getOriginalSharedPost(post, posts, (item) => getAuthor(item, providers));
    const source = originalPost?.author || getAuthor(post, providers);
    const sharedPost = {
      id: `post-share-${Date.now()}`,
      teacherId: user.id,
      authorId: user.id,
      authorName: user.name || 'Thành viên EduMatch',
      authorRole: user.role || 'student',
      authorAvatar: user.avatar || '',
      text: shareText.trim(),
      sharedPost: {
        id: originalPost?.id || post.id,
        author: source,
        text: originalPost?.text || '',
        media: originalPost?.media || null,
        mediaItems: originalPost?.mediaItems || [],
      },
      createdAt: new Date().toISOString(),
      likes: [],
      comments: [],
    };
    savePost(sharedPost);
    setPosts((current) => [sharedPost, ...current]);
    setShareTarget(null);
    setShareText('');
    toast.success('Bài viết đã được chia sẻ lên trang cá nhân của bạn.');
  };
  const editDiscussion = (postId, commentId, replyId = null) => {
    const post = posts.find((item) => item.id === postId);
    const comment = post?.comments?.find((item) => item.id === commentId);
    const target = replyId ? comment?.replies?.find((item) => item.id === replyId) : comment;
    if (!target || !owns(target.authorId)) return;
    const text = window.prompt('Chỉnh sửa bình luận', target.text || '');
    if (text === null) return;
    saveInteraction(postId, (current) => ({
      ...current,
      comments: (current.comments || []).map((item) => item.id !== commentId ? item : replyId
        ? { ...item, replies: (item.replies || []).map((reply) => reply.id === replyId ? { ...reply, text: text.trim() } : reply) }
        : { ...item, text: text.trim() }),
    }));
  };
  const removeDiscussion = (postId, commentId, replyId = null) => {
    const post = posts.find((item) => item.id === postId);
    const comment = post?.comments?.find((item) => item.id === commentId);
    const target = replyId ? comment?.replies?.find((item) => item.id === replyId) : comment;
    if (!target || !owns(target.authorId) || !window.confirm('Xóa bình luận này?')) return;
    saveInteraction(postId, (current) => ({
      ...current,
      comments: replyId
        ? (current.comments || []).map((item) => item.id === commentId ? { ...item, replies: (item.replies || []).filter((reply) => reply.id !== replyId) } : item)
        : (current.comments || []).filter((item) => item.id !== commentId),
    }));
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
    const media = commentMedia[postId] || null;
    if (!text && !media) return;
    const comment = {
      id: `comment-${Date.now()}`,
      authorId: user.id,
      authorName: user.name || 'Thành viên EduMatch',
      authorRole: user.role || 'student',
      authorAvatar: user.avatar || '',
      text,
      media,
      createdAt: new Date().toISOString(),
      replies: [],
      likes: [],
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
    setCommentMedia((current) => ({ ...current, [postId]: null }));
  };

  const openReply = (postId, commentId) => {
    if (!requireAuth()) return;
    setReplyTarget({ postId, commentId });
    setReplyText('');
    setReplyMedia(null);
  };

  const submitReply = (event) => {
    event.preventDefault();
    if (!replyTarget || !requireAuth()) return;
    const text = replyText.trim();
    if (!text && !replyMedia) return;
    const reply = {
      id: `reply-${Date.now()}`,
      authorId: user.id,
      authorName: user.name || 'Thành viên EduMatch',
      authorRole: user.role || 'student',
      authorAvatar: user.avatar || '',
      text,
      media: replyMedia,
      createdAt: new Date().toISOString(),
      likes: [],
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
    setReplyMedia(null);
  };
  const toggleCommentLike = (postId, commentId, replyId = null) => {
    if (!requireAuth()) return;
    const post = getPosts().find((item) => item.id === postId);
    const comment = post?.comments?.find((item) => item.id === commentId);
    const reply = comment?.replies?.find((item) => item.id === replyId);
    const target = reply || comment;
    if (!target) return;
    const likes = target.likes || [];
    const hasLiked = likes.includes(user.id);
    if (!hasLiked && target.authorId && target.authorId !== user.id) {
      createNotification({
        recipientId: target.authorId,
        actorName: user.name || 'Một thành viên',
        actorAvatar: user.avatar || '',
        type: 'post_comment',
        title: `${user.name || 'Một thành viên'} đã thích bình luận của bạn`,
        description: 'Bấm để xem cuộc trò chuyện trong Bảng Tin.',
        link: `${ROUTES.FEED}#${postId}`,
      });
    }
    saveInteraction(postId, (currentPost) => ({
      ...currentPost,
      comments: (currentPost.comments || []).map((currentComment) => {
        if (currentComment.id !== commentId) return currentComment;
        if (!replyId) return { ...currentComment, likes: hasLiked ? likes.filter((id) => id !== user.id) : [...likes, user.id] };
        return {
          ...currentComment,
          replies: (currentComment.replies || []).map((currentReply) =>
            currentReply.id === replyId
              ? { ...currentReply, likes: hasLiked ? likes.filter((id) => id !== user.id) : [...likes, user.id] }
              : currentReply,
          ),
        };
      }),
    }));
  };

  return (
    <><section className="feed-page">
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
          <p>Khám phá bài viết, tài liệu và những câu chuyện học tập từ cộng đồng EduMatch.</p>
        </header>
        <div className="feed-tabs" role="tablist" aria-label="Loại nội dung Bảng Tin">
          <button type="button" role="tab" aria-selected={feedTab === 'providers'} className={feedTab === 'providers' ? 'is-active' : ''} onClick={() => setFeedTab('providers')}>Giáo viên & Trung tâm</button>
          <button type="button" role="tab" aria-selected={feedTab === 'students'} className={feedTab === 'students' ? 'is-active' : ''} onClick={() => setFeedTab('students')}>Chia sẻ từ học viên</button>
        </div>
        <div className="feed-page__list">
          {visiblePosts.length ? visiblePosts.map((post) => {
            const author = getAuthor(post, providers);
            const likes = post.likes || [];
            const comments = post.comments || [];
            const isLiked = likes.includes(user?.id);
            const postMediaItems = getMediaItems(post);
            const originalSharedPost = post.sharedPost ? getOriginalSharedPost(post, posts, (item) => getAuthor(item, providers)) : null;
            const sharedMediaItems = getMediaItems(originalSharedPost);
            return <article className="community-post" id={post.id} key={post.id}>
              <header className="community-post__header">
                {author.avatar ? <img src={author.avatar} alt={`Ảnh đại diện của ${author.name}`} /> : <span>{author.name.slice(0, 1)}</span>}
                <div>{author.id ? <Link className="community-post__author" to={ROUTES.TEACHER_PROFILE(author.id)}>{author.name}</Link> : <strong>{author.name}</strong>}{author.role === 'center' && author.licenseVerificationStatus === 'verified' && <small className="post-verification-badge"><BadgeCheck size={12} /> Đã xác thực pháp lý</small>}<small>{shortTime(post.createdAt)}</small></div>
                {owns(post.authorId || post.teacherId) && <ContentMenu id={`post-${post.id}`} openId={openContentMenu} onToggle={setOpenContentMenu} onEdit={() => editPost(post)} onDelete={() => removePost(post)} label="bài viết" />}
              </header>
              {post.text && <p className="community-post__text">{post.text}</p>}
              {originalSharedPost && <div className="shared-post"><span>Đã chia sẻ <Link to={`${ROUTES.FEED}#${originalSharedPost.id}`}>bài viết gốc</Link> của</span>{originalSharedPost.author?.id ? <Link className="shared-post__author" to={ROUTES.TEACHER_PROFILE(originalSharedPost.author.id)}>{originalSharedPost.author.name}</Link> : <strong>{originalSharedPost.author?.name || 'Thành viên EduMatch'}</strong>}<p>{originalSharedPost.text || 'Bài viết gốc không có nội dung văn bản.'}</p>{sharedMediaItems.length > 0 && <div className="community-post__media">{sharedMediaItems.map((item, index) => item.type === 'video' ? <video key={`${item.src}-${index}`} src={item.src} controls preload="metadata" /> : <img key={`${item.src}-${index}`} src={item.src} alt={`Ảnh chia sẻ ${index + 1}`} />)}</div>}</div>}
              {postMediaItems.length > 0 && <div className={`community-post__media ${postMediaItems.length > 1 ? 'is-album' : ''}`}>{postMediaItems.map((item, index) => item.type === 'video' ? <video key={`${item.src}-${index}`} src={item.src} controls preload="metadata" /> : <img key={`${item.src}-${index}`} src={item.src} alt={`Ảnh ${index + 1} do ${author.name} chia sẻ`} />)}</div>}
              <div className="community-post__summary">
                {likes.length ? <button type="button" onClick={() => setLikesTarget({ ids: likes, label: 'Những người đã thích bài viết này' })}>{likes.length} lượt thích</button> : <span>Hãy là người đầu tiên thích bài viết này</span>}
                {comments.length > 0 && <span>{comments.length} bình luận</span>}
              </div>
              <div className="community-post__actions">
                <button type="button" className={isLiked ? 'is-liked' : ''} onClick={() => toggleLike(post.id)}><Heart size={17} fill={isLiked ? 'currentColor' : 'none'} /> {isLiked ? 'Đã thích' : 'Thích'}</button>
                <button type="button" onClick={() => document.getElementById(`comment-${post.id}`)?.focus()}><MessageCircle size={17} /> Bình luận</button>
                <button type="button" onClick={() => openShareDialog(post)}><Share2 size={17} /> Chia sẻ</button>
              </div>
              {comments.length > 0 && <div className="community-post__comments">
                {comments.map((comment) => {
                  const commentAuthor = getAuthor(comment, providers);
                  const isReplying = replyTarget?.postId === post.id && replyTarget?.commentId === comment.id;
                  const isCommentLiked = (comment.likes || []).includes(user?.id);
                  return <div className="feed-comment" key={comment.id}>
                    {commentAuthor.avatar ? <img src={commentAuthor.avatar} alt="" /> : <span>{commentAuthor.name.slice(0, 1)}</span>}
                    <div className="feed-comment__body">
                      <div className="feed-comment__bubble">{commentAuthor.id ? <Link className="feed-comment__author" to={ROUTES.TEACHER_PROFILE(commentAuthor.id)}>{commentAuthor.name}</Link> : <strong>{commentAuthor.name}</strong>}{comment.text && <p>{comment.text}</p>}{comment.media && (comment.media.type === 'video' ? <video className="discussion-image" src={comment.media.src} controls preload="metadata" /> : <img className="discussion-image" src={comment.media.src} alt={`Ảnh đính kèm từ ${commentAuthor.name}`} />)}</div>
                      <div className="feed-comment__meta"><span>{shortTime(comment.createdAt)}</span><button type="button" className={isCommentLiked ? 'is-liked' : ''} onClick={() => toggleCommentLike(post.id, comment.id)}><Heart size={13} fill={isCommentLiked ? 'currentColor' : 'none'} /> Thích</button>{comment.likes?.length > 0 && <button type="button" className="feed-likes-count" onClick={() => setLikesTarget({ ids: comment.likes, label: 'Những người đã thích bình luận này' })}>{comment.likes.length} lượt thích</button>}<button type="button" onClick={() => openReply(post.id, comment.id)}>Trả lời</button>{owns(comment.authorId) && <ContentMenu id={`comment-${comment.id}`} openId={openContentMenu} onToggle={setOpenContentMenu} onEdit={() => editDiscussion(post.id, comment.id)} onDelete={() => removeDiscussion(post.id, comment.id)} label="bình luận" />}</div>
                      {(comment.replies || []).map((reply) => {
                        const replyAuthor = getAuthor(reply, providers);
                        const isReplyLiked = (reply.likes || []).includes(user?.id);
                        return <div className="feed-comment__reply" key={reply.id}>
                          {replyAuthor.avatar ? <img src={replyAuthor.avatar} alt="" /> : <span>{replyAuthor.name.slice(0, 1)}</span>}
                          <div><div className="feed-comment__bubble">{replyAuthor.id ? <Link className="feed-comment__author" to={ROUTES.TEACHER_PROFILE(replyAuthor.id)}>{replyAuthor.name}</Link> : <strong>{replyAuthor.name}</strong>}{reply.text && <p>{reply.text}</p>}{reply.media && (reply.media.type === 'video' ? <video className="discussion-image" src={reply.media.src} controls preload="metadata" /> : <img className="discussion-image" src={reply.media.src} alt={`Ảnh đính kèm từ ${replyAuthor.name}`} />)}</div><div className="feed-comment__meta feed-comment__meta--reply"><span>{shortTime(reply.createdAt)}</span><button type="button" className={isReplyLiked ? 'is-liked' : ''} onClick={() => toggleCommentLike(post.id, comment.id, reply.id)}><Heart size={13} fill={isReplyLiked ? 'currentColor' : 'none'} /> Thích</button>{reply.likes?.length > 0 && <button type="button" className="feed-likes-count" onClick={() => setLikesTarget({ ids: reply.likes, label: 'Những người đã thích phản hồi này' })}>{reply.likes.length} lượt thích</button>}{owns(reply.authorId) && <ContentMenu id={`reply-${reply.id}`} openId={openContentMenu} onToggle={setOpenContentMenu} onEdit={() => editDiscussion(post.id, comment.id, reply.id)} onDelete={() => removeDiscussion(post.id, comment.id, reply.id)} label="phản hồi" />}</div></div>
                        </div>;
                      })}
                      {isReplying && <form className="feed-reply-form" onSubmit={submitReply}><CornerDownRight size={15} /><textarea autoFocus value={replyText} onChange={(event) => setReplyText(event.target.value)} onKeyDown={submitOnPlainEnter} placeholder={`Trả lời ${commentAuthor.name}...`} rows="1" /><ImageAttachment id={`reply-image-${post.id}-${comment.id}`} value={replyMedia} onChange={setReplyMedia} label="Tệp" /><button type="submit">Gửi</button></form>}
                    </div>
                  </div>;
                })}
              </div>}
              <form className="feed-comment-form" onSubmit={(event) => submitComment(event, post.id)}>
                <textarea id={`comment-${post.id}`} value={commentDrafts[post.id] || ''} onChange={(event) => setCommentDrafts((current) => ({ ...current, [post.id]: event.target.value }))} onKeyDown={submitOnPlainEnter} placeholder="Viết bình luận..." rows="1" />
                <ImageAttachment id={`comment-image-${post.id}`} value={commentMedia[post.id] || null} onChange={(media) => setCommentMedia((current) => ({ ...current, [post.id]: media }))} label="Tệp" />
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
    </section><LikesModal target={likesTarget} onClose={() => setLikesTarget(null)} /><Modal open={Boolean(shareTarget)} onClose={() => setShareTarget(null)} title="Chia sẻ bài viết" description="Thêm suy nghĩ của bạn trước khi chia sẻ lên trang cá nhân." size="sm"><form className="share-post-form" onSubmit={sharePost}><textarea autoFocus value={shareText} onChange={(event) => setShareText(event.target.value)} placeholder="Viết nội dung bạn muốn chia sẻ..." rows="4" /><div><button type="button" onClick={() => setShareTarget(null)}>Hủy</button><button type="submit"><Share2 size={16} /> Chia sẻ</button></div></form></Modal></>
  );
}

export default FeedPage;
