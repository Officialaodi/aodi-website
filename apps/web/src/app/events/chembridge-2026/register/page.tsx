"use client"

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, CheckCircle, Beaker, Users, Microscope, GraduationCap, Calendar, MapPin } from 'lucide-react'
import { countryCodes } from '@/lib/country-codes'
import dynamic from 'next/dynamic'
import { useFormStatus } from '@/hooks/use-form-status'
import { FormClosedMessage } from '@/components/forms/FormClosedMessage'
import { PolicyConsent } from '@/components/forms/PolicyConsent'

const HCaptcha = dynamic(() => import('@hcaptcha/react-hcaptcha'), { ssr: false })

const HCAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || ""

const heardAboutOptions = [
  "Social Media",
  "University/Institution",
  "Colleague/Friend",
  "AODI Website",
  "Email Newsletter",
  "Previous AODI Event",
  "Professional Network",
  "Other"
]

const currentLevelOptions = [
  "Undergraduate Student",
  "Master's Student",
  "PhD Student",
  "Early-Career Professional (within 5 years of graduation)"
]

const attendanceOptions = [
  { value: "virtual", label: "Virtual" },
  { value: "in-person", label: "In-person" },
  { value: "no-preference", label: "No preference" }
]

export default function ChemBridge2026RegisterPage() {
  const { isEnabled, isLoading: formStatusLoading, closedMessage } = useFormStatus("chembridge-2026")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [agreedToContact, setAgreedToContact] = useState(false)
  const [agreedToPolicy, setAgreedToPolicy] = useState(false)
  const [title, setTitle] = useState("")
  const [selectedCountryCode, setSelectedCountryCode] = useState("NG")
  const [countryOfResidence, setCountryOfResidence] = useState("")
  const [currentLevel, setCurrentLevel] = useState("")
  const [heardAbout, setHeardAbout] = useState("")
  const [customHeardAbout, setCustomHeardAbout] = useState("")
  const [attendancePreference, setAttendancePreference] = useState("")
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!agreedToPolicy) {
      setError('Please agree to our Privacy Policy, Terms of Service, and Safeguarding Policy.')
      return
    }
    if (!agreedToContact) {
      setError("Please consent to being contacted about the programme.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      title,
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      countryCode: countryCodes.find(c => c.iso === selectedCountryCode)?.code || '+234',
      phone: formData.get('phone') as string,
      countryOfResidence,
      institution: formData.get('institution') as string,
      currentLevel,
      fieldOfStudy: formData.get('fieldOfStudy') as string,
      programmeGoals: formData.get('programmeGoals') as string,
      heardAbout: heardAbout === "Other" ? customHeardAbout : heardAbout,
      attendancePreference,
      consentToContact: agreedToContact,
      agreedToPolicy,
      captchaToken,
    }

    try {
      const response = await fetch('/api/applications/chembridge-2026', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to submit registration')
      }

      setIsSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit registration. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (formStatusLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
  }

  if (!isEnabled) {
    return <FormClosedMessage message={closedMessage} />
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-aodi-green/10 to-white py-16">
        <div className="mx-auto max-w-2xl px-6 lg:px-8">
          <Card className="border-0 shadow-xl">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-aodi-green/10">
                <CheckCircle className="h-12 w-12 text-aodi-green" />
              </div>
              <h2 className="text-2xl font-bold text-charcoal mb-4" data-testid="text-success-title">
                Registration Submitted Successfully!
              </h2>
              <p className="text-slate mb-6">
                Thank you for registering for ChemBridge Inclusion Accelerator 2026. We have received your application and will contact you with further details.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/events/chembridge-2026">
                  <Button variant="outline" data-testid="button-back-to-event">
                    Back to Event Page
                  </Button>
                </Link>
                <Link href="/events">
                  <Button data-testid="button-view-events">
                    Explore More Events
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-aodi-green/10 to-white">
      <section className="relative py-16 bg-aodi-green overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-aodi-green to-aodi-teal opacity-90" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <div className="flex justify-center gap-4 mb-6">
            <Beaker className="h-10 w-10 text-aodi-gold" />
            <Microscope className="h-10 w-10 text-aodi-gold" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4" data-testid="text-page-title">
            ChemBridge Inclusion Accelerator 2026
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-6">
            Advancing Equity and Excellence in African Chemical Sciences
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-white/80">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span>July 1-3, 2026</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              <span>Hybrid (Virtual + In-person)</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="mb-8">
            <Link 
              href="/events/chembridge-2026" 
              className="inline-flex items-center gap-2 text-aodi-teal hover:text-aodi-green transition-colors"
              data-testid="link-back-event"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Event Details
            </Link>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="border-b bg-soft-grey/50">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-aodi-teal/10">
                  <GraduationCap className="h-6 w-6 text-aodi-teal" />
                </div>
                <div>
                  <CardTitle className="text-xl text-charcoal">Registration Form</CardTitle>
                  <CardDescription>
                    Complete the form below to register for ChemBridge 2026
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-charcoal mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-aodi-teal" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Select value={title} onValueChange={setTitle} required>
                        <SelectTrigger data-testid="select-title">
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
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input 
                        id="firstName" 
                        name="firstName" 
                        required 
                        placeholder="Enter first name"
                        data-testid="input-first-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input 
                        id="lastName" 
                        name="lastName" 
                        required 
                        placeholder="Enter last name"
                        data-testid="input-last-name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input 
                        id="email" 
                        name="email" 
                        type="email" 
                        required 
                        placeholder="your.email@example.com"
                        data-testid="input-email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <div className="flex gap-2">
                        <Select 
                          value={selectedCountryCode} 
                          onValueChange={setSelectedCountryCode}
                        >
                          <SelectTrigger className="w-[140px]" data-testid="select-country-code">
                            <SelectValue placeholder="+234">
                              {countryCodes.find(c => c.iso === selectedCountryCode)?.code || '+234'}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            {countryCodes.map((country) => (
                              <SelectItem 
                                key={country.iso} 
                                value={country.iso}
                              >
                                {country.code} ({country.iso})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input 
                          id="phone" 
                          name="phone" 
                          type="tel" 
                          required 
                          placeholder="Phone number"
                          className="flex-1"
                          data-testid="input-phone"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label htmlFor="countryOfResidence">Country of Residence *</Label>
                      <Select value={countryOfResidence} onValueChange={setCountryOfResidence} required>
                        <SelectTrigger data-testid="select-country">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {countryCodes.map((country) => (
                            <SelectItem key={country.iso} value={country.name}>
                              {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="institution">Institution / Organisation *</Label>
                      <Input 
                        id="institution" 
                        name="institution" 
                        required 
                        placeholder="Your university or organisation"
                        data-testid="input-institution"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-charcoal mb-4 flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-aodi-teal" />
                    Academic & Professional Background
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="currentLevel">Current Level *</Label>
                      <Select value={currentLevel} onValueChange={setCurrentLevel} required>
                        <SelectTrigger data-testid="select-level">
                          <SelectValue placeholder="Select your current level" />
                        </SelectTrigger>
                        <SelectContent>
                          {currentLevelOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="fieldOfStudy">Field of Study / Specialisation *</Label>
                      <Input 
                        id="fieldOfStudy" 
                        name="fieldOfStudy" 
                        required 
                        placeholder="e.g., Organic Chemistry, Biochemistry"
                        data-testid="input-field-of-study"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label htmlFor="programmeGoals">What do you hope to gain from this programme? *</Label>
                    <Textarea 
                      id="programmeGoals" 
                      name="programmeGoals" 
                      required 
                      placeholder="Describe your expectations and goals for participating in ChemBridge 2026..."
                      className="min-h-[120px]"
                      data-testid="textarea-goals"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label htmlFor="heardAbout">How did you hear about ChemBridge 2026? *</Label>
                      <Select value={heardAbout} onValueChange={setHeardAbout} required>
                        <SelectTrigger data-testid="select-heard-about">
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                          {heardAboutOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {heardAbout === "Other" && (
                        <Input
                          placeholder="Please specify how you heard about ChemBridge 2026"
                          value={customHeardAbout}
                          onChange={(e) => setCustomHeardAbout(e.target.value)}
                          className="mt-2"
                          required
                          data-testid="input-custom-heard-about"
                        />
                      )}
                    </div>
                    <div>
                      <Label htmlFor="attendancePreference">Preferred Attendance Mode *</Label>
                      <Select value={attendancePreference} onValueChange={setAttendancePreference} required>
                        <SelectTrigger data-testid="select-attendance">
                          <SelectValue placeholder="Select preference" />
                        </SelectTrigger>
                        <SelectContent>
                          {attendanceOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6 space-y-4">
                  <PolicyConsent
                    checked={agreedToPolicy}
                    onCheckedChange={setAgreedToPolicy}
                  />
                  
                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      id="consent" 
                      checked={agreedToContact}
                      onCheckedChange={(checked) => setAgreedToContact(checked === true)}
                      data-testid="checkbox-consent"
                    />
                    <Label htmlFor="consent" className="text-sm text-slate leading-relaxed cursor-pointer">
                      I consent to Africa of Our Dream Education Initiative (AODI) contacting me regarding 
                      ChemBridge Inclusion Accelerator 2026, including programme updates and related opportunities. <span className="text-red-500">*</span>
                    </Label>
                  </div>
                </div>

                {HCAPTCHA_SITE_KEY && (
                  <div className="flex justify-center">
                    <HCaptcha
                      sitekey={HCAPTCHA_SITE_KEY}
                      onVerify={(token: string) => setCaptchaToken(token)}
                    />
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm" data-testid="text-error">
                    {error}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg" 
                  disabled={isSubmitting || !agreedToPolicy || !agreedToContact}
                  data-testid="button-submit"
                >
                  {isSubmitting ? 'Submitting Registration...' : 'Submit Registration'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
