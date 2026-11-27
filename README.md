# Maisey Dock

A dock with spring hover lift and name tooltips, built from the Maisey Patient Records Figma design.

- The hovered icon rises a few px on a spring and settles back on leave; the dock never resizes.
- A tooltip with the item's name appears above the hovered or keyboard-focused icon: a short delay on first hover, then instant (unanimated) swaps while moving across icons, with a strong ease-out enter and a faster exit. Respects reduced motion.
- Account switching: the menu bar shows the signed-in account; click it (or focus it and press ↓) to pick another account. A blurred overlay covers the desktop while the switch happens, then the dock's colleagues and unread badges update for the new account. The choice is remembered in `localStorage`.

## Run

```bash
npm install
npm run dev
```

## Structure

- `src/components/Dock/Dock.tsx` – reusable `Dock`, `DockItem`, `DockBadge`, `DockSeparator` (tune `lift` and `spring`).
- `src/components/Dock/AskMaisey.tsx` – the "Ask Maisey" pill (static, not magnified).
- `src/accounts/` – account data (`accounts.ts`), `AccountProvider` and the `useAccounts` hook.
- `src/components/MenuBar/` – the top menu bar with clock and account button.
- `src/components/AccountSwitcher/` – account menu, avatars and the switching overlay.
- `src/App.tsx` – dock contents and labels.
- `src/assets/dock/` – assets exported from Figma.
