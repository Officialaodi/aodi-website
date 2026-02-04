"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import Captcha, { CaptchaRef } from "@/components/ui/captcha"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const captchaRef = useRef<CaptchaRef>(null)

  const siteKeyConfigured = typeof window !== "undefined" && !!process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (siteKeyConfigured && !captchaToken) {
      setError("Please complete the captcha verification")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/admin/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, captchaToken })
      })

      if (response.ok) {
        setSuccess(true)
      } else {
        const data = await response.json()
        setError(data.error || "Failed to send reset email")
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

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Check your email</h2>
              <p className="text-gray-600">
                If an account exists with that email address, we've sent password reset instructions.
              </p>
              <Link href="/admin/login">
                <Button
                  variant="outline"
                  className="mt-4"
                  data-testid="button-back-to-login"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-[#0F3D2E]">Reset Password</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your password
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
                data-testid="input-forgot-email"
              />
            </div>

            <Captcha
              ref={captchaRef}
              onVerify={(token) => setCaptchaToken(token)}
              onExpire={() => setCaptchaToken(null)}
              onError={() => setCaptchaToken(null)}
            />

            {error && (
              <p className="text-sm text-red-600" data-testid="text-forgot-error">{error}</p>
            )}
            <Button
              type="submit"
              className="w-full bg-[#0F3D2E] hover:bg-[#0F3D2E]/90"
              disabled={loading}
              data-testid="button-send-reset"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
            <div className="text-center">
              <Link
                href="/admin/login"
                className="text-sm text-[#0F3D2E] hover:underline inline-flex items-center gap-1"
                data-testid="link-back-to-login"
              >
                <ArrowLeft className="w-3 h-3" />
                Back to login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
