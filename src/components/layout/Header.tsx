import { useState, useEffect } from 'react'
import { Search, Wifi, WifiOff, RefreshCw, TrendingUp, PanelLeft, Menu, BarChart3, BookOpen } from 'lucide-react'
import { Button } from '../ui/button'
import { checkLLMHealth } from '../../lib/llm'
import { cn } from '../../lib/utils'

interface HeaderProps {
  onSearch?: (query: string) => void
  onRefresh?: () => void
  isLoading?: boolean
  newsCount?: number
  panelsVisible?: boolean
  onTogglePanels?: () => void
  onOpenLeftDrawer?: () => void
  onOpenRightDrawer?: () => void
  onOpenNewspaper?: () => void
}

export function Header({
  onSearch,
  onRefresh,
  isLoading,
  newsCount = 0,
  panelsVisible,
  onTogglePanels,
  onOpenLeftDrawer,
  onOpenRightDrawer,
  onOpenNewspaper,
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [ollamaStatus, setOllamaStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking')

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

  return (
    <header className="relative">
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-[var(--glass-bg)] backdrop-blur-xl border-b border-[var(--glass-border)]" />
      
      <div className="relative px-3 py-3 sm:px-4 lg:px-6">
        <div className="flex items-start justify-between gap-3 sm:items-center">
          {/* Left: Logo */}
          <div className="flex min-w-0 items-center gap-2 sm:gap-4 lg:gap-8">
          {/* Logo */}
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--tropical-teal)] to-[var(--neon-ice)] rounded-xl blur-sm opacity-60" />
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--tropical-teal)] to-[var(--neon-ice)] shadow-lg sm:h-10 sm:w-10">
                <TrendingUp className="h-4 w-4 text-[var(--prussian-blue)] sm:h-5 sm:w-5" />
              </div>
            </div>
            <div className="flex min-w-0 flex-col">
              <h1 className="truncate text-base font-bold tracking-tight text-[var(--foreground)] sm:text-lg">
                Trading Journal
              </h1>
              <span className="truncate text-[9px] uppercase tracking-[0.24em] text-[var(--tropical-teal)] sm:text-[10px]">
                Market Intelligence
              </span>
            </div>
          </div>

          {/* Panel toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onTogglePanels}
            className={cn(
              'text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors',
              !panelsVisible && 'text-[var(--tropical-teal)]'
            )}
            title={panelsVisible ? 'Hide panels' : 'Show panels'}
          >
            <PanelLeft className="w-4 h-4" />
          </Button>
        </div>

          {/* Center: Search */}
          <form onSubmit={handleSearch} className="mx-8 hidden max-w-md flex-1 lg:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search market news..."
                className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--muted)] pl-10 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>
          </form>

          {/* Right: Status + Actions */}
          <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2 lg:gap-3">
            {/* Mobile feed drawer — only on mobile */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onOpenLeftDrawer}
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] lg:hidden"
              title="Open feed"
            >
              <Menu className="w-4 h-4" />
            </Button>

            {/* Insights drawer — only on mobile/tablet (hidden on lg+) */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onOpenRightDrawer}
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] xl:hidden"
              title="Open insights"
            >
              <BarChart3 className="w-4 h-4" />
            </Button>

            {/* News Count */}
            {newsCount > 0 && (
              <div className="hidden items-center gap-2 rounded-lg bg-[var(--muted)]/50 px-2.5 py-1.5 sm:flex lg:px-3">
                <div className="h-2 w-2 rounded-full bg-[var(--accent)] animate-pulse" />
                <span className="text-xs font-medium text-[var(--muted-foreground)]">
                  {newsCount} news live
                </span>
              </div>
            )}

            {/* Refresh Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onRefresh}
              disabled={isLoading}
              className={cn(
                'text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors',
                isLoading && 'opacity-60 cursor-not-allowed'
              )}
              title="Refresh news"
            >
              <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
            </Button>

            {/* Newspaper Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onOpenNewspaper}
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              title="Open Newspaper"
            >
              <BookOpen className="w-4 h-4" />
            </Button>

            {/* Ollama Status Indicator — always last */}
            <div
              className={cn(
                'flex items-center gap-2 rounded-lg px-2.5 py-1.5 transition-colors sm:px-3',
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
              <span className="hidden text-xs font-medium sm:inline">
                {ollamaStatus === 'connected' ? 'AI Online' : ollamaStatus === 'disconnected' ? 'AI Offline' : 'Checking...'}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSearch} className="mt-3 lg:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search market news..."
              className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--muted)] pl-10 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
        </form>

        {newsCount > 0 && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-[var(--muted)]/40 px-3 py-2 sm:hidden">
            <div className="h-2 w-2 rounded-full bg-[var(--accent)] animate-pulse" />
            <span className="text-xs font-medium text-[var(--muted-foreground)]">
              {newsCount} live headlines
            </span>
          </div>
        )}
      </div>
    </header>
  )
}
