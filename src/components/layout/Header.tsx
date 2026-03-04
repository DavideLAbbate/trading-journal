import { useState, useEffect } from 'react'
import { Globe2, Search, Wifi, WifiOff, RefreshCw, Settings, Newspaper } from 'lucide-react'
import { Button } from '../ui/button'
import { checkLLMHealth } from '../../lib/llm'
import { cn } from '../../lib/utils'

interface HeaderProps {
  onSearch?: (query: string) => void
  onRefresh?: () => void
  isLoading?: boolean
  newsCount?: number
}

export function Header({ onSearch, onRefresh, isLoading, newsCount = 0 }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [ollamaStatus, setOllamaStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking')
  const [activeTab, setActiveTab] = useState('globe')

  // Check Ollama connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      setOllamaStatus('checking')
      const isConnected = await checkLLMHealth()
      setOllamaStatus(isConnected ? 'connected' : 'disconnected')
    }
    checkConnection()
    // Re-check ogni 30 secondi
    const interval = setInterval(checkConnection, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(searchQuery)
  }

  const tabs = [
    { id: 'globe', label: 'Globe View', icon: Globe2 },
    { id: 'feed', label: 'News Feed', icon: Newspaper },
  ]

  return (
    <header className="relative">
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-[var(--glass-bg)] backdrop-blur-xl border-b border-[var(--glass-border)]" />
      
      <div className="relative flex items-center justify-between h-16 px-4 md:px-6">
        {/* Left: Logo + Navigation */}
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-9 h-9 bg-[var(--primary)] rounded-lg flex items-center justify-center">
                <Globe2 className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="hidden sm:flex flex-col">
              <h1 className="text-base font-semibold text-[var(--foreground)] leading-tight">
                NewsGlobe
              </h1>
              <span className="text-[10px] text-[var(--muted-foreground)]">
                World News
              </span>
            </div>
          </div>

          {/* Navigation Pills */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-lg bg-[var(--muted)]/40">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200',
                    activeTab === tab.id
                      ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm'
                      : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden lg:inline">{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Center: Search */}
        <form onSubmit={handleSearch} className="hidden lg:block absolute left-1/2 -translate-x-1/2 w-full max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search news..."
              className="w-full h-9 pl-9 pr-4 rounded-lg bg-[var(--muted)]/60 border border-[var(--border)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)]/50 transition-all"
            />
          </div>
        </form>

        {/* Right: Status + Actions */}
        <div className="flex items-center gap-2">
          {/* News Count */}
          {newsCount > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--muted)]/40 text-[var(--muted-foreground)]">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium">{newsCount}</span>
            </div>
          )}

          {/* Ollama Status Indicator */}
          <div
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
              ollamaStatus === 'connected'
                ? 'bg-emerald-500/10 text-emerald-400'
                : ollamaStatus === 'disconnected'
                ? 'bg-red-500/10 text-red-400'
                : 'bg-yellow-500/10 text-yellow-400'
            )}
          >
            {ollamaStatus === 'connected' ? (
              <Wifi className="w-3.5 h-3.5" />
            ) : ollamaStatus === 'disconnected' ? (
              <WifiOff className="w-3.5 h-3.5" />
            ) : (
              <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
            <span className="hidden sm:inline">
              {ollamaStatus === 'connected' ? 'AI' : ollamaStatus === 'disconnected' ? 'Offline' : '...'}
            </span>
          </div>

          {/* Refresh Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-8 w-8 p-0 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
          </Button>

          {/* Settings Button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
