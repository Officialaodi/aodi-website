"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SimpleHero } from '@/components/sections/SimpleHero'
import { Button } from '@/components/ui/button'
import { Check, Heart, Share2, Twitter, Linkedin, Facebook, Link2, MessageCircle, Loader2 } from 'lucide-react'

const nairaAmounts = [
  { value: 5000, label: "₦5,000" },
  { value: 10000, label: "₦10,000" },
  { value: 25000, label: "₦25,000" },
]

const dollarAmounts = [
  { value: 10, label: "$10" },
  { value: 25, label: "$25" },
  { value: 50, label: "$50" },
]

const supportBenefits = [
  "Education and mentorship programs for students and early-career professionals",
  "Leadership and capacity-building initiatives",
  "Program delivery, coordination, and safeguarding",
  "Operational sustainability of AODI's work"
]

const givingReasons = [
  { value: '', label: 'Select a reason (optional)' },
  { value: 'general', label: 'General Support' },
  { value: 'mentorship', label: 'Mentorship Programs' },
  { value: 'empowerher', label: 'EmpowerHer Initiative' },
  { value: 'education', label: 'Education & Scholarships' },
  { value: 'events', label: 'Conferences & Events' },
  { value: 'other', label: 'Other (please specify)' },
]

export default function SupportPage() {
  const router = useRouter()
  const [currency, setCurrency] = useState<'NGN' | 'USD'>('NGN')
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [email, setEmail] = useState('')
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [givingReason, setGivingReason] = useState('')
  const [customReason, setCustomReason] = useState('')

  const amounts = currency === 'NGN' ? nairaAmounts : dollarAmounts
  const currencySymbol = currency === 'NGN' ? '₦' : '$'

  const getFinalAmount = () => {
    if (customAmount) return parseFloat(customAmount) || 0
    return selectedAmount || 0
  }

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handlePaystack = async () => {
    setError('')
    const amount = getFinalAmount()
    
    if (amount <= 0) {
      setError('Please select or enter an amount')
      return
    }
    
    if (!email || !validateEmail(email)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          email,
          currency: 'NGN',
          metadata: {
            giving_reason: givingReason === 'other' ? customReason : givingReason,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Payment initialization failed')
      }

      window.location.href = data.authorization_url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize payment')
      setLoading(false)
    }
  }

  const handlePayPal = async () => {
    setError('')
    const amount = getFinalAmount()
    
    if (amount <= 0) {
      setError('Please select or enter an amount')
      return
    }

    if (!email || !validateEmail(email)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/paypal/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount.toString(),
          currency: 'USD',
          intent: 'CAPTURE',
          giving_reason: givingReason === 'other' ? customReason : givingReason,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Payment initialization failed')
      }

      const approvalLink = data.links?.find((link: { rel: string; href: string }) => link.rel === 'approve')
      if (approvalLink) {
        window.location.href = approvalLink.href
      } else {
        throw new Error('Could not find PayPal approval link')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize payment')
      setLoading(false)
    }
  }

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/support` : 'https://africaofourdreaminitiative.org/support'
  const shareText = "Support AODI's mission to build leadership capacity and expand access to opportunity across Africa."

  const handleShare = (platform: string) => {
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
    }
    if (platform === 'copy') {
      navigator.clipboard.writeText(shareUrl)
      alert('Link copied to clipboard!')
    } else {
      window.open(urls[platform], '_blank', 'width=600,height=400')
    }
    setShowShareMenu(false)
  }

  return (
    <>
      <SimpleHero
        headline="Support AODI's Work"
        subheadline="Help us build leadership capacity and expand access to opportunity across Africa."
      />

      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <p className="text-lg text-slate mb-8" data-testid="text-support-intro">
              Africa of Our Dream Education Initiative (AODI) is supported through a combination of partnerships, grants, and voluntary contributions.
            </p>
            <p className="text-lg text-slate mb-12" data-testid="text-support-cta">
              If you would like to offer modest financial support toward our education, mentorship, leadership, and access programs, you may do so below. Every contribution helps sustain program delivery and extend opportunity to more young people across Africa.
            </p>

            <h2 className="text-2xl font-bold tracking-tight text-charcoal mb-6" data-testid="text-how-helps-header">
              How Your Support Helps
            </h2>
            <p className="text-slate mb-4">Voluntary contributions support:</p>
            <ul className="space-y-3 mb-12">
              {supportBenefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-aodi-teal flex-shrink-0 mt-0.5" />
                  <span className="text-slate" data-testid={`text-benefit-${index}`}>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-soft-grey">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="mx-auto max-w-xl">
            <h2 className="text-2xl font-bold tracking-tight text-charcoal mb-8 text-center" data-testid="text-options-header">
              Support Options
            </h2>
            <p className="text-center text-slate mb-8">
              You may choose a one-time contribution or enter a custom amount.
            </p>

            <div className="bg-white rounded-lg p-8 shadow-sm">
              <div className="flex justify-center gap-4 mb-8">
                <button
                  onClick={() => { setCurrency('NGN'); setSelectedAmount(null); setCustomAmount(''); setError(''); }}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                    currency === 'NGN' 
                      ? 'bg-[#0F3D2E] text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  data-testid="button-currency-ngn"
                >
                  Nigeria & Africa (₦)
                </button>
                <button
                  onClick={() => { setCurrency('USD'); setSelectedAmount(null); setCustomAmount(''); setError(''); }}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                    currency === 'USD' 
                      ? 'bg-[#0F3D2E] text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  data-testid="button-currency-usd"
                >
                  International ($)
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                {amounts.map((amount) => (
                  <button
                    key={amount.value}
                    onClick={() => { setSelectedAmount(amount.value); setCustomAmount(''); setError(''); }}
                    className={`py-4 rounded-lg text-lg font-semibold transition-colors ${
                      selectedAmount === amount.value && !customAmount
                        ? 'bg-[#0F3D2E] text-white'
                        : 'bg-gray-50 text-charcoal hover:bg-gray-100 border border-gray-200'
                    }`}
                    data-testid={`button-amount-${amount.value}`}
                  >
                    {amount.label}
                  </button>
                ))}
              </div>

              <div className="mb-6">
                <label className="block text-sm text-slate mb-2">Or enter a custom amount:</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); setError(''); }}
                    placeholder="Enter amount"
                    min="1"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F7A6E] focus:border-transparent"
                    data-testid="input-custom-amount"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm text-slate mb-2">Your email address:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F7A6E] focus:border-transparent"
                  data-testid="input-email"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm text-slate mb-2">What are you supporting?</label>
                <select
                  value={givingReason}
                  onChange={(e) => { setGivingReason(e.target.value); setError(''); }}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F7A6E] focus:border-transparent bg-white"
                  data-testid="select-giving-reason"
                >
                  {givingReasons.map((reason) => (
                    <option key={reason.value} value={reason.value}>
                      {reason.label}
                    </option>
                  ))}
                </select>
              </div>

              {givingReason === 'other' && (
                <div className="mb-6">
                  <label className="block text-sm text-slate mb-2">Please tell us more:</label>
                  <input
                    type="text"
                    value={customReason}
                    onChange={(e) => { setCustomReason(e.target.value); setError(''); }}
                    placeholder="Your reason for giving"
                    maxLength={100}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F7A6E] focus:border-transparent"
                    data-testid="input-custom-reason"
                  />
                </div>
              )}

              {error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm" data-testid="text-error">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                {currency === 'NGN' ? (
                  <Button
                    onClick={handlePaystack}
                    disabled={loading}
                    className="w-full bg-[#0F3D2E] hover:bg-[#0a2b20] text-white py-6 text-lg"
                    data-testid="button-paystack"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <Heart className="w-5 h-5 mr-2" />
                    )}
                    Support via Paystack
                  </Button>
                ) : (
                  <Button
                    onClick={handlePayPal}
                    disabled={loading}
                    className="w-full bg-[#0F3D2E] hover:bg-[#0a2b20] text-white py-6 text-lg"
                    data-testid="button-paypal"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <Heart className="w-5 h-5 mr-2" />
                    )}
                    Support via PayPal
                  </Button>
                )}
              </div>

              <p className="text-xs text-center text-slate mt-6 italic">
                All contributions are used to support AODI&apos;s programs and operational sustainability. AODI operates under the oversight of its Board of Trustees.
              </p>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-slate mb-4">Share this page to help spread the word:</p>
              <div className="relative inline-block">
                <Button
                  variant="outline"
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="gap-2"
                  data-testid="button-share"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
                {showShareMenu && (
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-lg border p-2 z-10 flex gap-2">
                    <button 
                      onClick={() => handleShare('twitter')} 
                      className="p-2 hover:bg-gray-100 rounded-lg" 
                      title="Share on X/Twitter"
                      data-testid="button-share-twitter"
                    >
                      <Twitter className="w-5 h-5 text-gray-700" />
                    </button>
                    <button 
                      onClick={() => handleShare('linkedin')} 
                      className="p-2 hover:bg-gray-100 rounded-lg" 
                      title="Share on LinkedIn"
                      data-testid="button-share-linkedin"
                    >
                      <Linkedin className="w-5 h-5 text-gray-700" />
                    </button>
                    <button 
                      onClick={() => handleShare('facebook')} 
                      className="p-2 hover:bg-gray-100 rounded-lg" 
                      title="Share on Facebook"
                      data-testid="button-share-facebook"
                    >
                      <Facebook className="w-5 h-5 text-gray-700" />
                    </button>
                    <button 
                      onClick={() => handleShare('whatsapp')} 
                      className="p-2 hover:bg-gray-100 rounded-lg" 
                      title="Share on WhatsApp"
                      data-testid="button-share-whatsapp"
                    >
                      <MessageCircle className="w-5 h-5 text-gray-700" />
                    </button>
                    <button 
                      onClick={() => handleShare('copy')} 
                      className="p-2 hover:bg-gray-100 rounded-lg" 
                      title="Copy link"
                      data-testid="button-share-copy"
                    >
                      <Link2 className="w-5 h-5 text-gray-700" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-white">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <p className="text-lg text-slate" data-testid="text-thank-you">
            Thank you for supporting AODI&apos;s mission to build leadership capacity and expand access to opportunity across Africa.
          </p>
        </div>
      </section>
    </>
  )
}
