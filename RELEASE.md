# Release checklist

Follow this before publishing a tag / promoting a draft release on GitHub.

## 1. Version bump

Bump all three files to the same value. They MUST match.

- `package.json` → `"version"`
- `src-tauri/Cargo.toml` → `[package] version`
- `src-tauri/tauri.conf.json` → `"version"`

Commit as `chore: bump vX.Y.Z`.

## 2. Pre-flight on `main`

```bash
npm ci
npm run lint
npm run build
```

Both must pass with zero errors and zero warnings surfaced by `next build`.

## 3. Tag and push

```bash
git tag vX.Y.Z
git push origin vX.Y.Z
```

The `Release` workflow will build Linux (`.deb`, AppImage) and Windows
(`.exe`, `.msi`) artifacts and upload them to a **draft** release.

## 4. Smoke test the artifacts before publishing

Install from the draft release assets (not a local build) and verify on each
target OS.

### Linux (Kubuntu / any recent Ubuntu)

- [ ] `.deb` installs cleanly (`sudo apt install ./shittodo_<ver>_amd64.deb`)
- [ ] `apt show ./shittodo_<ver>_amd64.deb` shows correct maintainer / description
- [ ] AppImage is executable and launches (`chmod +x ./*.AppImage && ./*.AppImage`)
- [ ] App icon appears in KDE/GNOME application menu (not the default Tauri icon)
- [ ] App launches and shows the custom titlebar
- [ ] Create, edit, complete, reorder, delete tasks
- [ ] Create a custom list, move tasks to it, delete the list, confirm task reassignment
- [ ] Export backup → close app → reinstall → import backup (both merge and replace)
- [ ] Toggle theme (Ctrl+Shift+D), search (Ctrl+F), new task (Ctrl+N), export (Ctrl+E)
- [ ] Close the app with unsaved typing in notes, reopen — changes persisted
- [ ] Open DevTools (if exposed) or inspect console logs: no CSP violations

### Windows 11 (fresh VM or clean user)

- [ ] NSIS `.exe` installer runs; SmartScreen warning is the only expected friction
- [ ] MSI installs via `msiexec /i shittodo_<ver>_x64_en-US.msi`
- [ ] Icon appears in Start menu and taskbar (not default Tauri icon)
- [ ] Same feature checklist as Linux above
- [ ] Uninstall via Settings → Apps removes cleanly

### macOS

Not currently built. If added to the release matrix, verify:

- [ ] `.dmg` mounts, app drags to `/Applications`
- [ ] First launch works (unsigned apps will require right-click → Open)
- [ ] IPC works — CSP `connect-src` must include `ipc://localhost` in addition to `http://ipc.localhost`

## 5. Data integrity

- [ ] On a machine with real data, upgrading from the previous version keeps all tasks and lists (schema migration runs on load)
- [ ] Local storage survives a full quit + relaunch
- [ ] Export → clear local storage → import restores both tasks AND custom lists

## 6. Publish

- Write release notes (features, fixes, breaking changes, known issues)
- Flip the draft release to **Published**
- Announce (if applicable)

## 7. Post-release

- [ ] Open a tracking issue for anything deferred
- [ ] If a regression is reported, cut a patch release (`vX.Y.Z+1`) — don't overwrite the tag
