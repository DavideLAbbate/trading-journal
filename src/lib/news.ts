import type { NewsArticle, NewsApiResponse, NewsApiArticle, NewsPoint } from '../types/news'
import { getCoordinatesByCountryCode, newsApiCountries, type NewsApiCountry } from '../data/country-coordinates'

const NEWS_API_BASE = 'https://newsapi.org/v2'
const API_KEY = import.meta.env.VITE_NEWS_API_KEY || ''

// Cache per evitare chiamate ripetute
const newsCache = new Map<string, { data: NewsArticle[]; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minuti

/**
 * Genera un ID univoco per l'articolo (supporta Unicode)
 */
function generateArticleId(article: NewsApiArticle, country: string): string {
  const hash = `${article.title || ''}-${article.publishedAt || ''}-${country}`
  // Simple hash function that works with Unicode
  let hashCode = 0
  for (let i = 0; i < hash.length; i++) {
    const char = hash.charCodeAt(i)
    hashCode = ((hashCode << 5) - hashCode) + char
    hashCode = hashCode & hashCode // Convert to 32bit integer
  }
  return `news_${Math.abs(hashCode).toString(36)}_${country}`
}

/**
 * Trasforma un articolo NewsAPI in NewsArticle con coordinate
 */
function transformArticle(article: NewsApiArticle, countryCode: string): NewsArticle | null {
  const coords = getCoordinatesByCountryCode(countryCode)
  if (!coords) return null

  // Aggiungi un po' di variazione alle coordinate per non sovrapporre i punti
  const jitter = () => (Math.random() - 0.5) * 3

  return {
    id: generateArticleId(article, countryCode),
    title: article.title,
    description: article.description,
    content: article.content,
    source: article.source,
    author: article.author,
    publishedAt: article.publishedAt,
    url: article.url,
    urlToImage: article.urlToImage,
    country: coords.name,
    countryCode: countryCode.toUpperCase(),
    coordinates: {
      lat: coords.lat + jitter(),
      lng: coords.lng + jitter(),
    },
    sentiment: 'neutral', // Default, sarà aggiornato dall'AI
  }
}

/**
 * Fetch top headlines per un singolo paese
 */
async function fetchHeadlinesByCountry(country: NewsApiCountry): Promise<NewsArticle[]> {
  if (!API_KEY) {
    console.warn('NewsAPI key not configured')
    return []
  }

  try {
    const response = await fetch(
      `${NEWS_API_BASE}/top-headlines?country=${country}&pageSize=10&apiKey=${API_KEY}`
    )

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data: NewsApiResponse = await response.json()

    if (data.status !== 'ok') {
      throw new Error(data.message || 'API Error')
    }

    return data.articles
      .map((article) => transformArticle(article, country))
      .filter((a): a is NewsArticle => a !== null)
  } catch (error) {
    console.error(`Failed to fetch news for ${country}:`, error)
    return []
  }
}

/**
 * Fetch news da più paesi in parallelo
 */
export async function fetchGlobalNews(
  countries: NewsApiCountry[] = ['us', 'gb', 'de', 'fr', 'it', 'jp', 'cn', 'au', 'br', 'in']
): Promise<NewsArticle[]> {
  const cacheKey = countries.sort().join(',')
  const cached = newsCache.get(cacheKey)
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }

  const results = await Promise.all(
    countries.map((country) => fetchHeadlinesByCountry(country))
  )

  const articles = results.flat()
  
  newsCache.set(cacheKey, { data: articles, timestamp: Date.now() })
  
  return articles
}

/**
 * Cerca news globalmente
 */
export async function searchNews(query: string, pageSize = 20): Promise<NewsArticle[]> {
  if (!API_KEY || !query.trim()) return []

  try {
    const response = await fetch(
      `${NEWS_API_BASE}/everything?q=${encodeURIComponent(query)}&pageSize=${pageSize}&sortBy=publishedAt&apiKey=${API_KEY}`
    )

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data: NewsApiResponse = await response.json()

    if (data.status !== 'ok') {
      throw new Error(data.message || 'API Error')
    }

    // Per search globale, assegna coordinate casuali dai paesi principali
    return data.articles.map((article, index) => {
      const country = newsApiCountries[index % newsApiCountries.length]
      return transformArticle(article, country)
    }).filter((a): a is NewsArticle => a !== null)
  } catch (error) {
    console.error('Failed to search news:', error)
    return []
  }
}

/**
 * Trasforma gli articoli in punti per il globo
 */
export function articlesToPoints(articles: NewsArticle[]): NewsPoint[] {
  return articles.map((article) => ({
    id: article.id,
    lat: article.coordinates.lat,
    lng: article.coordinates.lng,
    title: article.title,
    source: article.source.name,
    country: article.country,
    sentiment: article.sentiment || 'neutral',
    article,
  }))
}

/**
 * Colori per sentiment - Trading Journal palette
 */
export const sentimentColors = {
  positive: '#6fffe9', // neon-ice (bullish)
  negative: '#ff6b6b', // destructive (bearish)
  neutral: '#5bc0be',  // tropical-teal
} as const

/**
 * Formatta la data di pubblicazione
 */
export function formatPublishedDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) {
    return `${diffMins}m fa`
  } else if (diffHours < 24) {
    return `${diffHours}h fa`
  } else if (diffDays < 7) {
    return `${diffDays}g fa`
  } else {
    return date.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    })
  }
}

/**
 * Verifica se l'API key è configurata
 */
export function isNewsApiConfigured(): boolean {
  return !!API_KEY
}

/**
 * Lista paesi disponibili
 */
export { newsApiCountries }
