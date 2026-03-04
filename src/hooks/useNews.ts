import useSWR from 'swr'
import { fetchGlobalNews, searchNews, articlesToPoints, isNewsApiConfigured } from '../lib/news'
import { analyzeSentiment, type SentimentResult } from '../lib/sentiment'
import type { NewsArticle, NewsPoint, NewsFilters } from '../types/news'
import type { NewsApiCountry } from '../data/country-coordinates'
import { useMemo, useState, useCallback, useEffect, useRef } from 'react'

interface UseNewsOptions {
  countries?: NewsApiCountry[]
  refreshInterval?: number
  enabled?: boolean
  autoCategorize?: boolean
}

interface UseNewsReturn {
  articles: NewsArticle[]
  points: NewsPoint[]
  isLoading: boolean
  isCategorizing: boolean
  categorizationProgress: { completed: number; total: number }
  isError: boolean
  error: Error | null
  isConfigured: boolean
  refresh: () => void
  updateArticleSentiment: (articleId: string, sentiment: 'positive' | 'negative' | 'neutral', score?: number) => void
}

const DEFAULT_COUNTRIES: NewsApiCountry[] = ['us', 'gb', 'de', 'fr', 'it', 'jp', 'cn', 'au', 'br', 'in']

/**
 * Hook principale per gestire le news
 * Now auto-categorizes all news on fetch
 */
export function useNews(options: UseNewsOptions = {}): UseNewsReturn {
  const {
    countries = DEFAULT_COUNTRIES,
    refreshInterval = 5 * 60 * 1000, // 5 minuti
    enabled = true,
    autoCategorize = true,
  } = options

  const [localArticles, setLocalArticles] = useState<Map<string, Partial<NewsArticle>>>(new Map())
  const [isCategorizing, setIsCategorizing] = useState(false)
  const [categorizationProgress, setCategorizationProgress] = useState({ completed: 0, total: 0 })
  const categorizingRef = useRef<Set<string>>(new Set())

  const {
    data: articles,
    error,
    isLoading,
    mutate,
  } = useSWR(
    enabled && isNewsApiConfigured() ? ['global-news', countries.join(',')] : null,
    () => fetchGlobalNews(countries),
    {
      refreshInterval,
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  )

  // Auto-categorize articles when they arrive
  useEffect(() => {
    if (!articles || !autoCategorize || articles.length === 0) return

    const uncategorizedArticles = articles.filter(
      (article) => 
        !localArticles.has(article.id) && 
        !categorizingRef.current.has(article.id) &&
        !article.aiSummary
    )

    if (uncategorizedArticles.length === 0) return

    const categorizeAll = async () => {
      setIsCategorizing(true)
      setCategorizationProgress({ completed: 0, total: uncategorizedArticles.length })

      for (let i = 0; i < uncategorizedArticles.length; i++) {
        const article = uncategorizedArticles[i]
        
        // Mark as being categorized
        categorizingRef.current.add(article.id)

        try {
          const result = await analyzeSentiment(article)
          
          if (result) {
            setLocalArticles((prev) => {
              const next = new Map(prev)
              next.set(article.id, {
                sentiment: result.sentiment,
                sentimentScore: result.score,
                category: result.category,
                keyPhrases: result.keyPhrases,
                aiSummary: result.summary,
              })
              return next
            })
          }
        } catch (err) {
          console.error(`Failed to categorize article ${article.id}:`, err)
        }

        setCategorizationProgress({ completed: i + 1, total: uncategorizedArticles.length })

        // Rate limiting - wait 300ms between requests
        if (i < uncategorizedArticles.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 300))
        }
      }

      setIsCategorizing(false)
    }

    categorizeAll()
  }, [articles, autoCategorize])

  // Merge articoli con aggiornamenti locali (sentiment dall'AI)
  const mergedArticles = useMemo(() => {
    if (!articles) return []
    return articles.map((article) => {
      const local = localArticles.get(article.id)
      return local ? { ...article, ...local } : article
    })
  }, [articles, localArticles])

  // Converti in punti per il globo
  const points = useMemo(() => articlesToPoints(mergedArticles), [mergedArticles])

  // Aggiorna sentiment di un articolo
  const updateArticleSentiment = useCallback(
    (articleId: string, sentiment: 'positive' | 'negative' | 'neutral', score?: number) => {
      setLocalArticles((prev) => {
        const next = new Map(prev)
        next.set(articleId, { sentiment, sentimentScore: score })
        return next
      })
    },
    []
  )

  return {
    articles: mergedArticles,
    points,
    isLoading,
    isCategorizing,
    categorizationProgress,
    isError: !!error,
    error,
    isConfigured: isNewsApiConfigured(),
    refresh: () => {
      categorizingRef.current.clear()
      setLocalArticles(new Map())
      mutate()
    },
    updateArticleSentiment,
  }
}

/**
 * Hook per la ricerca news
 */
export function useNewsSearch(query: string, enabled = true) {
  const {
    data: articles,
    error,
    isLoading,
  } = useSWR(
    enabled && query.trim() && isNewsApiConfigured() ? ['search-news', query] : null,
    () => searchNews(query),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  )

  const points = useMemo(() => articlesToPoints(articles || []), [articles])

  return {
    articles: articles || [],
    points,
    isLoading,
    isError: !!error,
    error,
  }
}

/**
 * Hook per filtrare news
 */
export function useFilteredNews(articles: NewsArticle[], filters: NewsFilters) {
  return useMemo(() => {
    let filtered = [...articles]

    if (filters.countries?.length) {
      filtered = filtered.filter((a) =>
        filters.countries!.includes(a.countryCode.toLowerCase())
      )
    }

    if (filters.sentiment?.length) {
      filtered = filtered.filter((a) =>
        a.sentiment && filters.sentiment!.includes(a.sentiment)
      )
    }

    if (filters.categories?.length) {
      filtered = filtered.filter((a) =>
        a.category && filters.categories!.includes(a.category)
      )
    }

    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(search) ||
          a.description?.toLowerCase().includes(search)
      )
    }

    return filtered
  }, [articles, filters])
}
