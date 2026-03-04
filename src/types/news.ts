// Tipi per le news

export interface NewsSource {
  id: string | null
  name: string
}

export interface NewsArticle {
  id: string
  title: string
  description: string | null
  content: string | null
  source: NewsSource
  author: string | null
  publishedAt: string
  url: string
  urlToImage: string | null
  // Campi arricchiti
  country: string
  countryCode: string
  coordinates: {
    lat: number
    lng: number
  }
  // Sentiment (popolato dall'AI)
  sentiment?: 'positive' | 'negative' | 'neutral'
  sentimentScore?: number // -1 to 1
  category?: NewsCategory
  keyPhrases?: string[]
  aiSummary?: string
}

export type NewsCategory = 
  | 'politics'
  | 'economy'
  | 'technology'
  | 'health'
  | 'sports'
  | 'entertainment'
  | 'science'
  | 'environment'
  | 'business'
  | 'general'

export interface NewsApiResponse {
  status: 'ok' | 'error'
  totalResults: number
  articles: NewsApiArticle[]
  code?: string
  message?: string
}

export interface NewsApiArticle {
  source: {
    id: string | null
    name: string
  }
  author: string | null
  title: string
  description: string | null
  url: string
  urlToImage: string | null
  publishedAt: string
  content: string | null
}

// Per il globo
export interface NewsPoint {
  id: string
  lat: number
  lng: number
  title: string
  source: string
  country: string
  sentiment: 'positive' | 'negative' | 'neutral'
  article: NewsArticle
}

// Filtri
export interface NewsFilters {
  countries?: string[]
  categories?: NewsCategory[]
  sentiment?: ('positive' | 'negative' | 'neutral')[]
  search?: string
  dateFrom?: string
  dateTo?: string
}

// Stats
export interface NewsStats {
  total: number
  bySentiment: {
    positive: number
    negative: number
    neutral: number
  }
  byCategory: Record<NewsCategory, number>
  byCountry: Record<string, number>
}
