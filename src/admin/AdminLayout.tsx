import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import './AdminLayout.css'

export default function AdminLayout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div className="admin-header-container">
          <div className="admin-header-left">
            <h1 className="admin-logo">⚙️ Painel Administrativo</h1>
            <nav className="admin-nav">
              <NavLink to="/admin" end className={({ isActive }) => isActive ? 'admin-nav-link active' : 'admin-nav-link'}>
                Dashboard
              </NavLink>
              <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'admin-nav-link active' : 'admin-nav-link'}>
                Usuários
              </NavLink>
              <NavLink to="/admin/questions" className={({ isActive }) => isActive ? 'admin-nav-link active' : 'admin-nav-link'}>
                Questões
              </NavLink>
              <NavLink to="/" className="admin-nav-link">
                ← Voltar ao App
              </NavLink>
            </nav>
          </div>
          <div className="admin-header-right">
            <span className="admin-user-info">
              {profile?.full_name || profile?.email}
              <span className="admin-badge">Admin</span>
            </span>
            <button onClick={handleSignOut} className="admin-btn-logout">
              Sair
            </button>
          </div>
        </div>
      </header>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}
