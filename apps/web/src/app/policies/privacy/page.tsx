import Link from 'next/link'
import type { Metadata } from 'next'
import { SimpleHero } from '@/components/sections/SimpleHero'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Privacy Policy | Africa of Our Dream Education Initiative (AODI)',
  description: 'Learn how AODI collects, uses, and protects your personal information in compliance with UK GDPR.',
}

export default function PrivacyPolicyPage() {
  return (
    <>
      <SimpleHero
        headline="Privacy Policy"
        subheadline="How we collect, use, and protect your information."
      />

      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl prose prose-slate">
            <div className="bg-soft-grey rounded-lg p-6 mb-8" data-testid="text-privacy-intro">
              <p className="text-charcoal font-medium mb-2">Last Updated: January 2025</p>
              <p className="text-slate text-sm">
                Africa of Our Dream Education Initiative (&quot;AODI,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or participate in our programs, in compliance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.
              </p>
            </div>

            <h2 className="text-2xl font-bold text-charcoal mb-4">1. Data Controller</h2>
            <p className="text-slate mb-6">
              AODI is the data controller responsible for your personal data. If you have any questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <div className="bg-soft-grey rounded-lg p-4 mb-6">
              <p className="text-slate">
                <strong>Data Protection Contact:</strong><br />
                Africa of Our Dream Education Initiative<br />
                Email: <a href="mailto:aodi.info@africaofourdreaminitiative.org" className="text-aodi-teal hover:underline">aodi.info@africaofourdreaminitiative.org</a>
              </p>
            </div>

            <h2 className="text-2xl font-bold text-charcoal mb-4">2. Information We Collect</h2>
            <p className="text-slate mb-4">
              We collect information that you provide directly to us and information collected automatically when you use our website.
            </p>
            
            <h3 className="text-xl font-semibold text-charcoal mb-3">Information You Provide</h3>
            <ul className="list-disc pl-6 text-slate mb-6 space-y-2">
              <li><strong>Identity Data:</strong> Name, title, date of birth, gender</li>
              <li><strong>Contact Data:</strong> Email address, phone number, postal address, country of residence</li>
              <li><strong>Application Data:</strong> Educational background, professional experience, skills, motivations, and other information submitted through mentor, mentee, volunteer, or partner application forms</li>
              <li><strong>Communication Data:</strong> Correspondence with us via email, forms, or other channels</li>
              <li><strong>Donation Data:</strong> Payment information (processed securely by our payment partners), donation amount, and frequency</li>
              <li><strong>Event Registration Data:</strong> Attendance preferences, accessibility requirements, dietary restrictions for events</li>
              <li><strong>Newsletter Data:</strong> Email address and communication preferences</li>
            </ul>

            <h3 className="text-xl font-semibold text-charcoal mb-3">Information Collected Automatically</h3>
            <ul className="list-disc pl-6 text-slate mb-6 space-y-2">
              <li><strong>Technical Data:</strong> IP address, browser type and version, device type, operating system</li>
              <li><strong>Usage Data:</strong> Pages visited, time spent on pages, navigation paths, referral sources</li>
              <li><strong>Cookie Data:</strong> Information collected through cookies and similar technologies (see our Cookie section below)</li>
            </ul>

            <h2 className="text-2xl font-bold text-charcoal mb-4">3. Lawful Basis for Processing</h2>
            <p className="text-slate mb-4">
              Under UK GDPR, we must have a lawful basis to process your personal data. We rely on the following bases:
            </p>
            <ul className="list-disc pl-6 text-slate mb-6 space-y-2">
              <li><strong>Consent:</strong> Where you have given clear consent for us to process your data for specific purposes (e.g., marketing communications, newsletter subscriptions)</li>
              <li><strong>Contract:</strong> Where processing is necessary to perform our agreement with you (e.g., processing program applications, delivering mentorship services)</li>
              <li><strong>Legitimate Interests:</strong> Where processing is necessary for our legitimate interests (e.g., improving our services, understanding program effectiveness, fraud prevention), provided these interests do not override your fundamental rights</li>
              <li><strong>Legal Obligation:</strong> Where we need to comply with legal requirements (e.g., financial reporting, safeguarding obligations)</li>
            </ul>

            <h2 className="text-2xl font-bold text-charcoal mb-4">4. How We Use Your Information</h2>
            <p className="text-slate mb-4">
              We use your personal data for the following purposes:
            </p>
            <ul className="list-disc pl-6 text-slate mb-6 space-y-2">
              <li>Processing and evaluating program applications (mentor, mentee, volunteer, partner)</li>
              <li>Matching mentees with appropriate mentors based on skills, experience, and goals</li>
              <li>Communicating about program participation, events, and opportunities</li>
              <li>Processing donations and issuing receipts or acknowledgments</li>
              <li>Sending newsletters and updates (with your consent)</li>
              <li>Improving our website, programs, and services</li>
              <li>Analyzing program outcomes and impact (using anonymized, aggregated data)</li>
              <li>Fulfilling our safeguarding obligations</li>
              <li>Complying with legal and regulatory requirements</li>
              <li>Responding to inquiries and providing support</li>
            </ul>

            <h2 className="text-2xl font-bold text-charcoal mb-4">5. Data Sharing</h2>
            <p className="text-slate mb-4">
              We do not sell, rent, or trade your personal data. We may share your information with:
            </p>
            <ul className="list-disc pl-6 text-slate mb-6 space-y-2">
              <li><strong>Program Partners:</strong> Trusted organizations we work with to deliver programs (e.g., mentors matched with mentees, partner institutions). Partners are bound by confidentiality agreements.</li>
              <li><strong>Service Providers:</strong> Third parties who assist us with website hosting, email services, payment processing (Paystack, PayPal), and analytics. These providers process data only on our instructions.</li>
              <li><strong>Legal and Regulatory Bodies:</strong> When required by law, court order, or to protect our rights, safety, or the safety of others.</li>
              <li><strong>Safeguarding Authorities:</strong> Where necessary to protect children, young people, or vulnerable adults from harm.</li>
            </ul>

            <h2 className="text-2xl font-bold text-charcoal mb-4">6. International Data Transfers</h2>
            <p className="text-slate mb-6">
              As AODI operates programs across Africa, some of your personal data may be transferred to and processed in countries outside the UK. Where this occurs, we ensure appropriate safeguards are in place, such as Standard Contractual Clauses approved by the UK Information Commissioner&apos;s Office (ICO), to protect your data in accordance with UK GDPR requirements.
            </p>

            <h2 className="text-2xl font-bold text-charcoal mb-4">7. Data Retention</h2>
            <p className="text-slate mb-4">
              We retain personal data only for as long as necessary to fulfill the purposes for which it was collected:
            </p>
            <ul className="list-disc pl-6 text-slate mb-6 space-y-2">
              <li><strong>Application Data:</strong> Retained for the duration of program participation plus 3 years for alumni records and impact tracking</li>
              <li><strong>Donation Records:</strong> Retained for 7 years to comply with financial and tax regulations</li>
              <li><strong>Newsletter Subscribers:</strong> Until you unsubscribe or withdraw consent</li>
              <li><strong>Website Analytics:</strong> Aggregated data retained indefinitely; identifiable data retained for up to 26 months</li>
              <li><strong>Safeguarding Records:</strong> Retained in accordance with statutory requirements and best practice guidelines</li>
            </ul>
            <p className="text-slate mb-6">
              When data is no longer needed, we securely delete or anonymize it.
            </p>

            <h2 className="text-2xl font-bold text-charcoal mb-4">8. Data Security</h2>
            <p className="text-slate mb-4">
              We implement appropriate technical and organizational measures to protect your personal data, including:
            </p>
            <ul className="list-disc pl-6 text-slate mb-6 space-y-2">
              <li>Encryption of data in transit (HTTPS/TLS) and at rest</li>
              <li>Access controls limiting data access to authorized personnel only</li>
              <li>Regular security assessments and updates</li>
              <li>Staff training on data protection and confidentiality</li>
              <li>Secure payment processing through PCI-compliant providers (Paystack, PayPal)</li>
            </ul>
            <p className="text-slate mb-6">
              While we strive to protect your data, no method of transmission over the internet is 100% secure. We encourage you to take precautions when sharing personal information online.
            </p>

            <h2 className="text-2xl font-bold text-charcoal mb-4">9. Your Rights</h2>
            <p className="text-slate mb-4">
              Under UK GDPR, you have the following rights regarding your personal data:
            </p>
            <ul className="list-disc pl-6 text-slate mb-6 space-y-2">
              <li><strong>Right to Access:</strong> Request a copy of the personal data we hold about you</li>
              <li><strong>Right to Rectification:</strong> Request correction of inaccurate or incomplete data</li>
              <li><strong>Right to Erasure:</strong> Request deletion of your data in certain circumstances (&quot;right to be forgotten&quot;)</li>
              <li><strong>Right to Restrict Processing:</strong> Request limitation of how we use your data</li>
              <li><strong>Right to Data Portability:</strong> Request transfer of your data to another organization in a structured, machine-readable format</li>
              <li><strong>Right to Object:</strong> Object to processing based on legitimate interests or for direct marketing purposes</li>
              <li><strong>Right to Withdraw Consent:</strong> Where processing is based on consent, you may withdraw it at any time</li>
              <li><strong>Rights Related to Automated Decision-Making:</strong> Request human intervention if decisions are made solely by automated means</li>
            </ul>
            <p className="text-slate mb-6">
              To exercise any of these rights, please contact us at <a href="mailto:aodi.info@africaofourdreaminitiative.org" className="text-aodi-teal hover:underline">aodi.info@africaofourdreaminitiative.org</a>. We will respond to your request within one month, as required by law.
            </p>

            <h2 className="text-2xl font-bold text-charcoal mb-4">10. Cookies and Tracking Technologies</h2>
            <p className="text-slate mb-4">
              Our website uses cookies and similar technologies to enhance your experience. Types of cookies we use include:
            </p>
            <ul className="list-disc pl-6 text-slate mb-6 space-y-2">
              <li><strong>Essential Cookies:</strong> Necessary for website functionality (e.g., session management, security)</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our site (e.g., page views, navigation patterns). We use privacy-focused analytics that do not share data with third parties.</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
            </ul>
            <p className="text-slate mb-6">
              You can manage cookie preferences through your browser settings. Disabling certain cookies may affect website functionality.
            </p>

            <h2 className="text-2xl font-bold text-charcoal mb-4">11. Third-Party Links</h2>
            <p className="text-slate mb-6">
              Our website may contain links to third-party sites (e.g., social media platforms, partner organizations). We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies before providing any personal information.
            </p>

            <h2 className="text-2xl font-bold text-charcoal mb-4">12. Children&apos;s Privacy</h2>
            <p className="text-slate mb-6">
              Our programs serve young people aged 16 and above. We do not knowingly collect personal data from children under 16 without parental or guardian consent. If we become aware that we have collected data from a child under 16 without appropriate consent, we will take steps to delete that information promptly.
            </p>

            <h2 className="text-2xl font-bold text-charcoal mb-4">13. Changes to This Policy</h2>
            <p className="text-slate mb-6">
              We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will post the updated policy on this page with a revised &quot;Last Updated&quot; date. For significant changes, we may notify you by email or through a notice on our website.
            </p>

            <h2 className="text-2xl font-bold text-charcoal mb-4">14. Complaints</h2>
            <p className="text-slate mb-6">
              If you are unhappy with how we have handled your personal data, you have the right to lodge a complaint with the Information Commissioner&apos;s Office (ICO), the UK supervisory authority for data protection:
            </p>
            <div className="bg-soft-grey rounded-lg p-4 mb-6">
              <p className="text-slate">
                <strong>Information Commissioner&apos;s Office</strong><br />
                Website: <a href="https://ico.org.uk" className="text-aodi-teal hover:underline" target="_blank" rel="noopener noreferrer">ico.org.uk</a><br />
                Phone: 0303 123 1113
              </p>
            </div>
            <p className="text-slate mb-6">
              We encourage you to contact us first so we can try to resolve any concerns directly.
            </p>

            <h2 className="text-2xl font-bold text-charcoal mb-4">15. Contact Us</h2>
            <p className="text-slate mb-8">
              For any questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us at: <a href="mailto:aodi.info@africaofourdreaminitiative.org" className="text-aodi-teal hover:underline">aodi.info@africaofourdreaminitiative.org</a>
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/policies/terms" data-testid="link-terms">
                <Button variant="outline">
                  Terms of Service
                </Button>
              </Link>
              <Link href="/policies/safeguarding" data-testid="link-safeguarding">
                <Button variant="outline">
                  Safeguarding Policy
                </Button>
              </Link>
              <Link href="/governance" data-testid="link-governance">
                <Button variant="outline">
                  View Governance
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
