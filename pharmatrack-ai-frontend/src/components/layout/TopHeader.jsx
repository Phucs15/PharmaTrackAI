import { useNavigate } from 'react-router-dom';
import Icon from '@/components/common/Icon';
import IconButton from '@/components/common/IconButton';
import SearchInput from '@/components/common/SearchInput';
import ThemeToggle from '@/components/common/ThemeToggle';
import Avatar from '@/components/common/Avatar';
import Dropdown from '@/components/ui/Dropdown';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/utils/cn';

export default function TopHeader({ onMenuClick, className = '' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-primary/10 bg-surface/80 px-4 backdrop-blur-xl transition-colors duration-300 dark:bg-surface/60 lg:left-64 lg:px-8',
        className
      )}
    >
      <div className="flex flex-1 items-center gap-3">
        <IconButton icon="menu" label="Open menu" onClick={onMenuClick} className="lg:hidden" />
        <SearchInput placeholder="Search medicines, batches, alerts..." className="hidden w-full max-w-96 sm:flex" />
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <ThemeToggle />
        <IconButton icon="notifications" label="Notifications" badge />
        <IconButton icon="help" label="Help" className="hidden sm:flex" />
        <div className="mx-1 hidden h-8 w-px bg-outline/20 sm:block" />
        <Dropdown
          align="right"
          trigger={
            <button
              type="button"
              className="flex items-center gap-3 rounded-full border border-transparent p-1 pr-3 transition-colors hover:border-primary/20 hover:bg-primary/5"
            >
              <Avatar src={user?.avatarUrl} name={user?.name} size="sm" />
              <span className="hidden text-sm font-medium text-on-surface lg:block">{user?.name}</span>
              <Icon name="expand_more" className="hidden text-sm text-on-surface-variant lg:block" />
            </button>
          }
          items={[
            { label: 'Settings', icon: 'settings', onClick: () => navigate('/settings') },
            { divider: true },
            { label: 'Log Out', icon: 'logout', danger: true, onClick: handleLogout },
          ]}
        />
      </div>
    </header>
  );
}
