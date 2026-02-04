"use client"

import { useEffect } from 'react'

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('SW registered:', registration.scope)
            
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    if (confirm('A new version is available. Reload to update?')) {
                      window.location.reload()
                    }
                  }
                })
              }
            })
          })
          .catch((error) => {
            console.error('SW registration failed:', error)
          })
      })
    }
  }, [])

  return null
}
