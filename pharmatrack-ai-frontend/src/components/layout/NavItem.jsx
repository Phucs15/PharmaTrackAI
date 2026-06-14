import { NavLink, useLocation } from 'react-router-dom';
import Icon from '@/components/common/Icon';
import { cn } from '@/utils/cn';

export default function NavItem({ icon, label, path, matchPaths, onClick }) {
  const location = useLocation();
  const isActive = matchPaths
    ? matchPaths.some((match) => location.pathname.startsWith(match))
    : location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <NavLink
      to={path}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium tracking-wide transition-all duration-300 active:scale-95',
        isActive
          ? 'border-r-2 border-primary bg-primary/10 text-primary'
          : 'text-on-surface-variant hover:bg-primary/5 hover:text-primary'
      )}
    >
      <Icon name={icon} />
      <span>{label}</span>
    </NavLink>
  );
}
