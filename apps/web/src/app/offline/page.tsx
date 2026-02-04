"use client"

import { WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function OfflinePage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
          <WifiOff className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-charcoal mb-4">
          You're Offline
        </h1>
        <p className="text-slate mb-6">
          It looks like you've lost your internet connection. Some features may be unavailable until you're back online.
        </p>
        <Button 
          onClick={() => window.location.reload()}
          data-testid="button-retry"
        >
          Try Again
        </Button>
      </div>
    </div>
  )
}
