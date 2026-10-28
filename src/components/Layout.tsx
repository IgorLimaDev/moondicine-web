import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import './Layout.css'

export default function Layout() {
  const { profile, signOut, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="layout">
      <header className="header">
        <div className="header-container">
          <div className="header-left">
            <h1 className="logo">🌙 Moondicine</h1>
            <nav className="nav">
              <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Início
              </NavLink>
              <NavLink to="/quiz" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Simulado
              </NavLink>
              <NavLink to="/review" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Revisão
              </NavLink>
              {isAdmin && (
                <NavLink to="/admin" className="nav-link admin-link">
                  Painel Admin
                </NavLink>
              )}
            </nav>
          </div>
          <div className="header-right">
            <span className="user-info">
              {profile?.full_name || profile?.email}
              {isAdmin && <span className="admin-badge">Admin</span>}
            </span>
            <button onClick={handleSignOut} className="btn-logout">
              Sair
            </button>
          </div>
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}
