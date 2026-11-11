import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
  type Transition,
  type Variants,
} from 'motion/react'
import arrowSvg from '../../assets/dock/tooltip-arrow.svg'
import './Dock.css'

/** Height of the dock bar in the design (px). */
export const DOCK_HEIGHT = 74

/** Strong ease-out: fast start, gentle settle. Feels responsive for UI that appears on demand. */
const EASE_OUT = [0.23, 1, 0.32, 1] as const

type TooltipState = { id: string | null; instant: boolean }

type DockConfig = {
  lift: number
  spring: Transition
  tooltip: TooltipState
  showTooltip: (id: string, opts?: { immediate?: boolean }) => void
  hideTooltip: (id: string) => void
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
  /** Hover time (ms) before the first tooltip appears, so passing over the dock stays quiet. */
  tooltipDelay?: number
  /**
   * After a tooltip closes, other tooltips open instantly (no delay, no animation)
   * for this long (ms), so scanning across icons feels immediate.
   */
  skipDelayWindow?: number
  className?: string
}

export function Dock({
  children,
  lift = 8,
  spring = { type: 'spring', stiffness: 420, damping: 18, mass: 0.6 },
  tooltipDelay = 300,
  skipDelayWindow = 300,
  className,
}: DockProps) {
  const [tooltip, setTooltip] = useState<TooltipState>({ id: null, instant: false })
  const current = useRef(tooltip)
  const lastClosedAt = useRef(-Infinity)
  const openTimer = useRef<number | undefined>(undefined)
  const closeTimer = useRef<number | undefined>(undefined)

  const update = useCallback((next: TooltipState) => {
    if (current.current.id !== null && next.id === null) lastClosedAt.current = performance.now()
    current.current = next
    setTooltip(next)
  }, [])

  const showTooltip = useCallback(
    (id: string, opts?: { immediate?: boolean }) => {
      window.clearTimeout(openTimer.current)
      window.clearTimeout(closeTimer.current)
      const warm =
        current.current.id !== null || performance.now() - lastClosedAt.current < skipDelayWindow
      if (warm) {
        // Moving between icons: swap the tooltip with no animation at all.
        update({ id, instant: true })
      } else if (opts?.immediate) {
        // Keyboard focus is deliberate, so no delay — but still animate in.
        update({ id, instant: false })
      } else {
        openTimer.current = window.setTimeout(() => update({ id, instant: false }), tooltipDelay)
      }
    },
    [skipDelayWindow, tooltipDelay, update],
  )

  const hideTooltip = useCallback(
    (id: string) => {
      window.clearTimeout(openTimer.current)
      // Wait a beat: if the cursor lands on a neighbour, showTooltip cancels this
      // and swaps instantly instead of playing an exit + enter.
      window.clearTimeout(closeTimer.current)
      closeTimer.current = window.setTimeout(() => {
        if (current.current.id === id) update({ id: null, instant: false })
      }, 60)
    },
    [update],
  )

  useEffect(
    () => () => {
      window.clearTimeout(openTimer.current)
      window.clearTimeout(closeTimer.current)
    },
    [],
  )

  return (
    <MotionConfig reducedMotion="user">
      <DockContext.Provider value={{ lift, spring, tooltip, showTooltip, hideTooltip }}>
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
    </MotionConfig>
  )
}

/**
 * Tooltip motion: a small rise + scale from 0.97 out of the icon (transform-origin is
 * bottom-centre in CSS), never from scale 0. Exit is quicker than enter. When the
 * dock is "warm" (switching icons) both are instant. Reduced motion → opacity only.
 */
const tooltipVariants: Variants = {
  hidden: ({ instant, reduced }: { instant: boolean; reduced: boolean }) => ({
    opacity: 0,
    y: reduced ? 0 : 4,
    scale: reduced ? 1 : 0.97,
    transition: instant ? { duration: 0 } : { duration: 0.12, ease: EASE_OUT },
  }),
  visible: ({ instant }: { instant: boolean }) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: instant ? { duration: 0 } : { duration: 0.2, ease: EASE_OUT },
  }),
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
  const { lift, spring, tooltip, showTooltip, hideTooltip } = useDock()
  const id = useId()
  const reduced = useReducedMotion() ?? false
  const [lifted, setLifted] = useState(false)
  const restingBottom = (DOCK_HEIGHT - height) / 2
  const open = tooltip.id === id
  const custom = { instant: tooltip.instant, reduced }

  return (
    <button
      type="button"
      className="dock-item"
      style={{ width, height: DOCK_HEIGHT, ...style }}
      aria-label={label}
      aria-describedby={open ? `${id}-tip` : undefined}
      onClick={onClick}
      onMouseEnter={() => {
        setLifted(true)
        showTooltip(id)
      }}
      onMouseLeave={() => {
        setLifted(false)
        hideTooltip(id)
      }}
      onFocus={(e) => {
        if (!e.currentTarget.matches(':focus-visible')) return
        setLifted(true)
        showTooltip(id, { immediate: true })
      }}
      onBlur={() => {
        setLifted(false)
        hideTooltip(id)
      }}
    >
      <motion.span
        className="dock-item__icon"
        style={{ width, height, bottom: restingBottom }}
        animate={{ y: lifted ? -lift : 0 }}
        whileTap={{ scale: 0.94 }}
        tabIndex={-1} // whileTap would otherwise make this span a second tab stop
        transition={spring}
      >
        {children}
      </motion.span>

      <span className="dock-tooltip__anchor" style={{ bottom: restingBottom + height + lift + 10 }}>
        <AnimatePresence custom={custom}>
          {open && (
            <motion.span
              key="tip"
              id={`${id}-tip`}
              className="dock-tooltip"
              role="tooltip"
              custom={custom}
              variants={tooltipVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {label}
              <img className="dock-tooltip__arrow" src={arrowSvg} alt="" width={10} height={10} />
            </motion.span>
          )}
        </AnimatePresence>
      </span>
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
