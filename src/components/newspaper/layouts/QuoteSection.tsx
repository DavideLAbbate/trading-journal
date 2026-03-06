interface QuoteSectionProps {
  quote: string
  attribution?: string
}

export function QuoteSection({ quote, attribution }: QuoteSectionProps) {
  return (
    <figure className="relative border-l-4 border-[var(--tropical-teal)] pl-4 py-2 bg-[var(--hud-surface)]/30 my-3">
      <span className="absolute -top-2 -left-1 text-[var(--tropical-teal)] text-5xl font-serif leading-none opacity-60">
        "
      </span>
      <blockquote className="text-[var(--foreground)] italic text-base leading-relaxed pr-2">
        {quote}
      </blockquote>
      {attribution && (
        <figcaption className="text-[var(--muted-foreground)] text-[0.7rem] font-mono mt-2 text-right">
          — {attribution}
        </figcaption>
      )}
    </figure>
  )
}
