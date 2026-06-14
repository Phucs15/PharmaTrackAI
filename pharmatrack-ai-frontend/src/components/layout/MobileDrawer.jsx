import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Sidebar from './Sidebar';
import IconButton from '@/components/common/IconButton';

export default function MobileDrawer({ open, onClose }) {
  useEffect(() => {
    if (!open) return undefined;

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex lg:hidden">
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 h-full w-72 animate-fade-in-up">
        <Sidebar className="w-72" onNavigate={onClose} />
        <IconButton
          icon="close"
          label="Close menu"
          onClick={onClose}
          className="absolute right-3 top-3 bg-surface-container-high"
        />
      </div>
    </div>,
    document.body
  );
}
