import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './SpecialtyBrowserPage.css'

interface SpecialtyGroup {
  specialty: string
  count: number
}

export default function SpecialtyBrowserPage() {
  const navigate = useNavigate()
  const [specialties, setSpecialties] = useState<SpecialtyGroup[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSpecialties()
  }, [])

  const fetchSpecialties = async () => {
    try {
      const { data } = await supabase.from('questions').select('specialty')
      const groups = new Map<string, number>()
      data?.forEach(q => {
        groups.set(q.specialty, (groups.get(q.specialty) || 0) + 1)
      })
      const list = Array.from(groups.entries()).map(([specialty, count]) => ({
        specialty,
        count
      })).sort((a, b) => a.specialty.localeCompare(b.specialty))
      setSpecialties(list)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const startSpecialty = (specialty: string, mode: string) => {
    navigate(`/quiz?specialty=${encodeURIComponent(specialty)}&mode=${mode}`)
  }

  if (loading) return <div className="specialty-page"><div className="loading">Carregando...</div></div>

  return (
    <div className="specialty-page">
      <div className="page-header">
        <button onClick={() => navigate('/')} className="btn-back">← Voltar</button>
        <h2>Especialidades</h2>
        <p>Foque em uma matéria específica</p>
      </div>

      <div className="specialty-grid">
        {specialties.map(spec => (
          <div key={spec.specialty} className="specialty-card-item">
            <h3>🩺 {spec.specialty}</h3>
            <p>{spec.count} questões</p>
            <div className="specialty-actions">
              <button onClick={() => startSpecialty(spec.specialty, 'teste')} className="btn-spec">
                Praticar
              </button>
              <button onClick={() => startSpecialty(spec.specialty, 'infinito')} className="btn-spec infinite">
                Infinito
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
