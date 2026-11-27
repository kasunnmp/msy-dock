import { AnimatePresence, motion } from 'motion/react'
import { useAccounts } from '../../accounts/useAccounts'
import { AccountAvatar } from './AccountAvatar'
import './AccountSwitcher.css'

const EASE_OUT = [0.23, 1, 0.32, 1] as const

/** Covers the desktop while the signed-in account changes. */
export function SwitchingOverlay() {
  const { switchingTo } = useAccounts()
  return (
    <AnimatePresence>
      {switchingTo && (
        <motion.div
          key="switching"
          className="switching-overlay"
          role="status"
          aria-live="polite"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.2, ease: EASE_OUT } }}
          exit={{ opacity: 0, transition: { duration: 0.3, ease: EASE_OUT } }}
        >
          <motion.div
            className="switching-overlay__card"
            initial={{ y: 6, scale: 0.97 }}
            animate={{ y: 0, scale: 1, transition: { duration: 0.25, ease: EASE_OUT } }}
          >
            <AccountAvatar account={switchingTo} size={72} />
            <span className="switching-overlay__name">{switchingTo.name}</span>
            <span className="switching-overlay__label">
              <span className="switching-overlay__spinner" aria-hidden />
              Switching account…
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
