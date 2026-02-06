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
import { getCachedSiteSettings } from '@/lib/cache'

export const revalidate = 300

function parseJSON<T>(value: string | undefined, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export default async function HomePage() {
  const s = await getCachedSiteSettings()

  const trustItems = parseJSON<string[]>(s.trust_strip_items, [])
  const pillarsItems = parseJSON<{ name: string; description: string }[]>(s.pillars_items, [])
  const featuredBullets = parseJSON<string[]>(s.featured_bullets, [])
  const scopeBullets = parseJSON<string[]>(s.scope_bullets, [])
  const impactMetrics = parseJSON<{ label: string; value: string }[]>(s.impact_snapshot_metrics, [])
  const govBullets = parseJSON<string[]>(s.governance_block_bullets, [])
  const ctaCards = parseJSON<{ title: string; description: string; buttonText: string; href?: string; url?: string }[]>(s.cta_cards, [])

  return (
    <>
      <Hero
        headline={s.hero_title || "Building Africa's Next Generation of Leaders"}
        subheadline={s.hero_subtitle || ""}
        ctaPrimaryText={s.hero_cta_text || "Partner with AODI"}
        ctaPrimaryUrl={s.hero_cta_link || "/get-involved/partner"}
        ctaSecondaryText={s.hero_cta2_text || "Join as a Mentor"}
        ctaSecondaryUrl={s.hero_cta2_link || "/get-involved/mentor"}
        backgroundImage={s.hero_image}
      />

      {trustItems.length > 0 && (
        <TrustStrip items={trustItems} />
      )}

      <ProblemStatement
        title={s.problem_title || ""}
        body={s.problem_body || ""}
      />

      {pillarsItems.length > 0 && (
        <Pillars
          title={s.pillars_title || ""}
          pillars={pillarsItems}
        />
      )}

      <FeaturedProgram
        title={s.featured_title || ""}
        bullets={featuredBullets}
        ctaText={s.featured_cta_text || "Explore the Program"}
        ctaUrl={s.featured_cta_link || "/programs"}
      />

      <InitiativeScope
        title={s.scope_title || ""}
        bullets={scopeBullets}
        closingLine={s.scope_closing || ""}
      />

      {impactMetrics.length > 0 && (
        <ImpactSnapshot
          title={s.impact_snapshot_title || "Measured Progress. Real Outcomes."}
          metrics={impactMetrics}
        />
      )}

      <GovernanceBlock
        title={s.governance_block_title || ""}
        body={s.governance_block_body || ""}
        bullets={govBullets}
      />

      <CTACards
        cards={ctaCards.map(c => ({
          title: c.title,
          description: c.description,
          buttonText: c.buttonText,
          url: c.href || c.url || "#"
        }))}
      />

      <ClosingStatement
        title={s.closing_title || ""}
        body={s.closing_body || ""}
      />
    </>
  )
}
