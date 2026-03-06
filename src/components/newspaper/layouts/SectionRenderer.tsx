import type { PageSection } from '../../../types/newspaper'
import { HeadlineSection } from './HeadlineSection'
import { ArticleSection } from './ArticleSection'
import { MarketTickerSection } from './MarketTickerSection'
import { DataWidgetSection } from './DataWidgetSection'
import { QuoteSection } from './QuoteSection'
import { ColumnGridSection } from './ColumnGridSection'
import { StatsRowSection } from './StatsRowSection'

interface SectionRendererProps {
  section: PageSection
}

export function SectionRenderer({ section }: SectionRendererProps) {
  switch (section.type) {
    case 'headline':
      return (
        <HeadlineSection
          headline={section.headline ?? ''}
          subheadline={section.subheadline}
          kicker={section.kicker}
          accent={section.accent}
        />
      )

    case 'article':
      if (!section.article) return null
      return (
        <ArticleSection
          article={section.article}
          span={section.span}
        />
      )

    case 'market-ticker':
      if (!section.markets) return null
      return <MarketTickerSection markets={section.markets} />

    case 'data-widget':
      if (!section.stats) return null
      return <DataWidgetSection stats={section.stats} />

    case 'quote':
      return (
        <QuoteSection
          quote={section.quote ?? ''}
          attribution={section.attribution}
        />
      )

    case 'column-grid':
      if (!section.columns) return null
      return <ColumnGridSection columns={section.columns} />

    case 'stats-row':
      if (!section.stats) return null
      return <StatsRowSection stats={section.stats} />

    case 'divider':
      return (
        <hr className="border-[var(--hud-border)] my-3 opacity-50" />
      )

    case 'image-block':
      return (
        <div className="relative bg-[var(--hud-surface)] border border-[var(--hud-border)] rounded-sm p-2 min-h-[120px] flex items-center justify-center">
          <div className="text-[var(--muted-foreground)] text-xs italic">
            {section.imageAlt || 'Image'}
          </div>
          {section.imageCaption && (
            <figcaption className="absolute bottom-2 left-2 right-2 text-[var(--muted-foreground)] text-[0.65rem] italic text-center">
              {section.imageCaption}
            </figcaption>
          )}
        </div>
      )

    default:
      return null
  }
}
