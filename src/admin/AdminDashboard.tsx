import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './AdminDashboard.css'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalQuestions: 0,
    totalUsers: 0,
    totalAdmins: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [questionsRes, usersRes] = await Promise.all([
        supabase.from('questions').select('id', { count: 'exact', head: true }),
        supabase.from('user_profiles').select('id, role', { count: 'exact' })
      ])

      const totalAdmins = usersRes.data?.filter(u => u.role === 'admin').length || 0

      setStats({
        totalQuestions: questionsRes.count || 0,
        totalUsers: usersRes.count || 0,
        totalAdmins
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-page-header">
        <h2>Dashboard</h2>
        <p>Visão geral do sistema</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-info">
            <div className="stat-value">{loading ? '...' : stats.totalQuestions}</div>
            <div className="stat-label">Questões Cadastradas</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <div className="stat-value">{loading ? '...' : stats.totalUsers}</div>
            <div className="stat-label">Usuários Cadastrados</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-info">
            <div className="stat-value">{loading ? '...' : stats.totalAdmins}</div>
            <div className="stat-label">Administradores</div>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h3>Ações Rápidas</h3>
        <div className="actions-grid">
          <button onClick={() => navigate('/admin/questions/new')} className="action-btn">
            ➕ Adicionar Nova Questão
          </button>
          <button onClick={() => navigate('/admin/questions')} className="action-btn">
            📋 Gerenciar Questões
          </button>
          <button onClick={() => navigate('/admin/users')} className="action-btn">
            👤 Gerenciar Usuários
          </button>
        </div>
      </div>
    </div>
  )
}
