Here is the full audit. No changes made — everything below is diagnosis only. I'll fix whatever you pick from the list.

# Executive summary

The app is functionally shippable for personal/internal use but **not distribution-ready**. The largest gaps are cosmetic/branding (default Tauri icons, placeholder Cargo metadata, no code signing) and a handful of data-integrity issues (no schema migration, destructive import without confirmation). No critical security vulnerabilities, no critical crashes. Severity legend: **Critical** (blocks ship) / **High** (should fix before ship) / **Medium** (fix soon after) / **Low** (polish) / **Info** (for awareness).

---

# 1. Design & UX

### High — The app still ships Tauri's default logo as its icon
`ls src-tauri/icons/` shows the auto-generated set from `tauri init`. There's a `logo.webp` sitting in the repo root that appears to be your real logo and isn't used anywhere. For Linux/Windows installers the icon is baked into `.deb`, `.msi`, AppImage, NSIS — so this is the first thing every user sees in their taskbar and installer dialog. Run `npx tauri icon logo.webp` to regenerate the entire icon set from your webp.

### High — Destructive data import with no confirmation
[app/page.js:79-90](app/page.js) `handleImport` → `importTodos(data.todos)` replaces the entire todo list silently on file pick. One misclick and the user wipes their data. Should show a confirm or offer "merge vs. replace". Bonus: `alert(err.message)` (line 87) is a jarring native dialog — replace with an inline toast/error.

### Medium — Edit modal loses unsaved changes without warning
[components/TaskModal.js](components/TaskModal.js) closes on overlay click, the close button, and ESC — all unconditionally. If a user types a long note and fat-fingers outside the modal, the changes vanish. Either auto-save-on-change, or prompt if `title/notes/etc. !== todo.*`.

### Medium — Two components both listen for ESC globally
`useKeyboardShortcuts` ESC → `onCloseModal` [hooks/useKeyboardShortcuts.js:12](hooks/useKeyboardShortcuts.js) and `Select.js` ESC → close menu [components/Select.js:32](components/Select.js) both attach `document.addEventListener('keydown', ...)`. If you open a Select inside the TaskModal and press ESC, the Select closes AND the modal closes. Fix: in Select, call `e.stopPropagation()` when it handles ESC so it doesn't bubble to the shortcuts handler.

### Medium — Custom `<Select>` options are in the Tab order
Each option is a `<button>` [components/Select.js:129](components/Select.js). When the menu is open, pressing Tab moves focus through them and out of the combobox, which breaks the listbox contract. Add `tabIndex={-1}` on each option and keep keyboard navigation (Arrow/Enter/Esc) on the trigger where it already works.

### Medium — Native `<input type="date">` still looks bad on Linux
GTK WebKit renders a very basic date picker. You already replaced native `<select>` dropdowns; for consistency replace the date inputs in [components/TodoInput.js:101](components/TodoInput.js) and [components/TaskModal.js:95](components/TaskModal.js) with a small custom popover. Not urgent, but it's the next most-visible "ugly native widget" now that selects are done.

