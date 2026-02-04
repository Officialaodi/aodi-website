"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Shield } from "lucide-react"

export default function AdminSetupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [checkingSetup, setCheckingSetup] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkSetupStatus()
  }, [])

  const checkSetupStatus = async () => {
    try {
      const response = await fetch("/api/admin/setup")
      if (response.ok) {
        const data = await response.json()
        if (!data.setupRequired) {
          router.push("/admin/login")
          return
        }
      }
    } catch (error) {
      console.error("Error checking setup status:", error)
    }
    setCheckingSetup(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName })
      })

      const data = await response.json()

      if (response.ok) {
        router.push("/admin/login")
      } else {
        setError(data.error || "Setup failed")
      }
    } catch {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (checkingSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0F3D2E] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-[#0F3D2E] flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl text-[#0F3D2E]">Initial Setup</CardTitle>
          <CardDescription>
            Create your Super Admin account to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required
                data-testid="input-setup-fullname"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                data-testid="input-setup-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password (min. 8 characters)"
                required
                data-testid="input-setup-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                data-testid="input-setup-confirm-password"
              />
            </div>
            {error && (
              <p className="text-sm text-red-600" data-testid="text-setup-error">{error}</p>
            )}
            <Button
              type="submit"
              className="w-full bg-[#0F3D2E] hover:bg-[#0F3D2E]/90"
              disabled={loading}
              data-testid="button-setup-submit"
            >
              {loading ? "Creating account..." : "Create Super Admin Account"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
