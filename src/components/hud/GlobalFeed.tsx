import { useState, useMemo } from 'react'
import { Search, TrendingUp, TrendingDown, Minus, ExternalLink } from 'lucide-react'
import { sentimentColors } from '../../lib/news'
import { formatPublishedDate } from '../../lib/news'
import type { NewsArticle } from '../../types/news'

interface GlobalFeedProps {
  articles: NewsArticle[]
  onArticleClick: (article: NewsArticle) => void
}

export function GlobalFeed({ articles, onArticleClick }: GlobalFeedProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Filter articles by search
  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) return articles.slice(0, 20)
    const query = searchQuery.toLowerCase()
    return articles
      .filter(a => 
        (a.title || '').toLowerCase().includes(query) ||
        (a.country || '').toLowerCase().includes(query) ||
        (a.source?.name || '').toLowerCase().includes(query)
      )
      .slice(0, 20)
  }, [articles, searchQuery])

  const sentimentConfig = {
    positive: { icon: TrendingUp, color: sentimentColors.positive },
    negative: { icon: TrendingDown, color: sentimentColors.negative },
    neutral: { icon: Minus, color: sentimentColors.neutral },
  }

  return (
    <div className="flex flex-col min-h-0">
      {/* Header */}
      <div className="p-3 border-b border-[var(--hud-border)]">
        <h3 className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider mb-2">
          Global Feed
        </h3>
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted-foreground)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search news..."
            className="w-full h-8 pl-8 pr-3 text-xs bg-[var(--hud-surface)] border border-[var(--hud-border)] rounded-md text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--hud-border-hover)] transition-colors"
          />
        </div>
      </div>

      {/* Feed list */}
      <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1">
        {filteredArticles.length > 0 ? (
          filteredArticles.map((article) => {
            const sentiment = article.sentiment || 'neutral'
            const config = sentimentConfig[sentiment]
            const sourceName = article.source?.name || 'Unknown source'
            const title = article.title || 'Untitled'

            return (
              <button
                key={article.id}
                onClick={() => onArticleClick(article)}
                className="feed-row w-full text-left group"
              >
                {/* Sentiment indicator */}
                <div 
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: config.color }}
                />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[var(--foreground)] line-clamp-2 leading-tight group-hover:text-[var(--tropical-teal)] transition-colors">
                    {title}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] text-[var(--muted-foreground)]">
                      {sourceName}
                    </span>
                    <span className="text-[10px] text-[var(--muted-foreground)] opacity-40">•</span>
                    <span className="text-[10px] text-[var(--muted-foreground)]">
                      {formatPublishedDate(article.publishedAt)}
                    </span>
                  </div>
                </div>

                {/* Arrow indicator */}
                <ExternalLink className="w-3 h-3 text-[var(--muted-foreground)] opacity-0 group-hover:opacity-60 transition-opacity flex-shrink-0" />
              </button>
            )
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Search className="w-8 h-8 text-[var(--muted-foreground)] mb-2 opacity-40" />
            <p className="text-xs text-[var(--muted-foreground)]">
              No articles found
            </p>
          </div>
        )}
      </div>

      {/* Footer count */}
      <div className="p-2 border-t border-[var(--hud-border)]">
        <p className="text-[10px] text-[var(--muted-foreground)] text-center">
          Showing {filteredArticles.length} of {articles.length} articles
        </p>
      </div>
    </div>
  )
}
