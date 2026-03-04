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
      {!isConfigured ? (
        <div className="flex flex-col items-center justify-center h-full gap-6 p-8 text-center">
          <div className="w-20 h-20 rounded-2xl bg-[var(--muted)] flex items-center justify-center">
            <svg className="w-10 h-10 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="max-w-md space-y-2">
            <h2 className="text-xl font-semibold text-[var(--foreground)]">
              API Key Required
            </h2>
            <p className="text-[var(--muted-foreground)]">
              Per visualizzare le news live, configura la tua API key di NewsAPI.org.
              Aggiungi <code className="px-1.5 py-0.5 rounded bg-[var(--muted)] text-sm">VITE_NEWS_API_KEY</code> al file .env
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[var(--muted)] text-sm text-[var(--muted-foreground)] font-mono">
            VITE_NEWS_API_KEY=your_api_key_here
          </div>
          <a 
            href="https://newsapi.org/register" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[var(--primary)] hover:underline text-sm"
          >
            Ottieni una API key gratuita su newsapi.org
          </a>
        </div>
      ) : (
        <Globe 
          className="w-full h-full" 
          newsPoints={points}
          isLoading={isLoading}
          onAnalyzeArticle={handleAnalyzeArticle}
          isAnalyzing={isAnalyzing}
        />
      )}
    </MainLayout>
  )
}

export default App
