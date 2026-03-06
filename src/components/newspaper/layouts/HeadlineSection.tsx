import { cn } from '../../../lib/utils'

interface HeadlineSectionProps {
  headline: string
  subheadline?: string
  kicker?: string
  accent?: boolean
}

export function HeadlineSection({
  headline,
  subheadline,
  kicker,
  accent = false,
}: HeadlineSectionProps) {
  const headlineSize = headline.length > 50
    ? 'text-2xl'
    : headline.length > 30
      ? 'text-3xl'
      : 'text-4xl'

  return (
    <div
      className={cn(
        'py-3 px-2',
        accent && 'border-l-4 border-[var(--tropical-teal)] bg-[var(--hud-surface)]/50 pl-4'
      )}
    >
      {kicker && (
        <span className="text-[var(--tropical-teal)] text-[0.65rem] tracking-[0.2em] uppercase font-mono">
          {kicker}
        </span>
      )}
      <h1
        className={cn(
          'font-black text-[var(--foreground)] leading-[1.1] mt-1',
          headlineSize
        )}
      >
        {headline}
      </h1>
      {subheadline && (
        <p className="text-[var(--muted-foreground)] text-sm font-normal mt-2 max-w-md">
          {subheadline}
        </p>
      )}
    </div>
  )
}
