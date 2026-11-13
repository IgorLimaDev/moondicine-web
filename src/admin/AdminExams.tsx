import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import './AdminExams.css'

interface ExamGroup {
  exam_source: string
  count: number
}

export default function AdminExams() {
  const [exams, setExams] = useState<ExamGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchExams()
  }, [])

  const fetchExams = async () => {
    try {
      const { data } = await supabase.from('questions').select('exam_source')
      const groups = new Map<string, number>()
      data?.forEach(q => {
        groups.set(q.exam_source, (groups.get(q.exam_source) || 0) + 1)
      })
      const examList = Array.from(groups.entries()).map(([exam_source, count]) => ({
        exam_source,
        count
      })).sort((a, b) => a.exam_source.localeCompare(b.exam_source))
      setExams(examList)
    } catch (error) {
      console.error('Error fetching exams:', error)
    } finally {
      setLoading(false)
    }
  }

  const startRename = (examSource: string) => {
    setRenamingId(examSource)
    setNewName(examSource)
    setError('')
    setSuccess('')
  }

  const cancelRename = () => {
    setRenamingId(null)
    setNewName('')
    setError('')
    setSuccess('')
  }

  const handleRename = async (oldExamSource: string) => {
    if (!newName.trim() || newName.trim() === oldExamSource) {
      cancelRename()
      return
    }

    setError('')
    setSuccess('')

    try {
      const { error: updateError } = await supabase
        .from('questions')
        .update({ exam_source: newName.trim() })
        .eq('exam_source', oldExamSource)

      if (updateError) throw updateError

      setSuccess(`Prova "${oldExamSource}" renomeada para "${newName.trim()}" com sucesso!`)
      fetchExams()
      cancelRename()
    } catch (error: any) {
      setError(error.message || 'Erro ao renomear prova')
    }
  }

  const formatCount = (count: number) => {
    return `${count} questão${count !== 1 ? 'ões' : ''}`
  }

  return (
    <div className="admin-exams">
      <div className="admin-page-header">
        <h2>Gerenciar Provas</h2>
        <p>{exams.length} provas cadastradas</p>
      </div>

      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}

      {loading ? (
        <div className="loading">Carregando...</div>
      ) : (
        <div className="exams-list">
          {exams.map(exam => (
            <div key={exam.exam_source} className="exam-card">
              <div className="exam-card-header">
                {renamingId === exam.exam_source ? (
                  <div className="rename-form">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="rename-input"
                      autoFocus
                    />
                    <div className="rename-actions">
                      <button onClick={() => handleRename(exam.exam_source)} className="btn-save">
                        Salvar
                      </button>
                      <button onClick={cancelRename} className="btn-cancel">
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3>📚 {exam.exam_source}</h3>
                    <span className="exam-count">{formatCount(exam.count)}</span>
                  </>
                )}
              </div>
              <div className="exam-card-actions">
                {renamingId !== exam.exam_source && (
                  <button onClick={() => startRename(exam.exam_source)} className="btn-action rename">
                    ✏️ Renomear
                  </button>
                )}
              </div>
            </div>
          ))}
          {exams.length === 0 && (
            <div className="empty-state">
              <p>Nenhuma prova cadastrada</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}