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

/** One user's workspace. Kept per user so switching users never mixes sessions. */
type Session = { openApps: string[]; settingsOpen: boolean }

const NEW_SESSION: Session = { openApps: [], settingsOpen: false }
const DEFAULT_USER: Record<Scenario, string> = { single: 'daniel', multi: 'hayden' }
// Figma "Unlocked Desktop" shows one app running; start the demo user with it open.
const initialSessions = (s: Scenario): Record<string, Session> => ({
  [DEFAULT_USER[s]]: { openApps: ['Records'], settingsOpen: false },
})

const ease = [0.23, 1, 0.32, 1] as const

export default function App() {
  const [scenario, setScenario] = useState<Scenario>('multi')
  const accounts = scenario === 'single' ? SINGLE_USER : MULTI_USERS
  // Live sessions by user id. Lock / switch keep them; only Log out removes one.
  // Everything here sits above the lock boundary, so it survives the workspace unmounting.
  const [sessions, setSessions] = useState(() => initialSessions('multi'))
  /** User whose session is in the foreground; null after Log out (sign-in screen). */
  const [activeId, setActiveId] = useState<string | null>(DEFAULT_USER.multi)
  /** Shown on the sign-in screen after Log out. */
  const [lastId, setLastId] = useState(DEFAULT_USER.multi)
  const [locked, setLocked] = useState<false | Mode>(false)
  const [sessionOpen, setSessionOpen] = useState(false)
  const [idleMs, setIdleMs] = useState<number | null>(DEFAULT_IDLE_TIMEOUT_MS)
  const [lockOnHidden, setLockOnHidden] = useState(DEFAULT_LOCK_ON_HIDDEN)

  const shownId = activeId ?? lastId
  const shownAccount = accounts.find((a) => a.id === shownId) ?? accounts[0]
  const session = (activeId && sessions[activeId]) || NEW_SESSION
  const updateSession = (patch: (s: Session) => Partial<Session>) => {
    if (!activeId) return
    setSessions((all) => {
      const cur = all[activeId] ?? NEW_SESSION
      return { ...all, [activeId]: { ...cur, ...patch(cur) } }
    })
  }
  const toggleApp = (app: string) =>
    updateSession((s) => ({
      openApps: s.openApps.includes(app) ? s.openApps.filter((a) => a !== app) : [...s.openApps, app],
    }))
  const setSettingsOpen = (open: boolean | ((o: boolean) => boolean)) =>
    updateSession((s) => ({ settingsOpen: typeof open === 'function' ? open(s.settingsOpen) : open }))

  const changeScenario = (next: Scenario) => {
    setScenario(next)
    setSessions(initialSessions(next))
    setActiveId(DEFAULT_USER[next])
    setLastId(DEFAULT_USER[next])
  }

  const lock = useCallback((mode: Mode = 'default') => {
    setSessionOpen(false)
    setLocked((l) => l || mode)
  }, [])

  // Unlock / sign in. The same user gets their session back untouched; another user
  // resumes their own background session, or starts a fresh one.
  const unlock = useCallback((account: Account) => {
    setSessions((all) => (all[account.id] ? all : { ...all, [account.id]: NEW_SESSION }))
    setActiveId(account.id)
    setLastId(account.id)
    setLocked(false)
  }, [])

  // Log out (after confirmation): end this user's session and go to the sign-in screen.
  const logout = () => {
    if (!activeId) return
    setSessions(({ [activeId]: _ended, ...rest }) => rest)
    setLastId(activeId)
    setActiveId(null)
    setSessionOpen(false)
    setLocked(accounts.length > 1 ? 'select' : 'default')
  }

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
            {/* Behind the session screen the desktop stays visible (blurred by the overlay) but inert. */}
            <Workspace openApps={session.openApps} onToggleApp={toggleApp} inactive={sessionOpen}>
              <AnimatePresence>
                {session.settingsOpen && (
                  <SettingsTray
                    account={shownAccount}
                    idleMs={idleMs}
                    onIdleMsChange={setIdleMs}
                    lockOnHidden={lockOnHidden}
                    onLockOnHiddenChange={setLockOnHidden}
                    onClose={() => setSettingsOpen(false)}
                    interactive={!sessionOpen}
                  />
                )}
              </AnimatePresence>
              <StatusBar
                settingsOpen={session.settingsOpen}
                onSettings={() => setSettingsOpen((o) => !o)}
                onSessionControl={() => setSessionOpen(true)}
              />
            </Workspace>
            <AnimatePresence>
              {sessionOpen && (
                <SessionControl
                  userName={shownAccount.name}
                  onLock={() => lock('default')}
                  onSwitchUsers={() => lock('select')}
                  onLogout={logout}
                  onClose={() => setSessionOpen(false)}
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {locked && (
          <LockScreen
            key="lock"
            accounts={accounts}
            currentId={shownAccount.id}
            hasSession={activeId !== null}
            initialMode={locked}
            onUnlock={unlock}
          />
        )}
      </AnimatePresence>

      {!locked && !sessionOpen && (
        <aside className="proto" aria-label="Prototype controls">
          <p className="proto__title">Prototype</p>
          <div className="proto__row">
            <span>Users</span>
            <div className="proto__seg">
              {(['single', 'multi'] as const).map((s) => (
                <button key={s} type="button" aria-pressed={scenario === s} onClick={() => changeScenario(s)}>
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
