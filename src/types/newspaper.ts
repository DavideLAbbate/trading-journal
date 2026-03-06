// Types for the 3D newspaper system

export type SectionType =
  | 'headline'
  | 'article'
  | 'market-ticker'
  | 'data-widget'
  | 'quote'
  | 'image-block'
  | 'column-grid'
  | 'stats-row'
  | 'divider'

export interface MarketData {
  symbol: string
  name: string
  value: string
  change: string
  changePercent: string
  direction: 'up' | 'down' | 'flat'
}

export interface ArticleBlock {
  title: string
  subtitle?: string
  body: string
  author?: string
  category?: string
  imageUrl?: string
}

export interface StatItem {
  label: string
  value: string
  unit?: string
  trend?: 'up' | 'down' | 'flat'
}

export interface ColumnItem {
  title: string
  body: string
  tag?: string
}

export interface PageSection {
  type: SectionType
  // headline
  headline?: string
  subheadline?: string
  kicker?: string
  // article
  article?: ArticleBlock
  // market-ticker
  markets?: MarketData[]
  // data-widget / stats-row
  stats?: StatItem[]
  // quote
  quote?: string
  attribution?: string
  // image-block
  imageCaption?: string
  imageAlt?: string
  // column-grid
  columns?: ColumnItem[]
  // layout hints
  span?: 'full' | 'half' | 'third'
  accent?: boolean
}

export interface NewspaperPage {
  id: string
  pageNumber: number
  title: string
  // front face sections
  front: PageSection[]
  // back face sections (shown when page is flipped)
  back: PageSection[]
  // optional tint for page atmosphere
  tint?: string
}

export interface NewspaperIssue {
  title: string
  edition: string
  date: string
  pages: NewspaperPage[]
}
