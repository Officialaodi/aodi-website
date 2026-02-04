import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

interface FeaturedProgramProps {
  title: string
  bullets: string[]
  ctaText: string
  ctaUrl: string
}

export function FeaturedProgram({ title, bullets, ctaText, ctaUrl }: FeaturedProgramProps) {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl bg-gradient-to-br from-aodi-green to-aodi-green/90 p-8 md:p-12 text-white">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-white" data-testid="text-featured-program-title">
              {title}
            </h2>
            <ul className="mt-8 space-y-4">
              {bullets.map((bullet, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-aodi-gold flex-shrink-0 mt-0.5" />
                  <span className="text-white/90" data-testid={`text-featured-bullet-${index}`}>{bullet}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Link href={ctaUrl} data-testid="link-featured-program-cta">
                <Button variant="gold" size="lg">
                  {ctaText}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
