// Lock-screen behaviour knobs. In the product these come from
// Advanced Settings (session timeout) and remote config; here they are
// constants the prototype panel can override at runtime.

/** Idle time before the session locks automatically. */
export const DEFAULT_IDLE_TIMEOUT_MS = 5 * 60 * 1000

/** Account-selection state returns to the default locked state after this much inactivity. */
export const ACCOUNT_SELECTION_TIMEOUT_MS = 15 * 1000

/** Lock when the tab/window is hidden (device or browser moves into a protected state). */
export const DEFAULT_LOCK_ON_HIDDEN = true

/** Placeholder destinations on the MediTrust website. */
export const LEGAL_LINKS = {
  terms: 'https://www.meditrust.com/terms',
  privacy: 'https://www.meditrust.com/privacy',
  help: 'https://www.meditrust.com/support',
}

/** Placeholder legal text (may change later). */
export const LEGAL_TEXT = '© 2026 MediTrust. All Rights Reserved.'

export const LANGUAGES = ['English (United States)', 'English (United Kingdom)', 'Deutsch', 'Français']

/** Choices offered in Settings → Advanced → Lock screen. */
export const IDLE_OPTIONS: { label: string; ms: number | null }[] = [
  { label: '15 s', ms: 15_000 },
  { label: '1 min', ms: 60_000 },
  { label: '5 min', ms: DEFAULT_IDLE_TIMEOUT_MS },
  { label: 'Never', ms: null },
]
