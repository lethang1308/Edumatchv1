import React, { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

const modalSizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export const Modal = ({
  open,
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  className,
}) => {
  const isModalOpen = open !== undefined ? open : isOpen;
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isModalOpen) return;

    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const focusableSelector =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex="0"]';
    const focusableElements = () =>
      Array.from(dialogRef.current?.querySelectorAll(focusableSelector) || []).filter(
        (element) => element.getClientRects().length > 0
      );

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCloseRef.current?.();
      }
      if (e.key === 'Tab') {
        const elements = focusableElements();
        const first = elements[0];
        const last = elements[elements.length - 1];
        if (!first) {
          e.preventDefault();
          dialogRef.current?.focus();
        } else if (
          e.shiftKey &&
          (document.activeElement === first || document.activeElement === dialogRef.current)
        ) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    (focusableElements()[0] || dialogRef.current)?.focus({ preventScroll: true });

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [isModalOpen]);

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Window */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        className={cn(
          'relative w-full rounded-2xl bg-white shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] z-10 animate-in fade-in zoom-in-95 duration-150',
          modalSizes[size] || modalSizes.md,
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            {title && (
              <h3 id={titleId} className="text-lg font-semibold text-slate-900">
                {title}
              </h3>
            )}
            {description && (
              <p id={descriptionId} className="text-sm text-slate-500 mt-0.5">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng hộp thoại"
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="px-6 py-5 overflow-y-auto flex-1">{children}</div>

        {/* Footer Actions */}
        {footer && (
          <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2.5 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
