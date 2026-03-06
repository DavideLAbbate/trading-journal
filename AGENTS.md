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
npx tsc --noEmit                  # Type-check only — run after every change
npx eslint src/components/Foo.tsx # Lint a single file
npm run lint -- --fix             # Auto-fix lint issues
```

**Always run `npx tsc --noEmit && npm run lint` before considering a task done.** Both must exit clean.

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
  App.tsx                  # Root: all lifted state, HUD overlay, drawers
  main.tsx                 # Entry point
  components/
    layout/
      MainLayout.tsx       # Shell: header/ticker/globe/sidebars + hudOverlay slot
      Header.tsx           # Logo, panel toggle, drawer triggers, AI status
    hud/
      GlobalFeed.tsx       # Left sidebar: searchable article feed
      InsightsPanel.tsx    # Right sidebar: sentiment stats, countries, keywords
      TopTicker.tsx        # Horizontal scrolling headline ticker
    ui/                    # Radix UI primitives + cn() + CVA
    Globe.tsx              # 3D globe (react-globe.gl); exports HudFocus, GlobeStats
    MarketImpactSidebar.tsx # AI market signal panel per article
    NewsModal.tsx          # Article detail modal
    CountryNewsModal.tsx   # Country-scoped article list modal
    newspaper/             # 3D page-flip newspaper viewer (pure CSS transforms)
    charts/
      SentimentGauge.tsx   # Recharts semicircle gauge
  hooks/
    useNews.ts             # SWR → RSS parse → AI sentiment enrichment loop
    useFetch.ts            # Generic SWR GET + SWRMutation POST/PUT/DELETE
    useLLM.ts              # Ollama health + generation hook
    useSentiment.ts        # Per-article sentiment wrapper
  lib/
    news.ts                # RSS fetch (CORS proxies), parse, cache, articlesToPoints
    sentiment.ts           # analyzeSentiment via Ollama LLM
    llm.ts                 # checkLLMHealth, chatCompletion, streamChatCompletion
    api.ts                 # axios client (baseURL = VITE_API_BASE_URL || /api)
    utils.ts               # cn() helper (clsx + tailwind-merge)
  types/
    news.ts                # NewsArticle, NewsPoint, NewsCategory, NewsFilters, NewsStats
    newspaper.ts           # NewspaperIssue, NewspaperPage, PageSection, MarketData
  styles/
    global.css             # Tailwind v4 @import, CSS variables, keyframes, custom classes
  data/                    # Static seed data (country coordinates, capitals, newspaper pages)
```

---

## HUD Overlay Architecture (critical pattern)

Sidebars are `position: absolute` at `z-index: 10`. Anything that must appear **above** them must
live in the `hudOverlay` slot of `MainLayout`, which renders at `z-index: 50`.

**Never** place a badge inside `<Globe>` or `<main>` expecting it to appear above a sidebar.

`Globe.tsx` exposes callbacks for state that surfaces above it:

```typescript
export interface HudFocus { name, code, count, sentiment, hasData, isGlobal }
export interface GlobeStats { positive, neutral, negative, countries }

onHudFocusChange?: (focus: HudFocus) => void   // country/polygon hover
onStatsChange?: (stats: GlobeStats) => void     // article sentiment counts
onMarketSidebarChange?: (open: boolean) => void // MarketImpactSidebar visibility
```

HUD badges that shift with sidebars use CSS custom properties set from JS:

```tsx
<div className="absolute top-4 pointer-events-none hud-badge-left"
  style={{ zIndex: 50, '--hud-left-offset': panelsVisible ? 'calc(18rem + 1rem)' : '1rem' } as React.CSSProperties}
>
```

`.hud-badge-left` / `.hud-badge-right` in `global.css`: mobile = `1rem`; lg+/xl+ reads the CSS var.
Sidebar widths: left `18rem` (lg+), right `16rem` (xl+). Both transition at `300ms ease`.

---

## Tailwind CSS v4 — Critical Rules

This project uses **Tailwind CSS v4** via `@tailwindcss/vite`. Key differences from v3:

