import { useMemo, useState } from 'react';
import { MessageCircle, Search, Send } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { createConversationId, getCourse, getConversationsForUser, saveConversation } from '@/features/learning/marketplace';
import './messages.css';

const threadKey = (message) => `${message.courseId}:${message.studentId}:${message.teacherId}`;

const displayTime = (value) => value || 'Vừa xong';

export function MessagesPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState(() => getConversationsForUser(user?.id));
  const [selectedKey, setSelectedKey] = useState(() => {
    const first = getConversationsForUser(user?.id)[0];
    return first ? threadKey(first) : null;
  });
  const [draft, setDraft] = useState('');
  const [query, setQuery] = useState('');

  const threads = useMemo(() => {
    const groups = new Map();
    messages.forEach((message) => {
      const key = threadKey(message);
      const course = getCourse(message.courseId);
      const isTeacher = message.teacherId === user?.id;
      const contactName = isTeacher
        ? message.studentName || 'Học viên EduMatch'
        : message.teacherName || course?.teacher?.name || 'Giáo viên EduMatch';
      const current = groups.get(key) || { key, course, contactName, messages: [] };
      current.messages.push(message);
      groups.set(key, current);
    });
    return [...groups.values()].map((thread) => ({ ...thread, messages: [...thread.messages].reverse() }));
  }, [messages, user?.id]);
  const filteredThreads = threads.filter((thread) =>
    `${thread.contactName} ${thread.course?.title || ''}`.toLowerCase().includes(query.toLowerCase())
  );
  const selectedThread = threads.find((thread) => thread.key === selectedKey) || filteredThreads[0];

  const send = (event) => {
    event.preventDefault();
    if (!draft.trim() || !selectedThread) return;
    const seed = selectedThread.messages[0];
    const next = {
      id: createConversationId(),
      courseId: seed.courseId,
      teacherId: seed.teacherId,
      teacherName: seed.teacherName || selectedThread.course?.teacher?.name || 'Giáo viên EduMatch',
      studentId: seed.studentId,
      studentName: seed.studentName || 'Học viên EduMatch',
      senderId: user.id,
      text: draft.trim(),
      createdAt: 'Vừa xong',
    };
    saveConversation(next);
    setMessages((current) => [next, ...current]);
    setDraft('');
  };

  return (
    <section className="messages-page">
      <div className="messages-shell">
        <aside className="conversation-list" aria-label="Danh sách hội thoại">
          <div className="conversation-list__head">
            <div><span>EDUMATCH CHAT</span><h1>Tin nhắn</h1></div>
            <span className="conversation-list__count">{threads.length}</span>
          </div>
          <label className="conversation-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm cuộc trò chuyện" /></label>
          <div className="conversation-list__items">
            {filteredThreads.length ? filteredThreads.map((thread) => {
              const latest = thread.messages.at(-1);
              return <button className={`conversation-item ${selectedThread?.key === thread.key ? 'is-selected' : ''}`} key={thread.key} onClick={() => setSelectedKey(thread.key)}><span className="conversation-item__avatar">{thread.contactName.slice(0, 1)}</span><span className="conversation-item__copy"><strong>{thread.contactName}</strong><small>{thread.course?.title || 'Trao đổi lịch học'}</small><em>{latest?.text}</em></span></button>;
            }) : <div className="conversation-empty"><MessageCircle size={24} /><p>Chưa có cuộc trò chuyện nào.</p></div>}
          </div>
        </aside>
        <main className="chat-window">
          {selectedThread ? <><header className="chat-window__head"><span className="chat-window__avatar">{selectedThread.contactName.slice(0, 1)}</span><div><h2>{selectedThread.contactName}</h2><p>{selectedThread.course?.title || 'Trao đổi lịch học'}</p></div><span className="chat-window__status">Đang hoạt động</span></header><div className="chat-window__notice">Trao đổi để thống nhất lịch học. EduMatch không can thiệp vào nội dung cuộc trò chuyện.</div><div className="message-history">{selectedThread.messages.map((message) => <article className={`chat-bubble ${message.senderId === user?.id || (!message.senderId && message.studentId === user?.id) ? 'is-own' : ''}`} key={message.id}><p>{message.text}</p><span>{displayTime(message.createdAt)}</span></article>)}</div><form className="chat-composer" onSubmit={send}><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Viết tin nhắn để chốt lịch học..." /><button type="submit" aria-label="Gửi tin nhắn"><Send size={18} /></button></form></> : <div className="chat-window__empty"><span><MessageCircle size={32} /></span><h2>Bắt đầu một cuộc trò chuyện</h2><p>Khi bạn đăng ký học một khóa học, lời nhắn sẽ xuất hiện tại đây.</p></div>}
        </main>
      </div>
    </section>
  );
}
