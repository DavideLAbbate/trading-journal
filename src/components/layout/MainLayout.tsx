import type { ReactNode } from 'react'

interface MainLayoutProps {
  children: ReactNode
  header?: ReactNode
  sidebar?: ReactNode
  footer?: ReactNode
}

export function MainLayout({ children, header, sidebar, footer }: MainLayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-[var(--background)]">
      {/* Header slot */}
      {header && (
        <header className="flex-shrink-0 border-b border-[var(--border)] bg-[var(--card)]">
          {header}
        </header>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar slot */}
        {sidebar && (
          <aside className="flex-shrink-0 border-r border-[var(--border)] bg-[var(--card)] overflow-y-auto">
            {sidebar}
          </aside>
        )}

        {/* Main content area */}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>

      {/* Footer slot */}
      {footer && (
        <footer className="flex-shrink-0 border-t border-[var(--border)] bg-[var(--card)]">
          {footer}
        </footer>
      )}
    </div>
  )
}
