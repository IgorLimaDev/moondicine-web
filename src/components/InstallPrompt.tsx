import { useEffect, useState } from 'react'
import './InstallPrompt.css'

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone
    setIsStandalone(standalone)
    
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(iOS)

    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      ;(window as any).deferredPrompt = e
      const dismissed = localStorage.getItem('install-prompt-dismissed')
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 2000)
      }
    }
    window.addEventListener('beforeinstallprompt', handler)
    
    if (iOS && !standalone) {
      const dismissed = localStorage.getItem('install-prompt-dismissed')
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 3000)
      }
    }
    
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (isIOS) {
      return
    }
    const prompt = deferredPrompt || (window as any).deferredPrompt
    if (!prompt) return
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') {
      setShowPrompt(false)
      delete (window as any).deferredPrompt
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('install-prompt-dismissed', 'true')
  }

  if (isStandalone || !showPrompt) return null

  return (
    <div className="install-prompt">
      <div className="install-prompt-content">
        <img src="/favicon.png" alt="Moondicine" className="install-prompt-icon" />
        <div className="install-prompt-text">
          <strong>Instalar Moondicine</strong>
          {isIOS ? (
            <p>Toque em ⋮ → Adicionar à Tela de Início</p>
          ) : (
            <p>Adicione à tela inicial para acesso rápido</p>
          )}
        </div>
        {!isIOS && deferredPrompt && (
          <button onClick={handleInstall} className="install-prompt-btn">Instalar</button>
        )}
        <button onClick={handleDismiss} className="install-prompt-close">×</button>
      </div>
    </div>
  )
}
