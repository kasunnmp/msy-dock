import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import type { Account } from '../../lock/accounts'
import { ACCOUNT_SELECTION_TIMEOUT_MS } from '../../lock/config'
import lockWallpaper from '../../assets/lock/lock-wallpaper-lowres.jpg'
import arrowBackSvg from '../../assets/lock/arrow-back.svg'
import addSvg from '../../assets/lock/add.svg'
import { AccountTile } from './AccountTile'
import { AccountPager } from './AccountPager'
import { LockClock } from './LockClock'
import { LockFooter } from './LockFooter'
import { PasskeyPrompt } from './PasskeyPrompt'
import './LockScreen.css'

type Props = {
  accounts: Account[]
  currentId: string
  /** Called after successful passkey auth with the account that unlocked. */
  onUnlock: (account: Account) => void
  selectionTimeoutMs?: number
  /** Open straight into account selection (e.g. from "Switch users"). */
  initialMode?: Mode
}

export type Mode = 'default' | 'select'

const ease = [0.23, 1, 0.32, 1] as const

/**
 * The locked state. Renders only:
 *  - a pre-blurred, low-resolution copy of the wallpaper (the sharp original is never loaded here)
 *  - the clock, the locked identity and the auth / switch-account controls
 * The workspace itself is unmounted by the parent while this is shown.
 */
export function LockScreen({
  accounts,
  currentId,
  onUnlock,
  selectionTimeoutMs = ACCOUNT_SELECTION_TIMEOUT_MS,
  initialMode = 'default',
}: Props) {
  const [mode, setMode] = useState<Mode>(accounts.length > 1 ? initialMode : 'default')
  const [passkeyFor, setPasskeyFor] = useState<Account | null>(null)
  const [hint, setHint] = useState<string | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  const current = accounts.find((a) => a.id === currentId) ?? accounts[0]
  const multi = accounts.length > 1

  // Account-selection → default after N ms without interaction (paused while the passkey sheet is up).
  useEffect(() => {
    if (mode !== 'select' || passkeyFor) return
    let id = window.setTimeout(() => setMode('default'), selectionTimeoutMs)
    const reset = () => {
      window.clearTimeout(id)
      id = window.setTimeout(() => setMode('default'), selectionTimeoutMs)
    }
    const events = ['pointermove', 'pointerdown', 'keydown', 'wheel'] as const
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }))
    return () => {
      window.clearTimeout(id)
      events.forEach((e) => window.removeEventListener(e, reset))
    }
  }, [mode, passkeyFor, selectionTimeoutMs])

  useEffect(() => {
    if (mode !== 'select' || passkeyFor) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMode('default')
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mode, passkeyFor])

  useEffect(() => {
    if (!hint) return
    const id = window.setTimeout(() => setHint(null), 2600)
    return () => window.clearTimeout(id)
  }, [hint])

  useEffect(() => rootRef.current?.focus(), [])

  const handleSuccess = useCallback(() => {
    if (passkeyFor) onUnlock(passkeyFor)
  }, [passkeyFor, onUnlock])
  const handleCancel = useCallback(() => setPasskeyFor(null), [])

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        ref={rootRef}
        className="lock"
        role="dialog"
        aria-modal="true"
        aria-label={`Maisey OS is locked. Signed in as ${current.name}`}
        tabIndex={-1}
        onContextMenu={(e) => e.preventDefault()}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.25 } }}
        transition={{ duration: 0.35, ease }}
      >
        {/* Pre-blurred low-res image as a CSS background: nothing sharp to extract. */}
        <div className="lock__wallpaper" style={{ backgroundImage: `url(${lockWallpaper})` }} aria-hidden />
        <div className="lock__fog" aria-hidden />

        <motion.div
          className="lock__clock"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease, delay: 0.05 }}
        >
          <LockClock />
        </motion.div>

        <AnimatePresence mode="wait" initial={false}>
          {mode === 'default' ? (
            <motion.div
              key="default"
              className="lock__default"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.22, ease }}
            >
              <div className="lock__current">
                <AccountTile
                  account={current}
                  onSelect={setPasskeyFor}
                  label={`Unlock as ${current.name} with passkey`}
                />
              </div>

              {multi && (
                <div className="lock__actions">
                  <button type="button" className="pill pill--tertiary" onClick={() => setMode('select')}>
                    Switch account
                  </button>
                  <button
                    type="button"
                    className="pill"
                    onClick={() => setHint('Password sign-in is defined separately.')}
                  >
                    Enter Password
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="select"
              className="lock__select-layer"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.22, ease }}
            >
              <div className="lock__select">
              <AccountPager
                accounts={accounts}
                currentId={current.id}
                onSelect={setPasskeyFor}
                paused={!!passkeyFor}
              />
              <div className="lock__select-actions">
                <button
                  type="button"
                  className="icon-pill"
                  aria-label="Back"
                  onClick={() => setMode('default')}
                >
                  <span className="icon-pill__icon">
                    <img src={arrowBackSvg} alt="" width={24} height={24} />
                  </span>
                </button>
                <button
                  type="button"
                  className="pill pill--tertiary"
                  onClick={() => setHint('Adding accounts is defined separately.')}
                >
                  <span className="icon-pill__icon">
                    <img src={addSvg} alt="" width={24} height={24} />
                  </span>
                  Add account
                </button>
              </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {hint && (
            <motion.p
              className="lock__hint"
              role="status"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {hint}
            </motion.p>
          )}
        </AnimatePresence>

        <LockFooter />

        <AnimatePresence>
          {passkeyFor && (
            <PasskeyPrompt
              key={passkeyFor.id}
              account={passkeyFor}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </MotionConfig>
  )
}
