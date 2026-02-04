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

export default function MentorFormPage() {
  const { isEnabled, isLoading, closedMessage } = useFormStatus("mentor")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [country, setCountry] = useState('')
  const [selectedCountryCode, setSelectedCountryCode] = useState('NG')
  const [yearsExperience, setYearsExperience] = useState('')
  const [mentorshipInterests, setMentorshipInterests] = useState('')
  const [customMentorshipInterests, setCustomMentorshipInterests] = useState('')
  const [preferredMenteeProfile, setPreferredMenteeProfile] = useState('')
  const [mentorshipCapacity, setMentorshipCapacity] = useState('')

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
      currentRole: formData.get('currentRole') as string,
      organisation: formData.get('organisation') as string,
      linkedIn: formData.get('linkedIn') as string,
      expertiseAreas: formData.get('expertiseAreas') as string,
      yearsExperience,
      mentorshipInterests: mentorshipInterests === 'other' ? customMentorshipInterests : mentorshipInterests,
      preferredMenteeProfile,
      mentorshipCapacity,
      motivation: formData.get('motivation') as string,
      captchaToken,
    }

    try {
      const response = await fetch('/api/applications/mentor', {
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
          subheadline="Your mentor application has been received."
        />
        <section className="py-16 md:py-24 bg-white">
          <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
            <p className="text-lg text-slate mb-8" data-testid="text-success-message">
              We appreciate your interest in becoming an AODI mentor. A member of our team will review your application and contact you soon.
            </p>
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      <SimpleHero
        headline="Join as a Mentor"
        subheadline="Contribute your experience and perspective to guide the next generation of African leaders."
      />

      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-charcoal">Mentor Application Form</CardTitle>
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

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="currentRole">Current Role/Title *</Label>
                    <Input
                      id="currentRole"
                      name="currentRole"
                      required
                      data-testid="input-current-role"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organisation">Organisation *</Label>
                    <Input
                      id="organisation"
                      name="organisation"
                      required
                      data-testid="input-organisation"
                    />
                  </div>
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

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="expertiseAreas">Areas of Expertise *</Label>
                    <Input
                      id="expertiseAreas"
                      name="expertiseAreas"
                      placeholder="e.g., Finance, Technology, Academia"
                      required
                      data-testid="input-expertise"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="yearsExperience">Years of Experience *</Label>
                    <Select value={yearsExperience} onValueChange={setYearsExperience} required>
                      <SelectTrigger data-testid="select-years-experience">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5-10">5-10 years</SelectItem>
                        <SelectItem value="10-15">10-15 years</SelectItem>
                        <SelectItem value="15-20">15-20 years</SelectItem>
                        <SelectItem value="20+">20+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mentorshipInterests">Mentorship Interests *</Label>
                  <Select value={mentorshipInterests} onValueChange={setMentorshipInterests} required>
                    <SelectTrigger data-testid="select-interests">
                      <SelectValue placeholder="Select primary interest" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="career">Career Guidance</SelectItem>
                      <SelectItem value="admissions">University Admissions</SelectItem>
                      <SelectItem value="entrepreneurship">Entrepreneurship</SelectItem>
                      <SelectItem value="leadership">Leadership Development</SelectItem>
                      <SelectItem value="technical">Technical Skills</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {mentorshipInterests === 'other' && (
                    <Input
                      placeholder="Please specify your mentorship interests"
                      value={customMentorshipInterests}
                      onChange={(e) => setCustomMentorshipInterests(e.target.value)}
                      className="mt-2"
                      required
                      data-testid="input-custom-mentorship-interests"
                    />
                  )}
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="preferredMenteeProfile">Preferred Mentee Profile *</Label>
                    <Select value={preferredMenteeProfile} onValueChange={setPreferredMenteeProfile} required>
                      <SelectTrigger data-testid="select-mentee-profile">
                        <SelectValue placeholder="Select profile" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="secondary">Secondary School Students</SelectItem>
                        <SelectItem value="university">University Students</SelectItem>
                        <SelectItem value="early_career">Early Career Professionals</SelectItem>
                        <SelectItem value="any">Any Profile</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mentorshipCapacity">Availability (hours/month) *</Label>
                    <Select value={mentorshipCapacity} onValueChange={setMentorshipCapacity} required>
                      <SelectTrigger data-testid="select-capacity">
                        <SelectValue placeholder="Select capacity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-2_monthly">1-2 hours/month</SelectItem>
                        <SelectItem value="2-4_monthly">2-4 hours/month</SelectItem>
                        <SelectItem value="4+_monthly">4+ hours/month</SelectItem>
                        <SelectItem value="flexible">Flexible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="motivation">Why do you want to mentor with AODI? *</Label>
                  <Textarea
                    id="motivation"
                    name="motivation"
                    rows={4}
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
                  {isSubmitting ? 'Submitting...' : 'Submit Mentor Application'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  )
}
