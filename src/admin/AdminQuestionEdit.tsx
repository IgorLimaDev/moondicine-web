import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './AdminQuestionEdit.css'

interface AnswerOption {
  id?: number
  option_letter: string
  option_text: string
  is_correct: boolean
}

export default function AdminQuestionEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = id !== undefined && id !== 'new'

  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    exam_source: '',
    question_number: '',
    question_text: '',
    specialty: '',
    sub_topic: '',
    difficulty: 3,
    image_url: ''
  })

  const [options, setOptions] = useState<AnswerOption[]>([
    { option_letter: 'A', option_text: '', is_correct: false },
    { option_letter: 'B', option_text: '', is_correct: false },
    { option_letter: 'C', option_text: '', is_correct: false },
    { option_letter: 'D', option_text: '', is_correct: false },
    { option_letter: 'E', option_text: '', is_correct: false },
  ])

  useEffect(() => {
    if (isEdit && id) {
      fetchQuestion(parseInt(id))
    }
  }, [id])

  const fetchQuestion = async (questionId: number) => {
    try {
      const [questionRes, optionsRes] = await Promise.all([
        supabase.from('questions').select('*').eq('id', questionId).single(),
        supabase.from('answer_options').select('*').eq('question_id', questionId).order('option_letter')
      ])

      if (questionRes.error) throw questionRes.error
      if (optionsRes.error) throw optionsRes.error

      setFormData({
        exam_source: questionRes.data.exam_source,
        question_number: questionRes.data.question_number.toString(),
        question_text: questionRes.data.question_text,
        specialty: questionRes.data.specialty,
        sub_topic: questionRes.data.sub_topic,
        difficulty: questionRes.data.difficulty,
        image_url: questionRes.data.image_url || ''
      })

      if (optionsRes.data && optionsRes.data.length > 0) {
        setOptions(optionsRes.data)
      }
    } catch (error) {
      console.error('Error fetching question:', error)
      setError('Erro ao carregar questão')
    } finally {
      setLoading(false)
    }
  }

  const handleOptionChange = (letter: string, field: keyof AnswerOption, value: any) => {
    setOptions(prev => prev.map(opt => 
      opt.option_letter === letter ? { ...opt, [field]: value } : opt
    ))
  }

  const handleCorrectChange = (letter: string) => {
    setOptions(prev => prev.map(opt => ({
      ...opt,
      is_correct: opt.option_letter === letter
    })))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      // Validate
      const correctCount = options.filter(o => o.is_correct).length
      if (correctCount !== 1) {
        setError('É necessário marcar exatamente uma resposta correta')
        setSaving(false)
        return
      }

      const emptyOptions = options.filter(o => !o.option_text.trim())
      if (emptyOptions.length > 0) {
        setError('Todas as alternativas devem ser preenchidas')
        setSaving(false)
        return
      }

      let questionId: number

      if (isEdit && id) {
        const { error: qError } = await supabase
          .from('questions')
          .update({
            exam_source: formData.exam_source,
            question_number: parseInt(formData.question_number),
            question_text: formData.question_text,
            specialty: formData.specialty,
            sub_topic: formData.sub_topic,
            difficulty: formData.difficulty,
            image_url: formData.image_url || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', parseInt(id))

        if (qError) throw qError
        questionId = parseInt(id)

        // Delete old options and insert new ones
        await supabase.from('answer_options').delete().eq('question_id', questionId)
      } else {
        const { data: qData, error: qError } = await supabase
          .from('questions')
          .insert({
            exam_source: formData.exam_source,
            question_number: parseInt(formData.question_number),
            question_text: formData.question_text,
            specialty: formData.specialty,
            sub_topic: formData.sub_topic,
            difficulty: formData.difficulty,
            image_url: formData.image_url || null
          })
          .select()
          .single()

        if (qError) throw qError
        questionId = qData.id
      }

      // Insert options
      const optionsToInsert = options.map(opt => ({
        question_id: questionId,
        option_letter: opt.option_letter,
        option_text: opt.option_text,
        is_correct: opt.is_correct
      }))

      const { error: oError } = await supabase
        .from('answer_options')
        .insert(optionsToInsert)

      if (oError) throw oError

      navigate('/admin/questions')
    } catch (error: any) {
      console.error('Error saving question:', error)
      setError(error.message || 'Erro ao salvar questão')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="loading">Carregando...</div>
  }

  return (
    <div className="admin-question-edit">
      <div className="admin-page-header">
        <div>
          <h2>{isEdit ? 'Editar Questão' : 'Nova Questão'}</h2>
          <p>Preencha os dados da questão e suas alternativas</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="question-form">
        <div className="form-section">
          <h3>Dados da Questão</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Prova/Exame *</label>
              <input
                type="text"
                value={formData.exam_source}
                onChange={(e) => setFormData({...formData, exam_source: e.target.value})}
                required
                placeholder="Ex: ENAM 2024"
              />
            </div>
            <div className="form-group">
              <label>Número da Questão *</label>
              <input
                type="number"
                value={formData.question_number}
                onChange={(e) => setFormData({...formData, question_number: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Especialidade *</label>
              <input
                type="text"
                value={formData.specialty}
                onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                required
                placeholder="Ex: Clínica Médica"
              />
            </div>
            <div className="form-group">
              <label>Subtópico *</label>
              <input
                type="text"
                value={formData.sub_topic}
                onChange={(e) => setFormData({...formData, sub_topic: e.target.value})}
                required
                placeholder="Ex: Cardiologia"
              />
            </div>
            <div className="form-group">
              <label>Dificuldade *</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({...formData, difficulty: parseInt(e.target.value)})}
              >
                <option value={1}>1 - Muito Fácil</option>
                <option value={2}>2 - Fácil</option>
                <option value={3}>3 - Médio</option>
                <option value={4}>4 - Difícil</option>
                <option value={5}>5 - Muito Difícil</option>
              </select>
            </div>
            <div className="form-group">
              <label>URL da Imagem (opcional)</label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div>
          </div>
          <div className="form-group full-width">
            <label>Texto da Questão *</label>
            <textarea
              value={formData.question_text}
              onChange={(e) => setFormData({...formData, question_text: e.target.value})}
              required
              rows={6}
              placeholder="Digite o enunciado da questão..."
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Alternativas</h3>
          <p className="section-description">Marque exatamente uma alternativa como correta</p>
          <div className="options-list">
            {options.map(option => (
              <div key={option.option_letter} className="option-row">
                <div className="option-letter">
                  <label>
                    <input
                      type="radio"
                      name="correct"
                      checked={option.is_correct}
                      onChange={() => handleCorrectChange(option.option_letter)}
                    />
                    <span>{option.option_letter}</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={option.option_text}
                  onChange={(e) => handleOptionChange(option.option_letter, 'option_text', e.target.value)}
                  placeholder={`Texto da alternativa ${option.option_letter}`}
                  className="option-input"
                />
              </div>
            ))}
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/admin/questions')} className="btn-cancel">
            Cancelar
          </button>
          <button type="submit" disabled={saving} className="btn-save">
            {saving ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Criar Questão'}
          </button>
        </div>
      </form>
    </div>
  )
}
