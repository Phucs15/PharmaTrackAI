import Icon from './Icon';
import { cn } from '@/utils/cn';

export default function SearchInput({ value, onChange, placeholder = 'Search...', className = '', ...props }) {
  return (
    <div
      className={cn(
        'group relative flex items-center rounded-full border border-outline/20 bg-surface-container/50 px-4 py-2 transition-colors focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/30 hover:bg-primary/5',
        className
      )}
    >
      <Icon name="search" className="mr-3 text-on-surface-variant transition-colors group-focus-within:text-primary" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full border-none bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-variant/50 focus:ring-0"
        {...props}
      />
    </div>
  );
}
