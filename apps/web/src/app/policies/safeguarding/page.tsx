import Link from 'next/link'
import type { Metadata } from 'next'
import { SimpleHero } from '@/components/sections/SimpleHero'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Phone, Mail, Shield, Users, BookOpen, FileCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Safeguarding Policy | Africa of Our Dream Education Initiative (AODI)',
  description: 'AODI\'s comprehensive safeguarding policy for protecting children, young people, and adults at risk in our programs.',
}

export default function SafeguardingPolicyPage() {
  return (
    <>
      <SimpleHero
        headline="Safeguarding Policy"
        subheadline="Our commitment to protecting children, young people, and adults at risk."
      />

      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl prose prose-slate">
            <div className="bg-soft-grey rounded-lg p-6 mb-8" data-testid="text-safeguarding-intro">
              <p className="text-charcoal font-medium mb-2">Last Updated: January 2025</p>
              <p className="text-slate text-sm">
                Africa of Our Dream Education Initiative (AODI) is committed to the safeguarding and protection of all children, young people, and adults at risk who engage with our programs. This policy outlines our approach to preventing harm, responding to concerns, and creating a safe environment for all participants.
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-red-800 mb-2">Urgent Safeguarding Concern?</h3>
                  <p className="text-red-700 text-sm mb-3">
                    If you believe someone is in immediate danger, contact the police immediately. For safeguarding concerns related to AODI activities:
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <a href="mailto:safeguarding@africaofourdreaminitiative.org" className="flex items-center gap-2 text-red-700 hover:text-red-900 font-medium text-sm">
                      <Mail className="w-4 h-4" />
                      safeguarding@africaofourdreaminitiative.org
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-charcoal mb-4">1. Purpose and Scope</h2>
            <p className="text-slate mb-4">
              This policy applies to all AODI trustees, staff, volunteers, mentors, partners, and anyone working on behalf of AODI. It covers all AODI activities, programs, and events, whether conducted online or in person.
            </p>
            <p className="text-slate mb-6">
              The policy aims to:
            </p>
            <ul className="list-disc pl-6 text-slate mb-6 space-y-2">
              <li>Protect children, young people, and adults at risk from harm, abuse, and exploitation</li>
              <li>Provide clear guidance on recognizing and responding to safeguarding concerns</li>
              <li>Ensure all representatives understand their responsibilities</li>
              <li>Promote a culture of safety, transparency, and accountability</li>
            </ul>

            <h2 className="text-2xl font-bold text-charcoal mb-4">2. Our Safeguarding Principles</h2>
            <div className="grid gap-4 mb-6">
              <div className="flex items-start gap-3 bg-soft-grey rounded-lg p-4">
                <Shield className="w-5 h-5 text-aodi-green flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-charcoal">Welfare is Paramount</h4>
                  <p className="text-slate text-sm">The welfare of children and vulnerable adults always takes priority over organizational interests.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-soft-grey rounded-lg p-4">
                <Users className="w-5 h-5 text-aodi-green flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-charcoal">Right to Protection</h4>
                  <p className="text-slate text-sm">Every person has the right to be protected from all forms of abuse, neglect, and exploitation.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-soft-grey rounded-lg p-4">
                <BookOpen className="w-5 h-5 text-aodi-green flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-charcoal">All Concerns Taken Seriously</h4>
                  <p className="text-slate text-sm">All safeguarding concerns and allegations will be treated seriously and handled promptly.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-soft-grey rounded-lg p-4">
                <FileCheck className="w-5 h-5 text-aodi-green flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-charcoal">Multi-Agency Cooperation</h4>
                  <p className="text-slate text-sm">We work in partnership with statutory agencies and other organizations to safeguard those at risk.</p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-charcoal mb-4">3. Definitions</h2>
            <p className="text-slate mb-4">
              <strong>Child:</strong> Any person under 18 years of age.
            </p>
            <p className="text-slate mb-4">
              <strong>Young Person:</strong> Individuals aged 16-25 who may be transitioning to adulthood but may still require additional protections.
            </p>
            <p className="text-slate mb-4">
              <strong>Adult at Risk:</strong> A person aged 18 or over who needs care and support, is experiencing or at risk of abuse or neglect, and is unable to protect themselves because of their care and support needs.
            </p>
            <p className="text-slate mb-6">
              <strong>Abuse:</strong> Includes physical abuse, emotional abuse, sexual abuse, neglect, financial abuse, discriminatory abuse, and institutional abuse.
            </p>

            <h2 className="text-2xl font-bold text-charcoal mb-4">4. Types of Abuse</h2>
            <p className="text-slate mb-4">
              All AODI representatives must be aware of the different forms of abuse:
            </p>
            <ul className="list-disc pl-6 text-slate mb-6 space-y-2">
              <li><strong>Physical Abuse:</strong> Hitting, shaking, burning, or causing physical harm</li>
              <li><strong>Emotional Abuse:</strong> Persistent emotional maltreatment, bullying, threats, humiliation, or rejection</li>
              <li><strong>Sexual Abuse:</strong> Forcing or enticing participation in sexual activities, including online exploitation</li>
              <li><strong>Neglect:</strong> Failure to meet basic physical or psychological needs, or failure to protect from harm</li>
              <li><strong>Financial Abuse:</strong> Theft, fraud, exploitation, or coercion in relation to money or assets</li>
              <li><strong>Discriminatory Abuse:</strong> Harassment or harm based on race, gender, disability, sexuality, religion, or other protected characteristics</li>
              <li><strong>Online Abuse:</strong> Cyberbullying, grooming, sharing inappropriate content, or exploitation through digital platforms</li>
            </ul>

            <h2 className="text-2xl font-bold text-charcoal mb-4">5. Prevention Measures</h2>
            
            <h3 className="text-xl font-semibold text-charcoal mb-3">5.1 Safer Recruitment</h3>
            <p className="text-slate mb-4">
              We implement robust recruitment practices for all staff, volunteers, and mentors:
            </p>
            <ul className="list-disc pl-6 text-slate mb-6 space-y-2">
              <li>Clear role descriptions and person specifications</li>
              <li>Application forms requiring disclosure of relevant information</li>
              <li>Verification of identity and qualifications</li>
              <li>Enhanced background checks (DBS or equivalent) for roles involving direct contact with young people</li>
              <li>At least two references, including character references</li>
              <li>Interviews including safeguarding-focused questions</li>
              <li>Probationary periods with regular supervision</li>
            </ul>

            <h3 className="text-xl font-semibold text-charcoal mb-3">5.2 Training and Awareness</h3>
            <ul className="list-disc pl-6 text-slate mb-6 space-y-2">
              <li>All AODI representatives receive safeguarding induction training</li>
              <li>Regular safeguarding refresher training (at least annually)</li>
              <li>Designated Safeguarding Lead receives advanced training</li>
              <li>Training covers recognizing abuse, reporting procedures, and appropriate boundaries</li>
            </ul>

            <h3 className="text-xl font-semibold text-charcoal mb-3">5.3 Code of Conduct</h3>
            <p className="text-slate mb-4">
              All AODI representatives must:
            </p>
            <ul className="list-disc pl-6 text-slate mb-6 space-y-2">
              <li>Treat all participants with dignity, respect, and fairness</li>
              <li>Maintain appropriate professional boundaries at all times</li>
              <li>Never engage in behavior that could be interpreted as inappropriate</li>
              <li>Avoid being alone with a young person unless necessary and with proper safeguards</li>
              <li>Not share personal contact details (personal social media, phone numbers) with mentees</li>
              <li>Report any concerns promptly to the Designated Safeguarding Lead</li>
              <li>Not take or share photographs of participants without consent</li>
              <li>Use official AODI communication channels only</li>
            </ul>

            <h2 className="text-2xl font-bold text-charcoal mb-4">6. Mentoring-Specific Safeguards</h2>
            <p className="text-slate mb-4">
              Given the one-to-one nature of mentoring relationships, additional safeguards apply:
            </p>
            <ul className="list-disc pl-6 text-slate mb-6 space-y-2">
              <li>Clear mentoring agreements outlining expectations and boundaries</li>
              <li>Mentoring sessions conducted in appropriate settings (e.g., open areas, virtual platforms with recording capabilities)</li>
              <li>Regular check-ins and supervision for mentors</li>
              <li>Clear protocols for online mentoring sessions</li>
              <li>Defined timeframes and objectives for mentoring relationships</li>
              <li>No meetings outside of program activities without prior approval</li>
              <li>Mentees encouraged to speak up if they feel uncomfortable</li>
            </ul>

            <h2 className="text-2xl font-bold text-charcoal mb-4">7. Online Safety</h2>
            <p className="text-slate mb-4">
              For online activities and communications:
            </p>
            <ul className="list-disc pl-6 text-slate mb-6 space-y-2">
              <li>Use official AODI platforms and accounts only</li>
              <li>Avoid one-to-one online conversations where possible; use group settings</li>
              <li>Keep a record of online communications</li>
              <li>Do not request or share inappropriate content</li>
              <li>Report any concerning online behavior immediately</li>
              <li>Ensure privacy settings are appropriate on all platforms used</li>
              <li>Be aware of online grooming tactics and report suspicions</li>
            </ul>

            <h2 className="text-2xl font-bold text-charcoal mb-4">8. Recognizing Signs of Abuse</h2>
            <p className="text-slate mb-4">
              Potential indicators of abuse may include (but are not limited to):
            </p>
            <ul className="list-disc pl-6 text-slate mb-6 space-y-2">
              <li>Unexplained injuries or changes in behavior</li>
              <li>Withdrawal, fearfulness, or reluctance to participate</li>
              <li>Inappropriate sexual knowledge or behavior for age</li>
              <li>Signs of neglect (poor hygiene, inadequate clothing, malnutrition)</li>
              <li>Disclosure of abuse by the individual</li>
              <li>Changes in academic performance or attendance</li>
              <li>Self-harm or expressions of low self-worth</li>
              <li>Reluctance to go home or fear of certain individuals</li>
            </ul>
            <p className="text-slate mb-6">
              Trust your instincts. If something feels wrong, report it.
            </p>

            <h2 className="text-2xl font-bold text-charcoal mb-4">9. Reporting Procedures</h2>
            <div className="bg-aodi-green/10 border border-aodi-green/30 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-charcoal mb-3">How to Report a Concern</h3>
              <ol className="list-decimal pl-6 text-slate space-y-3">
                <li><strong>Immediate Danger:</strong> If someone is in immediate danger, call the police or emergency services first.</li>
                <li><strong>Listen and Reassure:</strong> If a disclosure is made, listen calmly, reassure the person, and do not promise confidentiality (explain you may need to share information to keep them safe).</li>
                <li><strong>Do Not Investigate:</strong> Do not question the person extensively or investigate yourself. Your role is to report.</li>
                <li><strong>Report Promptly:</strong> Report concerns to the Designated Safeguarding Lead within 12 hours (or sooner if urgent).</li>
                <li><strong>Record:</strong> Write down what you observed or were told as soon as possible, using the person&apos;s own words where possible.</li>
              </ol>
            </div>

            <h3 className="text-xl font-semibold text-charcoal mb-3">Designated Safeguarding Lead</h3>
            <div className="bg-soft-grey rounded-lg p-6 mb-6">
              <p className="text-slate mb-2">
                <strong>Role:</strong> Designated Safeguarding Lead
              </p>
              <p className="text-slate mb-2">
                <strong>Email:</strong> <a href="mailto:safeguarding@africaofourdreaminitiative.org" className="text-aodi-teal hover:underline">safeguarding@africaofourdreaminitiative.org</a>
              </p>
              <p className="text-slate">
                <strong>Alternative Contact:</strong> <a href="mailto:aodi.info@africaofourdreaminitiative.org" className="text-aodi-teal hover:underline">aodi.info@africaofourdreaminitiative.org</a>
              </p>
            </div>

            <p className="text-slate mb-6">
              The Designated Safeguarding Lead will assess the concern, decide on appropriate action, and where necessary, make referrals to statutory agencies (e.g., local authority children&apos;s services, police).
            </p>

            <h2 className="text-2xl font-bold text-charcoal mb-4">10. Responding to Allegations Against Staff or Volunteers</h2>
            <p className="text-slate mb-4">
              If an allegation is made against an AODI representative:
            </p>
            <ul className="list-disc pl-6 text-slate mb-6 space-y-2">
              <li>The allegation will be taken seriously and handled sensitively</li>
              <li>The individual may be suspended pending investigation (this is a neutral act, not a presumption of guilt)</li>
              <li>The matter will be referred to relevant statutory agencies as appropriate</li>
              <li>AODI will cooperate fully with any external investigations</li>
              <li>Support will be provided to all parties involved</li>
              <li>The outcome will be documented and reviewed</li>
            </ul>

            <h2 className="text-2xl font-bold text-charcoal mb-4">11. Confidentiality and Information Sharing</h2>
            <p className="text-slate mb-6">
              Safeguarding information is shared only on a &quot;need to know&quot; basis. We will share information with statutory agencies where necessary to protect someone from harm. We cannot promise absolute confidentiality if doing so would put someone at risk. Records are stored securely in compliance with data protection legislation.
            </p>

            <h2 className="text-2xl font-bold text-charcoal mb-4">12. Partner Organizations</h2>
            <p className="text-slate mb-6">
              All partner organizations working with AODI must demonstrate adequate safeguarding arrangements. AODI will conduct due diligence on partners and require written commitment to safeguarding standards. Partners must report any safeguarding concerns arising from AODI-related activities.
            </p>

            <h2 className="text-2xl font-bold text-charcoal mb-4">13. Serious Incident Reporting</h2>
            <p className="text-slate mb-6">
              Serious safeguarding incidents will be reported to the Charity Commission (as required under charity law) and other relevant regulatory bodies. AODI will conduct internal reviews following serious incidents to identify lessons learned and improve practices.
            </p>

            <h2 className="text-2xl font-bold text-charcoal mb-4">14. Policy Review</h2>
            <p className="text-slate mb-6">
              This policy is reviewed annually by the AODI Board of Trustees or more frequently if there are significant changes in legislation, guidance, or following a serious incident. All AODI representatives will be notified of policy updates.
            </p>

            <h2 className="text-2xl font-bold text-charcoal mb-4">15. External Resources</h2>
            <p className="text-slate mb-4">
              For additional support or to report concerns externally:
            </p>
            <ul className="list-disc pl-6 text-slate mb-8 space-y-2">
              <li><strong>NSPCC Helpline:</strong> 0808 800 5000 (UK) | <a href="https://www.nspcc.org.uk" className="text-aodi-teal hover:underline" target="_blank" rel="noopener noreferrer">nspcc.org.uk</a></li>
              <li><strong>Childline:</strong> 0800 1111 (UK) | <a href="https://www.childline.org.uk" className="text-aodi-teal hover:underline" target="_blank" rel="noopener noreferrer">childline.org.uk</a></li>
              <li><strong>NSPCC Whistleblowing Helpline:</strong> 0800 028 0285</li>
              <li><strong>Police:</strong> 999 (emergency) or 101 (non-emergency)</li>
              <li><strong>Charity Commission:</strong> <a href="https://www.gov.uk/report-concern-about-charity" className="text-aodi-teal hover:underline" target="_blank" rel="noopener noreferrer">Report a concern about a charity</a></li>
            </ul>

            <div className="flex flex-wrap gap-4">
              <Link href="/policies/terms" data-testid="link-terms">
                <Button variant="outline">
                  Terms of Service
                </Button>
              </Link>
              <Link href="/policies/privacy" data-testid="link-privacy">
                <Button variant="outline">
                  Privacy Policy
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
