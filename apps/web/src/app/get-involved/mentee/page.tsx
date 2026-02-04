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

export default function MenteeFormPage() {
  const { isEnabled, isLoading, closedMessage } = useFormStatus("mentee")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [country, setCountry] = useState('')
  const [selectedCountryCode, setSelectedCountryCode] = useState('NG')
  const [age, setAge] = useState('')
  const [educationLevel, setEducationLevel] = useState('')
  const [supportNeeded, setSupportNeeded] = useState('')
  const [customSupportNeeded, setCustomSupportNeeded] = useState('')
  const [availability, setAvailability] = useState('')
  const [heardAbout, setHeardAbout] = useState('')
  const [customHeardAbout, setCustomHeardAbout] = useState('')

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
      age,
      educationLevel,
      institution: formData.get('institution') as string,
      fieldOfStudy: formData.get('fieldOfStudy') as string,
      careerGoals: formData.get('careerGoals') as string,
      supportNeeded: supportNeeded === 'other' ? customSupportNeeded : supportNeeded,
      availability,
      whyAODI: formData.get('whyAODI') as string,
      heardAbout: heardAbout === 'other' ? customHeardAbout : heardAbout,
      captchaToken,
    }

    try {
      const response = await fetch('/api/applications/mentee', {
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
          subheadline="Your mentee application has been received."
        />
        <section className="py-16 md:py-24 bg-white">
          <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
            <p className="text-lg text-slate mb-8" data-testid="text-success-message">
              We appreciate your interest in becoming an AODI mentee. A member of our team will review your application and contact you soon.
            </p>
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      <SimpleHero
        headline="Apply as a Mentee"
        subheadline="Access structured programs designed to support your growth, clarity, and leadership potential."
      />

      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-charcoal">Mentee Application Form</CardTitle>
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
                  <Label htmlFor="phone">Phone/WhatsApp (optional)</Label>
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

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age *</Label>
                    <Select value={age} onValueChange={setAge} required>
                      <SelectTrigger data-testid="select-age">
                        <SelectValue placeholder="Select age range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="14-17">14-17</SelectItem>
                        <SelectItem value="18-24">18-24</SelectItem>
                        <SelectItem value="25-30">25-30</SelectItem>
                        <SelectItem value="31-35">31-35</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="educationLevel">Current Education Level *</Label>
                  <Select value={educationLevel} onValueChange={setEducationLevel} required>
                    <SelectTrigger data-testid="select-education">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="secondary">Secondary School</SelectItem>
                      <SelectItem value="undergraduate">Undergraduate</SelectItem>
                      <SelectItem value="graduate">Graduate/Masters</SelectItem>
                      <SelectItem value="phd">PhD</SelectItem>
                      <SelectItem value="early_career">Early Career Professional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="institution">Institution/Organisation *</Label>
                    <Input
                      id="institution"
                      name="institution"
                      required
                      data-testid="input-institution"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fieldOfStudy">Field of Study/Work *</Label>
                    <Input
                      id="fieldOfStudy"
                      name="fieldOfStudy"
                      required
                      data-testid="input-field"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="careerGoals">What are your career goals? *</Label>
                  <Textarea
                    id="careerGoals"
                    name="careerGoals"
                    rows={3}
                    required
                    data-testid="textarea-goals"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supportNeeded">What support do you need? *</Label>
                  <Select value={supportNeeded} onValueChange={setSupportNeeded} required>
                    <SelectTrigger data-testid="select-support">
                      <SelectValue placeholder="Select primary need" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="career_guidance">Career Guidance</SelectItem>
                      <SelectItem value="university_admissions">University Admissions</SelectItem>
                      <SelectItem value="scholarship_advice">Scholarship Advice</SelectItem>
                      <SelectItem value="leadership_skills">Leadership Skills</SelectItem>
                      <SelectItem value="entrepreneurship">Entrepreneurship Support</SelectItem>
                      <SelectItem value="networking">Networking Opportunities</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {supportNeeded === 'other' && (
                    <Input
                      placeholder="Please specify what support you need"
                      value={customSupportNeeded}
                      onChange={(e) => setCustomSupportNeeded(e.target.value)}
                      className="mt-2"
                      required
                      data-testid="input-custom-support"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availability">Availability for Sessions *</Label>
                  <Select value={availability} onValueChange={setAvailability} required>
                    <SelectTrigger data-testid="select-availability">
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekday_mornings">Weekday Mornings</SelectItem>
                      <SelectItem value="weekday_evenings">Weekday Evenings</SelectItem>
                      <SelectItem value="weekends">Weekends</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whyAODI">Why do you want to join AODI? *</Label>
                  <Textarea
                    id="whyAODI"
                    name="whyAODI"
                    rows={3}
                    required
                    data-testid="textarea-why"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="heardAbout">How did you hear about AODI?</Label>
                  <Select value={heardAbout} onValueChange={setHeardAbout}>
                    <SelectTrigger data-testid="select-heard">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="social_media">Social Media</SelectItem>
                      <SelectItem value="friend_referral">Friend/Referral</SelectItem>
                      <SelectItem value="school">School/University</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="website">Website Search</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {heardAbout === 'other' && (
                    <Input
                      placeholder="Please specify how you heard about us"
                      value={customHeardAbout}
                      onChange={(e) => setCustomHeardAbout(e.target.value)}
                      className="mt-2"
                      data-testid="input-custom-heard"
                    />
                  )}
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
                  {isSubmitting ? 'Submitting...' : 'Submit Mentee Application'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  )
}
