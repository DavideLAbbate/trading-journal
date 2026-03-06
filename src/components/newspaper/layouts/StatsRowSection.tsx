import type { StatItem } from '../../../types/newspaper'

interface StatsRowSectionProps {
  stats: StatItem[]
}

export function StatsRowSection({ stats }: StatsRowSectionProps) {
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

  return (
    <div className="flex flex-nowrap items-stretch gap-0 border-y border-[var(--hud-border)] py-2">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className="flex-1 flex flex-col items-center px-2 first:pl-0 last:pr-0"
        >
          <span className="text-[var(--muted-foreground)] text-[0.6rem] font-mono uppercase tracking-wider">
            {stat.label}
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-[var(--foreground)] font-bold text-lg">
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
          {index < stats.length - 1 && (
            <div className="absolute right-0 top-1/4 h-1/2 w-px bg-[var(--hud-border)]" />
          )}
        </div>
      ))}
    </div>
  )
}
