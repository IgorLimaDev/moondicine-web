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

interface FlaggedQuestion {
  id: number
  question_id: number
  flagged_at: string
  questions: ReviewItem['questions'] & { id: number }
}

export default function ReviewPage() {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [flagged, setFlagged] = useState<FlaggedQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'wrong' | 'flagged'>('all')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [options, setOptions] = useState<any[]>([])

  useEffect(() => {
    if (user) {
      fetchReviews()
      fetchFlagged()
    }
  }, [user])

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('user_answers')
        .select(`
          id,
          user_id,
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

      if (error) throw error
      setReviews(data as any || [])
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFlagged = async () => {
    try {
      const { data } = await supabase
        .from('question_flags')
        .select(`
          id,
          question_id,
          flagged_at,
          questions (
            id,
            question_text,
            exam_source,
            question_number,
            specialty
          )
        `)
        .eq('user_id', user?.id)
        .order('flagged_at', { ascending: false })
      setFlagged(data as any || [])
    } catch (error) {
      console.error('Error fetching flagged:', error)
    }
  }

  const expandQuestion = async (questionId: number) => {
    if (expandedId === questionId) {
      setExpandedId(null)
      setOptions([])
      return
    }
    setExpandedId(questionId)
    const { data } = await supabase
      .from('answer_options')
      .select('*')
      .eq('question_id', questionId)
      .order('option_letter')
    setOptions(data || [])
  }

  const removeFlag = async (flagId: number) => {
    await supabase.from('question_flags').delete().eq('id', flagId)
    fetchFlagged()
  }

  const filteredReviews = activeTab === 'wrong' 
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

  if (loading) return <div className="review-page"><div className="loading">Carregando...</div></div>

  return (
    <div className="review-page">
      <div className="review-header">
        <h2>Revisão de Questões</h2>
        <p>Revise suas respostas e questões marcadas</p>
      </div>

      <div className="review-tabs">
        <button onClick={() => setActiveTab('all')} className={activeTab === 'all' ? 'tab-btn active' : 'tab-btn'}>
          Todas ({reviews.length})
        </button>
        <button onClick={() => setActiveTab('wrong')} className={activeTab === 'wrong' ? 'tab-btn active' : 'tab-btn'}>
          Erradas ({reviews.filter(r => !r.is_correct).length})
        </button>
        <button onClick={() => setActiveTab('flagged')} className={activeTab === 'flagged' ? 'tab-btn active' : 'tab-btn'}>
          Marcadas ({flagged.length})
        </button>
      </div>

      {activeTab === 'flagged' ? (
        flagged.length === 0 ? (
          <div className="empty-state"><p>Nenhuma questão marcada</p></div>
        ) : (
          <div className="review-list">
            {flagged.map(item => (
              <div key={item.id} className="review-card">
                <div className="review-card-header">
                  <div className="review-meta">
                    <span className="review-badge exam">{item.questions.exam_source} #{item.questions.question_number}</span>
                    <span className="review-badge specialty">{item.questions.specialty}</span>
                  </div>
                  <button onClick={() => removeFlag(item.id)} className="btn-unflag">Remover marcação</button>
                </div>
                <div className="review-card-body" onClick={() => expandQuestion(item.question_id)}>
                  <p className="review-question-text">{item.questions.question_text}</p>
                  {expandedId === item.question_id && (
                    <div className="expanded-options">
                      {options.map(opt => (
                        <div key={opt.id} className={`option-item ${opt.is_correct ? 'correct' : ''}`}>
                          <strong>{opt.option_letter})</strong> {opt.option_text}
                          {opt.is_correct && <span> ✓</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        filteredReviews.length === 0 ? (
          <div className="empty-state">
            <p>{activeTab === 'wrong' ? 'Parabéns! Nenhuma questão errada.' : 'Você ainda não respondeu nenhuma questão.'}</p>
          </div>
        ) : (
          <div className="review-list">
            {filteredReviews.map(review => (
              <div key={review.id} className="review-card">
                <div className="review-card-header">
                  <div className="review-meta">
                    <span className="review-badge exam">{review.questions.exam_source} #{review.questions.question_number}</span>
                    <span className="review-badge specialty">{review.questions.specialty}</span>
                    <span className={`review-badge status ${review.is_correct ? 'correct' : 'wrong'}`}>
                      {review.is_correct ? '✓ Acertou' : '✗ Errou'}
                    </span>
                  </div>
                  <span className="review-date">{formatDate(review.answered_at)}</span>
                </div>
                <div className="review-card-body" onClick={() => expandQuestion(review.question_id)}>
                  <p className="review-question-text">{review.questions.question_text}</p>
                  {expandedId === review.question_id && (
                    <div className="expanded-options">
                      {options.map(opt => (
                        <div key={opt.id} className={`option-item ${opt.is_correct ? 'correct' : ''}`}>
                          <strong>{opt.option_letter})</strong> {opt.option_text}
                          {opt.is_correct && <span> ✓</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
