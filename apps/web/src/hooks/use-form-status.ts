"use client"

import { useEffect, useState } from "react"

interface FormStatus {
  isEnabled: boolean
  isLoading: boolean
  closedMessage: string
}

export function useFormStatus(slug: string): FormStatus {
  const [status, setStatus] = useState<FormStatus>({
    isEnabled: true,
    isLoading: true,
    closedMessage: "This form is currently closed for submissions.",
  })

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/forms/${slug}`)
        if (res.ok) {
          const data = await res.json()
          setStatus({
            isEnabled: data.isEnabled,
            isLoading: false,
            closedMessage: data.closedMessage || "This form is currently closed for submissions.",
          })
        } else {
          setStatus({
            isEnabled: true,
            isLoading: false,
            closedMessage: "",
          })
        }
      } catch (error) {
        console.error("Error checking form status:", error)
        setStatus({
          isEnabled: true,
          isLoading: false,
          closedMessage: "",
        })
      }
    }
    checkStatus()
  }, [slug])

  return status
}
