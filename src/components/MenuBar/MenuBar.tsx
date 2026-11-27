import { useEffect, useState } from 'react'
import { MotionConfig } from 'motion/react'
import { AccountSwitcher } from '../AccountSwitcher/AccountSwitcher'
import './MenuBar.css'

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 15_000)
    return () => window.clearInterval(t)
  }, [])
  return now
}

/** Top bar of Maisey OS: brand on the left, clock and account switcher on the right. */
export function MenuBar() {
  const now = useClock()
  return (
    <MotionConfig reducedMotion="user">
      <header className="menu-bar">
        <span className="menu-bar__brand">Maisey</span>
        <span className="menu-bar__right">
          <time className="menu-bar__clock" dateTime={now.toISOString()}>
            {now.toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}
          </time>
          <AccountSwitcher />
        </span>
      </header>
    </MotionConfig>
  )
}
