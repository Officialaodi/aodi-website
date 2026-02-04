import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SimpleHero } from '@/components/sections/SimpleHero'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { db } from '@/lib/db'
import { events } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'
import { 
  Calendar, 
  MapPin, 
  Video, 
  Users, 
  ArrowLeft, 
  ExternalLink,
  Beaker, 
  Microscope,
  GraduationCap,
  CheckCircle,
  Globe,
  Lightbulb,
  Network,
  Clock,
  Award,
  Target,
  Heart,
  Star,
  Zap,
  Shield,
  BookOpen,
  LucideIcon
} from 'lucide-react'
import { SafeHtml } from '@/components/ui/safe-html'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

interface Objective {
  icon: string
  title: string
  description: string
}

const iconMap: Record<string, LucideIcon> = {
  Beaker,
  Microscope,
  GraduationCap,
  Globe,
  Lightbulb,
  Network,
  Award,
  Target,
  Heart,
  Star,
  Zap,
  Shield,
  BookOpen,
  Users,
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
}

async function getEvent(slug: string) {
  const event = await db
    .select()
    .from(events)
    .where(and(eq(events.slug, slug), eq(events.isActive, true)))
    .limit(1)
  
  if (event.length === 0) {
    return null
  }
  
  return event[0]
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(date))
}

function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(date))
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  }).format(new Date(date))
}

function getModeIcon(mode: string | null) {
  switch (mode) {
    case 'Virtual':
      return <Video className="h-5 w-5" />
    case 'In-person':
      return <MapPin className="h-5 w-5" />
    case 'Hybrid':
      return <Users className="h-5 w-5" />
    default:
      return <Calendar className="h-5 w-5" />
  }
}

