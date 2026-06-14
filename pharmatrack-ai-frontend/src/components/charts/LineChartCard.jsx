import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Card from '@/components/ui/Card';
import ChartLegend from './ChartLegend';
import ChartTooltip from './ChartTooltip';
import { cn } from '@/utils/cn';

export default function LineChartCard({
  title,
  subtitle,
  data = [],
  lines = [],
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
          <LineChart data={data} margin={{ top: 5, right: 12, left: -12, bottom: 0 }}>
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
              cursor={{ stroke: 'rgb(var(--color-primary))', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            {lines.map((line) => (
              <Line
                key={line.dataKey}
                type="monotone"
                dataKey={line.dataKey}
                name={line.name ?? line.dataKey}
                stroke={line.color ?? 'rgb(var(--color-primary))'}
                strokeWidth={2}
                strokeDasharray={line.dashed ? '5 5' : undefined}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      {lines.length > 1 && (
        <ChartLegend
          className="mt-4 justify-center"
          items={lines.map((line) => ({
            label: line.name ?? line.dataKey,
            color: line.color ?? 'rgb(var(--color-primary))',
            dashed: line.dashed,
          }))}
        />
      )}
    </>
  );

  if (bare) return content;

  return <Card className={cn('p-6', className)}>{content}</Card>;
}
