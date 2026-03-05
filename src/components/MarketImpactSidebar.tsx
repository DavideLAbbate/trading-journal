import { useState, useEffect, useCallback } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { ScrollArea } from './ui/scroll-area'
import { Badge } from './ui/badge'
import { 
  X, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Bitcoin,
  Landmark,
  BarChart3,
  Clock,
  Percent,
  Activity,
  Loader2
} from 'lucide-react'
import type { NewsArticle } from '../types/news'
import { chatCompletion } from '../lib/llm'

interface MarketSignal {
  asset: string
  signal: 'BUY' | 'SELL' | 'HOLD'
  confidence: number
  priceTarget?: string
  timeframe: string
  rationale: string
}

interface MarketImpactSidebarProps {
  article: NewsArticle | null
  isOpen: boolean
  onClose: () => void
}

const MARKETS = [
  { id: 'forex', name: 'Forex', icon: DollarSign },
  { id: 'crypto', name: 'Crypto', icon: Bitcoin },
  { id: 'stocks', name: 'Stocks', icon: Landmark },
  { id: 'commodities', name: 'Commodities', icon: BarChart3 },
]

async function analyzeMarketImpact(article: NewsArticle, market: string): Promise<MarketSignal[]> {
  const prompt = `Analyze the following news article and provide trading signals for the ${market.toUpperCase()} market.

NEWS ARTICLE:
Title: ${article.title}
Description: ${article.description || 'N/A'}
Category: ${article.category || 'general'}
Country: ${article.country}
AI Summary: ${article.aiSummary || 'N/A'}

Based on this news, provide 3-5 specific ${market} trading signals in this exact JSON format (respond ONLY with valid JSON, no markdown):

{
  "signals": [
    {
      "asset": "string (e.g., EUR/USD for forex, BTC for crypto, AAPL for stocks, GOLD for commodities)",
      "signal": "BUY" | "SELL" | "HOLD",
      "confidence": number 0-100,
      "priceTarget": "string (optional, e.g., +2.5% or $150)",
      "timeframe": "string (e.g., Short-term, Medium-term, Long-term)",
      "rationale": "string (brief 1-sentence explanation)"
    }
  ]
}

Consider:
- ${market === 'forex' ? 'Major and minor currency pairs that might be affected' : ''}
- ${market === 'crypto' ? 'Bitcoin, Ethereum, and relevant altcoins' : ''}
- ${market === 'stocks' ? 'Individual stocks and sectors that might be impacted' : ''}
- ${market === 'commodities' ? 'Gold, oil, natural gas, agricultural products' : ''}

Respond ONLY with the JSON object.`

  try {
    const response = await chatCompletion({
      messages: [
        { role: 'system', content: 'You are an expert financial analyst. Respond only with valid JSON. Do not include any markdown formatting, code blocks, or extra text.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 1500,
    })

    const content = response.message.content
    
    // Remove markdown code blocks if present
    const jsonContent = content
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim()
    
    // Find the JSON object boundaries more robustly
    const start = jsonContent.indexOf('{')
    let end = -1
    
    if (start !== -1) {
      // Find matching closing brace by counting braces
      let braceCount = 0
      for (let i = start; i < jsonContent.length; i++) {
        if (jsonContent[i] === '{') braceCount++
        if (jsonContent[i] === '}') braceCount--
        if (braceCount === 0) {
          end = i
          break
        }
      }
    }
    
    if (start === -1 || end === -1) {
      console.warn('No valid JSON object found in response:', content.substring(0, 200))
      return []
    }
    
    const jsonString = jsonContent.slice(start, end + 1)
    
    // Attempt to fix common JSON issues before parsing
    const sanitizedJson = jsonString
      // Remove trailing commas before closing brackets/braces
      .replace(/,(\s*[}\]])/g, '$1')
      // Fix unquoted keys (simple cases)
      .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)(\s*:)/g, '$1"$2"$3')
    
    const parsed = JSON.parse(sanitizedJson)
    return parsed.signals || []
  } catch (error) {
    console.error('Failed to analyze market impact:', error)
    return []
  }
}

