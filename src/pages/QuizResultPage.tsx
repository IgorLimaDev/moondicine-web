import { useLocation, useNavigate } from 'react-router-dom'
import './QuizResultPage.css'

export default function QuizResultPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { total, correct, timeSpent } = location.state || { total: 0, correct: 0, timeSpent: 0 }

  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0
  const minutes = Math.floor(timeSpent / 60)
  const seconds = timeSpent % 60

  return (
    <div className="result-page">
      <div className="result-card">
        <div className="result-header">
          <h2>Resultado do Simulado</h2>
        </div>
        <div className="result-content">
          <div className="result-score">
            <div className="score-circle">
              <span className="score-percentage">{percentage}%</span>
              <span className="score-label">Acertos</span>
            </div>
          </div>
          <div className="result-stats">
            <div className="stat-item">
              <span className="stat-value">{correct}/{total}</span>
              <span className="stat-label">Questões corretas</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{minutes}:{seconds.toString().padStart(2, '0')}</span>
              <span className="stat-label">Tempo gasto</span>
            </div>
          </div>
          <div className="result-message">
            {percentage >= 80 && <p>🎉 Excelente! Continue assim!</p>}
            {percentage >= 60 && percentage < 80 && <p>👍 Bom desempenho! Continue praticando!</p>}
            {percentage < 60 && <p>💪 Precisa praticar mais. Não desista!</p>}
          </div>
          <div className="result-actions">
            <button onClick={() => navigate('/quiz')} className="btn-primary">
              Novo Simulado
            </button>
            <button onClick={() => navigate('/')} className="btn-secondary">
              Voltar ao Início
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
