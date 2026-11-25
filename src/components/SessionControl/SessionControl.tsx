import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import lockSvg from '../../assets/lock/lock.svg'
import switchUserSvg from '../../assets/lock/switch-user.svg'
import logoutSvg from '../../assets/lock/logout.svg'
import './SessionControl.css'

type Props = {
  userName: string
  onLock: () => void
  onSwitchUsers: () => void
  onLogout: () => void
  onClose: () => void
}

const ease = [0.23, 1, 0.32, 1] as const

/**
 * Full-screen session actions (Figma "Logout" frame), shown over the blurred, inert desktop.
 * Lock and Switch act immediately; Log out is destructive, so it asks first.
 */
export function SessionControl({ userName, onLock, onSwitchUsers, onLogout, onClose }: Props) {
  const [confirming, setConfirming] = useState(false)
  const firstRef = useRef<HTMLButtonElement>(null)
  const logoutRef = useRef<HTMLButtonElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (confirming) cancelRef.current?.focus()
    else firstRef.current?.focus()
  }, [confirming])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (confirming) {
        setConfirming(false)
        // Return focus to the action that opened the dialog.
        requestAnimationFrame(() => logoutRef.current?.focus())
      } else onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [confirming, onClose])

  return (
    <motion.div
      className="session"
      role="dialog"
      aria-modal="true"
      aria-label="Session controls"
      onClick={(e) => e.target === e.currentTarget && !confirming && onClose()}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="session__row"
        inert={confirming}
        initial={{ scale: 0.96 }}
        animate={{ scale: 1, opacity: confirming ? 0.35 : 1, filter: confirming ? 'blur(2px)' : 'blur(0px)' }}
        exit={{ scale: 0.96 }}
        transition={{ duration: 0.2, ease }}
      >
        <button ref={firstRef} type="button" className="session__btn" onClick={onLock}>
          <span className="session__circle">
            <img src={lockSvg} alt="" width={40} height={40} />
          </span>
          Lock screen
        </button>
        <button type="button" className="session__btn" onClick={onSwitchUsers}>
          <span className="session__circle">
            <img src={switchUserSvg} alt="" width={40} height={40} />
          </span>
          Switch users
        </button>
        <button ref={logoutRef} type="button" className="session__btn" onClick={() => setConfirming(true)}>
          <span className="session__circle session__circle--strong">
            <img src={logoutSvg} alt="" width={40} height={40} />
          </span>
          Log out
        </button>
      </motion.div>

      <AnimatePresence>
        {confirming && (
          <motion.div
            className="session-confirm"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            aria-describedby="logout-desc"
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97, pointerEvents: 'none', transition: { duration: 0.12 } }}
            transition={{ duration: 0.22, ease }}
          >
            <h2 id="logout-title" className="session-confirm__title">
              Log out of Maisey OS?
            </h2>
            <p id="logout-desc" className="session-confirm__body">
              This ends {userName}’s session. Open apps will close and unsaved work may be lost. You’ll need to
              sign in again.
            </p>
            <div className="session-confirm__actions">
              <button
                ref={cancelRef}
                type="button"
                className="session-confirm__btn"
                onClick={() => {
                  setConfirming(false)
                  requestAnimationFrame(() => logoutRef.current?.focus())
                }}
              >
                Cancel
              </button>
              <button type="button" className="session-confirm__btn session-confirm__btn--danger" onClick={onLogout}>
                Log out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
