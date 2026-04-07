"use client"

import * as Sentry from "@sentry/nextjs"
import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.captureException(error)
    }
  }, [error])

  return (
    <html>
      <body>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          fontFamily: 'sans-serif',
          textAlign: 'center',
          padding: '2rem',
        }}>
          <h1 style={{ fontSize: '2rem', color: '#1a5c38', marginBottom: '1rem' }}>
            Something went wrong
          </h1>
          <p style={{ color: '#666', marginBottom: '2rem' }}>
            We&apos;re sorry for the inconvenience. Please try again.
          </p>
          <button
            onClick={reset}
            style={{
              background: '#1a5c38',
              color: 'white',
              border: 'none',
              padding: '0.75rem 2rem',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
