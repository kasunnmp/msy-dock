import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { ACCOUNTS, DEFAULT_ACCOUNT_ID, type Account } from './accounts'
import { AccountContext } from './useAccounts'

const STORAGE_KEY = 'maisey.activeAccount'

/** How long the switching overlay covers the desktop before the new account is shown (ms). */
const SWITCH_HOLD = 650

function readStoredId() {
  try {
    const id = localStorage.getItem(STORAGE_KEY)
    return ACCOUNTS.some((a) => a.id === id) ? id! : DEFAULT_ACCOUNT_ID
  } catch {
    return DEFAULT_ACCOUNT_ID
  }
}

export function AccountProvider({ children }: { children: ReactNode }) {
  const [activeId, setActiveId] = useState(readStoredId)
  const [switchingTo, setSwitchingTo] = useState<Account | null>(null)
  const timer = useRef<number | undefined>(undefined)

  const active = ACCOUNTS.find((a) => a.id === activeId) ?? ACCOUNTS[0]

  const switchTo = useCallback(
    (id: string) => {
      const next = ACCOUNTS.find((a) => a.id === id)
      if (!next || id === activeId || switchingTo) return
      setSwitchingTo(next)
      // Swap the desktop while the overlay hides it, then let the overlay fade out.
      timer.current = window.setTimeout(() => {
        setActiveId(id)
        setSwitchingTo(null)
        try {
          localStorage.setItem(STORAGE_KEY, id)
        } catch {
          /* storage unavailable: the switch still applies for this session */
        }
      }, SWITCH_HOLD)
    },
    [activeId, switchingTo],
  )

  useEffect(() => () => window.clearTimeout(timer.current), [])

  return (
    <AccountContext.Provider value={{ accounts: ACCOUNTS, active, switchingTo, switchTo }}>
      {children}
    </AccountContext.Provider>
  )
}
