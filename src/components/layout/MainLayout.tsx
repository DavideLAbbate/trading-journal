import type { ReactNode } from 'react'

interface MainLayoutProps {
  children: ReactNode
  header?: ReactNode
  leftSidebar?: ReactNode
  rightSidebar?: ReactNode
  footer?: ReactNode
  ticker?: ReactNode
  panelsVisible?: boolean
}

export function MainLayout({ children, header, leftSidebar, rightSidebar, footer, ticker, panelsVisible = true }: MainLayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-[var(--background)]">
      {/* Header slot */}
      {header && (
        <header className="flex-shrink-0 border-b border-[var(--hud-border)] bg-[var(--hud-surface)]">
          {header}
        </header>
      )}

      {/* Top Ticker slot */}
      {ticker && (
        <div className="flex-shrink-0 bg-[var(--hud-surface)] border-b border-[var(--hud-border)]">
          {ticker}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Left Sidebar slot - Global Feed */}
        {leftSidebar && (
          <aside
            className={`flex-shrink-0 border-r border-[var(--hud-border)] bg-[var(--hud-surface)] overflow-y-auto hidden lg:block transition-all duration-300 min-h-0 min-w-0 h-full ${
              panelsVisible ? 'w-72 opacity-100' : 'w-0 opacity-0 overflow-hidden border-r-0'
            }`}
          >
            <div className="w-72 h-full min-h-0">
              {leftSidebar}
            </div>
          </aside>
        )}

        {/* Main content area */}
        <main className="flex-1 overflow-hidden relative">
          {children}
        </main>

        {/* Right Sidebar slot - Insights */}
        {rightSidebar && (
          <aside
            className={`flex-shrink-0 border-l border-[var(--hud-border)] bg-[var(--hud-surface)] overflow-y-auto hidden xl:block transition-all duration-300 min-h-0 min-w-0 h-full ${
              panelsVisible ? 'w-64 opacity-100' : 'w-0 opacity-0 overflow-hidden border-l-0'
            }`}
          >
            <div className="w-64 h-full min-h-0">
              {rightSidebar}
            </div>
          </aside>
        )}
      </div>

      {/* Footer slot */}
      {footer && (
        <footer className="flex-shrink-0 border-t border-[var(--hud-border)] bg-[var(--hud-surface)]">
          {footer}
        </footer>
      )}
    </div>
  )
}
