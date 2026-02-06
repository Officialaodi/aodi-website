import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface HeroProps {
  headline: string
  subheadline: string
  ctaPrimaryText?: string
  ctaPrimaryUrl?: string
  ctaSecondaryText?: string
  ctaSecondaryUrl?: string
  backgroundImage?: string
}

export function Hero({
  headline,
  subheadline,
  ctaPrimaryText,
  ctaPrimaryUrl,
  ctaSecondaryText,
  ctaSecondaryUrl,
  backgroundImage,
}: HeroProps) {
  return (
    <section className="relative bg-aodi-green py-20 md:py-28 lg:py-32 overflow-hidden">
      {backgroundImage ? (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
          <div className="absolute inset-0 bg-aodi-green/75" />
          <div className="absolute inset-0 bg-gradient-to-br from-aodi-green/40 via-transparent to-aodi-teal/30" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-aodi-green via-aodi-green to-aodi-teal/30" />
      )}
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl" data-testid="text-hero-headline">
            {headline}
          </h1>
          <p className="mt-6 text-lg leading-8 text-white/80" data-testid="text-hero-subheadline">
            {subheadline}
          </p>
          {(ctaPrimaryText || ctaSecondaryText) && (
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              {ctaPrimaryText && ctaPrimaryUrl && (
                <Link href={ctaPrimaryUrl} data-testid="link-hero-cta-primary">
                  <Button variant="gold" size="lg">
                    {ctaPrimaryText}
                  </Button>
                </Link>
              )}
              {ctaSecondaryText && ctaSecondaryUrl && (
                <Link href={ctaSecondaryUrl} data-testid="link-hero-cta-secondary">
                  <Button variant="outlineLight" size="lg">
                    {ctaSecondaryText}
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
