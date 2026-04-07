import { getCachedSiteSettings } from '@/lib/cache'
import { SupportPageClient } from './SupportPageClient'

export const dynamic = 'force-dynamic'

const defaultNairaAmounts = [
  { value: 5000, label: "₦5,000" },
  { value: 10000, label: "₦10,000" },
  { value: 25000, label: "₦25,000" },
]

const defaultDollarAmounts = [
  { value: 10, label: "$10" },
  { value: 25, label: "$25" },
  { value: 50, label: "$50" },
]

const defaultSupportBenefits = [
  "Education and mentorship programs for students and early-career professionals",
  "Leadership and capacity-building initiatives",
  "Program delivery, coordination, and safeguarding",
  "Operational sustainability of AODI's work"
]

const defaultGivingReasons = [
  { value: '', label: 'Select a reason (optional)' },
  { value: 'general', label: 'General Support' },
  { value: 'mentorship', label: 'Mentorship Programs' },
  { value: 'empowerher', label: 'EmpowerHer Initiative' },
  { value: 'education', label: 'Education & Scholarships' },
  { value: 'events', label: 'Conferences & Events' },
  { value: 'other', label: 'Other (please specify)' },
]

function parseJSON<T>(value: string | undefined, fallback: T): T {
  if (!value) return fallback
  try { return JSON.parse(value) as T } catch { return fallback }
}

export default async function SupportPage() {
  const settings = await getCachedSiteSettings()

  const nairaAmounts = parseJSON(settings.support_naira_amounts, defaultNairaAmounts)
  const dollarAmounts = parseJSON(settings.support_dollar_amounts, defaultDollarAmounts)
  const supportBenefits = parseJSON(settings.support_benefits, defaultSupportBenefits)
  const givingReasons = parseJSON(settings.support_giving_reasons, defaultGivingReasons)
  const heroHeadline = settings.support_hero_title || "Support AODI's Work"
  const heroSubheadline = settings.support_hero_subtitle || "Help us build leadership capacity and expand access to opportunity across Africa."

  return (
    <SupportPageClient
      nairaAmounts={nairaAmounts}
      dollarAmounts={dollarAmounts}
      supportBenefits={supportBenefits}
      givingReasons={givingReasons}
      heroHeadline={heroHeadline}
      heroSubheadline={heroSubheadline}
      heroImage={settings.support_hero_image}
    />
  )
}
