import Icon from '@/components/common/Icon';
import { cn } from '@/utils/cn';

export default function Tabs({ tabs, activeTab, onChange, className = '' }) {
  return (
    <div role="tablist" className={cn('flex items-center gap-1 border-b border-outline-variant', className)}>
      {tabs.map((tab) => {
        const isActive = tab.value === activeTab;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.value)}
            className={cn(
              'relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
              isActive ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
            )}
          >
            {tab.icon && <Icon name={tab.icon} className="text-base" />}
            {tab.label}
            {isActive && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary shadow-glow" />
            )}
          </button>
        );
      })}
    </div>
  );
}
