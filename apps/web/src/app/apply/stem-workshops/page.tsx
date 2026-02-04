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

export default function STEMWorkshopsApplicationPage() {
  const { isEnabled, isLoading, closedMessage } = useFormStatus("stem-workshops")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [country, setCountry] = useState('')
  const [selectedCountryCode, setSelectedCountryCode] = useState('NG')
  const [applicantType, setApplicantType] = useState('')
  const [customApplicantType, setCustomApplicantType] = useState('')
  const [stemArea, setStemArea] = useState('')
  const [currentLevel, setCurrentLevel] = useState('')
  const [availability, setAvailability] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!agreedToPrivacy) return

    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      applicantType: applicantType === 'other' ? customApplicantType : applicantType,
      title,
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      countryCode: countryCodes.find(c => c.iso === selectedCountryCode)?.code || '+234',
      phone: formData.get('phone') as string,
      country,
      institution: formData.get('institution') as string,
      role: formData.get('role') as string,
      stemArea,
      currentLevel,
      workshopInterest: formData.get('workshopInterest') as string,
      previousExperience: formData.get('previousExperience') as string,
      expectations: formData.get('expectations') as string,
      availability,
      captchaToken,
    }

    try {
      const response = await fetch('/api/applications/stem-workshops', {
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
          subheadline="Your STEM Workshop application has been received."
        />
        <section className="py-16 md:py-24 bg-white">
          <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
            <p className="text-lg text-slate mb-8" data-testid="text-success-message">
              Thank you for your interest in AODI&apos;s STEM Education Workshops! We will notify you when upcoming workshops are scheduled and share relevant opportunities based on your profile.
            </p>
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      <SimpleHero
        headline="STEM Education Workshops"
        subheadline="Build practical skills in science, technology, engineering, and mathematics."
      />

      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-charcoal">STEM Workshop Interest Form</CardTitle>
              <p className="text-slate text-sm mt-2">
                Register your interest for upcoming STEM workshops and training programs.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="applicantType">I am a *</Label>
                  <Select 
                    value={applicantType}
                    onValueChange={setApplicantType}
                    required
                  >
                    <SelectTrigger data-testid="select-applicant-type">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="teacher">Teacher/Educator</SelectItem>
                      <SelectItem value="professional">Early-Career Professional</SelectItem>
                      <SelectItem value="researcher">Researcher</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {applicantType === 'other' && (
                    <Input
                      placeholder="Please specify your role"
                      value={customApplicantType}
                      onChange={(e) => setCustomApplicantType(e.target.value)}
                      className="mt-2"
                      required
                      data-testid="input-custom-applicant-type"
                    />
                  )}
                </div>

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

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="institution">Institution/Organization *</Label>
                    <Input
                      id="institution"
                      name="institution"
                      placeholder="School, university, or workplace"
                      required
                      data-testid="input-institution"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Your Role/Position *</Label>
                    <Input
                      id="role"
                      name="role"
                      placeholder="e.g., Student, Teacher, Engineer"
                      required
                      data-testid="input-role"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stemArea">Primary STEM Interest *</Label>
                  <Select value={stemArea} onValueChange={setStemArea} required>
                    <SelectTrigger data-testid="select-stem-area">
                      <SelectValue placeholder="Select area" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="coding">Coding & Software Development</SelectItem>
                      <SelectItem value="data">Data Science & Analytics</SelectItem>
                      <SelectItem value="ai">Artificial Intelligence & Machine Learning</SelectItem>
                      <SelectItem value="robotics">Robotics & Automation</SelectItem>
                      <SelectItem value="biotech">Biotechnology & Life Sciences</SelectItem>
                      <SelectItem value="engineering">Engineering (Civil, Mechanical, Electrical)</SelectItem>
                      <SelectItem value="mathematics">Mathematics & Statistics</SelectItem>
                      <SelectItem value="environmental">Environmental Science</SelectItem>
                      <SelectItem value="research">Research Methods & Skills</SelectItem>
                      <SelectItem value="multiple">Multiple Areas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentLevel">Current Skill Level *</Label>
                  <Select value={currentLevel} onValueChange={setCurrentLevel} required>
                    <SelectTrigger data-testid="select-level">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner (No prior experience)</SelectItem>
                      <SelectItem value="basic">Basic (Some exposure)</SelectItem>
                      <SelectItem value="intermediate">Intermediate (Practical experience)</SelectItem>
                      <SelectItem value="advanced">Advanced (Seeking specialization)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workshopInterest">Which type of workshops are you most interested in? *</Label>
                  <Textarea
                    id="workshopInterest"
                    name="workshopInterest"
                    rows={3}
                    placeholder="e.g., Python programming, data visualization, lab techniques, research writing..."
                    required
                    data-testid="textarea-interest"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="previousExperience">Previous STEM Training/Experience</Label>
                  <Textarea
                    id="previousExperience"
                    name="previousExperience"
                    rows={2}
                    placeholder="List any relevant courses, workshops, or projects you've completed..."
                    data-testid="textarea-experience"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectations">What do you hope to gain from these workshops? *</Label>
                  <Textarea
                    id="expectations"
                    name="expectations"
                    rows={3}
                    placeholder="Your learning goals and how you plan to apply these skills..."
                    required
                    data-testid="textarea-expectations"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availability">Preferred Workshop Format *</Label>
                  <Select value={availability} onValueChange={setAvailability} required>
                    <SelectTrigger data-testid="select-availability">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online (Virtual)</SelectItem>
                      <SelectItem value="in_person">In-Person</SelectItem>
                      <SelectItem value="hybrid">Hybrid (Both)</SelectItem>
                      <SelectItem value="flexible">Flexible (Any format)</SelectItem>
                    </SelectContent>
                  </Select>
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
                  {isSubmitting ? 'Submitting...' : 'Register Interest'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  )
}
