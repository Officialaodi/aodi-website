'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { SimpleHero } from '@/components/sections/SimpleHero'
import { Button } from '@/components/ui/button'
import { Heart, Home, Share2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

export default function ThankYouPage() {
  const searchParams = useSearchParams()
  const reference = searchParams.get('reference') || searchParams.get('trxref')
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle')
  const [donationAmount, setDonationAmount] = useState<string | null>(null)

  useEffect(() => {
    if (reference && verificationStatus === 'idle') {
      setVerificationStatus('verifying')
      fetch(`/api/paystack/verify?reference=${encodeURIComponent(reference)}`)
        .then(res => res.json())
        .then(data => {
          if (data.verified) {
            setVerificationStatus('success')
            if (data.amount && data.currency) {
              setDonationAmount(`${data.currency} ${data.amount.toLocaleString()}`)
            }
          } else {
            setVerificationStatus('error')
          }
        })
        .catch(() => {
          setVerificationStatus('error')
        })
    }
  }, [reference, verificationStatus])

  return (
    <>
      <SimpleHero
        headline="Thank You"
        subheadline="Your support means the world to us."
      />

      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <div className="mx-auto max-w-2xl">
            <div className="mb-8">
              <div className="w-20 h-20 mx-auto bg-[#0F3D2E]/10 rounded-full flex items-center justify-center mb-6">
                {verificationStatus === 'verifying' ? (
                  <Loader2 className="w-10 h-10 text-[#0F3D2E] animate-spin" />
                ) : verificationStatus === 'error' ? (
                  <AlertCircle className="w-10 h-10 text-amber-600" />
                ) : verificationStatus === 'success' ? (
                  <CheckCircle className="w-10 h-10 text-[#0F3D2E]" />
                ) : (
                  <Heart className="w-10 h-10 text-[#0F3D2E]" />
                )}
              </div>

              {verificationStatus === 'verifying' ? (
                <>
                  <h2 className="text-2xl font-bold text-charcoal mb-4" data-testid="text-thank-you-header">
                    Verifying your payment...
                  </h2>
                  <p className="text-lg text-slate mb-6" data-testid="text-thank-you-message">
                    Please wait while we confirm your donation.
                  </p>
                </>
              ) : verificationStatus === 'error' ? (
                <>
                  <h2 className="text-2xl font-bold text-charcoal mb-4" data-testid="text-thank-you-header">
                    Payment verification issue
                  </h2>
                  <p className="text-lg text-slate mb-6" data-testid="text-thank-you-message">
                    We couldn&apos;t verify your payment at this time. If you completed a donation, please contact us for confirmation.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-charcoal mb-4" data-testid="text-thank-you-header">
                    Your contribution has been received
                  </h2>
                  {donationAmount && (
                    <p className="text-xl font-semibold text-[#0F3D2E] mb-4" data-testid="text-donation-amount">
                      {donationAmount}
                    </p>
                  )}
                  <p className="text-lg text-slate mb-6" data-testid="text-thank-you-message">
                    Thank you for supporting AODI&apos;s mission to build leadership capacity and expand access to opportunity across Africa.
                  </p>
                  <p className="text-slate mb-8">
                    Your generosity helps sustain our education, mentorship, and leadership programs for young people across the continent.
                  </p>
                </>
              )}
            </div>

            <div className="bg-soft-grey rounded-lg p-6 mb-8">
              <p className="text-sm text-slate italic">
                All contributions are used to support AODI&apos;s programs and operational sustainability. AODI operates under the oversight of its Board of Trustees.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/" data-testid="link-home">
                <Button variant="outline" className="gap-2">
                  <Home className="w-4 h-4" />
                  Return Home
                </Button>
              </Link>
              <Link href="/impact" data-testid="link-impact">
                <Button className="bg-[#0F3D2E] gap-2">
                  <Share2 className="w-4 h-4" />
                  See Our Impact
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
