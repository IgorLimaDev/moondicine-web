import { useEffect, useState } from 'react'
import './InstallPrompt.css'

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShowPrompt(false)
    }
    setDeferredPrompt(null)
  }

  if (!showPrompt) return null

  return (
    <div className="install-prompt">
      <div className="install-prompt-content">
        <img src="/favicon.png" alt="Moondicine" className="install-prompt-icon" />
        <div className="install-prompt-text">
          <strong>Instalar Moondicine</strong>
          <p>Adicione à tela inicial para acesso rápido</p>
        </div>
        <button onClick={handleInstall} className="install-prompt-btn">Instalar</button>
        <button onClick={() => setShowPrompt(false)} className="install-prompt-close">×</button>
      </div>
    </div>
  )
}
