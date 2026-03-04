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
      
      <div className="relative flex items-center justify-between px-6 py-3">
        {/* Left: Logo + Navigation */}
        <div className="flex items-center gap-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-xl blur-sm opacity-60" />
              <div className="relative w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-xl flex items-center justify-center shadow-lg">
                <Globe2 className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-[var(--foreground)] tracking-tight">
                NewsGlobe
              </h1>
              <span className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)]">
                World News Portal
              </span>
            </div>
          </div>

          {/* Navigation Pills */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-[var(--muted)]/50">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    activeTab === tab.id
                      ? 'bg-[var(--card)] text-[var(--foreground)] shadow-md'
                      : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Center: Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md mx-8 hidden lg:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search world news..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
            />
          </div>
        </form>

        {/* Right: Status + Actions */}
        <div className="flex items-center gap-3">
          {/* News Count */}
          {newsCount > 0 && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--muted)]/50">
              <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
              <span className="text-xs font-medium text-[var(--muted-foreground)]">
                {newsCount} news live
              </span>
            </div>
          )}

          {/* Ollama Status Indicator */}
          <div
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors',
              ollamaStatus === 'connected'
                ? 'bg-emerald-500/10 text-emerald-400'
                : ollamaStatus === 'disconnected'
                ? 'bg-red-500/10 text-red-400'
                : 'bg-yellow-500/10 text-yellow-400'
            )}
          >
            {ollamaStatus === 'connected' ? (
              <Wifi className="w-4 h-4" />
            ) : ollamaStatus === 'disconnected' ? (
              <WifiOff className="w-4 h-4" />
            ) : (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
            <span className="text-xs font-medium hidden sm:inline">
              {ollamaStatus === 'connected' ? 'AI Online' : ollamaStatus === 'disconnected' ? 'AI Offline' : 'Checking...'}
            </span>
          </div>

          {/* Refresh Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={isLoading}
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
          </Button>

          {/* Settings Button */}
          <Button
            variant="ghost"
            size="icon"
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
