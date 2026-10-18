import { useState } from 'react';
import { ChevronLeft, ChevronRight, Heart, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Modal } from '@/components/feedback/Modal';
import { ROUTES } from '@/constants/routes';
import './postImageDialog.css';

export function PostImageDialog({ viewer, onClose, discussion, onLike, onShowLikes, onShare, onShowShares, shareCount = 0, isLiked = false }) {
  const [activeIndex, setActiveIndex] = useState(viewer?.activeIndex || 0);
  const mediaItems = viewer?.mediaItems || [];
  const activeMedia = mediaItems[activeIndex] || mediaItems[0];
  const post = viewer?.post;
  const author = viewer?.author;
  const likes = post?.likes || [];
  const comments = post?.comments || [];

  if (!viewer || !post || !activeMedia) return null;

  const showPrevious = () => setActiveIndex((index) => (index - 1 + mediaItems.length) % mediaItems.length);
  const showNext = () => setActiveIndex((index) => (index + 1) % mediaItems.length);

  return <Modal open onClose={onClose} title="Ảnh bài viết" size="xl" className="post-image-dialog">
    <div className="post-image-dialog__layout">
      <section className="post-image-dialog__media" aria-label={`Ảnh ${activeIndex + 1} trong bài viết`}>
        {activeMedia.type === 'video'
          ? <video src={activeMedia.src} controls autoPlay preload="metadata" />
          : <img src={activeMedia.src} alt={`Ảnh ${activeIndex + 1} trong bài viết`} />}
        {mediaItems.length > 1 && <><button type="button" className="post-image-dialog__nav post-image-dialog__nav--previous" onClick={showPrevious} aria-label="Ảnh trước"><ChevronLeft size={22} /></button><button type="button" className="post-image-dialog__nav post-image-dialog__nav--next" onClick={showNext} aria-label="Ảnh tiếp theo"><ChevronRight size={22} /></button><span className="post-image-dialog__counter">{activeIndex + 1} / {mediaItems.length}</span></>}
      </section>
      <aside className="post-image-dialog__panel">
        <header className="post-image-dialog__author">
          <span>{author?.avatar ? <img src={author.avatar} alt="" /> : author?.name?.slice(0, 1)}</span>
          <div>{author?.id ? <Link to={ROUTES.TEACHER_PROFILE(author.id)}>{author.name}</Link> : <strong>{author?.name || 'Thành viên EduMatch'}</strong>}<small>{viewer.publishedAt}</small></div>
        </header>
        {post.text && <p className="post-image-dialog__text">{post.text}</p>}
        <div className="post-image-dialog__stats"><button type="button" onClick={onShowLikes}>{likes.length ? `${likes.length} lượt thích` : 'Chưa có lượt thích'}</button><span>{comments.length} bình luận</span>{shareCount > 0 && <button type="button" onClick={onShowShares}>{shareCount} lượt chia sẻ</button>}</div>
        <div className="post-image-dialog__actions"><button type="button" className={isLiked ? 'is-liked' : ''} onClick={onLike}><Heart size={16} fill={isLiked ? 'currentColor' : 'none'} /> {isLiked ? 'Đã thích' : 'Thích'}</button><button type="button" onClick={onShare}><Share2 size={16} /> Chia sẻ</button></div>
        <div className="post-image-dialog__discussion">{discussion}</div>
      </aside>
    </div>
  </Modal>;
}
