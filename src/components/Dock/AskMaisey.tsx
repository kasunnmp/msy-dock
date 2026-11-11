import avatarBase from '../../assets/dock/avatar-base.png'
import avatarOverlay from '../../assets/dock/avatar-overlay.png'
import micSvg from '../../assets/dock/mic.svg'
import cursorSparkleSvg from '../../assets/dock/cursor-sparkle.svg'
import dividerSvg from '../../assets/dock/pill-divider.svg'
import './AskMaisey.css'

type AskMaiseyProps = {
  onAsk?: () => void
  onVoice?: () => void
  onPointAndAsk?: () => void
}

/** The "Ask Maisey" pill on the left of the dock. It does not magnify. */
export function AskMaisey({ onAsk, onVoice, onPointAndAsk }: AskMaiseyProps) {
  return (
    <div className="ask-maisey">
      <span className="ask-maisey__avatar" aria-hidden>
        <img className="ask-maisey__avatar-base" src={avatarBase} alt="" />
        <span className="ask-maisey__avatar-overlay">
          <img src={avatarOverlay} alt="" />
        </span>
      </span>

      <button type="button" className="ask-maisey__text" onClick={onAsk}>
        Ask Maisey
      </button>

      <span className="ask-maisey__actions">
        <button type="button" className="ask-maisey__mic" aria-label="Talk to Maisey" onClick={onVoice}>
          <img src={micSvg} alt="" width={23.77} height={30.46} />
        </button>
        <button
          type="button"
          className="ask-maisey__point"
          aria-label="Point and ask"
          onClick={onPointAndAsk}
        >
          <img src={cursorSparkleSvg} alt="" />
        </button>
        <span className="ask-maisey__divider" aria-hidden>
          <img src={dividerSvg} alt="" width={21} height={1} />
        </span>
      </span>
    </div>
  )
}
