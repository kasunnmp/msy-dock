import type { Account } from '../../lock/accounts'
import { ORG_LOGO_BG } from '../../lock/accounts'

type Props = {
  account: Account
  /** Shows the "Active" badge (account-selection state only). */
  active?: boolean
  onSelect: (account: Account) => void
  /** Accessible label override, e.g. "Unlock as Hayden". */
  label?: string
}

/** Figma "Account" component: avatar + name (+ organisation), hover surface, optional Active badge. */
export function AccountTile({ account, active, onSelect, label }: Props) {
  return (
    <button
      type="button"
      className="account"
      onClick={() => onSelect(account)}
      aria-label={label ?? `${account.name}${account.org ? `, ${account.org.name}` : ''}`}
      aria-current={active ? 'true' : undefined}
    >
      <span className="account__avatar avatar" aria-hidden>
        {account.avatar.map((src) => (
          <img key={src} src={src} alt="" draggable={false} />
        ))}
      </span>

      <span className="account__text">
        <span className="account__name">{account.name}</span>
        {account.org && <span className="account__org">{account.org.name}</span>}
      </span>

      {account.org && (
        <span className="account__org-logo avatar" aria-hidden>
          <img src={ORG_LOGO_BG} alt="" draggable={false} />
          <img src={account.org.logo} alt="" draggable={false} />
        </span>
      )}

      {active && <span className="account__badge">Active</span>}
    </button>
  )
}
