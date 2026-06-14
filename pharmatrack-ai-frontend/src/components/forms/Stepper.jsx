import { Fragment } from 'react';
import Icon from '@/components/common/Icon';
import { cn } from '@/utils/cn';

export default function Stepper({ steps = [], activeStep = 0, className = '' }) {
  return (
    <div className={cn('flex items-start', className)}>
      {steps.map((step, index) => {
        const label = typeof step === 'string' ? step : step.label;
        const isCompleted = index < activeStep;
        const isActive = index === activeStep;

        return (
          <Fragment key={label}>
            <div className="flex flex-col items-center gap-2 text-center">
              <div
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all',
                  isCompleted
                    ? 'border-primary bg-primary text-on-primary'
                    : isActive
                      ? 'border-primary text-primary shadow-glow'
                      : 'border-outline-variant text-on-surface-variant'
                )}
              >
                {isCompleted ? <Icon name="check" className="text-lg" /> : index + 1}
              </div>
              <span
                className={cn(
                  'whitespace-nowrap text-xs font-medium',
                  isActive || isCompleted ? 'text-on-surface' : 'text-on-surface-variant'
                )}
              >
                {label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'mx-2 mb-6 mt-4 h-0.5 flex-1 rounded-full transition-colors',
                  isCompleted ? 'bg-primary' : 'bg-outline-variant'
                )}
              />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
