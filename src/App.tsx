import { useCallback } from 'react'
import { Globe } from './components/Globe'
import { MainLayout } from './components/layout/MainLayout'
import { Header } from './components/layout/Header'
import { useNews } from './hooks/useNews'
import { useSentiment } from './hooks/useSentiment'
import type { NewsArticle } from './types/news'

function App() {
  const { 
    articles, 
    points, 
    isLoading, 
    isConfigured, 
    refresh,
    updateArticleSentiment 
  } = useNews()
  
  const { analyze, isAnalyzing } = useSentiment()

  // Callback per analizzare un articolo e aggiornare il suo sentiment
  const handleAnalyzeArticle = useCallback(async (article: NewsArticle) => {
    console.log('Analizzando articolo:', article.title)
    const result = await analyze(article)
    if (result) {
      updateArticleSentiment(article.id, result.sentiment, result.score)
      // Aggiorna anche i campi extra dell'articolo (in una vera app useresti state management)
      article.sentiment = result.sentiment
      article.sentimentScore = result.score
      article.category = result.category
      article.keyPhrases = result.keyPhrases
      article.aiSummary = result.summary
    }
  }, [analyze, updateArticleSentiment])

  return (
    <MainLayout 
      header={
        <Header 
          newsCount={articles.length}
          onRefresh={refresh}
          isLoading={isLoading}
        />
      }
    >
 
    <Globe 
      className="w-full h-full" 
      newsPoints={points}
      isLoading={isLoading}
      onAnalyzeArticle={handleAnalyzeArticle}
      isAnalyzing={isAnalyzing}
    />
      
    </MainLayout>
  )
}

export default App
