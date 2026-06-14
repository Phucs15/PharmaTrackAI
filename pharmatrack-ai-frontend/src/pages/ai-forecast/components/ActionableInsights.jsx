import Icon from '@/components/common/Icon';
import Card from '@/components/ui/Card';
import { cn } from '@/utils/cn';

const TYPE_CONFIG = {
  risk: {
    accent: 'border-l-error',
    iconClass: 'text-error',
    icon: 'warning',
    badgeIcon: 'error',
    label: 'Risk of Stockout',
    labelClass: 'text-error',
    actionClass: 'bg-error/10 text-error border border-error/20 hover:bg-error/20',
  },
  optimization: {
    accent: 'border-l-primary',
    iconClass: 'text-primary',
    icon: 'model_training',
    badgeIcon: 'check_circle',
    label: 'Inventory Optimization',
    labelClass: 'text-primary',
    actionClass: 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20',
  },
};

export default function ActionableInsights({ insights = [] }) {
  return (
    <div>
      <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-on-surface">
        <Icon name="auto_awesome" className="text-primary" />
        Actionable Insights
      </h3>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {insights.map((insight) => {
          const config = TYPE_CONFIG[insight.type] ?? TYPE_CONFIG.optimization;
          return (
            <Card key={insight.title} className={cn('relative overflow-hidden border-l-4 p-6', config.accent)}>
              <div className="absolute right-0 top-0 p-4 opacity-10">
                <Icon name={config.icon} className={cn('text-6xl', config.iconClass)} />
              </div>
              <div className={cn('relative z-10 mb-3 flex items-center gap-2', config.labelClass)}>
                <Icon name={config.badgeIcon} className="text-sm" />
                <span className="text-xs font-bold uppercase tracking-wider">{config.label}</span>
              </div>
              <h4 className="relative z-10 mb-2 text-lg font-semibold text-on-surface">{insight.title}</h4>
              <p className="relative z-10 mb-4 text-sm text-on-surface-variant">{insight.description}</p>
              <button
                type="button"
                className={cn('relative z-10 flex items-center gap-2 rounded px-4 py-2 text-sm font-medium transition-colors', config.actionClass)}
              >
                {insight.action}
                <Icon name="arrow_forward" className="text-sm" />
              </button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
