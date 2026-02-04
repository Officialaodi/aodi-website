"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Send, CheckCircle } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { countryCodes } from "@/lib/country-codes"
import { useFormStatus } from "@/hooks/use-form-status"
import { FormClosedMessage } from "@/components/forms/FormClosedMessage"
import { PolicyConsent } from "@/components/forms/PolicyConsent"
import Captcha from "@/components/ui/captcha"

export function ContactForm() {
  const { isEnabled, isLoading, closedMessage } = useFormStatus("contact")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [title, setTitle] = useState("")
  const [country, setCountry] = useState("")
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [agreedToPolicy, setAgreedToPolicy] = useState(false)
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!agreedToPolicy) {
      setError("Please agree to our Privacy Policy, Terms of Service, and Safeguarding Policy.")
      return
    }
    
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          country,
          subject: formData.subject,
          message: formData.message,
          captchaToken,
          agreedToPolicy
        })
      })

      if (response.ok) {
        setSubmitted(true)
        setFormData({ firstName: "", lastName: "", email: "", subject: "", message: "" })
        setTitle("")
        setCountry("")
      } else {
        const data = await response.json()
        setError(data.error || "Failed to send message. Please try again.")
      }
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
  }

  if (!isEnabled) {
    return <FormClosedMessage message={closedMessage} />
  }

  if (submitted) {
    return (
      <div className="bg-green-50 rounded-lg p-8 text-center">
        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-green-800 mb-2">Message Sent!</h3>
        <p className="text-green-700">Thank you for reaching out. We'll get back to you soon.</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => setSubmitted(false)}
          data-testid="button-send-another"
        >
          Send Another Message
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">
            Title *
          </label>
          <Select value={title} onValueChange={setTitle} required>
            <SelectTrigger data-testid="select-contact-title">
              <SelectValue placeholder="Select title" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Mr">Mr</SelectItem>
              <SelectItem value="Mrs">Mrs</SelectItem>
              <SelectItem value="Ms">Ms</SelectItem>
              <SelectItem value="Miss">Miss</SelectItem>
              <SelectItem value="Dr">Dr</SelectItem>
              <SelectItem value="Prof">Prof</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">
            First Name *
          </label>
          <Input
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            placeholder="First name"
            required
            data-testid="input-contact-first-name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">
            Last Name *
          </label>
          <Input
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            placeholder="Last name"
            required
            data-testid="input-contact-last-name"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">
            Email *
          </label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="your.email@example.com"
            required
            data-testid="input-contact-email"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">
            Country
          </label>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger data-testid="select-contact-country">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {countryCodes.map((c) => (
                <SelectItem key={c.iso} value={c.name}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-charcoal mb-1">
          Subject
        </label>
        <Input
          type="text"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          placeholder="What is this about?"
          data-testid="input-contact-subject"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-charcoal mb-1">
          Message *
        </label>
        <Textarea
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="How can we help you?"
          rows={5}
          required
          data-testid="input-contact-message"
        />
      </div>

      <div className="space-y-4">
        <Captcha onVerify={setCaptchaToken} />
        
        <PolicyConsent
          checked={agreedToPolicy}
          onCheckedChange={setAgreedToPolicy}
        />
      </div>

      {error && (
        <p className="text-red-600 text-sm" data-testid="text-error">{error}</p>
      )}

      <Button 
        type="submit" 
        className="w-full" 
        disabled={loading || !agreedToPolicy}
        data-testid="button-submit-contact"
      >
        <Send className="w-4 h-4 mr-2" />
        {loading ? "Sending..." : "Send Message"}
      </Button>
    </form>
  )
}
