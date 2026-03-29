import Link from 'next/link'
import type { Metadata } from 'next'
import { SimpleHero } from '@/components/sections/SimpleHero'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getCachedPartners, getCachedSiteSettings } from '@/lib/cache'
import { Building2, ExternalLink } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Partner with AODI | Africa of Our Dream Education Initiative',
  description: 'Partner with AODI to scale leadership and talent development across Africa through cohort sponsorship, program sponsorship, or institutional partnership.',
}

export const revalidate = 300
export const dynamic = 'force-dynamic';

function parseJSON<T>(value: string | undefined, fallback: T): T {
  if (!value) return fallback
  try { return JSON.parse(value) as T } catch { return fallback }
}

const defaultPartnershipModels = [
  {
    title: "Cohort Sponsorship",
    description: "Sponsor a structured cohort of mentees and program delivery.",
    details: "Support a defined group of participants through their leadership development journey with clear outcomes and reporting."
  },
  {
    title: "Program Sponsorship",
    description: "Fund a specific initiative (e.g., women's leadership, campus engagement).",
    details: "Enable the launch or expansion of targeted programs that align with your organization's goals and values."
  },
  {
    title: "Institutional Partnership",
    description: "Co-deliver programs through your institution or network.",
    details: "Partner with AODI to bring leadership development programs to your students, employees, or community members."
  }
]

export default async function PartnersPage() {
  const [partnersList, settings] = await Promise.all([
    getCachedPartners(),
    getCachedSiteSettings(),
  ])

  const heroHeadline = settings.partners_hero_headline || "Partner with AODI"
  const heroSubheadline = settings.partners_hero_subheadline || "We collaborate with foundations, corporates, schools, universities, NGOs, and institutions to scale leadership and talent development across Africa."
  const partnershipModels = parseJSON<{ title: string; description: string; details: string }[]>(settings.partners_models, defaultPartnershipModels)
  const ctaText = settings.partners_cta_text || "We'd love to discuss how we can work together to support leadership development across Africa."

  return (
    <>
      <SimpleHero
        headline={heroHeadline}
        subheadline={heroSubheadline}
        backgroundImage={settings.partners_hero_image}
      />

      {/* Partnership Models */}
      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-charcoal text-center mb-12" data-testid="text-partnership-models">
            Partnership Models
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {partnershipModels.map((model, index) => (
              <Card key={index} className="bg-soft-grey border-0" data-testid={`card-partnership-${index}`}>
                <CardHeader>
                  <CardTitle className="text-xl text-charcoal">{model.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate mb-4">
                    {model.description}
                  </CardDescription>
                  <p className="text-sm text-slate">
                    {model.details}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Partner */}
      <section className="py-16 md:py-24 bg-soft-grey">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-charcoal mb-6" data-testid="text-why-partner">
              Why Partner with AODI?
            </h2>
            <ul className="text-left space-y-4 text-slate">
              <li className="flex items-start gap-3">
                <span className="h-2 w-2 rounded-full bg-aodi-teal mt-2" />
                <span>Structured, outcome-driven programs with clear reporting</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="h-2 w-2 rounded-full bg-aodi-teal mt-2" />
                <span>UK governance with Africa-focused delivery</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="h-2 w-2 rounded-full bg-aodi-teal mt-2" />
                <span>Commitment to safeguarding, transparency, and ethical practice</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="h-2 w-2 rounded-full bg-aodi-teal mt-2" />
                <span>Scalable model designed for institutional collaboration</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Current Partners */}
      {partnersList.length > 0 && (
        <section className="py-16 md:py-24 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-charcoal mb-4" data-testid="text-current-partners">
                Our Partners
              </h2>
              <p className="text-slate max-w-2xl mx-auto">
                We collaborate with leading institutions, foundations, and organizations committed to developing Africa&apos;s next generation of leaders.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {partnersList.map((partner, idx) => (
                <div 
                  key={partner.id}
                  className="bg-soft-grey rounded-lg p-6 hover:shadow-md transition-shadow"
                  data-testid={`partner-${idx}`}
                >
                  <div className="flex items-start gap-4">
                    {partner.logoUrl ? (
                      <img 
                        src={partner.logoUrl} 
                        alt={partner.name}
                        className="w-16 h-16 object-contain rounded"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded bg-aodi-teal/10 flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-aodi-teal" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-charcoal mb-1">{partner.name}</h3>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-aodi-green/10 text-aodi-green">
                        {partner.type}
                      </span>
                      {partner.description && (
                        <p className="text-sm text-slate mt-2">{partner.description}</p>
                      )}
                      {partner.url && (
                        <a 
                          href={partner.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-aodi-teal hover:underline mt-2"
                        >
                          Visit website <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 md:py-24 bg-aodi-green">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white mb-6">
              Ready to Explore a Partnership?
            </h2>
            <p className="text-white/80 mb-8">
              {ctaText}
            </p>
            <Link href="/get-involved/partner" data-testid="link-partner-inquiry">
              <Button variant="gold" size="lg">
                Partnership Inquiry
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
