import { createContext, useContext, useState, type CSSProperties, type ReactNode } from 'react'
import { AnimatePresence, motion, type Transition } from 'motion/react'
import arrowSvg from '../../assets/dock/tooltip-arrow.svg'
import './Dock.css'

/** Height of the dock bar in the design (px). */
export const DOCK_HEIGHT = 74

type DockConfig = {
  lift: number
  spring: Transition
}

const DockContext = createContext<DockConfig | null>(null)

function useDock() {
  const ctx = useContext(DockContext)
  if (!ctx) throw new Error('DockItem must be rendered inside <Dock>')
  return ctx
}

type DockProps = {
  children: ReactNode
  /** How far (px) the hovered icon rises. */
  lift?: number
  /** Spring used for the rise and the settle back down. */
  spring?: Transition
  className?: string
}

export function Dock({
  children,
  lift = 8,
  spring = { type: 'spring', stiffness: 420, damping: 18, mass: 0.6 },
  className,
}: DockProps) {
  return (
    <DockContext.Provider value={{ lift, spring }}>
      <nav className={`dock ${className ?? ''}`} style={{ height: DOCK_HEIGHT }} aria-label="Dock">
        <div className="dock__glass" aria-hidden>
          <div className="dock__glass-dodge" />
          <div className="dock__glass-tint" />
          <div className="dock__glass-darker" />
          <div className="dock__glass-edge dock__glass-edge--lt" />
          <div className="dock__glass-edge dock__glass-edge--rb" />
        </div>
        <div className="dock__row">{children}</div>
      </nav>
    </DockContext.Provider>
  )
}

type DockItemProps = {
  /** Tooltip text, also used as the accessible name. */
  label: string
  /** Size of the icon in px (from the design). */
  width: number
  height: number
  children: ReactNode
  onClick?: () => void
  style?: CSSProperties
}

/**
 * Only the hovered icon reacts: it rises a few px on a spring and settles
 * back when the cursor leaves. Neighbours and the dock never move or resize.
 */
export function DockItem({ label, width, height, children, onClick, style }: DockItemProps) {
  const { lift, spring } = useDock()
  const [active, setActive] = useState(false)
  const restingBottom = (DOCK_HEIGHT - height) / 2

  return (
    <button
      type="button"
      className="dock-item"
      style={{ width, height: DOCK_HEIGHT, ...style }}
      aria-label={label}
      onClick={onClick}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
    >
      <motion.span
        className="dock-item__icon"
        style={{ width, height, bottom: restingBottom }}
        animate={{ y: active ? -lift : 0 }}
        whileTap={{ scale: 0.94 }}
        transition={spring}
      >
        {children}
      </motion.span>

      <AnimatePresence>
        {active && (
          <motion.span className="dock-tooltip__anchor" style={{ bottom: restingBottom + height + lift + 10 }}>
            <motion.span
              className="dock-tooltip"
              role="tooltip"
              initial={{ opacity: 0, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.98 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
            >
              {label}
              <img className="dock-tooltip__arrow" src={arrowSvg} alt="" width={10} height={10} />
            </motion.span>
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}

export function DockBadge({ count, style }: { count: number; style?: CSSProperties }) {
  return (
    <span className="dock-badge" style={style}>
      {count}
    </span>
  )
}

export function DockSeparator({ src }: { src: string }) {
  return <img className="dock-separator" src={src} alt="" width={16} height={DOCK_HEIGHT} />
}
