import { clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// Teach the merger our semantic font sizes so `text-control` and `text-white`
// remain separate size/color utilities, while callers can still override sizes.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ['display', 'h1', 'h2', 'h3', 'h4', 'body', 'control', 'caption', 'caption-xs', 'micro'],
      radius: ['surface', 'control', 'pill'],
      shadow: ['edu'],
    },
  },
});

/**
 * Combines and merges class names using clsx and tailwind-merge
 * @param  {...any} inputs
 * @returns {string}
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default cn;
