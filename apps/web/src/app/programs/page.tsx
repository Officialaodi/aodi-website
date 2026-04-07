import Link from 'next/link'
import type { Metadata } from 'next'
import { SimpleHero } from '@/components/sections/SimpleHero'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { programClusters, type Program } from '@/lib/schema'
import { getCachedPrograms, getCachedSiteSettings } from '@/lib/cache'
import { Calendar, Users, GraduationCap, Handshake, Lightbulb, BookOpen } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Programs | Africa of Our Dream Education Initiative (AODI)',
  description: 'Explore AODI leadership and talent development programs designed for students and early-career professionals across Africa.',
}

export const dynamic = 'force-dynamic'

const clusterDescriptions: Record<string, string> = {
  "Leadership & Mentorship": "Flagship mentorship and leadership pathways supporting academic and career progression.",
  "Campus & Youth Engagement": "Campus-embedded youth leadership and decentralised outreach across tertiary institutions.",
  "Skills, Gender & Economic Empowerment": "Skills, inclusion, and economic resilience programs supporting digital and leadership outcomes.",
  "STEM Education & Research Capacity": "STEM learning, research collaboration, and capacity building with institutional partners.",
  "Foundational Education Access": "Strengthening learning environments and access to quality education in underserved communities."
}

async function getPrograms() {
  return getCachedPrograms()
}

function groupProgramsByCluster(programsList: Program[]) {
  const grouped: Record<string, Program[]> = {}
  
  for (const cluster of programClusters) {
    grouped[cluster] = programsList.filter(p => p.primaryCluster === cluster)
  }
  
  return grouped
}

export default async function ProgramsPage() {
  const [programsList, settings] = await Promise.all([
    getPrograms(),
    getCachedSiteSettings(),
  ])
  const groupedPrograms = groupProgramsByCluster(programsList)

  return (
    <>
      <SimpleHero
        headline="Our Programs"
        subheadline="Leadership development, mentorship, skills training, and access to education across Africa."
        backgroundImage={settings.programs_hero_image}
      />

      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-charcoal mb-6" data-testid="text-programs-overview">
              What We Deliver
            </h2>
            <p className="text-slate text-lg leading-relaxed" data-testid="text-programs-overview-content">
              AODI delivers impact through a portfolio of structured programs designed to support individuals and institutions across Africa at critical transition points in education and early career development.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center p-6 rounded-lg border border-gray-100 bg-soft-grey">
              <div className="mx-auto w-14 h-14 rounded-full bg-aodi-green/10 flex items-center justify-center mb-4">
                <GraduationCap className="h-7 w-7 text-aodi-green" />
              </div>
              <h3 className="font-semibold text-charcoal mb-2">Leadership Development</h3>
              <p className="text-slate text-sm">Building leadership capacity for students and early-career professionals</p>
            </div>
            
            <div className="text-center p-6 rounded-lg border border-gray-100 bg-soft-grey">
              <div className="mx-auto w-14 h-14 rounded-full bg-aodi-teal/10 flex items-center justify-center mb-4">
                <Handshake className="h-7 w-7 text-aodi-teal" />
              </div>
              <h3 className="font-semibold text-charcoal mb-2">Mentorship</h3>
              <p className="text-slate text-sm">Structured guidance connecting talent with experienced professionals</p>
            </div>
            
            <div className="text-center p-6 rounded-lg border border-gray-100 bg-soft-grey">
              <div className="mx-auto w-14 h-14 rounded-full bg-aodi-gold/10 flex items-center justify-center mb-4">
                <Lightbulb className="h-7 w-7 text-aodi-gold" />
              </div>
              <h3 className="font-semibold text-charcoal mb-2">Skills Training</h3>
              <p className="text-slate text-sm">Digital, STEM, and economic empowerment capabilities</p>
            </div>
            
            <div className="text-center p-6 rounded-lg border border-gray-100 bg-soft-grey">
              <div className="mx-auto w-14 h-14 rounded-full bg-aodi-green/10 flex items-center justify-center mb-4">
                <BookOpen className="h-7 w-7 text-aodi-green" />
              </div>
              <h3 className="font-semibold text-charcoal mb-2">Education Access</h3>
              <p className="text-slate text-sm">Strengthening institutions and expanding opportunity</p>
            </div>
          </div>
        </div>
      </section>

      {programClusters.map((cluster, clusterIndex) => {
        const clusterPrograms = groupedPrograms[cluster]
        if (!clusterPrograms || clusterPrograms.length === 0) return null
        
        return (
          <section 
            key={cluster} 
            className={`py-16 md:py-20 ${clusterIndex % 2 === 0 ? 'bg-soft-grey' : 'bg-white'}`}
            data-testid={`section-cluster-${clusterIndex}`}
          >
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mb-10">
                <h2 className="text-2xl font-bold tracking-tight text-charcoal mb-2" data-testid={`text-cluster-title-${clusterIndex}`}>
                  {cluster}
                </h2>
                <p className="text-slate max-w-3xl">
                  {clusterDescriptions[cluster]}
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {clusterPrograms.map((program, index) => (
                  <Card 
                    key={program.slug} 
                    className={`overflow-hidden shadow-md hover:shadow-lg transition-shadow ${program.borderColor} border-t-4`}
                    data-testid={`card-program-${program.slug}`}
                  >
                    {program.isFeatured && (
                      <div className={`${program.accentColor} text-white text-xs font-medium px-3 py-1.5 text-center`}>
                        Flagship Program
                      </div>
                    )}
                    <CardHeader className={program.isFeatured ? '' : 'pt-6'}>
                      <CardTitle className="text-xl text-charcoal">{program.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-slate mb-6 line-clamp-3">
                        {program.summary}
                      </CardDescription>
                      <Link href={`/programs/${program.slug}`} data-testid={`link-program-${program.slug}`}>
                        <Button className="w-full" variant={program.isFeatured ? "default" : "outline"}>
                          {program.ctaText}
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )
      })}

      <section className="py-16 md:py-20 bg-aodi-green" data-testid="section-events-convenings">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex justify-center gap-4 mb-6">
              <Calendar className="h-10 w-10 text-aodi-gold" />
              <Users className="h-10 w-10 text-aodi-gold" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white mb-4" data-testid="text-events-title">
              Events & Convenings
            </h2>
            <p className="text-white/90 mb-8 text-lg">
              AODI convenes communities through conferences, summits, workshops, and training programs that support our mission and program delivery.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/events" data-testid="link-view-events">
                <Button variant="gold" size="lg">
                  View Events
                </Button>
              </Link>
              <Link href="/get-involved/partner" data-testid="link-partner">
                <Button variant="outlineLight" size="lg">
                  Host a Workshop / Partner
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
