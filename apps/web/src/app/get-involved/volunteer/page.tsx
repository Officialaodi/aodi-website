'use client'

import { useState } from 'react'
import { SimpleHero } from '@/components/sections/SimpleHero'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import Captcha from '@/components/ui/captcha'
import { countryCodes } from '@/lib/country-codes'
import { useFormStatus } from '@/hooks/use-form-status'
import { FormClosedMessage } from '@/components/forms/FormClosedMessage'
import { PolicyConsent } from '@/components/forms/PolicyConsent'

export default function VolunteerFormPage() {
  const { isEnabled, isLoading, closedMessage } = useFormStatus("volunteer")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [country, setCountry] = useState('')
  const [selectedCountryCode, setSelectedCountryCode] = useState('NG')
  const [volunteerAreas, setVolunteerAreas] = useState('')
  const [customVolunteerArea, setCustomVolunteerArea] = useState('')
  const [availability, setAvailability] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!agreedToPrivacy) return

    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      title,
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      countryCode: countryCodes.find(c => c.iso === selectedCountryCode)?.code || '+234',
      phone: formData.get('phone') as string,
      country,
      volunteerAreas: volunteerAreas === 'other' ? customVolunteerArea : volunteerAreas,
      availability,
      skills: formData.get('skills') as string,
      linkedIn: formData.get('linkedIn') as string,
      motivation: formData.get('motivation') as string,
      captchaToken,
    }

    try {
      const response = await fetch('/api/applications/volunteer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setIsSubmitted(true)
      }
    } catch (error) {
      console.error('Submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
  }

  if (!isEnabled) {
    return <FormClosedMessage message={closedMessage} />
  }

  if (isSubmitted) {
    return (
      <>
        <SimpleHero
          headline="Thank You"
          subheadline="Your volunteer application has been received."
        />
        <section className="py-16 md:py-24 bg-white">
          <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
            <p className="text-lg text-slate mb-8" data-testid="text-success-message">
              We appreciate your interest in volunteering with AODI. A member of our team will review your application and contact you soon.
            </p>
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      <SimpleHero
        headline="Volunteer with AODI"
        subheadline="Support program delivery, operations, and community engagement."
      />

      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-charcoal">Volunteer Application Form</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <div className="space-y-2">
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
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      required
                      data-testid="input-first-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      required
                      data-testid="input-last-name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      data-testid="input-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Select value={country} onValueChange={setCountry} required>
                      <SelectTrigger data-testid="select-country">
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

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <div className="flex gap-2">
                    <Select value={selectedCountryCode} onValueChange={setSelectedCountryCode}>
                      <SelectTrigger className="w-[120px]" data-testid="select-phone-code">
                        <SelectValue placeholder="+234">
                          {countryCodes.find(c => c.iso === selectedCountryCode)?.code || '+234'}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {countryCodes.map((c) => (
                          <SelectItem key={c.iso} value={c.iso}>
                            {c.code} ({c.iso})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      className="flex-1"
                      placeholder="Phone number"
                      data-testid="input-phone"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="volunteerAreas">Areas of Interest *</Label>
                  <Select value={volunteerAreas} onValueChange={setVolunteerAreas} required>
                    <SelectTrigger data-testid="select-areas">
                      <SelectValue placeholder="Select area" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="program_delivery">Program Delivery</SelectItem>
                      <SelectItem value="communications">Communications & Social Media</SelectItem>
                      <SelectItem value="events">Events & Coordination</SelectItem>
                      <SelectItem value="admin">Administration & Operations</SelectItem>
                      <SelectItem value="tech">Technology & Website</SelectItem>
                      <SelectItem value="research">Research & Content</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {volunteerAreas === 'other' && (
                    <Input
                      placeholder="Please specify your area of interest"
                      value={customVolunteerArea}
                      onChange={(e) => setCustomVolunteerArea(e.target.value)}
                      className="mt-2"
                      required
                      data-testid="input-custom-volunteer-area"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availability">Availability *</Label>
                  <Select value={availability} onValueChange={setAvailability} required>
                    <SelectTrigger data-testid="select-availability">
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-2_weekly">1-2 hours/week</SelectItem>
                      <SelectItem value="3-5_weekly">3-5 hours/week</SelectItem>
                      <SelectItem value="5+_weekly">5+ hours/week</SelectItem>
                      <SelectItem value="project_based">Project-based</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skills">Skills & Experience *</Label>
                  <Textarea
                    id="skills"
                    name="skills"
                    rows={3}
                    placeholder="Describe your relevant skills and experience..."
                    required
                    data-testid="textarea-skills"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedIn">LinkedIn/Portfolio (optional)</Label>
                  <Input
                    id="linkedIn"
                    name="linkedIn"
                    type="url"
                    placeholder="https://linkedin.com/in/..."
                    data-testid="input-linkedin"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="motivation">Why do you want to volunteer with AODI? *</Label>
                  <Textarea
                    id="motivation"
                    name="motivation"
                    rows={3}
                    required
                    data-testid="textarea-motivation"
                  />
                </div>

                <PolicyConsent
                  checked={agreedToPrivacy}
                  onCheckedChange={setAgreedToPrivacy}
                />

                <Captcha onVerify={setCaptchaToken} />

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting || !agreedToPrivacy}
                  data-testid="button-submit"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Volunteer Application'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  )
}
