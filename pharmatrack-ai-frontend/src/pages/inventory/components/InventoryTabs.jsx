import { NavLink } from 'react-router-dom';
import Icon from '@/components/common/Icon';
import { cn } from '@/utils/cn';

const TABS = [
  { to: '/inventory/in', label: 'Inventory In', icon: 'call_received' },
  { to: '/inventory/out', label: 'Inventory Out', icon: 'call_made' },
];

export default function InventoryTabs({ className = '' }) {
  return (
    <div role="tablist" className={cn('flex items-center gap-1 border-b border-outline-variant', className)}>
      {TABS.map((tab) => (
        <NavLink key={tab.to} to={tab.to} end>
          {({ isActive }) => (
            <span
              className={cn(
                'relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
                isActive ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
              )}
            >
              <Icon name={tab.icon} className="text-base" />
              {tab.label}
              {isActive && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary shadow-glow" />}
            </span>
          )}
        </NavLink>
      ))}
    </div>
  );
}
