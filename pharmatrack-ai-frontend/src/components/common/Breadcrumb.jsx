import { Link } from 'react-router-dom';
import Icon from './Icon';
import { cn } from '@/utils/cn';

export default function Breadcrumb({ items = [], className = '' }) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-2 text-sm text-on-surface-variant', className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={item.label} className="flex items-center gap-2">
            {index > 0 && <Icon name="chevron_right" className="text-sm text-outline" />}
            {item.path && !isLast ? (
              <Link to={item.path} className="transition-colors hover:text-primary">
                {item.label}
              </Link>
            ) : (
              <span className={cn(isLast && 'font-medium text-on-surface')}>{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
