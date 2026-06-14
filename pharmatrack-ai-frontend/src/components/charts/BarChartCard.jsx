import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Card from '@/components/ui/Card';
import ChartLegend from './ChartLegend';
import ChartTooltip from './ChartTooltip';
import { cn } from '@/utils/cn';

export default function BarChartCard({
  title,
  subtitle,
  data = [],
  bars = [],
  xKey = 'name',
  height = 280,
  valueFormatter,
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
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 5, right: 12, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-outline-variant))" vertical={false} />
            <XAxis
              dataKey={xKey}
              stroke="rgb(var(--color-on-surface-variant))"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis stroke="rgb(var(--color-on-surface-variant))" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <Tooltip
              content={<ChartTooltip formatter={valueFormatter} />}
              cursor={{ fill: 'rgb(var(--color-primary) / 0.06)' }}
            />
            {bars.map((bar) => (
              <Bar
                key={bar.dataKey}
                dataKey={bar.dataKey}
                name={bar.name ?? bar.dataKey}
                fill={bar.color ?? 'rgb(var(--color-primary))'}
                radius={[6, 6, 0, 0]}
                maxBarSize={32}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      {bars.length > 1 && (
        <ChartLegend
          className="mt-4 justify-center"
          items={bars.map((bar) => ({
            label: bar.name ?? bar.dataKey,
            color: bar.color ?? 'rgb(var(--color-primary))',
          }))}
        />
      )}
    </>
  );

  if (bare) return content;

  return <Card className={cn('p-6', className)}>{content}</Card>;
}
