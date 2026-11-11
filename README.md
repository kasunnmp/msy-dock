# Maisey Dock

A macOS-style magnifying dock with tooltips, built from the Maisey Patient Records Figma design.

- Icons magnify with a spring as the cursor approaches and push their neighbours aside.
- A tooltip with the item's name appears above the hovered (or keyboard-focused) icon.

## Run

```bash
npm install
npm run dev
```

## Structure

- `src/components/Dock/Dock.tsx` – reusable `Dock`, `DockItem`, `DockBadge`, `DockSeparator` (tune `magnification`, `distance`, `spring`).
- `src/components/Dock/AskMaisey.tsx` – the "Ask Maisey" pill (static, not magnified).
- `src/App.tsx` – dock contents and labels.
- `src/assets/dock/` – assets exported from Figma.
