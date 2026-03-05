import { useState, useCallback } from 'react'
import { Globe } from './components/Globe'
import { MainLayout } from './components/layout/MainLayout'
import { Header } from './components/layout/Header'
import { TopTicker } from './components/hud/TopTicker'
import { GlobalFeed } from './components/hud/GlobalFeed'
import { InsightsPanel } from './components/hud/InsightsPanel'
import { AnimatedBackground } from './components/AnimatedBackground'
import { Dialog, DialogContent } from './components/ui/dialog'
import { useNews } from './hooks/useNews'
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

  // Panel visibility toggle (HUD "Hide panels" control)
  const [panelsVisible, setPanelsVisible] = useState(true)
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false)
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false)

  // Feed article → Globe sidebar bridge (Phase 8)
  const [feedArticle, setFeedArticle] = useState<NewsArticle | null>(null)

  // Handle article click from feed → open MarketImpactSidebar via Globe
  const handleArticleClick = useCallback((article: NewsArticle) => {
    setFeedArticle(article)
  }, [])

  // Get unique country count
  const countryCount = useCallback(() => {
    const countries = new Set(articles.map(a => a.countryCode))
    return countries.size
  }, [articles])()

  const renderLeftSidebar = (key: string) => (
    <GlobalFeed
      key={key}
      articles={articles}
      onArticleClick={handleArticleClick}
    />
  )

  const renderRightSidebar = (key: string) => (
    <InsightsPanel
      key={key}
      articles={articles}
    />
  )

  return (
    <>
      <AnimatedBackground />
      <MainLayout 
        panelsVisible={panelsVisible}
        header={
          <Header 
            newsCount={articles.length}
            onRefresh={refresh}
            isLoading={isLoading}
            panelsVisible={panelsVisible}
            onTogglePanels={() => setPanelsVisible(v => !v)}
            onOpenLeftDrawer={() => setLeftDrawerOpen(true)}
            onOpenRightDrawer={() => setRightDrawerOpen(true)}
          />
        }
        ticker={
          <TopTicker 
            articles={articles}
            countryCount={countryCount}
          />
        }
        leftSidebar={renderLeftSidebar('left-rail')}
        rightSidebar={renderRightSidebar('right-rail')}
      >
        <Globe 
          className="w-full h-full" 
          newsPoints={points}
          isLoading={isLoading}
          isCategorizing={isCategorizing}
          categorizationProgress={categorizationProgress}
          externalArticle={feedArticle}
        />
      </MainLayout>

      {/* Mobile drawers */}
      <Dialog open={leftDrawerOpen} onOpenChange={setLeftDrawerOpen}>
        <DialogContent className="left-0 top-0 translate-x-0 translate-y-0 h-full w-[85vw] max-w-sm rounded-none border-r border-[var(--hud-border-strong)] bg-[var(--hud-surface)] p-0">
          <div className="h-full overflow-y-auto">
            {renderLeftSidebar('left-drawer')}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={rightDrawerOpen} onOpenChange={setRightDrawerOpen}>
        <DialogContent className="right-0 top-0 translate-x-0 translate-y-0 h-full w-[85vw] max-w-sm rounded-none border-l border-[var(--hud-border-strong)] bg-[var(--hud-surface)] p-0">
          <div className="h-full overflow-y-auto">
            {renderRightSidebar('right-drawer')}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default App
