import { useEffect, useMemo, useState } from 'react';
import { ListFilter, MailOpen, MessageCircle, Plus, Search, Send, Tag, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useOnlinePresence } from '@/hooks/useOnlinePresence';
import { createConversationId, deleteMessageTag, getCourse, getConversationsForUser, getMessageTags, markConversationRead, markConversationUnread, removeMessageTagFromUserConversations, saveConversation, saveMessageTag, setConversationTags } from '@/features/learning/marketplace';
import { submitOnPlainEnter } from '@/utils/submitOnPlainEnter';
import { setChatWidget } from '@/features/learning/chatWidget';
import './messages.css';

const threadKey = (message) => `${message.courseId}:${message.studentId}:${message.teacherId}`;

const displayTime = (value) => value || 'Vừa xong';
const TAG_COLORS = [
  { id: 'emerald', label: 'Xanh lá', value: '#087f69' },
  { id: 'teal', label: 'Xanh ngọc', value: '#0f766e' },
  { id: 'cyan', label: 'Xanh cyan', value: '#0891b2' },
  { id: 'sky', label: 'Xanh da trời', value: '#0284c7' },
  { id: 'blue', label: 'Xanh dương', value: '#2563eb' },
  { id: 'indigo', label: 'Chàm', value: '#4f46e5' },
  { id: 'violet', label: 'Tím', value: '#7c3aed' },
  { id: 'fuchsia', label: 'Hồng tím', value: '#c026d3' },
  { id: 'rose', label: 'Hồng', value: '#c74d68' },
  { id: 'red', label: 'Đỏ', value: '#dc2626' },
  { id: 'orange', label: 'Cam', value: '#ea580c' },
  { id: 'amber', label: 'Cam', value: '#b87918' },
  { id: 'lime', label: 'Xanh chanh', value: '#65a30d' },
  { id: 'slate', label: 'Xám xanh', value: '#475569' },
];
const normalizeTag = (tag) => typeof tag === 'string'
  ? { id: tag.toLowerCase(), name: tag, color: TAG_COLORS[0].value }
  : tag;
const getThreadTags = (thread) => (thread?.messages?.[0]?.tags || []).map(normalizeTag);
const tagIdFromName = (value) => {
  const slug = value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (slug) return slug;
  return `tag-${[...value].reduce((total, character) => ((total * 31) + character.codePointAt(0)) >>> 0, 7)}`;
};

