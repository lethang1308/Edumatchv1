import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Forward, MessageCircle, Minus, Reply, Send, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { createConversationId, getCourse, getConversationsForUser, saveConversation } from '@/features/learning/marketplace';
import { conversationThreadKey, getChatWidget, setChatWidget, updateChatWidget } from '@/features/learning/chatWidget';
import { submitOnPlainEnter } from '@/utils/submitOnPlainEnter';
import './floating-chat.css';

export function FloatingChat() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [, setRevision] = useState(0);
  const [draft, setDraft] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [forwarding, setForwarding] = useState(null);
  const [showNewMessages, setShowNewMessages] = useState(false);
  const historyRef = useRef(null);
  const messageRefs = useRef(new Map());
  const replyHighlightTimer = useRef(null);
  const previousMessageCount = useRef(0);
  const forceScrollToBottom = useRef(true);
  const seenIncomingMessageIds = useRef(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);
  const widget = getChatWidget(user?.id);
  const messages = getConversationsForUser(user?.id);
  const threadMessages = messages.filter((message) => conversationThreadKey(message) === widget?.threadKey).reverse();
  const reference = threadMessages[0];
  const course = reference ? getCourse(reference.courseId) : null;
  const isTeacher = reference?.teacherId === user?.id;
  const contactName = isTeacher ? reference?.studentName || 'Học viên EduMatch' : reference?.teacherName || course?.teacher?.name || 'Giáo viên EduMatch';
  const forwardTargets = (() => {
    const unique = new Map();
    messages.forEach((message) => {
      const key = conversationThreadKey(message);
      if (key === widget?.threadKey || unique.has(key)) return;
      const senderIsTeacher = message.teacherId === user?.id;
      unique.set(key, {
        key,
        courseId: message.courseId,
        teacherId: message.teacherId,
        teacherName: message.teacherName || getCourse(message.courseId)?.teacher?.name || 'Giáo viên EduMatch',
        studentId: message.studentId,
        studentName: message.studentName || 'Học viên EduMatch',
        name: senderIsTeacher ? message.studentName || 'Học viên EduMatch' : message.teacherName || getCourse(message.courseId)?.teacher?.name || 'Giáo viên EduMatch',
      });
    });
    return [...unique.values()];
  })();

  useEffect(() => {
    const refresh = () => setRevision((value) => value + 1);
    window.addEventListener('edumatch:chat-widget-updated', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('edumatch:chat-widget-updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    const incoming = messages.filter((message) => message.senderId && message.senderId !== user.id);
    const incomingIds = new Set(incoming.map((message) => message.id));
    if (seenIncomingMessageIds.current === null) {
      seenIncomingMessageIds.current = incomingIds;
      return;
    }
    const newestIncoming = incoming.find((message) => !seenIncomingMessageIds.current.has(message.id));
    seenIncomingMessageIds.current = incomingIds;
    if (newestIncoming) {
      forceScrollToBottom.current = false;
      setChatWidget(user.id, conversationThreadKey(newestIncoming), { isClosed: false, isMinimized: false });
    }
  }, [messages, user?.id]);

  useEffect(() => {
    const history = historyRef.current;
    if (!history || !threadMessages.length) return;
    const hadMessages = previousMessageCount.current > 0;
    const isNearBottom = history.scrollHeight - history.scrollTop - history.clientHeight < 36;
    if (forceScrollToBottom.current || !hadMessages || isNearBottom) {
      history.scrollTop = history.scrollHeight;
      setShowNewMessages(false);
    } else if (threadMessages.length > previousMessageCount.current) {
      setShowNewMessages(true);
    }
    previousMessageCount.current = threadMessages.length;
    forceScrollToBottom.current = false;
  }, [threadMessages.length, widget?.threadKey]);

  useEffect(() => () => window.clearTimeout(replyHighlightTimer.current), []);

  if (!user || pathname === ROUTES.MESSAGES || !widget || widget.isClosed || !reference) return null;

  const send = (event) => {
    event.preventDefault();
    if (!draft.trim()) return;
    saveConversation({
      id: createConversationId('floating-message'),
      courseId: reference.courseId,
      teacherId: reference.teacherId,
      teacherName: reference.teacherName || course?.teacher?.name || 'Giáo viên EduMatch',
      studentId: reference.studentId,
      studentName: reference.studentName || 'Học viên EduMatch',
      senderId: user.id,
      text: draft.trim(),
      replyTo: replyingTo ? { id: replyingTo.id, text: replyingTo.text, senderName: replyingTo.senderId === user.id ? 'Bạn' : contactName } : null,
      createdAt: 'Vừa xong',
    });
    setDraft('');
    setReplyingTo(null);
    forceScrollToBottom.current = true;
    setRevision((value) => value + 1);
  };
  const scrollToLatest = () => {
    const history = historyRef.current;
    if (history) history.scrollTop = history.scrollHeight;
    setShowNewMessages(false);
  };
  const scrollToOriginalMessage = (messageId) => {
    const target = messageRefs.current.get(messageId);
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setHighlightedMessageId(messageId);
    window.clearTimeout(replyHighlightTimer.current);
    replyHighlightTimer.current = window.setTimeout(() => setHighlightedMessageId(null), 1400);
  };
  const forwardMessage = (target) => {
    if (!forwarding) return;
    saveConversation({
      id: createConversationId('forwarded-message'),
      courseId: target.courseId,
      teacherId: target.teacherId,
      teacherName: target.teacherName,
      studentId: target.studentId,
      studentName: target.studentName,
      senderId: user.id,
      text: forwarding.text,
      forwarded: true,
      forwardedFrom: forwarding.senderId === user.id ? 'Bạn' : contactName,
      createdAt: 'Vừa xong',
    });
    setForwarding(null);
    setRevision((value) => value + 1);
  };
  const minimize = () => updateChatWidget(user.id, { isMinimized: !widget.isMinimized });
  const close = () => updateChatWidget(user.id, { isClosed: true });

  if (widget.isMinimized) return <button type="button" className="floating-chat__minimized" onClick={minimize} aria-label={`Mở chat với ${contactName}`}><MessageCircle size={18} /><span>{contactName}</span><ChevronDown size={16} /></button>;

  return <aside className="floating-chat" aria-label={`Cửa sổ chat với ${contactName}`}>
    <header className="floating-chat__head"><span>{contactName.slice(0, 1)}</span><div><strong>{contactName}</strong><small>{course?.title || 'Trao đổi lịch học'}</small></div><button type="button" onClick={minimize} aria-label="Thu nhỏ cửa sổ chat"><Minus size={16} /></button><button type="button" onClick={close} aria-label="Đóng cửa sổ chat"><X size={17} /></button></header>
    <div className="floating-chat__history" ref={historyRef} onScroll={() => { const history = historyRef.current; if (history && history.scrollHeight - history.scrollTop - history.clientHeight < 36) setShowNewMessages(false); }}>{threadMessages.map((message) => <article className={`${message.senderId === user.id || (!message.senderId && message.studentId === user.id) ? 'is-own' : ''} ${highlightedMessageId === message.id ? 'is-highlighted' : ''}`} key={message.id} ref={(node) => { if (node) messageRefs.current.set(message.id, node); else messageRefs.current.delete(message.id); }}>{message.forwarded && <span className="floating-chat__forwarded">Đã chuyển tiếp</span>}{message.replyTo && <button type="button" className="floating-chat__reply-preview" onClick={() => scrollToOriginalMessage(message.replyTo.id)} aria-label="Xem tin nhắn gốc"><strong>{message.replyTo.senderName}</strong><span>{message.replyTo.text}</span></button>}<p>{message.text}</p><div className="floating-chat__message-meta"><small>{message.createdAt || 'Vừa xong'}</small><span className="floating-chat__message-actions"><button type="button" onClick={() => setReplyingTo(message)} aria-label="Trả lời tin nhắn"><Reply size={13} /></button><button type="button" onClick={() => setForwarding(message)} aria-label="Chuyển tiếp tin nhắn"><Forward size={13} /></button></span></div></article>)}</div>
    {showNewMessages && <button type="button" className="floating-chat__new-message" onClick={scrollToLatest}>Xem tin nhắn mới nhất</button>}
    <form className="floating-chat__composer" onSubmit={send}>{replyingTo && <div className="floating-chat__replying"><span>Đang trả lời: {replyingTo.text}</span><button type="button" onClick={() => setReplyingTo(null)} aria-label="Hủy trả lời"><X size={14} /></button></div>}<div><textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={submitOnPlainEnter} rows="1" placeholder="Viết tin nhắn..." /><button type="submit" aria-label="Gửi tin nhắn"><Send size={17} /></button></div></form>
    {forwarding && <div className="floating-chat__forward-dialog" role="dialog" aria-modal="true" aria-label="Chuyển tiếp tin nhắn"><div><header><strong>Chuyển tiếp tin nhắn</strong><button type="button" onClick={() => setForwarding(null)} aria-label="Đóng"><X size={17} /></button></header><p>{forwarding.text}</p><span>Chọn người đã từng nhắn tin</span><section>{forwardTargets.length ? forwardTargets.map((target) => <button type="button" key={target.key} onClick={() => forwardMessage(target)}>{target.name}</button>) : <small>Chưa có cuộc trò chuyện khác để chuyển tiếp.</small>}</section></div></div>}
  </aside>;
}
