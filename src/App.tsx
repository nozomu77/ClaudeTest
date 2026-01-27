import { useState } from 'react'
import './App.css'
import type { Page } from './types'
import Layout from './components/Layout'
import TodayShiba from './pages/TodayShiba'
import WalkTracker from './pages/WalkTracker'
import Calendar from './pages/Calendar'
import Stats from './pages/Stats'

function App() {
  const [page, setPage] = useState<Page>('today')

  return (
    <Layout currentPage={page} onNavigate={setPage}>
      {page === 'today' && <TodayShiba />}
      {page === 'walk' && <WalkTracker />}
      {page === 'calendar' && <Calendar />}
      {page === 'stats' && <Stats />}
    </Layout>
  )
}

export default App
