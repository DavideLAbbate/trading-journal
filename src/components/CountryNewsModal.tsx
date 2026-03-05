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
  Zap
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
        className="max-w-2xl w-[95vw] max-h-[85vh] p-0 overflow-hidden border-0 bg-transparent shadow-none"
        style={{ background: 'transparent' }}
      >
        <div className="relative rounded-xl overflow-hidden border border-[var(--hud-border)] bg-[var(--hud-surface)] shadow-2xl flex flex-col max-h-[85vh]">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 w-7 h-7 rounded-md bg-[var(--hud-surface)] border border-[var(--hud-border)] flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--hud-border-hover)] transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="relative flex-shrink-0">
            {/* Accent bar */}
            <div 
              className="h-1 w-full"
              style={{
                background: `linear-gradient(90deg, var(--tropical-teal) 0%, var(--neon-ice) 100%)`
              }}
            />
            
            {/* Title area */}
            <div className="p-4 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--hud-surface)] border border-[var(--hud-border)] flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-[var(--tropical-teal)]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[var(--foreground)]">
                    {countryName}
                  </h2>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {articles.length} {articles.length === 1 ? 'article' : 'articles'}
                  </p>
                </div>
              </div>
            </div>

            {/* Filter controls */}
            <div className="px-4 pb-3">
              <div className="flex items-center gap-2 mb-2">
                <Filter className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                <span className="text-[10px] font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                  Filters
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-1.5">
                {/* Sort buttons */}
                <div className="flex items-center gap-0.5 bg-[var(--prussian-blue)] rounded-md p-0.5">
                  <button
                    onClick={() => handleSortChange('newest')}
                    className={`px-2.5 py-1 text-[10px] font-medium rounded-sm transition-all ${
                      filters.sort === 'newest'
                        ? 'bg-[var(--tropical-teal)] text-[var(--prussian-blue)]'
                        : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                    }`}
                  >
                    Newest
                  </button>
                  <button
                    onClick={() => handleSortChange('oldest')}
                    className={`px-2.5 py-1 text-[10px] font-medium rounded-sm transition-all flex items-center gap-1 ${
                      filters.sort === 'oldest'
                        ? 'bg-[var(--tropical-teal)] text-[var(--prussian-blue)]'
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
                  className={`flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-md border transition-all ${
                    filters.relevant
                      ? 'bg-[var(--neon-ice)]/20 border-[var(--neon-ice)]/50 text-[var(--neon-ice)]'
                      : 'border-[var(--hud-border)] text-[var(--muted-foreground)] opacity-50 cursor-not-allowed'
                  }`}
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
                  className={`flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-md border transition-all ${
                    filters.highImpact
                      ? 'bg-[var(--destructive)]/20 border-[var(--destructive)]/50 text-[var(--destructive)]'
                      : 'border-[var(--hud-border)] text-[var(--muted-foreground)] opacity-50 cursor-not-allowed'
                  }`}
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
          <ScrollArea className="flex-1 px-3 py-2">
            {filteredArticles.length > 0 ? (
              <div className="space-y-1.5">
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
    positive: { 
      icon: TrendingUp, 
      color: sentimentColors.positive,
      bgColor: 'bg-[var(--hud-surface)]',
    },
    negative: { 
      icon: TrendingDown, 
      color: sentimentColors.negative,
      bgColor: 'bg-[var(--hud-surface)]',
    },
    neutral: { 
      icon: Minus, 
      color: sentimentColors.neutral,
      bgColor: 'bg-[var(--hud-surface)]',
    },
  }

  const config = sentimentConfig[sentiment]
  const SentimentIcon = config.icon

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-3 rounded-lg bg-[var(--hud-surface)] border border-[var(--hud-border)] hover:border-[var(--tropical-teal)]/50 hover:bg-[var(--prussian-blue)]/50 transition-all group"
    >
      <div className="flex items-start gap-2.5">
        {/* Sentiment indicator */}
        <div 
          className={`flex-shrink-0 w-6 h-6 rounded-md ${config.bgColor} border border-[var(--hud-border)] flex items-center justify-center`}
          style={{ borderColor: config.color + '40' }}
        >
          <SentimentIcon className="w-3 h-3" style={{ color: config.color }} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-medium text-[var(--foreground)] line-clamp-2 group-hover:text-[var(--tropical-teal)] transition-colors leading-tight">
            {article.title}
          </h3>
          
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-[var(--dusk-blue)] flex items-center justify-center">
                <span className="text-[8px] font-bold text-[var(--foreground)]">
                  {article.source.name.charAt(0)}
                </span>
              </div>
              <span className="text-[10px] text-[var(--muted-foreground)]">
                {article.source.name}
              </span>
            </div>
            
            <span className="text-[10px] text-[var(--muted-foreground)] opacity-40">•</span>
            
            <div className="flex items-center gap-1 text-[10px] text-[var(--muted-foreground)]">
              <Clock className="w-2.5 h-2.5" />
              <span>{formatPublishedDate(article.publishedAt)}</span>
            </div>

            {article.category && (
              <>
                <span className="text-[10px] text-[var(--muted-foreground)] opacity-40">•</span>
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[var(--prussian-blue)]">
                  <Tag className="w-2 h-2 text-[var(--muted-foreground)]" />
                  <span className="text-[10px] text-[var(--muted-foreground)] capitalize">
                    {article.category}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* External link indicator */}
        <ExternalLink className="w-3.5 h-3.5 text-[var(--muted-foreground)] opacity-0 group-hover:opacity-60 transition-opacity flex-shrink-0 mt-0.5" />
      </div>
    </button>
  )
}
