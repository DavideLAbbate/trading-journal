# AGENTS.md — Trading Journal Developer Guide

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Vite dev server with HMR (http://localhost:5173)
npm run build        # tsc -b && vite build (type-check + bundle)
npm run lint         # ESLint on entire project
npm run preview      # Preview production build
```

### Targeted checks (prefer these before committing)

```bash
npx tsc --noEmit                  # Type-check only, no output
npx eslint src/components/Foo.tsx # Lint a single file
npm run lint -- --fix             # Auto-fix lint issues
```

### Testing

No test framework is configured. No test files exist. If Vitest is added:

```bash
# package.json: "test": "vitest run"
npm test
npm test -- src/hooks/useNews.test.ts   # single file
npm test -- -t "filter by sentiment"    # single describe/test
```

---

## Architecture Overview

```
src/
  App.tsx                  # Root: wires useNews → MainLayout + drawers
  main.tsx                 # Entry point
  components/
    layout/
      MainLayout.tsx       # Three-column shell (left rail | main | right rail)
      Header.tsx           # Logo, search, panel toggle, drawer triggers
    hud/
      GlobalFeed.tsx       # Left sidebar: scrollable article list
      InsightsPanel.tsx    # Right sidebar: sentiment stats, top countries, keywords
      TopTicker.tsx        # Horizontal scrolling news ticker
    ui/                    # Radix UI primitives wrapped with cn() + CVA
      button.tsx           # CVA variants: default/destructive/outline/secondary/ghost/link
      dialog.tsx           # DialogContent (centered modal) + DrawerContent (side panel)
      tabs.tsx, tooltip.tsx, scroll-area.tsx, skeleton.tsx, card.tsx, badge.tsx
    Globe.tsx              # react-globe.gl 3D globe with marker overlays
    MarketImpactSidebar.tsx # Slide-in panel on globe marker click
    NewsModal.tsx          # Article detail modal
    CountryNewsModal.tsx   # Country-scoped article list modal
    AnimatedBackground.tsx # Canvas star field
    charts/
      SentimentGauge.tsx   # Recharts gauge
  hooks/
    useNews.ts             # SWR fetch → RSS parse → AI sentiment enrichment
    useFetch.ts            # Generic SWR GET + SWRMutation POST/PUT/DELETE
    useLLM.ts              # Ollama health + generation hook
    useSentiment.ts        # Per-article sentiment wrapper
  lib/
    news.ts                # RSS fetch (CORS proxies), parse, cache, articlesToPoints
    sentiment.ts           # analyzeSentiment via Ollama LLM
    llm.ts                 # checkLLMHealth, raw LLM call
    api.ts                 # axios client (baseURL = VITE_API_BASE_URL || /api)
    utils.ts               # cn() helper (clsx + tailwind-merge)
  types/
    news.ts                # NewsArticle, NewsPoint, NewsCategory, NewsFilters, NewsStats
  styles/
    global.css             # Tailwind v4 @import, CSS variables, keyframes, custom classes
  data/                    # Static seed data (if any)
```

---

## Tailwind CSS v4 — Critical Rules

This project uses **Tailwind CSS v4** via `@tailwindcss/vite`. Behaviour differs from v3:

- `hidden` compiles to `display: none !important`. It **cannot** be overridden by inline styles or responsive variants like `lg:flex`. Never combine `hidden` with `lg:flex` or `xl:flex` expecting flex layout — use `lg:block` (gives `display:block`, not flex).
- **Dynamic class names inside template literals are not always scanned.** If a class is only assembled at runtime (e.g. `` `lg:${x}` ``), it will not appear in the compiled CSS. Write full class names as static strings.
- Arbitrary transition values like `transition-[width,opacity]` may not compile. Use `transition-all`, `transition-opacity`, or standard shorthand utilities instead.
- For responsive `display:flex` sidebars, define the class in `global.css` directly (plain CSS `@media` block) rather than using Tailwind responsive variants. See `.sidebar-left` / `.sidebar-right` in `src/styles/global.css` as the established pattern.

### Sidebar height pattern

Desktop sidebars require an unbroken `height:100%` chain. The established working pattern:

```tsx
// global.css defines .sidebar-left { display:none; flex-direction:column; height:100% }
// @media(min-width:1024px) { .sidebar-left { display:flex } }

<aside className="sidebar-left ..." style={{ width: panelsVisible ? '18rem' : '0', overflow: 'hidden' }}>
  {/* Fixed-width inner so content doesn't reflow during width transition */}
  <div style={{ width: '18rem', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
    {/* Component root must use: className="flex flex-col h-full" or flex-1 min-h-0 */}
    {/* Scrollable child: className="flex-1 min-h-0 overflow-y-auto" */}
    <Content />
  </div>
</aside>
```

---

## TypeScript

- **Strict mode** + `noUnusedLocals` + `noUnusedParameters` + `verbatimModuleSyntax`.
- `interface` for object shapes; `type` for unions, aliases, mapped types.
- Never use `any`. Use `unknown` + type guard when the shape is genuinely unknown.
- `import type` is **required** for type-only imports (enforced by `verbatimModuleSyntax`).

```typescript
import type { NewsArticle, NewsPoint } from '../types/news'

interface FeedProps {
  articles: NewsArticle[]
  onArticleClick: (article: NewsArticle) => void
}
```

---

## Import Order

1. External libraries (`react`, `swr`, `lucide-react`, …)
2. Internal lib/utils (`../../lib/utils`, `../../lib/news`)
3. Components (`./Button`, `../layout/Header`)
4. Types — always `import type` (`../../types/news`)

No path aliases (`@/`) — use relative paths throughout.

---

## Component Conventions

- **Named exports only.** No default exports for components.
- Props interface declared immediately before the component function.
- `displayName` required on `forwardRef` components (see `button.tsx`).
- UI primitives in `src/components/ui/` wrap Radix UI with `cn()` and expose `className` for overrides.
- CVA (`class-variance-authority`) for components with multiple visual variants.

```typescript
interface BadgeProps {
  sentiment: 'positive' | 'negative' | 'neutral'
  children: React.ReactNode
}

export function Badge({ sentiment, children }: BadgeProps) {
  return <span className={cn(badgeVariants({ sentiment }))}>{children}</span>
}
```

---

## Hooks

- Prefix: `use*`. File name matches hook name (`useNews.ts` exports `useNews`).
- Return a named object, not a tuple (except SWR/SWRMutation passthrough).
- Standard return shape for data hooks:

```typescript
interface UseXxxReturn {
  data: Xxx[]
  isLoading: boolean
  isError: boolean
  error: Error | null
  refresh: () => void
}
```

- SWR key is `null` to disable fetching (not `undefined`, not `false`).
- News data flows: `useNews` → SWR fetches RSS → `fetchGlobalNews()` in `lib/news.ts` → merges AI sentiment via `localArticles` Map → returns `mergedArticles`.

---

## CSS / Styling

- All colour tokens are CSS custom properties on `:root` in `global.css`. Never hardcode hex values in JSX — use `var(--token-name)` via Tailwind arbitrary syntax `text-[var(--foreground)]`.
- `cn()` from `src/lib/utils.ts` for conditional class merging (clsx + tailwind-merge).
- Custom animation classes (`.animate-ticker`, `.feed-row`, `.sidebar-left`, etc.) live in `global.css`, not in component files.
- Inline `style` is acceptable **only** for animated/dynamic numeric values (width, opacity transitions) or when Tailwind cannot express the value statically.

### Key design tokens

| Token | Value |
|---|---|
| `--background` | `#0b132b` (Prussian blue) |
| `--hud-surface` | `#0d1526` |
| `--hud-border` | `rgba(91,192,190,0.35)` |
| `--tropical-teal` | `#5bc0be` (primary accent) |
| `--neon-ice` | `#6fffe9` (strong accent) |
| `--foreground` | `#e8f4f8` |

---

## Error Handling

- Async functions: `try/catch`, log with `console.error('context:', err)`, return safe fallback.
- Lists → `[]`, nullable objects → `null`, booleans → `false`.
- RSS fetching retries across multiple CORS proxies in sequence (see `lib/news.ts`).

```typescript
try {
  const result = await analyzeSentiment(article)
  return result
} catch (err) {
  console.error('Sentiment analysis failed:', err)
  return null
}
```

---

## Data Fetching Patterns

| Use case | Tool |
|---|---|
| Read (GET) | `useFetch<T>(url)` — SWR with `revalidateOnFocus: false` |
| Write (POST) | `usePost<T, P>(url)` — SWRMutation |
| Update (PUT) | `usePut<T, P>(url)` |
| Delete | `useDelete<T>(url)` |
| RSS / external | Direct `fetch` inside SWR fetcher in `lib/news.ts` |
| LLM / Ollama | `lib/llm.ts` → `lib/sentiment.ts` → `useNews` categorization loop |

SWR deduplication key: `null` disables the request. Use `enabled && condition ? 'key' : null`.

---

## Environment Variables

Prefix: `VITE_`. Access: `import.meta.env.VITE_XXX`. Defined in `.env` (git-ignored).

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | REST API base URL (defaults to `/api`) |

---

## Naming Conventions

| Artefact | Convention | Example |
|---|---|---|
| Component file | PascalCase | `GlobalFeed.tsx` |
| Hook file | camelCase `use*` | `useNews.ts` |
| Lib/util file | camelCase | `news.ts`, `utils.ts` |
| Type/interface | PascalCase | `NewsArticle`, `UseNewsReturn` |
| CSS custom class | kebab-case | `.feed-row`, `.sidebar-left` |
| CSS variable | `--kebab-case` | `--hud-border-strong` |
