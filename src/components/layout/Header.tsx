export function Header() {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-lg font-semibold text-[var(--foreground)]">Trading Journal</h1>
      </div>
      
      <nav className="flex items-center gap-4">
        <button className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
          Dashboard
        </button>
        <button className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
          Analytics
        </button>
        <button className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
          Settings
        </button>
      </nav>
    </div>
  )
}
