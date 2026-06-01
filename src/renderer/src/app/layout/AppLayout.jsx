export function AppLayout({ navItems, currentView, onNavigate, activeMission, pet, children }) {
  return (
    <div className="appShell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brandMark">●</span>
          <div>
            <strong>Sputnik</strong>
            <small>Mission OS</small>
          </div>
        </div>
        <nav>
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                className={currentView === item.id ? 'active' : ''}
                key={item.id}
                onClick={() => onNavigate(item.id)}
              >
                <Icon size={18} />
                {item.label}
              </button>
            )
          })}
        </nav>
      </aside>
      <main className="mainArea">
        <header className="topBar">
          <div>
            <span>Current mission</span>
            <strong>{activeMission?.title ?? 'No mission selected'}</strong>
          </div>
          <div>
            <span>Companion</span>
            <strong>{pet?.name ?? 'Laika'} · {pet?.mood ?? 'ready'}</strong>
          </div>
        </header>
        {children}
      </main>
    </div>
  )
}
