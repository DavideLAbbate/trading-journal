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
        'newspaper-paper-texture newspaper-paper-grain',
        className
      )}
      style={{
        padding: '1.5rem',
        backgroundColor: '#121927',
        backgroundImage: `
          linear-gradient(180deg, rgba(238, 242, 245, 0.06) 0%, rgba(255,255,255,0.01) 7%, rgba(0,0,0,0.025) 100%),
          radial-gradient(circle at 18% 14%, rgba(248, 244, 232, 0.035) 0%, transparent 28%),
          radial-gradient(circle at 82% 84%, rgba(248, 244, 232, 0.025) 0%, transparent 24%),
          linear-gradient(135deg, rgba(255,255,255,0.015) 0%, transparent 48%, rgba(0,0,0,0.025) 100%)
        `,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -1px 0 rgba(0,0,0,0.18)',
      }}
    >
      <div className="newspaper-page-edge" />

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
      <div className="relative z-[1] h-full overflow-y-auto hud-scrollbar pr-2">
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
