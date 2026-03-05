import useSWR from 'swr'
import { fetchGlobalNews, searchNews, articlesToPoints, isNewsApiConfigured } from '../lib/news'
import { analyzeSentiment } from '../lib/sentiment'
import type { NewsArticle, NewsPoint, NewsFilters } from '../types/news'
import { useMemo, useState, useCallback, useEffect, useRef } from 'react'

interface UseNewsOptions {
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

/**
 * Hook principale per gestire le news via RSS feeds
 * Auto-categorizes all news on fetch
 */
export function useNews(options: UseNewsOptions = {}): UseNewsReturn {
  const {
    refreshInterval = 5 * 60 * 1000, // 5 minuti
    enabled = true,
    autoCategorize = true,
  } = options

  const [localArticles, setLocalArticles] = useState<Map<string, Partial<NewsArticle>>>(new Map())
  const localArticlesRef = useRef<Map<string, Partial<NewsArticle>>>(new Map())
  const [isCategorizing, setIsCategorizing] = useState(false)
  const [categorizationProgress, setCategorizationProgress] = useState({ completed: 0, total: 0 })
  const categorizingRef = useRef<Set<string>>(new Set())
  const failedCategorizingRef = useRef<Set<string>>(new Set())
  const isCategorizingRef = useRef(false)

  useEffect(() => {
    localArticlesRef.current = localArticles
  }, [localArticles])

  const {
    data: articles,
    error,
    isLoading,
    mutate,
  } = useSWR(
    enabled && isNewsApiConfigured() ? 'rss-global-news' : null,
    () => fetchGlobalNews(),
    {
      refreshInterval,
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  )

  // Auto-categorize articles when they arrive
  useEffect(() => {
    if (!articles || !autoCategorize || articles.length === 0) return
    if (isCategorizingRef.current) return

    const uncategorizedArticles = articles.filter(
      (article) => 
        !localArticlesRef.current.has(article.id) && 
        !categorizingRef.current.has(article.id) &&
        !failedCategorizingRef.current.has(article.id) &&
        !article.aiSummary
    )

    if (uncategorizedArticles.length === 0) return

    const categorizeAll = async () => {
      isCategorizingRef.current = true
      setIsCategorizing(true)
      setCategorizationProgress({ completed: 0, total: uncategorizedArticles.length })

      try {
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
            } else {
              failedCategorizingRef.current.add(article.id)
              setLocalArticles((prev) => {
                const next = new Map(prev)
                next.set(article.id, {
                  sentiment: article.sentiment ?? 'neutral',
                  category: article.category ?? 'general',
                  keyPhrases: article.keyPhrases ?? [],
                  aiSummary: article.aiSummary ?? '',
                })
                return next
              })
            }
          } catch (err) {
            console.error(`Failed to categorize article ${article.id}:`, err)
            failedCategorizingRef.current.add(article.id)
            setLocalArticles((prev) => {
              const next = new Map(prev)
              next.set(article.id, {
                sentiment: article.sentiment ?? 'neutral',
                category: article.category ?? 'general',
                keyPhrases: article.keyPhrases ?? [],
                aiSummary: article.aiSummary ?? '',
              })
              return next
            })
          }

          setCategorizationProgress({ completed: i + 1, total: uncategorizedArticles.length })

          // Rate limiting - wait 300ms between requests
          if (i < uncategorizedArticles.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 300))
          }
        }
      } finally {
        setIsCategorizing(false)
        isCategorizingRef.current = false
      }
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
      failedCategorizingRef.current.clear()
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
