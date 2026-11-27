import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useAccounts } from '../../accounts/useAccounts'
import { AccountAvatar } from './AccountAvatar'
import './AccountSwitcher.css'

const EASE_OUT = [0.23, 1, 0.32, 1] as const

/** Menu-bar button showing the signed-in account, with a menu to switch accounts. */
export function AccountSwitcher() {
  const { accounts, active, switchTo } = useAccounts()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const menuId = useId()

  const close = (returnFocus = true) => {
    setOpen(false)
    if (returnFocus) buttonRef.current?.focus()
  }

  // Close when clicking anywhere outside the switcher.
  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  // Focus the active account when the menu opens.
  useEffect(() => {
    if (!open) return
    const i = accounts.findIndex((a) => a.id === active.id)
    itemRefs.current[Math.max(i, 0)]?.focus()
  }, [open, accounts, active.id])

  const onMenuKeyDown = (e: KeyboardEvent) => {
    const items = itemRefs.current.filter((el): el is HTMLButtonElement => el !== null)
    const i = items.indexOf(document.activeElement as HTMLButtonElement)
    const focusAt = (n: number) => items[(n + items.length) % items.length]?.focus()
    if (e.key === 'ArrowDown') focusAt(i + 1)
    else if (e.key === 'ArrowUp') focusAt(i - 1)
    else if (e.key === 'Home') focusAt(0)
    else if (e.key === 'End') focusAt(items.length - 1)
    else if (e.key === 'Escape') close()
    else if (e.key === 'Tab') close(false)
    else return
    if (e.key !== 'Tab') e.preventDefault()
  }

  return (
    <div className="account-switcher" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className="account-switcher__button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`Signed in as ${active.name}. Switch account`}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' && !open) {
            e.preventDefault()
            setOpen(true)
          }
        }}
      >
        <AccountAvatar account={active} size={20} />
        <span className="account-switcher__name">{active.name}</span>
        <svg className="account-switcher__chevron" width="9" height="6" viewBox="0 0 9 6" aria-hidden>
          <path d="M1 1.25 4.5 4.75 8 1.25" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="menu"
            id={menuId}
            className="account-menu"
            role="menu"
            aria-label="Switch account"
            onKeyDown={onMenuKeyDown}
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.18, ease: EASE_OUT } }}
            exit={{ opacity: 0, y: -4, scale: 0.97, transition: { duration: 0.12, ease: EASE_OUT } }}
          >
            <p className="account-menu__heading" aria-hidden>
              Switch account
            </p>
            {accounts.map((account, i) => {
              const current = account.id === active.id
              return (
                <button
                  key={account.id}
                  ref={(el) => {
                    itemRefs.current[i] = el
                  }}
                  type="button"
                  role="menuitemradio"
                  aria-checked={current}
                  tabIndex={-1}
                  className="account-menu__item"
                  onClick={() => {
                    close()
                    switchTo(account.id)
                  }}
                >
                  <AccountAvatar account={account} size={32} />
                  <span className="account-menu__text">
                    <span className="account-menu__name">{account.name}</span>
                    <span className="account-menu__meta">
                      {account.role} · {account.clinic}
                    </span>
                  </span>
                  {current ? (
                    <svg className="account-menu__check" width="14" height="14" viewBox="0 0 14 14" aria-hidden>
                      <path d="M2.5 7.5 5.5 10.5 11.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : account.unread.messages > 0 ? (
                    <span className="account-menu__unread" aria-label={`${account.unread.messages} unread`}>
                      {account.unread.messages}
                    </span>
                  ) : null}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
