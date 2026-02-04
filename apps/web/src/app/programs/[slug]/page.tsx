import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SimpleHero } from '@/components/sections/SimpleHero'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Target, Quote } from 'lucide-react'
import { db } from '@/lib/db'
import { programs } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

async function getProgram(slug: string) {
  const program = await db
    .select()
    .from(programs)
    .where(and(eq(programs.slug, slug), eq(programs.isActive, true)))
    .limit(1)
  
  if (program.length === 0) {
    return null
  }
  
  return {
    ...program[0],
    steps: program[0].steps ? JSON.parse(program[0].steps) : null,
    benefits: program[0].benefits ? JSON.parse(program[0].benefits) : null,
    eligibility: program[0].eligibility ? JSON.parse(program[0].eligibility) : null,
    faqs: program[0].faqs ? JSON.parse(program[0].faqs) : null,
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const program = await getProgram(slug)
  
  if (!program) {
    return {
      title: 'Program Not Found | AODI',
    }
  }
  
  return {
    title: `${program.title} | AODI`,
    description: program.summary,
  }
}

export default async function ProgramDetailPage({ params }: Props) {
  const { slug } = await params
  const program = await getProgram(slug)
  
  if (!program) {
    notFound()
  }
  
  const steps = program.steps as { title: string; description: string }[] | null
  const benefits = program.benefits as string[] | null
  const eligibility = program.eligibility as string[] | null
  const faqs = program.faqs as { question: string; answer: string }[] | null
  
  return (
    <>
      <SimpleHero
        headline={program.title}
        subheadline={program.summary}
      />

      {program.description && (
        <section className="py-16 md:py-24 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <div className="text-center mb-10">
                <div className="mx-auto w-16 h-16 rounded-full bg-aodi-teal/10 flex items-center justify-center mb-6">
                  <Target className="h-8 w-8 text-aodi-teal" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-charcoal" data-testid="text-overview">
                  Program Overview
                </h2>
              </div>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-aodi-teal via-aodi-green to-aodi-gold rounded-full" />
                <div className="pl-8 py-2">
                  <Quote className="h-8 w-8 text-aodi-teal/30 mb-4" />
                  <p className="text-slate text-lg leading-relaxed" data-testid="text-overview-content">
                    {program.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {steps && steps.length > 0 && (
        <section className="py-16 md:py-24 bg-soft-grey">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tight text-charcoal text-center mb-12" data-testid="text-how-it-works">
              How It Works
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
              {steps.map((step, index) => (
                <Card key={index} className="bg-white border-0" data-testid={`card-step-${index}`}>
                  <CardHeader>
                    <div className="mb-2">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-aodi-teal text-white font-bold">
                        {index + 1}
                      </span>
                    </div>
                    <CardTitle className="text-lg text-charcoal">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate text-sm">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {benefits && benefits.length > 0 && (
        <section className="py-16 md:py-24 bg-soft-grey">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-3xl font-bold tracking-tight text-charcoal text-center mb-12" data-testid="text-benefits">
                Benefits
              </h2>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-aodi-teal flex-shrink-0 mt-0.5" />
                    <span className="text-slate" data-testid={`text-benefit-${index}`}>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {eligibility && eligibility.length > 0 && (
        <section className="py-16 md:py-24 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-3xl font-bold tracking-tight text-charcoal text-center mb-12" data-testid="text-eligibility">
                Eligibility
              </h2>
              <ul className="space-y-4">
                {eligibility.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-aodi-gold flex-shrink-0 mt-0.5" />
                    <span className="text-slate" data-testid={`text-eligibility-${index}`}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {faqs && faqs.length > 0 && (
        <section className="py-16 md:py-24 bg-soft-grey">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-3xl font-bold tracking-tight text-charcoal text-center mb-12" data-testid="text-faq">
                Frequently Asked Questions
              </h2>
              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <Card key={index} className="bg-white border-0" data-testid={`card-faq-${index}`}>
                    <CardHeader>
                      <CardTitle className="text-lg text-charcoal">{faq.question}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate">{faq.answer}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="py-16 md:py-24 bg-aodi-green">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            {(program.slug === 'code-yourself-out-of-poverty' || program.slug === 'equipped-school') ? (
              <>
                <h2 className="text-3xl font-bold tracking-tight text-white mb-4">
                  Support This Project
                </h2>
                <p className="text-white/90 mb-8">
                  We select schools and communities that benefit from this program. You can help us expand our reach.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/support" data-testid="link-support">
                    <Button variant="gold" size="lg">
                      Support This Project
                    </Button>
                  </Link>
                  <Link href="/get-involved/partner" data-testid="link-partner">
                    <Button variant="outlineLight" size="lg">
                      Partner With Us
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold tracking-tight text-white mb-6">
                  Ready to Take the Next Step?
                </h2>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  {program.ctaLink && (
                    <Link href={program.ctaLink} data-testid="link-apply">
                      <Button variant="gold" size="lg">
                        Apply Now
                      </Button>
                    </Link>
                  )}
                  <Link href="/programs" data-testid="link-all-programs">
                    <Button variant="outlineLight" size="lg">
                      View All Programs
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
