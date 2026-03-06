import type { ArticleBlock } from '../../../types/newspaper'
import { cn } from '../../../lib/utils'

interface ArticleSectionProps {
  article: ArticleBlock
  span?: 'full' | 'half' | 'third'
}

export function ArticleSection({ article, span = 'full' }: ArticleSectionProps) {
  const spanClasses = {
    full: 'col-span-full',
    half: 'col-span-1 md:col-span-2',
    third: 'col-span-1',
  }

  return (
    <article className={cn('border-t border-[var(--hud-border)] pt-3', spanClasses[span])}>
      {article.category && (
        <span className="inline-block bg-[var(--tropical-teal)]/20 text-[var(--tropical-teal)] text-[0.6rem] px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
          {article.category}
        </span>
      )}
      <h2 className="text-[var(--foreground)] font-bold text-base mt-2 leading-tight">
        {article.title}
      </h2>
      {article.subtitle && (
        <p className="text-[var(--muted-foreground)] text-[0.8rem] italic mt-1">
          {article.subtitle}
        </p>
      )}
      <p className="text-[var(--muted-foreground)] text-[0.75rem] leading-[1.6] mt-2 line-clamp-4">
        {article.body}
      </p>
      {article.author && (
        <p className="text-[var(--muted-foreground)] text-[0.65rem] font-mono mt-3">
          BY {article.author.toUpperCase()}
        </p>
      )}
    </article>
  )
}
