import { useMemo } from 'react'
import { TrendingUp, TrendingDown, Minus, Globe2, BarChart3, AlertTriangle } from 'lucide-react'
import { sentimentColors } from '../../lib/news'
import type { NewsArticle } from '../../types/news'

interface InsightsPanelProps {
  articles: NewsArticle[]
}

interface CountryStats {
  country: string
  countryCode: string
  count: number
  sentiment: 'positive' | 'negative' | 'neutral'
}

export function InsightsPanel({ articles }: InsightsPanelProps) {
  // Calculate sentiment distribution
  const sentimentStats = useMemo(() => {
    const positive = articles.filter(a => a.sentiment === 'positive').length
    const negative = articles.filter(a => a.sentiment === 'negative').length
    const neutral = articles.filter(a => !a.sentiment || a.sentiment === 'neutral').length
    const total = articles.length
    
    return {
      positive: { count: positive, pct: total > 0 ? Math.round((positive / total) * 100) : 0 },
      negative: { count: negative, pct: total > 0 ? Math.round((negative / total) * 100) : 0 },
      neutral: { count: neutral, pct: total > 0 ? Math.round((neutral / total) * 100) : 0 },
    }
  }, [articles])

  // Get top countries by article count
  const topCountries = useMemo(() => {
    const countryMap = new Map<string, CountryStats>()
    
    for (const article of articles) {
      const existing = countryMap.get(article.countryCode)
      if (existing) {
        existing.count++
        // Update majority sentiment
        const counts = {
          positive: articles.filter(a => a.countryCode === article.countryCode && a.sentiment === 'positive').length,
          negative: articles.filter(a => a.countryCode === article.countryCode && a.sentiment === 'negative').length,
          neutral: articles.filter(a => a.countryCode === article.countryCode && (!a.sentiment || a.sentiment === 'neutral')).length,
        }
        if (counts.positive > counts.negative && counts.positive > counts.neutral) {
          existing.sentiment = 'positive'
        } else if (counts.negative > counts.positive && counts.negative > counts.neutral) {
          existing.sentiment = 'negative'
        } else {
          existing.sentiment = 'neutral'
        }
      } else {
        countryMap.set(article.countryCode, {
          country: article.country,
          countryCode: article.countryCode,
          count: 1,
          sentiment: article.sentiment || 'neutral',
        })
      }
    }
    
    return Array.from(countryMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [articles])

  // Get top keywords/phrases (mock - in production would use NLP)
  const topKeywords = useMemo(() => {
    const wordMap = new Map<string, number>()
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'it', 'its', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'we', 'they', 'what', 'which', 'who', 'whom', 'whose', 'where', 'when', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'as'])
    
    for (const article of articles) {
      const words = article.title.toLowerCase()
        .replace(/[^a-z\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 3 && !stopWords.has(w))
      
      for (const word of words) {
        wordMap.set(word, (wordMap.get(word) || 0) + 1)
      }
    }
    
    return Array.from(wordMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([word]) => word)
  }, [articles])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-[var(--hud-border)]">
        <h3 className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">
          Insights
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Sentiment Distribution */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
            <span className="text-xs font-medium text-[var(--foreground)]">Sentiment</span>
          </div>
          
          <div className="hud-panel p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3 h-3" style={{ color: sentimentColors.positive }} />
                <span className="text-xs text-[var(--muted-foreground)]">Positive</span>
              </div>
              <span className="text-xs font-medium text-[var(--foreground)]">
                {sentimentStats.positive.count} ({sentimentStats.positive.pct}%)
              </span>
            </div>
            
            <div className="h-1.5 bg-[var(--hud-surface)] rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${sentimentStats.positive.pct}%`,
                  backgroundColor: sentimentColors.positive 
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Minus className="w-3 h-3" style={{ color: sentimentColors.neutral }} />
                <span className="text-xs text-[var(--muted-foreground)]">Neutral</span>
              </div>
              <span className="text-xs font-medium text-[var(--foreground)]">
                {sentimentStats.neutral.count} ({sentimentStats.neutral.pct}%)
              </span>
            </div>
            
            <div className="h-1.5 bg-[var(--hud-surface)] rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${sentimentStats.neutral.pct}%`,
                  backgroundColor: sentimentColors.neutral 
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-3 h-3" style={{ color: sentimentColors.negative }} />
                <span className="text-xs text-[var(--muted-foreground)]">Negative</span>
              </div>
              <span className="text-xs font-medium text-[var(--foreground)]">
                {sentimentStats.negative.count} ({sentimentStats.negative.pct}%)
              </span>
            </div>
            
            <div className="h-1.5 bg-[var(--hud-surface)] rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${sentimentStats.negative.pct}%`,
                  backgroundColor: sentimentColors.negative 
                }}
              />
            </div>
          </div>
        </div>

        {/* Top Countries */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Globe2 className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
            <span className="text-xs font-medium text-[var(--foreground)]">Top Countries</span>
          </div>
          
          <div className="space-y-1">
            {topCountries.map((country) => (
              <div 
                key={country.countryCode}
                className="flex items-center justify-between p-2 rounded-md bg-[var(--hud-surface)] border border-[var(--hud-border)]"
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: sentimentColors[country.sentiment] }}
                  />
                  <span className="text-xs text-[var(--foreground)]">{country.country}</span>
                </div>
                <span className="text-[10px] text-[var(--muted-foreground)]">{country.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Keywords */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
            <span className="text-xs font-medium text-[var(--foreground)]">Keywords</span>
          </div>
          
          <div className="flex flex-wrap gap-1.5">
            {topKeywords.map((keyword) => (
              <span 
                key={keyword}
                className="px-2 py-1 text-[10px] rounded-md bg-[var(--hud-surface)] border border-[var(--hud-border)] text-[var(--muted-foreground)] hover:border-[var(--hud-border-hover)] hover:text-[var(--foreground)] transition-colors cursor-default"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
