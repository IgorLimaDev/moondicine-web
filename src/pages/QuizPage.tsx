import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import './QuizPage.css'

interface Question {
  id: number
  question_text: string
  exam_source: string
  question_number: number
  specialty: string
  difficulty: number
  answer_options: AnswerOption[]
}

interface AnswerOption {
  id: number
  option_letter: string
  option_text: string
  is_correct: boolean
}

export default function QuizPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [startTime] = useState(Date.now())
  const [isInfinito, setIsInfinito] = useState(false)
  const [timer, setTimer] = useState(0)
  const [isFlagged, setIsFlagged] = useState(false)
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [noteText, setNoteText] = useState('')

  useEffect(() => {
    const mode = searchParams.get('mode')
    setIsInfinito(mode === 'infinito')
    fetchQuestions()
  }, [])

  useEffect(() => {
    if (questions[currentIndex] && user) {
      checkIfFlagged(questions[currentIndex].id)
      fetchNote(questions[currentIndex].id)
    }
  }, [currentIndex, questions])

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const checkIfFlagged = async (questionId: number) => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('question_flags')
        .select('id')
        .eq('user_id', user.id)
        .eq('question_id', questionId)
        .maybeSingle()
      if (error) {
        setIsFlagged(false)
        return
      }
      setIsFlagged(!!data)
    } catch (e) {
      setIsFlagged(false)
    }
  }

  const fetchNote = async (questionId: number) => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('question_notes')
        .select('note_text')
        .eq('user_id', user.id)
        .eq('question_id', questionId)
        .maybeSingle()
      if (error) {
        setNoteText('')
        return
      }
      setNoteText(data?.note_text || '')
    } catch (e) {
      setNoteText('')
    }
  }

  const toggleFlag = async () => {
    if (!user || !questions[currentIndex]) return
    const questionId = questions[currentIndex].id
    if (isFlagged) {
      await supabase
        .from('question_flags')
        .delete()
        .eq('user_id', user.id)
        .eq('question_id', questionId)
      setIsFlagged(false)
    } else {
      await supabase
        .from('question_flags')
        .insert({ user_id: user.id, question_id: questionId })
      setIsFlagged(true)
    }
  }

  const saveNote = async () => {
    if (!user || !questions[currentIndex]) return
    const questionId = questions[currentIndex].id
    if (noteText.trim() === '') {
      await supabase
        .from('question_notes')
        .delete()
        .eq('user_id', user.id)
        .eq('question_id', questionId)
    } else {
      await supabase
        .from('question_notes')
        .upsert({ user_id: user.id, question_id: questionId, note_text: noteText }, { onConflict: 'user_id,question_id' })
    }
    setShowNoteModal(false)
  }

  const fetchQuestions = async () => {
    try {
      const examFilter = searchParams.get('exam')
      const specialtyFilter = searchParams.get('specialty')
      const mode = searchParams.get('mode')
      
      let query = supabase.from('questions').select('*')
      
      if (examFilter) query = query.eq('exam_source', examFilter)
      if (specialtyFilter) query = query.eq('specialty', specialtyFilter)
      
      const { data: questionsData, error: qError } = await query

      if (qError) throw qError

      if (mode === 'infinito') {
        const shuffled = (questionsData || []).sort(() => Math.random() - 0.5)
        const questionsWithOptions = await Promise.all(
          shuffled.slice(0, 40).map(async (q: any) => {
            const { data: optionsData } = await supabase
              .from('answer_options')
              .select('*')
              .eq('question_id', q.id)
              .order('option_letter')
            return { ...q, answer_options: optionsData || [] }
          })
        )
        setQuestions(questionsWithOptions)
      } else if (examFilter) {
        const list = (questionsData || []).sort((a: any, b: any) => (a.question_number || 0) - (b.question_number || 0))
        const questionsWithOptions = await Promise.all(
          list.map(async (q: any) => {
            const { data: optionsData } = await supabase
              .from('answer_options')
              .select('*')
              .eq('question_id', q.id)
              .order('option_letter')
            return { ...q, answer_options: optionsData || [] }
          })
        )
        setQuestions(questionsWithOptions)
      } else if (specialtyFilter) {
        const shuffled = (questionsData || []).sort(() => Math.random() - 0.5)
        const questionsWithOptions = await Promise.all(
          shuffled.map(async (q: any) => {
            const { data: optionsData } = await supabase
              .from('answer_options')
              .select('*')
              .eq('question_id', q.id)
              .order('option_letter')
            return { ...q, answer_options: optionsData || [] }
          })
        )
        setQuestions(questionsWithOptions)
      } else {
        const shuffled = (questionsData || []).sort(() => Math.random() - 0.5).slice(0, 10)
        const questionsWithOptions = await Promise.all(
          shuffled.map(async (q: any) => {
            const { data: optionsData } = await supabase
              .from('answer_options')
              .select('*')
              .eq('question_id', q.id)
              .order('option_letter')
            return { ...q, answer_options: optionsData || [] }
          })
        )
        setQuestions(questionsWithOptions)
      }
    } catch (error) {
      console.error('Error fetching questions:', error)
      alert('Erro ao carregar questões')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectOption = (optionId: number) => {
    if (answered) return
    setSelectedOption(optionId)
  }

  const handleConfirmAnswer = async () => {
    if (selectedOption === null) return
    setAnswered(true)

    const currentQuestion = questions[currentIndex]
    const selectedOpt = currentQuestion.answer_options.find(o => o.id === selectedOption)
    
    if (selectedOpt?.is_correct) {
      setCorrectCount(prev => prev + 1)
    }

    // Save user answer
    if (user) {
      try {
        await supabase.from('user_answers').insert({
          user_id: user.id,
          question_id: currentQuestion.id,
          selected_option_id: selectedOption,
          is_correct: selectedOpt?.is_correct || false,
          answered_at: new Date().toISOString(),
          time_spent_seconds: Math.floor((Date.now() - startTime) / 1000)
        })
      } catch (error) {
        console.error('Error saving answer:', error)
      }
    }
  }

  const handleNext = () => {
    if (isInfinito && answered) {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1)
        setSelectedOption(null)
        setAnswered(false)
      } else {
        fetchMoreQuestions()
      }
    } else if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setSelectedOption(null)
      setAnswered(false)
    } else {
      finishQuiz()
    }
  }

  const fetchMoreQuestions = async () => {
    try {
      const examFilter = searchParams.get('exam')
      const specialtyFilter = searchParams.get('specialty')
      const mode = searchParams.get('mode')
      
      if (mode !== 'infinito') {
        finishQuiz()
        return
      }
      
      let query = supabase.from('questions').select('*')
      if (examFilter) query = query.eq('exam_source', examFilter)
      if (specialtyFilter) query = query.eq('specialty', specialtyFilter)
      
      const { data: questionsData } = await query
      
      const shownIds = questions.map(q => q.id)
      const remaining = (questionsData || []).filter((q: any) => !shownIds.includes(q.id))
      let toAdd = []
      
      if (remaining.length > 0) {
        toAdd = remaining.sort(() => Math.random() - 0.5).slice(0, 10)
      } else {
        toAdd = (questionsData || []).sort(() => Math.random() - 0.5).slice(0, 10)
      }
      
      const questionsWithOptions = await Promise.all(
        toAdd.map(async (q: any) => {
          const { data: optionsData } = await supabase
            .from('answer_options')
            .select('*')
            .eq('question_id', q.id)
            .order('option_letter')
          return { ...q, answer_options: optionsData || [] }
        })
      )
      
      setQuestions(prev => [...prev, ...questionsWithOptions])
      setCurrentIndex(prev => prev + 1)
      setSelectedOption(null)
      setAnswered(false)
    } catch (error) {
      finishQuiz()
    }
  }

  const finishQuiz = async () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000)
    
    // Update streak
    if (user) {
      try {
        const { data: profile } = await supabase.from('user_profiles').select('*').eq('id', user.id).single()
        const today = new Date().toDateString()
        const lastStudy = profile?.last_study_date ? new Date(profile.last_study_date).toDateString() : null
        let newStreak = profile?.current_streak_days || 0
        
        if (lastStudy !== today) {
          const yesterday = new Date(Date.now() - 86400000).toDateString()
          if (lastStudy === yesterday) {
            newStreak = (profile?.current_streak_days || 0) + 1
          } else {
            newStreak = 1
          }
          await supabase.from('user_profiles').update({
            current_streak_days: newStreak,
            last_study_date: new Date().toISOString(),
            total_questions_answered: (profile?.total_questions_answered || 0) + questions.length
          }).eq('id', user.id)
        }
      } catch (e) {
        console.error('Error updating streak:', e)
      }
    }
    
    navigate('/quiz/result', {
      state: {
        total: questions.length,
        correct: correctCount,
        timeSpent
      }
    })
  }

  if (loading) {
    return <div className="quiz-page"><div className="loading">Carregando questões...</div></div>
  }

  if (questions.length === 0) {
    return (
      <div className="quiz-page">
        <div className="no-questions">
          <h2>Nenhuma questão disponível</h2>
          <p>Não há questões cadastradas no banco de dados.</p>
          <button onClick={() => navigate('/')} className="btn-back">Voltar ao Início</button>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="quiz-page">
      <div className="quiz-header">
        <div className="quiz-progress-info">
          <span>{isInfinito ? `Questão ${currentIndex + 1} • Modo Infinito` : `Questão ${currentIndex + 1} de ${questions.length}`}</span>
          <span className="quiz-meta">⏱ {formatTime(timer)} | ✓ {correctCount} / {currentIndex + 1}</span>
        </div>
        <div className="quiz-progress-info">
          <span className="quiz-meta">{currentQuestion.exam_source} #{currentQuestion.question_number} • {currentQuestion.specialty}</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={toggleFlag} className={`btn-flag ${isFlagged ? 'active' : ''}`} title="Marcar questão">
              {isFlagged ? '🚩 Marcada' : '🏴 Marcar'}
            </button>
            <button onClick={() => setShowNoteModal(true)} className="btn-note" title="Adicionar anotação">
              📝 Anotação
            </button>
          </div>
        </div>
        {!isInfinito && (
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        )}
      </div>

      <div className="quiz-content">
        <div className="question-card">
          <div className="question-header-info">
            <span className="badge">{currentQuestion.specialty}</span>
            <span className="badge">Dificuldade: {currentQuestion.difficulty}/5</span>
          </div>
          <p className="question-text">{currentQuestion.question_text}</p>
        </div>

        <div className="options-list">
          {currentQuestion.answer_options.map(option => {
            const isSelected = selectedOption === option.id
            const showCorrect = answered && option.is_correct
            const showWrong = answered && isSelected && !option.is_correct
            
            return (
              <button
                key={option.id}
                onClick={() => handleSelectOption(option.id)}
                disabled={answered}
                className={`option-button ${isSelected ? 'selected' : ''} ${showCorrect ? 'correct' : ''} ${showWrong ? 'wrong' : ''}`}
              >
                <span className="option-letter">{option.option_letter}</span>
                <span className="option-text">{option.option_text}</span>
                {showCorrect && <span className="option-icon">✓</span>}
                {showWrong && <span className="option-icon">✗</span>}
              </button>
            )
          })}
        </div>

        {answered && (
          ((currentQuestion as any).explanation || (currentQuestion as any).explanation_text || (currentQuestion as any).justificativa || (currentQuestion as any).resolution) && (
            <div className="explanation-card">
              <h4>💡 Explicação</h4>
              <p>{(currentQuestion as any).explanation || (currentQuestion as any).explanation_text || (currentQuestion as any).justificativa || (currentQuestion as any).resolution}</p>
            </div>
          )
        )}

        <div className="quiz-actions">
          {!answered ? (
            <button
              onClick={handleConfirmAnswer}
              disabled={selectedOption === null}
              className="btn-confirm"
            >
              Confirmar Resposta
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
              {isInfinito && (
                <button onClick={finishQuiz} className="btn-finish">
                  Finalizar
                </button>
              )}
              <button onClick={handleNext} className="btn-next" style={{ flex: 1 }}>
                {isInfinito ? 'Próxima Questão' : currentIndex < questions.length - 1 ? 'Próxima Questão' : 'Finalizar Simulado'}
              </button>
            </div>
          )}
        </div>
      </div>

      {showNoteModal && (
        <div className="modal-overlay" onClick={() => setShowNoteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Anotação para questão #{currentQuestion.question_number}</h3>
              <button onClick={() => setShowNoteModal(false)} className="modal-close">×</button>
            </div>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Digite sua anotação..."
              className="note-textarea"
              rows={6}
            />
            <div className="modal-actions">
              <button onClick={() => setShowNoteModal(false)} className="btn-modal secondary">Cancelar</button>
              <button onClick={saveNote} className="btn-modal primary">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
