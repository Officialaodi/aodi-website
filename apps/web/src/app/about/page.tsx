import Link from 'next/link'
import type { Metadata } from 'next'
import { SimpleHero } from '@/components/sections/SimpleHero'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { getCachedSiteSettings } from '@/lib/cache'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'About | Africa of Our Dream Education Initiative (AODI)',
  description: 'Learn about AODI - a globally governed leadership and talent development institution supporting high-potential students and early-career professionals across Africa.',
}

function parseJSON<T>(value: string | undefined, fallback: T): T {
  if (!value) return fallback
  try { return JSON.parse(value) as T } catch { return fallback }
}

export default async function AboutPage() {
  const s = await getCachedSiteSettings()

  const differentiators = parseJSON<string[]>(s.about_differentiators, [
    "Structured approach to leadership development",
    "Outcome-driven programs with clear metrics",
    "Strong governance and accountability",
    "Institutional partnerships for scale"
  ])

  const approach = parseJSON<{ title: string; description: string }[]>(s.about_approach, [
    {
      title: "Identification & Access",
      description: "We identify high-potential talent and remove barriers to opportunity."
    },
    {
      title: "Development & Capability",
      description: "We build leadership capacity through structured programs and mentorship."
    },
    {
      title: "Exposure & Partnerships",
      description: "We connect participants to global networks, opportunities, and institutional partners."
    }
  ])

  return (
    <>
      <SimpleHero
        headline={s.about_hero_headline ?? "About AODI"}
        subheadline={s.about_hero_subheadline ?? "Africa of Our Dream Education Initiative (AODI) is a globally governed leadership and talent development institution supporting high-potential students and early-career professionals across Africa."}
      />

      {/* Mission */}
      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-charcoal mb-6" data-testid="text-mission">
              Our Mission
            </h2>
            <p className="text-lg text-slate">
              {s.about_mission ?? "Build leadership capacity and unlock access to opportunity for high-potential students and early-career professionals across Africa."}
            </p>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="py-16 md:py-24 bg-soft-grey">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-charcoal mb-6" data-testid="text-vision">
              Our Vision
            </h2>
            <p className="text-lg text-slate">
              {s.about_vision ?? "An Africa where every high-potential young person has the leadership skills, networks, and opportunities to drive transformative change."}
            </p>
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-charcoal text-center mb-12" data-testid="text-different">
              What Makes Us Different
            </h2>
            <ul className="space-y-4">
              {differentiators.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-aodi-teal flex-shrink-0 mt-0.5" />
                  <span className="text-slate" data-testid={`text-differentiator-${index}`}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Where We Operate */}
      <section className="py-16 md:py-24 bg-soft-grey">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-charcoal mb-6" data-testid="text-operate">
              Where We Operate
            </h2>
            <p className="text-lg text-slate mb-8">
              AODI operates with governance and coordination based in the United Kingdom, delivering programs across Africa through trusted institutional partners and community stakeholders.
            </p>
            <div className="flex justify-center gap-4">
              <span className="inline-flex items-center px-4 py-2 text-sm font-medium text-aodi-green bg-aodi-green/10 rounded-full">
                UK Governance
              </span>
              <span className="inline-flex items-center px-4 py-2 text-sm font-medium text-aodi-teal bg-aodi-teal/10 rounded-full">
                Africa-Focused Delivery
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-charcoal text-center mb-12" data-testid="text-approach">
            Our Approach
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {approach.map((item, index) => (
              <div key={index} className="text-center" data-testid={`approach-${index}`}>
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-aodi-teal text-white font-bold mb-4">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">{item.title}</h3>
                <p className="text-slate">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-aodi-green">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white mb-6">
              Join Us in Building Africa&apos;s Future
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/get-involved" data-testid="link-get-involved">
                <Button variant="gold" size="lg">
                  Get Involved
                </Button>
              </Link>
              <Link href="/governance" data-testid="link-governance">
                <Button variant="outlineLight" size="lg">
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
