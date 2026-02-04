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

export default function PartnerAfricaApplicationPage() {
  const { isEnabled, isLoading, closedMessage } = useFormStatus("partner-africa")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [country, setCountry] = useState('')
  const [selectedCountryCode, setSelectedCountryCode] = useState('NG')
  const [organizationType, setOrganizationType] = useState('')
  const [customOrganizationType, setCustomOrganizationType] = useState('')
  const [focusArea, setFocusArea] = useState('')
  const [customFocusArea, setCustomFocusArea] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!agreedToPrivacy) return

    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      organizationName: formData.get('organizationName') as string,
      organizationType: organizationType === 'other' ? customOrganizationType : organizationType,
      title,
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      contactRole: formData.get('contactRole') as string,
      email: formData.get('email') as string,
      countryCode: countryCodes.find(c => c.iso === selectedCountryCode)?.code || '+234',
      phone: formData.get('phone') as string,
      country,
      website: formData.get('website') as string,
      focusArea: focusArea === 'other' ? customFocusArea : focusArea,
      researchCapacity: formData.get('researchCapacity') as string,
      collaborationInterest: formData.get('collaborationInterest') as string,
      previousPartnerships: formData.get('previousPartnerships') as string,
      additionalInfo: formData.get('additionalInfo') as string,
      captchaToken,
    }

    try {
      const response = await fetch('/api/applications/partner-africa', {
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
          subheadline="Your Partner Africa Project application has been received."
        />
        <section className="py-16 md:py-24 bg-white">
          <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
            <p className="text-lg text-slate mb-8" data-testid="text-success-message">
              We appreciate your organization&apos;s interest in the Partner Africa Project (CREI). Our team will review your submission and reach out to discuss potential collaboration opportunities.
            </p>
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      <SimpleHero
        headline="Partner Africa Project (CREI)"
        subheadline="Join our collaborative research and education initiative connecting African institutions with global partners."
      />

      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-charcoal">Institution/Organization Application</CardTitle>
              <p className="text-slate text-sm mt-2">
                For universities, research institutions, and organizations interested in joining the CREI network.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="organizationName">Organization/Institution Name *</Label>
                  <Input
                    id="organizationName"
                    name="organizationName"
                    required
                    data-testid="input-org-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organizationType">Organization Type *</Label>
                  <Select value={organizationType} onValueChange={setOrganizationType} required>
                    <SelectTrigger data-testid="select-org-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="university">University/Higher Education</SelectItem>
                      <SelectItem value="research">Research Institution</SelectItem>
                      <SelectItem value="ngo">NGO/Non-profit</SelectItem>
                      <SelectItem value="government">Government Agency</SelectItem>
                      <SelectItem value="corporate">Corporate/Private Sector</SelectItem>
                      <SelectItem value="foundation">Foundation</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {organizationType === 'other' && (
                    <Input
                      placeholder="Please specify your organization type"
                      value={customOrganizationType}
                      onChange={(e) => setCustomOrganizationType(e.target.value)}
                      className="mt-2"
                      required
                      data-testid="input-custom-org-type"
                    />
                  )}
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
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
                  <div className="space-y-2">
                    <Label htmlFor="contactRole">Role/Title *</Label>
                    <Input
                      id="contactRole"
                      name="contactRole"
                      required
                      data-testid="input-contact-role"
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

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
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
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      name="website"
                      type="url"
                      placeholder="https://..."
                      data-testid="input-website"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="focusArea">Primary Focus Area *</Label>
                  <Select value={focusArea} onValueChange={setFocusArea} required>
                    <SelectTrigger data-testid="select-focus">
                      <SelectValue placeholder="Select focus area" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stem">STEM Education & Research</SelectItem>
                      <SelectItem value="health">Health Sciences</SelectItem>
                      <SelectItem value="social">Social Sciences & Development</SelectItem>
                      <SelectItem value="agriculture">Agriculture & Food Security</SelectItem>
                      <SelectItem value="climate">Climate & Environment</SelectItem>
                      <SelectItem value="technology">Technology & Innovation</SelectItem>
                      <SelectItem value="policy">Policy & Governance</SelectItem>
                      <SelectItem value="education">Education Systems</SelectItem>
                      <SelectItem value="other">Other/Multiple</SelectItem>
                    </SelectContent>
                  </Select>
                  {focusArea === 'other' && (
                    <Input
                      placeholder="Please specify your focus area"
                      value={customFocusArea}
                      onChange={(e) => setCustomFocusArea(e.target.value)}
                      className="mt-2"
                      required
                      data-testid="input-custom-focus-area"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="researchCapacity">Research & Education Capacity *</Label>
                  <Textarea
                    id="researchCapacity"
                    name="researchCapacity"
                    rows={3}
                    placeholder="Describe your organization's research capabilities, programs, and areas of expertise..."
                    required
                    data-testid="textarea-capacity"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="collaborationInterest">Collaboration Interest *</Label>
                  <Textarea
                    id="collaborationInterest"
                    name="collaborationInterest"
                    rows={3}
                    placeholder="What type of collaboration are you seeking? (Joint research, faculty exchange, student programs, resource sharing, etc.)"
                    required
                    data-testid="textarea-collaboration"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="previousPartnerships">Previous International Partnerships</Label>
                  <Textarea
                    id="previousPartnerships"
                    name="previousPartnerships"
                    rows={2}
                    placeholder="List any relevant international partnerships or collaborations your organization has participated in..."
                    data-testid="textarea-partnerships"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalInfo">Additional Information</Label>
                  <Textarea
                    id="additionalInfo"
                    name="additionalInfo"
                    rows={2}
                    placeholder="Any other information you'd like to share..."
                    data-testid="textarea-additional"
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