export function MessagesPage() {
  const { user } = useAuth();
  const { isOnline } = useOnlinePresence(user?.id);
  const [messages, setMessages] = useState(() => getConversationsForUser(user?.id));
  const [selectedKey, setSelectedKey] = useState(() => {
    const first = getConversationsForUser(user?.id)[0];
    return first ? threadKey(first) : null;
  });
  const [draft, setDraft] = useState('');
  const [query, setQuery] = useState('');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [showTagFilter, setShowTagFilter] = useState(false);
  const [showTagCreator, setShowTagCreator] = useState(false);
  const [tagDraft, setTagDraft] = useState('');
  const [tagColor, setTagColor] = useState(TAG_COLORS[0].value);
  const [tagLibrary, setTagLibrary] = useState(() => getMessageTags(user?.id));
  const [tagNotice, setTagNotice] = useState('');

  const threads = useMemo(() => {
    const groups = new Map();
    messages.forEach((message) => {
      const key = threadKey(message);
      const course = getCourse(message.courseId);
      const isTeacher = message.teacherId === user?.id;
      const contactName = isTeacher
        ? message.studentName || 'Học viên EduMatch'
        : message.teacherName || course?.teacher?.name || 'Giáo viên EduMatch';
      const contactId = isTeacher ? message.studentId : message.teacherId;
      const current = groups.get(key) || { key, course, contactName, contactId, messages: [] };
      current.messages.push(message);
      groups.set(key, current);
    });
    return [...groups.values()].map((thread) => ({ ...thread, messages: [...thread.messages].reverse() }));
  }, [messages, user?.id]);
  const isThreadUnread = (thread) => thread.messages.some((message) => (message.unreadFor || []).includes(user?.id));
  const allTags = useMemo(() => {
    const uniqueTags = new Map();
    tagLibrary.forEach((tag) => uniqueTags.set(tag.id, normalizeTag(tag)));
    threads.forEach((thread) => getThreadTags(thread).forEach((tag) => uniqueTags.set(tag.id, tag)));
    return [...uniqueTags.values()];
  }, [tagLibrary, threads]);
  const tagCounts = useMemo(() => new Map(allTags.map((tag) => [
    tag.id,
    threads.filter((thread) => getThreadTags(thread).some((item) => item.id === tag.id)).length,
  ])), [allTags, threads]);
  const filteredThreads = threads.filter((thread) =>
    `${thread.contactName} ${thread.course?.title || ''}`.toLowerCase().includes(query.toLowerCase())
    && (!showUnreadOnly || isThreadUnread(thread))
    && (!selectedTagIds.length || getThreadTags(thread).some((tag) => selectedTagIds.includes(tag.id)))
  );
  const selectedThread = threads.find((thread) => thread.key === selectedKey) || filteredThreads[0];

  useEffect(() => {
    if (user?.id && selectedThread?.key) setChatWidget(user.id, selectedThread.key);
  }, [selectedThread?.key, user?.id]);

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

  const markSelectedUnread = () => {
    if (!selectedThread || !user?.id) return;
    const next = markConversationUnread(selectedThread, user.id);
    setMessages(next.filter((message) => message.studentId === user.id || message.teacherId === user.id));
  };

  const selectThread = (thread) => {
    setSelectedKey(thread.key);
    if (user?.id) setChatWidget(user.id, thread.key);
    if (!user?.id || !isThreadUnread(thread)) return;
    const next = markConversationRead(thread, user.id);
    setMessages(next.filter((message) => message.studentId === user.id || message.teacherId === user.id));
  };

  const addTag = (event) => {
    event.preventDefault();
    const tag = tagDraft.trim();
    if (!tag || !selectedThread) return;
    const tags = getThreadTags(selectedThread);
    if (tags.some((item) => item.name.toLowerCase() === tag.toLowerCase())) { setTagDraft(''); return; }
    if (tags.length >= 2) { setTagNotice('Mỗi cuộc trò chuyện chỉ gắn tối đa 2 thẻ.'); return; }
    const id = tagIdFromName(tag);
    const nextTag = { id, name: tag, color: tagColor };
    setTagLibrary(saveMessageTag(user?.id, nextTag));
    const next = setConversationTags(selectedThread, [...tags, nextTag]);
    setMessages(next.filter((message) => message.studentId === user?.id || message.teacherId === user?.id));
    setTagDraft('');
    setTagNotice('');
    setShowTagCreator(false);
  };

  const toggleTag = (tag) => {
    if (!selectedThread) return;
    const current = getThreadTags(selectedThread);
    const hasTag = current.some((item) => item.id === tag.id);
    if (!hasTag && current.length >= 2) { setTagNotice('Mỗi cuộc trò chuyện chỉ gắn tối đa 2 thẻ.'); return; }
    const next = setConversationTags(selectedThread, hasTag ? current.filter((item) => item.id !== tag.id) : [...current, tag]);
    setMessages(next.filter((message) => message.studentId === user?.id || message.teacherId === user?.id));
    setTagNotice('');
  };

  const deleteTag = (tagId) => {
    setTagLibrary(deleteMessageTag(user?.id, tagId));
    setMessages(removeMessageTagFromUserConversations(user?.id, tagId));
    setSelectedTagIds((current) => current.filter((id) => id !== tagId));
  };

  const toggleTagFilter = (tagId) => setSelectedTagIds((current) =>
    current.includes(tagId) ? current.filter((id) => id !== tagId) : [...current, tagId]
  );

  const unreadCount = threads.filter(isThreadUnread).length;

  return (
    <section className="messages-page">
      <div className="messages-shell">
        <aside className="conversation-list" aria-label="Danh sách hội thoại">
          <div className="conversation-list__head">
            <div><span>EDUMATCH CHAT</span><h1>Tin nhắn</h1></div>
            <span className="conversation-list__count">{threads.length}</span>
          </div>
          <div className="conversation-search-row"><label className="conversation-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm cuộc trò chuyện" /></label><div className="conversation-filter"><button type="button" className={showTagFilter || selectedTagIds.length ? 'is-active' : ''} onClick={() => setShowTagFilter((value) => !value)}><ListFilter size={16} /> Lọc theo{selectedTagIds.length ? ` (${selectedTagIds.length})` : ''}</button>{showTagFilter && <div className="conversation-filter__menu"><div><strong>Lọc theo thẻ</strong><button type="button" onClick={() => setSelectedTagIds([])} disabled={!selectedTagIds.length}>Xóa lọc</button></div>{allTags.length ? allTags.map((tag) => <label key={tag.id}><input type="checkbox" checked={selectedTagIds.includes(tag.id)} onChange={() => toggleTagFilter(tag.id)} /><i style={{ '--tag-color': tag.color }} />{tag.name}<small>{tagCounts.get(tag.id) || 0}</small></label>) : <p>Chưa có thẻ để lọc.</p>}</div>}</div></div>
          <div className="conversation-filter-tabs" aria-label="Bộ lọc hội thoại">
            <button type="button" className={!showUnreadOnly ? 'is-active' : ''} onClick={() => setShowUnreadOnly(false)}>Tất cả</button>
            <button type="button" className={showUnreadOnly ? 'is-active' : ''} onClick={() => setShowUnreadOnly((value) => !value)}><MailOpen size={14} /> Chưa đọc{unreadCount ? ` (${unreadCount})` : ''}</button>
          </div>
          {selectedTagIds.length > 0 && <div className="conversation-active-filter"><Tag size={13} /> Đang lọc {selectedTagIds.length} thẻ<button type="button" onClick={() => setSelectedTagIds([])}>Xóa</button></div>}
          <div className="conversation-list__items">
            {filteredThreads.length ? filteredThreads.map((thread) => {
              const latest = thread.messages.at(-1);
              const isUnread = isThreadUnread(thread);
              return <button className={`conversation-item ${selectedThread?.key === thread.key ? 'is-selected' : ''} ${isUnread ? 'is-unread' : ''}`} key={thread.key} onClick={() => selectThread(thread)}><span className={`conversation-item__avatar ${isOnline(thread.contactId) ? 'is-online' : ''}`}>{thread.contactName.slice(0, 1)}</span><span className="conversation-item__copy"><strong>{thread.contactName}</strong><small>{thread.course?.title || 'Trao đổi lịch học'}</small><em>{latest?.text}</em>{getThreadTags(thread).length > 0 && <span className="conversation-item__tags">{getThreadTags(thread).map((tag) => <i key={tag.id} style={{ '--tag-color': tag.color }}>{tag.name}</i>)}</span>}</span>{isUnread && <b className="conversation-item__unread" aria-label="Có tin nhắn chưa đọc" />}</button>;
            }) : <div className="conversation-empty"><MessageCircle size={24} /><p>Chưa có cuộc trò chuyện nào.</p></div>}
          </div>
        </aside>
        <main className="chat-window">
          {selectedThread ? <>
            <header className="chat-window__head">
              <span className={`chat-window__avatar ${isOnline(selectedThread.contactId) ? 'is-online' : ''}`}>{selectedThread.contactName.slice(0, 1)}</span>
              <div className="chat-window__contact">
                <h2>{selectedThread.contactName}</h2>
                <p>{selectedThread.course?.title || 'Trao đổi lịch học'}</p>
                {getThreadTags(selectedThread).length > 0 && <div className="chat-window__profile-tags">{getThreadTags(selectedThread).map((tag) => <span key={tag.id} style={{ '--tag-color': tag.color }}>{tag.name}</span>)}</div>}
              </div>
              <span className={`chat-window__status ${isOnline(selectedThread.contactId) ? 'is-online' : ''}`}>{isOnline(selectedThread.contactId) ? 'Đang hoạt động' : 'Ngoại tuyến'}</span>
              <button type="button" className="chat-window__unread" onClick={markSelectedUnread}><MailOpen size={15} /> Đánh dấu chưa đọc</button>
            </header>
            <div className="message-history">{selectedThread.messages.map((message) => <article className={`chat-bubble ${message.senderId === user?.id || (!message.senderId && message.studentId === user?.id) ? 'is-own' : ''}`} key={message.id}><p>{message.text}</p><span>{displayTime(message.createdAt)}</span></article>)}</div>
            {showTagCreator && <section className="chat-tag-creator"><form onSubmit={addTag}><label>Tạo thẻ mới<span className="tag-name-input"><input value={tagDraft} onChange={(event) => setTagDraft(event.target.value.slice(0, 25))} placeholder="Ví dụ: Cần tư vấn" maxLength="25" aria-describedby="tag-character-count" autoFocus /><small id="tag-character-count" className={tagDraft.length >= 25 ? 'is-limit' : ''}>{tagDraft.length}/25</small></span></label><fieldset><span className="tag-color-picker">{TAG_COLORS.map((color) => <button type="button" key={color.id} className={tagColor === color.value ? 'is-active' : ''} style={{ '--tag-color': color.value }} onClick={() => setTagColor(color.value)} aria-label={`Chọn màu ${color.label}`} />)}</span></fieldset><button type="submit" disabled={!tagDraft.trim()}>Tạo và gắn thẻ</button></form>{tagNotice && <p className="chat-tag-creator__notice">{tagNotice}</p>}{allTags.length > 0 && <div className="chat-tag-creator__library"><span>Thẻ đã tạo</span><div>{allTags.map((tag) => <span key={tag.id} style={{ '--tag-color': tag.color }}>{tag.name}<button type="button" onClick={() => deleteTag(tag.id)} aria-label={`Xóa thẻ ${tag.name}`} title={`Xóa thẻ ${tag.name}`}><X size={12} /></button></span>)}</div></div>}</section>}
            <nav className="chat-tag-bar" aria-label="Gắn thẻ"><span><Tag size={14} /> Gắn thẻ</span><div>{allTags.length ? allTags.map((tag) => { const isApplied = getThreadTags(selectedThread).some((item) => item.id === tag.id); return <button type="button" key={tag.id} className={isApplied ? 'is-applied' : ''} style={{ '--tag-color': tag.color }} onClick={() => toggleTag(tag)} aria-pressed={isApplied} title={isApplied ? `Bỏ thẻ ${tag.name}` : `Gắn thẻ ${tag.name}`}>{tag.name}{isApplied && <X size={12} />}</button>; }) : <small>Chưa có thẻ</small>}</div><button type="button" className="chat-tag-bar__create" onClick={() => setShowTagCreator((value) => !value)}><Plus size={14} /> {showTagCreator ? 'Đóng' : 'Tạo thẻ'}</button></nav>
            <form className="chat-composer" onSubmit={send}><textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={submitOnPlainEnter} placeholder="Viết tin nhắn để chốt lịch học..." rows="1" /><button type="submit" aria-label="Gửi tin nhắn"><Send size={18} /></button></form>
          </> : <div className="chat-window__empty"><span><MessageCircle size={32} /></span><h2>Bắt đầu một cuộc trò chuyện</h2><p>Khi bạn đăng ký học một khóa học, lời nhắn sẽ xuất hiện tại đây.</p></div>}
        </main>
      </div>
    </section>
  );
}
