import { useEffect, useRef, useState } from 'react'
import globeSvg from '../../assets/lock/globe.svg'
import caretSvg from '../../assets/lock/caret-down.svg'
import { LANGUAGES, LEGAL_LINKS, LEGAL_TEXT } from '../../lock/config'

/**
 * Footer: language selector (left), legal text (centre), help/terms/privacy (right).
 * The language list is a placeholder — the real behaviour is pending with dev.
 */
export function LockFooter() {
  const [language, setLanguage] = useState(LANGUAGES[0])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <footer className="lock-footer">
      <div className="lock-footer__lang" ref={ref}>
        <button
          type="button"
          className="lock-footer__btn"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="lock-footer__icon">
            <img src={globeSvg} alt="" width={20} height={20} />
          </span>
          {language}
          <span className="lock-footer__icon">
            <img src={caretSvg} alt="" width={20} height={20} />
          </span>
        </button>
        {open && (
          <ul className="lock-footer__menu" role="listbox" aria-label="Language">
            {LANGUAGES.map((l) => (
              <li key={l} role="option" aria-selected={l === language}>
                <button
                  type="button"
                  onClick={() => {
                    setLanguage(l)
                    setOpen(false)
                  }}
                >
                  {l}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="lock-footer__legal">{LEGAL_TEXT}</p>

      <nav className="lock-footer__links" aria-label="Legal">
        <a className="lock-footer__btn" href={LEGAL_LINKS.help} target="_blank" rel="noreferrer">
          Trouble unlocking?
        </a>
        <a className="lock-footer__btn" href={LEGAL_LINKS.terms} target="_blank" rel="noreferrer">
          Terms
        </a>
        <a className="lock-footer__btn" href={LEGAL_LINKS.privacy} target="_blank" rel="noreferrer">
          Privacy
        </a>
      </nav>
    </footer>
  )
}
