import { useMemo } from 'react';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Modal } from './Modal';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { getCourses, getPosts } from '@/features/learning/marketplace';
import './likes-modal.css';

const addProfile = (directory, id, name, avatar = '') => {
  if (!id) return;
  directory.set(id, { id, name: name || 'Thành viên EduMatch', avatar });
};

const profileDirectory = (user) => {
  const directory = new Map();
  getCourses().forEach((course) => addProfile(directory, course.teacher?.id, course.teacher?.name, course.teacher?.avatar));
  getPosts().forEach((post) => {
    addProfile(directory, post.authorId || post.teacherId, post.authorName || post.author || post.teacherName, post.authorAvatar);
    (post.comments || []).forEach((comment) => {
      addProfile(directory, comment.authorId, comment.authorName || comment.author, comment.authorAvatar);
      (comment.replies || []).forEach((reply) => addProfile(directory, reply.authorId, reply.authorName || reply.author, reply.authorAvatar));
    });
  });
  addProfile(directory, user?.id, user?.name, user?.avatar);
  return directory;
};

export function LikesModal({ target, onClose }) {
  const { user } = useAuth();
  const people = useMemo(() => {
    const directory = profileDirectory(user);
    return (target?.ids || []).map((id) => directory.get(id) || { id, name: 'Thành viên EduMatch', avatar: '' });
  }, [target?.ids, user]);

  return <Modal open={Boolean(target)} onClose={onClose} title="Lượt thích" description={target?.label || 'Những người đã bày tỏ sự yêu thích'} size="sm">
    <div className="likes-modal__list">
      {people.map((person, index) => <Link className="likes-modal__person" key={`${person.id}-${index}`} to={ROUTES.TEACHER_PROFILE(person.id)} onClick={onClose}>
        <span className="likes-modal__avatar">{person.avatar ? <img src={person.avatar} alt="" /> : person.name.slice(0, 1)}</span>
        <strong>{person.name}</strong>
        <Heart size={15} fill="currentColor" aria-hidden="true" />
      </Link>)}
      {!people.length && <p className="likes-modal__empty">Chưa có lượt thích.</p>}
    </div>
  </Modal>;
}