- `hidden` = `display: none !important` — cannot be overridden by responsive variants. Use `lg:block` or define display in `global.css` with plain `@media`.
- **Dynamic class names** (e.g. `` `lg:${x}` ``) are not scanned — always write full static strings.
- `transition-[width,opacity]` may not compile — use `transition-all` or standard shorthands.
- For responsive sidebar `display:flex`, define in `global.css` — see `.sidebar-left` / `.sidebar-right`.
- `h-full` on a flex child requires the parent to have an explicit height; use `self-stretch` when unsure.
- For visible dividers, use `<div className="w-px bg-[var(--hud-border)]" />` — not `border-r` with `h-full`.
- Scrollable HUD containers: add class `.hud-scrollbar` (defined in `global.css`).

---

## TypeScript

Active flags: `strict`, `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`,
`noFallthroughCasesInSwitch`, `erasableSyntaxOnly`, `noUncheckedSideEffectImports`.

- `interface` for object shapes; `type` for unions, aliases, mapped types.
- Never use `any`. Use `unknown` + type guard when the shape is genuinely unknown.
- `import type` is **required** for type-only imports (`verbatimModuleSyntax` enforces this).
- Unused variables are compile errors — remove or prefix with `_` if intentionally unused.

```typescript
import type { NewsArticle } from '../types/news'

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

- **Named exports only.** Exception: `App.tsx` uses `export default`.
- Props interface declared immediately before the component function.
- `displayName` required on every `forwardRef` component.
- UI primitives in `src/components/ui/` wrap Radix with `cn()` and expose `className` for overrides.
- Use CVA (`class-variance-authority`) for components with multiple visual variants.
- `useCallback` dependency arrays must be exhaustive (`react-hooks/exhaustive-deps` is an ESLint error).

---

## Hooks

- Prefix: `use*`. File name matches the hook name (`useNews.ts` exports `useNews`).
- Return a named object, not a tuple (except SWR/SWRMutation passthrough).
- SWR key `null` disables fetching. Use `enabled ? 'key' : null` pattern.
- News data flow: `useNews` → SWR → `fetchGlobalNews()` → AI categorization loop → `mergedArticles`.

---

## CSS / Styling

- All colour tokens are CSS custom properties on `:root` in `global.css`. Never hardcode hex in JSX.
- Reference tokens via Tailwind arbitrary syntax: `text-[var(--foreground)]`.
- `cn()` from `src/lib/utils.ts` for conditional class merging.
- Custom classes live in `global.css`, never in component files.
- Inline `style` is acceptable **only** for JS-driven dynamic values or CSS custom properties.

| Token | Value |
|---|---|
| `--background` | `#0b132b` (Prussian blue) |
| `--hud-surface` | `#0d1526` |
| `--hud-border` | `rgba(91,192,190,0.35)` |
| `--tropical-teal` | `#5bc0be` (primary accent) |
| `--neon-ice` | `#6fffe9` (strong accent) |
| `--foreground` | `#e8f4f8` |
| `--muted-foreground` | `#8ba5b5` |

---

## Error Handling

- Async functions: `try/catch`, log with `console.error('context:', err)`, return a safe fallback.
- Fallbacks: lists → `[]`, nullable objects → `null`, booleans → `false`.
- RSS fetching retries across multiple CORS proxies in sequence (see `lib/news.ts`).

---

## Data Fetching Patterns

| Use case | Tool |
|---|---|
| Read (GET) | `useFetch<T>(url)` — SWR, `revalidateOnFocus: false` |
| Write (POST) | `usePost<T, P>(url)` — SWRMutation |
| RSS / external | Direct `fetch` inside SWR fetcher in `lib/news.ts` |
| LLM / Ollama | `lib/llm.ts` → `lib/sentiment.ts` → `useNews` loop |

---

## Naming Conventions

| Artefact | Convention | Example |
|---|---|---|
| Component file | PascalCase | `GlobalFeed.tsx` |
| Hook file | camelCase `use*` | `useNews.ts` |
| Lib/util file | camelCase | `news.ts`, `utils.ts` |
| Type/interface | PascalCase | `NewsArticle`, `HudFocus` |
| CSS custom class | kebab-case | `.feed-row`, `.hud-badge-left` |
| CSS variable | `--kebab-case` | `--hud-border-strong` |

---

## Environment Variables

Prefix: `VITE_`. Access via `import.meta.env.VITE_XXX`. Defined in `.env` (git-ignored).

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | `/api` | REST API base URL |
| `VITE_LLM_BASE_URL` | `http://localhost:11434` | Ollama base URL |
| `VITE_LLM_MODEL` | `llama3.2` | Ollama model for sentiment/signals |
