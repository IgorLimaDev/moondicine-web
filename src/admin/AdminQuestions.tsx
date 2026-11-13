import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './AdminQuestions.css'

interface Question {
  id: number
  exam_source: string
  question_number: number
  question_text: string
  specialty: string
  sub_topic: string
  difficulty: number
  image_url: string | null
  created_at: string
  updated_at: string
}

export default function AdminQuestions() {
  const navigate = useNavigate()
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSpecialty, setFilterSpecialty] = useState('all')
  const [specialties, setSpecialties] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 50

  useEffect(() => {
    fetchQuestions()
    fetchSpecialties()
  }, [searchTerm, filterSpecialty, currentPage])

  const fetchQuestions = async () => {
    try {
      const from = (currentPage - 1) * pageSize
      const to = from + pageSize - 1
      
      let query = supabase
        .from('questions')
        .select('*', { count: 'exact' })
        .order('updated_at', { ascending: false })
        .range(from, to)

      if (filterSpecialty !== 'all') {
        query = query.eq('specialty', filterSpecialty)
      }
      if (searchTerm) {
        query = query.or(`question_text.ilike.%${searchTerm}%,exam_source.ilike.%${searchTerm}%`)
      }

      const { data, error, count } = await query

      if (error) throw error
      setQuestions(data || [])
      setTotalCount(count || 0)
    } catch (error) {
      console.error('Error fetching questions:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSpecialties = async () => {
    try {
      const { data } = await supabase
        .from('questions')
        .select('specialty')
      
      const uniqueSpecialties = [...new Set(data?.map(d => d.specialty) || [])]
      setSpecialties(uniqueSpecialties.sort())
    } catch (error) {
      console.error('Error fetching specialties:', error)
    }
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterSpecialty])

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta questão? Isso também excluirá todas as alternativas e respostas relacionadas.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchQuestions()
    } catch (error) {
      console.error('Error deleting question:', error)
      alert('Erro ao excluir questão')
    }
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  return (
    <div className="admin-questions">
      <div className="admin-page-header">
        <div>
          <h2>Gerenciar Questões</h2>
          <p>{totalCount} questões cadastradas {totalPages > 1 && `(Página ${currentPage} de ${totalPages})`}</p>
        </div>
        <button onClick={() => navigate('/admin/questions/new')} className="btn-add">
          ➕ Nova Questão
        </button>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Buscar por texto ou prova..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={filterSpecialty}
          onChange={(e) => setFilterSpecialty(e.target.value)}
          className="filter-select"
        >
          <option value="all">Todas as especialidades</option>
          {specialties.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading">Carregando...</div>
      ) : (
        <div className="questions-list">
          {questions.map(question => (
            <div key={question.id} className="question-card">
              <div className="question-card-header">
                <div className="question-meta">
                  <span className="meta-badge exam">{question.exam_source} #{question.question_number}</span>
                  <span className="meta-badge specialty">{question.specialty}</span>
                  <span className="meta-badge difficulty">Dificuldade: {question.difficulty}/5</span>
                  <span className="meta-badge">Atualizado em {formatDate(question.updated_at)}</span>
                </div>
                <div className="question-actions">
                  <button onClick={() => navigate(`/admin/questions/${question.id}`)} className="btn-action edit">
                    ✏️ Editar
                  </button>
                  <button onClick={() => handleDelete(question.id)} className="btn-action delete">
                    🗑️ Excluir
                  </button>
                </div>
              </div>
              <div className="question-card-body">
                <p className="question-text">{question.question_text}</p>
                {question.sub_topic && (
                  <p className="question-subtopic"><strong>Subtópico:</strong> {question.sub_topic}</p>
                )}
              </div>
            </div>
          ))}
          {questions.length === 0 && (
            <div className="empty-state">
              <p>Nenhuma questão encontrada</p>
            </div>
          )}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="page-btn"
              >
                ← Anterior
              </button>
              <span className="page-info">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="page-btn"
              >
                Próxima →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
