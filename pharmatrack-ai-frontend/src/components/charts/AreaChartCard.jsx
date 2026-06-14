import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Card from '@/components/ui/Card';
import ChartLegend from './ChartLegend';
import ChartTooltip from './ChartTooltip';
import { cn } from '@/utils/cn';

export default function AreaChartCard({
  title,
  subtitle,
  data = [],
  areas = [],
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
          <AreaChart data={data} margin={{ top: 5, right: 12, left: -12, bottom: 0 }}>
            <defs>
              {areas.map((area) => (
                <linearGradient key={area.dataKey} id={`area-${area.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={area.color ?? 'rgb(var(--color-primary))'} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={area.color ?? 'rgb(var(--color-primary))'} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
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
            {areas.map((area) => (
              <Area
                key={area.dataKey}
                type="monotone"
                dataKey={area.dataKey}
                name={area.name ?? area.dataKey}
                stroke={area.color ?? 'rgb(var(--color-primary))'}
                strokeWidth={2}
                strokeDasharray={area.dashed ? '5 5' : undefined}
                fill={`url(#area-${area.dataKey})`}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {areas.length > 1 && (
        <ChartLegend
          className="mt-4 justify-center"
          items={areas.map((area) => ({
            label: area.name ?? area.dataKey,
            color: area.color ?? 'rgb(var(--color-primary))',
            dashed: area.dashed,
          }))}
        />
      )}
    </>
  );

  if (bare) return content;

  return <Card className={cn('p-6', className)}>{content}</Card>;
}
