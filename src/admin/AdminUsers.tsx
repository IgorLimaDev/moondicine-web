import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import './AdminUsers.css'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  role: 'user' | 'admin'
  is_active: boolean
  created_at: string
  last_login_at: string | null
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserPassword, setNewUserPassword] = useState('')
  const [newUserName, setNewUserName] = useState('')
  const [newUserRole, setNewUserRole] = useState<'user' | 'admin'>('user')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      // Create user via Supabase Auth Admin API would require service role
      // For now, we'll just show instructions - in practice use Supabase dashboard
      alert('Para criar usuários, use o Supabase Dashboard > Authentication > Users > Add user.\n\nDepois use a função SQL make_user_admin() para tornar admin se necessário.')
      setShowAddModal(false)
      setNewUserEmail('')
      setNewUserPassword('')
      setNewUserName('')
      setNewUserRole('user')
    } catch (error: any) {
      setError(error.message)
    }
  }

  const toggleUserRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error
      fetchUsers()
    } catch (error) {
      console.error('Error updating role:', error)
      alert('Erro ao atualizar permissões')
    }
  }

  const toggleUserActive = async (userId: string, currentActive: boolean) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_active: !currentActive })
        .eq('id', userId)

      if (error) throw error
      fetchUsers()
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Erro ao atualizar status')
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca'
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  return (
    <div className="admin-users">
      <div className="admin-page-header">
        <div>
          <h2>Gerenciar Usuários</h2>
          <p>Controle de acesso e permissões</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-add">
          ➕ Adicionar Usuário
        </button>
      </div>

      {loading ? (
        <div className="loading">Carregando...</div>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Nome</th>
                <th>Função</th>
                <th>Status</th>
                <th>Criado em</th>
                <th>Último login</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.email}</td>
                  <td>{user.full_name || '-'}</td>
                  <td>
                    <span className={`role-badge ${user.role}`}>
                      {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                      {user.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>{formatDate(user.created_at)}</td>
                  <td>{formatDate(user.last_login_at)}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        onClick={() => toggleUserRole(user.id, user.role)}
                        className="btn-table"
                        title={user.role === 'admin' ? 'Remover admin' : 'Tornar admin'}
                      >
                        {user.role === 'admin' ? '👤' : '⚡'}
                      </button>
                      <button
                        onClick={() => toggleUserActive(user.id, user.is_active)}
                        className="btn-table"
                        title={user.is_active ? 'Desativar' : 'Ativar'}
                      >
                        {user.is_active ? '🚫' : '✅'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Instruções para Adicionar Usuário</h3>
              <button onClick={() => setShowAddModal(false)} className="modal-close">×</button>
            </div>
            <div className="modal-body">
              <p>Para adicionar novos usuários, siga estes passos:</p>
              <ol>
                <li>Acesse o <strong>Supabase Dashboard</strong></li>
                <li>Vá em <strong>Authentication → Users → Add user</strong></li>
                <li>Crie o usuário com email e senha</li>
                <li>O perfil será criado automaticamente</li>
                <li>Use o SQL <code>SELECT public.make_user_admin('email@exemplo.com');</code> para tornar admin</li>
              </ol>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowAddModal(false)} className="btn-secondary">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
