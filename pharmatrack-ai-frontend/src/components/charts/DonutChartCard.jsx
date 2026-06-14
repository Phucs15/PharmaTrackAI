import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import Card from '@/components/ui/Card';
import ChartTooltip from './ChartTooltip';
import { cn } from '@/utils/cn';

export default function DonutChartCard({
  title,
  subtitle,
  data = [],
  height = 240,
  valueFormatter,
  centerLabel,
  centerValue,
  action,
  className = '',
  bare = false,
}) {
  const content = (
    <>
      {!bare && (title || subtitle || action) && (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title && <h3 className="text-base font-semibold text-on-surface">{title}</h3>}
            {subtitle && <p className="mt-1 text-sm text-on-surface-variant">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className="flex flex-col items-center gap-6 sm:flex-row">
        <div className="relative shrink-0" style={{ width: height, height }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius="65%"
                outerRadius="100%"
                paddingAngle={2}
                stroke="none"
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color ?? 'rgb(var(--color-primary))'} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip formatter={valueFormatter} />} />
            </PieChart>
          </ResponsiveContainer>
          {(centerLabel || centerValue !== undefined) && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              {centerValue !== undefined && <span className="text-2xl font-bold text-on-surface">{centerValue}</span>}
              {centerLabel && <span className="text-xs text-on-surface-variant">{centerLabel}</span>}
            </div>
          )}
        </div>
        <div className="flex w-full flex-col gap-2">
          {data.map((entry) => (
            <div key={entry.name} className="flex items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: entry.color ?? 'rgb(var(--color-primary))' }}
                />
                <span className="text-on-surface-variant">{entry.name}</span>
              </div>
              <span className="font-semibold text-on-surface">
                {valueFormatter ? valueFormatter(entry.value, entry.name) : entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  if (bare) return content;

  return <Card className={cn('p-6', className)}>{content}</Card>;
}
