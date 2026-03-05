# AGENTS.md - Trading Journal Developer Guide

## Quick Start
```bash
npm install
npm run dev      # Start dev server
npm run build    # TypeScript + Vite build
npm run lint     # ESLint
npm run preview  # Preview production build
```

## Commands
| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | `tsc -b && vite build` |
| `npm run lint` | ESLint on entire project |
| `npm run preview` | Preview production build |

### Single Checks
```bash
# Type-check only
npx tsc --noEmit

# Lint specific file
npx eslint src/App.tsx

# Lint with auto-fix
npm run lint -- --fix
```

## Testing
No test script is currently defined in package.json and no test files exist in the project.

If/when tests are added (e.g., Vitest), the expected pattern would be:
```bash
# Add to package.json: 'test': 'vitest run'
npm test                    # Run all tests
npm test -- src/hooks/useFetch.test.ts  # Single test file
npm test -- -t "describe name"           # Run by test name
```

## Code Style

### TypeScript
Strict mode enabled. Use explicit types, `interface` for objects, `type` for unions.
```typescript
interface GlobeProps {
  className?: string
  newsPoints: NewsPoint[]
}

export function Globe({ className, newsPoints }: GlobeProps) { }
```

### Imports
Relative imports. Use `import type` for type-only imports. Order: external libs -> internal lib -> components -> types.
```typescript
import { useState } from 'react'
import GlobeGL from 'react-globe.gl'
import { sentimentColors } from '../lib/news'
import { NewsModal } from './NewsModal'
import type { NewsPoint } from '../types/news'
```

### Components
PascalCase, named exports, props interface before component.
```typescript
interface ButtonProps {
  label: string
  onClick: () => void
}

export function Button({ label, onClick }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>
}
```

### Hooks
Prefix with `use`, return object with `isLoading`, `isError`, `error`.
```typescript
interface UseFetchReturn<T> {
  data: T | undefined
  isLoading: boolean
  isError: boolean
  error: Error | null
}
```

### Error Handling
Try/catch with `console.error`, return safe fallbacks (`[]` for lists, `null` for objects).
```typescript
try {
  return await fetchData()
} catch (err) {
  console.error('Failed to fetch:', err)
  return []
}
```

### Data Fetching
**SWR + axios** - see `src/lib/api.ts` and `src/hooks/useFetch.ts`. API failures return `[]`.
```typescript
const { data, isLoading } = useFetch<NewsArticle[]>('/api/news')
```

### CSS
**Tailwind CSS 4** with CSS variables. Use `clsx` + `tailwind-merge` via the `cn` helper.
```typescript
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: (string | undefined)[]) {
  return twMerge(clsx(inputs))
}
```

### Naming
| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `Globe.tsx` |
| Hooks | use* + camelCase | `useNews.ts` |
| Utils | camelCase | `api.ts` |
| Types | PascalCase | `NewsPoint` |

### Environment Variables
Prefix with `VITE_` in `.env`. Access via `import.meta.env.VITE_xxx`.

## Project Structure
```
src/
  components/
    ui/       # Radix UI primitives
    layout/   # Header, MainLayout
    *.tsx     # Feature components
  hooks/      # Custom hooks
  lib/        # Utils, API client
  types/      # TypeScript definitions
  data/       # Static data
  App.tsx     # Root
  main.tsx    # Entry
```

## Dependencies
- React (see package.json) + TypeScript (strict)
- Vite, Tailwind CSS 4
- SWR, axios (fetching)
- Radix UI (dialog, tabs, tooltip)
- react-globe.gl, Recharts
- lucide-react (icons)

## Common Tasks
**New API Endpoint:** Add to `src/lib/api.ts` or create hook in `src/hooks/`. Use `useFetch` or `usePost`/`usePut`/`useDelete`.

**New UI Component:** Add to `src/components/ui/` if reusable. Use Radix UI primitives when available.

## Cursor / Copilot Rules
None found. No .cursor/rules/, .cursorrules, or .github/copilot-instructions.md detected.
