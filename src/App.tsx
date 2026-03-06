import React, { useState, useCallback } from 'react'
import { Globe } from './components/Globe'
import type { HudFocus, GlobeStats } from './components/Globe'
import { MainLayout } from './components/layout/MainLayout'
import { Header } from './components/layout/Header'
import { TopTicker } from './components/hud/TopTicker'
import { GlobalFeed } from './components/hud/GlobalFeed'
import { InsightsPanel } from './components/hud/InsightsPanel'
import { AnimatedBackground } from './components/AnimatedBackground'
import { Dialog, DrawerContent } from './components/ui/dialog'
import { NewspaperViewer } from './components/newspaper/NewspaperViewer'
import { useNews } from './hooks/useNews'
import { sentimentColors } from './lib/news'
import type { NewsArticle } from './types/news'

function App() {
  const {
    articles,
    points,
    isLoading,
    isCategorizing,
    categorizationProgress,
    refresh,
  } = useNews({ autoCategorize: true })

  const [panelsVisible, setPanelsVisible] = useState(true)
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false)
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false)
  const [feedArticle, setFeedArticle] = useState<NewsArticle | null>(null)
  const [newspaperOpen, setNewspaperOpen] = useState(false)

  // HUD state lifted from Globe
  const [hudFocus, setHudFocus] = useState<HudFocus>({
    name: 'Global Overview',
    code: 'LIVE',
    count: 0,
    sentiment: 'neutral',
    hasData: false,
    isGlobal: true,
  })
  const [globeStats, setGlobeStats] = useState<GlobeStats>({ positive: 0, neutral: 0, negative: 0, countries: 0 })
  const [marketSidebarOpen, setMarketSidebarOpen] = useState(false)

  const handleArticleClick = useCallback((article: NewsArticle) => {
    setPanelsVisible(false)
    setFeedArticle(article)
  }, [])

  const countryCount = useCallback(() => {
    const countries = new Set(articles.map(a => a.countryCode))
    return countries.size
  }, [articles])()

  const renderLeftSidebar = (key: string) => (
    <GlobalFeed key={key} articles={articles} onArticleClick={handleArticleClick} />
  )

  const renderRightSidebar = (key: string) => (
    <InsightsPanel key={key} articles={articles} />
  )

  // Shared left offset (both top and bottom badges)
  const leftOffset = panelsVisible ? 'calc(18rem + 1rem)' : '1rem'
  const rightOffset = panelsVisible ? 'calc(16rem + 1rem)' : '1rem'

  const hudOverlay = (
    <>
      {/* Country Focus badge — hidden when market sidebar is open */}
      {!marketSidebarOpen && (
        <div
          className="absolute top-4 pointer-events-none hud-badge-left"
          style={{ zIndex: 50, '--hud-left-offset': leftOffset, transition: 'left 300ms ease' } as React.CSSProperties}
        >
          <div
            className="p-3 rounded-sm hud-panel min-w-[180px] border-l-2 transition-all duration-200"
            style={{ borderLeftColor: hudFocus.hasData ? sentimentColors[hudFocus.sentiment] : 'var(--hud-border)' }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono-hud text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-widest">
                {hudFocus.code}
              </span>
              <span className="text-sm font-semibold text-[var(--foreground)]">
                {hudFocus.name}
              </span>
            </div>
            {hudFocus.hasData ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sentimentColors[hudFocus.sentiment] }} />
                <p className="text-xs text-[var(--muted-foreground)]">
                  {hudFocus.count} {hudFocus.count === 1 ? 'article' : 'articles'}
                </p>
                {!hudFocus.isGlobal && (
                  <span className="text-[10px] text-[var(--muted-foreground)] opacity-60">Click to view</span>
                )}
              </div>
            ) : (
              <p className="text-xs text-[var(--muted-foreground)] opacity-60">Loading...</p>
            )}
          </div>
        </div>
      )}

      {/* Stats counter — bottom-left */}
      {globeStats.countries > 0 && (
        <div
          className="absolute bottom-4 pointer-events-none hud-badge-left"
          style={{ zIndex: 50, '--hud-left-offset': leftOffset, transition: 'left 300ms ease' } as React.CSSProperties}
        >
          <div className="flex items-center gap-2 p-2 rounded-sm hud-panel">
            <div className="flex items-center gap-1.5 px-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sentimentColors.positive }} />
              <span className="font-mono-hud text-xs text-[var(--muted-foreground)]">{globeStats.positive}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sentimentColors.neutral }} />
              <span className="font-mono-hud text-xs text-[var(--muted-foreground)]">{globeStats.neutral}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sentimentColors.negative }} />
              <span className="font-mono-hud text-xs text-[var(--muted-foreground)]">{globeStats.negative}</span>
            </div>
            <span className="font-mono-hud text-xs text-[var(--muted-foreground)] pl-2 border-l border-[var(--hud-border)]">
              {globeStats.countries} countries
            </span>
          </div>
        </div>
      )}

      {/* Categorization progress — top-right */}
      {isCategorizing && categorizationProgress && (
        <div
          className="absolute top-4 pointer-events-none animate-panel-reveal hud-badge-right"
          style={{ zIndex: 50, '--hud-right-offset': rightOffset, transition: 'right 300ms ease' } as React.CSSProperties}
        >
          <div className="p-3 rounded-lg hud-panel">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-[var(--tropical-teal)] border-t-transparent rounded-full animate-spin" />
              <div>
                <p className="text-xs font-medium text-[var(--foreground)]">Categorizing...</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {categorizationProgress.completed}/{categorizationProgress.total}
                </p>
              </div>
            </div>
            <div className="mt-2 h-1 bg-[var(--hud-surface)] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[var(--tropical-teal)] to-[var(--neon-ice)] transition-all duration-300"
                style={{ width: `${(categorizationProgress.completed / categorizationProgress.total) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )

  return (
    <>
      <AnimatedBackground />
      <MainLayout
        panelsVisible={panelsVisible}
        hudOverlay={hudOverlay}
        header={
        <Header
            newsCount={articles.length}
            onRefresh={refresh}
            isLoading={isLoading}
            panelsVisible={panelsVisible}
            onTogglePanels={() => setPanelsVisible(v => !v)}
            onOpenLeftDrawer={() => setLeftDrawerOpen(true)}
            onOpenRightDrawer={() => setRightDrawerOpen(true)}
            onOpenNewspaper={() => setNewspaperOpen(true)}
          />
        }
        ticker={<TopTicker articles={articles} countryCount={countryCount} />}
        leftSidebar={renderLeftSidebar('left-rail')}
        rightSidebar={renderRightSidebar('right-rail')}
      >
        <Globe
          className="w-full h-full"
          newsPoints={points}
          isLoading={isLoading}
          externalArticle={feedArticle}
          onTogglePanels={() => setPanelsVisible(v => !v)}
          onHudFocusChange={setHudFocus}
          onStatsChange={setGlobeStats}
          onMarketSidebarChange={setMarketSidebarOpen}
        />
      </MainLayout>

      <Dialog open={leftDrawerOpen} onOpenChange={setLeftDrawerOpen}>
        <DrawerContent side="left">
          <div className="h-full flex flex-col overflow-hidden">
            {renderLeftSidebar('left-drawer')}
          </div>
        </DrawerContent>
      </Dialog>

      <Dialog open={rightDrawerOpen} onOpenChange={setRightDrawerOpen}>
        <DrawerContent side="right">
          <div className="h-full flex flex-col overflow-hidden">
            {renderRightSidebar('right-drawer')}
          </div>
        </DrawerContent>
      </Dialog>

      <NewspaperViewer open={newspaperOpen} onClose={() => setNewspaperOpen(false)} />
    </>
  )
}

export default App
