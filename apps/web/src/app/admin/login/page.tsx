"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"
import Captcha, { CaptchaRef } from "@/components/ui/captcha"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [checkingSetup, setCheckingSetup] = useState(true)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const captchaRef = useRef<CaptchaRef>(null)
  const router = useRouter()

  const siteKeyConfigured = typeof window !== "undefined" && !!process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY

  useEffect(() => {
    checkSetupStatus()
  }, [])

  const checkSetupStatus = async () => {
    try {
      const response = await fetch("/api/admin/setup")
      if (response.ok) {
        const data = await response.json()
        if (data.setupRequired) {
          router.push("/admin/setup")
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

    if (siteKeyConfigured && !captchaToken) {
      setError("Please complete the captcha verification")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, captchaToken })
      })

      if (response.ok) {
        router.push("/admin")
      } else {
        const data = await response.json()
        setError(data.error || "Login failed")
        captchaRef.current?.reset()
        setCaptchaToken(null)
      }
    } catch {
      setError("An error occurred. Please try again.")
      captchaRef.current?.reset()
      setCaptchaToken(null)
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
          <CardTitle className="text-2xl text-[#0F3D2E]">Admin Login</CardTitle>
          <CardDescription>
            Sign in to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                data-testid="input-admin-email"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/admin/forgot-password"
                  className="text-sm text-[#0F3D2E] hover:underline"
                  data-testid="link-forgot-password"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="pr-10"
                  data-testid="input-admin-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  data-testid="button-toggle-password"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Captcha
              ref={captchaRef}
              onVerify={(token) => setCaptchaToken(token)}
              onExpire={() => setCaptchaToken(null)}
              onError={() => setCaptchaToken(null)}
            />

            {error && (
              <p className="text-sm text-red-600" data-testid="text-login-error">{error}</p>
            )}
            <Button
              type="submit"
              className="w-full bg-[#0F3D2E] hover:bg-[#0F3D2E]/90"
              disabled={loading}
              data-testid="button-admin-login"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
