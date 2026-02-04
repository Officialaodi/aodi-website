import { Check } from 'lucide-react'

interface InitiativeScopeProps {
  title: string
  bullets: string[]
  closingLine: string
}

export function InitiativeScope({ title, bullets, closingLine }: InitiativeScopeProps) {
  return (
    <section className="py-16 md:py-24 bg-soft-grey">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-charcoal sm:text-4xl" data-testid="text-initiative-title">
            {title}
          </h2>
          <ul className="mt-8 space-y-4 text-left">
            {bullets.map((bullet, index) => (
              <li key={index} className="flex items-start gap-3">
                <Check className="h-5 w-5 text-aodi-teal flex-shrink-0 mt-0.5" />
                <span className="text-slate" data-testid={`text-initiative-bullet-${index}`}>{bullet}</span>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-lg font-medium text-charcoal" data-testid="text-initiative-closing">
            {closingLine}
          </p>
        </div>
      </div>
    </section>
  )
}