function isExternalUrl(url: string): boolean {
  return !url.startsWith('/')
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const event = await getEvent(slug)
  
  if (!event) {
    return {
      title: 'Event Not Found | AODI',
    }
  }
  
  return {
    title: `${event.title} | Events | AODI`,
    description: event.summary,
  }
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params
  const event = await getEvent(slug)
  
  if (!event) {
    notFound()
  }
  
  const isPast = event.status === 'Past'
  const hasHeroImage = event.heroImage && event.heroImage.length > 0
  const registrationUrl = event.registrationUrl || `/events/${slug}/register`
  const registrationLabel = event.registrationLabel || 'Register'
  
  const pageTemplate = event.pageTemplate || 'standard'
  const isFeaturedProgram = pageTemplate === 'featured-program'
  
  const objectives = (event.objectives as Objective[] | null) || []
  const eligibilityCriteria = (event.eligibilityCriteria as string[] | null) || []
  
  const overviewTitle = event.overviewTitle || 'Overview'
  const eligibilityTitle = event.eligibilityTitle || 'Who Should Apply'
  const eligibilityIntro = event.eligibilityIntro || 'This programme is open to:'
  const deliveryTitle = event.deliveryTitle || 'Delivery Mode'
  const deliveryDescription = event.deliveryDescription
  const duration = event.duration || 'Multi-day Programme'
  const certificate = event.certificate || 'Awarded upon completion'
  const ctaTitle = event.ctaTitle || `Ready to Join ${event.title}?`
  const ctaDescription = event.ctaDescription || `Apply now to be part of ${event.title}.`
  const ctaButtonText = event.ctaButtonText || 'Submit Your Application'
  
  if (isFeaturedProgram) {
    return (
      <>
        {hasHeroImage ? (
          <section className="relative h-[60vh] min-h-[500px] max-h-[700px] w-full overflow-hidden">
            <div className="absolute inset-0">
              <Image
                src={event.heroImage!}
                alt={event.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
            </div>
            <div className="relative h-full flex flex-col items-center justify-end pb-16 px-6">
              <div className="mx-auto max-w-4xl text-center">
                <div className="flex justify-center gap-4 mb-6">
                  <div className="p-3 bg-aodi-gold/20 rounded-full backdrop-blur-sm">
                    <Beaker className="h-8 w-8 text-aodi-gold" />
                  </div>
                  <div className="p-3 bg-aodi-gold/20 rounded-full backdrop-blur-sm">
                    <Microscope className="h-8 w-8 text-aodi-gold" />
                  </div>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4" data-testid="text-event-title">
                  {event.title}
                </h1>
                {event.subtitle && (
                  <p className="text-xl md:text-2xl text-aodi-gold font-semibold mb-4" data-testid="text-event-subtitle">
                    {event.subtitle}
                  </p>
                )}
                <p className="text-lg md:text-xl text-white/90 mb-6" data-testid="text-event-summary">
                  {event.summary}
                </p>
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                  <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm" data-testid="text-event-date">
                    <Calendar className="h-5 w-5 text-aodi-gold" />
                    <span className="text-white">{formatShortDate(event.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm" data-testid="text-event-mode">
                    <MapPin className="h-5 w-5 text-aodi-gold" />
                    <span className="text-white">{event.mode}</span>
                  </div>
                </div>
                {!isPast && (
                  isExternalUrl(registrationUrl) ? (
                    <a href={registrationUrl} target="_blank" rel="noopener noreferrer" data-testid="link-register-hero">
                      <Button size="lg" variant="gold" className="gap-2" data-testid="button-register-hero">
                        {registrationLabel}
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                  ) : (
                    <Link href={registrationUrl} data-testid="link-register-hero">
                      <Button size="lg" variant="gold" data-testid="button-register-hero">
                        {registrationLabel}
                      </Button>
                    </Link>
                  )
                )}
              </div>
            </div>
          </section>
        ) : (
          <section className="relative bg-gradient-to-br from-aodi-green via-aodi-teal to-aodi-green overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-20 left-10 w-72 h-72 bg-aodi-gold rounded-full blur-3xl" />
              <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
            </div>
            <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-20 md:py-28">
              <div className="text-center">
                <div className="flex justify-center gap-4 mb-8">
                  <div className="p-4 bg-aodi-gold/20 rounded-full backdrop-blur-sm">
                    <Beaker className="h-10 w-10 text-aodi-gold" />
                  </div>
                  <div className="p-4 bg-aodi-gold/20 rounded-full backdrop-blur-sm">
                    <Microscope className="h-10 w-10 text-aodi-gold" />
                  </div>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6" data-testid="text-event-title">
                  {event.title}
                </h1>
                {event.subtitle && (
                  <p className="text-xl md:text-2xl text-aodi-gold font-semibold mb-4" data-testid="text-event-subtitle">
                    {event.subtitle}
                  </p>
                )}
                <p className="text-lg md:text-xl text-white/90 mb-8" data-testid="text-event-summary">
                  {event.summary}
                </p>
                <div className="flex flex-wrap justify-center gap-4 mb-10">
                  <div className="flex items-center gap-2 bg-white/10 px-5 py-3 rounded-full backdrop-blur-sm" data-testid="text-event-date">
                    <Calendar className="h-5 w-5 text-aodi-gold" />
                    <span className="text-white">{formatShortDate(event.startDate)}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2 bg-white/10 px-5 py-3 rounded-full backdrop-blur-sm" data-testid="text-event-location">
                      <MapPin className="h-5 w-5 text-aodi-gold" />
                      <span className="text-white">{event.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 bg-white/10 px-5 py-3 rounded-full backdrop-blur-sm" data-testid="text-event-mode">
                    <Users className="h-5 w-5 text-aodi-gold" />
                    <span className="text-white">{event.mode}</span>
                  </div>
                </div>
                {!isPast && (
                  isExternalUrl(registrationUrl) ? (
                    <a href={registrationUrl} target="_blank" rel="noopener noreferrer" data-testid="link-register-hero">
                      <Button size="lg" variant="gold" className="gap-2" data-testid="button-register-hero">
                        {registrationLabel}
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                  ) : (
                    <Link href={registrationUrl} data-testid="link-register-hero">
                      <Button size="lg" variant="gold" data-testid="button-register-hero">
                        {registrationLabel}
                      </Button>
                    </Link>
                  )
                )}
              </div>
            </div>
          </section>
        )}

        <section className="py-16 md:py-20 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mb-8">
              <Link 
                href="/events" 
                className="inline-flex items-center gap-2 text-aodi-teal transition-colors"
                data-testid="link-back-events"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Events
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-12">
                {event.body && (
                  <div>
                    <h2 className="text-3xl font-bold text-charcoal mb-6 flex items-center gap-3" data-testid="text-overview-heading">
                      <Target className="h-8 w-8 text-aodi-teal" />
                      {overviewTitle}
                    </h2>
                    <SafeHtml 
                      html={event.body}
                      className="prose prose-lg max-w-none text-slate"
                    />
                  </div>
                )}

                {objectives.length > 0 && (
                  <div>
                    <h2 className="text-3xl font-bold text-charcoal mb-8 flex items-center gap-3" data-testid="text-objectives-heading">
                      <Lightbulb className="h-8 w-8 text-aodi-teal" />
                      Programme Objectives
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {objectives.map((objective, index) => {
                        const IconComponent = iconMap[objective.icon] || Target
                        return (
                          <Card key={index} className="border-0 shadow-md bg-soft-grey" data-testid={`card-objective-${index}`}>
                            <CardContent className="p-6">
                              <div className="flex items-start gap-4">
                                <div className="p-3 bg-aodi-teal/10 rounded-lg flex-shrink-0">
                                  <IconComponent className="h-6 w-6 text-aodi-teal" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-charcoal mb-2" data-testid={`text-objective-title-${index}`}>{objective.title}</h3>
                                  <p className="text-slate text-sm" data-testid={`text-objective-desc-${index}`}>{objective.description}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                )}

                {eligibilityCriteria.length > 0 && (
                  <div>
                    <h2 className="text-3xl font-bold text-charcoal mb-6 flex items-center gap-3" data-testid="text-eligibility-heading">
                      <GraduationCap className="h-8 w-8 text-aodi-teal" />
                      {eligibilityTitle}
                    </h2>
                    <Card className="border-0 shadow-md bg-gradient-to-br from-aodi-green/5 to-aodi-teal/5">
                      <CardContent className="p-8">
                        <p className="text-lg text-charcoal mb-6 font-medium" data-testid="text-eligibility-intro">
                          {eligibilityIntro}
                        </p>
                        <ul className="space-y-4">
                          {eligibilityCriteria.map((criteria, index) => (
                            <li key={index} className="flex items-start gap-3" data-testid={`text-eligibility-${index}`}>
                              <CheckCircle className="h-6 w-6 text-aodi-green flex-shrink-0 mt-0.5" />
                              <span className="text-slate text-lg">{criteria}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                )}

                <div>
                  <h2 className="text-3xl font-bold text-charcoal mb-6 flex items-center gap-3" data-testid="text-delivery-heading">
                    <Globe className="h-8 w-8 text-aodi-teal" />
                    {deliveryTitle}
                  </h2>
                  <Card className="border-0 shadow-md">
                    <CardContent className="p-8">
                      <div className="flex items-center gap-4">
                        <div className="p-4 bg-aodi-gold/10 rounded-full">
                          <Users className="h-8 w-8 text-aodi-gold" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-charcoal" data-testid="text-delivery-mode">{event.mode}</h3>
                          {deliveryDescription ? (
                            <p className="text-slate mt-1" data-testid="text-delivery-description">{deliveryDescription}</p>
                          ) : event.location && (
                            <p className="text-slate mt-1" data-testid="text-delivery-location">{event.location}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="lg:col-span-1">
                <Card className="sticky top-24 z-[1000] border-0 shadow-xl bg-gradient-to-br from-aodi-green to-aodi-teal text-white" data-testid="card-event-details">
                  <CardContent className="p-8 space-y-6">
                    <h3 className="text-xl font-bold text-white mb-4" data-testid="text-details-heading">Event Details</h3>
                    
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-white/10 rounded-lg flex-shrink-0">
                        <Calendar className="h-6 w-6 text-aodi-gold" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">Date</p>
                        <p className="text-white/80" data-testid="text-sidebar-start-date">{formatDate(event.startDate)}</p>
                        {event.endDate && (
                          <p className="text-white/60 text-sm" data-testid="text-sidebar-end-date">
                            to {formatDate(event.endDate)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-white/10 rounded-lg flex-shrink-0">
                        <MapPin className="h-6 w-6 text-aodi-gold" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">Format</p>
                        <p className="text-white/80" data-testid="text-sidebar-mode">{event.mode}</p>
                        {event.location && (
                          <p className="text-white/60 text-sm" data-testid="text-sidebar-location">{event.location}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-white/10 rounded-lg flex-shrink-0">
                        <Clock className="h-6 w-6 text-aodi-gold" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">Duration</p>
                        <p className="text-white/80" data-testid="text-sidebar-duration">{duration}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-white/10 rounded-lg flex-shrink-0">
                        <Award className="h-6 w-6 text-aodi-gold" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">Certificate</p>
                        <p className="text-white/80" data-testid="text-sidebar-certificate">{certificate}</p>
                      </div>
                    </div>

                    {!isPast ? (
                      <div className="pt-4 border-t border-white/20">
                        {isExternalUrl(registrationUrl) ? (
                          <a href={registrationUrl} target="_blank" rel="noopener noreferrer" data-testid="link-register-sidebar">
                            <Button className="w-full gap-2" variant="gold" size="lg" data-testid="button-register-sidebar">
                              {registrationLabel}
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </a>
                        ) : (
                          <Link href={registrationUrl} data-testid="link-register-sidebar">
                            <Button className="w-full" variant="gold" size="lg" data-testid="button-register-sidebar">
                              {registrationLabel}
                            </Button>
                          </Link>
                        )}
                        <p className="text-white/60 text-sm text-center mt-3">Limited spots available</p>
                      </div>
                    ) : (
                      <div className="pt-4 border-t border-white/20 text-center">
                        <span className="inline-block bg-white/10 text-white/80 px-4 py-2 rounded-md text-sm font-medium">
                          This event has ended
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 bg-soft-grey">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-charcoal mb-6" data-testid="text-cta-heading">
                {ctaTitle}
              </h2>
              <p className="text-lg text-slate mb-8" data-testid="text-cta-description">
                {ctaDescription}
              </p>
              {!isPast && (
                isExternalUrl(registrationUrl) ? (
                  <a href={registrationUrl} target="_blank" rel="noopener noreferrer" data-testid="link-register-cta">
                    <Button size="lg" className="gap-2" data-testid="button-register-cta">
                      {ctaButtonText}
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                ) : (
                  <Link href={registrationUrl} data-testid="link-register-cta">
                    <Button size="lg" data-testid="button-register-cta">
                      {ctaButtonText}
                    </Button>
                  </Link>
                )
              )}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 bg-aodi-green">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white mb-6" data-testid="text-explore-heading">
                Explore More Events
              </h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/events" data-testid="link-all-events">
                  <Button variant="gold" size="lg" data-testid="button-all-events">
                    View All Events
                  </Button>
                </Link>
                <Link href="/programs" data-testid="link-programs">
                  <Button variant="outlineLight" size="lg" data-testid="button-programs">
                    Explore Programs
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </>
    )
  }
  
  return (
    <>
      {hasHeroImage ? (
        <section className="relative h-[50vh] min-h-[400px] max-h-[600px] w-full overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src={event.heroImage!}
              alt={event.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
          </div>
          <div className="relative h-full flex flex-col items-center justify-end pb-12 px-6">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4" data-testid="text-event-title">
                {event.title}
              </h1>
              <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto" data-testid="text-event-summary">
                {event.summary}
              </p>
            </div>
          </div>
        </section>
      ) : (
        <SimpleHero
          headline={event.title}
          subheadline={event.summary}
        />
      )}

      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-8">
            <Link 
              href="/events" 
              className="inline-flex items-center gap-2 text-aodi-teal hover:text-aodi-green transition-colors"
              data-testid="link-back-events"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Events
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {event.body ? (
                <SafeHtml 
                  html={event.body}
                  className="prose prose-lg max-w-none text-slate"
                />
              ) : (
                <p className="text-slate text-lg">{event.summary}</p>
              )}
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-24 bg-soft-grey border-0" data-testid="card-event-details">
                <CardHeader>
                  <CardTitle className="text-lg text-charcoal">Event Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-aodi-teal flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-charcoal">{formatDate(event.startDate)}</p>
                      <p className="text-sm text-slate">{formatTime(event.startDate)}</p>
                      {event.endDate && (
                        <p className="text-sm text-slate mt-1">
                          to {formatDate(event.endDate)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    {getModeIcon(event.mode)}
                    <div>
                      <p className="font-medium text-charcoal">{event.mode}</p>
                      {event.location && (
                        <p className="text-sm text-slate">{event.location}</p>
                      )}
                    </div>
                  </div>

                  {event.registrationUrl && !isPast && (
                    <div className="pt-4">
                      {event.registrationUrl.startsWith('/') ? (
                        <Link href={event.registrationUrl} data-testid="link-register">
                          <Button className="w-full" variant="default">
                            {event.registrationLabel || 'Register'}
                          </Button>
                        </Link>
                      ) : (
                        <a 
                          href={event.registrationUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          data-testid="link-register"
                        >
                          <Button className="w-full gap-2" variant="default">
                            {event.registrationLabel || 'Register'}
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </a>
                      )}
                    </div>
                  )}

                  {isPast && (
                    <div className="pt-4 text-center">
                      <span className="inline-block bg-slate/20 text-slate px-4 py-2 rounded-md text-sm font-medium">
                        This event has ended
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-aodi-green">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white mb-6">
              Explore More Events
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/events" data-testid="link-all-events">
                <Button variant="gold" size="lg">
                  View All Events
                </Button>
              </Link>
              <Link href="/programs" data-testid="link-programs">
                <Button variant="outlineLight" size="lg">
                  Explore Programs
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
