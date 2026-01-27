import type { ReactNode } from 'react'
import type { Page } from '../types'

interface Props {
  currentPage: Page
  onNavigate: (page: Page) => void
  children: ReactNode
}

const NAV_ITEMS: { page: Page; label: string; icon: string }[] = [
  { page: 'today', label: '今日のしば', icon: '\u{1F436}' },
  { page: 'walk', label: 'おさんぽ', icon: '\u{1F43E}' },
  { page: 'calendar', label: 'カレンダー', icon: '\u{1F4C5}' },
  { page: 'stats', label: 'グラフ', icon: '\u{1F4CA}' },
]

export default function Layout({ currentPage, onNavigate, children }: Props) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="bg-shiba text-white px-4 py-3 flex items-center gap-2 shadow-md flex-shrink-0">
        <span className="text-2xl">{'\u{1F415}'}</span>
        <h1 className="text-lg font-bold tracking-wide">しばログ</h1>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-orange-200 flex justify-around py-2 px-1 z-50">
        {NAV_ITEMS.map(({ page, label, icon }) => (
          <button
            key={page}
            onClick={() => onNavigate(page)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
              currentPage === page
                ? 'text-shiba bg-orange-50'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <span className="text-xl">{icon}</span>
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
