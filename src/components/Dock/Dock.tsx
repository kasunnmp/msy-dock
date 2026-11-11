import {
  createContext,
  useContext,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
  type SpringOptions,
} from 'motion/react'
import arrowSvg from '../../assets/dock/tooltip-arrow.svg'
import './Dock.css'

/** Height of the dock bar in the design (px). */
export const DOCK_HEIGHT = 74

type DockConfig = {
  mouseX: MotionValue<number>
  magnification: number
  distance: number
  spring: SpringOptions
}

const DockContext = createContext<DockConfig | null>(null)

function useDock() {
  const ctx = useContext(DockContext)
  if (!ctx) throw new Error('DockItem must be rendered inside <Dock>')
  return ctx
}

type DockProps = {
  children: ReactNode
  /** Max scale of the icon directly under the cursor. */
  magnification?: number
  /** How far (px) from the cursor icons are still affected. */
  distance?: number
  spring?: SpringOptions
  className?: string
}

export function Dock({
  children,
  magnification = 1.5,
  distance = 140,
  spring = { mass: 0.1, stiffness: 170, damping: 12 },
  className,
}: DockProps) {
  // Infinity = cursor is not over the dock, so every icon rests at scale 1.
  const mouseX = useMotionValue(Infinity)

  return (
    <DockContext.Provider value={{ mouseX, magnification, distance, spring }}>
      <nav
        className={`dock ${className ?? ''}`}
        style={{ height: DOCK_HEIGHT }}
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        aria-label="Dock"
      >
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
  /** Resting size of the icon in px (from the design). */
  width: number
  height: number
  children: ReactNode
  onClick?: () => void
  style?: CSSProperties
}

export function DockItem({ label, width, height, children, onClick, style }: DockItemProps) {
  const { mouseX, magnification, distance, spring } = useDock()
  const ref = useRef<HTMLButtonElement>(null)
  const [hovered, setHovered] = useState(false)

  // Signed distance between the cursor and this icon's centre.
  const offset = useTransform(mouseX, (x) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return Infinity
    return x - (rect.left + rect.width / 2)
  })

  const targetScale = useTransform(offset, [-distance, 0, distance], [1, magnification, 1])
  const scale = useSpring(targetScale, spring)

  // The slot widens with the icon so neighbours get pushed aside,
  // while the icon itself grows upward out of the bar.
  const slotWidth = useTransform(scale, (s) => width * s)
  const restingBottom = (DOCK_HEIGHT - height) / 2
  const tooltipBottom = useTransform(scale, (s) => restingBottom + height * s + 10)

  return (
    <motion.button
      ref={ref}
      type="button"
      className="dock-item"
      style={{ width: slotWidth, height: DOCK_HEIGHT, ...style }}
      aria-label={label}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <motion.span
        className="dock-item__icon"
        style={{ width, height, bottom: restingBottom, scale, originY: 1 }}
      >
        {children}
      </motion.span>

      <motion.span className="dock-tooltip__anchor" style={{ bottom: tooltipBottom }}>
        <AnimatePresence>
          {hovered && (
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
          )}
        </AnimatePresence>
      </motion.span>
    </motion.button>
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
