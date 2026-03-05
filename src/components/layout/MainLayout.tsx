import type { ReactNode } from 'react'

interface MainLayoutProps {
  children: ReactNode
  header?: ReactNode
  leftSidebar?: ReactNode
  rightSidebar?: ReactNode
  footer?: ReactNode
  ticker?: ReactNode
}

export function MainLayout({ children, header, leftSidebar, rightSidebar, footer, ticker }: MainLayoutProps) {
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

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar slot - Global Feed */}
        {leftSidebar && (
          <aside className="flex-shrink-0 w-72 border-r border-[var(--hud-border)] bg-[var(--hud-surface)] overflow-y-auto hidden lg:block">
            {leftSidebar}
          </aside>
        )}

        {/* Main content area */}
        <main className="flex-1 overflow-hidden relative">
          {children}
        </main>

        {/* Right Sidebar slot - Insights */}
        {rightSidebar && (
          <aside className="flex-shrink-0 w-64 border-l border-[var(--hud-border)] bg-[var(--hud-surface)] overflow-y-auto hidden xl:block">
            {rightSidebar}
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
