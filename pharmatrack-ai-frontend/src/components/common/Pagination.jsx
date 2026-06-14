import Icon from './Icon';
import { cn } from '@/utils/cn';

export default function Pagination({ page, totalPages, onPageChange, className = '' }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className={cn('flex items-center justify-between gap-4', className)} aria-label="Pagination">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="flex items-center gap-1 rounded-lg border border-outline-variant px-3 py-1.5 text-sm text-on-surface-variant transition-colors hover:border-primary/50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Icon name="chevron_left" className="text-base" />
        Previous
      </button>
      <div className="flex items-center gap-1">
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={cn(
              'h-8 w-8 rounded-lg text-sm font-medium transition-colors',
              p === page
                ? 'bg-primary text-on-primary shadow-glow'
                : 'text-on-surface-variant hover:bg-primary/10 hover:text-primary'
            )}
          >
            {p}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="flex items-center gap-1 rounded-lg border border-outline-variant px-3 py-1.5 text-sm text-on-surface-variant transition-colors hover:border-primary/50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
        <Icon name="chevron_right" className="text-base" />
      </button>
    </nav>
  );
}
