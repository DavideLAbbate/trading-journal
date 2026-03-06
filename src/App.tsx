import { useState, useCallback } from 'react'
import { Globe } from './components/Globe'
import { MainLayout } from './components/layout/MainLayout'
import { Header } from './components/layout/Header'
import { TopTicker } from './components/hud/TopTicker'
import { GlobalFeed } from './components/hud/GlobalFeed'
import { InsightsPanel } from './components/hud/InsightsPanel'
import { AnimatedBackground } from './components/AnimatedBackground'
import { Dialog, DrawerContent } from './components/ui/dialog'
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
    setPanelsVisible(false);
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
          onTogglePanels={() => setPanelsVisible(v => !v)}
        />
      </MainLayout>

      {/* Side drawers */}
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
    </>
  )
}

export default App
