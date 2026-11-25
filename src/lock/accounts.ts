import avatarDaniel from '../assets/lock/avatar-daniel.png'
import avatarHayden from '../assets/lock/avatar-hayden.png'
import avatarPhotoBg from '../assets/lock/avatar-photo-bg.png'
import avatarMelisa from '../assets/lock/avatar-melisa.png'
import avatarEthan from '../assets/lock/avatar-ethan.png'
import avatarHaydenMt from '../assets/lock/avatar-hayden-mt.png'
import avatarBenjamin from '../assets/lock/avatar-benjamin.png'
import avatarLiam2 from '../assets/lock/avatar-liam-2.png'
import orgBg from '../assets/lock/org-bg.png'
import orgRevox from '../assets/lock/org-revox.png'
import orgMeditrust from '../assets/lock/org-meditrust.png'
import orgOrigin from '../assets/lock/org-origin.png'

export type Org = { name: string; logo: string }

export type Account = {
  id: string
  name: string
  /** Layers stacked bottom → top, as in the Figma avatar. */
  avatar: string[]
  org?: Org
}

const revox: Org = { name: 'Revox', logo: orgRevox }
const meditrust: Org = { name: 'MediTrust', logo: orgMeditrust }
const origin: Org = { name: 'Origin', logo: orgOrigin }

export const ORG_LOGO_BG = orgBg

/** Single-user scenario: one account, no organisation line (Figma "Single user lock screen"). */
export const SINGLE_USER: Account[] = [{ id: 'daniel', name: 'Daniel', avatar: [avatarHayden] }]

/** Multi-user scenario (Figma "Multiple users lock screen"), in grid order. */
export const MULTI_USERS: Account[] = [
  { id: 'daniel', name: 'Daniel', avatar: [avatarDaniel], org: revox },
  { id: 'hayden', name: 'Hayden', avatar: [avatarHayden], org: revox },
  { id: 'melisa', name: 'Melisa', avatar: [avatarPhotoBg, avatarMelisa], org: meditrust },
  { id: 'ethan', name: 'Ethan', avatar: [avatarEthan], org: meditrust },
  { id: 'hayden-mt', name: 'Hayden', avatar: [avatarPhotoBg, avatarHaydenMt], org: meditrust },
  { id: 'benjamin', name: 'Benjamin', avatar: [avatarPhotoBg, avatarBenjamin], org: origin },
  { id: 'liam', name: 'Liam', avatar: [avatarPhotoBg], org: meditrust },
  { id: 'liam-2', name: 'Liam', avatar: [avatarLiam2], org: meditrust },
]
