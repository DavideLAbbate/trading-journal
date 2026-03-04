import { Dialog, DialogContent } from './ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'
import { 
  ArrowLeft, 
  ExternalLink, 
  Clock, 
  MapPin, 
  BarChart3,
  FileText,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react'
import type { NewsArticle } from '../types/news'
import { formatPublishedDate } from '../lib/news'
import { SentimentGauge } from './charts/SentimentGauge'

interface NewsDetailModalProps {
  article: NewsArticle | null
  isOpen: boolean
  onClose: () => void
  onBack: () => void
}

export function NewsDetailModal({ article, isOpen, onClose, onBack }: NewsDetailModalProps) {
  if (!article) return null

  const sentimentIcon = {
    positive: TrendingUp,
    negative: TrendingDown,
    neutral: Minus,
  }[article.sentiment || 'neutral']

  const SentimentIcon = sentimentIcon

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] p-0 overflow-hidden bg-[var(--card)] border-[var(--border)]">
        {/* Header with image */}
        <div className="relative">
          {article.urlToImage ? (
            <div className="h-48 overflow-hidden">
              <img
                src={article.urlToImage}
                alt={article.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--card)] via-[var(--card)]/60 to-transparent" />
            </div>
          ) : (
            <div className="h-24 bg-gradient-to-br from-[var(--primary)]/20 to-[var(--accent)]/20" />
          )}

          {/* Back button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="absolute top-3 left-3 h-8 w-8 p-0 bg-[var(--card)]/80 backdrop-blur-sm hover:bg-[var(--card)]"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={article.sentiment === 'positive' ? 'positive' : article.sentiment === 'negative' ? 'negative' : 'neutral'}>
                <SentimentIcon className="w-3 h-3 mr-1" />
                {article.sentiment === 'positive' ? 'Positivo' : article.sentiment === 'negative' ? 'Negativo' : 'Neutro'}
              </Badge>
              {article.category && (
                <Badge variant="secondary" className="capitalize">
                  {article.category}
                </Badge>
              )}
              <Badge variant="outline">
                {article.source.name}
              </Badge>
            </div>
            <h2 className="text-xl font-bold text-[var(--foreground)] leading-tight text-balance">
              {article.title}
            </h2>
            <div className="flex items-center gap-3 mt-2 text-sm text-[var(--muted-foreground)]">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {article.country}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {formatPublishedDate(article.publishedAt)}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Content */}
        <Tabs defaultValue="overview" className="flex-1">
          <div className="px-5 pt-3 pb-1">
            <TabsList className="w-full justify-start bg-[var(--muted)]/30">
              <TabsTrigger value="overview" className="gap-2">
                <FileText className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="sentiment" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                Sentiment Analysis
              </TabsTrigger>
              <TabsTrigger value="ai" className="gap-2">
                <Sparkles className="w-4 h-4" />
                AI Insights
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="h-[340px]">
            {/* Overview Tab */}
            <TabsContent value="overview" className="px-5 py-4 space-y-5">
              {article.description && (
                <div>
                  <h3 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wide mb-2">
                    Descrizione
                  </h3>
                  <p className="text-[var(--foreground)] leading-relaxed">
                    {article.description}
                  </p>
                </div>
              )}

              {article.content && (
                <div>
                  <h3 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wide mb-2">
                    Contenuto
                  </h3>
                  <p className="text-[var(--foreground)] leading-relaxed">
                    {article.content.replace(/\[\+\d+ chars\]/, '')}
                  </p>
                </div>
              )}

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-[var(--muted-foreground)]">
                      Autore
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[var(--foreground)]">{article.author || 'Non specificato'}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-[var(--muted-foreground)]">
                      Paese
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[var(--foreground)]">{article.country} ({article.countryCode})</p>
                  </CardContent>
                </Card>
              </div>

              <Button className="w-full" asChild>
                <a href={article.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Leggi articolo completo
                </a>
              </Button>
            </TabsContent>

            {/* Sentiment Tab */}
            <TabsContent value="sentiment" className="px-5 py-4 space-y-5">
              <div className="flex justify-center">
                <SentimentGauge 
                  score={article.sentimentScore || 0} 
                  sentiment={article.sentiment || 'neutral'}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Card className={article.sentiment === 'positive' ? 'border-emerald-500/50 bg-emerald-500/5' : ''}>
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                    <p className="text-2xl font-bold text-emerald-500">
                      {article.sentiment === 'positive' ? Math.round((article.sentimentScore || 0.5) * 100) : 0}%
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">Positivo</p>
                  </CardContent>
                </Card>
                <Card className={article.sentiment === 'neutral' ? 'border-yellow-500/50 bg-yellow-500/5' : ''}>
                  <CardContent className="p-4 text-center">
                    <Minus className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                    <p className="text-2xl font-bold text-yellow-500">
                      {article.sentiment === 'neutral' ? 100 : 0}%
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">Neutro</p>
                  </CardContent>
                </Card>
                <Card className={article.sentiment === 'negative' ? 'border-red-500/50 bg-red-500/5' : ''}>
                  <CardContent className="p-4 text-center">
                    <TrendingDown className="w-8 h-8 mx-auto mb-2 text-red-500" />
                    <p className="text-2xl font-bold text-red-500">
                      {article.sentiment === 'negative' ? Math.round(Math.abs(article.sentimentScore || -0.5) * 100) : 0}%
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">Negativo</p>
                  </CardContent>
                </Card>
              </div>

              {article.keyPhrases && article.keyPhrases.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Key Phrases</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {article.keyPhrases.map((phrase, i) => (
                        <Badge key={i} variant="outline">
                          {phrase}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* AI Tab */}
            <TabsContent value="ai" className="px-5 py-4 space-y-5">
              {article.aiSummary ? (
                <>
                  <Card className="border-[var(--accent)]/30 bg-[var(--accent)]/5">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[var(--accent)]" />
                        AI Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-[var(--foreground)] leading-relaxed">
                        {article.aiSummary}
                      </p>
                    </CardContent>
                  </Card>

                  {article.category && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Categoria Rilevata</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Badge variant="secondary" className="text-base capitalize">
                          {article.category}
                        </Badge>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Sparkles className="w-12 h-12 text-[var(--muted-foreground)] mb-4" />
                  <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                    Analisi AI non disponibile
                  </h3>
                  <p className="text-sm text-[var(--muted-foreground)] max-w-sm">
                    Clicca sul pulsante di analisi nella preview per generare insights con AI locale (Ollama)
                  </p>
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
