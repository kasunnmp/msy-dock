import { createContext, useContext } from 'react'
import type { Account } from './accounts'

export type AccountState = {
  accounts: Account[]
  active: Account
  /** The account being switched to while the overlay is up, else null. */
  switchingTo: Account | null
  switchTo: (id: string) => void
}

export const AccountContext = createContext<AccountState | null>(null)

export function useAccounts() {
  const ctx = useContext(AccountContext)
  if (!ctx) throw new Error('useAccounts must be used inside <AccountProvider>')
  return ctx
}
