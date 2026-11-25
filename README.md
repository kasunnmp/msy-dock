# Maisey OS – Dock & Lock screen prototype

Prototype of the Maisey OS desktop (dock + status bar) and the **lock screen** flow, built from the Maisey OS – Core Figma file (single-user and multiple-user lock screen sections).

## Run

```bash
npm install
npm run dev
```

A small **Prototype** panel (top-left, not part of the design) switches between single and multiple users, sets the auto-lock timeout and has a **Lock now** button.

## Lock screen flow

**What locks the session**
- Manual: status bar power icon → full-screen session control → **Lock screen** (or **Switch users**, which opens straight into account selection). Shortcut: ⌘/Ctrl + Shift + L.
- Inactivity: auto-lock after the configured idle timeout (Advanced Settings in the product, the Prototype panel here).
- Protected state: the session locks when the tab/window becomes hidden (`visibilitychange`). You can turn this off in the panel.

**What the locked state does**
- The workspace blurs and fades out, then is **unmounted**. While locked, no workspace content is in the DOM. Session state is held above the lock boundary, so unlocking restores the same session.
- The wallpaper on the lock screen is a separate **~48 px, pre-blurred** image (`src/assets/lock/lock-wallpaper-lowres.jpg`) used as a CSS background. The sharp wallpaper is never loaded by the lock screen, so removing the CSS blur in DevTools shows nothing usable. In production the backend should serve this derivative; here it is generated with ImageMagick:
  `convert wallpaper.jpg -resize 48x -blur 0x2 -quality 70 lock-wallpaper-lowres.jpg`
- Clock: time is the most prominent element, with the date above it. The year is never shown.
- Clicking the current profile opens the passkey prompt. It never opens automatically.
- Multiple users: only the locked user is shown, plus **Switch account**. Account selection shows all profiles with an **Active** badge on the locked one. **Back** (or Esc) returns, and the screen returns on its own after 15 s without interaction (`ACCOUNT_SELECTION_TIMEOUT_MS`).
- Footer: language dropdown (placeholder, still pending), legal text (placeholder), and Trouble unlocking / Terms / Privacy links (placeholder MediTrust URLs in `src/lock/config.ts`).

**Simulated in the prototype**
- The passkey sheet stands in for the native browser/OS dialog. In production this is `navigator.credentials.get({ publicKey })`. Click the fingerprint to "authenticate".
- Unlocking as a different account just continues as that account. The full multi-account switching behaviour is defined separately.
- Enter Password and Add account only show a "defined separately" note.

## Structure

- `src/App.tsx` – lock state machine (manual / idle / hidden triggers), workspace ↔ lock transition, prototype panel.
- `src/Workspace.tsx` – desktop wallpaper and dock.
- `src/components/LockScreen/` – `LockScreen`, `AccountTile`, `LockClock`, `LockFooter`, `PasskeyPrompt`.
- `src/components/StatusBar/`, `src/components/SessionControl/` – status bar and full-screen session control.
- `src/lock/config.ts` – timeouts, links, legal text. `src/lock/accounts.ts` – demo accounts.
- `src/components/Dock/` – the dock (spring hover lift, tooltips).
