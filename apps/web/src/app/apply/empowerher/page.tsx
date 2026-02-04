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

export default function EmpowerHerApplicationPage() {
  const { isEnabled, isLoading, closedMessage } = useFormStatus("empowerher")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [country, setCountry] = useState('')
  const [selectedCountryCode, setSelectedCountryCode] = useState('NG')
  const [age, setAge] = useState('')
  const [educationLevel, setEducationLevel] = useState('')
  const [careerInterest, setCareerInterest] = useState('')
  const [customCareerInterest, setCustomCareerInterest] = useState('')

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
      age,
      country,
      state: formData.get('state') as string,
      educationLevel,
      institution: formData.get('institution') as string,
      fieldOfStudy: formData.get('fieldOfStudy') as string,
      careerInterest: careerInterest === 'other' ? customCareerInterest : careerInterest,
      currentChallenges: formData.get('currentChallenges') as string,
      goals: formData.get('goals') as string,
      mentorPreference: formData.get('mentorPreference') as string,
      linkedIn: formData.get('linkedIn') as string,
      captchaToken,
    }

    try {
      const response = await fetch('/api/applications/empowerher', {
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
          subheadline="Your EmpowerHer application has been received."
        />
        <section className="py-16 md:py-24 bg-white">
          <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
            <p className="text-lg text-slate mb-8" data-testid="text-success-message">
              We are excited about your interest in the EmpowerHer Initiative! Our team will review your application and match you with a suitable mentor. You will hear from us within 2-3 weeks.
            </p>
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      <SimpleHero
        headline="EmpowerHer Initiative"
        subheadline="Join our female-focused mentorship and professional development program."
      />

      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-charcoal">EmpowerHer Application</CardTitle>
              <p className="text-slate text-sm mt-2">
                Connect with experienced female professionals for mentorship and career guidance.
              </p>
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
                    <Label htmlFor="age">Age *</Label>
                    <Select value={age} onValueChange={setAge} required>
                      <SelectTrigger data-testid="select-age">
                        <SelectValue placeholder="Select age range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="16-20">16-20</SelectItem>
                        <SelectItem value="21-25">21-25</SelectItem>
                        <SelectItem value="26-30">26-30</SelectItem>
                        <SelectItem value="31-35">31-35</SelectItem>
                        <SelectItem value="36+">36+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
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
                      required
                      data-testid="input-phone"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
                  <div className="space-y-2">
                    <Label htmlFor="state">State/Region *</Label>
                    <Input
                      id="state"
                      name="state"
                      required
                      data-testid="input-state"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="educationLevel">Current Education Level *</Label>
                  <Select value={educationLevel} onValueChange={setEducationLevel} required>
                    <SelectTrigger data-testid="select-education">
                      <SelectValue placeholder="Select education level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="secondary">Secondary School</SelectItem>
                      <SelectItem value="undergraduate">Undergraduate Student</SelectItem>
                      <SelectItem value="graduate">Recent Graduate (0-2 years)</SelectItem>
                      <SelectItem value="postgraduate">Postgraduate Student</SelectItem>
                      <SelectItem value="early_career">Early Career Professional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="institution">Current/Last Institution</Label>
                    <Input
                      id="institution"
                      name="institution"
                      placeholder="University, college, or secondary school"
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
                  <Label htmlFor="careerInterest">Career Interest Area *</Label>
                  <Select value={careerInterest} onValueChange={setCareerInterest} required>
                    <SelectTrigger data-testid="select-career">
                      <SelectValue placeholder="Select career area" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tech">Technology & Software</SelectItem>
                      <SelectItem value="stem">STEM Research</SelectItem>
                      <SelectItem value="business">Business & Entrepreneurship</SelectItem>
                      <SelectItem value="finance">Finance & Banking</SelectItem>
                      <SelectItem value="health">Healthcare & Medicine</SelectItem>
                      <SelectItem value="law">Law & Policy</SelectItem>
                      <SelectItem value="media">Media & Communications</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="nonprofit">Nonprofit & Development</SelectItem>
                      <SelectItem value="arts">Arts & Creative Industries</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {careerInterest === 'other' && (
                    <Input
                      placeholder="Please specify your career interest"
                      value={customCareerInterest}
                      onChange={(e) => setCustomCareerInterest(e.target.value)}
                      className="mt-2"
                      required
                      data-testid="input-custom-career-interest"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentChallenges">What challenges are you currently facing? *</Label>
                  <Textarea
                    id="currentChallenges"
                    name="currentChallenges"
                    rows={3}
                    placeholder="Describe the career or educational challenges you'd like support with..."
                    required
                    data-testid="textarea-challenges"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goals">What are your goals for this program? *</Label>
                  <Textarea
                    id="goals"
                    name="goals"
                    rows={3}
                    placeholder="What do you hope to achieve through the EmpowerHer mentorship?"
                    required
                    data-testid="textarea-goals"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mentorPreference">Mentor Preference (optional)</Label>
                  <Textarea
                    id="mentorPreference"
                    name="mentorPreference"
                    rows={2}
                    placeholder="Any specific industry, background, or expertise you'd prefer in a mentor?"
                    data-testid="textarea-mentor"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedIn">LinkedIn Profile (optional)</Label>
                  <Input
                    id="linkedIn"
                    name="linkedIn"
                    type="url"
                    placeholder="https://linkedin.com/in/..."
                    data-testid="input-linkedin"
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
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  )
}
