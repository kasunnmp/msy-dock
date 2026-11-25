import { useEffect, useRef, useState, type WheelEvent } from 'react'
import { AnimatePresence, motion, type PanInfo } from 'motion/react'
import type { Account } from '../../lock/accounts'
import { AccountTile } from './AccountTile'

/** Figma grid: 4 columns × 2 rows. */
export const ACCOUNTS_PER_PAGE = 8

type Props = {
  accounts: Account[]
  currentId: string
  onSelect: (account: Account) => void
  /** Disable keyboard paging while something sits on top (e.g. the passkey sheet). */
  paused?: boolean
}

const ease = [0.23, 1, 0.32, 1] as const

/**
 * Account-selection grid with page indicators. Change page with the dots,
 * ← / → keys, a horizontal swipe/drag, or a horizontal trackpad scroll.
 */
export function AccountPager({ accounts, currentId, onSelect, paused }: Props) {
  const pageCount = Math.max(1, Math.ceil(accounts.length / ACCOUNTS_PER_PAGE))
  // Open on the page that holds the locked (active) account.
  const [[page, dir], setPage] = useState(() => {
    const i = accounts.findIndex((a) => a.id === currentId)
    return [i < 0 ? 0 : Math.floor(i / ACCOUNTS_PER_PAGE), 0]
  })

  const go = (next: number) => {
    const clamped = Math.min(pageCount - 1, Math.max(0, next))
    if (clamped !== page) setPage([clamped, clamped > page ? 1 : -1])
  }

  useEffect(() => {
    if (paused || pageCount < 2) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(page + 1)
      if (e.key === 'ArrowLeft') go(page - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  // Horizontal trackpad scroll: one page per gesture.
  const [wheelLock, setWheelLock] = useState(false)
  const onWheel = (e: WheelEvent) => {
    if (wheelLock || Math.abs(e.deltaX) < 30 || Math.abs(e.deltaX) < Math.abs(e.deltaY)) return
    go(page + (e.deltaX > 0 ? 1 : -1))
    setWheelLock(true)
    window.setTimeout(() => setWheelLock(false), 450)
  }

  // A drag ends with a pointerup on a tile; don't let that count as choosing it.
  const dragged = useRef(false)
  const select = (a: Account) => {
    if (dragged.current) return
    onSelect(a)
  }

  const onDragEnd = (_: unknown, info: PanInfo) => {
    window.setTimeout(() => (dragged.current = false), 0)
    if (info.offset.x < -60 || info.velocity.x < -400) go(page + 1)
    else if (info.offset.x > 60 || info.velocity.x > 400) go(page - 1)
  }

  const visible = accounts.slice(page * ACCOUNTS_PER_PAGE, (page + 1) * ACCOUNTS_PER_PAGE)

  return (
    <div className="pager" onWheel={onWheel}>
      <div className="pager__viewport">
        <AnimatePresence mode="popLayout" initial={false} custom={dir}>
          <motion.div
            key={page}
            className="lock__grid"
            role="group"
            aria-label={`Choose an account, page ${page + 1} of ${pageCount}`}
            custom={dir}
            variants={{
              enter: (d: number) => ({ x: d * 80, opacity: 0 }),
              center: { x: 0, opacity: 1 },
              exit: (d: number) => ({ x: d * -80, opacity: 0 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease }}
            drag={pageCount > 1 ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.25}
            onDragStart={() => (dragged.current = true)}
            onDragEnd={onDragEnd}
          >
            {visible.map((a) => (
              <AccountTile key={a.id} account={a} active={a.id === currentId} onSelect={select} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {pageCount > 1 && (
        <div className="pager__dots" role="tablist" aria-label="Account pages">
          {Array.from({ length: pageCount }, (_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              className="pager__dot"
              aria-selected={i === page}
              aria-label={`Page ${i + 1} of ${pageCount}`}
              onClick={() => go(i)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
