import { Check } from 'lucide-react'

interface GovernanceBlockProps {
  title: string
  body: string
  bullets: string[]
}

export function GovernanceBlock({ title, body, bullets }: GovernanceBlockProps) {
  return (
    <section className="py-16 md:py-24 bg-aodi-green">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl" data-testid="text-governance-title">
            {title}
          </h2>
          <p className="mt-6 text-lg leading-8 text-white/80" data-testid="text-governance-body">
            {body}
          </p>
          <ul className="mt-8 flex flex-wrap justify-center gap-4">
            {bullets.map((bullet, index) => (
              <li key={index} className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                <Check className="h-4 w-4 text-aodi-gold flex-shrink-0" />
                <span className="text-sm text-white" data-testid={`text-governance-bullet-${index}`}>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
