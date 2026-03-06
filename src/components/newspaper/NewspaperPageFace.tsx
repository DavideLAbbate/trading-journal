import type { PageSection } from '../../types/newspaper'
import { SectionRenderer } from './layouts/SectionRenderer'
import { cn } from '../../lib/utils'

interface NewspaperPageFaceProps {
  sections: PageSection[]
  pageNumber: number
  isBack?: boolean
  className?: string
  tint?: string
}

export function NewspaperPageFace({
  sections,
  pageNumber,
  isBack,
  className,
  tint,
}: NewspaperPageFaceProps) {
  return (
    <div
      className={cn(
        'relative h-full overflow-hidden',
        'border border-[var(--hud-border)]',
        'newspaper-paper-texture',
        className
      )}
      style={{
        padding: '1.5rem',
        backgroundColor: '#0f1a2e',
        // Subtle paper texture via CSS noise pattern
        backgroundImage: `
          radial-gradient(ellipse at 20% 20%, rgba(255, 248, 230, 0.04) 0%, transparent 60%),
          radial-gradient(ellipse at 80% 80%, rgba(255, 248, 230, 0.02) 0%, transparent 50%),
          linear-gradient(135deg, rgba(255,255,255,0.015) 0%, transparent 50%, rgba(0,0,0,0.02) 100%)
        `,
      }}
    >
      {/* Tint overlay for page atmosphere */}
      {tint && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: tint,
            opacity: 0.15,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}
      {/* Content area with scroll if needed */}
      <div className="h-full overflow-y-auto hud-scrollbar pr-2">
        {sections.map((section, idx) => (
          <SectionRenderer key={idx} section={section} />
        ))}
      </div>

      {/* Page number */}
      <div
        className={cn(
          'absolute bottom-3 text-[var(--muted-foreground)] text-xs font-mono',
          isBack ? 'left-4' : 'right-4'
        )}
      >
        {pageNumber}
      </div>
    </div>
  )
}
