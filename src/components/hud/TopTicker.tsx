import { useMemo } from 'react'
import { TrendingUp, TrendingDown, Minus, Globe2, Clock, Zap } from 'lucide-react'
import { sentimentColors } from '../../lib/news'
import type { NewsArticle } from '../../types/news'
import { formatPublishedDate } from '../../lib/news'

interface TopTickerProps {
  articles: NewsArticle[]
  countryCount: number
}

export function TopTicker({ articles, countryCount }: TopTickerProps) {
  // Calculate sentiment counts
  const stats = useMemo(() => {
    const positive = articles.filter(a => a.sentiment === 'positive').length
    const negative = articles.filter(a => a.sentiment === 'negative').length
    const neutral = articles.filter(a => a.sentiment === 'neutral' || !a.sentiment).length
    return { positive, negative, neutral, total: articles.length }
  }, [articles])

  // Get latest headlines for ticker
  const latestHeadlines = useMemo(() => {
    return [...articles]
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 8)
  }, [articles])

  // Duplicate headlines for seamless ticker
  const tickerItems = [...latestHeadlines, ...latestHeadlines]

  return (
    <div className="hud-panel flex items-center gap-4 px-4 py-2 overflow-hidden">
      {/* LATEST label */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="font-mono-hud text-[10px] font-semibold uppercase tracking-widest text-[var(--tropical-teal)]">
          Latest
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-[var(--hud-border)] flex-shrink-0" />

      {/* Stats compact */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-1.5 hud-stat">
          <Globe2 className="w-3.5 h-3.5 text-[var(--tropical-teal)]" />
          <span className="text-xs font-medium text-[var(--foreground)]">{countryCount}</span>
          <span className="text-[10px] text-[var(--muted-foreground)]">countries</span>
        </div>
        
        <div className="flex items-center gap-1.5 hud-stat">
          <TrendingUp className="w-3.5 h-3.5" style={{ color: sentimentColors.positive }} />
          <span className="text-xs font-medium text-[var(--foreground)]">{stats.positive}</span>
        </div>
        
        <div className="flex items-center gap-1.5 hud-stat">
          <Minus className="w-3.5 h-3.5" style={{ color: sentimentColors.neutral }} />
          <span className="text-xs font-medium text-[var(--foreground)]">{stats.neutral}</span>
        </div>
        
        <div className="flex items-center gap-1.5 hud-stat">
          <TrendingDown className="w-3.5 h-3.5" style={{ color: sentimentColors.negative }} />
          <span className="text-xs font-medium text-[var(--foreground)]">{stats.negative}</span>
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-[var(--hud-border)] flex-shrink-0" />

      {/* Scrolling ticker */}
      <div className="flex-1 overflow-hidden">
        <div className="flex animate-ticker gap-8">
          {tickerItems.map((article, idx) => (
            <div 
              key={`${article.id}-${idx}`}
              className="flex items-center gap-2 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <Clock className="w-3 h-3 text-[var(--muted-foreground)]" />
              <span className="text-xs text-[var(--muted-foreground)] max-w-[200px] truncate">
                {article.title}
              </span>
              <span className="text-[10px] text-[var(--muted-foreground)] opacity-60">
                {article.country}
              </span>
              <span className="text-[10px] text-[var(--muted-foreground)] opacity-40">
                {formatPublishedDate(article.publishedAt)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right side indicator */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Zap className="w-3.5 h-3.5 text-[var(--neon-ice)]" />
        <span className="text-xs font-medium text-[var(--neon-ice)]">LIVE</span>
      </div>
    </div>
  )
}
