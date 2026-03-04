import { Globe } from './components/Globe'
import { MainLayout } from './components/layout/MainLayout'
import { Header } from './components/layout/Header'
import { AnimatedBackground } from './components/AnimatedBackground'
import { useNews } from './hooks/useNews'

function App() {
  const { 
    articles, 
    points, 
    isLoading, 
    isCategorizing,
    categorizationProgress,
    refresh,
  } = useNews({ autoCategorize: true })

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
