import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import './Layout.css'

export default function Layout() {
  const { profile, signOut, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
    setMenuOpen(false)
  }

  const handleInstall = async () => {
    const prompt = (window as any).deferredPrompt
    if (prompt) {
      prompt.prompt()
      const { outcome } = await prompt.userChoice
      if (outcome === 'accepted') {
        delete (window as any).deferredPrompt
      }
    }
    setMenuOpen(false)
  }

  return (
    <div className="layout">
      <header className="header">
        <div className="header-container">
          <div className="header-top">
            <h1 className="logo">🌙 Moondicine</h1>
            <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
              ☰
            </button>
          </div>
          <nav className="nav">
            <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setMenuOpen(false)}>
              🏠 Início
            </NavLink>
            <NavLink to="/review" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setMenuOpen(false)}>
              🔍 Revisão
            </NavLink>
            <NavLink to="/stats" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setMenuOpen(false)}>
              📊 Estatísticas
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin" className="nav-link admin-link" onClick={() => setMenuOpen(false)}>
                ⚡ Painel Admin
              </NavLink>
            )}
          </nav>
          <div className="header-actions">
            <button onClick={handleInstall} className="action-btn">
              📲 Instalar App
            </button>
            <NavLink to="/settings" className="action-btn" onClick={() => setMenuOpen(false)}>
              ⚙️ Configurações
            </NavLink>
            <div className="user-section">
              <span className="user-info">
                {profile?.full_name || profile?.email}
                {isAdmin && <span className="admin-badge">Admin</span>}
              </span>
            </div>
            <button onClick={handleSignOut} className="btn-logout">
              🚪 Sair
            </button>
          </div>
        </div>
      </header>
      
      {menuOpen && <div className="menu-overlay" onClick={() => setMenuOpen(false)}></div>}
      <aside className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <h2>Menu</h2>
          <button onClick={() => setMenuOpen(false)} className="menu-close">×</button>
        </div>
        <nav className="mobile-nav">
          <NavLink to="/" className={({ isActive }) => isActive ? 'mobile-nav-link active' : 'mobile-nav-link'} onClick={() => setMenuOpen(false)}>
            🏠 Início
          </NavLink>
          <NavLink to="/review" className={({ isActive }) => isActive ? 'mobile-nav-link active' : 'mobile-nav-link'} onClick={() => setMenuOpen(false)}>
            🔍 Revisão
          </NavLink>
          <NavLink to="/stats" className={({ isActive }) => isActive ? 'mobile-nav-link active' : 'mobile-nav-link'} onClick={() => setMenuOpen(false)}>
            📊 Estatísticas
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin" className="mobile-nav-link admin-link" onClick={() => setMenuOpen(false)}>
              ⚡ Painel Admin
            </NavLink>
          )}
          <div className="mobile-menu-divider"></div>
          <button onClick={handleInstall} className="mobile-action-btn">
            📲 Instalar App
          </button>
          <NavLink to="/settings" className="mobile-action-btn" onClick={() => setMenuOpen(false)}>
            ⚙️ Configurações
          </NavLink>
          <div className="mobile-user-info">
            <div>{profile?.full_name || profile?.email}</div>
            {isAdmin && <span className="admin-badge">Admin</span>}
          </div>
          <button onClick={handleSignOut} className="mobile-logout-btn">
            🚪 Sair
          </button>
        </nav>
      </aside>
      
      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}
