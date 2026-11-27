import { initials, type Account } from '../../accounts/accounts'
import './AccountSwitcher.css'

export function AccountAvatar({ account, size }: { account: Account; size: number }) {
  return (
    <span
      className="account-avatar"
      style={{ width: size, height: size, fontSize: size * 0.4, background: account.color }}
      aria-hidden
    >
      {account.avatar ? <img src={account.avatar} alt="" /> : initials(account.name)}
    </span>
  )
}
