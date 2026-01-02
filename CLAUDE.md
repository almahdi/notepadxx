# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NotepadXX is a browser-based code editor replicating Notepad++ functionality. It's a single-page React application using Monaco Editor (VS Code's editor engine) with IndexedDB for persistent offline storage.

**Tech Stack:**
- React 19.2 with TypeScript 5.9
- Vite 7.2 (rolldown-vite bundler)
- Monaco Editor for code editing
- shadcn/ui + Tailwind CSS 4.1 for UI
- IndexedDB via `idb` library for storage
- PWA with service worker for offline support

## Development Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Start development server (http://localhost:5173)
pnpm build            # Build for production (runs tsc -b then vite build)
pnpm preview          # Preview production build locally
pnpm lint             # Run ESLint
pnpm generate-pwa-assets  # Generate PWA icons from source
```

## Architecture

### Application Structure

**Single-File Application** - All core logic lives in `src/App.tsx`:
- Tab management (add, close, switch, rename)
- IndexedDB persistence for files and settings
- Monaco Editor integration
- Backup/restore functionality
- Theme switching (dark/light/system)

**Key Directories:**
- `src/App.tsx` - Main application (DB operations, editor actions, UI state)
- `src/components/ui/*` - shadcn/ui components (cva pattern)
- `src/hooks/*` - Custom React hooks (PWA, offline toast)
- `src/lib/utils.ts` - `cn()` class helper
- `public/` - Static assets (logo.webp source for PWA icons)

### Data Storage

**IndexedDB Schema** (Database: `notepadxx`, Version: 2)
- `files` store: `{ id, name, content, language }`
- `settings` store: `{ key, value, updatedAt }` (stores: `activeTabId`, `fontSize`, `theme`)

**Key DB Functions in App.tsx:**
- `loadTabs()` - Load all files and active tab from DB
- `saveTab(tab)` - Persist a single file
- `deleteTabFromDB(id)` - Remove a file
- `saveSetting(key, value)` / `loadSetting(key)` - Persist preferences

When modifying the schema, update `DB_VERSION` and add migration logic in the `upgrade` callback.

### Editor Integration

Monaco Editor is wrapped in `@monaco-editor/react`:
- Editor ref stored in `editorRef.current` (set via `onMount`)
- Trigger actions: `editorRef.current.getAction(actionId).run()`
  - Find: `actions.find`
  - Replace: `editor.action.startFindReplaceAction`
- Theme mapping: dark → `vs-dark`, light → `vs`

### UI Components

Uses shadcn/ui patterns with:
- `class-variance-authority` (cva) for variants
- `cn()` helper from `src/lib/utils.ts` for class merging
- Path alias `@/*` for imports (configured in `tsconfig.json`)

Example usage:
```tsx
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
```

### PWA Features

- Service worker via `vite-plugin-pwa`
- Custom hooks in `src/hooks/`:
  - `usePWA()` - Install prompts and update detection
  - `checkForSWUpdates()` - Show toast when update available
  - `useOfflineReadyToast()` - One-time offline ready notification
- Toast notifications via Sonner (`sonner` package)

## Common Patterns

**Creating UI Components:**
1. Create file in `src/components/ui/<name>.tsx`
2. Use cva + VariantProps + cn pattern (see `button.tsx`)
3. Import with `@/components/ui/<name>`

**Persisting State:**
- Use existing DB helpers in `App.tsx` or extract to utility functions
- Always await IndexedDB operations (async)
- Update both React state AND IndexedDB

**Theme Implementation:**
- Theme stored in DB (`settings` store, key: `theme`)
- Applied via CSS classes on `document.documentElement`
- Resolve 'system' theme with `window.matchMedia('(prefers-color-scheme: dark)')`

## Build Configuration Notes

- Vite overridden to `rolldown-vite` in `package.json` for faster builds
- React Compiler enabled via `babel-plugin-react-compiler`
- PWA manifest auto-generated from `vite.config.ts`
- Tailwind CSS 4.x with Vite plugin
- Path aliases: `@/*` → `./src/*`

## Testing & Validation

- No test runner configured - manual/visual testing required
- Always run `pnpm lint` before committing
- Production builds require clean TypeScript compilation (`tsc -b`)
- Test PWA features by building locally: `pnpm build && pnpm preview`
- Verify IndexedDB changes by checking browser DevTools > Application > IndexedDB

## Deployment

Pure client-side app - deploy `dist/` folder to any static host:
- Cloudflare Pages (use `wrangler.jsonc` config)
- Netlify, Vercel, GitHub Pages, etc.

No environment variables or server-side build steps required.
