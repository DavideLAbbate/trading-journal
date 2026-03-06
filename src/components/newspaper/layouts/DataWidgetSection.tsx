import type { StatItem } from '../../../types/newspaper'

interface DataWidgetSectionProps {
  stats: StatItem[]
}

export function DataWidgetSection({ stats }: DataWidgetSectionProps) {
  const trendColor = (trend?: StatItem['trend']) => {
    switch (trend) {
      case 'up':
        return 'text-emerald-400'
      case 'down':
        return 'text-rose-400'
      default:
        return 'text-[var(--muted-foreground)]'
    }
  }

  const trendIcon = (trend?: StatItem['trend']) => {
    switch (trend) {
      case 'up':
        return '▲'
      case 'down':
        return '▼'
      default:
        return '—'
    }
  }

  return (
    <div className="grid grid-cols-2 gap-2 p-2 bg-[var(--hud-surface)]/40 border border-[var(--hud-border)] rounded-sm">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-col p-2 border border-[var(--hud-border)]/50 bg-[var(--hud-surface)]/60"
        >
          <span className="text-[var(--muted-foreground)] text-[0.6rem] font-mono uppercase tracking-wider">
            {stat.label}
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-xl font-bold ${trendColor(stat.trend)}`}>
              {stat.value}
            </span>
            {stat.unit && (
              <span className="text-[var(--muted-foreground)] text-xs">
                {stat.unit}
              </span>
            )}
            <span className={`text-xs font-mono ${trendColor(stat.trend)}`}>
              {trendIcon(stat.trend)}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
