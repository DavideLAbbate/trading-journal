import { useState, useMemo } from 'react'
import { Dialog, DialogContent } from './ui/dialog'
import { ScrollArea } from './ui/scroll-area'
import { Badge } from './ui/badge'
import {
  X,
  Clock,
  MapPin,
  TrendingUp,
  TrendingDown,
  Minus,
  Tag,
  ExternalLink,
  ArrowUpDown,
  Filter,
  Sparkles,
  Zap,
} from 'lucide-react'
import type { NewsArticle } from '../types/news'
import { formatPublishedDate, sentimentColors } from '../lib/news'

interface CountryNewsModalProps {
  countryName: string
  articles: NewsArticle[]
  isOpen: boolean
  onClose: () => void
  onArticleClick: (article: NewsArticle) => void
}

type SortOption = 'newest' | 'oldest'

interface FilterState {
  sort: SortOption
  relevant: boolean
  highImpact: boolean
}

export function CountryNewsModal({
  countryName,
  articles,
  isOpen,
  onClose,
  onArticleClick,
}: CountryNewsModalProps) {
  const countryCode = articles[0]?.countryCode?.toUpperCase() || ''
  const [filters, setFilters] = useState<FilterState>({
    sort: 'newest',
    relevant: false,
    highImpact: false,
  })

  const filteredArticles = useMemo(() => {
    // Sort creates a new array
    const sorted = [...articles].sort((a, b) => {
      const dateA = new Date(a.publishedAt).getTime()
      const dateB = new Date(b.publishedAt).getTime()
      return filters.sort === 'newest' ? dateB - dateA : dateA - dateB
    })

    // Note: relevance and high-impact filtering are deferred (UI placeholders)
    // Business logic will be implemented later

    return sorted
  }, [articles, filters.sort])

  const handleSortChange = (sort: SortOption) => {
    setFilters((prev) => ({ ...prev, sort }))
  }

  const handleArticleClick = (article: NewsArticle) => {
    onClose()
    onArticleClick(article)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="max-w-2xl w-[95vw] max-h-[85vh] p-0 overflow-hidden border-0 bg-transparent shadow-none rounded-none sm:rounded-none"
        style={{ background: 'transparent' }}
      >
        <div className="relative rounded-none overflow-hidden border border-[var(--hud-border-strong)] border-t border-t-[var(--map-border-selected)] bg-[var(--hud-surface)] shadow-2xl flex flex-col max-h-[85vh]">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 w-7 h-7 rounded-sm bg-[var(--hud-surface)] border border-[var(--hud-border)] flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--hud-border-hover)] transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="relative flex-shrink-0">
            {/* Title area */}
            <div className="p-4 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-sm bg-[var(--hud-surface)] border border-[var(--hud-border)] flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-[var(--tropical-teal)]" />
                </div>
                <div className="flex items-center gap-3">
                  {countryCode && (
                    <span className="hud-stat font-mono-hud text-[10px] uppercase tracking-widest text-[var(--muted-foreground)]">
                      {countryCode}
                    </span>
                  )}
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--foreground)]">
                      {countryName}
                    </h2>
                    <p className="font-mono-hud text-[10px] text-[var(--muted-foreground)]">
                      {articles.length} {articles.length === 1 ? 'article' : 'articles'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter controls */}
            <div className="px-4 pb-3">
              <div className="flex items-center gap-2 mb-2">
                <Filter className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                <span className="font-mono-hud text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider">
                  Filters
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {/* Sort buttons */}
                <div className="flex items-center gap-1 border border-[var(--hud-border)] rounded-sm p-0.5">
                  <button
                    onClick={() => handleSortChange('newest')}
                    className={`px-2.5 py-1 text-[10px] font-medium rounded-sm transition-all ${
                      filters.sort === 'newest'
                        ? 'bg-[var(--hud-surface-2)] text-[var(--foreground)]'
                        : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                    }`}
                  >
                    Newest
                  </button>
                  <button
                    onClick={() => handleSortChange('oldest')}
                    className={`px-2.5 py-1 text-[10px] font-medium rounded-sm transition-all flex items-center gap-1 ${
                      filters.sort === 'oldest'
                        ? 'bg-[var(--hud-surface-2)] text-[var(--foreground)]'
                        : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                    }`}
                  >
                    <ArrowUpDown className="w-2.5 h-2.5" />
                    Oldest
                  </button>
                </div>

                {/* Relevant placeholder */}
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, relevant: !prev.relevant }))}
                  disabled
                  className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-sm border border-[var(--hud-border)] text-[var(--muted-foreground)] opacity-40 cursor-not-allowed"
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  Relevant
                  <Badge variant="outline" className="ml-0.5 text-[8px] px-1 py-0 h-4 border-[var(--muted-foreground)]/30">
                    Soon
                  </Badge>
                </button>

                {/* High Impact placeholder */}
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, highImpact: !prev.highImpact }))}
                  disabled
                  className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-sm border border-[var(--hud-border)] text-[var(--muted-foreground)] opacity-40 cursor-not-allowed"
                >
                  <Zap className="w-2.5 h-2.5" />
                  High Impact
                  <Badge variant="outline" className="ml-0.5 text-[8px] px-1 py-0 h-4 border-[var(--muted-foreground)]/30">
                    Soon
                  </Badge>
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-[var(--hud-border)]" />
          </div>

          {/* News list */}
          <ScrollArea className="flex-1 px-0 py-0">
            {filteredArticles.length > 0 ? (
              <div>
                {filteredArticles.map((article) => (
                  <ArticleRow 
                    key={article.id} 
                    article={article} 
                    onClick={() => handleArticleClick(article)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <MapPin className="w-10 h-10 text-[var(--muted-foreground)] mb-3 opacity-40" />
                <p className="text-xs text-[var(--muted-foreground)]">
                  No articles found
                </p>
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface ArticleRowProps {
  article: NewsArticle
  onClick: () => void
}

function ArticleRow({ article, onClick }: ArticleRowProps) {
  const sentiment = article.sentiment || 'neutral'
  const sentimentConfig = {
    positive: { icon: TrendingUp, color: sentimentColors.positive },
    negative: { icon: TrendingDown, color: sentimentColors.negative },
    neutral: { icon: Minus, color: sentimentColors.neutral },
  }

  const config = sentimentConfig[sentiment]
  const SentimentIcon = config.icon

  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-3 border-b border-[var(--hud-border)] hover:bg-[var(--hud-surface-2)] transition-colors group"
      style={{ borderLeft: `4px solid ${config.color}` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <SentimentIcon className="w-3 h-3" style={{ color: config.color }} />
            <h3 className="text-xs font-medium text-[var(--foreground)] line-clamp-2 group-hover:text-[var(--tropical-teal)] transition-colors leading-tight">
              {article.title}
            </h3>
          </div>

          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="font-mono-hud text-[10px] text-[var(--muted-foreground)]">
              {article.source.name}
            </span>

            <span className="text-[10px] text-[var(--muted-foreground)] opacity-40">•</span>

            <div className="flex items-center gap-1 text-[10px] text-[var(--muted-foreground)]">
              <Clock className="w-2.5 h-2.5" />
              <span className="font-mono-hud">{formatPublishedDate(article.publishedAt)}</span>
            </div>

            {article.category && (
              <>
                <span className="text-[10px] text-[var(--muted-foreground)] opacity-40">•</span>
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-sm border border-[var(--hud-border)]">
                  <Tag className="w-2 h-2 text-[var(--muted-foreground)]" />
                  <span className="text-[10px] text-[var(--muted-foreground)] capitalize">
                    {article.category}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <ExternalLink className="w-3.5 h-3.5 text-[var(--muted-foreground)] opacity-0 group-hover:opacity-60 transition-opacity" />
        </div>
      </div>
    </button>
  )
}
