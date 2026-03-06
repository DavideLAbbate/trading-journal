import type { ReactNode } from 'react'

interface MainLayoutProps {
  children: ReactNode
  header?: ReactNode
  leftSidebar?: ReactNode
  rightSidebar?: ReactNode
  footer?: ReactNode
  ticker?: ReactNode
  hudOverlay?: ReactNode
  panelsVisible?: boolean
}

export function MainLayout({ children, header, leftSidebar, rightSidebar, footer, ticker, hudOverlay, panelsVisible = true }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]" style={{ minHeight: '100svh' }}>
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

      {/* Content area — globe fills all available space, sidebars overlay on top */}
      <div className="relative flex-1 overflow-hidden min-h-0">

        {/* Main content: full width, globe fills everything */}
        <main className="absolute inset-0 overflow-hidden">
          {children}
        </main>

        {/* Left sidebar overlay — lg+ only, slides in from left without pushing content */}
        {leftSidebar && (
          <aside
            className="sidebar-left absolute top-0 left-0 bottom-0 bg-[var(--hud-surface)] border-r border-[var(--hud-border)]"
            style={{
              width: '18rem',
              transform: panelsVisible ? 'translateX(0)' : 'translateX(-100%)',
              opacity: panelsVisible ? 1 : 0,
              overflow: 'hidden',
              transition: 'transform 300ms ease, opacity 300ms ease',
              zIndex: 10,
            }}
          >
            <div style={{ width: '18rem', display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
              {leftSidebar}
            </div>
          </aside>
        )}

        {/* Right sidebar overlay — xl+ only, slides in from right without pushing content */}
        {rightSidebar && (
          <aside
            className="sidebar-right absolute top-0 right-0 bottom-0 bg-[var(--hud-surface)] border-l border-[var(--hud-border)]"
            style={{
              width: '16rem',
              transform: panelsVisible ? 'translateX(0)' : 'translateX(100%)',
              opacity: panelsVisible ? 1 : 0,
              overflow: 'hidden',
              transition: 'transform 300ms ease, opacity 300ms ease',
              zIndex: 10,
            }}
          >
            <div style={{ width: '16rem', display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
              {rightSidebar}
            </div>
          </aside>
        )}

        {/* HUD overlay — always on top of sidebars, pointer-events pass-through on container */}
        {hudOverlay && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 50 }}
          >
            {hudOverlay}
          </div>
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
