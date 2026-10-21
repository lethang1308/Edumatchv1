import { Heart } from 'lucide-react';
import './reactionCount.css';

/** Compact, discoverable reaction total placed at the end of a discussion action row. */
export function ReactionCount({ count = 0, label, onClick }) {
  if (!count) return null;

  return <button type="button" className="discussion-reaction-count" onClick={onClick} aria-label={label} title={label}>
    <span className="discussion-reaction-count__icon"><Heart size={10} fill="currentColor" aria-hidden="true" /></span>
    <span>{count}</span>
  </button>;
}
