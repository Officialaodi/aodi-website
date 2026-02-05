import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { SimpleHero } from '@/components/sections/SimpleHero'
import { Button } from '@/components/ui/button'
import { Check, Users, Linkedin, Shield, Scale, Heart } from 'lucide-react'
import { db } from '@/lib/db'
import { trustees, governanceContent, executiveDirector } from '@/lib/schema'
import { eq, asc } from 'drizzle-orm'
import { getCachedSiteSettings } from '@/lib/cache'

export const metadata: Metadata = {
  title: 'Governance | Africa of Our Dream Education Initiative (AODI)',
  description: 'AODI operates with strong governance, ethical practice, and outcome tracking to sustain credibility and partner confidence.',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

const iconMap: Record<string, any> = { Shield, Scale, Heart, Users, Check }

function parseJSON<T>(value: string | undefined, fallback: T): T {
  if (!value) return fallback
  try { return JSON.parse(value) as T } catch { return fallback }
}

const defaultGovernanceValues = [
  { icon: "Shield", title: "Accountability", description: "Transparent operations with clear reporting to stakeholders" },
  { icon: "Scale", title: "Integrity", description: "Ethical practices in all organisational decisions" },
  { icon: "Heart", title: "Safeguarding", description: "Protecting the welfare of all beneficiaries" }
]

async function getGovernanceData() {
  try {
    const [trusteesData, contentData, execDirectorData] = await Promise.all([
      db.select().from(trustees).where(eq(trustees.isActive, true)).orderBy(asc(trustees.displayOrder)),
      db.select().from(governanceContent),
      db.select().from(executiveDirector).where(eq(executiveDirector.isActive, true))
    ])

    const contentMap: Record<string, string> = {}
    contentData.forEach(item => {
      contentMap[item.key] = item.value
    })

    return {
      trustees: trusteesData,
      content: contentMap as Record<string, string>,
      execDirector: execDirectorData[0] || null
    }
  } catch (error) {
    console.error("Error fetching governance data:", error)
    return {
      trustees: [] as { id: number; name: string; role: string; bio: string; photoUrl: string | null; linkedinUrl: string | null; displayOrder: number | null; isActive: boolean | null }[],
      content: {} as Record<string, string>,
      execDirector: null as { id: number; name: string; title: string; bio: string; photoUrl: string | null; linkedinUrl: string | null } | null
    }
  }
}

export default async function GovernancePage() {
  const [{ trustees: trusteesData, content, execDirector }, s] = await Promise.all([
    getGovernanceData(),
    getCachedSiteSettings()
  ])

  const intro = content.intro || s.governance_intro || ""
  const boardDescription = content.boardDescription || s.governance_board_description || ""
  const responsibilities = content.responsibilities || s.governance_responsibilities || ""
  const execDirectorIntro = content.executiveDirector || s.governance_exec_director_intro || ""

  const responsibilityList = responsibilities.split('\n').filter(Boolean)

  const governanceValues = parseJSON<{ icon: string; title: string; description: string }[]>(
    s.governance_values,
    defaultGovernanceValues
  )

  return (
    <>
      <SimpleHero
        headline={s.governance_hero_headline || "Governance & Accountability"}
        subheadline={s.governance_hero_subheadline || "We operate with strong governance, ethical practice, and outcome tracking to sustain credibility and partner confidence."}
      />

      {/* Governance Values */}
      <section className="py-12 bg-white border-b">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {governanceValues.map((value, index) => {
              const IconComponent = iconMap[value.icon] || Shield
              return (
                <div key={index} className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-aodi-teal/10 flex items-center justify-center mb-4">
                    <IconComponent className="w-8 h-8 text-aodi-teal" />
                  </div>
                  <h3 className="text-lg font-semibold text-charcoal mb-2">{value.title}</h3>
                  <p className="text-slate text-sm">{value.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 md:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-lg text-slate leading-relaxed whitespace-pre-line" data-testid="text-governance-intro">
              {intro}
            </p>
          </div>
        </div>
      </section>

      {/* Board of Trustees */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-soft-grey to-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-aodi-teal/10 text-aodi-teal text-sm font-medium rounded-full mb-4">
              Leadership Team
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-charcoal mb-4" data-testid="text-board-header">
              Board of Trustees
            </h2>
            <p className="text-lg text-slate max-w-2xl mx-auto" data-testid="text-board-description">
              {boardDescription}
            </p>
          </div>

          {trusteesData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {trusteesData.map((trustee) => (
                <div 
                  key={trustee.id} 
                  className="group bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col"
                  data-testid={`trustee-card-${trustee.id}`}
                >
                  {/* Photo */}
                  <div className="flex justify-center mb-6">
                    <div className="relative w-32 h-32 rounded-full overflow-hidden ring-4 ring-aodi-teal/20 group-hover:ring-aodi-teal/40 transition-all duration-300">
                      {trustee.photoUrl ? (
                        <Image 
                          src={trustee.photoUrl} 
                          alt={trustee.name}
                          fill
                          className="object-cover"
                          sizes="128px"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <Users className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Name & Role */}
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-charcoal mb-1" data-testid={`trustee-name-${trustee.id}`}>
                      {trustee.name}
                    </h3>
                    <p className="text-aodi-gold font-semibold text-sm" data-testid={`trustee-role-${trustee.id}`}>
                      {trustee.role}
                    </p>
                  </div>
                  
                  {/* Bio */}
                  <p className="text-slate text-sm text-center leading-relaxed flex-grow mb-4" data-testid={`trustee-bio-${trustee.id}`}>
                    {trustee.bio}
                  </p>
                  
                  {/* LinkedIn */}
                  {trustee.linkedinUrl && (
                    <div className="text-center pt-4 border-t border-gray-100">
                      <a 
                        href={trustee.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#0077B5]/10 text-[#0077B5] rounded-full text-sm font-medium hover-elevate active-elevate-2"
                        data-testid={`trustee-linkedin-${trustee.id}`}
                      >
                        <Linkedin className="w-4 h-4" />
                        Connect on LinkedIn
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm max-w-2xl mx-auto">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-slate" data-testid="text-no-trustees">
                Board member information will be published here as the governance structure is finalized.
              </p>
            </div>
          )}

          {/* Executive Director Profile */}
          <div className="mt-16 max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <span className="inline-block px-4 py-1.5 bg-aodi-green/10 text-aodi-green text-sm font-medium rounded-full mb-4">
                Executive Leadership
              </span>
              <h3 className="text-2xl font-bold text-charcoal">Executive Director</h3>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100">
              {execDirector ? (
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-shrink-0">
                    <div className="relative w-40 h-40 rounded-full overflow-hidden ring-4 ring-aodi-green/20">
                      {execDirector.photoUrl ? (
                        <Image 
                          src={execDirector.photoUrl} 
                          alt={execDirector.name}
                          fill
                          className="object-cover"
                          sizes="160px"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <Users className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h4 className="text-xl font-bold text-charcoal mb-1" data-testid="text-exec-director-name">
                      {execDirector.name}
                    </h4>
                    <p className="text-aodi-gold font-semibold text-sm mb-3" data-testid="text-exec-director-title">
                      {execDirector.title}
                    </p>
                    <p className="text-slate leading-relaxed mb-4" data-testid="text-exec-director-bio">
                      {execDirector.bio}
                    </p>
                    {execDirector.linkedinUrl && (
                      <a 
                        href={execDirector.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#0077B5]/10 text-[#0077B5] rounded-full text-sm font-medium hover-elevate active-elevate-2"
                        data-testid="link-exec-director-linkedin"
                      >
                        <Linkedin className="w-4 h-4" />
                        Connect on LinkedIn
                      </a>
                    )}
                    <p className="text-sm text-slate/70 italic mt-4">
                      The Executive Director serves on the Board as a non-voting member to support alignment between governance and operations.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-shrink-0">
                    <div className="relative w-40 h-40 rounded-full overflow-hidden ring-4 ring-aodi-green/20">
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <Users className="w-16 h-16 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <p className="text-slate leading-relaxed" data-testid="text-executive-director-description">
                      {execDirectorIntro}
                    </p>
                    <p className="text-sm text-slate/70 italic mt-4">
                      The Executive Director serves on the Board as a non-voting member to support alignment between governance and operations.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Board Responsibilities */}
      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="inline-block px-4 py-1.5 bg-aodi-gold/10 text-aodi-gold text-sm font-medium rounded-full mb-4">
                Our Commitment
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-charcoal mb-6" data-testid="text-responsibilities-header">
                Board Responsibilities
              </h2>
              <p className="text-slate mb-8">
                The Board of Trustees is collectively responsible for ensuring AODI operates with excellence and integrity:
              </p>
              <ul className="space-y-4">
                {responsibilityList.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 bg-soft-grey rounded-lg p-4">
                    <div className="w-6 h-6 rounded-full bg-aodi-teal/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-3.5 w-3.5 text-aodi-teal" />
                    </div>
                    <span className="text-slate" data-testid={`text-responsibility-${index}`}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-aodi-teal to-aodi-teal/90 rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-6 text-white" data-testid="text-governance-commitment-header">
                Our Governance Commitment
              </h2>
              <p className="text-white/90 mb-6 leading-relaxed">
                AODI is committed to transparency, accountability, and ethical practice in all our operations. Our governance framework ensures that we maintain the highest standards of integrity.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-white/90">
                  <Check className="w-5 h-5 text-white flex-shrink-0" />
                  <span>UK Charity Commission registered</span>
                </li>
                <li className="flex items-center gap-3 text-white/90">
                  <Check className="w-5 h-5 text-white flex-shrink-0" />
                  <span>Annual reports and financial statements</span>
                </li>
                <li className="flex items-center gap-3 text-white/90">
                  <Check className="w-5 h-5 text-white flex-shrink-0" />
                  <span>Regular board meetings and oversight</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Policies CTA */}
      <section className="py-16 bg-soft-grey">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-charcoal mb-4">
              Our Policies
            </h2>
            <p className="text-slate mb-8 max-w-2xl mx-auto">
              AODI maintains comprehensive policies to ensure the safety and wellbeing of all stakeholders.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/policies/safeguarding" data-testid="link-safeguarding">
                <Button variant="outline" size="lg" className="gap-2">
                  <Shield className="w-4 h-4" />
                  Safeguarding Policy
                </Button>
              </Link>
              <Link href="/policies/privacy" data-testid="link-privacy">
                <Button variant="outline" size="lg">
                  Privacy Policy
                </Button>
              </Link>
              <Link href="/policies/terms" data-testid="link-terms">
                <Button variant="outline" size="lg">
                  Terms of Service
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
