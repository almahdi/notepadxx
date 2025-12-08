## NotepadXX — Copilot Instructions

Quick context for AI coding agents working in this repo. Keep suggestions focused on discoverable patterns and the project's actual architecture.

### Quick setup & commands
- Node 18+ is required. Install dependencies with `pnpm install`.
- Dev server: `pnpm dev` — Vite dev server (uses `rolldown-vite` as vite override).
- Build: `pnpm build` — runs `tsc -b` then `vite build`.
- Preview: `pnpm preview` — preview the production build locally.
- Linting: `pnpm lint` — ESLint configured for TS/React.

### Big picture (what to read first)
- Single-page React app — main logic is in `src/App.tsx` (Monaco Editor + IndexedDB + UI interactions).
- Editor: `@monaco-editor/react` is used in `App.tsx`. The editor instance is kept in a ref (`editorRef`) — use `onMount` to access it.
- Persistent storage: `idb` (the `openDB` helper) — database name `notepadxx`, stores: `files` and `settings` framed by `DB_VERSION = 2`.
- UI: shadcn/ui pattern wrappers are under `src/components/ui/*` (e.g., `button.tsx`, `input.tsx`). They use `class-variance-authority` patterns + `cn` helper in `src/lib/utils.ts`.
- Routing: none. App is a single render from `src/main.tsx`.

### Key patterns & conventions
- Path alias `@/*` is defined in `tsconfig.json`. Import using `@/components`, `@/hooks`, `@/lib`.
- Follow existing component patterns:
  - Use `cva` + `VariantProps` + `cn` for components (see `src/components/ui/button.tsx`).
  - Consistent `data-slot` attributes are used for some components (useful for testing/slotting).
- State persistence via IndexedDB: `App.tsx` defines `saveTab`, `loadTabs`, `saveSetting`, `loadSetting` and uses `db.put`/`db.getAll`/`db.delete`.
  - Save/Load logic lives in `App.tsx` (single source-of-truth for persistence); prefer adding helper functions there or extract to a `db` utility if refactoring.
- Theme: Uses CSS custom properties + `Tailwind` + `next-themes` behavior emulation. Toggle maps to Monaco themes: { dark → `vs-dark`, light → `vs` } — see `getMonacoTheme` function.

### Editor integration tips (Monaco)
- The editor ref is set using `onMount` in `App.tsx`: `onMount={(editor) => { editorRef.current = editor; }}`.
- To trigger Monaco actions, call `editorRef.current.getAction(actionId).run()` — for example: `actions.find`, `editor.action.startFindReplaceAction`.

### IndexedDB & backup/restore
- DB versioning: `openDB(DB_NAME, DB_VERSION, { upgrade(db, oldVersion) { ... }})` — add migrations here if increasing `DB_VERSION`.
- Stores used: `files` (file content, id, language) and `settings` (key/value pairs: `activeTabId`, `fontSize`, `theme`).
- Backup/Restore: `createBackup` generates a JSON file with structure: `backup.database.stores.files` and `settings`. `executeRestore` performs validation and full replace.

### Files to inspect when making changes
- `src/App.tsx` — Primary app, DB logic, editor actions, backup/restore.
- `src/components/ui/*` — UI components — use patterns (cva + cn + VariantProps).
- `src/lib/utils.ts` — `cn()` helper (class merging).
- `src/hooks/*` — custom hooks (e.g., `use-mobile` pattern).
- `vite.config.ts` — contains `babel-plugin-react-compiler` and `tailwind` plugin; `vite` is overridden in `package.json` to `rolldown-vite`.
- `tsconfig.json` — path alias `@/*` and TypeScript project references.
- `package.json` — scripts, dependencies, and the `vite` override.

### Common tasks & examples
- Add a UI component:
  - Create a file in `src/components/ui/` following `cva`+`cn` pattern and export named component.
  - Import with `@/components/ui/<component>`.

- Use persistence (save a new tab):
  - Call `await saveTab({ id, name, content, language })` provided by DB helper in `App.tsx`.

- Run a quick debug session locally:
  ```bash
  pnpm install
  pnpm dev
  # open http://localhost:5173
  ```

### Known limitations and constraints
- No automated tests / test runner configured in the repo — prefer manual/visual testing and ESLint checks.
- Production build runs `tsc -b` first — expect strict TypeScript errors to block builds. Fix types before building.
- The dev `vite` override uses `rolldown-vite` — the bundler may behave differently than vanilla Vite, so prefer verifying production builds locally with `pnpm build` + `pnpm preview`.

### PR / contribution checklist for code suggestions
1. Run `pnpm lint` and fix linting errors.
2. Ensure TypeScript compiles without `tsc -b` errors locally.
3. Verify the dev server (`pnpm dev`) loads and the changed UI behaves as intended.
4. For persistent changes, validate upgrades in `openDB(..., upgrade)` and update `DB_VERSION` accordingly.

### Where to look for more context
- `README.md` — project description and quick start (also contains patterns and backup JSON format).
- `src/App.tsx` — single file that holds most business logic. Read it first for persistence and editor actions.

If anything above is ambiguous, ask for a short sample task (e.g., “Add export file button” or “Refactor DB helper”) and I’ll update these instructions with examples.
