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

export default function CampusAmbassadorApplicationPage() {
  const { isEnabled, isLoading, closedMessage } = useFormStatus("campus-ambassador")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [country, setCountry] = useState('')
  const [selectedCountryCode, setSelectedCountryCode] = useState('NG')
  const [yearOfStudy, setYearOfStudy] = useState('')

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
      university: formData.get('university') as string,
      faculty: formData.get('faculty') as string,
      yearOfStudy,
      country,
      studentId: formData.get('studentId') as string,
      linkedIn: formData.get('linkedIn') as string,
      leadershipExperience: formData.get('leadershipExperience') as string,
      whyAmbassador: formData.get('whyAmbassador') as string,
      proposedActivities: formData.get('proposedActivities') as string,
      captchaToken,
    }

    try {
      const response = await fetch('/api/applications/campus-ambassador', {
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
          subheadline="Your Campus Ambassador application has been received."
        />
        <section className="py-16 md:py-24 bg-white">
          <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
            <p className="text-lg text-slate mb-8" data-testid="text-success-message">
              We appreciate your interest in becoming a Campus Ambassador for AODI. Our team will review your application and contact you within 2 weeks if you are selected for the next stage.
            </p>
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      <SimpleHero
        headline="Campus Ambassador Program"
        subheadline="Represent AODI on your campus and inspire leadership development among your peers."
      />

      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-charcoal">Campus Ambassador Application</CardTitle>
              <p className="text-slate text-sm mt-2">
                Join our network of student leaders driving change on African campuses.
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

                <div className="space-y-2">
                  <Label htmlFor="university">University/Institution *</Label>
                  <Input
                    id="university"
                    name="university"
                    placeholder="e.g., University of Lagos"
                    required
                    data-testid="input-university"
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="faculty">Faculty/Department *</Label>
                    <Input
                      id="faculty"
                      name="faculty"
                      required
                      data-testid="input-faculty"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="yearOfStudy">Year of Study *</Label>
                    <Select value={yearOfStudy} onValueChange={setYearOfStudy} required>
                      <SelectTrigger data-testid="select-year">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="year1">1st Year</SelectItem>
                        <SelectItem value="year2">2nd Year</SelectItem>
                        <SelectItem value="year3">3rd Year</SelectItem>
                        <SelectItem value="year4">4th Year</SelectItem>
                        <SelectItem value="year5">5th Year+</SelectItem>
                        <SelectItem value="postgrad">Postgraduate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="studentId">Student ID Number (optional)</Label>
                  <Input
                    id="studentId"
                    name="studentId"
                    data-testid="input-student-id"
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

                <div className="space-y-2">
                  <Label htmlFor="leadershipExperience">Leadership Experience *</Label>
                  <Textarea
                    id="leadershipExperience"
                    name="leadershipExperience"
                    rows={3}
                    placeholder="Describe any leadership roles you've held (student government, clubs, organizations, community service, etc.)"
                    required
                    data-testid="textarea-leadership"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whyAmbassador">Why do you want to be a Campus Ambassador? *</Label>
                  <Textarea
                    id="whyAmbassador"
                    name="whyAmbassador"
                    rows={3}
                    placeholder="Tell us about your motivation and what you hope to achieve..."
                    required
                    data-testid="textarea-why"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proposedActivities">Proposed Campus Activities *</Label>
                  <Textarea
                    id="proposedActivities"
                    name="proposedActivities"
                    rows={3}
                    placeholder="What activities would you organize to promote AODI's mission on your campus?"
                    required
                    data-testid="textarea-activities"
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
