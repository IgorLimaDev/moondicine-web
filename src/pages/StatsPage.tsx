import { useEffect, useState } from 'react'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'
import './StatsPage.css'

interface SpecialtyStats {
  specialty: string
  total_answered: number
  total_correct: number
  accuracy: number
}

export default function StatsPage() {
  const { user } = useAuth()
  const [overall, setOverall] = useState({ total: 0, correct: 0, wrong: 0, accuracy: 0 })
  const [specialties, setSpecialties] = useState<SpecialtyStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) fetchStats()
  }, [user])

  const fetchStats = async () => {
    try {
      const { data: answers, error } = await supabase
        .from('user_answers')
        .select('is_correct, question_id')
        .eq('user_id', user?.id)

      if (error) throw error

      const answersData = answers || []
      const total = answersData.length
      const correct = answersData.filter(a => a.is_correct).length
      const wrong = total - correct
      const accuracy = total > 0 ? correct / total : 0

      setOverall({ total, correct, wrong, accuracy })

      // Get questions with specialties
      const questionIds = answersData.map(a => a.question_id)
      if (questionIds.length > 0) {
        const { data: questions } = await supabase
          .from('questions')
          .select('id, specialty')
          .in('id', questionIds)

        const specialtyMap = new Map<string, { total: number, correct: number }>()
        answersData.forEach(answer => {
          const q = questions?.find((qu: any) => qu.id === answer.question_id)
          if (q) {
            const current = specialtyMap.get(q.specialty) || { total: 0, correct: 0 }
            specialtyMap.set(q.specialty, {
              total: current.total + 1,
              correct: current.correct + (answer.is_correct ? 1 : 0)
            })
          }
        })

        const specialtyStats = Array.from(specialtyMap.entries()).map(([specialty, data]) => ({
          specialty,
          total_answered: data.total,
          total_correct: data.correct,
          accuracy: data.total > 0 ? data.correct / data.total : 0
        })).sort((a, b) => b.total_answered - a.total_answered)

        setSpecialties(specialtyStats)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="stats-page"><div className="loading">Carregando estatísticas...</div></div>
  }

  return (
    <div className="stats-page">
      <div className="stats-header">
        <h2>Estatísticas</h2>
        <p>Seu desempenho geral</p>
      </div>

      <section className="overall-stats">
        <div className="overall-card">
          <div className="overall-card-header">
            <h3>Desempenho Geral</h3>
            <span className="accuracy-badge">{Math.round(overall.accuracy * 100)}%</span>
          </div>
          <div className="progress-bar-large">
            <div className="progress-fill-large" style={{ width: `${overall.accuracy * 100}%` }}></div>
          </div>
          <div className="overall-grid">
            <div className="overall-item">
              <div className="overall-item-value">{overall.total}</div>
              <div className="overall-item-label">Respondidas</div>
            </div>
            <div className="overall-item correct">
              <div className="overall-item-value">{overall.correct}</div>
              <div className="overall-item-label">Corretas</div>
            </div>
            <div className="overall-item wrong">
              <div className="overall-item-value">{overall.wrong}</div>
              <div className="overall-item-label">Erradas</div>
            </div>
          </div>
        </div>
      </section>

      <section className="specialty-stats">
        <h3>Por Especialidade</h3>
        {specialties.length === 0 ? (
          <div className="empty-stats">
            <p>Você ainda não respondeu nenhuma questão.</p>
          </div>
        ) : (
          <div className="specialty-list">
            {specialties.map(stat => (
              <div key={stat.specialty} className="specialty-card">
                <div className="specialty-card-header">
                  <span className="specialty-name">{stat.specialty}</span>
                  <span className="specialty-accuracy">{Math.round(stat.accuracy * 100)}%</span>
                </div>
                <div className="specialty-info">
                  <span>{stat.total_correct}/{stat.total_answered} corretas</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${stat.accuracy * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
