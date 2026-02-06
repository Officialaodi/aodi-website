import Link from 'next/link'
import type { Metadata } from 'next'
import { SimpleHero } from '@/components/sections/SimpleHero'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Heart, GraduationCap, HandHelping, type LucideIcon } from 'lucide-react'
import { getCachedSiteSettings } from '@/lib/cache'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Get Involved | Africa of Our Dream Education Initiative (AODI)',
  description: 'Join AODI as a partner, mentor, mentee, or volunteer. Support leadership development across Africa.',
}

const iconMap: Record<string, LucideIcon> = {
  Users,
  Heart,
  GraduationCap,
  HandHelping,
}

interface Pathway {
  title: string
  description: string
  href: string
  buttonText: string
  icon: string
}

function parseJSON<T>(value: string | undefined, fallback: T): T {
  if (!value) return fallback
  try { return JSON.parse(value) as T } catch { return fallback }
}

const defaultPathways: Pathway[] = [
  {
    title: "Partners & Donors",
    description: "Collaborate with AODI to support scalable, high-impact leadership and talent development initiatives.",
    href: "/get-involved/partner",
    buttonText: "Partner with AODI",
    icon: "Users"
  },
  {
    title: "Mentors",
    description: "Contribute your experience and perspective to guide the next generation of African leaders.",
    href: "/get-involved/mentor",
    buttonText: "Join as a Mentor",
    icon: "Heart"
  },
  {
    title: "Mentees",
    description: "Access structured programs designed to support your growth, clarity, and leadership potential.",
    href: "/get-involved/mentee",
    buttonText: "Apply as a Mentee",
    icon: "GraduationCap"
  },
  {
    title: "Volunteers",
    description: "Support program delivery, operations, and community engagement.",
    href: "/get-involved/volunteer",
    buttonText: "Volunteer with Us",
    icon: "HandHelping"
  }
]

export default async function GetInvolvedPage() {
  const settings = await getCachedSiteSettings()

  const headline = settings['getinvolved_hero_headline'] || 'Get Involved'
  const subheadline = settings['getinvolved_hero_subheadline'] || 'Join us in building Africa\'s next generation of leaders — as a partner, mentor, mentee, or volunteer.'
  const pathways = parseJSON<Pathway[]>(settings['getinvolved_pathways'], defaultPathways)

  return (
    <>
      <SimpleHero
        headline={headline}
        subheadline={subheadline}
        backgroundImage={settings['getinvolved_hero_image']}
      />

      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {pathways.map((pathway, index) => {
              const Icon = iconMap[pathway.icon] || Users
              return (
                <Card key={index} className="bg-soft-grey border-0" data-testid={`card-pathway-${index}`}>
                  <CardHeader>
                    <div className="mb-4">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-aodi-teal/10">
                        <Icon className="h-6 w-6 text-aodi-teal" />
                      </div>
                    </div>
                    <CardTitle className="text-xl text-charcoal">{pathway.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate mb-6">
                      {pathway.description}
                    </CardDescription>
                    <Link href={pathway.href} data-testid={`link-pathway-${index}`}>
                      <Button className="w-full">
                        {pathway.buttonText}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}
