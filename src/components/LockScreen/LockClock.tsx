import { useNow } from '../../lock/useNow'

const dateFmt = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
const timeFmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })

/** Date (supporting) + time (most prominent). The year is never shown. */
export function LockClock() {
  const now = useNow()
  // en-GB gives "Wed 2 Dec" — no comma, no year.
  const date = dateFmt.format(now).replace(',', '')
  const time = timeFmt.format(now)

  return (
    <div className="lock-clock">
      <p className="lock-clock__date">{date}</p>
      <p className="lock-clock__time">
        <time dateTime={now.toISOString()}>{time}</time>
      </p>
    </div>
  )
}
