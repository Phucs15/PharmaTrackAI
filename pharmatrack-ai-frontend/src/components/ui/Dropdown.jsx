import { useEffect, useRef, useState } from 'react';
import Icon from '@/components/common/Icon';
import { cn } from '@/utils/cn';

export default function Dropdown({ trigger, items = [], align = 'right', className = '' }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative inline-block">
      <div onClick={() => setOpen((prev) => !prev)}>{trigger}</div>
      {open && (
        <div
          role="menu"
          className={cn(
            'glass-elevated absolute z-40 mt-2 min-w-[12rem] overflow-hidden rounded-xl p-1.5 shadow-glow-lg animate-fade-in-up',
            align === 'right' ? 'right-0' : 'left-0',
            className
          )}
        >
          {items.map((item, index) =>
            item.divider ? (
              <div key={`divider-${index}`} className="my-1 h-px bg-outline-variant" />
            ) : (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                onClick={() => {
                  item.onClick?.();
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors',
                  item.danger
                    ? 'text-error hover:bg-error/10'
                    : 'text-on-surface-variant hover:bg-primary/10 hover:text-primary'
                )}
              >
                {item.icon && <Icon name={item.icon} className="text-base" />}
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
