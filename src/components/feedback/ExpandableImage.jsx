import { useState } from 'react';
import { Modal } from '@/components/feedback/Modal';
import './expandableImage.css';

export function ExpandableImage({ src, alt, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="expandable-image"
        onClick={() => setIsOpen(true)}
        aria-label={`Phóng to ${alt || 'ảnh đính kèm'}`}
      >
        <img className={className} src={src} alt={alt} />
      </button>
      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Ảnh đính kèm"
        size="xl"
        className="expandable-image-dialog"
      >
        <div className="expandable-image-dialog__content">
          <img src={src} alt={alt} />
        </div>
      </Modal>
    </>
  );
}
