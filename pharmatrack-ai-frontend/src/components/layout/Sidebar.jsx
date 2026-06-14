import { useNavigate } from 'react-router-dom';
import Icon from '@/components/common/Icon';
import NavItem from './NavItem';
import { NAV_ITEMS } from '@/constants/navigation';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/utils/cn';

export default function Sidebar({ className = '', onNavigate }) {
  const { hasRole } = useAuth();
  const navigate = useNavigate();
  const items = NAV_ITEMS.filter((item) => hasRole(item.roles));

  const handleNewBatch = () => {
    onNavigate?.();
    navigate('/batches');
  };

  return (
    <nav
      className={cn(
        'flex h-full w-64 flex-col border-r border-primary/10 bg-surface/80 shadow-[0_0_30px_rgb(var(--color-primary)/0.05)] backdrop-blur-xl transition-colors duration-300 dark:bg-surface/60',
        className
      )}
    >
      <div className="flex items-center gap-4 border-b border-primary/10 p-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 shadow-glow">
          <Icon name="science" className="text-primary" />
        </div>
        <div>
          <h1 className="font-headline text-xl font-semibold tracking-tight text-primary">PharmaTrack AI</h1>
          <p className="text-xs uppercase tracking-wider text-on-surface-variant opacity-80">Pharma Logistics</p>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
        {items.map((item) => (
          <NavItem key={item.path} {...item} onClick={onNavigate} />
        ))}
      </div>
      <div className="mt-auto border-t border-primary/10 p-6">
        <button
          type="button"
          onClick={handleNewBatch}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 font-medium tracking-wide text-primary shadow-glow transition-all duration-300 hover:bg-primary/20 active:scale-95"
        >
          <Icon name="add" className="text-sm" />
          New Batch
        </button>
      </div>
    </nav>
  );
}
