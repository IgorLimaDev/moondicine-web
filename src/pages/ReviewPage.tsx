import { useEffect, useState } from 'react'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'
import './ReviewPage.css'

interface ReviewItem {
  id: number
  question_id: number
  is_correct: boolean
  answered_at: string
  questions: {
    question_text: string
    exam_source: string
    question_number: number
    specialty: string
  }
}

export default function ReviewPage() {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'wrong'>('all')

  useEffect(() => {
    if (user) {
      fetchReviews()
    }
  }, [user])

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('user_answers')
        .select(`
          id,
          question_id,
          is_correct,
          answered_at,
          questions (
            question_text,
            exam_source,
            question_number,
            specialty
          )
        `)
        .eq('user_id', user?.id)
        .order('answered_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setReviews(data as any || [])
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredReviews = filter === 'wrong' 
    ? reviews.filter(r => !r.is_correct)
    : reviews

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="review-page">
      <div className="review-header">
        <h2>Revisão de Questões</h2>
        <p>Histórico das suas respostas</p>
      </div>

      <div className="review-filters">
        <button
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'filter-btn active' : 'filter-btn'}
        >
          Todas ({reviews.length})
        </button>
        <button
          onClick={() => setFilter('wrong')}
          className={filter === 'wrong' ? 'filter-btn active' : 'filter-btn'}
        >
          Erradas ({reviews.filter(r => !r.is_correct).length})
        </button>
      </div>

      {loading ? (
        <div className="loading">Carregando...</div>
      ) : filteredReviews.length === 0 ? (
        <div className="empty-state">
          <p>
            {filter === 'wrong' 
              ? 'Parabéns! Você não errou nenhuma questão ainda.' 
              : 'Você ainda não respondeu nenhuma questão.'}
          </p>
        </div>
      ) : (
        <div className="review-list">
          {filteredReviews.map(review => (
            <div key={review.id} className="review-card">
              <div className="review-card-header">
                <div className="review-meta">
                  <span className="review-badge exam">
                    {review.questions.exam_source} #{review.questions.question_number}
                  </span>
                  <span className="review-badge specialty">{review.questions.specialty}</span>
                  <span className={`review-badge status ${review.is_correct ? 'correct' : 'wrong'}`}>
                    {review.is_correct ? '✓ Acertou' : '✗ Errou'}
                  </span>
                </div>
                <span className="review-date">{formatDate(review.answered_at)}</span>
              </div>
              <div className="review-card-body">
                <p className="review-question-text">{review.questions.question_text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
