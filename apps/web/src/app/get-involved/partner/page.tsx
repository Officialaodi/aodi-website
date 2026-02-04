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

export default function PartnerFormPage() {
  const { isEnabled, isLoading, closedMessage } = useFormStatus("partner")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [country, setCountry] = useState('')
  const [selectedCountryCode, setSelectedCountryCode] = useState('NG')
  const [organisationType, setOrganisationType] = useState('')
  const [customOrganisationType, setCustomOrganisationType] = useState('')
  const [partnershipInterest, setPartnershipInterest] = useState('')
  const [customPartnershipInterest, setCustomPartnershipInterest] = useState('')
  const [budgetRange, setBudgetRange] = useState('')
  const [heardAbout, setHeardAbout] = useState('')
  const [customHeardAbout, setCustomHeardAbout] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!agreedToPrivacy) return

    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      organisationName: formData.get('organisationName') as string,
      organisationType: organisationType === 'other' ? customOrganisationType : organisationType,
      title,
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      countryCode: countryCodes.find(c => c.iso === selectedCountryCode)?.code || '+234',
      phone: formData.get('phone') as string,
      country,
      website: formData.get('website') as string,
      partnershipInterest: partnershipInterest === 'other' ? customPartnershipInterest : partnershipInterest,
      budgetRange,
      message: formData.get('message') as string,
      heardAbout: heardAbout === 'other' ? customHeardAbout : heardAbout,
      captchaToken,
    }

    try {
      const response = await fetch('/api/applications/partner', {
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
          subheadline="Your partnership inquiry has been received."
        />
        <section className="py-16 md:py-24 bg-white">
          <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
            <p className="text-lg text-slate mb-8" data-testid="text-success-message">
              We appreciate your interest in partnering with AODI. A member of our team will review your inquiry and contact you soon.
            </p>
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      <SimpleHero
        headline="Partner with AODI"
        subheadline="Submit your partnership inquiry below."
      />

      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-charcoal">Partnership Inquiry Form</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="organisationName">Organisation Name *</Label>
                    <Input
                      id="organisationName"
                      name="organisationName"
                      required
                      data-testid="input-organisation-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organisationType">Organisation Type *</Label>
                    <Select value={organisationType} onValueChange={setOrganisationType} required>
                      <SelectTrigger data-testid="select-organisation-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="foundation">Foundation</SelectItem>
                        <SelectItem value="corporate">Corporate</SelectItem>
                        <SelectItem value="ngo">NGO</SelectItem>
                        <SelectItem value="university">University</SelectItem>
                        <SelectItem value="government">Government Agency</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {organisationType === 'other' && (
                      <Input
                        placeholder="Please specify your organisation type"
                        value={customOrganisationType}
                        onChange={(e) => setCustomOrganisationType(e.target.value)}
                        className="mt-2"
                        required
                        data-testid="input-custom-organisation-type"
                      />
                    )}
                  </div>
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
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      data-testid="input-email"
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website (optional)</Label>
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    placeholder="https://"
                    data-testid="input-website"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="partnershipInterest">Partnership Interest *</Label>
                  <Select value={partnershipInterest} onValueChange={setPartnershipInterest} required>
                    <SelectTrigger data-testid="select-partnership-interest">
                      <SelectValue placeholder="Select interest" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cohort_sponsorship">Cohort Sponsorship</SelectItem>
                      <SelectItem value="program_sponsorship">Program Sponsorship</SelectItem>
                      <SelectItem value="institutional_partnership">Institutional Partnership</SelectItem>
                      <SelectItem value="research_collaboration">Research Collaboration</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {partnershipInterest === 'other' && (
                    <Input
                      placeholder="Please specify your partnership interest"
                      value={customPartnershipInterest}
                      onChange={(e) => setCustomPartnershipInterest(e.target.value)}
                      className="mt-2"
                      required
                      data-testid="input-custom-partnership-interest"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budgetRange">Budget Range (optional)</Label>
                  <Select value={budgetRange} onValueChange={setBudgetRange}>
                    <SelectTrigger data-testid="select-budget">
                      <SelectValue placeholder="Select budget range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="under_10k">Under $10,000</SelectItem>
                      <SelectItem value="10k_50k">$10,000 - $50,000</SelectItem>
                      <SelectItem value="50k_100k">$50,000 - $100,000</SelectItem>
                      <SelectItem value="100k_plus">$100,000+</SelectItem>
                      <SelectItem value="flexible">Flexible / To Discuss</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message (optional)</Label>
                  <Textarea
                    id="message"
                    name="message"
                    rows={4}
                    placeholder="Tell us more about your partnership goals..."
                    data-testid="textarea-message"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="heardAbout">How did you hear about AODI?</Label>
                  <Select value={heardAbout} onValueChange={setHeardAbout}>
                    <SelectTrigger data-testid="select-heard-about">
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="social_media">Social Media</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="event">Event or Conference</SelectItem>
                      <SelectItem value="news">News/Media</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {heardAbout === 'other' && (
                    <Input
                      placeholder="Please specify how you heard about us"
                      value={customHeardAbout}
                      onChange={(e) => setCustomHeardAbout(e.target.value)}
                      className="mt-2"
                      data-testid="input-custom-heard-about"
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
                  {isSubmitting ? 'Submitting...' : 'Submit Partnership Inquiry'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  )
}
