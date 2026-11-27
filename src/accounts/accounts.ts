import person1Png from '../assets/dock/person-1.png'
import person2Png from '../assets/dock/person-2.png'

export type Account = {
  id: string
  name: string
  role: string
  clinic: string
  /** Photo URL. Without one, an initials avatar is drawn in `color`. */
  avatar?: string
  color: string
  /** Unread counts shown on the dock while this account is signed in. */
  unread: {
    messages: number
    /** Unread chats per colleague, keyed by account id. */
    people: Record<string, number>
  }
}

export const ACCOUNTS: Account[] = [
  {
    id: 'maya-chen',
    name: 'Dr. Maya Chen',
    role: 'General Practitioner',
    clinic: 'Harbour Medical',
    color: '#6d7cf2',
    unread: { messages: 5, people: { 'sam-patel': 5 } },
  },
  {
    id: 'sam-patel',
    name: 'Dr. Sam Patel',
    role: 'General Practitioner',
    clinic: 'Harbour Medical',
    avatar: person1Png,
    color: '#e0884f',
    unread: { messages: 2, people: { 'ava-reid': 1 } },
  },
  {
    id: 'ava-reid',
    name: 'Nurse Ava Reid',
    role: 'Practice Nurse',
    clinic: 'Harbour Medical',
    avatar: person2Png,
    color: '#3fa98b',
    unread: { messages: 0, people: { 'maya-chen': 3 } },
  },
]

export const DEFAULT_ACCOUNT_ID = ACCOUNTS[0].id

export function initials(name: string) {
  const parts = name
    .replace(/^(Dr|Nurse|Mr|Mrs|Ms)\.?\s+/i, '')
    .split(/\s+/)
    .filter(Boolean)
  return ((parts[0]?.[0] ?? '') + (parts.at(-1)?.[0] ?? '')).toUpperCase()
}
