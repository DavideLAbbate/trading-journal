import type { MarketData } from '../../../types/newspaper'
import { cn } from '../../../lib/utils'

interface MarketTickerSectionProps {
  markets: MarketData[]
}

export function MarketTickerSection({ markets }: MarketTickerSectionProps) {
  const directionColor = (direction: MarketData['direction']) => {
    switch (direction) {
      case 'up':
        return 'text-emerald-400'
      case 'down':
        return 'text-rose-400'
      default:
        return 'text-[var(--muted-foreground)]'
    }
  }

  const directionIcon = (direction: MarketData['direction']) => {
    switch (direction) {
      case 'up':
        return '▲'
      case 'down':
        return '▼'
      default:
        return '—'
    }
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 bg-[var(--hud-surface)]/30 p-2 rounded-sm">
      {markets.map((market) => (
        <div
          key={market.symbol}
          className="flex flex-col p-2 bg-[var(--hud-surface)]/60 border border-[var(--hud-border)] rounded-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-[var(--tropical-teal)] font-mono font-bold text-sm">
              {market.symbol}
            </span>
            <span className="text-[var(--muted-foreground)] text-[0.6rem]">
              {market.name}
            </span>
          </div>
          <div className="flex items-end justify-between mt-1">
            <span className="text-[var(--foreground)] font-semibold text-lg">
              {market.value}
            </span>
            <div className={cn('text-xs font-mono flex items-center gap-0.5', directionColor(market.direction))}>
              <span>{directionIcon(market.direction)}</span>
              <span>{market.change}</span>
              <span>({market.changePercent})</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
