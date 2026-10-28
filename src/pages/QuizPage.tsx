import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const { user } = useAuth()
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [startTime] = useState(Date.now())

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    try {
      const { data: questionsData, error: qError } = await supabase
        .from('questions')
        .select('*')
        .limit(50)

      if (qError) throw qError

      // Shuffle questions
      const shuffled = (questionsData || []).sort(() => Math.random() - 0.5).slice(0, 10)

      const questionsWithOptions = await Promise.all(
        shuffled.map(async (q) => {
          const { data: optionsData } = await supabase
            .from('answer_options')
            .select('*')
            .eq('question_id', q.id)
            .order('option_letter')
          
          return { ...q, answer_options: optionsData || [] }
        })
      )

      setQuestions(questionsWithOptions)
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
          question_id: currentQuestion.id,
          selected_option_id: selectedOption,
          is_correct: selectedOpt?.is_correct || false,
          time_spent_seconds: Math.floor((Date.now() - startTime) / 1000)
        })
      } catch (error) {
        console.error('Error saving answer:', error)
      }
    }
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setSelectedOption(null)
      setAnswered(false)
    } else {
      finishQuiz()
    }
  }

  const finishQuiz = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000)
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

  return (
    <div className="quiz-page">
      <div className="quiz-header">
        <div className="quiz-progress-info">
          <span>Questão {currentIndex + 1} de {questions.length}</span>
          <span className="quiz-meta">{currentQuestion.exam_source} #{currentQuestion.question_number}</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
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
            <button onClick={handleNext} className="btn-next">
              {currentIndex < questions.length - 1 ? 'Próxima Questão' : 'Ver Resultado'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
