import { Hero } from '@/components/sections/Hero'
import { TrustStrip } from '@/components/sections/TrustStrip'
import { ProblemStatement } from '@/components/sections/ProblemStatement'
import { Pillars } from '@/components/sections/Pillars'
import { FeaturedProgram } from '@/components/sections/FeaturedProgram'
import { InitiativeScope } from '@/components/sections/InitiativeScope'
import { ImpactSnapshot } from '@/components/sections/ImpactSnapshot'
import { GovernanceBlock } from '@/components/sections/GovernanceBlock'
import { CTACards } from '@/components/sections/CTACards'
import { ClosingStatement } from '@/components/sections/ClosingStatement'
import { getCachedSiteSettings, getCachedImpactMetrics } from '@/lib/cache'

export const dynamic = 'force-dynamic'

function parseJSON<T>(value: string | undefined, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export default async function HomePage() {
  const [s, metrics] = await Promise.all([
    getCachedSiteSettings(),
    getCachedImpactMetrics(),
  ])

  const trustItems = parseJSON<string[]>(s.homepage_trust_badges, [
    'UK-governed', 'Africa-focused', 'Outcome-driven programs', 'Institutional partnerships',
  ])

  const pillarsItems = parseJSON<{ name: string; description: string }[]>(s.homepage_pillars_items, [
    {
      name: 'Leadership & Talent Development',
      description: 'We design structured programs that build mentorship capacity, leadership potential, and entrepreneurship confidence at critical transition points throughout university and into early careers.',
    },
    {
      name: 'Global Mentorship & Capability Building',
      description: 'Through carefully matched mentors, workshops, and targeted skill-building, we connect young people with expertise, skills, and perspectives from institutions across various academic, industry, and the diaspora.',
    },
    {
      name: 'Institutional Partnerships & Exposure',
      description: 'We collaborate with schools, universities, NGOs, and businesses to create access to quality programs, and connect participants to global opportunities.',
    },
  ])

  const featuredBullets = parseJSON<string[]>(s.homepage_featured_bullets, [
    'Structured mentorship and guidance',
    'Leadership and professional development support',
    'Exposure to global academic and professional pathways',
    'A values-driven community focused on long-term impact',
  ])

  const scopeBullets = parseJSON<string[]>(s.homepage_scope_bullets, [
    'Campus-based engagement and ambassador programs',
    'Women-focused leadership and empowerment initiatives',
    'Youth and secondary school success programs',
    'Conferences, workshops, and entrepreneurial initiatives',
  ])

  const impactSnapshotMetrics = metrics.map(m => ({ label: m.label, value: m.value }))

  const govBullets = parseJSON<string[]>(s.homepage_governance_bullets, [
    'Accountability and transparency',
    'Safeguarding and ethical practice',
    'Measurable outcomes and continuous improvement',
  ])

  const ctaCards = parseJSON<{ title: string; description: string; buttonText: string; url: string }[]>(
    s.homepage_cta_cards,
    [
      {
        title: 'Partner with AODI',
        description: 'Contribute your resources and networks to leadership development across Africa.',
        buttonText: 'Explore Partnership',
        url: '/forms/partner',
      },
      {
        title: 'Join as a Mentor',
        description: 'Contribute your experience and expertise to guide the next generation.',
        buttonText: 'Mentor Application',
        url: '/forms/mentor',
      },
      {
        title: 'Apply as a Mentee',
        description: 'Get matched with a world-class mentor in your field to expand your community and guide your legacy.',
        buttonText: 'Mentee Application',
        url: '/forms/mentee',
      },
    ]
  )

  return (
    <>
      <Hero
        headline={s.homepage_hero_title || "Building Africa's Future Leaders"}
        subheadline={s.homepage_hero_subtitle || 'Empowering the next generation through education, mentorship, and leadership development.'}
        ctaPrimaryText={s.homepage_hero_cta_primary || 'Get Involved'}
        ctaPrimaryUrl="/get-involved"
        ctaSecondaryText={s.homepage_hero_cta_secondary || 'Join as a Mentor'}
        ctaSecondaryUrl="/forms/mentor"
        backgroundImage={s.homepage_hero_image}
      />

      {trustItems.length > 0 && (
        <TrustStrip items={trustItems} />
      )}

      <ProblemStatement
        title={s.homepage_mission_title || "Africa's Talent Is Abundant. Opportunity Is Not."}
        body={s.homepage_mission_body || "Across Africa, millions of talented young people demonstrate exceptional potential — yet lack access to mentorship, leadership development, global networks, and structured pathways into academia, entrepreneurship, and high-impact careers. AODI exists to close this gap — systemically and at scale."}
      />

      {pillarsItems.length > 0 && (
        <Pillars
          title={s.homepage_pillars_title || 'A Leadership & Talent Development Model Built for Impact'}
          pillars={pillarsItems}
        />
      )}

      <FeaturedProgram
        title={s.homepage_featured_title || 'Global Mentorship & Leadership Program'}
        bullets={featuredBullets}
        ctaText={s.homepage_featured_cta_text || 'Explore the Program'}
        ctaUrl={s.homepage_featured_cta_link || '/programs'}
      />

      <InitiativeScope
        title={s.homepage_scope_title || 'Supporting Talent Across the Education-to-Leadership Journey'}
        bullets={scopeBullets}
        closingLine={s.homepage_scope_closing || 'Each initiative serves a single purpose: to identify talent early, develop leadership capacity, and unlock access to opportunity.'}
      />

      {impactSnapshotMetrics.length > 0 && (
        <ImpactSnapshot
          title={s.homepage_impact_title || 'Measured Progress. Real Outcomes.'}
          metrics={impactSnapshotMetrics}
        />
      )}

      <GovernanceBlock
        title={s.homepage_governance_title || 'Globally Governed. Africa Focused.'}
        body={s.homepage_governance_body || 'AODI operates with governance and coordination based in the United Kingdom, delivering programs across Africa in partnership with trusted institutions and community stakeholders.'}
        bullets={govBullets}
      />

      <CTACards
        cards={ctaCards.map(c => ({
          title: c.title,
          description: c.description,
          buttonText: c.buttonText,
          url: c.url,
        }))}
      />

      <ClosingStatement
        title={s.homepage_closing_title || 'Investing in People. Unlocking Potential. Shaping the Future.'}
        body={s.homepage_closing_body || "Africa's future depends on the leadership capacity of its people. With AODI, we are committed to building that capacity — deliberately, inclusively, and with lasting impact."}
      />
    </>
  )
}
