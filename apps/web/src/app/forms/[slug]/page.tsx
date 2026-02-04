"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Loader2, Calendar, MapPin, ArrowLeft } from "lucide-react"
import { countryCodes } from "@/lib/country-codes"
import Link from "next/link"
import Image from "next/image"
import Captcha from "@/components/ui/captcha"
import { PolicyConsent } from "@/components/forms/PolicyConsent"

interface FormField {
  id: number
  fieldKey: string
  label: string
  fieldType: string
  placeholder: string | null
  defaultValue: string | null
  helpText: string | null
  isRequired: boolean
  options: { label: string; value: string }[] | null
  section: string | null
  width: string
  isActive: boolean
}

interface LinkedEvent {
  id: number
  title: string
  subtitle: string | null
  slug: string
  heroImage: string | null
  startDate: string | null
  endDate: string | null
  location: string | null
  category: string | null
}

interface FormData {
  id: number
  slug: string
  name: string
  description: string | null
  isEnabled: boolean
  closedMessage: string
  successMessage: string
  submitButtonText: string
  requiresHcaptcha: boolean
  eventId: number | null
  event: LinkedEvent | null
  fields: FormField[]
}

export default function DynamicFormPage() {
  const params = useParams()
  const slug = params.slug as string
  
  const [form, setForm] = useState<FormData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [values, setValues] = useState<Record<string, string | boolean>>({})
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [agreedToPolicy, setAgreedToPolicy] = useState(false)

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const res = await fetch(`/api/forms/${slug}`)
        if (res.ok) {
          const data = await res.json()
          setForm(data)
          const initialValues: Record<string, string | boolean> = {}
          data.fields.forEach((field: FormField) => {
            if (field.defaultValue) {
              initialValues[field.fieldKey] = field.defaultValue
            } else if (field.fieldType === "checkbox") {
              initialValues[field.fieldKey] = false
            } else {
              initialValues[field.fieldKey] = ""
            }
          })
          setValues(initialValues)
        } else {
          setError("Form not found")
        }
      } catch (err) {
        setError("Failed to load form")
      } finally {
        setLoading(false)
      }
    }
    fetchForm()
  }, [slug])

  const groupedFields = useMemo(() => {
    if (!form) return {}
    
    const groups: Record<string, FormField[]> = {}
    form.fields.forEach(field => {
      if (!field.isActive) return
      const section = field.section || "Other"
      if (!groups[section]) {
        groups[section] = []
      }
      groups[section].push(field)
    })
    return groups
  }, [form])

  const sectionOrder = useMemo(() => {
    return Object.keys(groupedFields)
  }, [groupedFields])

  const handleChange = (fieldKey: string, value: string | boolean) => {
    setValues({ ...values, [fieldKey]: value })
    if (fieldErrors[fieldKey]) {
      const newErrors = { ...fieldErrors }
      delete newErrors[fieldKey]
      setFieldErrors(newErrors)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form) return

    if (!agreedToPolicy) {
      setError("Please agree to the Privacy Policy, Terms of Service, and Safeguarding Policy to submit this form.")
      return
    }

    if (form.requiresHcaptcha && !captchaToken) {
      setError("Please complete the captcha verification.")
      return
    }

    setSubmitting(true)
    setError(null)
    setFieldErrors({})

    try {
      const res = await fetch(`/api/forms/${slug}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          captchaToken,
          agreedToPolicy,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setSubmitted(true)
      } else {
        if (data.details) {
          setFieldErrors(data.details)
        } else {
          setError(data.message || data.error || "Failed to submit form")
        }
      }
    } catch (err) {
      setError("Failed to submit form. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const renderField = (field: FormField) => {
    if (!field.isActive) return null

    const value = values[field.fieldKey]
    const fieldError = fieldErrors[field.fieldKey]

    const widthClass = field.width === "half" ? "md:col-span-1" : "md:col-span-2"

    return (
      <div key={field.id} className={`space-y-2 col-span-2 ${widthClass}`}>
        {field.fieldType !== "checkbox" && (
          <Label htmlFor={field.fieldKey} className="text-sm font-medium text-gray-700">
            {field.label}
            {field.isRequired && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}

        {field.fieldType === "text" && (
          <Input
            id={field.fieldKey}
            value={value as string}
            onChange={(e) => handleChange(field.fieldKey, e.target.value)}
            placeholder={field.placeholder || ""}
            required={field.isRequired}
            className="h-11"
            data-testid={`input-${field.fieldKey}`}
          />
        )}

        {field.fieldType === "email" && (
          <Input
            id={field.fieldKey}
            type="email"
            value={value as string}
            onChange={(e) => handleChange(field.fieldKey, e.target.value)}
            placeholder={field.placeholder || ""}
            required={field.isRequired}
            className="h-11"
            data-testid={`input-${field.fieldKey}`}
          />
        )}

        {field.fieldType === "number" && (
          <Input
            id={field.fieldKey}
            type="number"
            value={value as string}
            onChange={(e) => handleChange(field.fieldKey, e.target.value)}
            placeholder={field.placeholder || ""}
            required={field.isRequired}
            className="h-11"
            data-testid={`input-${field.fieldKey}`}
          />
        )}

        {field.fieldType === "url" && (
          <Input
            id={field.fieldKey}
            type="url"
            value={value as string}
            onChange={(e) => handleChange(field.fieldKey, e.target.value)}
            placeholder={field.placeholder || "https://"}
            required={field.isRequired}
            className="h-11"
            data-testid={`input-${field.fieldKey}`}
          />
        )}

        {field.fieldType === "date" && (
          <Input
            id={field.fieldKey}
            type="date"
            value={value as string}
            onChange={(e) => handleChange(field.fieldKey, e.target.value)}
            required={field.isRequired}
            className="h-11"
            data-testid={`input-${field.fieldKey}`}
          />
        )}

        {field.fieldType === "textarea" && (
          <Textarea
            id={field.fieldKey}
            value={value as string}
            onChange={(e) => handleChange(field.fieldKey, e.target.value)}
            placeholder={field.placeholder || ""}
            required={field.isRequired}
            rows={4}
            className="resize-none"
            data-testid={`textarea-${field.fieldKey}`}
          />
        )}

        {field.fieldType === "select" && field.options && (
          <Select
            value={value as string}
            onValueChange={(val) => handleChange(field.fieldKey, val)}
          >
            <SelectTrigger className="h-11 bg-white" data-testid={`select-${field.fieldKey}`}>
              <SelectValue placeholder={field.placeholder || "Select..."} />
            </SelectTrigger>
            <SelectContent className="bg-white text-gray-900">
              {field.options.filter(opt => opt.value && opt.value.trim() !== "").map((option, idx) => (
                <SelectItem key={`${option.value}-${idx}`} value={option.value} className="text-gray-900 focus:bg-gray-100">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {field.fieldType === "country" && (
          <Select
            value={value as string}
            onValueChange={(val) => handleChange(field.fieldKey, val)}
          >
            <SelectTrigger className="h-11 bg-white" data-testid={`select-${field.fieldKey}`}>
              <SelectValue placeholder={field.placeholder || "Select country..."} />
            </SelectTrigger>
            <SelectContent className="max-h-[300px] bg-white text-gray-900">
              {countryCodes.map((country) => (
                <SelectItem key={country.iso} value={country.name} className="text-gray-900 focus:bg-gray-100">
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {field.fieldType === "phone" && (
          <div className="flex gap-2">
            <Select
              value={values[`${field.fieldKey}_code`] as string || "NG"}
              onValueChange={(val) => handleChange(`${field.fieldKey}_code`, val)}
            >
              <SelectTrigger className="w-[120px] h-11 bg-white" data-testid={`select-${field.fieldKey}-code`}>
                <SelectValue>
                  {countryCodes.find(c => c.iso === (values[`${field.fieldKey}_code`] || "NG"))?.code || "+234"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-[300px] bg-white text-gray-900">
                {countryCodes.map((country) => (
                  <SelectItem key={country.iso} value={country.iso} className="text-gray-900 focus:bg-gray-100">
                    {country.code} ({country.iso})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              id={field.fieldKey}
              type="tel"
              value={value as string}
              onChange={(e) => handleChange(field.fieldKey, e.target.value)}
              placeholder={field.placeholder || "Phone number"}
              className="flex-1 h-11"
              data-testid={`input-${field.fieldKey}`}
            />
          </div>
        )}

        {field.fieldType === "checkbox" && (
          <div className="flex items-start space-x-3 pt-2">
            <Checkbox
              id={field.fieldKey}
              checked={value as boolean}
              onCheckedChange={(checked) => handleChange(field.fieldKey, checked as boolean)}
              data-testid={`checkbox-${field.fieldKey}`}
            />
            <Label htmlFor={field.fieldKey} className="font-normal text-sm text-gray-600 leading-relaxed">
              {field.placeholder || field.label}
            </Label>
          </div>
        )}

        {field.fieldType === "radio" && field.options && (
          <div className="space-y-3 pt-1">
            {field.options.filter(opt => opt.value && opt.value.trim() !== "").map((option, idx) => (
              <div key={`${option.value}-${idx}`} className="flex items-center space-x-3">
                <input
                  type="radio"
                  id={`${field.fieldKey}-${option.value}`}
                  name={field.fieldKey}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => handleChange(field.fieldKey, e.target.value)}
                  className="w-4 h-4 text-[#0F3D2E] focus:ring-[#0F3D2E]"
                  data-testid={`radio-${field.fieldKey}-${option.value}`}
                />
                <Label htmlFor={`${field.fieldKey}-${option.value}`} className="font-normal text-sm text-gray-600">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        )}

        {field.helpText && (
          <p className="text-xs text-gray-500">{field.helpText}</p>
        )}

        {fieldError && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {fieldError}
          </p>
        )}
      </div>
    )
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return ""
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Loader2 className="w-10 h-10 animate-spin text-[#0F3D2E]" />
      </div>
    )
  }

  if (error || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <Card className="max-w-md w-full shadow-lg">
          <CardContent className="pt-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-3">Form Not Found</h2>
            <p className="text-gray-600 mb-6">
              {error || "The requested form could not be found."}
            </p>
            <Link href="/">
              <Button className="bg-[#0F3D2E] hover:bg-[#0d3426]">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!form.isEnabled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardContent className="pt-8 text-center">
              <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-3">Registration Closed</h2>
              <p className="text-gray-600 mb-6">
                {form.closedMessage}
              </p>
              <Link href="/">
                <Button variant="outline" className="border-[#0F3D2E] text-[#0F3D2E] hover:bg-[#0F3D2E] hover:text-white">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Return Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-[#0F3D2E] to-[#1a5c44] p-8 text-center">
              <CheckCircle className="w-20 h-20 text-white mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-2">Registration Complete!</h2>
            </div>
            <CardContent className="pt-8 text-center">
              <p className="text-gray-600 text-lg mb-6">
                {form.successMessage}
              </p>
              {form.event && (
                <p className="text-gray-500 mb-6">
                  You have registered for <strong>{form.event.title}</strong>
                </p>
              )}
              <Link href="/">
                <Button className="bg-[#0F3D2E] hover:bg-[#0d3426]">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Return Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const hasEventHero = form.event !== null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {hasEventHero && form.event ? (
        <div className="relative h-[280px] md:h-[340px] overflow-hidden">
          {form.event.heroImage ? (
            <Image
              src={form.event.heroImage}
              alt={form.event.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#0F3D2E] to-[#1a5c44]" />
          )}
          <div className="absolute inset-0 bg-black/60" />
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white px-4 max-w-3xl">
              {form.event.category && (
                <span className="inline-block bg-[#C9A227] text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wider shadow-lg">
                  {form.event.category}
                </span>
              )}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 leading-tight drop-shadow-lg text-white">
                {form.event.title}
              </h1>
              {form.event.subtitle && (
                <p className="text-lg md:text-xl text-white/90 mb-4 drop-shadow-md">
                  {form.event.subtitle}
                </p>
              )}
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-white/90">
                {form.event.startDate && (
                  <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-full">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {formatDate(form.event.startDate)}
                      {form.event.endDate && ` - ${formatDate(form.event.endDate)}`}
                    </span>
                  </div>
                )}
                {form.event.location && (
                  <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-full">
                    <MapPin className="w-4 h-4" />
                    <span>{form.event.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative h-[220px] md:h-[280px] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0F3D2E] via-[#1a5c44] to-[#0F3D2E]" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white px-4 max-w-3xl">
              <span className="inline-block bg-[#C9A227] text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
                Application
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 leading-tight text-white drop-shadow-lg">
                {form.name}
              </h1>
              {form.description && (
                <p className="text-lg md:text-xl text-gray-200">
                  {form.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-8 -mt-8">
        <Card className="shadow-xl relative z-10">
          <CardHeader className="border-b bg-gray-50/50 px-6 py-5">
            <CardTitle className="text-2xl text-[#0F3D2E]">
              {hasEventHero ? "Registration Form" : "Complete Your Application"}
            </CardTitle>
            <CardDescription className="text-base mt-1">
              {hasEventHero 
                ? form.description || "Please complete all required fields below."
                : "Please complete all required fields below to submit your application."
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {sectionOrder.map((section, sectionIndex) => (
                <div key={section} className={sectionIndex > 0 ? "pt-6 border-t" : ""}>
                  {section !== "Other" && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-[#0F3D2E] text-white flex items-center justify-center text-sm font-bold">
                          {sectionIndex + 1}
                        </span>
                        {section}
                      </h3>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                    {groupedFields[section].map(renderField)}
                  </div>
                </div>
              ))}

              <div className="pt-6 border-t space-y-5">
                {form.requiresHcaptcha && (
                  <div className="flex justify-center">
                    <Captcha onVerify={setCaptchaToken} />
                  </div>
                )}

                <PolicyConsent
                  checked={agreedToPolicy}
                  onCheckedChange={setAgreedToPolicy}
                />

                {error && (
                  <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-semibold bg-[#0F3D2E] hover:bg-[#0d3426] shadow-lg" 
                  disabled={submitting || !agreedToPolicy}
                  data-testid="button-submit-form"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    form.submitButtonText
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-500 mt-6">
          Having trouble? Contact us at{" "}
          <a href="mailto:aodi.info@africaofourdreaminitiative.org" className="text-[#0F3D2E] hover:underline">
            aodi.info@africaofourdreaminitiative.org
          </a>
        </p>
      </div>
    </div>
  )
}
