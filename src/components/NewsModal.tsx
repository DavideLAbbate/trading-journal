import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Separator } from './ui/separator'
import { 
  ExternalLink, 
  Clock, 
  MapPin, 
  User, 
  TrendingUp, 
  ChevronRight,
  Sparkles,
  Loader2
} from 'lucide-react'
import type { NewsArticle } from '../types/news'
import { formatPublishedDate } from '../lib/news'
import { NewsDetailModal } from './NewsDetailModal'

interface NewsModalProps {
  article: NewsArticle | null
  isOpen: boolean
  onClose: () => void
  onAnalyze?: (article: NewsArticle) => Promise<void>
  isAnalyzing?: boolean
}

export function NewsModal({ article, isOpen, onClose, onAnalyze, isAnalyzing }: NewsModalProps) {
  const [showDetail, setShowDetail] = useState(false)

  // Debug: Log quando il modal e' aperto
  console.log('[v0] NewsModal render - isOpen:', isOpen, 'article:', article?.id, 'onAnalyze:', !!onAnalyze, 'aiSummary:', article?.aiSummary)

  if (!article) return null

  const sentimentVariant = {
    positive: 'positive' as const,
    negative: 'negative' as const,
    neutral: 'neutral' as const,
  }[article.sentiment || 'neutral']

  const sentimentLabel = {
    positive: 'Positivo',
    negative: 'Negativo',
    neutral: 'Neutro',
  }[article.sentiment || 'neutral']

  const handleAnalyze = async () => {
    console.log('[v0] NewsModal handleAnalyze clicked, article:', article?.id, 'onAnalyze exists:', !!onAnalyze)
    if (article && onAnalyze) {
      console.log('[v0] Calling onAnalyze...')
      await onAnalyze(article)
      console.log('[v0] onAnalyze completed')
    } else {
      console.log('[v0] Cannot analyze: article=', !!article, 'onAnalyze=', !!onAnalyze)
    }
  }

  return (
    <>
      <Dialog open={isOpen && !showDetail} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-[var(--card)] border-[var(--border)]">
          {/* Image Header */}
          {article.urlToImage && (
            <div className="relative h-48 overflow-hidden">
              <img
                src={article.urlToImage}
                alt={article.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--card)] via-transparent to-transparent" />
              
              {/* Badges overlay */}
              <div className="absolute bottom-3 left-4 flex items-center gap-2">
                <Badge variant={sentimentVariant} className="backdrop-blur-sm">
                  {sentimentLabel}
                </Badge>
                {article.category && (
                  <Badge variant="secondary" className="backdrop-blur-sm capitalize">
                    {article.category}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-6 space-y-4">
            <DialogHeader>
              <DialogTitle className="text-xl leading-tight text-balance">
                {article.title}
              </DialogTitle>
            </DialogHeader>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--muted-foreground)]">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span>{article.country}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{formatPublishedDate(article.publishedAt)}</span>
              </div>
              {article.author && (
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  <span className="truncate max-w-[150px]">{article.author}</span>
                </div>
              )}
            </div>

            {/* Source */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[var(--muted)] flex items-center justify-center">
                <span className="text-xs font-bold text-[var(--muted-foreground)]">
                  {article.source.name.charAt(0)}
                </span>
              </div>
              <span className="text-sm font-medium text-[var(--foreground)]">
                {article.source.name}
              </span>
            </div>

            <Separator />

            {/* Description */}
            {article.description && (
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                {article.description}
              </p>
            )}

            {/* AI Summary if available */}
            {article.aiSummary && (
              <div className="p-4 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)]">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-[var(--accent)]" />
                  <span className="text-xs font-medium text-[var(--accent)]">AI Summary</span>
                </div>
                <p className="text-sm text-[var(--foreground)]">{article.aiSummary}</p>
              </div>
            )}

            {/* Key Phrases */}
            {article.keyPhrases && article.keyPhrases.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {article.keyPhrases.map((phrase, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {phrase}
                  </Badge>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="default"
                className="flex-1"
                onClick={() => {
                  console.log('[v0] Analisi Dettagliata clicked')
                  // Avvia analisi AI se non ancora fatta
                  if (!article.aiSummary && onAnalyze && !isAnalyzing) {
                    console.log('[v0] Starting AI analysis before detail view...')
                    handleAnalyze()
                  }
                  setShowDetail(true)
                }}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Analisi Dettagliata
                <ChevronRight className="w-4 h-4 ml-auto" />
              </Button>

              {/* Debug: sempre mostra il bottone per test */}
              {onAnalyze && (
                <Button
                  variant="secondary"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !!article.aiSummary}
                  title={article.aiSummary ? 'Gia analizzato' : 'Analizza con AI'}
                >
                  {isAnalyzing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                </Button>
              )}

              <a 
                href={article.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-3 py-2 rounded-md border border-[var(--border)] hover:bg-[var(--muted)]"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <NewsDetailModal
        article={article}
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        onBack={() => setShowDetail(false)}
      />
    </>
  )
}