### Low — Sidebar overlay backdrop sits under the titlebar
[app/globals.css](app/globals.css) `.sidebar-overlay` is `inset: 0` with z-index 99. On mobile widths the backdrop paints over the titlebar too (not that mobile is your target, but Tauri doesn't enforce a min width that prevents this). With the custom titlebar z-index 1100 it's fine visually, but tapping the titlebar area won't dismiss the sidebar. Minor.

### Low — "Clear N done" button is destructive and has no confirm
[components/FilterBar.js](components/FilterBar.js) `onClearCompleted`. A single click removes all completed tasks forever. A small confirm or an Undo toast would be kinder.

### Low — `Ctrl+D` shortcut conflicts with browser "bookmark"
[hooks/useKeyboardShortcuts.js:34](hooks/useKeyboardShortcuts.js). In the Tauri webview this is fine (no bookmarks menu), but when running the web version in a browser it hijacks bookmarking. Consider `Ctrl+Shift+D` or `Alt+T`.

### Low — `ConfettiCelebration` fires for any completed filtered set
[app/page.js](app/page.js) passes `allDone = filteredTodos.length > 0 && filteredTodos.every(completed)`. Filter to "Done", and confetti fires. Filter to a list with 1 item and complete it — confetti. Intended? If you only want it on "completed the last active task in the view", the trigger should compare before/after counts rather than just `allDone` of the filtered slice.

### Info — `"use client"` everywhere; whole app is one client tree
That's fine for this scale, but it means you get zero benefit from Next.js RSC. If you ever decouple from Next for the desktop build (e.g., Vite), nothing is lost.

---

# 2. Security & Privacy

### Critical — Leaked Vercel Blob token in git history
`.env.local` was committed with `BLOB_READ_WRITE_TOKEN=vercel_blob_rw_pgw1DiR1s9quP5dH_C4whZ38j8SWGkHOIuNJe9oNbGCDQof`. I deleted the file, but **git history still contains it**. Anyone with clone access (if the repo is ever made public or leaked) can use that token to read/write your blob store. Action: rotate the token in the Vercel dashboard today. If the repo was ever pushed somewhere public, consider `git filter-repo` to scrub history too.

### High — Tauri CSP is disabled (`"csp": null`)
[src-tauri/tauri.conf.json:24](src-tauri/tauri.conf.json). For a pure-local app this is low real-world risk (no remote content loaded), but it means if a future dependency or a future you accidentally inlines remote scripts, nothing blocks it. Recommended minimum for production build:

```json
"security": {
  "csp": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self' ipc: http://ipc.localhost"
}
```

Note: you'll have to test this — Next.js static export can inline `<style>` tags, which is why `style-src 'unsafe-inline'` is necessary.

### Medium — No input length limits on todo titles/notes
Nothing in [hooks/useTodos.js](hooks/useTodos.js) or [components/TaskModal.js](components/TaskModal.js) bounds string length. A user pasting a 10MB text blob fills localStorage's ~5MB quota silently (`saveTodos` just catches and logs). Symptom for the user: todos stop persisting without any visible error. Bound input to, say, 500 chars for title and 10k for notes, and show a visible warning if `saveTodos` throws.

### Medium — `JSON.parse` result from imported files is used directly
[lib/storage.js:77-83](lib/storage.js). `data.todos` is checked for `Array.isArray`, but individual todos aren't validated. A malformed/malicious file could inject objects with unexpected shapes (e.g., `subtasks: null` → crash at render). Validate each todo against a schema (shape, types, required fields) before `importTodos`.

### Medium — No data-at-rest encryption
`localStorage` on Linux is `~/.local/share/com.shittodo.desktop/.../Local Storage/leveldb/` in plaintext. Any local process running as your user can read it. That's the OS-default threat model for a todo app, so fine, but worth a line in the README so users don't treat it as a password-safe.

### Low — Tauri capabilities are minimal (good) but still implicitly broad
[src-tauri/capabilities/default.json](src-tauri/capabilities/default.json) only enables `core:default`. That's the minimum viable set — no fs, no shell, no http plugins. Good posture. Keep it this way and add individual permissions only as features require them.

### Low — No subresource integrity on the packaged JS
Not really achievable with Next.js static export today, and since assets are loaded from `tauri://` locally, the attack surface is roughly zero. Flagging for completeness.

### Info — No telemetry, no analytics, no remote calls at runtime
Verified by grep: zero `fetch()` to external hosts remains. 100% offline after install. Users get privacy by default.

---

# 3. Performance & Stability

### High — No schema migration for persisted todos
[hooks/useTodos.js](hooks/useTodos.js) and [hooks/useLists.js](hooks/useLists.js) assume fields like `subtasks`, `order`, `priority`, `createdAt` exist. A todo saved by an older build that lacked `subtasks` will crash [components/TodoItem.js:41](components/TodoItem.js): `todo.subtasks?.filter(...)` — the optional chain saves it there, but [components/TaskModal.js:117](components/TaskModal.js) `todo.subtasks || []` saves it there too — not everywhere is defended. If you add a new field next version, old data will fail somewhere. Add a version field to the stored JSON and a small `migrate(data)` step on load.

### High — `localStorage` silently fails when full
[lib/storage.js:17-21](lib/storage.js) `catch (e) { console.error(...); }`. User types, nothing saves, no UI feedback. Surface this as a visible banner.

### Medium — No virtualization in `TodoList`
[components/TodoList.js](components/TodoList.js) renders every todo. At ~500 items this starts to jank on drag. `@dnd-kit` supports virtualized lists via `react-virtuoso` or `@tanstack/virtual`. Not urgent for a personal app; relevant if anyone turns this into a task-heavy work tool.

### Medium — `saveTodos` writes on every keystroke-equivalent state change
Every toggle / edit / subtask-checkbox fires a write to localStorage. For small data this is fine, but under rapid interaction (drag reorder = many re-renders) you write a ~KB JSON blob dozens of times per second. Debounce the `saveTodos` call in the `useEffect` with a 200ms trailing edge.

### Medium — `getFilteredTodos` sorts a new array each call
[hooks/useTodos.js:119-193](hooks/useTodos.js). Called from a `useMemo` so it's OK in practice, but every date comparison calls `new Date(...)` twice. With 1000 todos sorted by due date that's 2× `n log n` Date constructions. Precompute sortable keys once per todo.

### Medium — Zoom on body interacts poorly with Next.js dev overlay
With `zoom: 1.4` on body, the Next.js error overlay and route-announcer both render at 1.4× and clip awkwardly. Only a dev nuisance, production builds don't include the overlay. Flagging so you know why it looks odd when an error happens in dev.

### Low — `ConfettiCelebration` dynamic-imports `canvas-confetti` on first fire
[components/ConfettiCelebration.js:11](components/ConfettiCelebration.js). Good that it's lazy. Minor: the import promise isn't cached; every completion that re-triggers pays a module-registry lookup. Negligible.

### Low — `hasFired` ref resets only when `trigger` transitions to false
If `trigger` stays true across re-mounts (unlikely), confetti won't refire. Edge case.

### Low — Bundle includes `canvas-confetti`, `@dnd-kit/*` in every route
One-page app so this is irrelevant, but if you ever split into multiple routes, these are heavy.

### Info — Rust debug build is ~400MB in `src-tauri/target/`
Normal. Release build will be a single ~20MB binary.

---

# 4. QA & release readiness

### Critical — `src-tauri/Cargo.toml` metadata is placeholder
```toml
name = "app"
description = "A Tauri App"
authors = ["you"]
license = ""
```
This ends up in the `.deb` control file (`Maintainer: you`), in the Windows MSI publisher metadata, and in `apt show`. Set:

```toml
name = "shittodo"
description = "A minimalist offline todo app"
authors = ["Your Name <email>"]
license = "MIT"  # or whatever
homepage = "https://github.com/yourname/shittodo"
```

Also add to [src-tauri/tauri.conf.json](src-tauri/tauri.conf.json) `bundle`:
```json
"publisher": "Your Name",
"copyright": "© 2026 Your Name",
"homepage": "https://..."
```

### High — No code signing, no Windows SmartScreen trust
Unsigned MSI/NSIS installers throw "Windows protected your PC" on first run. For a hobby app it's acceptable but users will be scared. Real fix: buy an OV or EV code-signing cert (~$100-500/year) and wire it into the GitHub Actions workflow. Short-term fix: mention in README that users must click "More info → Run anyway".

### High — No updater configured
[src-tauri/tauri.conf.json](src-tauri/tauri.conf.json) has no `plugins.updater` block. Users have to manually download every new version. For a shipped app, add `tauri-plugin-updater` with a signed manifest served from a static URL (GitHub Releases works).

### Medium — CI matrix uses `ubuntu-22.04` with `libwebkit2gtk-4.1-dev`
Works today. Be aware: if you switch to `ubuntu-24.04` later, webkit packages shift around. Pin to 22.04 for now for compatibility with older user distros (glibc 2.35).

### Medium — CI doesn't run tests or lint
[.github/workflows/release.yml](.github/workflows/release.yml) goes straight to `tauri build`. Add `npm run lint` and, if you add tests, `npm test` as a prior step. Even without tests, at least `npm run build` on PRs would catch static-export regressions.

### Medium — `npm run build` requires network (Google Fonts)
`next/font/google` fetches Inter at build time. Any offline build or restricted CI environment fails. Either self-host the woff2 files under `public/fonts/` + `next/font/local`, or accept the network dependency and document it. Your current [.github/workflows/release.yml](.github/workflows/release.yml) on GH runners has network, so CI is fine.

### Medium — `package.json` missing useful metadata
No `description`, no `author`, no `repository`, no `homepage`. These show up in `npm view` and some release tooling. Fill them in.

### Low — README mentions "run at 140% zoom" nowhere
You asked me to scale the UI up by 1.4 because that matches your preference. If someone else runs this, they'll see the same scale with no way to change it. Either document or add a zoom control in-app (could store zoom factor in localStorage and apply via CSS custom property).

### Low — Output `out/` contains Next.js debug artifacts
`__next.__PAGE__.txt`, `__next._full.txt`, etc. Harmless but bundled into the app binary. If they bother you, add a postbuild step to remove `out/__next.*.txt` and `out/*.txt` before `tauri build`.

### Low — `jsconfig.json` is minimal
No `checkJs`, no `strict`. If you ever want editor-level type checking, add:

```json
{
  "compilerOptions": {
    "checkJs": true,
    "paths": { "@/*": ["./*"] }
  }
}
```

### Info — `npm audit --production` → 0 vulnerabilities
Clean as of today.


---
