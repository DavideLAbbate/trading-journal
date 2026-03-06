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
npx tsc --noEmit                  # Type-check only, no output — run after every change
npx eslint src/components/Foo.tsx # Lint a single file
npm run lint -- --fix             # Auto-fix lint issues
```

**Always run `npx tsc --noEmit && npm run lint` before considering a task done.** Both must exit clean (zero output).

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
  App.tsx                  # Root: orchestrates all lifted state, HUD overlay, drawers
  main.tsx                 # Entry point
  components/
    layout/
      MainLayout.tsx       # Shell: header / ticker / content area with sidebar overlays + hudOverlay slot
      Header.tsx           # Logo, panel toggle (desktop), drawer triggers (mobile), AI status, refresh
    hud/
      GlobalFeed.tsx       # Left sidebar: scrollable article list with custom scrollbar
      InsightsPanel.tsx    # Right sidebar: sentiment stats, top countries, keywords
      TopTicker.tsx        # Horizontal scrolling news ticker with country badges
    ui/                    # Radix UI primitives wrapped with cn() + CVA
      button.tsx           # CVA variants: default/destructive/outline/secondary/ghost/link
      dialog.tsx           # DialogContent (centered modal) + DrawerContent (side panel)
      tabs.tsx, tooltip.tsx, scroll-area.tsx, skeleton.tsx, card.tsx, badge.tsx
    Globe.tsx              # 3D globe — exports HudFocus, GlobeStats interfaces + callbacks
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
  data/                    # Static seed data (country coordinates, etc.)
```

---

## HUD Overlay Architecture (critical pattern)

Sidebars are `position: absolute` overlays at `z-index: 10`. Any HUD element that must appear **above** the sidebars must live in the `hudOverlay` slot of `MainLayout`, which renders at `z-index: 50`.

**Never** place a badge/indicator inside `<Globe>` or `<main>` and expect it to appear above a sidebar — `<main>` has no explicit z-index and loses to `z-index: 10`.

### Lifting state from Globe

`Globe.tsx` exposes callbacks for state that needs to surface above it:

```typescript
// Exported interfaces
export interface HudFocus { name, code, count, sentiment, hasData, isGlobal }
export interface GlobeStats { positive, neutral, negative, countries }

// Props
onHudFocusChange?: (focus: HudFocus) => void   // country hover/polygon hover
onStatsChange?: (stats: GlobeStats) => void     // article sentiment counts
onMarketSidebarChange?: (open: boolean) => void // MarketImpactSidebar visibility
```

These are consumed in `App.tsx` and rendered in `hudOverlay`.

### HUD badge positioning (sidebar-aware)

Badges that must shift with the sidebar use CSS custom properties + media-query classes:

```tsx
// In App.tsx
<div
  className="absolute top-4 pointer-events-none hud-badge-left"
  style={{
    zIndex: 50,
    '--hud-left-offset': panelsVisible ? 'calc(18rem + 1rem)' : '1rem',
    transition: 'left 300ms ease',
  } as React.CSSProperties}
>
```

`.hud-badge-left` and `.hud-badge-right` are defined in `global.css`:
- Mobile: always `left/right: 1rem` (no sidebar)
- `lg+` / `xl+`: reads `--hud-left-offset` / `--hud-right-offset`

Sidebar widths: left = `18rem` (lg+), right = `16rem` (xl+). Both transition at `300ms ease`.

---

## Tailwind CSS v4 — Critical Rules

This project uses **Tailwind CSS v4** via `@tailwindcss/vite`. Behaviour differs from v3:

- `hidden` compiles to `display: none !important`. It **cannot** be overridden by inline styles or responsive variants like `lg:flex`. Use `lg:block` for block, or define display in `global.css` with `@media`.
- **Dynamic class names** assembled at runtime (e.g. `` `lg:${x}` ``) are not scanned. Write full static class strings.
- Arbitrary transition values like `transition-[width,opacity]` may not compile. Use `transition-all` or standard shorthands.
- For responsive `display:flex` sidebars, define in `global.css` with plain `@media` blocks — see `.sidebar-left` / `.sidebar-right`.
- `h-full` on a flex child requires the parent to have an explicit height. When in doubt use `self-stretch` or explicit `height` via inline style. **Do not** rely on `h-full` with `border-r`/`border-l` for visible dividers — use a separate `<div className="w-px h-4 bg-[var(--hud-border)]" />` element instead.
- Custom scrollbar: use class `.hud-scrollbar` (defined in `global.css`) on any scrollable container inside a HUD panel.

---

## TypeScript

Compiler flags active: `strict`, `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`, `noFallthroughCasesInSwitch`, `erasableSyntaxOnly`.

- `interface` for object shapes; `type` for unions, aliases, mapped types.
- Never use `any`. Use `unknown` + type guard when the shape is genuinely unknown.
- `import type` is **required** for type-only imports (enforced by `verbatimModuleSyntax`).
- Unused variables are compile errors — remove or prefix with `_` if intentionally unused.

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
- `useCallback` dependency arrays must be complete — the React Compiler lint rule `react-hooks/exhaustive-deps` is enforced as an error.

---

## Hooks

- Prefix: `use*`. File name matches hook name (`useNews.ts` exports `useNews`).
- Return a named object, not a tuple (except SWR/SWRMutation passthrough).
- SWR key is `null` to disable fetching (not `undefined`, not `false`).
- To force a real re-fetch bypassing cache: `mutate(undefined, { revalidate: true })`.
- News data flow: `useNews` → SWR → `fetchGlobalNews()` → merges AI sentiment via `localArticles` Map → returns `mergedArticles`.

---

## CSS / Styling

- All colour tokens are CSS custom properties on `:root` in `global.css`. Never hardcode hex values in JSX — use `var(--token-name)` via Tailwind arbitrary syntax `text-[var(--foreground)]`.
- `cn()` from `src/lib/utils.ts` for conditional class merging (clsx + tailwind-merge).
- Custom classes (`.animate-ticker`, `.feed-row`, `.sidebar-left`, `.hud-badge-left`, etc.) live in `global.css`, not in component files.
- Inline `style` is acceptable **only** for animated/dynamic numeric values or CSS custom properties that vary with JS state.

### Key design tokens

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

- Async functions: `try/catch`, log with `console.error('context:', err)`, return safe fallback.
- Lists → `[]`, nullable objects → `null`, booleans → `false`.
- RSS fetching retries across multiple CORS proxies in sequence (see `lib/news.ts`).

---

## Data Fetching Patterns

| Use case | Tool |
|---|---|
| Read (GET) | `useFetch<T>(url)` — SWR with `revalidateOnFocus: false` |
| Write (POST) | `usePost<T, P>(url)` — SWRMutation |
| RSS / external | Direct `fetch` inside SWR fetcher in `lib/news.ts` |
| LLM / Ollama | `lib/llm.ts` → `lib/sentiment.ts` → `useNews` categorization loop |

SWR deduplication key: `null` disables the request. Use `enabled && condition ? 'key' : null`.

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

Prefix: `VITE_`. Access: `import.meta.env.VITE_XXX`. Defined in `.env` (git-ignored).

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | REST API base URL (defaults to `/api`) |
