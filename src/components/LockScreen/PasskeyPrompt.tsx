import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import type { Account } from '../../lock/accounts'

type Props = {
  account: Account
  onSuccess: () => void
  onCancel: () => void
}

/**
 * Stand-in for the browser/OS passkey sheet. In production this is
 * `navigator.credentials.get({ publicKey })` and the native dialog appears;
 * the prototype simulates it so the flow can be clicked through without a
 * registered credential.
 */
export function PasskeyPrompt({ account, onSuccess, onCancel }: Props) {
  const [verifying, setVerifying] = useState(false)
  const sensorRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    sensorRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onCancel])

  useEffect(() => {
    if (!verifying) return
    const id = window.setTimeout(onSuccess, 650)
    return () => window.clearTimeout(id)
  }, [verifying, onSuccess])

  const handle = `${account.name.toLowerCase()}@${(account.org?.name ?? 'maisey').toLowerCase()}.com`

  return (
    <motion.div
      className="passkey"
      role="dialog"
      aria-modal="true"
      aria-labelledby="passkey-title"
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.12 } }}
      transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
    >
      <p className="passkey__source">
        <KeyIcon /> Passkey
      </p>
      <h2 id="passkey-title" className="passkey__title">
        Use your saved passkey for Maisey OS
      </h2>
      <p className="passkey__sub">Maisey OS wants to verify it’s you</p>

      <div className="passkey__account">
        <UserIcon />
        <div>
          <p className="passkey__handle">{handle}</p>
          <p className="passkey__kind">Passkey</p>
        </div>
      </div>

      <button
        ref={sensorRef}
        type="button"
        className="passkey__sensor"
        data-verifying={verifying || undefined}
        onClick={() => setVerifying(true)}
        disabled={verifying}
      >
        <FingerprintIcon />
        <span>{verifying ? 'Verifying…' : 'Touch ID to continue'}</span>
      </button>

      <div className="passkey__actions">
        <button type="button" className="passkey__btn" disabled={verifying}>
          Use a different passkey
        </button>
        <button type="button" className="passkey__btn" onClick={onCancel} disabled={verifying}>
          Cancel
        </button>
      </div>
    </motion.div>
  )
}

function KeyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="8" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M12 12h9M18 12v3M21 12v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="9" cy="8" r="4" fill="currentColor" />
      <path d="M1.5 20c0-3.6 3.4-6 7.5-6s7.5 2.4 7.5 6" fill="currentColor" />
      <path d="M17 8h5M19.5 5.5v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function FingerprintIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" aria-hidden>
      <g stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
        <path d="M5 9.5a7.5 7.5 0 0 1 14 0" />
        <path d="M7.5 19.5c-1-1.6-1.5-3.6-1.5-6a6 6 0 0 1 12 0v.5" />
        <path d="M9 13.5a3 3 0 0 1 6 0c0 2.6-.4 4.8-1.2 6.5" />
        <path d="M12 13.5c0 3-.6 5.3-1.8 7" />
        <path d="M17.6 17.5c-.2 1.2-.5 2.3-.9 3.2" />
      </g>
    </svg>
  )
}
