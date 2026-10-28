import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './ExamBrowserPage.css'

interface ExamGroup {
  exam_source: string
  count: number
}

export default function ExamBrowserPage() {
  const navigate = useNavigate()
  const [exams, setExams] = useState<ExamGroup[]>([])
  const [loading, setLoading] = useState(true)

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
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const startExam = (examSource: string, mode: string) => {
    navigate(`/quiz?exam=${encodeURIComponent(examSource)}&mode=${mode}`)
  }

  if (loading) return <div className="exam-page"><div className="loading">Carregando...</div></div>

  return (
    <div className="exam-page">
      <div className="page-header">
        <button onClick={() => navigate('/')} className="btn-back">← Voltar</button>
        <h2>Provas</h2>
        <p>Selecione uma prova para praticar</p>
      </div>

      <div className="exam-list">
        {exams.map(exam => (
          <div key={exam.exam_source} className="exam-card">
            <div className="exam-card-header">
              <h3>📚 {exam.exam_source}</h3>
              <span className="exam-count">{exam.count} questões</span>
            </div>
            <div className="exam-card-actions">
              <button onClick={() => startExam(exam.exam_source, 'teste')} className="btn-exam">
                Iniciar Quiz
              </button>
              <button onClick={() => startExam(exam.exam_source, 'infinito')} className="btn-exam infinite">
                Modo Infinito
              </button>
            </div>
          </div>
        ))}
        {exams.length === 0 && (
          <div className="empty">Nenhuma prova disponível</div>
        )}
      </div>
    </div>
  )
}
