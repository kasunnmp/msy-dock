import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { Workspace } from './Workspace'
import { StatusBar } from './components/StatusBar/StatusBar'
import { SessionControl } from './components/SessionControl/SessionControl'
import { SettingsTray } from './components/SettingsTray/SettingsTray'
import { LockScreen, type Mode } from './components/LockScreen/LockScreen'
import { MULTI_USERS, SINGLE_USER, type Account } from './lock/accounts'
import { DEFAULT_IDLE_TIMEOUT_MS, DEFAULT_LOCK_ON_HIDDEN, IDLE_OPTIONS } from './lock/config'
import './App.css'

type Scenario = 'single' | 'multi'

const ease = [0.23, 1, 0.32, 1] as const

export default function App() {
  const [scenario, setScenario] = useState<Scenario>('multi')
  const accounts = scenario === 'single' ? SINGLE_USER : MULTI_USERS
  const [currentId, setCurrentId] = useState('hayden')
  const [locked, setLocked] = useState<false | Mode>(false)
  const [sessionOpen, setSessionOpen] = useState(false)
  // Workspace state that must survive a lock/unlock cycle lives here, above the lock boundary.
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [idleMs, setIdleMs] = useState<number | null>(DEFAULT_IDLE_TIMEOUT_MS)
  const [lockOnHidden, setLockOnHidden] = useState(DEFAULT_LOCK_ON_HIDDEN)

  const effectiveCurrentId = accounts.some((a) => a.id === currentId) ? currentId : accounts[0].id

  const lock = useCallback((mode: Mode = 'default') => {
    setSessionOpen(false)
    setLocked((l) => l || mode)
  }, [])

  const unlock = useCallback((account: Account) => {
    // Switching to another profile: the detailed multi-account behaviour is defined
    // separately; the prototype simply continues as that account.
    setCurrentId(account.id)
    setLocked(false)
  }, [])

  // 1. Automatic lock after inactivity (timeout comes from Advanced Settings).
  useEffect(() => {
    if (locked || idleMs == null) return
    let id = window.setTimeout(() => lock(), idleMs)
    const reset = () => {
      window.clearTimeout(id)
      id = window.setTimeout(() => lock(), idleMs)
    }
    const events = ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart'] as const
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }))
    return () => {
      window.clearTimeout(id)
      events.forEach((e) => window.removeEventListener(e, reset))
    }
  }, [locked, idleMs, lock])

  // 2. Device / browser moves into a protected state (tab hidden, window minimised).
  useEffect(() => {
    if (!lockOnHidden) return
    const onVis = () => document.visibilityState === 'hidden' && lock()
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [lockOnHidden, lock])

  // 3. Manual: keyboard shortcut (Ctrl/⌘ + Shift + L) in addition to Session controls.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'l') {
        e.preventDefault()
        lock()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lock])

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {!locked && (
          // The workspace is unmounted while locked so nothing from it stays in the DOM.
          // On lock it blurs and fades out underneath the lock screen.
          <motion.div
            key="workspace"
            className="workspace-layer"
            initial={{ opacity: 0, filter: 'blur(24px)', scale: 1.02 }}
            animate={{ opacity: 1, filter: 'blur(0px)', scale: 1, transitionEnd: { filter: 'none' } }}
            exit={{ opacity: 0, filter: 'blur(24px)', scale: 0.985 }}
            transition={{ duration: 0.45, ease }}
          >
            <Workspace>
              <AnimatePresence>
                {settingsOpen && (
                  <SettingsTray
                    account={accounts.find((x) => x.id === effectiveCurrentId) ?? accounts[0]}
                    idleMs={idleMs}
                    onIdleMsChange={setIdleMs}
                    lockOnHidden={lockOnHidden}
                    onLockOnHiddenChange={setLockOnHidden}
                    onClose={() => setSettingsOpen(false)}
                  />
                )}
              </AnimatePresence>
              <StatusBar
                settingsOpen={settingsOpen}
                onSettings={() => setSettingsOpen((o) => !o)}
                onSessionControl={() => setSessionOpen(true)}
              />
              <AnimatePresence>
                {sessionOpen && (
                  <SessionControl
                    onLock={() => lock('default')}
                    onSwitchUsers={() => lock('select')}
                    onLogout={() => setSessionOpen(false)}
                    onClose={() => setSessionOpen(false)}
                  />
                )}
              </AnimatePresence>
            </Workspace>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {locked && (
          <LockScreen
            key="lock"
            accounts={accounts}
            currentId={effectiveCurrentId}
            initialMode={locked}
            onUnlock={unlock}
          />
        )}
      </AnimatePresence>

      {!locked && (
        <aside className="proto" aria-label="Prototype controls">
          <p className="proto__title">Prototype</p>
          <div className="proto__row">
            <span>Users</span>
            <div className="proto__seg">
              {(['single', 'multi'] as const).map((s) => (
                <button key={s} type="button" aria-pressed={scenario === s} onClick={() => setScenario(s)}>
                  {s === 'single' ? 'Single' : 'Multiple'}
                </button>
              ))}
            </div>
          </div>
          <div className="proto__row">
            <span>Auto-lock</span>
            <div className="proto__seg">
              {IDLE_OPTIONS.map((o) => (
                <button key={o.label} type="button" aria-pressed={idleMs === o.ms} onClick={() => setIdleMs(o.ms)}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          <label className="proto__row">
            <span>Lock when tab hidden</span>
            <input type="checkbox" checked={lockOnHidden} onChange={(e) => setLockOnHidden(e.target.checked)} />
          </label>
          <button type="button" className="proto__lock" onClick={() => lock()}>
            Lock now <kbd>⌘/Ctrl ⇧ L</kbd>
          </button>
        </aside>
      )}
    </MotionConfig>
  )
}
