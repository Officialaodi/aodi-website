interface SimpleHeroProps {
  headline: string
  subheadline: string
  backgroundImage?: string
}

export function SimpleHero({ headline, subheadline, backgroundImage }: SimpleHeroProps) {
  return (
    <section className="relative bg-aodi-green py-16 md:py-20 overflow-hidden">
      {backgroundImage && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
          <div className="absolute inset-0 bg-aodi-green/75" />
          <div className="absolute inset-0 bg-gradient-to-br from-aodi-green/40 via-transparent to-aodi-teal/30" />
        </>
      )}
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl" data-testid="text-page-headline">
            {headline}
          </h1>
          <p className="mt-4 text-lg leading-8 text-white/80" data-testid="text-page-subheadline">
            {subheadline}
          </p>
        </div>
      </div>
    </section>
  )
}
