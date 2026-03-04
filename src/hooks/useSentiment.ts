import { useState, useCallback } from 'react'
import { analyzeSentiment, type SentimentResult } from '../lib/sentiment'
import type { NewsArticle } from '../types/news'

interface UseSentimentReturn {
  isAnalyzing: boolean
  error: string | null
  analyze: (article: NewsArticle) => Promise<SentimentResult | null>
  results: Map<string, SentimentResult>
}

/**
 * Hook per l'analisi del sentiment degli articoli
 */
export function useSentiment(): UseSentimentReturn {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<Map<string, SentimentResult>>(new Map())

  const analyze = useCallback(async (article: NewsArticle): Promise<SentimentResult | null> => {
    console.log('[v0] useSentiment.analyze called for:', article.id, article.title)
    
    // Check se già analizzato
    const existing = results.get(article.id)
    if (existing) {
      console.log('[v0] Using cached result for:', article.id)
      return existing
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      console.log('[v0] Calling analyzeSentiment...')
      const result = await analyzeSentiment(article)
      console.log('[v0] analyzeSentiment result:', result)
      
      if (result) {
        setResults(prev => {
          const next = new Map(prev)
          next.set(article.id, result)
          return next
        })
      }

      return result
    } catch (err) {
      console.error('[v0] useSentiment error:', err)
      const message = err instanceof Error ? err.message : 'Analysis failed'
      setError(message)
      return null
    } finally {
      setIsAnalyzing(false)
    }
  }, [results])

  return {
    isAnalyzing,
    error,
    analyze,
    results,
  }
}
