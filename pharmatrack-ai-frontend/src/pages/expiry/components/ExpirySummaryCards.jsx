import Icon from '@/components/common/Icon';
import Card from '@/components/ui/Card';
import { cn } from '@/utils/cn';

const SEVERITY_CONFIG = {
  red: {
    border: 'border-error/30 hover:border-error/50',
    iconBg: 'bg-error/20',
    iconText: 'text-error',
    valueText: 'text-error',
    watermark: 'text-error',
    linkText: 'text-error hover:text-error/80',
  },
  orange: {
    border: 'border-orange-500/30 hover:border-orange-500/50',
    iconBg: 'bg-orange-500/20',
    iconText: 'text-orange-500',
    valueText: 'text-orange-500',
    watermark: 'text-orange-500',
    linkText: 'text-orange-500 hover:text-orange-600',
  },
  yellow: {
    border: 'border-yellow-500/30 hover:border-yellow-500/50',
    iconBg: 'bg-yellow-500/20',
    iconText: 'text-yellow-500',
    valueText: 'text-yellow-500',
    watermark: 'text-yellow-500',
    linkText: 'text-yellow-500 hover:text-yellow-600',
  },
};

const CARDS = [
  {
    severity: 'red',
    icon: 'block',
    watermark: 'warning',
    title: 'Expired',
    description: 'Batches requiring immediate disposal.',
    linkLabel: 'View critical items',
    key: 'expired',
  },
  {
    severity: 'orange',
    icon: 'timer',
    watermark: 'schedule',
    title: '< 30 Days',
    description: 'High risk of expiring before use.',
    linkLabel: 'Review near-expiry',
    key: 'within30',
  },
  {
    severity: 'yellow',
    icon: 'calendar_today',
    watermark: 'event',
    title: '< 90 Days',
    description: 'Monitor for potential redistribution.',
    linkLabel: 'Plan interventions',
    key: 'within90',
  },
];

export default function ExpirySummaryCards({ expired = 0, within30 = 0, within90 = 0, onFilter }) {
  const values = { expired, within30, within90 };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {CARDS.map((card) => {
        const palette = SEVERITY_CONFIG[card.severity];
        return (
          <Card
            key={card.key}
            className={cn(
              'relative overflow-hidden p-5 transition-colors',
              palette.border
            )}
          >
            <div className={cn('absolute right-0 top-0 p-4 opacity-10', palette.watermark)}>
              <Icon name={card.watermark} className="text-6xl" />
            </div>
            <div className="relative z-10 mb-4 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className={cn('flex h-8 w-8 items-center justify-center rounded-full', palette.iconBg)}>
                  <Icon name={card.icon} className={cn('text-sm', palette.iconText)} />
                </div>
                <h3 className="font-semibold text-on-surface">{card.title}</h3>
              </div>
              <span className={cn('text-2xl font-bold', palette.valueText)}>{values[card.key]}</span>
            </div>
            <p className="relative z-10 text-xs text-on-surface-variant">{card.description}</p>
            <div className={cn('relative z-10 mt-4 border-t pt-4', palette.border)}>
              <button
                type="button"
                onClick={() => onFilter?.(card.key)}
                className={cn('flex items-center gap-1 text-xs font-medium transition-colors', palette.linkText)}
              >
                {card.linkLabel}
                <Icon name="arrow_forward" className="text-xs" />
              </button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
