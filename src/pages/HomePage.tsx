import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import './HomePage.css'

export default function HomePage() {
  const navigate = useNavigate()
  const { profile, isAdmin } = useAuth()

  return (
    <div className="home-page">
      <section className="welcome-section">
        <h2>Bem-vindo, {profile?.full_name || 'Estudante'}!</h2>
        <p>Pratique com questões reais de provas de residência médica</p>
      </section>

      <section className="actions-section">
        <div className="action-card" onClick={() => navigate('/quiz')}>
          <div className="action-icon">📝</div>
          <h3>Iniciar Simulado</h3>
          <p>Questões aleatórias de todas as especialidades</p>
        </div>
        <div className="action-card" onClick={() => navigate('/review')}>
          <div className="action-icon">🔍</div>
          <h3>Revisar Questões</h3>
          <p>Revise questões erradas e marcadas para revisão</p>
        </div>
        {isAdmin && (
          <div className="action-card admin-card" onClick={() => navigate('/admin/questions')}>
            <div className="action-icon">⚙️</div>
            <h3>Gerenciar Questões</h3>
            <p>Adicionar, editar ou remover questões do banco</p>
          </div>
        )}
      </section>

      <section className="info-section">
        <div className="info-card">
          <h4>Como funciona</h4>
          <ul>
            <li>Responda questões de provas reais</li>
            <li>Veja o gabarito imediatamente após responder</li>
            <li>Acompanhe seu desempenho</li>
            <li>Revise suas dúvidas</li>
          </ul>
        </div>
      </section>
    </div>
  )
}
