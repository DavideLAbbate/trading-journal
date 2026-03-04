import useSWR from 'swr'
import { fetchGlobalNews, searchNews, articlesToPoints, isNewsApiConfigured } from '../lib/news'
import type { NewsArticle, NewsPoint, NewsFilters } from '../types/news'
import type { NewsApiCountry } from '../data/country-coordinates'
import { useMemo, useState, useCallback } from 'react'

interface UseNewsOptions {
  countries?: NewsApiCountry[]
  refreshInterval?: number
  enabled?: boolean
}

interface UseNewsReturn {
  articles: NewsArticle[]
  points: NewsPoint[]
  isLoading: boolean
  isError: boolean
  error: Error | null
  isConfigured: boolean
  refresh: () => void
  updateArticleSentiment: (articleId: string, sentiment: 'positive' | 'negative' | 'neutral', score?: number) => void
}

const DEFAULT_COUNTRIES: NewsApiCountry[] = ['us', 'gb', 'de', 'fr', 'it', 'jp', 'cn', 'au', 'br', 'in']

/**
 * Hook principale per gestire le news
 * Nota: Non usiamo useFetch qui perche' fetchGlobalNews non e' un semplice endpoint URL
 * ma una funzione custom che aggrega dati da piu' fonti. SWR viene usato direttamente
 * con un fetcher custom.
 */
export function useNews(options: UseNewsOptions = {}): UseNewsReturn {
  const {
    countries = DEFAULT_COUNTRIES,
    refreshInterval = 5 * 60 * 1000, // 5 minuti
    enabled = true,
  } = options

  const [localArticles, setLocalArticles] = useState<Map<string, Partial<NewsArticle>>>(new Map())

  // SWR con fetcher custom - fetchGlobalNews aggrega dati da piu' paesi
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
    isError: !!error,
    error,
    isConfigured: isNewsApiConfigured(),
    refresh: () => mutate(),
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
