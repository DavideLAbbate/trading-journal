import type { NewsArticle, NewsPoint } from '../types/news'

// RSS Feed sources con coordinate geografiche
// Using multiple CORS proxies for better reliability
const CORS_PROXIES = [
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
]

const RSS_FEEDS = [
  { 
    url: 'https://feeds.bbci.co.uk/news/business/rss.xml', 
    source: 'BBC Business',
    country: 'United Kingdom',
    countryCode: 'GB',
    lat: 51.5074,
    lng: -0.1278,
  },
  { 
    url: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml', 
    source: 'NY Times Business',
    country: 'United States',
    countryCode: 'US',
    lat: 40.7128,
    lng: -74.0060,
  },
  { 
    url: 'https://feeds.reuters.com/reuters/businessNews', 
    source: 'Reuters Business',
    country: 'United States',
    countryCode: 'US',
    lat: 38.9072,
    lng: -77.0369,
  },
  { 
    url: 'https://www.theguardian.com/business/rss', 
    source: 'The Guardian Business',
    country: 'United Kingdom',
    countryCode: 'GB',
    lat: 53.4808,
    lng: -2.2426,
  },
]

// Cache per evitare chiamate ripetute
const newsCache = new Map<string, { data: NewsArticle[]; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minuti

/**
 * Genera un ID univoco per l'articolo
 */
function generateArticleId(title: string, pubDate: string, source: string): string {
  const hash = `${title || ''}-${pubDate || ''}-${source}`
  let hashCode = 0
  for (let i = 0; i < hash.length; i++) {
    const char = hash.charCodeAt(i)
    hashCode = ((hashCode << 5) - hashCode) + char
    hashCode = hashCode & hashCode
  }
  return `rss_${Math.abs(hashCode).toString(36)}`
}

/**
 * Estrai testo da un elemento XML
 */
function getElementText(item: Element, tagName: string): string | null {
  const element = item.querySelector(tagName)
  return element?.textContent?.trim() || null
}

/**
 * Estrai URL immagine da un item RSS usando DOMParser
 */
function extractImageUrl(item: Element): string | null {
  // Prova media:content
  const mediaContent = item.querySelector('media\\:content, content')
  if (mediaContent?.getAttribute('url')) {
    return mediaContent.getAttribute('url')
  }
  
  // Prova media:thumbnail
  const mediaThumbnail = item.querySelector('media\\:thumbnail, thumbnail')
  if (mediaThumbnail?.getAttribute('url')) {
    return mediaThumbnail.getAttribute('url')
  }
  
  // Prova enclosure
  const enclosure = item.querySelector('enclosure')
  if (enclosure?.getAttribute('url')) {
    return enclosure.getAttribute('url')
  }

  // Cerca immagine nel contenuto
  const description = getElementText(item, 'description') || ''
  const imgMatch = description.match(/<img[^>]+src=["']([^"']+)["']/)
  if (imgMatch?.[1]) {
    return imgMatch[1]
  }
  
  return null
}

interface FeedConfig {
  url: string
  source: string
  country: string
  countryCode: string
  lat: number
  lng: number
}

/**
 * Parse RSS XML usando DOMParser nativo del browser
 */
function parseRSSXML(xmlText: string): Element[] {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlText, 'text/xml')
  
  // Controlla errori di parsing
  const parseError = doc.querySelector('parsererror')
  if (parseError) {
    throw new Error('Failed to parse RSS XML')
  }
  
  // Ottieni tutti gli item
  const items = doc.querySelectorAll('item')
  return Array.from(items)
}

/**
 * Try fetching with multiple CORS proxies
 */
async function fetchWithFallback(url: string): Promise<Response> {
  let lastError: Error | null = null
  
  for (const getProxyUrl of CORS_PROXIES) {
    try {
      const proxyUrl = getProxyUrl(url)
      const response = await fetch(proxyUrl, {
        signal: AbortSignal.timeout(10000), // 10 second timeout
      })
      
      if (response.ok) {
        return response
      }
      lastError = new Error(`HTTP error: ${response.status}`)
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
      // Continue to next proxy
    }
  }
  
  throw lastError || new Error('All proxies failed')
}

/**
 * Fetch RSS feed singolo
 */
async function fetchRSSFeed(feedConfig: FeedConfig): Promise<NewsArticle[]> {
  try {
    const response = await fetchWithFallback(feedConfig.url)
    const xmlText = await response.text()
    const items = parseRSSXML(xmlText)
    
    const articles: NewsArticle[] = []
    
    for (const item of items.slice(0, 10)) {
      // Aggiungi jitter alle coordinate per non sovrapporre i punti
      const jitter = () => (Math.random() - 0.5) * 5
      
      const title = getElementText(item, 'title') || 'No title'
      const pubDate = getElementText(item, 'pubDate') || new Date().toISOString()
      const description = getElementText(item, 'description')
      const link = getElementText(item, 'link')
      const creator = getElementText(item, 'dc\\:creator') || getElementText(item, 'author')
      
      const article: NewsArticle = {
        id: generateArticleId(title, pubDate, feedConfig.source),
        title,
        description: description ? description.replace(/<[^>]*>/g, '').trim() : null,
        content: description,
        source: { id: feedConfig.source.toLowerCase().replace(/\s/g, '-'), name: feedConfig.source },
        author: creator,
        publishedAt: pubDate,
        url: link || '',
        urlToImage: extractImageUrl(item),
        country: feedConfig.country,
        countryCode: feedConfig.countryCode,
        coordinates: {
          lat: feedConfig.lat + jitter(),
          lng: feedConfig.lng + jitter(),
        },
        sentiment: 'neutral',
      }
      
      articles.push(article)
    }
    
    return articles
  } catch (error) {
    console.error(`Failed to fetch RSS feed from ${feedConfig.source}:`, error)
    return []
  }
}

/**
 * Fetch news da tutti i feed RSS
 */
export async function fetchGlobalNews(): Promise<NewsArticle[]> {
  const cacheKey = 'rss-feeds'
  const cached = newsCache.get(cacheKey)
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }

  // Fetch tutti i feed in parallelo (nessun rate limit per RSS)
  const results = await Promise.all(
    RSS_FEEDS.map((feed) => fetchRSSFeed(feed))
  )

  const articles = results.flat()
  
  // Shuffle per mescolare le fonti
  const shuffled = articles.sort(() => Math.random() - 0.5)
  
  newsCache.set(cacheKey, { data: shuffled, timestamp: Date.now() })
  
  return shuffled
}

/**
 * Cerca news (filtra dalle news già caricate)
 */
export async function searchNews(query: string): Promise<NewsArticle[]> {
  if (!query.trim()) return []
  
  const allNews = await fetchGlobalNews()
  const lowerQuery = query.toLowerCase()
  
  return allNews.filter((article) => 
    article.title.toLowerCase().includes(lowerQuery) ||
    article.description?.toLowerCase().includes(lowerQuery)
  )
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
 * RSS feeds sono sempre disponibili
 */
export function isNewsApiConfigured(): boolean {
  return true
}

/**
 * Lista paesi disponibili (basata sui feed RSS)
 */
export const newsApiCountries = ['us', 'gb'] as const
