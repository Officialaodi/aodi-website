import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { resources } from '@/lib/schema'
import { eq, asc } from 'drizzle-orm'
import { SimpleHero } from '@/components/sections/SimpleHero'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Download, ExternalLink, BookOpen, FileBarChart, Shield } from 'lucide-react'
import Link from 'next/link'
import { getCachedSiteSettings } from '@/lib/cache'

export const metadata: Metadata = {
  title: 'Resources | Africa of Our Dream Education Initiative (AODI)',
  description: 'Access AODI reports, guides, frameworks, and downloadable resources for mentees, mentors, and partners.',
}

export const dynamic = 'force-dynamic'

const categoryIcons: Record<string, React.ReactNode> = {
  'Reports': <FileBarChart className="w-6 h-6" />,
  'Guides': <BookOpen className="w-6 h-6" />,
  'Frameworks': <FileText className="w-6 h-6" />,
  'Policies': <Shield className="w-6 h-6" />,
}

type GroupedResources = Record<string, typeof resources.$inferSelect[]>

async function getResources() {
  const allResources = await db
    .select()
    .from(resources)
    .where(eq(resources.isActive, true))
    .orderBy(asc(resources.displayOrder))
  
  const grouped = allResources.reduce((acc: GroupedResources, resource) => {
    if (!acc[resource.category]) {
      acc[resource.category] = []
    }
    acc[resource.category].push(resource)
    return acc
  }, {})
  
  return grouped
}

export default async function ResourcesPage() {
  const [resourcesByCategory, settings] = await Promise.all([
    getResources(),
    getCachedSiteSettings(),
  ])
  const categories = Object.keys(resourcesByCategory)

  return (
    <>
      <SimpleHero
        headline="Resources"
        subheadline="Access reports, guides, and frameworks to support your leadership journey and partnership with AODI."
        backgroundImage={settings.resources_hero_image}
      />

      {categories.length === 0 ? (
        <section className="py-16 md:py-24 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
            <p className="text-slate">No resources available yet. Check back soon!</p>
          </div>
        </section>
      ) : (
        categories.map((category, categoryIdx) => (
          <section 
            key={category}
            className={`py-12 md:py-16 ${categoryIdx % 2 === 0 ? 'bg-white' : 'bg-soft-grey'}`}
          >
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-lg bg-aodi-teal/10 text-aodi-teal">
                  {categoryIcons[category] || <FileText className="w-6 h-6" />}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-charcoal">
                  {category}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resourcesByCategory[category].map((resource) => (
                  <Card 
                    key={resource.id} 
                    className="bg-white border-gray-200 hover:shadow-md transition-shadow"
                    data-testid={`card-resource-${resource.id}`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg text-charcoal">{resource.title}</CardTitle>
                        {resource.fileType && (
                          <span className="text-xs font-medium px-2 py-1 rounded bg-aodi-green/10 text-aodi-green">
                            {resource.fileType}
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-slate mb-4">
                        {resource.description}
                      </CardDescription>
                      <div className="flex gap-2">
                        {resource.fileUrl && (
                          <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="default" size="sm" className="gap-2">
                              <Download className="w-4 h-4" />
                              Download
                            </Button>
                          </a>
                        )}
                        {resource.externalUrl && (
                          <a href={resource.externalUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm" className="gap-2">
                              <ExternalLink className="w-4 h-4" />
                              View
                            </Button>
                          </a>
                        )}
                        {!resource.fileUrl && !resource.externalUrl && (
                          <Button variant="outline" size="sm" disabled>
                            Coming Soon
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        ))
      )}

      <section className="py-16 md:py-24 bg-aodi-green">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white mb-6">
              Need Something Specific?
            </h2>
            <p className="text-white/80 mb-8">
              Contact us if you need additional resources or information about AODI programs and partnerships.
            </p>
            <Link href="/contact" data-testid="link-contact">
              <Button variant="gold" size="lg">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
