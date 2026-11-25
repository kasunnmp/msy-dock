import glowPng from '../../assets/lock/status-bar-glow.png'
import settingsSvg from '../../assets/lock/settings.svg'
import powerSvg from '../../assets/lock/power.svg'
import tagsSvg from '../../assets/lock/action-hub-tags.svg'
import graphSvg from '../../assets/lock/graph.svg'
import bellSvg from '../../assets/lock/bell.svg'
import { useNow } from '../../lock/useNow'
import './StatusBar.css'

const fmt = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

type Props = {
  onSessionControl: () => void
}

export function StatusBar({ onSessionControl }: Props) {
  const now = useNow()
  const parts = fmt.formatToParts(now)
  const get = (t: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === t)?.value ?? ''
  const label = `${get('weekday')} ${get('day')} ${get('month')}  ${get('hour')}:${get('minute')}`

  return (
    <header className="status-bar">
      <img className="status-bar__glow" src={glowPng} alt="" aria-hidden draggable={false} />
      <div className="status-bar__items">
        <span className="status-bar__date">{label}</span>
        <button type="button" className="status-bar__icon status-bar__icon--settings" aria-label="Settings">
          <img src={settingsSvg} alt="" width={24} height={24} />
        </button>
        <button
          type="button"
          className="status-bar__icon status-bar__icon--power"
          aria-label="Session controls"
          title="Session controls"
          onClick={onSessionControl}
        >
          <img src={powerSvg} alt="" width={20} height={20} />
        </button>
        <span className="status-bar__pill status-bar__pill--hub" aria-label="Action hub, 5 items">
          <span className="status-bar__count">
            <img src={tagsSvg} alt="" width={24} height={10} />5
          </span>
          <span className="status-bar__pill-icon">
            <img src={graphSvg} alt="" width={22} height={22} />
          </span>
        </span>
        <span className="status-bar__pill" aria-label="6 notifications">
          <span className="status-bar__count">6</span>
          <span className="status-bar__pill-icon">
            <img src={bellSvg} alt="" width={22} height={22} />
          </span>
        </span>
      </div>
    </header>
  )
}
