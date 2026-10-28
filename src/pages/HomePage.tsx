import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'
import './HomePage.css'

interface Stats {
  totalQuestions: number
  totalAnswered: number
  totalCorrect: number
  currentStreak: number
  accuracy: number
}

export default function HomePage() {
  const navigate = useNavigate()
  const { profile, isAdmin, user } = useAuth()
  const [stats, setStats] = useState<Stats>({
    totalQuestions: 0,
    totalAnswered: 0,
    totalCorrect: 0,
    currentStreak: 0,
    accuracy: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [user])

  const fetchData = async () => {
    try {
      const [questionsRes, answersRes, profileRes] = await Promise.all([
        supabase.from('questions').select('id', { count: 'exact', head: true }),
        user ? supabase.from('user_answers').select('is_correct').eq('user_id', user.id) : Promise.resolve({ data: [] }),
        user ? supabase.from('user_profiles').select('*').eq('id', user.id).single() : Promise.resolve({ data: null })
      ])

      const answers = answersRes.data || []
      const totalAnswered = answers.length
      const totalCorrect = answers.filter(a => a.is_correct).length
      const accuracy = totalAnswered > 0 ? totalCorrect / totalAnswered : 0
      const streak = profileRes.data?.current_streak_days || 0

      setStats({
        totalQuestions: questionsRes.count || 0,
        totalAnswered,
        totalCorrect,
        currentStreak: streak,
        accuracy
      })
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="home-page">
      <section className="welcome-section">
        <h2>Bem-vindo, {profile?.full_name || 'Estudante'}!</h2>
        <p>Pratique com questões reais de provas de residência médica</p>
      </section>

      <section className="stats-overview">
        <div className="stat-box">
          <div className="stat-box-value">{stats.totalQuestions}</div>
          <div className="stat-box-label">Questões totais</div>
        </div>
        <div className="stat-box">
          <div className="stat-box-value">{stats.totalAnswered}</div>
          <div className="stat-box-label">Respondidas</div>
        </div>
        <div className="stat-box">
          <div className="stat-box-value">{Math.round(stats.accuracy * 100)}%</div>
          <div className="stat-box-label">Precisão</div>
        </div>
        <div className="stat-box">
          <div className="stat-box-value">{stats.currentStreak} 🔥</div>
          <div className="stat-box-label">Sequência</div>
        </div>
      </section>

      <section className="quick-start">
        <h3>Início rápido</h3>
        <div className="actions-grid">
          <div className="action-card" onClick={() => navigate('/quiz')}>
            <div className="action-icon">⚡</div>
            <h4>Quiz rápido</h4>
            <p>10 questões aleatórias</p>
          </div>
          <div className="action-card" onClick={() => navigate('/quiz?mode=infinito')}>
            <div className="action-icon">♾️</div>
            <h4>Modo Infinito</h4>
            <p>Pratique sem limite</p>
          </div>
          <div className="action-card" onClick={() => navigate('/exams')}>
            <div className="action-icon">📚</div>
            <h4>Escolher prova</h4>
            <p>Por exame específico</p>
          </div>
          <div className="action-card" onClick={() => navigate('/specialties')}>
            <div className="action-icon">🩺</div>
            <h4>Especialidades</h4>
            <p>Foco por matéria</p>
          </div>
          <div className="action-card" onClick={() => navigate('/review')}>
            <div className="action-icon">🔍</div>
            <h4>Revisar erros</h4>
            <p>Questões erradas</p>
          </div>
          <div className="action-card" onClick={() => navigate('/stats')}>
            <div className="action-icon">📊</div>
            <h4>Estatísticas</h4>
            <p>Seu desempenho</p>
          </div>
        </div>
      </section>

      {isAdmin && (
        <section className="admin-section">
          <h3>Administração</h3>
          <div className="actions-grid">
            <div className="action-card admin-card" onClick={() => navigate('/admin/questions')}>
              <div className="action-icon">📝</div>
              <h4>Gerenciar Questões</h4>
              <p>Adicionar, editar ou remover</p>
            </div>
            <div className="action-card admin-card" onClick={() => navigate('/admin/users')}>
              <div className="action-icon">👥</div>
              <h4>Gerenciar Usuários</h4>
              <p>Controle de acesso</p>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
