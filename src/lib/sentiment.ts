import { chatCompletion } from './llm'
import type { NewsArticle, NewsCategory } from '../types/news'

export interface SentimentResult {
  sentiment: 'positive' | 'negative' | 'neutral'
  score: number // -1 to 1
  confidence: number // 0 to 1
  keyPhrases: string[]
  category: NewsCategory
  summary: string
}

// Cache per evitare analisi ripetute
const sentimentCache = new Map<string, SentimentResult>()

/**
 * Genera una chiave cache per l'articolo
 */
function getCacheKey(article: NewsArticle): string {
  return `${article.title}-${article.publishedAt}`
}

/**
 * Prompt per l'analisi del sentiment
 */
function buildPrompt(article: NewsArticle): string {
  return `Analizza questa notizia e restituisci SOLO un JSON valido (senza markdown, senza commenti) con questa struttura esatta:

{
  "sentiment": "positive" | "negative" | "neutral",
  "score": number da -1 (molto negativo) a 1 (molto positivo),
  "confidence": number da 0 a 1,
  "keyPhrases": ["frase1", "frase2", "frase3"] (max 5 frasi chiave),
  "category": "politics" | "economy" | "technology" | "health" | "sports" | "entertainment" | "science" | "environment" | "business" | "general",
  "summary": "riassunto in 2 frasi massimo"
}

NOTIZIA DA ANALIZZARE:
Titolo: ${article.title}
Descrizione: ${article.description || 'Non disponibile'}
Contenuto: ${article.content?.slice(0, 500) || 'Non disponibile'}
Fonte: ${article.source.name}
Paese: ${article.country}

Rispondi SOLO con il JSON, nient'altro.`
}

/**
 * Estrae il JSON dalla risposta LLM
 */
function parseResponse(response: string): SentimentResult | null {
  try {
    // Pulisci la risposta da eventuali markdown code blocks
    let cleaned = response
      .replace(/```json\n?/gi, '')
      .replace(/```\n?/gi, '')
      .trim()

    // Trova il primo { e l'ultimo }
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    
    if (start === -1 || end === -1) {
      console.error('No JSON found in response')
      return null
    }

    cleaned = cleaned.slice(start, end + 1)
    const parsed = JSON.parse(cleaned)

    // Valida e normalizza
    return {
      sentiment: ['positive', 'negative', 'neutral'].includes(parsed.sentiment) 
        ? parsed.sentiment 
        : 'neutral',
      score: Math.max(-1, Math.min(1, Number(parsed.score) || 0)),
      confidence: Math.max(0, Math.min(1, Number(parsed.confidence) || 0.5)),
      keyPhrases: Array.isArray(parsed.keyPhrases) 
        ? parsed.keyPhrases.slice(0, 5).map(String) 
        : [],
      category: parsed.category || 'general',
      summary: String(parsed.summary || ''),
    }
  } catch (error) {
    console.error('Failed to parse sentiment response:', error)
    return null
  }
}

/**
 * Analizza il sentiment di un articolo usando Ollama
 */
export async function analyzeSentiment(article: NewsArticle): Promise<SentimentResult | null> {
  // Check cache
  const cacheKey = getCacheKey(article)
  const cached = sentimentCache.get(cacheKey)
  if (cached) {
    return cached
  }

  try {
    const prompt = buildPrompt(article)
    
    const response = await chatCompletion({
      messages: [
        {
          role: 'system',
          content: 'Sei un analista di news esperto. Rispondi sempre e solo con JSON valido, senza spiegazioni aggiuntive.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3, // Bassa temperatura per risposte più consistenti
      max_tokens: 500,
    })

    const result = parseResponse(response.message.content)
    
    if (result) {
      // Salva in cache
      sentimentCache.set(cacheKey, result)
    }

    return result
  } catch (error) {
    console.error('Sentiment analysis failed:', error)
    return null
  }
}

/**
 * Analizza batch di articoli (con rate limiting)
 */
export async function analyzeBatch(
  articles: NewsArticle[],
  onProgress?: (completed: number, total: number) => void
): Promise<Map<string, SentimentResult>> {
  const results = new Map<string, SentimentResult>()
  
  for (let i = 0; i < articles.length; i++) {
    const article = articles[i]
    const result = await analyzeSentiment(article)
    
    if (result) {
      results.set(article.id, result)
    }
    
    onProgress?.(i + 1, articles.length)
    
    // Rate limiting - aspetta 500ms tra le richieste
    if (i < articles.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  return results
}

/**
 * Pulisce la cache
 */
export function clearSentimentCache(): void {
  sentimentCache.clear()
}
