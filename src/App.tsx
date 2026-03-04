import { Globe } from './components/Globe'
import { MainLayout } from './components/layout/MainLayout'
import { Header } from './components/layout/Header'

function App() {
  return (
    <MainLayout header={<Header />}>
      <Globe className="w-full h-full" />
    </MainLayout>
  )
}

export default App
