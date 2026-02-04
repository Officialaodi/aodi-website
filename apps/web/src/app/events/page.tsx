import Link from 'next/link'
import type { Metadata } from 'next'
import { SimpleHero } from '@/components/sections/SimpleHero'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getCachedEvents } from '@/lib/cache'
import { Calendar, MapPin, Video, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Events & Convenings | Africa of Our Dream Education Initiative (AODI)',
  description: 'Join AODI conferences, summits, workshops, and training programs that support leadership development and talent empowerment across Africa.',
}

export const revalidate = 300

async function getEvents() {
  return getCachedEvents()
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(date))
}

function getModeIcon(mode: string | null) {
  switch (mode) {
    case 'Virtual':
      return <Video className="h-4 w-4" />
    case 'In-person':
      return <MapPin className="h-4 w-4" />
    case 'Hybrid':
      return <Users className="h-4 w-4" />
    default:
      return <Calendar className="h-4 w-4" />
  }
}

export default async function EventsPage() {
  const eventsList = await getEvents()
  
  const upcomingEvents = eventsList.filter(e => e.status === 'Upcoming')
  const pastEvents = eventsList.filter(e => e.status === 'Past')

  return (
    <>
      <SimpleHero
        headline="Events & Convenings"
        subheadline="AODI convenes communities through conferences, summits, workshops, and training programs that support our mission and program delivery."
      />

      <section className="py-16 md:py-24 bg-white" data-testid="section-upcoming-events">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="text-2xl font-bold tracking-tight text-charcoal mb-2" data-testid="text-upcoming-title">
              Upcoming Events
            </h2>
            <p className="text-slate">
              Join us at our upcoming conferences, workshops, and community gatherings.
            </p>
          </div>
          
          {upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((event) => (
                <Card 
                  key={event.slug} 
                  className="overflow-hidden shadow-md hover:shadow-lg transition-shadow border-t-4 border-aodi-teal"
                  data-testid={`card-event-${event.slug}`}
                >
                  {event.isFeatured && (
                    <div className="bg-aodi-gold text-white text-xs font-medium px-3 py-1.5 text-center">
                      Featured Event
                    </div>
                  )}
                  <CardHeader className={event.isFeatured ? '' : 'pt-6'}>
                    <div className="flex items-center gap-2 text-sm text-slate mb-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(event.startDate)}</span>
                    </div>
                    <CardTitle className="text-xl text-charcoal">{event.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-slate mb-4">
                      {getModeIcon(event.mode)}
                      <span>{event.mode}</span>
                      {event.location && (
                        <>
                          <span className="text-slate/50">|</span>
                          <span>{event.location}</span>
                        </>
                      )}
                    </div>
                    <CardDescription className="text-slate mb-6 line-clamp-3">
                      {event.summary}
                    </CardDescription>
                    <Link href={`/events/${event.slug}`} data-testid={`link-event-${event.slug}`}>
                      <Button className="w-full" variant="default">
                        View Details
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-soft-grey rounded-lg">
              <Calendar className="h-12 w-12 text-slate/50 mx-auto mb-4" />
              <p className="text-slate">No upcoming events at the moment.</p>
              <p className="text-slate/70 text-sm mt-2">Check back soon or subscribe to our newsletter for updates.</p>
            </div>
          )}
        </div>
      </section>

      {pastEvents.length > 0 && (
        <section className="py-16 md:py-24 bg-soft-grey" data-testid="section-past-events">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mb-10">
              <h2 className="text-2xl font-bold tracking-tight text-charcoal mb-2" data-testid="text-past-title">
                Past Events
              </h2>
              <p className="text-slate">
                Browse our previous conferences, workshops, and community gatherings.
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pastEvents.map((event) => (
                <Card 
                  key={event.slug} 
                  className="overflow-hidden shadow-md hover:shadow-lg transition-shadow border-t-4 border-slate/30"
                  data-testid={`card-past-event-${event.slug}`}
                >
                  <CardHeader className="pt-6">
                    <div className="flex items-center gap-2 text-sm text-slate mb-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(event.startDate)}</span>
                    </div>
                    <CardTitle className="text-xl text-charcoal">{event.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-slate mb-4">
                      {getModeIcon(event.mode)}
                      <span>{event.mode}</span>
                      {event.location && (
                        <>
                          <span className="text-slate/50">|</span>
                          <span>{event.location}</span>
                        </>
                      )}
                    </div>
                    <CardDescription className="text-slate mb-6 line-clamp-3">
                      {event.summary}
                    </CardDescription>
                    <Link href={`/events/${event.slug}`} data-testid={`link-past-event-${event.slug}`}>
                      <Button className="w-full" variant="outline">
                        View Details
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 md:py-24 bg-aodi-green" data-testid="section-partner-cta">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white mb-4">
              Partner With AODI
            </h2>
            <p className="text-white/90 mb-8 text-lg">
              Interested in hosting a workshop, sponsoring an event, or collaborating on a summit? We welcome partnerships that advance leadership and talent development across Africa.
            </p>
            <Link href="/get-involved/partner" data-testid="link-become-partner">
              <Button variant="gold" size="lg">
                Become a Partner
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
