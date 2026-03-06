import { useMemo } from 'react'
import { Zap } from 'lucide-react'
import { sentimentColors } from '../../lib/news'
import type { NewsArticle } from '../../types/news'
import { formatPublishedDate } from '../../lib/news'

interface TopTickerProps {
  articles: NewsArticle[]
  countryCount: number
}

// Sentiment dot color mapped to article
function sentimentDot(article: NewsArticle) {
  const s = article.sentiment || 'neutral'
  return sentimentColors[s]
}

export function TopTicker({ articles }: TopTickerProps) {
  // Build ticker items: each item is a country badge + headline
  const tickerItems = useMemo(() => {
    const sorted = [...articles]
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 12)
    return [...sorted, ...sorted] // duplicate for seamless loop
  }, [articles])

  const isEmpty = articles.length === 0

  return (
    <div className="flex items-center h-9 overflow-hidden">

      {/* LIVE pill — fixed left */}
      <div className="flex items-center gap-1.5 flex-shrink-0 px-3 bg-[var(--hud-surface)]">
        <Zap className="w-3 h-3 text-[var(--neon-ice)]" />
        <span className="font-mono-hud text-[10px] font-semibold uppercase tracking-widest text-[var(--neon-ice)]">
          Live
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-4 bg-[var(--hud-border)] flex-shrink-0" />

      {/* Scrolling area */}
      <div className="flex-1 overflow-hidden min-w-0">
        {isEmpty ? (
          <div className="flex items-center h-full px-4">
            <span className="text-xs text-[var(--muted-foreground)] opacity-40">Loading headlines...</span>
          </div>
        ) : (
          <div key={articles.length} className="flex animate-ticker w-max items-center">
            {tickerItems.map((article, idx) => (
              <div
                key={`${article.id}-${idx}`}
                className="flex items-center gap-2 flex-shrink-0 px-4"
              >
                {/* Country badge */}
                <span
                  className="font-mono-hud text-[9px] font-semibold px-1.5 py-0.5 rounded-sm border flex-shrink-0"
                  style={{
                    color: sentimentDot(article),
                    borderColor: sentimentDot(article) + '50',
                    backgroundColor: sentimentDot(article) + '15',
                  }}
                >
                  {article.countryCode || article.country?.slice(0, 2).toUpperCase()}
                </span>

                {/* Headline */}
                <span className="text-xs text-[var(--muted-foreground)] whitespace-nowrap">
                  {article.title}
                </span>

                {/* Time */}
                <span className="text-[10px] text-[var(--muted-foreground)] opacity-30 whitespace-nowrap flex-shrink-0">
                  {formatPublishedDate(article.publishedAt)}
                </span>

                {/* Item separator */}
                <div className="w-px h-3 bg-[var(--hud-border)] flex-shrink-0 ml-2 opacity-50" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
