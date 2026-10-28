import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'
import './SettingsPage.css'

export default function SettingsPage() {
  const { profile, user, signOut } = useAuth()
  const navigate = useNavigate()
  const [resetting, setResetting] = useState(false)
  const [message, setMessage] = useState('')

  const handleResetAnswers = async () => {
    if (!confirm('Tem certeza que deseja resetar todo seu histórico de respostas? Esta ação não pode ser desfeita.')) {
      return
    }
    setResetting(true)
    setMessage('')
    try {
      if (user) {
        await supabase.from('user_answers').delete().eq('user_id', user.id)
        await supabase.from('user_stats').delete().eq('user_id', user.id)
        await supabase.from('user_profiles').update({ 
          total_questions_answered: 0,
          current_streak_days: 0,
          last_study_date: null
        }).eq('id', user.id)
      }
      setMessage('Histórico resetado com sucesso!')
    } catch (error) {
      console.error('Error resetting:', error)
      setMessage('Erro ao resetar histórico')
    } finally {
      setResetting(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h2>Configurações</h2>
      </div>

      <section className="settings-section">
        <h3>Perfil</h3>
        <div className="settings-card">
          <div className="settings-row">
            <div>
              <div className="settings-row-label">Email</div>
              <div className="settings-row-value">{profile?.email}</div>
            </div>
          </div>
          <div className="settings-row">
            <div>
              <div className="settings-row-label">Nome</div>
              <div className="settings-row-value">{profile?.full_name || 'Não definido'}</div>
            </div>
          </div>
          <div className="settings-row">
            <div>
              <div className="settings-row-label">Função</div>
              <div className="settings-row-value">{profile?.role === 'admin' ? 'Administrador' : 'Usuário'}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="settings-section">
        <h3>Dados</h3>
        <div className="settings-card">
          <button onClick={handleResetAnswers} disabled={resetting} className="settings-btn danger">
            {resetting ? 'Resetando...' : '🗑️ Resetar histórico de respostas'}
          </button>
          {message && <div className="settings-message">{message}</div>}
        </div>
      </section>

      <section className="settings-section">
        <h3>Sessão</h3>
        <div className="settings-card">
          <button onClick={handleSignOut} className="settings-btn">
            🚪 Sair da conta
          </button>
        </div>
      </section>

      <section className="settings-section">
        <h3>Sobre</h3>
        <div className="settings-card">
          <div className="settings-row">
            <div>
              <div className="settings-row-label">App</div>
              <div className="settings-row-value">Moondicine Web</div>
            </div>
          </div>
          <div className="settings-row">
            <div>
              <div className="settings-row-label">Versão</div>
              <div className="settings-row-value">1.0.0</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
