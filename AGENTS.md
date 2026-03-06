# AGENTS.md — Trading Journal Developer Guide

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Vite dev server with HMR (http://localhost:5173)
npm run build        # tsc -b && vite build (type-check + bundle)
npm run lint         # ESLint on entire project
npm run preview      # Preview production build
```

### Targeted checks (run after every change)

```bash
npx tsc --noEmit                  # Type-check only
npx eslint src/components/Foo.tsx # Lint a single file
npm run lint -- --fix             # Auto-fix lint issues
```

**Always run `npx tsc --noEmit && npm run lint` before considering a task done.** Both must exit clean.

### Testing

No test framework configured. If Vitest is added:

```bash
# package.json: "test": "vitest run"
npm test
npm test -- src/hooks/useNews.test.ts  # single file
npm test -- -t "filter by sentiment"   # single test
```

---

## Architecture Overview

```
src/
  App.tsx                  # Root: all lifted state, HUD overlay, drawers
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
    MarketImpactSidebar.tsx
    NewsModal.tsx
    CountryNewsModal.tsx
    newspaper/             # 3D page-flip newspaper — see section below
    charts/SentimentGauge.tsx
  hooks/
    useNews.ts             # SWR → RSS parse → AI sentiment enrichment loop
    useFetch.ts            # Generic SWR GET + SWRMutation POST/PUT/DELETE
    useLLM.ts              # Ollama health + generation hook
    useSentiment.ts        # Per-article sentiment wrapper
  lib/
    news.ts / sentiment.ts / llm.ts / api.ts / utils.ts
  types/
    news.ts / newspaper.ts
  styles/global.css        # Tailwind v4 @import, all CSS variables + custom classes
  data/                    # Static seed data (coordinates, newspaper pages)
```

---

## Newspaper 3D Viewer — Critical Interaction Model

The newspaper lives in `src/components/newspaper/`. **Do not change the interaction model without reading this section.**

### State split

`Newspaper3D.tsx` owns all interaction logic and passes two orthogonal props to `NewspaperBook`:

| Prop | Type | Meaning |
|---|---|---|
| `flipDirection` | `'forward' \| 'backward' \| null` | Which page is currently moving |
| `flipProgress` | `0 → 1` (always positive) | How far the flip has travelled |

**Never go back to a single signed `dragProgress` value** — that conflates direction and magnitude and causes side/direction confusion.

### Side-aware drag rules

On `pointerdown`, the click X is compared to the book spine to determine `dragSide`:

- **Right page grabbed** → only leftward drag (`deltaX < 0`) activates → `flipDirection = 'forward'`
- **Left page grabbed** → only rightward drag (`deltaX > 0`) activates → `flipDirection = 'backward'`
- Movement in the wrong direction for the grabbed side is ignored (page is pinned at the spine)
- At `currentPage === 0` there is no left page — clicks on the left half do nothing

### Page-0 closed state

When `currentPage === 0` and nothing is flipping, `NewspaperBook` renders a **single centered page** (cover), not a two-page spread. The spread width expands to `PAGE_WIDTH * 2` when `currentPage > 0` or a flip is in progress.

### Flip animation

All pointer events attach to `window` (not the container), so fast drags never lose the pointer. A spring RAF loop (`diff * 0.15` per frame) drives `flipProgress` toward `targetProgressRef`. On release, `resolveFlip` either commits (target → 1) or snaps back (target → 0) based on a 0.35 threshold.

### Scroll-to-zoom

`NewspaperViewer.tsx` listens for `wheel` on `window` (non-passive). If the pointer is over `bookRef`, the scroll is ignored. Otherwise, scale adjusts ±8% per tick, clamped `0.55 – 1.5`. A `%` badge appears top-left when zoom ≠ 100%.

---

## HUD Overlay Architecture

Sidebars are `position: absolute` at `z-index: 10`. Elements above them must live in the `hudOverlay` slot of `MainLayout` (`z-index: 50`). **Never** put a badge inside `<Globe>` or `<main>` expecting it to clear a sidebar.

HUD badges shift with sidebar state via CSS custom properties:

```tsx
<div className="absolute top-4 pointer-events-none hud-badge-left"
  style={{ zIndex: 50, '--hud-left-offset': panelsVisible ? 'calc(18rem + 1rem)' : '1rem' } as React.CSSProperties}
/>
```

Sidebar widths: left `18rem` (lg+), right `16rem` (xl+). Both transition `300ms ease`.

---

## Tailwind CSS v4 — Critical Rules

- `hidden` = `display: none !important` — cannot be overridden by responsive variants. Use `lg:block` or define display in `global.css` with `@media`.
- Dynamic class names (`` `lg:${x}` ``) are not scanned — always write full static strings.
- `transition-[width,opacity]` may not compile — use `transition-all` or standard shorthands.
- For responsive `display:flex` on sidebars, define in `global.css` — see `.sidebar-left` / `.sidebar-right`.
- `h-full` on a flex child requires the parent to have an explicit height; use `self-stretch` when unsure.
- Scrollable HUD containers: add `.hud-scrollbar` (defined in `global.css`).

---

## TypeScript

Active flags: `strict`, `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`, `noFallthroughCasesInSwitch`, `erasableSyntaxOnly`, `noUncheckedSideEffectImports`.

- `interface` for object shapes; `type` for unions/aliases/mapped types.
- Never use `any`. Use `unknown` + type guard when the shape is genuinely unknown.
- `import type` is **required** for type-only imports (`verbatimModuleSyntax` enforces this).
- Unused variables are compile errors — remove or prefix `_`.

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
- UI primitives in `src/components/ui/` wrap Radix with `cn()` and expose `className`.
- CVA (`class-variance-authority`) for components with multiple visual variants.
- `useCallback` dependency arrays must be exhaustive (`react-hooks/exhaustive-deps` is an error).
- All pointer/keyboard events that must survive fast cursor movement attach to `window`, not element.

---

## Hooks

- Prefix `use*`. File name matches hook name (`useNews.ts` exports `useNews`).
- Return a named object, not a tuple (except SWR/SWRMutation passthrough).
- SWR key `null` disables fetching. Pattern: `enabled ? 'key' : null`.
- `setState` must not be called synchronously in effect bodies — use `setTimeout(..., 0)` or restructure.

---

## CSS / Styling

- All colour tokens are CSS custom properties on `:root` in `global.css`. Never hardcode hex in JSX.
- Reference tokens: `text-[var(--foreground)]`.
- `cn()` from `src/lib/utils.ts` for conditional class merging.
- Custom classes live in `global.css`, never inline in component files.
- Inline `style` only for JS-driven dynamic values or CSS custom properties.

| Token | Value |
|---|---|
| `--background` | `#0b132b` |
| `--hud-surface` | `#0d1526` |
| `--hud-border` | `rgba(91,192,190,0.35)` |
| `--tropical-teal` | `#5bc0be` (primary accent) |
| `--neon-ice` | `#6fffe9` (strong accent) |
| `--foreground` | `#e8f4f8` |
| `--muted-foreground` | `#8ba5b5` |

---

## Error Handling

- Async: `try/catch`, `console.error('context:', err)`, return safe fallback.
- Fallbacks: lists → `[]`, nullable objects → `null`, booleans → `false`.

---

## Data Fetching

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
| CSS class | kebab-case | `.feed-row`, `.hud-badge-left` |
| CSS variable | `--kebab-case` | `--hud-border-strong` |

---

## Environment Variables

Prefix: `VITE_`. Access: `import.meta.env.VITE_XXX`. Defined in `.env` (git-ignored).

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | `/api` | REST API base URL |
| `VITE_LLM_BASE_URL` | `http://localhost:11434` | Ollama base URL |
| `VITE_LLM_MODEL` | `llama3.2` | Ollama model for sentiment/signals |
