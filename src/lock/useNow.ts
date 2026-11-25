import { useEffect, useState } from 'react'

/** Re-renders on each minute boundary. */
export function useNow(): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    let id: number
    const tick = () => {
      const d = new Date()
      setNow(d)
      id = window.setTimeout(tick, 60_000 - (d.getSeconds() * 1000 + d.getMilliseconds()) + 20)
    }
    tick()
    return () => window.clearTimeout(id)
  }, [])
  return now
}
