import Link from 'next/link'
import type { Metadata } from 'next'
import { SimpleHero } from '@/components/sections/SimpleHero'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Terms of Service | Africa of Our Dream Education Initiative (AODI)',
  description: 'Terms and conditions for using the AODI website and participating in our programs.',
}

export default function TermsOfServicePage() {
  return (
    <>
      <SimpleHero
        headline="Terms of Service"
        subheadline="Terms and conditions for using our website and services."
      />

      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl prose prose-slate">
            <p className="text-slate mb-6" data-testid="text-terms-intro">
              <strong>Effective Date:</strong> January 2025
            </p>
            <p className="text-slate mb-6">
              Welcome to the Africa of Our Dream Education Initiative (&quot;AODI,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). By accessing or using our website at africaofourdreaminitiative.org (the &quot;Site&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, please do not use our Site.
            </p>

            <h2 className="text-2xl font-bold text-charcoal mb-4">1. About AODI</h2>
            <p className="text-slate mb-6">
              AODI is a UK-registered non-governmental organization (NGO) focused on leadership and talent development for high-potential students and early-career professionals across Africa. Our programs include mentorship, workshops, and partnership initiatives.
            </p>

            <h2 className="text-2xl font-bold text-charcoal mb-4">2. Eligibility</h2>
            <p className="text-slate mb-6">
              You must be at least 16 years of age to use this Site or apply to our programs. If you are under 18, you represent that you have obtained parental or guardian consent to use this Site and participate in our programs. Certain programs may have additional age or eligibility requirements as specified in the program details.
            </p>

            <h2 className="text-2xl font-bold text-charcoal mb-4">3. Use of the Site</h2>
            <p className="text-slate mb-4">
              You agree to use the Site only for lawful purposes. You shall not:
            </p>
            <ul className="list-disc pl-6 text-slate mb-6 space-y-2">
              <li>Submit false, misleading, or inaccurate information in any forms or applications</li>
              <li>Attempt to gain unauthorized access to any part of the Site or its systems</li>
              <li>Use the Site to transmit harmful code, spam, or malicious content</li>
              <li>Impersonate any person or entity, or misrepresent your affiliation</li>
              <li>Interfere with or disrupt the operation of the Site</li>
              <li>Use automated systems to access the Site without our permission</li>
            </ul>

            <h2 className="text-2xl font-bold text-charcoal mb-4">4. Applications and Program Participation</h2>
            <p className="text-slate mb-4">
              When you submit an application to become a mentee, mentor, volunteer, partner, or participate in any AODI program:
            </p>
            <ul className="list-disc pl-6 text-slate mb-6 space-y-2">
              <li>You certify that all information provided is accurate and complete</li>
              <li>You understand that submission does not guarantee acceptance</li>
              <li>You agree to comply with program-specific guidelines and codes of conduct</li>
              <li>You acknowledge that AODI may contact you regarding your application</li>
              <li>You consent to the use of your information as described in our Privacy Policy</li>
            </ul>

            <h2 className="text-2xl font-bold text-charcoal mb-4">5. Donations</h2>
            <p className="text-slate mb-4">
              If you make a donation to AODI through our Site:
            </p>
            <ul className="list-disc pl-6 text-slate mb-6 space-y-2">
              <li>All donations are voluntary and non-refundable unless required by law</li>
              <li>Donations will be used to support AODI&apos;s charitable programs and operations</li>
              <li>AODI is a UK-registered charity; tax deductibility depends on your jurisdiction</li>
              <li>We use secure third-party payment processors (Paystack, PayPal) to handle transactions</li>
              <li>We do not store your complete payment card details on our servers</li>
            </ul>

            <h2 className="text-2xl font-bold text-charcoal mb-4">6. Intellectual Property</h2>
            <p className="text-slate mb-6">
              All content on this Site, including text, graphics, logos, images, and software, is the property of AODI or its content suppliers and is protected by UK and international copyright laws. You may not reproduce, distribute, modify, or create derivative works from any content without our prior written consent. You may share links to our Site and quote brief excerpts for non-commercial, educational purposes with proper attribution.
            </p>

            <h2 className="text-2xl font-bold text-charcoal mb-4">7. User Content</h2>
            <p className="text-slate mb-6">
              By submitting content to AODI (such as testimonials, stories, or program feedback), you grant AODI a non-exclusive, royalty-free, perpetual license to use, reproduce, and publish such content for promotional and educational purposes. You retain ownership of your content and may request its removal by contacting us.
            </p>

            <h2 className="text-2xl font-bold text-charcoal mb-4">8. Third-Party Links</h2>
            <p className="text-slate mb-6">
              Our Site may contain links to third-party websites. These links are provided for convenience only. AODI does not endorse or assume responsibility for the content, privacy policies, or practices of any third-party sites. You access third-party sites at your own risk.
            </p>

            <h2 className="text-2xl font-bold text-charcoal mb-4">9. Disclaimer of Warranties</h2>
            <p className="text-slate mb-6">
              The Site is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, either express or implied. AODI does not warrant that the Site will be uninterrupted, error-free, or free of harmful components. We make no guarantees regarding program outcomes, mentorship matches, or career results.
            </p>

            <h2 className="text-2xl font-bold text-charcoal mb-4">10. Limitation of Liability</h2>
            <p className="text-slate mb-6">
              To the fullest extent permitted by law, AODI and its trustees, officers, employees, and volunteers shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Site or participation in our programs. Our total liability for any claims shall not exceed the amount you paid to AODI, if any, in the twelve months preceding the claim.
            </p>

            <h2 className="text-2xl font-bold text-charcoal mb-4">11. Indemnification</h2>
            <p className="text-slate mb-6">
              You agree to indemnify and hold harmless AODI, its trustees, officers, employees, and volunteers from any claims, damages, or expenses (including legal fees) arising from your use of the Site, violation of these Terms, or infringement of any third-party rights.
            </p>

            <h2 className="text-2xl font-bold text-charcoal mb-4">12. Changes to Terms</h2>
            <p className="text-slate mb-6">
              AODI reserves the right to modify these Terms at any time. Changes will be effective immediately upon posting to the Site. Your continued use of the Site after changes constitutes acceptance of the revised Terms. We encourage you to review these Terms periodically.
            </p>

            <h2 className="text-2xl font-bold text-charcoal mb-4">13. Governing Law</h2>
            <p className="text-slate mb-6">
              These Terms are governed by and construed in accordance with the laws of England and Wales. Any disputes arising from these Terms or your use of the Site shall be subject to the exclusive jurisdiction of the courts of England and Wales.
            </p>

            <h2 className="text-2xl font-bold text-charcoal mb-4">14. Severability</h2>
            <p className="text-slate mb-6">
              If any provision of these Terms is found to be unenforceable, the remaining provisions shall continue in full force and effect.
            </p>

            <h2 className="text-2xl font-bold text-charcoal mb-4">15. Contact Us</h2>
            <p className="text-slate mb-8">
              For questions about these Terms, please contact us at: <a href="mailto:aodi.info@africaofourdreaminitiative.org" className="text-aodi-teal hover:underline">aodi.info@africaofourdreaminitiative.org</a>
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/policies/privacy" data-testid="link-privacy">
                <Button variant="outline">
                  Privacy Policy
                </Button>
              </Link>
              <Link href="/policies/safeguarding" data-testid="link-safeguarding">
                <Button variant="outline">
                  Safeguarding Policy
                </Button>
              </Link>
              <Link href="/contact" data-testid="link-contact">
                <Button variant="outline">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
