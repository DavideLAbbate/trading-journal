import { CesiumGlobe } from './components/CesiumGlobe'
import { MainLayout } from './components/layout/MainLayout'
import { Header } from './components/layout/Header'

function App() {
  return (
    <MainLayout header={<Header />}>
      <CesiumGlobe className="w-full h-full" />
    </MainLayout>
  )
}

export default App
