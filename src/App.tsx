import { Dock, DockBadge, DockItem, DockSeparator } from './components/Dock/Dock'
import { AskMaisey } from './components/Dock/AskMaisey'
import searchSvg from './assets/dock/search.svg'
import patientAppPng from './assets/dock/patient-app.png'
import cardsAppPng from './assets/dock/cards-app.png'
import messagesPng from './assets/dock/messages.png'
import filesSvg from './assets/dock/files.svg'
import trashPng from './assets/dock/trash.png'
import separatorSvg from './assets/dock/separator.svg'
import folderIcon1a from './assets/dock/folder-793e1.png'
import folderIcon1b from './assets/dock/folder-35536.png'
import folderIcon2 from './assets/dock/folder-f6c66.png'
import folderIcon3a from './assets/dock/folder-d01da.png'
import folderIcon3b from './assets/dock/folder-2b9e4.png'
import folderIcon4 from './assets/dock/folder-fd006.png'
import { AccountProvider } from './accounts/AccountContext'
import { useAccounts } from './accounts/useAccounts'
import { AccountAvatar } from './components/AccountSwitcher/AccountAvatar'
import { SwitchingOverlay } from './components/AccountSwitcher/SwitchingOverlay'
import { MenuBar } from './components/MenuBar/MenuBar'
import './App.css'

function AppTile({ src }: { src: string }) {
  return (
    <span className="app-tile">
      <img src={src} alt="" />
    </span>
  )
}

function MiniIcon({ srcs }: { srcs: string[] }) {
  return (
    <span className="mini-icon">
      {srcs.map((s) => (
        <img key={s} src={s} alt="" />
      ))}
    </span>
  )
}

export default function App() {
  return (
    <AccountProvider>
      <Desktop />
    </AccountProvider>
  )
}

function Desktop() {
  const { accounts, active } = useAccounts()
  // Colleagues on the dock are every other account; unread counts follow whoever is signed in.
  const colleagues = accounts.filter((a) => a.id !== active.id)

  return (
    <main className="desktop">
      <MenuBar />
      <div className="desktop__dock">
        <Dock>
          <AskMaisey />

          <DockItem label="Search" width={44} height={55}>
            <img src={searchSvg} alt="" width={44} height={55} />
          </DockItem>

          <DockItem label="Patient app" width={54} height={54}>
            <AppTile src={patientAppPng} />
          </DockItem>

          <DockItem label="Records" width={54} height={54}>
            <AppTile src={cardsAppPng} />
          </DockItem>

          <DockItem label="Messages" width={54} height={54}>
            <AppTile src={messagesPng} />
            {active.unread.messages > 0 && <DockBadge count={active.unread.messages} />}
          </DockItem>

          <DockItem label="Files" width={54} height={52}>
            <img src={filesSvg} alt="" width={54} height={52} />
          </DockItem>

          <DockItem label="Apps" width={61} height={62} style={{ marginLeft: 8 }}>
            <span className="app-folder">
              <span className="app-folder__card app-folder__card--back" />
              <span className="app-folder__card app-folder__card--mid" />
              <span className="app-folder__front">
                <span className="app-folder__front-frost" />
                <MiniIcon srcs={[folderIcon1a, folderIcon1b]} />
                <MiniIcon srcs={[folderIcon2]} />
                <MiniIcon srcs={[folderIcon3a, folderIcon3b]} />
                <MiniIcon srcs={[folderIcon4]} />
              </span>
            </span>
          </DockItem>

          <DockSeparator src={separatorSvg} />

          <DockItem label="Bin" width={55} height={62}>
            <img src={trashPng} alt="" width={55} height={62} />
          </DockItem>

          {colleagues.map((person, i) => {
            const unread = active.unread.people[person.id] ?? 0
            return (
              <DockItem
                key={person.id}
                label={person.name}
                width={44}
                height={44}
                style={i > 0 ? { marginLeft: -2 } : undefined}
              >
                <span className="person">
                  <AccountAvatar account={person} size={44} />
                  {unread > 0 && <DockBadge count={unread} />}
                </span>
              </DockItem>
            )
          })}
        </Dock>
      </div>
      <SwitchingOverlay />
    </main>
  )
}
