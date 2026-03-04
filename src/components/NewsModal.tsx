import { Dialog, DialogContent, DialogTitle } from './ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { ScrollArea } from './ui/scroll-area'
import { 
  ExternalLink, 
  Clock, 
  MapPin, 
  TrendingUp,
  TrendingDown,
  Minus,
  X,
  BarChart3,
  Tag
} from 'lucide-react'
import type { NewsArticle } from '../types/news'
import { formatPublishedDate } from '../lib/news'

interface NewsModalProps {
  article: NewsArticle | null
  isOpen: boolean
  onClose: () => void
  onShowMarketImpacts?: () => void
}

export function NewsModal({ article, isOpen, onClose, onShowMarketImpacts }: NewsModalProps) {
  if (!article) return null

  const sentimentConfig = {
    positive: { 
      icon: TrendingUp, 
      label: 'Bullish', 
      color: 'text-[var(--neon-ice)]',
      bgColor: 'bg-[var(--neon-ice)]/10',
      borderColor: 'border-[var(--neon-ice)]/30'
    },
    negative: { 
      icon: TrendingDown, 
      label: 'Bearish', 
      color: 'text-[var(--destructive)]',
      bgColor: 'bg-[var(--destructive)]/10',
      borderColor: 'border-[var(--destructive)]/30'
    },
    neutral: { 
      icon: Minus, 
      label: 'Neutral', 
      color: 'text-[var(--tropical-teal)]',
      bgColor: 'bg-[var(--tropical-teal)]/10',
      borderColor: 'border-[var(--tropical-teal)]/30'
    },
  }

  const sentiment = sentimentConfig[article.sentiment || 'neutral']
  const SentimentIcon = sentiment.icon

  const handleShowMarketImpacts = () => {
    onClose()
    onShowMarketImpacts?.()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="sm:max-w-2xl p-0 overflow-hidden border-0 bg-transparent shadow-none"
        style={{ background: 'transparent' }}
      >
        <VisuallyHidden>
          <DialogTitle>{article.title}</DialogTitle>
        </VisuallyHidden>
        
        <div className="relative rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--prussian-blue)]/95 backdrop-blur-xl shadow-2xl">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-[var(--space-indigo)]/80 backdrop-blur flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--space-indigo)] transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header with gradient accent */}
          <div className="relative">
            {/* Gradient accent bar */}
            <div 
              className="h-1 w-full"
              style={{
                background: `linear-gradient(90deg, var(--tropical-teal) 0%, var(--neon-ice) 100%)`
              }}
            />
            
            {/* Image or gradient header */}
            {article.urlToImage ? (
              <div className="relative h-48 overflow-hidden">
                <img
                  src={article.urlToImage}
                  alt={article.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--prussian-blue)] via-[var(--prussian-blue)]/60 to-transparent" />
              </div>
            ) : (
              <div 
                className="h-32"
                style={{
                  background: `linear-gradient(135deg, var(--space-indigo) 0%, var(--dusk-blue) 100%)`
                }}
              />
            )}

            {/* Floating badges */}
            <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Sentiment badge */}
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${sentiment.bgColor} ${sentiment.borderColor} border backdrop-blur-sm`}>
                  <SentimentIcon className={`w-3.5 h-3.5 ${sentiment.color}`} />
                  <span className={`text-xs font-semibold ${sentiment.color}`}>
                    {sentiment.label}
                  </span>
                </div>
                
                {/* Category badge */}
                {article.category && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--space-indigo)]/80 border border-[var(--border)] backdrop-blur-sm">
                    <Tag className="w-3 h-3 text-[var(--muted-foreground)]" />
                    <span className="text-xs font-medium text-[var(--foreground)] capitalize">
                      {article.category}
                    </span>
                  </div>
                )}
              </div>

              {/* Sentiment score */}
              {article.sentimentScore !== undefined && (
                <div className="px-3 py-1.5 rounded-full bg-[var(--space-indigo)]/80 border border-[var(--border)] backdrop-blur-sm">
                  <span className={`text-xs font-mono font-bold ${sentiment.color}`}>
                    {article.sentimentScore > 0 ? '+' : ''}{(article.sentimentScore * 100).toFixed(0)}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 pt-4">
            {/* Title */}
            <h2 className="text-xl font-bold text-[var(--foreground)] leading-tight mb-4 text-balance">
              {article.title}
            </h2>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--muted-foreground)] mb-4">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-[var(--dusk-blue)] flex items-center justify-center">
                  <span className="text-[10px] font-bold text-[var(--foreground)]">
                    {article.source.name.charAt(0)}
                  </span>
                </div>
                <span className="font-medium text-[var(--foreground)]">{article.source.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>{article.country}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatPublishedDate(article.publishedAt)}</span>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent mb-4" />

            {/* Content area */}
            <ScrollArea className="h-[200px] pr-4">
              {/* AI Summary */}
              {article.aiSummary && (
                <div className="mb-4 p-4 rounded-xl bg-[var(--space-indigo)]/50 border border-[var(--tropical-teal)]/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[var(--tropical-teal)] to-[var(--neon-ice)] flex items-center justify-center">
                      <BarChart3 className="w-3 h-3 text-[var(--prussian-blue)]" />
                    </div>
                    <span className="text-xs font-semibold text-[var(--tropical-teal)] uppercase tracking-wider">
                      AI Analysis
                    </span>
                  </div>
                  <p className="text-sm text-[var(--foreground)] leading-relaxed">
                    {article.aiSummary}
                  </p>
                </div>
              )}

              {/* Description */}
              {article.description && (
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed mb-4">
                  {article.description}
                </p>
              )}

              {/* Key Phrases */}
              {article.keyPhrases && article.keyPhrases.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {article.keyPhrases.map((phrase, i) => (
                    <Badge 
                      key={i} 
                      variant="outline" 
                      className="text-xs border-[var(--dusk-blue)] text-[var(--muted-foreground)] bg-[var(--space-indigo)]/30"
                    >
                      {phrase}
                    </Badge>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-6">
              <Button
                onClick={handleShowMarketImpacts}
                className="flex-1 h-11 bg-gradient-to-r from-[var(--tropical-teal)] to-[var(--neon-ice)] text-[var(--prussian-blue)] font-semibold hover:opacity-90 transition-opacity"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Show Market Impacts
              </Button>

              <a 
                href={article.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center w-11 h-11 rounded-lg border border-[var(--border)] bg-[var(--space-indigo)]/50 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--space-indigo)] transition-all"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
