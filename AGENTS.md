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
npx eslint src/components/Globe.tsx

# Lint with auto-fix
npm run lint -- --fix
```

## Testing

**Status: No tests exist in this project.**

If tests are added later (e.g., Vitest), run with:

```bash
# Single test file
npx vitest run src/hooks/useFetch.test.ts
```

## Code Style

### TypeScript

Strict mode enabled. Use explicit types, `interface` for objects, `type` for unions.

```typescript
// Good
interface GlobeProps {
  className?: string
  newsPoints: NewsPoint[]
}

export function Globe({ className, newsPoints }: GlobeProps) { }
```

### Imports

Relative imports. Order: external libs -> internal lib -> components -> types.

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

Try/catch with `console.error`, return safe fallbacks (`[]` for lists).

```typescript
try {
  return await fetchData()
} catch (err) {
  console.error('Failed to fetch news:', err)
  return []
}
```

### Data Fetching

**SWR + axios** - see `src/lib/api.ts` and `src/hooks/useFetch.ts`.

```typescript
import { useFetch } from '../hooks/useFetch'

const { data, isLoading } = useFetch<NewsArticle[]>('/api/news')
```

API failures should return empty array `[]` as fallback.

### CSS

**Tailwind CSS 4** with CSS variables. Use `clsx` + `tailwind-merge`.

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

- React 19 + TypeScript (strict)
- Vite, Tailwind CSS 4
- SWR, axios (fetching)
- Radix UI (dialog, tabs, tooltip)
- react-globe.gl, Recharts
- lucide-react (icons)

## Common Tasks

### New API Endpoint
1. Add to `src/lib/api.ts` or create hook in `src/hooks/`
2. Use `useFetch` or `usePost`/`usePut`/`useDelete`

### New UI Component
1. Add to `src/components/ui/` if reusable
2. Use Radix UI primitives when available

### Environment Variables
1. Add to `.env` (prefix with `VITE_`)
2. Access via `import.meta.env.VITE_xxx`
