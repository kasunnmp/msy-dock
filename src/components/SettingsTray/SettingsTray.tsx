import { useEffect, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { Account } from '../../lock/accounts'
import { IDLE_OPTIONS } from '../../lock/config'
import paletteSvg from '../../assets/lock/palette.svg'
import maiseyOsSvg from '../../assets/lock/maiseyos.svg'
import advancedSvg from '../../assets/lock/advanced.svg'
import chevronSvg from '../../assets/lock/chevron-right.svg'
import maskSvg from '../../assets/lock/settings-mask.svg'
import './SettingsTray.css'

type Props = {
  account: Account
  idleMs: number | null
  onIdleMsChange: (ms: number | null) => void
  lockOnHidden: boolean
  onLockOnHiddenChange: (v: boolean) => void
  onClose: () => void
}

const ease = [0.23, 1, 0.32, 1] as const

/** Figma "Settings" sidebar: right-hand frosted tray with four menu items. */
export function SettingsTray({
  account,
  idleMs,
  onIdleMsChange,
  lockOnHidden,
  onLockOnHiddenChange,
  onClose,
}: Props) {
  const [advancedOpen, setAdvancedOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <motion.div
      className="settings"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className="settings__bg"
        style={{ maskImage: `url("${maskSvg}")`, WebkitMaskImage: `url("${maskSvg}")` }}
        aria-hidden
      />
      <motion.aside
        className="settings__tray"
        aria-label="Settings"
        initial={{ x: 24 }}
        animate={{ x: 0 }}
        exit={{ x: 24 }}
        transition={{ duration: 0.28, ease }}
      >
        <h2 className="settings__title">Settings</h2>
        <ul className="settings__list">
          <li>
            <MenuItem
              icon={
                <span className="settings__avatar avatar">
                  {account.avatar.map((s) => (
                    <img key={s} src={s} alt="" />
                  ))}
                </span>
              }
              title={account.name}
              sub="Account information"
            />
          </li>
          <li>
            <MenuItem icon={<IconCircle src={paletteSvg} />} title="Appearance" sub="Personalise desktop" />
          </li>
          <li>
            <MenuItem icon={<IconCircle src={maiseyOsSvg} />} title="MaiseyOS" sub="Version information" />
          </li>
          <li>
            <MenuItem
              icon={<IconCircle src={advancedSvg} />}
              title="Advanced"
              sub="System preferences"
              expanded={advancedOpen}
              onClick={() => setAdvancedOpen((o) => !o)}
            />
            <AnimatePresence initial={false}>
              {advancedOpen && (
                <motion.div
                  className="settings__panel-wrap"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.24, ease }}
                >
                  <div className="settings__panel">
                    <p className="settings__panel-title">Lock screen</p>
                    <div className="settings__row">
                      <span>Lock after inactivity</span>
                    </div>
                    <div className="settings__seg" role="radiogroup" aria-label="Lock after inactivity">
                      {IDLE_OPTIONS.map((o) => (
                        <button
                          key={o.label}
                          type="button"
                          role="radio"
                          aria-checked={idleMs === o.ms}
                          onClick={() => onIdleMsChange(o.ms)}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                    <label className="settings__row settings__row--toggle">
                      <span>Lock when window is hidden</span>
                      <input
                        type="checkbox"
                        checked={lockOnHidden}
                        onChange={(e) => onLockOnHiddenChange(e.target.checked)}
                      />
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        </ul>
      </motion.aside>
    </motion.div>
  )
}

function IconCircle({ src }: { src: string }) {
  return (
    <span className="settings__icon">
      <img src={src} alt="" width={24} height={24} />
    </span>
  )
}

function MenuItem({
  icon,
  title,
  sub,
  expanded,
  onClick,
}: {
  icon: ReactNode
  title: string
  sub: string
  expanded?: boolean
  onClick?: () => void
}) {
  return (
    <button type="button" className="settings__item" onClick={onClick} aria-expanded={expanded}>
      <span className="settings__item-glass" aria-hidden />
      {icon}
      <span className="settings__item-body">
        <span className="settings__item-title">{title}</span>
        <span className="settings__item-sub">{sub}</span>
      </span>
      <img className="settings__chevron" src={chevronSvg} alt="" width={25} height={25} />
    </button>
  )
}
