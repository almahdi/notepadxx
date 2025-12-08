import { useEffect } from 'react'
import { toast } from 'sonner'

export function useOfflineReadyToast() {
  useEffect(() => {
    // Show offline ready toast on first load only
    const hasShownOfflineReady = localStorage.getItem('offline-ready-shown')
    
    if (!hasShownOfflineReady && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        toast.success('NotepadXX Ready for Offline Use', {
          description: 'Your notes are available even without internet connection',
          duration: 5000, // Auto-hide after 5 seconds
        })
        localStorage.setItem('offline-ready-shown', 'true')
      })
    }
  }, [])
}