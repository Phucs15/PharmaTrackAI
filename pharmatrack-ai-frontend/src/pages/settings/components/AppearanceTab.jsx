import Icon from '@/components/common/Icon';
import Card from '@/components/ui/Card';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/utils/cn';

const THEME_OPTIONS = [
  { value: 'light', label: 'Light', icon: 'light_mode', swatch: 'bg-[#f7f9fb] border-[#c3c7ca]' },
  { value: 'dark', label: 'Dark', icon: 'dark_mode', swatch: 'bg-[#0a0e1a] border-[#42474e]' },
];

export default function AppearanceTab() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-base font-semibold text-on-surface">Theme</h3>
        <p className="mt-1 text-sm text-on-surface-variant">Choose how PharmaTrack AI looks on this device.</p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {THEME_OPTIONS.map((option) => {
            const isActive = theme === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setTheme(option.value)}
                aria-pressed={isActive}
                className={cn(
                  'flex items-center gap-4 rounded-xl border p-4 text-left transition-all',
                  isActive ? 'border-primary/50 bg-primary/5 shadow-glow' : 'border-outline-variant hover:border-primary/30'
                )}
              >
                <div className={cn('h-12 w-12 shrink-0 rounded-lg border', option.swatch)} />
                <div className="flex-1">
                  <p className="flex items-center gap-2 text-sm font-medium text-on-surface">
                    <Icon name={option.icon} className="text-base" />
                    {option.label}
                  </p>
                </div>
                {isActive && <Icon name="check_circle" filled className="text-primary" />}
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
