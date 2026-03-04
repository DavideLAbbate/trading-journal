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
    // Check se già analizzato
    const existing = results.get(article.id)
    if (existing) {
      return existing
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const result = await analyzeSentiment(article)
      
      if (result) {
        setResults(prev => {
          const next = new Map(prev)
          next.set(article.id, result)
          return next
        })
      }

      return result
    } catch (err) {
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
