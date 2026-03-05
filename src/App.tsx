import { useCallback } from 'react'
import { Globe } from './components/Globe'
import { MainLayout } from './components/layout/MainLayout'
import { Header } from './components/layout/Header'
import { TopTicker } from './components/hud/TopTicker'
import { GlobalFeed } from './components/hud/GlobalFeed'
import { InsightsPanel } from './components/hud/InsightsPanel'
import { AnimatedBackground } from './components/AnimatedBackground'
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

  // Handle article click from feed/insights - open MarketImpactSidebar
  const handleArticleClick = useCallback((_article: NewsArticle) => {
    // For now, we don't have direct sidebar access from App level
    // This could be enhanced with a global state management solution
    console.log('Article clicked:', _article.title)
  }, [])

  // Get unique country count
  const countryCount = useCallback(() => {
    const countries = new Set(articles.map(a => a.countryCode))
    return countries.size
  }, [articles])()

  return (
    <>
      <AnimatedBackground />
      <MainLayout 
        header={
          <Header 
            newsCount={articles.length}
            onRefresh={refresh}
            isLoading={isLoading}
          />
        }
        ticker={
          <TopTicker 
            articles={articles}
            countryCount={countryCount}
          />
        }
        leftSidebar={
          <GlobalFeed 
            articles={articles}
            onArticleClick={handleArticleClick}
          />
        }
        rightSidebar={
          <InsightsPanel 
            articles={articles}
          />
        }
      >
        <Globe 
          className="w-full h-full" 
          newsPoints={points}
          isLoading={isLoading}
          isCategorizing={isCategorizing}
          categorizationProgress={categorizationProgress}
        />
      </MainLayout>
    </>
  )
}

export default App
