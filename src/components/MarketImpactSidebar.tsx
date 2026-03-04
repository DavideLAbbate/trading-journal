import { useState, useEffect } from 'react'
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

interface MarketImpact {
  market: string
  signals: MarketSignal[]
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
        { role: 'system', content: 'You are an expert financial analyst. Respond only with valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4,
      max_tokens: 1000,
    })

    const content = response.message.content
    const start = content.indexOf('{')
    const end = content.lastIndexOf('}')
    
    if (start === -1 || end === -1) return []
    
    const parsed = JSON.parse(content.slice(start, end + 1))
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
  useEffect(() => {
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
  }, [isOpen, article, activeMarket])

  // Reset data when article changes
  useEffect(() => {
    if (article) {
      setMarketData({})
      setActiveMarket('forex')
    }
  }, [article?.id])

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
        <div className="h-full bg-[var(--prussian-blue)]/95 backdrop-blur-xl border-l border-[var(--border)] flex flex-col">
          {/* Header */}
          <div className="flex-shrink-0 p-6 border-b border-[var(--border)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--tropical-teal)] to-[var(--neon-ice)] flex items-center justify-center">
                  <Activity className="w-5 h-5 text-[var(--prussian-blue)]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[var(--foreground)]">Market Impact</h2>
                  <p className="text-xs text-[var(--muted-foreground)]">AI-powered trading signals</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-[var(--space-indigo)] flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Article reference */}
            <div className="p-3 rounded-xl bg-[var(--space-indigo)]/50 border border-[var(--border)]">
              <p className="text-xs text-[var(--muted-foreground)] mb-1">Analyzing:</p>
              <p className="text-sm text-[var(--foreground)] line-clamp-2 font-medium">
                {article.title}
              </p>
            </div>
          </div>

          {/* Market Tabs */}
          <Tabs value={activeMarket} onValueChange={setActiveMarket} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-shrink-0 px-6 pt-4">
              <TabsList className="w-full grid grid-cols-4 bg-[var(--space-indigo)]/50 p-1 rounded-xl">
                {MARKETS.map((market) => {
                  const Icon = market.icon
                  return (
                    <TabsTrigger 
                      key={market.id} 
                      value={market.id}
                      className="flex items-center gap-1.5 text-xs data-[state=active]:bg-[var(--tropical-teal)] data-[state=active]:text-[var(--prussian-blue)] rounded-lg py-2"
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{market.name}</span>
                    </TabsTrigger>
                  )
                })}
              </TabsList>
            </div>

            {/* Signals Content */}
            <ScrollArea className="flex-1 px-6 py-4">
              {MARKETS.map((market) => (
                <TabsContent key={market.id} value={market.id} className="mt-0">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 text-[var(--tropical-teal)] animate-spin mb-4" />
                      <p className="text-sm text-[var(--muted-foreground)]">
                        Analyzing {market.name} impact...
                      </p>
                    </div>
                  ) : currentSignals.length > 0 ? (
                    <div className="space-y-3">
                      {currentSignals.map((signal, index) => (
                        <SignalCard key={index} signal={signal} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Activity className="w-12 h-12 text-[var(--muted-foreground)] mb-4 opacity-50" />
                      <p className="text-sm text-[var(--muted-foreground)]">
                        No signals available for this market
                      </p>
                    </div>
                  )}
                </TabsContent>
              ))}
            </ScrollArea>
          </Tabs>

          {/* Footer disclaimer */}
          <div className="flex-shrink-0 p-4 border-t border-[var(--border)]">
            <p className="text-[10px] text-[var(--muted-foreground)] text-center leading-relaxed">
              AI-generated signals are for informational purposes only. 
              Not financial advice. Always do your own research.
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
      color: 'signal-buy',
      bgColor: 'bg-[var(--neon-ice)]/10',
      borderColor: 'border-[var(--neon-ice)]/30'
    },
    SELL: { 
      icon: TrendingDown, 
      color: 'signal-sell',
      bgColor: 'bg-[var(--destructive)]/10',
      borderColor: 'border-[var(--destructive)]/30'
    },
    HOLD: { 
      icon: Activity, 
      color: 'signal-hold',
      bgColor: 'bg-[var(--tropical-teal)]/10',
      borderColor: 'border-[var(--tropical-teal)]/30'
    },
  }

  const config = signalConfig[signal.signal]
  const Icon = config.icon

  return (
    <div className={`p-4 rounded-xl ${config.bgColor} border ${config.borderColor}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-[var(--foreground)]">{signal.asset}</span>
          <Badge 
            className={`${config.color} bg-transparent border-0 font-bold text-xs px-0`}
          >
            <Icon className="w-3 h-3 mr-1" />
            {signal.signal}
          </Badge>
        </div>
        <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
          <Percent className="w-3 h-3" />
          <span className="font-mono">{signal.confidence}%</span>
        </div>
      </div>

      <p className="text-sm text-[var(--muted-foreground)] mb-3 leading-relaxed">
        {signal.rationale}
      </p>

      <div className="flex items-center gap-4 text-xs text-[var(--muted-foreground)]">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{signal.timeframe}</span>
        </div>
        {signal.priceTarget && (
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span className="font-mono">{signal.priceTarget}</span>
          </div>
        )}
      </div>
    </div>
  )
}
