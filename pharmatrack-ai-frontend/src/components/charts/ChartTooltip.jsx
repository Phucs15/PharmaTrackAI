export default function ChartTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="glass-elevated rounded-lg px-3 py-2 text-xs shadow-glow-lg">
      {label && <p className="mb-1 font-semibold text-on-surface">{label}</p>}
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={`${entry.dataKey}-${entry.name}`} className="flex items-center gap-2">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-on-surface-variant">{entry.name}:</span>
            <span className="font-medium text-on-surface">
              {formatter ? formatter(entry.value, entry.name) : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
