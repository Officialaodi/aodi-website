"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      const dismissed = localStorage.getItem('pwa-install-dismissed')
      if (!dismissed) {
        setShowInstallBanner(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setShowInstallBanner(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowInstallBanner(false)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  if (!showInstallBanner) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        aria-label="Dismiss"
        data-testid="button-dismiss-pwa"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-aodi-green rounded-lg flex items-center justify-center">
          <Download className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-charcoal text-sm">Install AODI App</h3>
          <p className="text-xs text-slate mt-1">
            Add to your home screen for quick access and offline support.
          </p>
          <Button
            size="sm"
            onClick={handleInstall}
            className="mt-3"
            data-testid="button-install-pwa"
          >
            Install
          </Button>
        </div>
      </div>
    </div>
  )
}
