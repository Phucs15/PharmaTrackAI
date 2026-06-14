import Icon from './Icon';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/utils/cn';

export default function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-primary/10 hover:text-primary',
        className
      )}
    >
      <Icon name={isDark ? 'light_mode' : 'dark_mode'} />
    </button>
  );
}
