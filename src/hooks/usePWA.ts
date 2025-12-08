import { useEffect } from 'react'
import { toast } from 'sonner'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

declare global {
  interface Window {
    deferredPrompt: BeforeInstallPromptEvent | null
  }
}

export function usePWA() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Handle install prompt
      window.addEventListener('beforeinstallprompt', (e) => {
        const promptEvent = e as BeforeInstallPromptEvent
        promptEvent.preventDefault()
        window.deferredPrompt = promptEvent
        
        toast('Install NotepadXX', {
          description: 'Add NotepadXX to your home screen for quick access',
          action: {
            label: 'Install',
            onClick: () => {
              const promptEvent = window.deferredPrompt
              if (promptEvent) {
                promptEvent.prompt()
                promptEvent.userChoice.then((choiceResult) => {
                  if (choiceResult.outcome === 'accepted') {
                    toast.success('NotepadXX installed successfully!')
                  }
                  window.deferredPrompt = null
                })
              }
            },
          },
          duration: 10000,
        })
      })

      // Handle service worker updates
      let refreshing = false
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return
        refreshing = true
        window.location.reload()
      })
    }
  }, [])
}

export function checkForSWUpdates() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              toast('App Update Available', {
                description: 'A new version of NotepadXX is ready to install',
                action: {
                  label: 'Reload',
                  onClick: () => {
                    window.location.reload()
                  },
                },
                duration: 15000,
              })
            }
          })
        }
      })
    })
  }
}