export function MarketImpactSidebar({ article, isOpen, onClose }: MarketImpactSidebarProps) {
  const [activeMarket, setActiveMarket] = useState('forex')
  const [marketData, setMarketData] = useState<Record<string, MarketSignal[]>>({})
  const [loadingMarkets, setLoadingMarkets] = useState<Set<string>>(new Set())
  const [isClosing, setIsClosing] = useState(false)

  // Load market data when tab changes or article changes
  // Using a handler pattern to avoid setState in effect
  const loadMarketData = useCallback(() => {
    if (!isOpen || !article) return
    if (!marketData[activeMarket] && !loadingMarkets.has(activeMarket)) {
      setLoadingMarkets(prev => new Set(prev).add(activeMarket))
      analyzeMarketImpact(article, activeMarket).then(signals => {
        setMarketData(prev => ({ ...prev, [activeMarket]: signals }))
        setLoadingMarkets(prev => {
          const next = new Set(prev)
          next.delete(activeMarket)
          return next
        })
      })
    }
  }, [isOpen, article, activeMarket, marketData, loadingMarkets])

  useEffect(() => {
    queueMicrotask(loadMarketData)
  }, [loadMarketData])

  // Reset data when article changes
  useEffect(() => {
    if (article) {
      queueMicrotask(() => {
        setMarketData({})
        setActiveMarket('forex')
      })
    }
  }, [article])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsClosing(false)
      onClose()
    }, 200)
  }

  if (!isOpen || !article) return null

  const currentSignals = marketData[activeMarket] || []
  const isLoading = loadingMarkets.has(activeMarket)

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-[var(--prussian-blue)]/60 backdrop-blur-sm z-40 transition-opacity ${isClosing ? 'opacity-0' : 'opacity-100'}`}
        onClick={handleClose}
      />
      
      {/* Sidebar */}
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-md z-50 ${isClosing ? 'animate-slide-out-right' : 'animate-slide-in-right'}`}
      >
        <div className="h-full bg-[var(--hud-surface)] border-l border-[var(--hud-border-strong)] flex flex-col">
          {/* Header */}
          <div className="flex-shrink-0 p-4 border-b border-[var(--hud-border-strong)]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-sm bg-[var(--hud-surface)] border border-[var(--hud-border)] flex items-center justify-center">
                  <Activity className="w-4 h-4 text-[var(--tropical-teal)]" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-[var(--foreground)]">Market Impact</h2>
                  <p className="font-mono-hud text-[10px] text-[var(--muted-foreground)]">AI-powered signals</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-7 h-7 rounded-sm bg-[var(--hud-surface)] border border-[var(--hud-border)] flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--hud-border-hover)] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Article reference */}
            <div className="p-2.5 rounded-sm bg-[var(--hud-surface-2)] border border-[var(--hud-border)]">
              <p className="font-mono-hud text-[10px] text-[var(--muted-foreground)] mb-1">Analyzing:</p>
              <p className="text-xs text-[var(--foreground)] line-clamp-2 font-medium">
                {article.title}
              </p>
            </div>
          </div>

          {/* Market Tabs */}
          <Tabs value={activeMarket} onValueChange={setActiveMarket} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-shrink-0 px-4 pt-3">
              <TabsList className="w-full grid grid-cols-4 bg-[var(--hud-surface)] p-0.5 rounded-sm border border-[var(--hud-border)]">
                {MARKETS.map((market) => {
                  const Icon = market.icon
                  return (
                    <TabsTrigger 
                      key={market.id} 
                      value={market.id}
                      className="flex items-center gap-1 text-[10px] data-[state=active]:bg-[var(--hud-surface-2)] data-[state=active]:text-[var(--foreground)] rounded-sm py-1.5"
                    >
                      <Icon className="w-3 h-3" />
                      <span className="hidden sm:inline">{market.name}</span>
                    </TabsTrigger>
                  )
                })}
              </TabsList>
            </div>

            {/* Signals Content */}
            <ScrollArea className="flex-1 px-4 py-3">
              {MARKETS.map((market) => (
                <TabsContent key={market.id} value={market.id} className="mt-0">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-10">
                      <Loader2 className="w-7 h-7 text-[var(--tropical-teal)] animate-spin mb-3" />
                      <p className="text-xs text-[var(--muted-foreground)]">
                        Analyzing {market.name}...
                      </p>
                    </div>
                  ) : currentSignals.length > 0 ? (
                    <div className="space-y-2">
                      {currentSignals.map((signal, index) => (
                        <SignalCard key={index} signal={signal} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <Activity className="w-10 h-10 text-[var(--muted-foreground)] mb-3 opacity-40" />
                      <p className="text-xs text-[var(--muted-foreground)]">
                        No signals for this market
                      </p>
                    </div>
                  )}
                </TabsContent>
              ))}
            </ScrollArea>
          </Tabs>

          {/* Footer disclaimer */}
          <div className="flex-shrink-0 p-3 border-t border-[var(--hud-border-strong)]">
            <p className="text-[9px] text-[var(--muted-foreground)] text-center leading-relaxed">
              AI signals are informational. Not financial advice.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

function SignalCard({ signal }: { signal: MarketSignal }) {
  const signalConfig = {
    BUY: { 
      icon: TrendingUp, 
      color: 'var(--accent-up)',
      bgClass: 'bg-[var(--accent-up)]/10',
      borderClass: 'border-[var(--accent-up)]'
    },
    SELL: { 
      icon: TrendingDown, 
      color: 'var(--accent-alert)',
      bgClass: 'bg-[var(--accent-alert)]/10',
      borderClass: 'border-[var(--accent-alert)]'
    },
    HOLD: { 
      icon: Activity, 
      color: 'var(--tropical-teal)',
      bgClass: 'bg-[var(--tropical-teal)]/10',
      borderClass: 'border-[var(--tropical-teal)]'
    },
  }

  const config = signalConfig[signal.signal]
  const Icon = config.icon

  return (
    <div className="p-3 rounded-sm bg-[var(--hud-surface)] border border-[var(--hud-border)]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-mono-hud text-sm font-semibold text-[var(--foreground)]">{signal.asset}</span>
          <Badge
            className={`border px-1.5 py-0.5 text-[10px] font-semibold rounded-sm ${config.bgClass} ${config.borderClass}`}
            style={{ color: config.color }}
          >
            <Icon className="w-2.5 h-2.5 mr-1" />
            {signal.signal}
          </Badge>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-[var(--muted-foreground)]">
          <Percent className="w-2.5 h-2.5" />
          <span className="font-mono-hud">{signal.confidence}%</span>
        </div>
      </div>

      <p className="text-xs text-[var(--muted-foreground)] mb-2 leading-relaxed">
        {signal.rationale}
      </p>

      <div className="flex items-center gap-3 text-[10px] text-[var(--muted-foreground)]">
        <div className="flex items-center gap-1">
          <Clock className="w-2.5 h-2.5" />
          <span className="font-mono-hud">{signal.timeframe}</span>
        </div>
        {signal.priceTarget && (
          <div className="flex items-center gap-1">
            <TrendingUp className="w-2.5 h-2.5" />
            <span className="font-mono-hud">{signal.priceTarget}</span>
          </div>
        )}
      </div>
    </div>
  )
}
