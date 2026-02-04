import Link from 'next/link'
import type { Metadata } from 'next'
import { SimpleHero } from '@/components/sections/SimpleHero'
import { Button } from '@/components/ui/button'
import { Mail, MapPin } from 'lucide-react'
import { ContactForm } from '@/components/forms/ContactForm'

export const metadata: Metadata = {
  title: 'Contact | Africa of Our Dream Education Initiative (AODI)',
  description: 'Contact AODI for partnerships, mentorship inquiries, and program information.',
}

export default function ContactPage() {
  return (
    <>
      <SimpleHero
        headline="Contact"
        subheadline="For partnerships, mentorship, and program inquiries, use the most relevant pathway — or reach us directly."
      />

      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Contact Info */}
            <div>
              <h2 className="text-2xl font-bold text-charcoal mb-6" data-testid="text-contact-info">
                Get in Touch
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-lg bg-aodi-teal/10 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-aodi-teal" />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-charcoal">Email</p>
                    <a href="mailto:aodi.info@africaofourdreaminitiative.org" className="text-aodi-teal hover:underline" data-testid="link-email">
                      aodi.info@africaofourdreaminitiative.org
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-lg bg-aodi-teal/10 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-aodi-teal" />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-charcoal">Location</p>
                    <p className="text-slate">
                      United Kingdom (Governance)
                      <br />
                      Africa (Program Delivery)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold text-charcoal mb-6" data-testid="text-send-message">
                Send us a Message
              </h2>
              <ContactForm />
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-16 pt-12 border-t">
            <h2 className="text-2xl font-bold text-charcoal mb-6 text-center" data-testid="text-quick-links">
              Quick Links
            </h2>
            <p className="text-slate mb-6 text-center">
              For specific inquiries, please use the appropriate pathway:
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-4xl mx-auto">
              <Link href="/get-involved/partner" data-testid="link-partner">
                <Button variant="outline" className="w-full justify-start">
                  Partnership Inquiry
                </Button>
              </Link>
              <Link href="/get-involved/mentor" data-testid="link-mentor">
                <Button variant="outline" className="w-full justify-start">
                  Mentor Application
                </Button>
              </Link>
              <Link href="/get-involved/mentee" data-testid="link-mentee">
                <Button variant="outline" className="w-full justify-start">
                  Mentee Application
                </Button>
              </Link>
              <Link href="/get-involved/volunteer" data-testid="link-volunteer">
                <Button variant="outline" className="w-full justify-start">
                  Volunteer Application
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
