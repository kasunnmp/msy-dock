import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import lockSvg from '../../assets/lock/lock.svg'
import switchUserSvg from '../../assets/lock/switch-user.svg'
import logoutSvg from '../../assets/lock/logout.svg'
import './SessionControl.css'

type Props = {
  onLock: () => void
  onSwitchUsers: () => void
  onLogout: () => void
  onClose: () => void
}

/** Full-screen session control (Figma "Logout" frame): Lock screen / Switch users / Log out. */
export function SessionControl({ onLock, onSwitchUsers, onLogout, onClose }: Props) {
  const firstRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    firstRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <motion.div
      className="session"
      role="dialog"
      aria-modal="true"
      aria-label="Session controls"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="session__row"
        initial={{ scale: 0.96 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.96 }}
        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
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
        <button type="button" className="session__btn" onClick={onLogout}>
          <span className="session__circle session__circle--strong">
            <img src={logoutSvg} alt="" width={40} height={40} />
          </span>
          Log out
        </button>
      </motion.div>
    </motion.div>
  )
}
