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

      {/* Three-column content row — fills remaining height */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left sidebar: Global Feed — lg+ only, flex column, full height */}
        {leftSidebar && (
          <aside
            className="sidebar-left bg-[var(--hud-surface)] border-r border-[var(--hud-border)]"
            style={{
              width: panelsVisible ? '18rem' : '0',
              opacity: panelsVisible ? 1 : 0,
              overflow: 'hidden',
              transition: 'width 300ms ease, opacity 300ms ease',
              zIndex: panelsVisible ? 999 : 0
            }}
          >
            {/* Fixed-width inner so content doesn't reflow during width transition */}
            <div style={{ width: '18rem', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
              {leftSidebar}
            </div>
          </aside>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-hidden relative min-w-0">
          {children}
        </main>

        {/* Right sidebar: Insights — xl+ only, flex column, full height */}
        {rightSidebar && (
          <aside
            className="sidebar-right bg-[var(--hud-surface)] border-l border-[var(--hud-border)]"
            style={{
              width: panelsVisible ? '16rem' : '0',
              opacity: panelsVisible ? 1 : 0,
              overflow: 'hidden',
              transition: 'width 300ms ease, opacity 300ms ease',
              zIndex: panelsVisible ? 999 : 0
            }}
          >
            <div style={{ width: '16rem', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
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
